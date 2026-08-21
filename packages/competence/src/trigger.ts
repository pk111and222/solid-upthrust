import { createSignal, createMemo, createEffect, batch } from "solid-js";
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
}

const OPPOSITE: Record<TriggerPlacement, TriggerPlacement> = {
  bottomLeft: 'topLeft',
  bottomRight: 'topRight',
  bottom: 'top',
  topLeft: 'bottomLeft',
  topRight: 'bottomRight',
  top: 'bottom',
}

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
  if (placement.startsWith('bottom')) {
    // layer's TOP edge sits here
    top = triggerRect.bottom + offset
  } else {
    // layer's BOTTOM edge sits here (layer applies translateY(-100%))
    top = triggerRect.top - offset
  }

  let left: number
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

  return { top, left, placement }
}

const isBottom = (p: TriggerPlacement) => p.startsWith('bottom')

/**
 * Convert a desired effective layer LEFT (the layer's actual left edge) back
 * to the anchor coordinate that pairs with the CSS translate of the placement
 * (topLeft → no translate, topRight → translateX(-100%), top → translateX(-50%)).
 */
const anchorFromLeft = (layerLeft: number, placement: TriggerPlacement, layerW: number): number => {
  if (placement.endsWith('Right')) return layerLeft + layerW
  if (placement === 'bottom' || placement === 'top') return layerLeft + layerW / 2
  return layerLeft
}

export const createTrigger = (config: TriggerConfig = {}) => {
  const onOwnerCleanup = createOwnerCleanup()
  const [_open, _setOpen] = createSignal(config.defaultOpen ?? false, { ownedWrite: true })
  // Position in viewport coordinates; recomputed on open + scroll + resize.
  const [_pos, _setPos] = createSignal<{ top: number; left: number; placement: TriggerPlacement }>({ top: 0, left: 0, placement: config.placement ?? 'bottomLeft' })
  // False until the first measurement lands. The layer starts at the default
  // position (0,0); without this flag, a CSS transition on top/left would
  // animate the layer flying in from the top-left corner on first open. While
  // false, the layer must stay invisible AND un-animated (see layerStyle).
  const [_ready, _setReady] = createSignal(false, { ownedWrite: true })

  const open = createMemo(() => config.open !== undefined ? config.open : _open())

  let _triggerEl: HTMLElement | undefined
  let _layerEl: HTMLElement | undefined
  let _hoverTimeout: ReturnType<typeof setTimeout> | undefined

  const action = () => config.action ?? 'click'
  const offset = () => config.offset ?? 4

  const setOpen = (v: boolean) => {
    if (config.disabled) return
    if (v === open()) return
    _setOpen(v)
    config.onOpenChange?.(v)
    if (v) {
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
    }
  }

  const toggle = () => setOpen(!open())

  // ---- positioning -------------------------------------------------------

  const defaultMeasure = (triggerEl: HTMLElement, layerEl: HTMLElement, viewport: { w: number; h: number }): TriggerPosition => {
    const rect = triggerEl.getBoundingClientRect()
    const placement = config.placement ?? 'bottomLeft'
    const layerH = layerEl.getBoundingClientRect().height
    const layerW = layerEl.getBoundingClientRect().width

    let measured = measurePlacement(rect, placement, offset(), viewport)

    // Effective layer rect for the current placement (accounting for the
    // translateY(-100%) on top placements).
    const layerTop = isBottom(measured.placement)
      ? measured.top
      : measured.top - layerH
    const layerLeft = measured.placement.endsWith('Right')
      ? measured.left - layerW
      : measured.placement === 'bottom' || measured.placement === 'top'
        ? measured.left - layerW / 2
        : measured.left

    // Flip when the layer would overflow the viewport vertically.
    const flipsVertically =
      isBottom(measured.placement) && layerTop + layerH > viewport.h
      || !isBottom(measured.placement) && layerTop < 0
    if (flipsVertically && rect.height > 0) {
      measured = measurePlacement(rect, OPPOSITE[measured.placement], offset(), viewport)
    }

    // Clamp horizontal overflow (shift) in effective-layer coordinates, then
    // convert the clamped left back to the anchor coordinate.
    const finalLeft = measured.placement.endsWith('Right')
      ? measured.left - layerW
      : measured.placement === 'bottom' || measured.placement === 'top'
        ? measured.left - layerW / 2
        : measured.left
    if (finalLeft + layerW > viewport.w) {
      const clampedLeft = Math.max(0, viewport.w - layerW)
      measured = { ...measured, left: anchorFromLeft(clampedLeft, measured.placement, layerW) }
    } else if (finalLeft < 0) {
      measured = { ...measured, left: anchorFromLeft(0, measured.placement, layerW) }
    }

    return measured
  }

  const remeasure = () => {
    if (!_triggerEl || !_layerEl) return
    const viewport = { w: window.innerWidth, h: window.innerHeight }
    const measure = config.measure ?? defaultMeasure
    const next = measure(_triggerEl, _layerEl, viewport)
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
        setOpen(true)
      }
      const handleLeave = () => {
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
    // top placements hang the layer's bottom edge from the anchor (-100% Y);
    // *Right aligns the right edge (-100% X); centered variants use -50% X.
    let transform = ''
    if (p.placement.startsWith('top')) transform += ' translateY(-100%)'
    if (p.placement.endsWith('Right')) transform += ' translateX(-100%)'
    if (p.placement === 'bottom' || p.placement === 'top') transform += ' translateX(-50%)'
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
    return style
  })

  // Placement AFTER flip — drives the animation origin class.
  const actualPlacement = createMemo(() => _pos().placement)

  const refs: TriggerIns = {
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
    refs,
  }
}

export const triggerSplits: (keyof TriggerConfig)[] = [
  'open', 'defaultOpen', 'disabled', 'action', 'placement', 'offset',
  'onOpenChange', 'getContainer', 'hoverDelay', 'measure',
]
