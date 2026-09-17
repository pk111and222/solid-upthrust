import { createMemo, createSignal, untrack } from "solid-js";

/**
 * Headless logic for Slider — the rc-slider state core, riding on the
 * shared createNumericValue machine (the same one under InputNumber and
 * Rate): min/max/step/precision/clamp/controlled-or-uncontrolled all come
 * from there. This file adds ONLY what a track adds:
 *
 *  - POSITION ⇄ VALUE: percent/point conversions between pixel space and
 *    value space (vertical & reverse aware) — the thumb's geometry.
 *  - RANGE: [start, end] pairs (two thumbs); a single value is the
 *    start-only degenerate case, exactly rc-slider's model.
 *  - DRAG: beginDrag(point) + dragging state; the renderer feeds pointer
 *    moves (it owns the listeners), this layer converts & commits.
 *  - STEPPING: keyboard arrows ride the shared stepBy; Home/End snap.
 *  - MARKS: sorted mark values + isMarkAt for tick rendering; marks also
 *    constrain the value when `step === null` (rc-slider: mark-only mode
 *    snaps to mark values).
 */
import { createNumericValue, toFixedWithPrecision, type NumericValueIns } from "./selection";
import type { FormFieldRule } from "./formField";

export type SliderMark = {
  value: number
  label?: string
}

export type SliderConfig = {
  /** Controlled value (single number) — use `rangeValue` for two thumbs. */
  value?: number
  defaultValue?: number
  /** Controlled [start, end] pair (enables range mode). */
  rangeValue?: [number, number]
  defaultRangeValue?: [number, number]
  min?: number
  max?: number
  /** Step between values. Default 1; null = any value (mark-only snapping). */
  step?: number | null
  /** Explicit decimals to round to; default derives from step. */
  precision?: number
  disabled?: boolean
  /** Render the track right-to-left. */
  reverse?: boolean
  /** Render the track vertically (affects point↔percent math only). */
  vertical?: boolean
  /** Value labels on the marks. */
  marks?: SliderMark[]
  /** Only pickable values are the marks' (rc-slider marks-only mode). */
  marksOnly?: boolean
  /** Gate every write (drag/keyboard/pointer). */
  readonly?: boolean
  onChange?: (value: number) => void
  onRangeChange?: (value: [number, number]) => void
  /** Fired when a drag/keyboard interaction ENDS (antd onAfterChange). */
  onAfterChange?: (value: number | null | [number, number]) => void
  /** Form integration: rules for the enclosing Item. */
  rules?: FormFieldRule[]
}

export type SliderIns = {
  /** Single value (range mode: reports the PAIR through rangeValue). */
  value: () => number
  /** The [start, end] pair — single mode is [value, value]-tracked. */
  rangeValue: () => [number, number]
  /** True when configured for two thumbs. */
  isRange: () => boolean
  min: () => number
  max: () => number
  step: () => number
  isDisabled: () => boolean
  /** 0..100 position of a VALUE on the track (reverse aware). */
  percentOf: (value: number) => number
  /** Inverse: value at a 0..100 track position (step-snapped unless free). */
  valueAt: (percent: number) => number
  /** Which thumb a track position is closest to (0 = start, 1 = end). */
  nearestHandle: (percent: number) => 0 | 1
  /** Begin a drag at a percent; returns the handle being dragged. */
  beginDrag: (percent: number) => 0 | 1
  /** Pointer moved to a new percent (writes through, unrounded). */
  dragTo: (percent: number) => void
  /** Drag ended: snap to step/mark and fire onAfterChange. */
  endDrag: () => void
  isDragging: () => boolean
  draggingHandle: () => 0 | 1 | null
  /** Keyboard: arrows step (shift ×10 like rc-slider), Home/End snap. */
  stepHandle: (handle: 0 | 1, steps: number) => void
  snapToMin: (handle: 0 | 1) => void
  snapToMax: (handle: 0 | 1) => void
  /** Imperative single-value write (renderer-facing). */
  setValue: (value: number) => void
  setRangeValue: (value: [number, number]) => void
  /** Sorted marks + membership test (tick rendering). */
  marks: () => SliderMark[]
  isMarkAt: (value: number) => boolean
  /** The shared numeric machine (advanced composition). */
  core: () => NumericValueIns
}

export const createSlider = (config: SliderConfig = {}): SliderIns => {
  const rangeMode = () => config.rangeValue !== undefined || config.defaultRangeValue !== undefined

  const min = () => config.min ?? 0
  const max = () => config.max ?? 100
  const stepOrOne = () => config.step === null ? 1 : (config.step ?? 1)
  const isFree = () => config.step === null || config.marksOnly === true
  const isDisabled = () => !!config.disabled

  // The shared numeric machine. Range mode drives TWO of them? No — cleaner:
  // ONE machine holds the START value and the pair lives beside it; rc-slider
  // itself treats each handle as its own value context. We keep a second
  // signal for the end value and clamp both against each other.
  const startCore = createNumericValue({
    // Controlled: the START of the pair in range mode, the single value
    // otherwise. undefined flows through UNCONTROLLED — coercing to null
    // would freeze the widget in "controlled" mode.
    value: () => (config.rangeValue !== undefined ? config.rangeValue[0] : config.value),
    defaultValue:
      config.defaultRangeValue !== undefined ? config.defaultRangeValue[0]
      : config.defaultValue,
    min: () => min(),
    max: () => max(),
    step: () => stepOrOne(),
    precision: config.precision,
    disabled: () => isDisabled(),
    readonly: config.readonly ?? false,
    onChange: v => {
      if (v === null) return
      emitChange(v, _end())
    },
  })

  // ownedWrite: drags write from DOM move events — imperative entry points.
  // The end signal only matters in range mode; in single mode the start
  // core's value IS the thumb (the end mirrors it via rangeValue's memo).
  const [_end, _setEnd] = createSignal<number>(
    config.defaultRangeValue !== undefined ? config.defaultRangeValue[1] : (config.defaultValue ?? min()),
    { ownedWrite: true },
  )
  const [_draggingHandle, _setDraggingHandle] = createSignal<0 | 1 | null>(null, { ownedWrite: true })

  const controlledEnd = () => config.rangeValue?.[1]

  /** Effective [start, end] — controlled props win; range invariant holds:
   *  start ≤ end (writes clamp against each other). In single mode the
   *  start IS the value and the end just mirrors it (drag math is uniform). */
  const rangeValue = createMemo<[number, number]>(() => {
    if (!rangeMode()) {
      const v = startCore.value() ?? min()
      return [v, v]
    }
    const start = startCore.value() ?? min()
    const end = controlledEnd() !== undefined ? (controlledEnd() as number) : _end()
    return start <= end ? [start, end] : [end, start]
  })

  const value = createMemo(() => rangeValue()[0])

  const emitChange = (start: number, end: number) => {
    const [s, e] = start <= end ? [start, end] : [end, start]
    if (rangeMode()) {
      config.onRangeChange?.([s, e])
    } else {
      config.onChange?.(s)
    }
  }

  /** Snap a raw value to the pickable lattice: step multiples, or mark
   *  values in marks-only mode (rc-slider: closest mark wins). */
  const snap = (raw: number): number => {
    const lo = min(), hi = max()
    const clamped = Math.min(hi, Math.max(lo, raw))
    if (isFree()) {
      if (config.marksOnly === true && config.marks?.length) {
        // Closest mark value.
        let best = config.marks[0].value
        let bestDist = Infinity
        for (const m of config.marks) {
          const d = Math.abs(m.value - clamped)
          if (d < bestDist) { bestDist = d; best = m.value }
        }
        return best
      }
      return clamped
    }
    const s = stepOrOne()
    const steps = Math.round((clamped - lo) / s)
    return toFixedWithPrecision(lo + steps * s, config.precision ?? 100)
  }

  /** Reverse-aware percent: 0 at the visual start, 100 at the visual end. */
  const percentOf = (v: number) => {
    const lo = min(), hi = max()
    const span = hi - lo
    if (span === 0) return 0
    const pct = ((v - lo) / span) * 100
    return config.reverse ? 100 - pct : pct
  }

  /** Percent → value (snap-aware; drag passes `free` for 1:1 tracking). */
  const valueAt = (percent: number) => {
    const lo = min(), hi = max()
    let pct = percent
    if (config.reverse) pct = 100 - pct
    const raw = lo + (pct / 100) * (hi - lo)
    return snap(raw)
  }

  const nearestHandle = (percent: number): 0 | 1 => {
    const [s, e] = rangeValue()
    const ds = Math.abs(percentOf(s) - percent)
    const de = Math.abs(percentOf(e) - percent)
    if (!rangeMode()) return 0
    return ds <= de ? 0 : 1
  }

  const beginDrag = (percent: number): 0 | 1 => {
    if (isDisabled()) return nearestHandle(percent)
    const h = nearestHandle(percent)
    _setDraggingHandle(h)
    // NOTE: not dragTo(percent) — the _draggingHandle guard inside dragTo
    // would read the UNCOMMITTED signal in this same batch (Solid 2 rc
    // batches writes) and bail. Inline the first move with the handle we
    // just picked.
    applyHandleDrag(h, percent)
    return h
  }

  /** Shared drag math — called with the handle EXPLICITLY (batch-safe). */
  const applyHandleDrag = (h: 0 | 1, percent: number) => {
    const v = valueAt(percent)
    const [s, e] = rangeValue()
    if (h === 0) {
      if (rangeMode()) {
        // Keep the invariant start ≤ end.
        const clamped = Math.min(v, e)
        if (controlledEnd() === undefined) _setEnd(e)
        startCore.setValue(clamped)
        emitChange(clamped, e)
      } else {
        // Single mode: no end to clamp against — the value IS the thumb.
        startCore.setValue(v)
        emitChange(v, v)
      }
    } else {
      const clamped = Math.max(v, s)
      if (controlledEnd() === undefined) _setEnd(clamped)
      emitChange(s, clamped)
    }
  }

  const dragTo = (percent: number) => {
    if (isDisabled()) return
    const h = _draggingHandle()
    if (h === null) return
    applyHandleDrag(h, percent)
  }

  const endDrag = () => {
    const h = _draggingHandle()
    if (h === null) return
    _setDraggingHandle(null)
    // Snap in place (marks/step), then report.
    const [s, e] = rangeValue()
    const snappedS = snap(s)
    const snappedE = snap(e)
    startCore.setValue(snappedS)
    if (controlledEnd() === undefined) _setEnd(snappedE)
    emitChange(snappedS, snappedE)
    config.onAfterChange?.(rangeMode() ? [snappedS, snappedE] : snappedS)
  }

  const stepHandle = (handle: 0 | 1, steps: number) => {
    if (isDisabled()) return
    const [s, e] = rangeValue()
    if (handle === 0) {
      const target = Math.min(s + steps * stepOrOne(), rangeMode() ? e : max())
      const snapped = snap(target)
      startCore.setValue(snapped)
      emitChange(snapped, e)
    } else {
      const target = Math.max(e + steps * stepOrOne(), s)
      const snapped = snap(target)
      if (controlledEnd() === undefined) _setEnd(snapped)
      emitChange(s, snapped)
    }
  }

  const snapToMin = (handle: 0 | 1) => {
    if (isDisabled()) return
    if (handle === 0) {
      startCore.setValue(min())
      emitChange(min(), _end())
    } else {
      if (controlledEnd() === undefined) _setEnd(min())
      emitChange(startCore.value() ?? min(), min())
    }
  }

  const snapToMax = (handle: 0 | 1) => {
    if (isDisabled()) return
    if (handle === 0) {
      startCore.setValue(max())
      emitChange(max(), _end())
    } else {
      if (controlledEnd() === undefined) _setEnd(max())
      emitChange(startCore.value() ?? min(), max())
    }
  }

  const setValue = (v: number) => {
    if (isDisabled()) return
    const snapped = snap(v)
    startCore.setValue(snapped)
    emitChange(snapped, snapped)
  }

  const setRangeValue = (pair: [number, number]) => {
    if (isDisabled()) return
    const [s, e] = pair[0] <= pair[1] ? pair : [pair[1], pair[0]]
    const snappedS = snap(s)
    const snappedE = snap(e)
    startCore.setValue(snappedS)
    if (controlledEnd() === undefined) _setEnd(snappedE)
    emitChange(snappedS, snappedE)
  }

  const marks = createMemo(() =>
    [...(config.marks ?? [])].sort((a, b) => a.value - b.value),
  )

  const isMarkAt = (v: number) =>
    config.marks?.some(m => m.value === v) ?? false

  return {
    value,
    rangeValue,
    isRange: rangeMode,
    min,
    max,
    step: stepOrOne,
    isDisabled,
    percentOf,
    valueAt,
    nearestHandle,
    beginDrag,
    dragTo,
    endDrag,
    isDragging: () => _draggingHandle() !== null,
    draggingHandle: () => _draggingHandle(),
    stepHandle,
    snapToMin,
    snapToMax,
    setValue,
    setRangeValue,
    marks,
    isMarkAt,
    core: () => startCore,
  }
}

export const sliderSplits: (keyof SliderConfig)[] = [
  'value', 'defaultValue', 'rangeValue', 'defaultRangeValue',
  'min', 'max', 'step', 'precision', 'disabled', 'reverse', 'vertical',
  'marks', 'marksOnly',
]
