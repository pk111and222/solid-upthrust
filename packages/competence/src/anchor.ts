import { createMemo, createEffect, createSignal } from "solid-js";
import { createOwnerCleanup } from "./utils";

export type AnchorItem = {
  key: string
  href: string
  title: string
  children?: AnchorItem[]
  target?: string
}

export type AnchorConfig = {
  items: AnchorItem[]
  /** Extra distance (px) from viewport top when positioning the active section. */
  targetOffset?: number
  onChange?: (activeKey: string) => void
  /** Controlled override: when provided its return value wins over scroll-spy. */
  getCurrentAnchor?: () => string
  /** px of slack used when deciding whether a section counts as "reached". */
  bounds?: number
  /** Dependency injection for tests / non-browser environments. */
  getScrollContainer?: () => HTMLElement | Window | undefined
  requestAnimationFrame?: (cb: () => void) => number
  cancelAnimationFrame?: (id: number) => void
}

export type AnchorIns = {
  activeKey: () => string
  scrollTo: (key: string) => void
}

/** Resolved scroll container: a Window or a scrollable element (fallback documentElement). */
export type AnchorScrollContainer = Window | HTMLElement

const docElement = () => document.documentElement

const isWindow = (c: AnchorScrollContainer): c is Window =>
  typeof (c as Window).scrollY === 'number'

/** Viewport-relative helpers that work for both window and inner-container scrolling. */
export const getScrollTop = (container: AnchorScrollContainer): number =>
  isWindow(container) ? container.scrollY : container.scrollTop

export const getScrollContainerTop = (container: AnchorScrollContainer): number =>
  isWindow(container) ? 0 : container.getBoundingClientRect().top

const raf = (config: AnchorConfig) =>
  config.requestAnimationFrame ??
  (typeof globalThis.requestAnimationFrame === 'function'
    ? globalThis.requestAnimationFrame.bind(globalThis)
    : (cb: () => void) => { cb(); return 0 })

const caf = (config: AnchorConfig) =>
  config.cancelAnimationFrame ??
  (typeof globalThis.cancelAnimationFrame === 'function'
    ? globalThis.cancelAnimationFrame.bind(globalThis)
    : () => {})

export const createAnchor = (config: AnchorConfig) => {
  const onOwnerCleanup = createOwnerCleanup()
  // ownedWrite: setActive fires from scroll/resize event handlers and from
  // inside the rAF callback — imperative contexts, not template computations.
  const [_activeKey, _setActiveKey] = createSignal('', { ownedWrite: true })
  let _containerEl: HTMLElement | undefined
  let _rafId: number | undefined
  // True while a click-initiated smooth scroll is in flight; scroll-spy
  // ignores events until it settles so intermediate sections don't flash.
  let _clickScrolling = false

  const activeKey = createMemo(() => {
    if (config.getCurrentAnchor) return config.getCurrentAnchor()
    return _activeKey()
  })

  const flatItems = createMemo(() => {
    const result: AnchorItem[] = []
    const walk = (items: AnchorItem[]) => {
      for (const item of items) {
        result.push(item)
        if (item.children) walk(item.children)
      }
    }
    walk(config.items)
    return result
  })

  const resolveContainer = (): AnchorScrollContainer => {
    if (config.getScrollContainer) {
      const c = config.getScrollContainer()
      if (c) return c
    }
    return _containerEl || docElement()
  }

  const setActive = (key: string) => {
    if (key === _activeKey()) return
    _setActiveKey(key)
    config.onChange?.(key)
  }

  /**
   * Scroll-spy core: pick the LAST section (in flat document order, not by
   * geometry) whose top edge is at or above the activation line. Document
   * order matters — anchors are rendered in document order and the last
   * matching item in that order is the one the user is looking at; picking by
   * largest top would highlight a lower section while its parent is still on
   * screen. Keeping every match (not only newly-crossed ones) means scrolling
   * back up re-activates the earlier section — the previous implementation
   * only ever fired while scrolling downward.
   */
  const computeCurrentKey = (): string => {
    const offset = config.targetOffset ?? 0
    const bounds = config.bounds ?? 5
    const container = resolveContainer()
    const scrollTop = getScrollTop(container)
    const containerTop = getScrollContainerTop(container)
    const line = scrollTop + offset + bounds

    let currentKey = ''
    for (const item of flatItems()) {
      const el = document.getElementById(item.href.replace(/^#/, ''))
      if (!el) continue
      const top = el.getBoundingClientRect().top + scrollTop - containerTop
      if (top <= line) {
        currentKey = item.key
      }
    }
    return currentKey
  }

  const handleScroll = () => {
    if (_clickScrolling) return
    if (_rafId !== undefined) caf(config)(_rafId)
    _rafId = raf(config)(() => {
      _rafId = undefined
      setActive(computeCurrentKey())
    })
  }

  const scrollTo = (key: string) => {
    const item = flatItems().find(i => i.key === key)
    if (!item) return
    const el = document.getElementById(item.href.replace(/^#/, ''))
    if (!el) return
    const offset = config.targetOffset ?? 0
    const container = resolveContainer()
    const containerTop = getScrollContainerTop(container)
    // offsetTop is relative to the offsetParent, so for inner containers use
    // the element's distance to the container's content box instead.
    const targetTop = isWindow(container)
      ? el.getBoundingClientRect().top + window.scrollY - offset
      : el.getBoundingClientRect().top - containerTop + container.scrollTop - offset
    container.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' })
    // Suppress the scroll events fired while smooth-scrolling towards the
    // target: sections passed along the way would flip the active key back.
    _clickScrolling = true
    setActive(key)
    // One rAF tick after the last scroll event of the animation is enough in
    // practice; a longer animation simply extends the suppression window.
    raf(config)(() => { _clickScrolling = false })
  }

  const containerRef = (el: HTMLElement) => {
    _containerEl = el
  }

  // Bind scroll listeners after render (containerRef attached) and rebind
  // whenever the item set changes so scroll-spy tracks fresh targets.
  createEffect(
    () => flatItems(),
    () => {
      const container = resolveContainer()
      container.addEventListener('scroll', handleScroll, { passive: true })
      // Initial position may already be mid-page (e.g. deep link).
      handleScroll()
      return () => container.removeEventListener('scroll', handleScroll)
    }
  )

  onOwnerCleanup(() => {
    if (_rafId !== undefined) caf(config)(_rafId)
  })

  const refs: AnchorIns = {
    activeKey,
    scrollTo,
  }

  return {
    activeKey,
    scrollTo,
    containerRef,
    refs,
  }
}

export const anchorSplits: (keyof AnchorConfig)[] = [
  'items',
  'targetOffset',
  'onChange',
  'getCurrentAnchor',
  'bounds',
  'getScrollContainer',
  'requestAnimationFrame',
  'cancelAnimationFrame',
]
