import { createEffect, createMemo, createSignal, untrack } from "solid-js";

/**
 * Headless logic for Rate — the rc-rate state core, riding on the shared
 * createNumericValue machine (the same one under InputNumber and Slider).
 * A rating IS a number picker with min=0, max=count, step=allowHalf ? 0.5 : 1
 * — everything except hover comes from the shared machine.
 *
 * What Rate adds:
 *  - HOVER PREVIEW: moving the pointer over star n PREVIEWS n without
 *    committing (antd: hover changes the paint, click commits); focus
 *    keyboard navigation previews the same way.
 *  - CHARACTER COUNT: `count` stars (default 5); value is star units —
 *    half stars make the lattice {0, 0.5, 1, ...count}.
 *  - CLEARABLE: clicking the current value resets to 0 (antd clear prop).
 */
import { createNumericValue, type NumericValueIns } from "./selection";
import type { FormFieldRule } from "./formField";

export type RateConfig = {
  /** Controlled rating; undefined = uncontrolled. */
  value?: number
  defaultValue?: number
  /** Number of characters (stars). Default 5. */
  count?: number
  /** Allow half-star values. Default false. */
  allowHalf?: boolean
  /** Allow clearing by re-clicking the current value. Default false. */
  allowClear?: boolean
  disabled?: boolean
  /** Auto-focus the character container. */
  autoFocus?: boolean
  onChange?: (value: number) => void
  onHoverChange?: (value: number) => void
  onFocus?: () => void
  onBlur?: () => void
  /** Form integration: rules for the enclosing Item. */
  rules?: FormFieldRule[]
}

export type RateIns = {
  /** The committed rating (0 when unrated). */
  value: () => number
  /** What the stars should PAINT: the hover preview while hovering, else value. */
  displayValue: () => number
  count: () => number
  isDisabled: () => boolean
  isFocused: () => boolean
  /** Pointer entered character area n (1-based; halves round to the lattice). */
  hoverAt: (position: number) => void
  /** Pointer left the widget — preview off. */
  leaveHover: () => void
  isHovering: () => boolean
  /** Click character area n (1-based) — commits, or clears when equal & clearable. */
  clickAt: (position: number) => void
  /** Keyboard: arrows move by one star (halves by half), 0 resets. */
  stepBy: (steps: number) => void
  reset: () => void
  notifyFocus: () => void
  notifyBlur: () => void
  /** The shared numeric machine (advanced composition). */
  core: () => NumericValueIns
}

export const createRate = (config: RateConfig = {}): RateIns => {
  const count = () => config.count ?? 5
  const lattice = () => config.allowHalf ? 0.5 : 1

  // The shared machine: Rate IS a 0..count number picker on a 0.5/1 lattice.
  // `value` passes undefined through UNCONTROLLED — the ?? null coercion
  // would turn "uncontrolled" into "controlled null" and freeze the widget.
  const core = createNumericValue({
    value: () => config.value,
    defaultValue: untrack(() => config.defaultValue),
    min: 0,
    max: () => count(),
    step: () => lattice(),
    disabled: () => !!config.disabled,
    onChange: v => {
      config.onChange?.(v ?? 0)
    },
  })

  // ownedWrite: hover/click arrive from DOM pointer events.
  const [_hoverValue, _setHoverValue] = createSignal<number | null>(null, { ownedWrite: true })
  const [_focused, _setFocused] = createSignal(false, { ownedWrite: true })

  const value = createMemo(() => Math.min(count(), Math.max(0, core.value() ?? 0)))

  /** Snap a raw pointer position onto the half/whole lattice. */
  const snapToLattice = (position: number): number => {
    const l = lattice()
    const snapped = Math.round(position / l) * l
    return Math.min(count(), Math.max(0, snapped))
  }

  const isDisabled = () => core.isDisabled()

  const hoverAt = (position: number) => {
    if (isDisabled()) return
    const snapped = snapToLattice(position)
    if (_hoverValue() === snapped) return
    _setHoverValue(snapped)
    config.onHoverChange?.(snapped)
  }

  const leaveHover = () => {
    if (_hoverValue() === null) return
    _setHoverValue(null)
    config.onHoverChange?.(value())
  }

  // Geometry/mode changes invalidate the old pointer preview.
  const previewMode = () => `${count()}:${lattice()}:${isDisabled()}`
  let previousMode = untrack(previewMode)
  createEffect(previewMode, mode => {
    if (mode !== previousMode) untrack(leaveHover)
    previousMode = mode
  })

  const isHovering = () => _hoverValue() !== null

  const displayValue = createMemo(() => {
    const h = _hoverValue()
    return h !== null ? h : value()
  })

  const clickAt = (position: number) => {
    if (isDisabled()) return
    const snapped = snapToLattice(position)
    // Clearable: clicking the current value resets (antd rc-rate).
    if (config.allowClear && snapped !== 0 && snapped === value()) {
      core.setValue(0)
      leaveHover()
      return
    }
    if (snapped === value()) return
    core.setValue(snapped)
  }

  const stepBy = (steps: number) => {
    if (isDisabled()) return
    if (steps === 0) return
    core.setValue(snapToLattice(value() + steps * lattice()))
    // The preview follows the keyboard too (antd: focus shows the value).
    _setHoverValue(null)
  }

  const reset = () => {
    if (isDisabled()) return
    core.setValue(0)
    leaveHover()
  }

  const notifyFocus = () => {
    _setFocused(true)
    config.onFocus?.()
  }

  const notifyBlur = () => {
    _setFocused(false)
    _setHoverValue(null)
    config.onBlur?.()
  }

  return {
    value,
    displayValue,
    count,
    isDisabled,
    isFocused: () => _focused(),
    hoverAt,
    leaveHover,
    isHovering,
    clickAt,
    stepBy,
    reset,
    notifyFocus,
    notifyBlur,
    core: () => core,
  }
}

export const rateSplits: (keyof RateConfig)[] = [
  'value', 'defaultValue', 'count', 'allowHalf', 'allowClear', 'disabled',
]
