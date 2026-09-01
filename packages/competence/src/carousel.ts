import { createMemo, createSignal } from "solid-js";

/**
 * Headless logic for Carousel — the slide-index state machine behind the
 * antd/react-slick behaviour subset this library needs:
 *
 *  - index state (controlled `current` prop wins over the internal signal)
 *  - next/prev/goTo with wrap-around (infinite) or clamped (finite) ends
 *  - DIRECTION inference for every transition: the renderer animates the
 *    track differently for forward vs backward moves, and a wrap from the
 *    last slide back to the first must still read as "forward"
 *  - autoplay: a play/pause gate (hover + focus pause it, antd semantics)
 *    and the slide-count guard — autoplay with a single slide never fires
 *
 * Deliberately renderer-owned: the interval/timer itself, the track DOM and
 * any swipe handling. This layer only decides WHICH index is current, WHICH
 * direction the move went, and WHETHER autoplay may run — all pure signal
 * state, fully testable with fake clocks.
 */

export type CarouselDirection = 'forward' | 'backward'

export type CarouselConfig = {
  /** Controlled current index. */
  current?: number
  defaultCurrent?: number
  /** Total number of slides. */
  count: number
  /** Wrap around at the ends. Default true (react-slick infinite). */
  infinite?: boolean
  /** Autoplay enabled. Default false. */
  autoplay?: boolean
  /** ms between autoplay advances. Default 3000 (antd). */
  autoplaySpeed?: number
  /** Pauses autoplay while hovered/focused. Default true (antd). */
  pauseOnHover?: boolean
  beforeChange?: (from: number, to: number) => void
  afterChange?: (current: number) => void
}

export type CarouselIns = {
  /** Current slide index (controlled value wins). */
  current: () => number
  /** Direction of the LAST transition — drives the track animation. */
  direction: () => CarouselDirection
  /** Advance one slide. No-op at the end when not infinite. */
  next: () => void
  /** Go back one slide. No-op at the start when not infinite. */
  prev: () => void
  /** Jump to an index (clamped). `animate: false` skips the motion. */
  goTo: (index: number, animate?: boolean) => void
  /** Whether the transition to `current` should animate. */
  animate: () => boolean
  /** True when autoplay may run (enabled, unpaused, >1 slide). */
  autoplayActive: () => boolean
  /** Autoplay gate — renderer calls these on hover/focus in and out. */
  pause: () => void
  resume: () => void
  /** Whether prev/next are possible (always true when infinite). */
  canPrev: () => boolean
  canNext: () => boolean
}

export const createCarousel = (config: CarouselConfig): CarouselIns => {
  // ownedWrite: next/prev/goTo/pause fire from event handlers and timers —
  // imperative entry points outside any reactive owner.
  const [_current, _setCurrent] = createSignal(config.defaultCurrent ?? 0, { ownedWrite: true })
  const [_direction, _setDirection] = createSignal<CarouselDirection>('forward', { ownedWrite: true })
  const [_animate, _setAnimate] = createSignal(true, { ownedWrite: true })
  const [_paused, _setPaused] = createSignal(false, { ownedWrite: true })

  const count = () => Math.max(1, config.count)
  const infinite = () => config.infinite ?? true

  /**
   * Pending-state read: Solid 2 commits ownedWrite writes in batches, so
   * back-to-back imperative calls (next(); next()) would otherwise read a
   * stale current and collapse into one move. A no-op functional write
   * evaluates against the pending value without notifying anyone.
   */
  const pendingOrCommitted = (): number => {
    let snapshot: number | undefined
    _setCurrent(prev => { snapshot = prev; return prev })
    return snapshot ?? _current()
  }

  // Rendering reads the plain signal (committed after flush); control flow
  // reads the pending-aware reader above — Solid 2 batches ownedWrite writes
  // so imperative calls must see the pending value, but a memo may NEVER
  // perform the no-op probe write while computing.
  const current = createMemo(() => config.current !== undefined ? config.current : _current())

  const clamp = (index: number) => Math.min(Math.max(index, 0), count() - 1)

  const commit = (index: number, animate: boolean, direction: CarouselDirection) => {
    const target = clamp(index)
    const from = pendingOrCommitted()
    if (target === from) return
    config.beforeChange?.(from, target)
    _setDirection(direction)
    _setAnimate(animate)
    _setCurrent(target)
    config.afterChange?.(target)
  }

  const next = () => {
    const from = pendingOrCommitted()
    if (!infinite() && from >= count() - 1) return
    // Infinite tracks wrap the last slide back to index 0 (forward).
    commit(from + 1 > count() - 1 ? 0 : from + 1, true, 'forward')
  }

  const prev = () => {
    const from = pendingOrCommitted()
    if (!infinite() && from <= 0) return
    // Infinite tracks wrap the first slide back to the last (backward).
    commit(from - 1 < 0 ? count() - 1 : from - 1, true, 'backward')
  }

  const goTo = (index: number, animate = true) => {
    const from = pendingOrCommitted()
    const target = clamp(index)
    // Direction: the index delta on the track. A jump forward (or a wrap
    // onto a later index) reads as forward.
    commit(target, animate, target >= from ? 'forward' : 'backward')
  }

  const autoplayActive = createMemo(() =>
    (config.autoplay ?? false) && !(config.pauseOnHover ?? true ? _paused() : false) && count() > 1)

  return {
    current,
    direction: () => _direction(),
    next,
    prev,
    goTo,
    animate: () => _animate(),
    autoplayActive,
    pause: () => _setPaused(true),
    resume: () => _setPaused(false),
    // RENDER-facing bounds: read the committed signal (NOT the pending
    // probe — performing a no-op signal write inside a render effect is
    // forbidden) so arrow classes re-evaluate whenever current changes.
    canPrev: () => infinite() || current() > 0,
    canNext: () => infinite() || current() < count() - 1,
  }
}

export const carouselSplits: (keyof CarouselConfig)[] = [
  'current', 'defaultCurrent', 'count', 'infinite', 'autoplay',
  'autoplaySpeed', 'pauseOnHover', 'beforeChange', 'afterChange',
]
