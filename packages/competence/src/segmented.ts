import { createEffect, createMemo, createSignal, untrack } from "solid-js";
import { createSelection, type SelectionIns, type SelectionOption } from "./selection";
import type { FormFieldRule } from "./formField";

/**
 * Headless logic for Segmented — the rc-segmented state core.
 *
 * ARCHITECTURE: Segmented is a single-picker (radio semantics) wearing a
 * sliding-thumb skin. The VALUE layer is entirely delegated to the shared
 * createSelection store (maxSelect: 1, no deselect — the same machine
 * Radio.Group rides); what THIS file adds is the THUMB:
 *
 *  - item geometry registry: the UI layer reports each item's measured
 *    box (offsetLeft/offsetWidth) via setItemRect — measurement lives in
 *    the renderer (it owns the DOM), but the derived thumb transform
 *    lives here so tests can drive it without a browser
 *  - thumbRect: the selected item's box (or the focused item's during
 *    keyboard traversal — antd's thumb follows the hover/focus target,
 *    the value only commits on click/Enter)
 *  - focus tracking for arrow-key traversal: Home/End/←/→ move focus;
 *    Enter/Space commit
 *
 * Options model: antd allows `label` to be a node and `value` to be
 * absent (label used as the key). The headless layer keeps the strict
 * SelectionOption shape (string labels, string|number keys) — the UI
 * layer normalizes richer items into it (label fallback = String(value)).
 */
export type SegmentedOption = SelectionOption & {
  /** Icon node slot (UI concern; kept for parity with antd items). */
  icon?: unknown
  /** Payload channel for arbitrary item data (antd `payload`). */
  payload?: unknown
}

export type SegmentedRect = {
  /** Horizontal offset from the group's content origin, px. */
  left: number
  /** Item width, px. */
  width: number
}

export type SegmentedConfig = {
  /** Controlled selected value (single key); undefined = uncontrolled. */
  value?: string | number
  defaultValue?: string | number
  options?: SegmentedOption[]
  disabled?: boolean
  /** Equal-width items filling the container (thumb still measures). */
  block?: boolean
  onChange?: (value: string | number) => void
  /** Form integration: rules for the enclosing Item. */
  rules?: FormFieldRule[]
}

export type SegmentedIns = {
  /** The selected key (undefined when nothing is picked). */
  value: () => string | number | undefined
  options: () => SegmentedOption[]
  isSelected: (value: string | number) => boolean
  isDisabled: (value: string | number) => boolean
  /** Whether the whole group is disabled. */
  isDisabledAll: () => boolean
  /** Pick a key (replaces; disabled keys ignored). */
  select: (value: string | number) => void
  /** Which key currently owns the THUMB (selection or keyboard focus). */
  thumbValue: () => string | number | undefined
  /** The thumb's measured box (undefined = nothing to render). */
  thumbRect: () => SegmentedRect | undefined
  /** UI reports a measured item box; recomputes the thumb. */
  setItemRect: (value: string | number, rect: SegmentedRect) => void
  /** Drop every registered box (re-measure sweep start). */
  clearItemRects: () => void
  /** The keyboard-focused key (traversal highlight). */
  focusValue: () => string | number | undefined
  setFocusValue: (value: string | number | undefined) => void
  /** Move keyboard focus to the previous/next ENABLED item. */
  moveFocus: (delta: number) => void
  /** Focus the first/last enabled item (Home/End). */
  focusEdge: (edge: 'first' | 'last') => void
  /** The underlying shared store (Select-style composition). */
  store: () => SelectionIns
}

export const createSegmented = (config: SegmentedConfig = {}): SegmentedIns => {
  // The VALUE machine: maxSelect 1, clicking the selected item keeps it.
  const store = createSelection({
    value: () => (config.value !== undefined ? [config.value] : undefined),
    defaultValue: config.defaultValue !== undefined ? [config.defaultValue] : undefined,
    get options() { return config.options as SelectionOption[] },
    get disabled() { return config.disabled },
    maxSelect: 1,
    allowDeselect: false,
    onChange: next => {
      const single = next[0]
      if (single !== undefined) config.onChange?.(single)
    },
  })

  const value = createMemo<string | number | undefined>(() => store.value()[0])
  const isDisabledAll = () => !!config.disabled

  // ---- thumb geometry -------------------------------------------------------

  // Measured boxes by key. A plain Map + signal revision (not a signal Map):
  // setItemRect during a render/effect writes the revision signal, and
  // thumbRect reads it — pure Solid 2, no store subtleties.
  const rects = new Map<string | number, SegmentedRect>()
  const [_rectsRev, _setRectsRev] = createSignal(0, { ownedWrite: true })

  // Keyboard focus rides on top; the thumb follows focus when present
  // (antd: traversal slides the thumb to the candidate before commit).
  const [_focusValue, _setFocusValue] = createSignal<string | number | undefined>(undefined, {
    ownedWrite: true,
  })

  const thumbValue = createMemo<string | number | undefined>(() =>
    _focusValue() ?? value(),
  )

  const thumbRect = createMemo<SegmentedRect | undefined>(() => {
    void _rectsRev()
    const key = thumbValue()
    if (key === undefined) return undefined
    return rects.get(key)
  })

  const setItemRect = (key: string | number, rect: SegmentedRect) => {
    const prev = rects.get(key)
    if (prev && prev.left === rect.left && prev.width === rect.width) return
    rects.set(key, rect)
    _setRectsRev(rev => rev + 1)
  }

  const clearItemRects = () => {
    rects.clear()
    _setRectsRev(rev => rev + 1)
  }

  // ---- keyboard traversal ---------------------------------------------------

  const enabledOptions = () => {
    const all = config.options ?? []
    if (!config.disabled) return all.filter(o => !o.disabled)
    // Group disabled: everything is untraversable.
    return []
  }

  const moveFocus = (delta: number) => {
    const enabled = enabledOptions()
    if (!enabled.length) return
    const cur = untrack(_focusValue) ?? untrack(() => value())
    let idx = enabled.findIndex(o => o.value === cur)
    if (idx === -1) idx = delta > 0 ? -1 : enabled.length
    // Wrap around the enabled list (antd wraps; blocked stops at ends).
    const next = (idx + delta + enabled.length * Math.abs(delta || 1)) % enabled.length
    _setFocusValue(enabled[next].value)
  }

  const focusEdge = (edge: 'first' | 'last') => {
    const enabled = enabledOptions()
    if (!enabled.length) return
    _setFocusValue(edge === 'first' ? enabled[0].value : enabled[enabled.length - 1].value)
  }

  // Leaving the widget / committing clears focus back onto the value.
  const select = (key: string | number) => {
    _setFocusValue(undefined)
    store.select(key)
  }

  // A controlled value change arrives from outside — the thumb follows it,
  // and any stale focus (pointing at a key no longer valid) drops.
  if (config.value !== undefined) {
    createEffect(
      () => config.value,
      (v) => {
        if (v === undefined) return
        if (untrack(_focusValue) === v) _setFocusValue(undefined)
      },
    )
  }

  return {
    value,
    options: () => config.options ?? [],
    isSelected: store.isSelected,
    isDisabled: store.isDisabled,
    isDisabledAll,
    select,
    thumbValue,
    thumbRect,
    setItemRect,
    clearItemRects,
    focusValue: _focusValue,
    setFocusValue: (v: string | number | undefined) => _setFocusValue(v),
    moveFocus,
    focusEdge,
    store: () => store,
  }
}

export const segmentedSplits: (keyof SegmentedConfig)[] = [
  'value', 'defaultValue', 'options', 'disabled', 'block',
]
