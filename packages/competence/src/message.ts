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
 *  - onClose dispatch (rc-notification parity: fires when a keyed close or
 *    the countdown starts the leave; a keyless close-all does NOT fire it)
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
  /** Seconds before auto-close (antd parity); 0 / null = never. Undefined → manager default (3). */
  duration?: number | null
  /** Unique key: updating reuses the existing slot instead of stacking a new one. */
  key?: string | number
  /** Custom icon node (renderer-owned); undefined → the type icon. */
  icon?: unknown
  /** Fired once when the notice starts closing (countdown or keyed close). */
  onClose?: () => void
  /** Pause the countdown while hovered. Undefined → manager default (true). */
  pauseOnHover?: boolean
  /** Renderer-owned presentation bag (class / style / semantic classNames / onClick). */
  extra?: unknown
}

export type MessageItem = {
  key: string
  /** Undefined when opened without a type (antd: no icon, no type color). */
  type?: MessageType
  content: unknown
  /**
   * Auto-close delay in SECONDS (0 / null = never; undefined = manager
   * default). Stored per item so update() can change it; the RENDERER owns
   * the timer itself — the headless layer never schedules anything.
   */
  duration?: number | null
  icon?: unknown
  onClose?: () => void
  pauseOnHover?: boolean
  extra?: unknown
  /** Monotonic per-item revision — bumped by `update`, read by the renderer to restart the countdown. */
  revision: number
  /** False once close() is called; the renderer plays the leave animation then calls remove(). */
  closing: boolean
}

export type MessageDefaults = {
  placement: MessagePlacement
  /** Default auto-close delay, seconds. */
  duration: number
  /** 0 = unlimited. */
  maxCount: number
  /** Distance of the stack from the viewport edge, px (antd `top`). */
  top: number
  pauseOnHover: boolean
}

export type MessageIns = {
  /** Snapshot of the queue in stacking order. */
  items: () => MessageItem[]
  /** Open (or update, when `key` matches) a notification. Returns its key. */
  open: (config: MessageConfig) => string
  /** Update an existing notification by key. No-op if absent. */
  update: (key: string, patch: Partial<Omit<MessageConfig, 'key'>>) => boolean
  /**
   * Start the leave animation. With a key: that notice, firing its onClose.
   * Without a key: every notice, WITHOUT onClose (antd destroy() parity).
   */
  close: (key?: string) => void
  /** Remove an item from the queue entirely — called by the renderer AFTER the leave animation ends (or immediately when no animation is wanted). */
  remove: (key: string) => void
  /** Where the stack anchors. Default 'top'. */
  placement: () => MessagePlacement
}

export type MessageManager = MessageIns & {
  /** Configuration applied to every notification opened through this manager. */
  configure: (defaults: Partial<MessageDefaults>) => void
  /** Renderer-read defaults (duration/maxCount/top are enforced renderer-side). */
  defaults: () => MessageDefaults
}

export const MESSAGE_DEFAULTS: MessageDefaults = { placement: 'top', duration: 3, maxCount: 0, top: 8, pauseOnHover: true }

let _keySeed = 0
const nextKey = () => `msg_${++_keySeed}`

export const createMessageManager = (): MessageManager => {
  const [items, setItems] = createSignal<MessageItem[]>([], { ownedWrite: true })
  const [defaults, setDefaults] = createSignal<MessageDefaults>({ ...MESSAGE_DEFAULTS }, { ownedWrite: true })
  // Synchronous mirror of maxCount: configure() and open() in one batch must
  // agree, and the committed signal lags until the flush.
  let maxCount = MESSAGE_DEFAULTS.maxCount

  const itemsSnapshot = createMemo(() => items())

  /** Insert or update; trims overflow from the OLDEST end (front of queue). */
  const commit = (compute: (prev: MessageItem[]) => MessageItem[]) => {
    // Functional update: Solid 2 commits writes in batches, so reading
    // `items()` right after a previous setter still returns the OLD array —
    // two open() calls in one batch would drop the first entry. The
    // functional form receives the pending value and never loses updates.
    setItems(prev => {
      const next = compute(prev)
      return maxCount > 0 && next.length > maxCount ? next.slice(next.length - maxCount) : next
    })
  }

  const fields = (config: Partial<MessageConfig>) => {
    const out: Partial<MessageItem> = {}
    if (config.content !== undefined) out.content = config.content
    if (config.type !== undefined) out.type = config.type
    if (config.duration !== undefined) out.duration = config.duration
    if (config.icon !== undefined) out.icon = config.icon
    if (config.onClose !== undefined) out.onClose = config.onClose
    if (config.pauseOnHover !== undefined) out.pauseOnHover = config.pauseOnHover
    if (config.extra !== undefined) out.extra = config.extra
    return out
  }

  const open = (config: MessageConfig): string => {
    const key = config.key !== undefined && config.key !== null ? String(config.key) : nextKey()
    commit(prev => {
      const index = prev.findIndex(i => i.key === key)
      const base = { key, type: config.type, content: config.content, duration: config.duration, icon: config.icon, onClose: config.onClose, pauseOnHover: config.pauseOnHover, extra: config.extra }
      // Same key → the config is REPLACED in place (rc-notification parity:
      // no new stack entry, the previous onClose is dropped).
      if (index >= 0) return prev.map((i, n) => n === index ? { ...base, revision: i.revision + 1, closing: false } : i)
      return [...prev, { ...base, revision: 0, closing: false }]
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
      return prev.map(i => i.key === key ? { ...i, ...fields(patch), revision: i.revision + 1, closing: false } : i)
    })
    return found
  }

  const close = (key?: string) => {
    // Only the affected items get a new object; untouched entries keep their
    // reference so a keyed <For> in the renderer does NOT remount them (a
    // remount would skip the leave transition — the node mounts already in
    // its closing state).
    const closed: MessageItem[] = []
    commit(prev => {
      if (key === undefined) {
        if (prev.every(i => i.closing)) return prev
        return prev.map(i => i.closing ? i : { ...i, closing: true })
      }
      return prev.map(i => {
        if (i.key !== key || i.closing) return i
        closed.push(i)
        return { ...i, closing: true }
      })
    })
    // Outside the setter: user callbacks may open new notices.
    for (const item of closed) item.onClose?.()
  }

  const remove = (key: string) => {
    commit(prev => prev.filter(i => i.key !== key))
  }

  const configure = (patch: Partial<MessageDefaults>) => {
    const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) as Partial<MessageDefaults>
    if (clean.maxCount !== undefined) maxCount = clean.maxCount
    setDefaults(prev => ({ ...prev, ...clean }))
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

export const messageSplits: (keyof MessageConfig)[] = ['content', 'type', 'duration', 'key', 'icon', 'onClose', 'pauseOnHover', 'extra']
