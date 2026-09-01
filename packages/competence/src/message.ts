import { createSignal, createMemo } from "solid-js";

/**
 * Headless logic for Message — a GLOBAL SINGLETON notification queue.
 *
 * The design center of this module (vs. every other competence module):
 * there is exactly ONE message manager per page, shared by all callers.
 * Components never instantiate it — they consume the singleton through
 * `getMessageManager()`. That is what makes the imperative API possible:
 * `message.info('...')` from anywhere routes into the same queue that the
 * single `<MessageProvider />` (mounted once, high in the tree) renders.
 *
 * Owns:
 *  - the notification queue (insertion order = stacking order, top-aligned)
 *  - per-notification lifecycle: open → (optional update) → leave → remove
 *  - leave-animation sequencing (a close marks the item `closing`; the
 *    RENDERER removes it from the DOM when the animation ends via `remove`)
 *  - max-count trimming and manual/global close
 *
 * Deliberately does NOT own: DOM, portals, timers for auto-close (duration
 * is enforced by the renderer's timeout → `close`, so the headless layer
 * stays testable without fake clocks for the queue semantics).
 */

export type MessagePlacement = 'top' | 'bottom' | 'center'

export type MessageType = 'info' | 'success' | 'warning' | 'error' | 'loading'

export type MessageConfig = {
  content: unknown
  type?: MessageType
  /** ms before auto-close; 0 = never auto-close. Default handled by the renderer. */
  duration?: number
  /** Unique key: updating reuses the existing slot instead of stacking a new one. */
  key?: string | number
}

export type MessageItem = {
  key: string
  type: MessageType
  content: unknown
  /**
   * Auto-close delay in ms (0 = never). Stored per item so update() can
   * change it; the RENDERER owns the timer itself — the headless layer
   * never schedules anything.
   */
  duration?: number
  /** Monotonic per-item revision — bumped by `update`, read by the renderer to re-run the enter animation. */
  revision: number
  /** False once close() is called; the renderer plays the leave animation then calls remove(). */
  closing: boolean
}

export type MessageIns = {
  /** Snapshot of the queue in stacking order. */
  items: () => MessageItem[]
  /** Open (or update, when `key` matches) a notification. Returns its key. */
  open: (config: MessageConfig) => string
  /** Update content/type of an existing notification by key. No-op if absent. */
  update: (key: string, patch: Partial<Omit<MessageConfig, 'key'>>) => boolean
  /** Start the leave animation for one (or all, without a key) notifications. */
  close: (key?: string) => void
  /** Remove an item from the queue entirely — called by the renderer AFTER the leave animation ends (or immediately when no animation is wanted). */
  remove: (key: string) => void
  /** Where the stack anchors. Default 'top'. */
  placement: () => MessagePlacement
}

export type MessageManager = MessageIns & {
  /** Configuration applied to every notification opened through this manager. */
  configure: (defaults: { placement?: MessagePlacement; duration?: number; maxCount?: number }) => void
  /** Renderer-read defaults (duration/maxCount are enforced renderer-side). */
  defaults: () => { placement: MessagePlacement; duration: number; maxCount: number }
}

let _keySeed = 0
const nextKey = () => `msg_${++_keySeed}`

export const createMessageManager = (): MessageManager => {
  const [items, setItems] = createSignal<MessageItem[]>([], { ownedWrite: true })
  const [defaults, setDefaults] = createSignal(
    { placement: 'top' as MessagePlacement, duration: 3000, maxCount: 10 },
    { ownedWrite: true },
  )

  const itemsSnapshot = createMemo(() => items())
  const findByKey = (key: string) => items().find(i => i.key === key)

  /** Insert or update; trims overflow from the OLDEST end (front of queue). */
  const commit = (compute: (prev: MessageItem[]) => MessageItem[]) => {
    // Functional update: Solid 2 commits writes in batches, so reading
    // `items()` right after a previous setter still returns the OLD array —
    // two open() calls in one batch would drop the first entry. The
    // functional form receives the pending value and never loses updates.
    setItems(prev => {
      const next = compute(prev)
      const max = defaults().maxCount
      return max > 0 && next.length > max ? next.slice(next.length - max) : next
    })
  }

  const open = (config: MessageConfig): string => {
    const key = config.key !== undefined ? String(config.key) : nextKey()
    commit(prev => {
      const existing = prev.find(i => i.key === key)
      if (existing) {
        // Same key → in-place update (antd parity: no new stack entry).
        return prev.map(i => i.key === key
          ? { ...i, content: config.content, type: config.type ?? i.type, revision: i.revision + 1, closing: false }
          : i)
      }
      return [...prev, {
        key,
        type: config.type ?? 'info',
        content: config.content,
        duration: config.duration,
        revision: 0,
        closing: false,
      }]
    })
    return key
  }

  const update = (key: string, patch: Partial<Omit<MessageConfig, 'key'>>): boolean => {
    // Existence is checked against the pending queue inside compute — an
    // open() earlier in the same batch is visible there, so
    // open(); update(k) without an intervening flush still works.
    let found = false
    commit(prev => {
      if (!prev.some(i => i.key === key)) return prev
      found = true
      return prev.map(i => i.key === key
        ? {
            ...i,
            content: patch.content !== undefined ? patch.content : i.content,
            type: patch.type ?? i.type,
            duration: patch.duration ?? i.duration,
            revision: i.revision + 1,
            closing: false,
          }
        : i)
    })
    return found
  }

  const close = (key?: string) => {
    // Only the affected items get a new object; untouched entries keep their
    // reference so a keyed <For> in the renderer does NOT remount them (a
    // remount would skip the leave transition — the node mounts already in
    // its closing state).
    commit(prev => {
      if (key === undefined) {
        if (prev.every(i => i.closing)) return prev
        return prev.map(i => i.closing ? i : { ...i, closing: true })
      }
      return prev.map(i => i.key === key && !i.closing ? { ...i, closing: true } : i)
    })
  }

  const remove = (key: string) => {
    commit(prev => prev.filter(i => i.key !== key))
  }

  const configure = (patch: { placement?: MessagePlacement; duration?: number; maxCount?: number }) => {
    setDefaults(prev => ({ ...prev, ...patch }))
  }

  return {
    items: itemsSnapshot,
    open,
    update,
    close,
    remove,
    placement: () => defaults().placement,
    configure,
    defaults: () => defaults(),
  }
}

// ---- the singleton ---------------------------------------------------------
//
// Module-level: one manager per page, created lazily on first access. The
// module-scope owner problem (Solid 2 runs nothing here under a reactive
// owner) is sidestepped because signals created at module scope with
// `ownedWrite` write fine from anywhere — createMessageManager contains no
// effects or cleanups, so no owner is ever needed.

let _singleton: MessageManager | undefined

/** The page-wide message manager. Creates it on first call. */
export const getMessageManager = (): MessageManager => {
  if (!_singleton) _singleton = createMessageManager()
  return _singleton
}

/**
 * Convenience bound to the singleton — the imperative API surface.
 * `message.open({ content, type: 'success' })` from anywhere.
 */
export const message: MessageIns = {
  items: () => getMessageManager().items(),
  open: config => getMessageManager().open(config),
  update: (key, patch) => getMessageManager().update(key, patch),
  close: key => getMessageManager().close(key),
  remove: key => getMessageManager().remove(key),
  placement: () => getMessageManager().placement(),
}

export type MessageKey = string

export const messageSplits: (keyof MessageConfig)[] = ['content', 'type', 'duration', 'key']
