import { createSignal, createMemo } from "solid-js";

/**
 * Headless logic for Notification — a GLOBAL SINGLETON notification system
 * with rc-notification semantics (antd 6):
 *
 *  - ONE flat queue in open order; each notice carries its placement
 *    (topLeft/top/topRight/bottomLeft/bottom/bottomRight) and the renderer
 *    filters per corner. A same-key reopen REPLACES the config in place — a
 *    new placement therefore moves the notice.
 *  - maxCount trims the OLDEST notices of the whole queue (rc parity), not
 *    per placement. Default unlimited.
 *  - duration is in SECONDS (4.5 default; 0 / null / false = never), resolved
 *    at open time like rc's merged share-config.
 *  - onClose fires when ONE notice closes (countdown, × button, close(key));
 *    closing everything (destroy()) does NOT fire it.
 *  - stack: antd 6 collapses a corner into a card stack beyond `threshold`
 *    (default 3) live notices; `notificationStackLayout` is the pure layout
 *    math (rc NoticeList) so the renderer only measures and applies it.
 *
 * Contract with the renderer (same split as Message): the headless layer owns
 * the QUEUE and the close/remove sequencing (closing flag, removal after the
 * leave animation); the renderer owns timers, hover, measurement and the DOM.
 */

export type NotificationPlacement = 'topLeft' | 'top' | 'topRight' | 'bottomLeft' | 'bottom' | 'bottomRight'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

/** antd ArgsProps subset the queue models (presentation lives in `extra`). */
export type NotificationConfig = {
  /** Title line. */
  title?: unknown
  /** @deprecated Use `title`. */
  message?: unknown
  description?: unknown
  /** Custom icon node replacing the type icon. */
  icon?: unknown
  /** Action area (usually buttons) under the description. */
  actions?: unknown
  /** @deprecated Use `actions`. */
  btn?: unknown
  type?: NotificationType
  /** Seconds before auto-close; 0 / null / false = never. Default from manager (4.5). */
  duration?: number | null | false
  /** Show the countdown progress bar. Default from manager (false). */
  showProgress?: boolean
  /** Pause the countdown while hovered. Default from manager (true). */
  pauseOnHover?: boolean
  /** Unique key: reopening with the same key replaces the notice in place. */
  key?: string | number
  /** Default from manager (topRight). */
  placement?: NotificationPlacement
  /** Fires once when this notice closes (countdown, × or close(key)); not by close(). */
  onClose?: () => void
  /** Renderer-owned presentation bag. */
  extra?: unknown
}

export type NotificationItem = {
  key: string
  /** Undefined when opened without a type (no type icon). */
  type?: NotificationType
  title: unknown
  description: unknown
  icon: unknown
  actions: unknown
  /** Seconds; 0 = never. */
  duration: number
  showProgress: boolean
  pauseOnHover: boolean
  placement: NotificationPlacement
  onClose?: () => void
  extra?: unknown
  /** Monotonic revision — bumped by a same-key reopen / update; the renderer restarts its countdown on change. */
  revision: number
  /** True once closed; the renderer plays the leave animation then calls remove(). */
  closing: boolean
}

export type NotificationDefaults = {
  placement: NotificationPlacement
  /** Seconds; 0 = never. */
  duration: number
  showProgress: boolean
  pauseOnHover: boolean
  /** 0 = unlimited. */
  maxCount: number
  /** Distance of the top stacks from the viewport top, px. */
  top: number
  /** Distance of the bottom stacks from the viewport bottom, px. */
  bottom: number
  /** Collapse a corner into a card stack. */
  stack: boolean
  /** Live notices a corner shows expanded before collapsing. */
  threshold: number
}

export type NotificationIns = {
  /** Live queue of one placement, in open order. */
  items: (placement: NotificationPlacement) => NotificationItem[]
  /** The whole queue, in open order. */
  allItems: () => NotificationItem[]
  /** Open (or replace, when `key` matches) a notification. Returns its key. */
  open: (config: NotificationConfig) => string
  /** Merge a patch into an existing notification. False if absent. */
  update: (key: string, patch: Partial<Omit<NotificationConfig, 'key'>>) => boolean
  /** Start the leave animation of one notice (fires onClose) or of every notice (no onClose). */
  close: (key?: string) => void
  /** Remove from the queue — called by the renderer AFTER the leave animation. */
  remove: (key: string) => void
  /** Default placement for new notifications. */
  placement: () => NotificationPlacement
}

export type NotificationManager = NotificationIns & {
  configure: (defaults: Partial<Omit<NotificationDefaults, 'duration'>> & { duration?: number | null | false }) => void
  defaults: () => NotificationDefaults
}

export const NOTIFICATION_PLACEMENTS: NotificationPlacement[] = [
  'topLeft', 'top', 'topRight', 'bottomLeft', 'bottom', 'bottomRight',
]

export const NOTIFICATION_DEFAULTS: NotificationDefaults = {
  placement: 'topRight', duration: 4.5, showProgress: false, pauseOnHover: true, maxCount: 0,
  top: 24, bottom: 24, stack: true, threshold: 3,
}

/** 0 / null / false / negative → 0 (never auto-close). */
const toSeconds = (d: number | null | false | undefined, fallback: number) =>
  d === undefined ? fallback : typeof d === 'number' && d > 0 ? d : 0

let _keySeed = 0
const nextKey = () => `ntf_${++_keySeed}`

export const createNotificationManager = (): NotificationManager => {
  const [items, setItems] = createSignal<NotificationItem[]>([], { ownedWrite: true })
  const [defaults, setDefaults] = createSignal<NotificationDefaults>({ ...NOTIFICATION_DEFAULTS }, { ownedWrite: true })
  // Synchronous mirror: configure() then open() in one batch must agree, and
  // the committed signal lags until the flush.
  let current: NotificationDefaults = { ...NOTIFICATION_DEFAULTS }

  const snapshot = createMemo(() => items())

  // Functional updates only: Solid 2 batches writes, so reading items() after
  // a setter in the same batch returns the stale array.
  const commit = (compute: (prev: NotificationItem[]) => NotificationItem[]) => {
    setItems(prev => {
      const next = compute(prev)
      const max = current.maxCount
      return max > 0 && next.length > max ? next.slice(next.length - max) : next
    })
  }

  const build = (key: string, config: NotificationConfig): Omit<NotificationItem, 'revision' | 'closing'> => ({
    key,
    type: config.type,
    title: config.title ?? config.message,
    description: config.description,
    icon: config.icon,
    actions: config.actions ?? config.btn,
    duration: toSeconds(config.duration, current.duration),
    showProgress: config.showProgress ?? current.showProgress,
    pauseOnHover: config.pauseOnHover ?? current.pauseOnHover,
    placement: config.placement ?? current.placement,
    onClose: config.onClose,
    extra: config.extra,
  })

  const open = (config: NotificationConfig): string => {
    const key = config.key !== undefined && config.key !== null ? String(config.key) : nextKey()
    const base = build(key, config)
    commit(prev => {
      const index = prev.findIndex(i => i.key === key)
      // Same key → REPLACED in place (rc parity: keeps its queue position, the
      // previous onClose is dropped; a new placement moves it to that corner).
      if (index >= 0) return prev.map((i, n) => n === index ? { ...base, revision: i.revision + 1, closing: false } : i)
      return [...prev, { ...base, revision: 0, closing: false }]
    })
    return key
  }

  const update = (key: string, patch: Partial<Omit<NotificationConfig, 'key'>>): boolean => {
    // Existence is checked against the PENDING queue inside the updater, so
    // open(); update(k) in one batch works.
    let found = false
    commit(prev => prev.map(i => {
      if (i.key !== key) return i
      found = true
      const next: NotificationItem = { ...i, revision: i.revision + 1, closing: false }
      const title = patch.title ?? patch.message
      const actions = patch.actions ?? patch.btn
      if (title !== undefined) next.title = title
      if (actions !== undefined) next.actions = actions
      if (patch.description !== undefined) next.description = patch.description
      if (patch.icon !== undefined) next.icon = patch.icon
      if (patch.type !== undefined) next.type = patch.type
      if (patch.duration !== undefined) next.duration = toSeconds(patch.duration, current.duration)
      if (patch.showProgress !== undefined) next.showProgress = patch.showProgress
      if (patch.pauseOnHover !== undefined) next.pauseOnHover = patch.pauseOnHover
      if (patch.placement !== undefined) next.placement = patch.placement
      if (patch.onClose !== undefined) next.onClose = patch.onClose
      if (patch.extra !== undefined) next.extra = patch.extra
      return next
    }))
    return found
  }

  const close = (key?: string) => {
    // Untouched items keep their object reference (the keyed renderer must
    // not remount live notices).
    const closed: NotificationItem[] = []
    commit(prev => {
      if (key === undefined) return prev.every(i => i.closing) ? prev : prev.map(i => i.closing ? i : { ...i, closing: true })
      return prev.map(i => {
        if (i.key !== key || i.closing) return i
        closed.push(i)
        return { ...i, closing: true }
      })
    })
    // Outside the setter: callbacks may open new notices.
    for (const item of closed) item.onClose?.()
  }

  const remove = (key: string) => {
    commit(prev => prev.some(i => i.key === key) ? prev.filter(i => i.key !== key) : prev)
  }

  const configure: NotificationManager['configure'] = (patch) => {
    const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) as Partial<NotificationDefaults> & { duration?: number | null | false }
    if ('duration' in clean) clean.duration = toSeconds(clean.duration, current.duration)
    current = { ...current, ...(clean as Partial<NotificationDefaults>) }
    setDefaults({ ...current })
  }

  return {
    items: (placement) => snapshot().filter(i => i.placement === placement),
    allItems: snapshot,
    open,
    update,
    close,
    remove,
    placement: () => defaults().placement,
    configure,
    defaults: () => defaults(),
  }
}

// ---- stack layout (rc NoticeList) ------------------------------------------

export type NotificationStackBox = { height: number; width: number }

export type NotificationStackStyle = {
  transform: string
  /** Explicit wrapper height (index > 0 only). */
  height?: number
}

/**
 * Stack transforms for one corner. `boxes` are the measured notice sizes of
 * the LIVE notices ordered NEWEST FIRST (index 0 hugs the anchor edge).
 * Expanded: every older notice is pushed away from the edge by the heights of
 * the newer ones plus `gap`. Collapsed: older notices peek `offset` px behind
 * the newest, take its height and shrink horizontally by `offset` per side.
 */
export const notificationStackLayout = (
  placement: NotificationPlacement,
  boxes: NotificationStackBox[],
  expanded: boolean,
  offset = 8,
  gap = 16,
): NotificationStackStyle[] => {
  const tx = placement === 'top' || placement === 'bottom' ? '-50%' : '0'
  const sign = placement.startsWith('top') ? 1 : -1
  const latest = boxes[0]
  let pushed = 0
  return boxes.map((box, index) => {
    if (index === 0) {
      pushed += box.height + gap
      return { transform: `translate3d(${tx}, 0, 0)` }
    }
    const ty = (expanded ? pushed : index * offset) * sign
    pushed += box.height + gap
    const scaleX = !expanded && latest?.width && box.width ? (latest.width - offset * 2 * Math.min(index, 3)) / box.width : 1
    return { transform: `translate3d(${tx}, ${ty}px, 0) scaleX(${scaleX})`, height: expanded ? box.height : latest.height }
  })
}

// ---- the singleton ---------------------------------------------------------

let _singleton: NotificationManager | undefined

/** The page-wide notification manager. Creates it on first call. */
export const getNotificationManager = (): NotificationManager => {
  if (!_singleton) _singleton = createNotificationManager()
  return _singleton
}

/** Convenience bound to the singleton. */
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
  'title', 'message', 'description', 'icon', 'actions', 'btn', 'type', 'duration',
  'showProgress', 'pauseOnHover', 'key', 'placement', 'onClose', 'extra',
]
