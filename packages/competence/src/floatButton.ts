import { createMemo, createSignal, untrack } from "solid-js";
import { createOwnerCleanup } from "./utils";

/**
 * Headless logic for FloatButton — the antd 6 FloatButton / BackTop / Group core.
 *
 *  - createFloatButton: BackTop SCROLL-VISIBILITY + scroll-to-top intent.
 *    antd semantics: visible once `scrollTop >= visibilityHeight` (default
 *    400 for BackTop; 0 means visible from the start); the scroll target is
 *    DI-able (window / Document / element); clicking animates the container
 *    back to 0 over `duration` ms with easeInOutCubic (antd `_util/scrollTo`).
 *    Without a threshold the button is always visible (plain FloatButton).
 *
 *  - createFloatButtonGroup: MENU-MODE open state. With `trigger` 'click' the
 *    trigger button toggles and an outside click closes; with 'hover' the
 *    group's mouseenter / mouseleave open / close. Without a trigger the group
 *    is a static stack (menuMode false, open ignored). Controlled `open` wins;
 *    `onOpenChange` reports every intended change (antd useControlledState).
 */
export type FloatButtonGroupPlacement = 'top' | 'left' | 'right' | 'bottom'
export type FloatButtonGroupTrigger = 'click' | 'hover'
/** @deprecated 0.x direction naming; use FloatButtonGroupPlacement. */
export type FloatButtonDirection = 'up' | 'down' | 'left' | 'right'

type ScrollTarget = HTMLElement | Window | Document

export type FloatButtonConfig = {
  /** Controlled visibility (wins over scroll-spy when present). */
  visible?: boolean
  /** Show once scrollTop >= this many px. undefined = always visible. */
  visibilityHeight?: number
  /** BackTop mode: click scrolls the target to top. */
  backTop?: boolean
  /** Scroll target (antd `target`). Default window. */
  getScrollContainer?: () => ScrollTarget | undefined | null
  onVisibleChange?: (visible: boolean) => void
  onClick?: (e?: Event) => void
  /** Scroll-to-top animation duration in ms. Default 450. */
  duration?: number
  /** Scroll action override for BackTop clicks (DI for tests). */
  scrollToTop?: (duration: number) => void
  /** rAF / clock DI (tests drive frames synchronously). */
  requestAnimationFrame?: (cb: () => void) => number
  cancelAnimationFrame?: (id: number) => void
  now?: () => number
}

export type FloatButtonIns = {
  /** Effective visibility (controlled wins; else scroll-spy). */
  visible: () => boolean
  /** True when BackTop mode is on. */
  isBackTop: () => boolean
  /** Click intent — BackTop scrolls to top, then reports onClick. */
  handleClick: (e?: Event) => void
  /** Register an element scroll container (alternative to getScrollContainer). */
  containerRef: (el: HTMLElement) => void
}

const isWindow = (t: unknown): t is Window => !!t && (t as Window).window === t
const isDocument = (t: unknown): t is Document => typeof Document !== 'undefined' && t instanceof Document

/** antd getScroll: window → pageYOffset, Document → documentElement.scrollTop, element → scrollTop. */
export const getFloatScrollTop = (target: ScrollTarget | { scrollY?: number; scrollTop?: number }): number => {
  if (isWindow(target)) return target.pageYOffset ?? target.scrollY ?? 0
  if (isDocument(target)) return target.documentElement.scrollTop
  const t = target as { scrollY?: number; scrollTop?: number }
  return typeof t.scrollTop === 'number' ? t.scrollTop : typeof t.scrollY === 'number' ? t.scrollY : 0
}

const setScrollTop = (target: ScrollTarget, top: number) => {
  if (isWindow(target)) target.scrollTo(target.pageXOffset ?? 0, top)
  else if (isDocument(target)) target.documentElement.scrollTop = top
  else (target as HTMLElement).scrollTop = top
}

/** antd easeInOutCubic(t, b, c, d): from b to c over d. */
export const easeInOutCubic = (t: number, b: number, c: number, d: number): number => {
  const cc = c - b
  let x = t / (d / 2)
  if (x < 1) return (cc / 2) * x * x * x + b
  x -= 2
  return (cc / 2) * (x * x * x + 2) + b
}

const raf = (config: FloatButtonConfig) =>
  config.requestAnimationFrame ??
  (typeof globalThis.requestAnimationFrame === 'function'
    ? globalThis.requestAnimationFrame.bind(globalThis)
    : (cb: () => void) => { cb(); return 0 })

const caf = (config: FloatButtonConfig) =>
  config.cancelAnimationFrame ??
  (typeof globalThis.cancelAnimationFrame === 'function'
    ? globalThis.cancelAnimationFrame.bind(globalThis)
    : () => {})

export const createFloatButton = (config: FloatButtonConfig = {}): FloatButtonIns => {
  const onOwnerCleanup = createOwnerCleanup()
  const alwaysVisible = () => config.visibilityHeight === undefined

  const initial = untrack(() => alwaysVisible() || config.visibilityHeight === 0)
  const [_shown, _setShown] = createSignal(initial, { ownedWrite: true })
  // Synchronous mirror: Solid 2 batches writes, notify must compare against the latest value.
  let shownNow = initial

  const visible = createMemo(() => (config.visible !== undefined ? config.visible : _shown()))

  let _containerEl: HTMLElement | undefined
  let _bound: ScrollTarget | undefined
  let _rafId: number | undefined
  let _scrollRaf: number | undefined

  const resolveContainer = (): ScrollTarget =>
    config.getScrollContainer?.() ?? _containerEl ?? (globalThis as unknown as Window)

  const notify = (v: boolean) => {
    if (v === shownNow) return
    shownNow = v
    _setShown(v)
    config.onVisibleChange?.(v)
  }

  const handleScroll = () => {
    if (alwaysVisible()) return
    if (_rafId !== undefined) caf(config)(_rafId)
    _rafId = raf(config)(() => {
      _rafId = undefined
      notify(getFloatScrollTop(resolveContainer()) >= (config.visibilityHeight ?? 0))
    })
  }

  const unbind = () => {
    _bound?.removeEventListener('scroll', handleScroll)
    _bound = undefined
  }

  const bind = () => {
    if (alwaysVisible()) return
    const container = resolveContainer()
    if (!container || typeof container.addEventListener !== 'function' || container === _bound) return
    unbind()
    container.addEventListener('scroll', handleScroll, { passive: true })
    _bound = container
    // The initial position may already be past the threshold.
    handleScroll()
  }

  onOwnerCleanup(() => {
    unbind()
    if (_rafId !== undefined) caf(config)(_rafId)
    if (_scrollRaf !== undefined) caf(config)(_scrollRaf)
  })

  const containerRef = (el: HTMLElement) => {
    _containerEl = el
    bind()
  }

  bind()

  /** antd `_util/scrollTo(0, { getContainer, duration })`. */
  const animateToTop = (duration: number) => {
    const container = resolveContainer()
    const from = getFloatScrollTop(container)
    const now = config.now ?? (() => Date.now())
    const start = now()
    if (_scrollRaf !== undefined) caf(config)(_scrollRaf)
    const frame = () => {
      const time = now() - start
      setScrollTop(container, easeInOutCubic(time > duration ? duration : time, from, 0, duration))
      _scrollRaf = time < duration ? raf(config)(frame) : undefined
    }
    _scrollRaf = raf(config)(frame)
  }

  const handleClick = (e?: Event) => {
    if (config.backTop) (config.scrollToTop ?? animateToTop)(config.duration ?? 450)
    config.onClick?.(e)
  }

  return {
    visible,
    isBackTop: () => !!config.backTop,
    handleClick,
    containerRef,
  }
}

// ---------------------------------------------------------------------------
// Group
// ---------------------------------------------------------------------------

export type FloatButtonGroupConfig = {
  /** Menu-mode trigger. Without it the group is a static stack. */
  trigger?: FloatButtonGroupTrigger
  /** Start expanded (uncontrolled). */
  defaultOpen?: boolean
  /** Controlled expansion. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export type FloatButtonGroupIns = {
  open: () => boolean
  /** antd triggerOpen: writes the internal state and reports when it differs. */
  setOpen: (open: boolean) => void
  toggle: () => void
  /** trigger is 'click' or 'hover'. */
  menuMode: () => boolean
  /** Trigger-button click (click mode toggles). */
  onTriggerClick: () => void
  /** Group mouseenter / mouseleave (hover mode opens / closes). */
  onMouseEnter: () => void
  onMouseLeave: () => void
  /** Document click outside the group (click mode closes). */
  onOutsideClick: () => void
}

export const createFloatButtonGroup = (config: FloatButtonGroupConfig = {}): FloatButtonGroupIns => {
  const initialOpen = untrack(() => config.defaultOpen ?? false)
  const [_open, _setOpen] = createSignal(initialOpen, { ownedWrite: true })
  let openNow = initialOpen

  const open = createMemo(() => (config.open !== undefined ? config.open : _open()))
  const current = () => (config.open !== undefined ? config.open : openNow)

  const setOpen = (v: boolean) => {
    if (current() === v) return
    openNow = v
    _setOpen(v)
    config.onOpenChange?.(v)
  }

  return {
    open,
    setOpen,
    toggle: () => setOpen(!current()),
    menuMode: () => config.trigger === 'click' || config.trigger === 'hover',
    onTriggerClick: () => { if (config.trigger === 'click') setOpen(!current()) },
    onMouseEnter: () => { if (config.trigger === 'hover') setOpen(true) },
    onMouseLeave: () => { if (config.trigger === 'hover') setOpen(false) },
    onOutsideClick: () => { if (config.trigger === 'click') setOpen(false) },
  }
}

/** Legacy `direction` → antd 6 `placement` (up→top, down→bottom). */
export const floatButtonGroupPlacement = (
  placement?: string,
  direction?: FloatButtonDirection,
): FloatButtonGroupPlacement => {
  if (placement === 'top' || placement === 'left' || placement === 'right' || placement === 'bottom') return placement
  if (direction === 'down') return 'bottom'
  if (direction === 'left' || direction === 'right') return direction
  return 'top'
}

export const floatButtonSplits: (keyof FloatButtonConfig)[] = [
  'visible', 'visibilityHeight', 'backTop', 'duration',
]

export const floatButtonGroupSplits: (keyof FloatButtonGroupConfig)[] = [
  'trigger', 'defaultOpen', 'open', 'onOpenChange',
]
