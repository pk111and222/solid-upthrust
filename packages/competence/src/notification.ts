import { createSignal, createMemo } from "solid-js";

/**
 * Headless logic for Notification — a GLOBAL SINGLETON notification system,
 * mirroring the rc-notification / antd semantics that Message deliberately
 * simplified away:
 *
 *  - SIX per-placement queues (topLeft/top/topRight/bottomLeft/bottom/
 *    bottomRight). A notification remembers the placement it was opened
 *    with; switching the manager default only affects FUTURE opens.
 *  - duration is per-item and measured in SECONDS (antd parity: 4.5s
 *    default, 0/null = never auto-close).
 *  - pauseOnHover: the countdown pauses while the pointer rests on the
 *    notice. The headless layer tracks the elapsed budget and reports
 *    `progress()` (0..1) so the renderer can drive a progress bar without
 *    owning any timing state of its own.
 *
 * Design contract with the renderer (same split as Message): the headless
 * layer owns the QUEUE and the CLOSE/REMOVE sequencing (closing flag +
 * removal after the leave animation); the renderer owns timers, hover
 * tracking and every DOM concern.
 */

export type NotificationPlacement = 'topLeft' | 'top' | 'topRight' | 'bottomLeft' | 'bottom' | 'bottomRight'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

/** antd ArgsProps subset (message/description/btn/icon + behaviour flags). */
export type NotificationConfig = {
  /** Title line. */
  message: unknown
  /** Optional body under the title. */
  description?: unknown
  /** Optional custom icon node replacing the type icon. */
  icon?: unknown
  /** Optional action area (usually buttons) floated to the right. */
  btn?: unknown
  type?: NotificationType
  /** Seconds before auto-close; 0/null = never. Default from manager (4.5s). */
  duration?: number | null
  /** Show the countdown progress bar. Default from manager. */
  showProgress?: boolean
  /** Pause the countdown while hovered. Default from manager (true). */
  pauseOnHover?: boolean
  /** Unique key: reopening with the same key updates in place. */
  key?: string | number
  /** Which corner stack this notification joins. Default from manager (topRight). */
  placement?: NotificationPlacement
  /** Fires when the notice is closed (by timer, X, or destroy). */
  onClose?: () => void
}

export type NotificationItem = {
  key: string
  type: NotificationType
  message: unknown
  description: unknown
  icon: unknown
  btn: unknown
  /** Seconds; 0 = never. Stored per item so update() can change it. */
  duration: number | null
  showProgress: boolean
  pauseOnHover: boolean
  placement: NotificationPlacement
  onClose?: () => void
  /** Monotonic revision — bumped by update; the renderer restarts timers/enter on change. */
  revision: number
  /** False once close() marks the notice; the renderer plays leave then calls remove(). */
  closing: boolean
}

export type NotificationIns = {
  /** Snapshot of one placement's queue in stacking order. */
  items: (placement: NotificationPlacement) => NotificationItem[]
  /** Flat snapshot across placements (renderers iterate placements). */
  allItems: () => NotificationItem[]
  /** Open (or update, when `key` matches) a notification. Returns its key. */
  open: (config: NotificationConfig) => string
  /** Update an existing notification by key. No-op if absent. */
  update: (key: string, patch: Partial<Omit<NotificationConfig, 'key'>>) => boolean
  /** Start the leave animation for one (or all, without a key) notifications. */
  close: (key?: string) => void
  /** Remove from the queue — called by the renderer AFTER the leave animation. */
  remove: (key: string) => void
  /** Default placement for new notifications. */
  placement: () => NotificationPlacement
}

export type NotificationManager = NotificationIns & {
  configure: (defaults: {
    placement?: NotificationPlacement
    duration?: number | null
    showProgress?: boolean
    pauseOnHover?: boolean
    maxCount?: number
  }) => void
  defaults: () => {
    placement: NotificationPlacement
    duration: number | null
    showProgress: boolean
    pauseOnHover: boolean
    maxCount: number
  }
}

export const NOTIFICATION_PLACEMENTS: NotificationPlacement[] = [
  'topLeft', 'top', 'topRight', 'bottomLeft', 'bottom', 'bottomRight',
]

let _keySeed = 0
const nextKey = () => `ntf_${++_keySeed}`

const emptyQueues = (): Record<NotificationPlacement, NotificationItem[]> => ({
  topLeft: [], top: [], topRight: [], bottomLeft: [], bottom: [], bottomRight: [],
})

export const createNotificationManager = (): NotificationManager => {
  const [items, setItems] = createSignal<Record<NotificationPlacement, NotificationItem[]>>(emptyQueues(), { ownedWrite: true })
  const [defaults, setDefaults] = createSignal(
    { placement: 'topRight' as NotificationPlacement, duration: 4.5 as number | null, showProgress: false, pauseOnHover: true, maxCount: 3 },
    { ownedWrite: true },
  )

  const allItemsSnapshot = createMemo(() => NOTIFICATION_PLACEMENTS.flatMap(p => items()[p]))

  /**
   * PENDING-state lookup. Reading `items()` after a setter in the same batch
   * returns the OLD record (Solid 2 commits writes in batches), so existence
   * checks for open/update/close must resolve against the queue value the
   * NEXT setItems call will actually receive — the signal's own pending
   * value, not the memo. Falls back to the committed read when nothing is
   * pending (the common case outside tests).
   */
  const pendingOrCommitted = (): Record<NotificationPlacement, NotificationItem[]> => {
    // setItems' functional updater receives the pending record; emulate that
    // by reading through a no-op functional write (Solid evaluates the
    // updater eagerly against the pending value and discards an identical
    // return without notifying subscribers).
    let snapshot: Record<NotificationPlacement, NotificationItem[]> | undefined
    setItems(prev => { snapshot = prev; return prev })
    return snapshot ?? items()
  }

  const findByKey = (key: string) =>
    NOTIFICATION_PLACEMENTS.flatMap(p => pendingOrCommitted()[p]).find(i => i.key === key)

  /**
   * Mutate one placement's queue. Functional form: Solid 2 batches writes, so
   * consecutive opens in one batch must each see the pending state. Max-count
   * trims the OLDEST end (front) per placement, matching rc-notification.
   */
  const commit = (placement: NotificationPlacement, compute: (prev: NotificationItem[]) => NotificationItem[]) => {
    setItems(prev => {
      const next = compute(prev[placement])
      const max = defaults().maxCount
      const trimmed = max > 0 && next.length > max ? next.slice(next.length - max) : next
      // Spread-clone only when this queue actually changed: untouched
      // placements keep their array reference so memos keyed on a single
      // queue do not re-evaluate.
      if (trimmed === prev[placement]) return prev
      return { ...prev, [placement]: trimmed }
    })
  }

  const open = (config: NotificationConfig): string => {
    const key = config.key !== undefined ? String(config.key) : nextKey()
    const d = defaults()
    const placement = config.placement ?? d.placement
    // rc-notification keeps ONE flat list and re-filters placements per render,
    // so a same-key reopen with a different placement silently MOVES the notice.
    // Our per-placement queues express that as remove-from-old + insert-to-new.
    const existing = findByKey(key)
    // A same-key reopen on a DIFFERENT placement MOVES the notice: drop it
    // from the old queue first, then treat the insert below as fresh.
    const moving = !!existing && existing.placement !== placement
    if (moving) {
      commit(existing.placement, prev => prev.filter(i => i.key !== key))
    }
    commit(placement, prev => {
      if (existing && !moving) {
        // Same key, same placement → in-place update (antd parity: no new entry).
        return prev.map(i => i.key === key
          ? {
              ...i,
              message: config.message ?? i.message,
              description: config.description !== undefined ? config.description : i.description,
              icon: config.icon !== undefined ? config.icon : i.icon,
              btn: config.btn !== undefined ? config.btn : i.btn,
              type: config.type ?? i.type,
              duration: config.duration !== undefined ? config.duration : i.duration,
              showProgress: config.showProgress ?? i.showProgress,
              pauseOnHover: config.pauseOnHover ?? i.pauseOnHover,
              onClose: config.onClose ?? i.onClose,
              placement,
              revision: i.revision + 1,
              closing: false,
            }
          : i)
      }
      return [...prev, {
        key,
        type: config.type ?? 'info',
        message: config.message,
        description: config.description,
        icon: config.icon,
        btn: config.btn,
        duration: config.duration !== undefined ? config.duration : d.duration,
        showProgress: config.showProgress ?? d.showProgress,
        pauseOnHover: config.pauseOnHover ?? d.pauseOnHover,
        placement,
        onClose: config.onClose,
        revision: 0,
        closing: false,
      }]
    })
    return key
  }

  const update = (key: string, patch: Partial<Omit<NotificationConfig, 'key'>>): boolean => {
    const existing = findByKey(key)
    if (!existing) return false
    // Route through open()'s in-place update branch (same key, merged patch);
    // keep the existing placement unless the patch asks to move it.
    open({ ...patch, key, message: patch.message ?? existing.message, placement: patch.placement ?? existing.placement })
    return true
  }

  const close = (key?: string) => {
    // Mark-closing only; the renderer calls remove() after the leave
    // animation. Untouched items keep their object references (keyed <For>
    // in the renderer must not remount live notices).
    if (key === undefined) {
      for (const p of NOTIFICATION_PLACEMENTS) {
        commit(p, prev => prev.every(i => i.closing) ? prev : prev.map(i => i.closing ? i : { ...i, closing: true }))
      }
      return
    }
    const existing = findByKey(key)
    if (existing && !existing.closing) {
      commit(existing.placement, prev => prev.map(i => i.key === key ? { ...i, closing: true } : i))
    }
  }

  const remove = (key: string) => {
    const existing = findByKey(key)
    if (!existing) return
    commit(existing.placement, prev => prev.filter(i => i.key !== key))
    // antd fires onClose for every close path (timer, X click, destroy).
    existing.onClose?.()
  }

  const configure = (patch: {
    placement?: NotificationPlacement
    duration?: number | null
    showProgress?: boolean
    pauseOnHover?: boolean
    maxCount?: number
  }) => {
    setDefaults(prev => ({ ...prev, ...patch }))
  }

  return {
    items: (placement: NotificationPlacement) => items()[placement] ?? [],
    allItems: allItemsSnapshot,
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
// Same pattern as Message: one manager per page, created lazily. Signals at
// module scope with `ownedWrite` write fine from anywhere; the manager itself
// contains no effects or cleanups, so no reactive owner is ever needed.

let _singleton: NotificationManager | undefined

/** The page-wide notification manager. Creates it on first call. */
export const getNotificationManager = (): NotificationManager => {
  if (!_singleton) _singleton = createNotificationManager()
  return _singleton
}

/**
 * Convenience bound to the singleton — the imperative API surface.
 * `notification.open({ message, type: 'success' })` from anywhere.
 */
export const notification: NotificationIns = {
  items: placement => getNotificationManager().items(placement),
  allItems: () => getNotificationManager().allItems(),
  open: config => getNotificationManager().open(config),
  update: (key, patch) => getNotificationManager().update(key, patch),
  close: key => getNotificationManager().close(key),
  remove: key => getNotificationManager().remove(key),
  placement: () => getNotificationManager().placement(),
}

export type NotificationKey = string

export const notificationSplits: (keyof NotificationConfig)[] = [
  'message', 'description', 'icon', 'btn', 'type', 'duration',
  'showProgress', 'pauseOnHover', 'key', 'placement', 'onClose',
]
