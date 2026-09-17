import { createMemo, createSignal } from "solid-js";
import { createOwnerCleanup } from "./utils";

/**
 * Headless logic for FloatButton — the antd FloatButton / BackTop core.
 *
 * Two machines live here:
 *
 *  - createFloatButton: SCROLL-VISIBILITY. A float button in "BackTop mode"
 *    appears only once the page (or a target container) has scrolled past a
 *    visibility threshold (antd: 400px), hides again when scrolled back, and
 *    reports `isBackTop` so the UI renders the up-arrow glyph. Regular float
 *    buttons (no threshold configured) are always visible. The visibility
 *    gate is a thin, DI-able scroll listener — same shape as createAnchor's
 *    (getScrollContainer + rAF debounce) so the same test container works.
 *
 *  - createFloatButtonGroup: EXPAND/COLLAPSE. A group holds child float
 *    buttons collapsed behind a trigger; clicking the trigger fans them out
 *    toward the configured direction ('up' | 'down' | 'left' | 'right'),
 *    antd's FloatButtonGroup. Pure open-state bookkeeping — the fan-out
 *    geometry (row/column + gap) is a renderer concern.
 */
export type FloatButtonDirection = 'up' | 'down' | 'left' | 'right'

export type FloatButtonConfig = {
  /** Controlled visibility (wins over scroll-spy when present). */
  visible?: boolean
  /** Show only after this many scrolled px. undefined = always visible. */
  visibilityHeight?: number
  /** BackTop mode: renders the up glyph and scrolls to top on click. */
  backTop?: boolean
  /** Listen for scrolling on this container instead of the window. */
  getScrollContainer?: () => HTMLElement | Window | undefined
  onVisibleChange?: (visible: boolean) => void
  /** BackTop click: scrolling to top is injected so tests can observe it. */
  onClick?: (e?: Event) => void
  /** Scroll action for BackTop clicks (DI for tests). */
  scrollToTop?: (behavior?: ScrollBehavior) => void
  /** rAF DI (tests run scroll checks synchronously). */
  requestAnimationFrame?: (cb: () => void) => number
  cancelAnimationFrame?: (id: number) => void
}

export type FloatButtonIns = {
  /** Effective visibility (controlled wins; else scroll-spy). */
  visible: () => boolean
  /** True when BackTop mode is on (glyph + click-to-top). */
  isBackTop: () => boolean
  /** The click intent — BackTop scrolls, plain buttons only report. */
  handleClick: (e?: Event) => void
  /** Register the scroll container element (DI alt to getScrollContainer). */
  containerRef: (el: HTMLElement) => void
}

const getScrollTop = (container: HTMLElement | Window): number =>
  typeof (container as Window).scrollY === 'number'
    ? (container as Window).scrollY
    : (container as HTMLElement).scrollTop

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

  const [_shown, _setShown] = createSignal(alwaysVisible(), { ownedWrite: true })

  const visible = createMemo(() =>
    config.visible !== undefined ? config.visible : _shown(),
  )

  let _containerEl: HTMLElement | undefined
  let _rafId: number | undefined
  let _bound = false

  const resolveContainer = (): HTMLElement | Window =>
    config.getScrollContainer?.() ?? _containerEl ?? (globalThis as unknown as Window)

  const notify = (v: boolean) => {
    if (v === _shown()) return
    _setShown(v)
    config.onVisibleChange?.(v)
  }

  const handleScroll = () => {
    if (alwaysVisible()) return
    const threshold = config.visibilityHeight ?? 0
    if (_rafId !== undefined) caf(config)(_rafId)
    _rafId = raf(config)(() => {
      _rafId = undefined
      notify(getScrollTop(resolveContainer()) > threshold)
    })
  }

  const bind = () => {
    if (_bound || alwaysVisible()) return
    const container = resolveContainer()
    if (!container || typeof container.addEventListener !== 'function') return
    container.addEventListener('scroll', handleScroll, { passive: true })
    onOwnerCleanup(() => container.removeEventListener('scroll', handleScroll))
    _bound = true
    // Initial position may already be past the threshold.
    handleScroll()
  }

  const containerRef = (el: HTMLElement) => {
    _containerEl = el
    if (_bound) {
      // Already listening to the window; an explicit pane wins — rebind
      // (the owner cleanup of the earlier binding still removes the old
      // listener at teardown; here we stop listening immediately).
      const old = resolveContainer()
      old.removeEventListener('scroll', handleScroll)
      _bound = false
    }
    bind()
  }

  // Mount the scroll listener at creation (DI containers are ready then).
  bind()

  const scrollToTop = (behavior?: ScrollBehavior) => {
    const fn = config.scrollToTop
    if (fn) {
      fn(behavior)
      return
    }
    const container = resolveContainer()
    if (typeof (container as Window).scrollTo === 'function') {
      ;(container as Window).scrollTo({ top: 0, behavior: behavior ?? 'smooth' })
    } else {
      ;(container as HTMLElement).scrollTo({ top: 0, behavior: behavior ?? 'smooth' })
    }
  }

  const handleClick = (e?: Event) => {
    if (config.backTop) scrollToTop()
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
  /** Which way the fan opens from the trigger. Default 'up'. */
  direction?: FloatButtonDirection
  /** Start expanded instead of collapsed. */
  defaultOpen?: boolean
  /** Controlled expansion. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** BackTop mode on the trigger itself (antd group + BackTop combo). */
  backTop?: boolean
}

export type FloatButtonGroupIns = {
  open: () => boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  direction: () => FloatButtonDirection
  isBackTop: () => boolean
}

export const createFloatButtonGroup = (
  config: FloatButtonGroupConfig = {},
): FloatButtonGroupIns => {
  const [_open, _setOpen] = createSignal(config.defaultOpen ?? false, { ownedWrite: true })

  const open = createMemo(() => (config.open !== undefined ? config.open : _open()))

  const setOpen = (v: boolean) => {
    if (config.open !== undefined) {
      // Controlled: report only (the parent writes back through `open`).
      if (v === config.open) return
      config.onOpenChange?.(v)
      return
    }
    if (v === _open()) return
    _setOpen(v)
    config.onOpenChange?.(v)
  }

  return {
    open,
    setOpen,
    toggle: () => setOpen(!open()),
    direction: () => config.direction ?? 'up',
    isBackTop: () => !!config.backTop,
  }
}

export const floatButtonSplits: (keyof FloatButtonConfig)[] = [
  'visible', 'visibilityHeight', 'backTop',
]

export const floatButtonGroupSplits: (keyof FloatButtonGroupConfig)[] = [
  'direction', 'defaultOpen', 'open', 'backTop',
]
