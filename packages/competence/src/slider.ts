import { createMemo, createSignal, untrack } from "solid-js";

/** Slider adds range, snapping and interaction boundaries to the numeric core. */
import { createNumericValue, type NumericValueIns } from "./selection";
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
  /** Step between values. Default 1; null = free values. marksOnly enables mark snapping. */
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
  beginDrag: (percent: number, handle?: 0 | 1) => 0 | 1
  /** Pointer moved to a new percent (snaps before notifying). */
  dragTo: (percent: number) => void
  /** Drag ended: fire onAfterChange with the accepted value. */
  endDrag: () => void
  /** Cancel without a completion callback (unmount/pointer cancellation). */
  cancelDrag: () => void
  /** Complete a keyboard interaction using the accepted value. */
  finishInteraction: () => void
  isDragging: () => boolean
  draggingHandle: () => 0 | 1 | null
  /** Keyboard: step count, including accelerated steps; Home/End snap. */
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

const decimals = (value: number) => {
  const [base, exponent = '0'] = String(value).toLowerCase().split('e')
  return Math.max(0, (base.split('.')[1]?.length ?? 0) - Number(exponent))
}

export const createSlider = (config: SliderConfig = {}): SliderIns => {
  const rangeMode = () => config.rangeValue !== undefined || config.defaultRangeValue !== undefined
  const min = () => config.min ?? 0
  const max = () => Math.max(min(), config.max ?? 100)
  const stepOrOne = () => typeof config.step === 'number' && Number.isFinite(config.step) && config.step > 0 ? config.step : 1
  const blocked = () => !!config.disabled || !!config.readonly
  const clamp = (value: number) => Math.min(max(), Math.max(min(), Number.isFinite(value) ? value : min()))
  const marks = createMemo(() => {
    const unique = new Map<number, SliderMark>()
    for (const mark of config.marks ?? []) {
      if (Number.isFinite(mark.value) && mark.value >= min() && mark.value <= max() && !unique.has(mark.value)) unique.set(mark.value, mark)
    }
    return [...unique.values()].sort((a,b) => a.value - b.value)
  })
  const snap = (raw: number): number => {
    const value = clamp(raw)
    if (config.marksOnly && marks().length) {
      return marks().reduce((best, mark) => Math.abs(mark.value-value) < Math.abs(best.value-value) ? mark : best).value
    }
    if (config.step === null || config.marksOnly) return value
    if (value === min() || value === max()) return value
    const step = stepOrOne()
    const precision = config.precision ?? Math.max(decimals(step), decimals(min()))
    const digits = Number.isFinite(precision) ? Math.min(100, Math.max(0, Math.trunc(precision))) : 0
    const index = (value-min())/step
    const roundedIndex = Math.round(index + Number.EPSILON*Math.abs(index)*2)
    return clamp(Number((min()+roundedIndex*step).toFixed(digits)))
  }
  const initial = untrack(() => {
    const pair = config.defaultRangeValue ?? [config.defaultValue ?? min(), config.defaultValue ?? min()]
    return [snap(Math.min(...pair)), snap(Math.max(...pair))] as [number,number]
  })
  const [end, setEnd] = createSignal(initial[1], { ownedWrite:true })
  let writing = false
  const startCore = createNumericValue({
    value: () => rangeMode() ? (config.rangeValue ? Math.min(...config.rangeValue) : undefined) : config.value,
    defaultValue: initial[0], min, max, step:stepOrOne,
    get precision() { return config.precision },
    disabled: () => !!config.disabled,
    get readonly() { return config.readonly },
    onChange: next => { if (!writing && next !== null) emit(next, end()) },
  })
  const rangeValue = createMemo<[number,number]>(() => {
    const start = snap(startCore.value() ?? min())
    if (!rangeMode()) return [start,start]
    const finish = snap(config.rangeValue ? Math.max(...config.rangeValue) : end())
    return start <= finish ? [start,finish] : [finish,start]
  })
  const value = () => rangeValue()[0]
  const emit = (start: number, finish: number) => {
    if (rangeMode()) config.onRangeChange?.([Math.min(start,finish),Math.max(start,finish)])
    else config.onChange?.(start)
  }
  const write = (start: number, finish: number) => {
    if (blocked()) return
    const before = rangeValue()
    if (!rangeMode()) finish = start
    if (start === before[0] && finish === before[1]) return
    writing = true
    try { startCore.setValue(start) } finally { writing = false }
    if (config.rangeValue === undefined) setEnd(finish)
    emit(start,finish)
  }
  const writeHandle = (handle: 0 | 1, raw: number) => {
    const [start,finish] = rangeValue(), next = snap(raw)
    if (!rangeMode()) { write(next,next); return }
    if (handle === 0) write(Math.min(next,finish),finish)
    else write(start,Math.max(next,start))
  }
  const percentOf = (raw: number) => {
    if (max() === min()) return 0
    const percent = (clamp(raw)-min())/(max()-min())*100
    return config.reverse ? 100-percent : percent
  }
  const valueAt = (percent: number) => snap(min() + (config.reverse ? 100-percent : percent)/100*(max()-min()))
  const nearestHandle = (percent:number):0|1 => !rangeMode() || Math.abs(percentOf(rangeValue()[0])-percent) <= Math.abs(percentOf(rangeValue()[1])-percent) ? 0 : 1
  const [draggingHandle, setDraggingHandle] = createSignal<0|1|null>(null,{ownedWrite:true})
  let active: 0|1|null = null
  const cancelDrag = () => { active=null;setDraggingHandle(null) }
  const finishInteraction = () => { if (!blocked()) config.onAfterChange?.(rangeMode() ? rangeValue() : value()) }
  const beginDrag = (percent:number, handle?:0|1):0|1 => {
    const chosen = handle ?? nearestHandle(percent)
    if (blocked()) return chosen
    active = chosen;setDraggingHandle(chosen);writeHandle(chosen,valueAt(percent));return chosen
  }
  const dragTo = (percent:number) => { if (active !== null && !blocked()) writeHandle(active,valueAt(percent)) }
  const endDrag = () => { if (active === null) return;cancelDrag();finishInteraction() }
  const stepHandle = (handle:0|1, steps:number) => {
    if (blocked() || steps === 0) return
    const current = rangeValue()[handle]
    if (config.marksOnly && marks().length) {
      const candidates = marks().filter(mark => steps > 0 ? mark.value > current : mark.value < current)
      if (steps < 0) candidates.reverse()
      if (candidates.length) writeHandle(handle,candidates[Math.min(candidates.length-1,Math.max(0,Math.abs(Math.trunc(steps))-1))].value)
    } else writeHandle(handle,current+steps*stepOrOne())
  }
  return {
    value, rangeValue, isRange:rangeMode, min, max, step:stepOrOne,
    isDisabled: () => !!config.disabled,
    percentOf,valueAt,nearestHandle,beginDrag,dragTo,endDrag,cancelDrag,finishInteraction,
    isDragging: () => draggingHandle() !== null, draggingHandle,
    stepHandle, snapToMin: handle => writeHandle(handle,min()), snapToMax: handle => writeHandle(handle,max()),
    setValue: next => writeHandle(0,next),
    setRangeValue: pair => write(snap(Math.min(...pair)),snap(Math.max(...pair))),
    marks, isMarkAt: next => marks().some(mark => mark.value === next), core: () => startCore,
  }
}

export const sliderSplits: (keyof SliderConfig)[] = [
  'value', 'defaultValue', 'rangeValue', 'defaultRangeValue',
  'min', 'max', 'step', 'precision', 'disabled', 'reverse', 'vertical',
  'marks', 'marksOnly', 'readonly',
]
