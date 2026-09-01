import { createSignal, createMemo, createEffect } from "solid-js";
import { createOwnerCleanup } from "./utils";

/**
 * Shared floating-layer trigger mechanics — the subset of rc-trigger
 * this library needs. Owns: trigger-event sequencing (click / hover with
 * enter-leave debounce / contextMenu / focus), portal mounting, measured
 * positioning with viewport flip, and dismiss (outside click + Escape).
 *
 * UI components (Dropdown, Menu popup, future Popover/Popconfirm/Tooltip)
 * render whatever they like; this layer only decides WHEN the layer is open
 * and WHERE it sits.
 */

export type TriggerPlacement =
  | 'bottomLeft' | 'bottomRight' | 'bottom'
  | 'topLeft' | 'topRight' | 'top'
  | 'leftTop' | 'leftBottom' | 'left'
  | 'rightTop' | 'rightBottom' | 'right'

export type TriggerAction = 'click' | 'hover' | 'contextMenu' | 'focus'

export type TriggerConfig = {
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  action?: TriggerAction
  placement?: TriggerPlacement
  /** Gap between trigger and layer, px. Default 4. */
  offset?: number
  onOpenChange?: (open: boolean) => void
  /** Where the layer portals to. Defaults to document.body. */
  getContainer?: () => HTMLElement
  /** Hover close debounce, ms. Default 100. */
  hoverDelay?: number
  /** Hover open delay, ms. Default 0 (opens immediately). */
  hoverOpenDelay?: number
  /**
   * Mount the layer DOM lazily: nothing is rendered until the first open,
   * and after close the DOM survives the leave animation plus `destroyDelay`
   * ms before being destroyed (reopening within that window cancels the
   * destroy and reuses the live DOM). Default true. Pass false to keep the
   * layer permanently mounted (legacy behavior).
   */
  lazyMount?: boolean
  /** Grace period after the leave animation before a lazy layer is destroyed, ms. Default 1000. */
  destroyDelay?: number
  /**
   * Reserve room for an arrow (the little pointing triangle) between the
   * layer and the trigger. Adds `arrowPadding` to the visual gap and reports
   * `arrow` position data for the UI layer to render the triangle. Default
   * false (no arrow).
   */
  arrow?: boolean
  /** Gap the arrow occupies, px. Only used when `arrow` is true. Default 8. */
  arrowPadding?: number
  /** Dependency injection for tests / non-browser environments. */
  measure?: (triggerEl: HTMLElement, layerEl: HTMLElement, viewport: { w: number; h: number }) => TriggerPosition
}

export type TriggerPosition = {
  /**
   * Layer anchor in container coordinates. For bottom placements this is the
   * layer's top edge (triggerBottom + offset). For top placements this is the
   * line the layer's BOTTOM edge hangs from (triggerTop - offset) — the layer
   * applies translateY(-100%) so its box grows upward. Centered placements
   * (bottom/top) additionally use translateX(-50%).
   */
  top: number
  left: number
  /** Actual placement after collision adjustment — reported back for animation origin. */
  placement: TriggerPlacement
  /**
   * Arrow placement data (only when `arrow: true`): the arrow's center
   * position along the layer edge that faces the trigger, in LAYER-LOCAL
   * coordinates (x from the layer's left edge, y from its top edge). The UI
   * renders a triangle at this point, rotated per `side`. Clamped so the
   * arrow never spills off the layer's rounded corners.
   */
  arrow?: { x: number; y: number; side: 'top' | 'bottom' | 'left' | 'right' }
}

const OPPOSITE: Record<TriggerPlacement, TriggerPlacement> = {
  bottomLeft: 'topLeft',
  bottomRight: 'topRight',
  bottom: 'top',
  topLeft: 'bottomLeft',
  topRight: 'bottomRight',
  top: 'bottom',
  leftTop: 'rightTop',
  leftBottom: 'rightBottom',
  left: 'right',
  rightTop: 'leftTop',
  rightBottom: 'leftBottom',
  right: 'left',
}

/** Which main axis a placement sits on. */
const axisOf = (p: TriggerPlacement): 'vertical' | 'horizontal' =>
  p.startsWith('left') || p.startsWith('right') ? 'horizontal' : 'vertical'

/**
 * Measure the layer anchor for a placement, using viewport coordinates.
 * Pure — safe to call directly in tests.
 */
export const measurePlacement = (
  triggerRect: { left: number; top: number; right: number; bottom: number },
  placement: TriggerPlacement,
  offset: number,
  viewport: { w: number; h: number },
): { top: number; left: number; placement: TriggerPlacement } => {
  let top: number
  let left: number

  if (axisOf(placement) === 'vertical') {
    if (placement.startsWith('bottom')) {
      // layer's TOP edge sits here
      top = triggerRect.bottom + offset
    } else {
      // layer's BOTTOM edge sits here (layer applies translateY(-100%))
      top = triggerRect.top - offset
    }
    if (placement === 'bottom' || placement === 'top') {
      // centered: anchor at trigger's horizontal center (layer applies translateX(-50%))
      left = (triggerRect.left + triggerRect.right) / 2
    } else if (placement.endsWith('Right')) {
      // layer's RIGHT edge aligns to the trigger's right edge (translateX(-100%))
      left = triggerRect.right
    } else {
      // layer's LEFT edge aligns to the trigger's left edge
      left = triggerRect.left
    }
  } else {
    // horizontal placements: the layer hangs off the trigger's left/right side
    if (placement.startsWith('left')) {
      // layer's RIGHT edge sits here (layer applies translateX(-100%))
      left = triggerRect.left - offset
    } else {
      // layer's LEFT edge sits here
      left = triggerRect.right + offset
    }
    if (placement === 'left' || placement === 'right') {
      // centered vertically (layer applies translateY(-50%))
      top = (triggerRect.top + triggerRect.bottom) / 2
    } else if (placement.endsWith('Bottom')) {
      // layer's BOTTOM edge aligns to the trigger's bottom edge (translateY(-100%))
      top = triggerRect.bottom
    } else {
      // layer's TOP edge aligns to the trigger's top edge
      top = triggerRect.top
    }
  }

  return { top, left, placement }
}

const isBottom = (p: TriggerPlacement) => p.startsWith('bottom')

/**
 * Convert a desired effective layer LEFT (the layer's actual left edge) back
 * to the anchor coordinate that pairs with the CSS translate of the placement.
 */
const anchorFromLeft = (layerLeft: number, placement: TriggerPlacement, layerW: number): number => {
  if (placement.endsWith('Right') || placement.startsWith('left')) return layerLeft + layerW
  if (placement === 'bottom' || placement === 'top') return layerLeft + layerW / 2
  return layerLeft
}

/**
 * Convert a desired effective layer TOP (the layer's actual top edge) back to
 * the anchor coordinate for horizontal placements (their Y translate pairs).
 */
const anchorFromTop = (layerTop: number, placement: TriggerPlacement, layerH: number): number => {
  if (placement.endsWith('Bottom') || placement.startsWith('top')) return layerTop + layerH
  if (placement === 'left' || placement === 'right') return layerTop + layerH / 2
  return layerTop
}

/** Effective layer rect (viewport coords) for a placement's anchor + translates. */
const effectiveLayerRect = (
  pos: { top: number; left: number; placement: TriggerPlacement },
  layerW: number,
  layerH: number,
): { left: number; top: number; width: number; height: number } => {
  const left = pos.placement.endsWith('Right') || pos.placement.startsWith('left')
    ? pos.left - layerW
    : pos.placement === 'bottom' || pos.placement === 'top'
      ? pos.left - layerW / 2
      : pos.left
  const top = pos.placement.endsWith('Bottom') || pos.placement.startsWith('top')
    ? pos.top - layerH
    : pos.placement === 'left' || pos.placement === 'right'
      ? pos.top - layerH / 2
      : pos.top
  return { left, top, width: layerW, height: layerH }
}

/**
 * Arrow (the little pointing triangle) placement: where the arrow's CENTER
 * sits on the layer edge facing the trigger, in layer-local coordinates, and
 * which way it points. The arrow tracks the trigger's center along the cross
 * axis so a shifted/clamped layer still points at the right spot, clamped to
 * keep the triangle clear of the layer's rounded corners. Pure — testable
 * directly.
 */
export const computeArrow = (
  triggerEl: { getBoundingClientRect(): { left: number; right: number; top: number; bottom: number; width: number; height: number } },
  layerEl: { getBoundingClientRect(): { left: number; right: number; top: number; bottom: number; width: number; height: number } },
  pos: { top: number; left: number; placement: TriggerPlacement },
): { x: number; y: number; side: 'top' | 'bottom' | 'left' | 'right' } => {
  const tRect = triggerEl.getBoundingClientRect()
  const lRect = layerEl.getBoundingClientRect()
  const eff = effectiveLayerRect(pos, lRect.width, lRect.height)
  // Arrow half-size (4px) + corner radius (8px) ≈ 12px from each edge.
  const margin = 12

  if (axisOf(pos.placement) === 'vertical') {
    // Arrow slides along the layer's top/bottom edge, tracking the trigger's
    // horizontal center.
    const triggerCenterX = (tRect.left + tRect.right) / 2
    const x = Math.min(Math.max(triggerCenterX - eff.left, margin), Math.max(margin, lRect.width - margin))
    if (isBottom(pos.placement)) {
      // Layer below trigger → arrow on the layer's TOP edge, pointing up.
      return { x, y: 0, side: 'top' }
    }
    // Layer above trigger → arrow on the layer's BOTTOM edge, pointing down.
    return { x, y: lRect.height, side: 'bottom' }
  }

  // Horizontal placements: arrow slides along the layer's left/right edge,
  // tracking the trigger's vertical center.
  const triggerCenterY = (tRect.top + tRect.bottom) / 2
  const y = Math.min(Math.max(triggerCenterY - eff.top, margin), Math.max(margin, lRect.height - margin))
  if (pos.placement.startsWith('left')) {
    // Layer left of trigger → arrow on the layer's RIGHT edge, pointing right.
    return { x: lRect.width, y, side: 'right' }
  }
  // Layer right of trigger → arrow on the layer's LEFT edge, pointing left.
  return { x: 0, y, side: 'left' }
}

export const createTrigger = (config: TriggerConfig = {}) => {
  const onOwnerCleanup = createOwnerCleanup()
  const [_open, _setOpen] = createSignal(config.defaultOpen ?? false, { ownedWrite: true })
  // Position in viewport coordinates; recomputed on open + scroll + resize.
  // Seed with the CONFIGURED placement (not a hard-coded default): the layer
  // renders one frame at (0,0) before the first measurement, and the seed's
  // translate pairing must match the target placement — otherwise the
  // transform difference between the seed and the measured placement gets
  // captured by the layer's CSS transition and the layer visibly glides in
  // from off-screen (e.g. rightBottom: seed 'bottomLeft' → no translate,
  // measured 'rightBottom' → translateY(-100%) → the layer slides upward).
  const [_pos, _setPos] = createSignal<TriggerPosition>({ top: 0, left: 0, placement: config.placement ?? 'bottomLeft' })
  // False until the first measurement lands. The layer starts at the default
  // position (0,0); without this flag, a CSS transition on top/left would
  // animate the layer flying in from the top-left corner on first open. While
  // false, the layer must stay invisible AND un-animated (see layerStyle).
  const [_ready, _setReady] = createSignal(false, { ownedWrite: true })
  // lazyMount lifecycle: `mounted` gates the <Show> that renders the layer —
  // false until first open. `destroyTimer` schedules the post-animation
  // teardown; reopening cancels it and reuses the live DOM (refs intact, no
  // remount flicker).
  const lazyMount = () => config.lazyMount ?? true
  const [_mounted, _setMounted] = createSignal(!lazyMount() || config.defaultOpen === true || config.open === true, { ownedWrite: true })
  let _destroyTimer: ReturnType<typeof setTimeout> | undefined

  const open = createMemo(() => config.open !== undefined ? config.open : _open())
  // Mounted signal exposed to the UI layer. For a lazy trigger this starts
  // false (nothing rendered); `defaultOpen: true` mounts on creation. For a
  // non-lazy trigger it stays true forever.
  const mounted = createMemo(() => _mounted())

  let _triggerEl: HTMLElement | undefined
  let _layerEl: HTMLElement | undefined
  let _hoverTimeout: ReturnType<typeof setTimeout> | undefined

  const action = () => config.action ?? 'click'
  const offset = () => config.offset ?? 4
  // Effective gap = base offset + arrow slot (see gap() under positioning).

  const setOpen = (v: boolean) => {
    if (config.disabled) return
    if (v === open()) return
    _setOpen(v)
    config.onOpenChange?.(v)
    if (v) {
      // Lazy layers: cancel any pending destroy and ensure the DOM exists
      // BEFORE measuring — the UI renders the layer inside
      // <Show when={trigger.mounted()}> so the ref (and real dimensions)
      // only appear after this flip.
      if (_destroyTimer) { clearTimeout(_destroyTimer); _destroyTimer = undefined }
      if (lazyMount()) _setMounted(true)
      // Measure synchronously and reveal immediately: the layer is already
      // rendered (opacity-0), so it usually has real dimensions here. A
      // rAF-gated reveal stalls in environments where requestAnimationFrame
      // never fires (headless renderers after repeated navigation) — the
      // popup would stay visibility:hidden forever.
      remeasure()
      if (_layerEl && _layerEl.getBoundingClientRect().height > 0) {
        _setReady(true)
      } else {
        // The layer was still mounting (zero size) at call time — retry on a
        // macrotask, which unlike rAF is guaranteed to run even when the
        // renderer's frame pipeline is stalled.
        setTimeout(() => {
          if (!open() || _ready()) return
          remeasure()
          if (_layerEl && _layerEl.getBoundingClientRect().height > 0) {
            _setReady(true)
          }
        }, 0)
      }
    } else if (lazyMount()) {
      // Schedule teardown AFTER the leave animation (duration-fast/mid ≈
      // 200ms; allow generous headroom for slow devices) plus the caller's
      // grace period. Reopening cancels the timer, so a quick hover-in/out
      // cycle never pays the remount cost.
      const delay = (config.destroyDelay ?? 1000) + 300
      if (_destroyTimer) clearTimeout(_destroyTimer)
      _destroyTimer = setTimeout(() => {
        _destroyTimer = undefined
        if (open()) return
        _setMounted(false)
        _setReady(false)
        _layerEl = undefined
      }, delay)
    }
  }

  const toggle = () => setOpen(!open())

  // ---- positioning -------------------------------------------------------

  // Effective gap between trigger and layer: the base offset plus the arrow
  // slot when one is requested (antd keeps ~4px visual gap with the arrow
  // tip touching the trigger).
  const gap = () => offset() + (config.arrow ? config.arrowPadding ?? 8 : 0)

  const defaultMeasure = (triggerEl: HTMLElement, layerEl: HTMLElement, viewport: { w: number; h: number }): TriggerPosition => {
    const rect = triggerEl.getBoundingClientRect()
    const placement = config.placement ?? 'bottomLeft'
    const layerH = layerEl.getBoundingClientRect().height
    const layerW = layerEl.getBoundingClientRect().width
    const axis = axisOf(placement)

    // Visible-area maximization (the rc-align approach): compare how much of
    // the layer stays inside the viewport on the preferred side vs the
    // opposite side, and keep whichever shows more. Ties keep the preferred
    // placement, so a layer that fully fits never flips.
    const effectiveRectFor = (p: TriggerPlacement) => {
      const m = measurePlacement(rect, p, gap(), viewport)
      return effectiveLayerRect(m, layerW, layerH)
    }
    const visibleArea = (r: { left: number; top: number; width: number; height: number }) => {
      const w = Math.max(0, Math.min(r.left + r.width, viewport.w) - Math.max(r.left, 0))
      const h = Math.max(0, Math.min(r.top + r.height, viewport.h) - Math.max(r.top, 0))
      return w * h
    }

    let measured = measurePlacement(rect, placement, gap(), viewport)
    if (rect.height > 0 && rect.width > 0) {
      const preferred = effectiveRectFor(placement)
      const opposite = effectiveRectFor(OPPOSITE[placement])
      if (visibleArea(opposite) > visibleArea(preferred)) {
        measured = measurePlacement(rect, OPPOSITE[placement], gap(), viewport)
      }
    }

    // Clamp overflow (shift) in effective-layer coordinates, then convert the
    // clamped edge back to the anchor coordinate.
    const eff = effectiveLayerRect(measured, layerW, layerH)
    if (axis === 'vertical') {
      if (eff.left + layerW > viewport.w) {
        const clampedLeft = Math.max(0, viewport.w - layerW)
        measured = { ...measured, left: anchorFromLeft(clampedLeft, measured.placement, layerW) }
      } else if (eff.left < 0) {
        measured = { ...measured, left: anchorFromLeft(0, measured.placement, layerW) }
      }
    } else {
      if (eff.top + layerH > viewport.h) {
        const clampedTop = Math.max(0, viewport.h - layerH)
        measured = { ...measured, top: anchorFromTop(clampedTop, measured.placement, layerH) }
      } else if (eff.top < 0) {
        measured = { ...measured, top: anchorFromTop(0, measured.placement, layerH) }
      }
    }

    return measured
  }

  const remeasure = () => {
    if (!_triggerEl || !_layerEl) return
    const viewport = { w: window.innerWidth, h: window.innerHeight }
    const measure = config.measure ?? defaultMeasure
    let next = measure(_triggerEl, _layerEl, viewport)
    if (config.arrow) {
      next = { ...next, arrow: computeArrow(_triggerEl, _layerEl, next) }
    }
    // Portal container is document.body by default → viewport coords are
    // container coords. With a custom container, translate.
    const container = config.getContainer?.() ?? document.body
    if (container !== document.body) {
      const cRect = container.getBoundingClientRect()
      _setPos({ ...next, top: next.top - cRect.top, left: next.left - cRect.left })
    } else {
      _setPos(next)
    }
  }

  // Keep the layer glued to the trigger while open.
  const handleScrollOrResize = () => {
    if (open()) remeasure()
  }

  // ---- trigger events ----------------------------------------------------

  const triggerRef = (el: HTMLElement) => {
    _triggerEl = el

    if (action() === 'click') {
      const handleClick = (e: MouseEvent) => {
        e.stopPropagation()
        toggle()
      }
      el.addEventListener('click', handleClick)
      onOwnerCleanup(() => el.removeEventListener('click', handleClick))
    } else if (action() === 'hover') {
      const handleEnter = () => {
        if (_hoverTimeout) clearTimeout(_hoverTimeout)
        // Optional open delay (Tooltip semantics): schedule the open so a
        // fast pointer swipe over the trigger doesn't flash the layer.
        const openDelay = config.hoverOpenDelay ?? 0
        if (openDelay > 0) {
          _hoverTimeout = setTimeout(() => setOpen(true), openDelay)
        } else {
          setOpen(true)
        }
      }
      const handleLeave = () => {
        if (_hoverTimeout) clearTimeout(_hoverTimeout)
        _hoverTimeout = setTimeout(() => setOpen(false), config.hoverDelay ?? 100)
      }
      el.addEventListener('mouseenter', handleEnter)
      el.addEventListener('mouseleave', handleLeave)
      onOwnerCleanup(() => {
        el.removeEventListener('mouseenter', handleEnter)
        el.removeEventListener('mouseleave', handleLeave)
        if (_hoverTimeout) clearTimeout(_hoverTimeout)
      })
    } else if (action() === 'contextMenu') {
      const handleContext = (e: MouseEvent) => {
        e.preventDefault()
        setOpen(true)
      }
      el.addEventListener('contextmenu', handleContext)
      onOwnerCleanup(() => el.removeEventListener('contextmenu', handleContext))
    } else if (action() === 'focus') {
      const handleFocus = () => setOpen(true)
      const handleBlur = () => setOpen(false)
      el.addEventListener('focusin', handleFocus)
      el.addEventListener('focusout', handleBlur)
      onOwnerCleanup(() => {
        el.removeEventListener('focusin', handleFocus)
        el.removeEventListener('focusout', handleBlur)
      })
    }
  }

  const layerRef = (el: HTMLElement) => {
    _layerEl = el
  }

  // Hover layers stay open while the pointer is over the layer itself.
  const bindLayerHover = () => {
    if (action() !== 'hover' || !_layerEl) return
    const handleEnter = () => { if (_hoverTimeout) clearTimeout(_hoverTimeout) }
    const handleLeave = () => {
      if (_hoverTimeout) clearTimeout(_hoverTimeout)
      _hoverTimeout = setTimeout(() => setOpen(false), config.hoverDelay ?? 100)
    }
    _layerEl.addEventListener('mouseenter', handleEnter)
    _layerEl.addEventListener('mouseleave', handleLeave)
    onOwnerCleanup(() => {
      if (!_layerEl) return
      _layerEl.removeEventListener('mouseenter', handleEnter)
      _layerEl.removeEventListener('mouseleave', handleLeave)
      if (_hoverTimeout) clearTimeout(_hoverTimeout)
    })
  }

  // ---- dismiss -----------------------------------------------------------

  const handleOutsidePointer = (e: PointerEvent) => {
    if (!open()) return
    const target = e.target as Node
    if (_triggerEl?.contains(target) || _layerEl?.contains(target)) return
    setOpen(false)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!open() || e.key !== 'Escape') return
    // Escape is also handled by layer-internal keydown handlers (e.g. menu
    // navigation); only close here when the event reached the document.
    if (_layerEl?.contains(e.target as Node)) return
    setOpen(false)
  }

  document.addEventListener('pointerdown', handleOutsidePointer)
  document.addEventListener('keydown', handleKeyDown)
  window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true })
  window.addEventListener('resize', handleScrollOrResize)
  onOwnerCleanup(() => {
    document.removeEventListener('pointerdown', handleOutsidePointer)
    document.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('scroll', handleScrollOrResize, true)
    window.removeEventListener('resize', handleScrollOrResize)
    if (_hoverTimeout) clearTimeout(_hoverTimeout)
    if (_destroyTimer) clearTimeout(_destroyTimer)
  })

  // Re-measure on open (layer must be visible to have dimensions).
  createEffect(
    () => open(),
    (isOpen) => {
      if (isOpen) {
        // Fallback for the case setOpen() could not measure synchronously
        // (layer still mounting → zero size). rAF is only a fallback because
        // it never fires in some headless renderers after repeated
        // navigation, which would leave the layer hidden forever.
        requestAnimationFrame(() => {
          remeasure()
          _setReady(true)
        })
      }
    }
  )

  const layerStyle = createMemo((): Record<string, string> => {
    const p = _pos()
    // translate pairs with the anchor semantics in measurePlacement:
    // top* placements hang the layer's bottom edge from the anchor (-100% Y);
    // *Right / left* aligns the right edge (-100% X); centered variants use
    // -50% on their main axis.
    let transform = ''
    if (p.placement.startsWith('top') || p.placement.endsWith('Bottom')) transform += ' translateY(-100%)'
    if (p.placement.endsWith('Right') || p.placement.startsWith('left')) transform += ' translateX(-100%)'
    if (p.placement === 'bottom' || p.placement === 'top') transform += ' translateX(-50%)'
    if (p.placement === 'left' || p.placement === 'right') transform += ' translateY(-50%)'
    const style: Record<string, string> = {
      position: 'absolute',
      top: `${p.top}px`,
      left: `${p.left}px`,
      'z-index': '1050',
    }
    if (transform) style.transform = transform.trim()
    // Before the first measurement, park the layer invisibly at its final
    // position without letting a CSS transition animate it there from (0,0).
    // `transition: none` also suppresses the opacity/scale entrance for this
    // one frame — invisible either way, so nothing is perceived as lost.
    if (!_ready()) {
      style.visibility = 'hidden'
      style.transition = 'none'
    }
    // Keep the entrance transition from ALSO capturing the transform change
    // between the seed placement and the measured one (e.g. rightBottom seeds
    // at (0,0) without translate, then measures to translateY(-100%)): when
    // not ready, transition:none already covers it. Once ready, position
    // changes must never animate — only opacity/scale should — so the
    // transform change is neutralized by starting the layer at the measured
    // placement's translate from the very first frame (seeded above).
    return style
  })

  // Placement AFTER flip — drives the animation origin class.
  const actualPlacement = createMemo(() => _pos().placement)

  // Arrow data AFTER positioning (layer-local coordinates + pointing side).
  // Undefined unless `arrow: true` was configured.
  const arrow = createMemo(() => _pos().arrow)

  const refs = {
    open,
    setOpen,
    toggle,
  }

  return {
    open,
    setOpen,
    toggle,
    triggerRef,
    layerRef,
    bindLayerHover,
    remeasure,
    layerStyle,
    actualPlacement,
    /** True while the lazy layer's DOM should exist (see lazyMount). */
    mounted,
    /** Arrow position data when `arrow: true`, else undefined. */
    arrow,
    refs,
  }
}

export const triggerSplits: (keyof TriggerConfig)[] = [
  'open', 'defaultOpen', 'disabled', 'action', 'placement', 'offset',
  'onOpenChange', 'getContainer', 'hoverDelay', 'hoverOpenDelay',
  'lazyMount', 'destroyDelay', 'arrow', 'arrowPadding', 'measure',
]
