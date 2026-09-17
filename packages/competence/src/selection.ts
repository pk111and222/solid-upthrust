import { createEffect, createMemo, createSignal } from "solid-js";

/**
 * SHARED NUMERIC CORE — the value machine under InputNumber / Slider / Rate.
 *
 * All three widgets are the same problem wearing different clothes: pick a
 * number inside [min, max] in `step` increments, controlled-or-uncontrolled,
 * with a formatter layer for display. What differs is the INTERACTION
 * surface (typing+steppers / track dragging / star clicking) — and those
 * live in the widgets, not here.
 *
 *  - VALUE: controlled `value` wins over the internal signal; `null` means
 *    "empty" (InputNumber clears, Slider/Rate just never see it).
 *  - CLAMP: every write snaps into [min, max]; `step`/`precision` round on
 *    COMMIT only — intermediate drag positions stay raw so the thumb
 *    follows the pointer 1:1.
 *  - COMMIT vs PENDING: `setValue` is a live write (dragging), `commit`
 *    snaps (rounding + range) — InputNumber's blur snap and Slider's
 *    drag-end both map onto commit.
 *  - SNAPPING: stepToIndex/index map between value space and evenly spaced
 *    tick indexes — Rate (1..count stars) and marked Sliders are index
 *    machines, Slider/Rate UIs ride on them.
 */
import type { FormFieldRule } from "./formField";

export type NumericValueConfig = {
  /** Controlled numeric value; undefined = uncontrolled. Getter form so
   *  wrappers (Slider/Rate translate live props) can feed it reactively. */
  value?: number | null | (() => number | null | undefined)
  defaultValue?: number | null
  min?: number | (() => number)
  max?: number | (() => number)
  /** Increment per step. Default 1. */
  step?: number | (() => number)
  /** Explicit decimals to round to on commit; default derives from step. */
  precision?: number
  disabled?: boolean | (() => boolean)
  readonly?: boolean
  onChange?: (value: number | null) => void
  /** Form integration: rules for the enclosing Item. */
  rules?: FormFieldRule[]
}

export type NumericValueIns = {
  /** The effective (controlled-aware) value. */
  value: () => number | null
  min: () => number
  max: () => number
  step: () => number
  /** Live write: clamps to range but does NOT round to precision (drags). */
  setValue: (value: number | null) => void
  /** Snap write: clamps AND rounds to precision (blur / drag end). */
  commitValue: (value: number | null) => void
  /** Snap the CURRENT value in place (InputNumber blur). */
  commit: () => void
  /** Step by ±n steps (clamped). Keyboard arrows / steppers ride on this. */
  stepBy: (steps: number) => void
  /** Map a value into the nearest evenly-spaced tick index (0-based). */
  index: (value?: number | null) => number
  /** Map a 0-based tick index back to its value (step-snapped). */
  stepToIndex: (index: number) => number
  isDisabled: () => boolean
  isReadonly: () => boolean
  isAtMin: () => boolean
  isAtMax: () => boolean
}

/**
 * Decimals implied by a step value (antd getPrecision): 0.1 → 1, 0.01 → 2.
 */
export const stepPrecision = (step: number): number => {
  const str = String(step)
  const dot = str.indexOf('.')
  if (dot === -1) return 0
  // Exponent form (1e-7) — count the negative exponent instead.
  const exp = str.indexOf('e')
  if (exp !== -1) {
    const expNum = Number(str.slice(exp + 1))
    if (expNum < 0) return -expNum
    return 0
  }
  return str.length - dot - 1
}

export const toFixedWithPrecision = (value: number, precision: number): number =>
  Number(value.toFixed(Math.min(precision, 100)))

export const createNumericValue = (config: NumericValueConfig = {}): NumericValueIns => {
  // ownedWrite: user intents (drag, click, keystroke) arrive as imperative
  // DOM callbacks outside any reactive owner.
  const [_value, _setValue] = createSignal<number | null>(
    config.defaultValue ?? null,
    { ownedWrite: true },
  )

  // Getter-or-literal accessors: wrappers may pass reactive getters.
  const readNum = (v: unknown, fallback: number): number =>
    typeof v === 'function' ? (v as () => number)() : (v as number | undefined) ?? fallback
  const readValue = (): number | null | undefined =>
    typeof config.value === 'function' ? (config.value as () => number | null | undefined)() : config.value

  const min = () => readNum(config.min, -Infinity)
  const max = () => readNum(config.max, Infinity)
  const step = () => readNum(config.step, 1)

  const value = createMemo<number | null>(() => {
    const controlled = readValue()
    return controlled !== undefined ? controlled : _value()
  })

  const precision = createMemo(() => {
    if (config.precision !== undefined) return config.precision
    return stepPrecision(step())
  })

  const clamp = (num: number): number => Math.min(max(), Math.max(min(), num))

  const emit = (next: number | null) => {
    if (readValue() === undefined) {
      _setValue(next)
    }
    config.onChange?.(next)
  }

  const isDisabled = () => {
    const d = config.disabled
    return typeof d === 'function' ? d() : !!d
  }
  const isReadonly = () => {
    return !!config.readonly
  }

  /** Live write for continuous interactions (drag). Clamps but keeps raw
   *  decimals so the thumb tracks the pointer exactly; rounding happens at
   *  commit time. No-op when gated. */
  const setValue = (next: number | null) => {
    if (isDisabled() || isReadonly()) return
    if (next === null) {
      if (value() !== null) emit(null)
      return
    }
    const clamped = clamp(next)
    if (clamped === value()) return
    emit(clamped)
  }

  /** Snap write: clamp + round to precision. Terminal actions (blur,
   *  drag-end, keyboard step) all land here — antd rounds on commit. */
  const commitValue = (next: number | null) => {
    if (isDisabled() || isReadonly()) return
    if (next === null) {
      if (value() !== null) emit(null)
      return
    }
    const rounded = toFixedWithPrecision(clamp(next), precision())
    if (rounded === value()) return
    emit(rounded)
  }

  /** Snap the CURRENT value in place (InputNumber's blur on a typed buffer
   *  has already written it via setValue; this just rounds/clamps). */
  const commit = () => {
    const v = value()
    if (v === null) return
    const rounded = toFixedWithPrecision(clamp(v), precision())
    if (rounded !== v) emit(rounded)
  }

  /** Move by n steps (negative = down). Uses the CURRENT value as base;
   *  empty starts at min (or 0) — antd semantics. Always commits (rounded). */
  const stepBy = (steps: number) => {
    if (isDisabled() || isReadonly() || steps === 0) return
    const base = value()
    const start = base === null ? (Number.isFinite(min()) ? min() : 0) : base
    const raw = start + steps * step()
    const rounded = toFixedWithPrecision(clamp(raw), precision())
    if (rounded === value()) return
    emit(rounded)
  }

  /** Value → nearest evenly spaced tick index (0-based). Rate's stars and
   *  step-sliders are index machines: index = round((v - min) / step). */
  const index = (v?: number | null) => {
    const cur = v === undefined ? value() : v
    if (cur === null || !Number.isFinite(cur)) return 0
    const s = step()
    return Math.round((cur - min()) / s)
  }

  /** Tick index → value (clamped into range, NOT precision-rounded — the
   *  caller commits when the interaction ends). */
  const stepToIndex = (i: number) => clamp(min() + i * step())

  const isAtMin = createMemo(() => {
    const v = value()
    return v !== null && v <= min()
  })
  const isAtMax = createMemo(() => {
    const v = value()
    return v !== null && v >= max()
  })

  return {
    value,
    min,
    max,
    step,
    setValue,
    commitValue,
    commit,
    stepBy,
    index,
    stepToIndex,
    isDisabled,
    isReadonly,
    isAtMin,
    isAtMax,
  }
}

export const numericValueSplits: (keyof NumericValueConfig)[] = [
  'value', 'defaultValue', 'min', 'max', 'step', 'precision', 'disabled', 'readonly',
]

// ---------------------------------------------------------------------------
// SHARED SELECTION CORE — the option machine under Radio.Group /
// Checkbox.Group / (future) Select.
//
// The observation the whole file hangs on: "pick exactly one option" and
// "pick any subset of options" are the same machine with a different
// cardinality constraint. Select will need BOTH (single select = radio
// semantics, multiple = checkbox semantics) plus an open/close layer on
// top — so the option bookkeeping lives HERE, once, and each widget
// constrains it:
//
//   createRadioGroup   → selection with maxSelect = 1 (replace semantics)
//   createCheckboxGroup→ selection with unlimited cardinality (toggle)
//   Select (future)    → either cardinality + trigger/dropdown machinery
//
// Keys are compared by === (string | number), the same key space antd uses
// for option values. The store never touches the DOM or focus; traversal
// (arrow keys inside a listbox) is a widget concern.
// ---------------------------------------------------------------------------

export type SelectionOption = {
  label: string
  value: string | number
  disabled?: boolean
}

export type SelectionConfig = {
  /** Controlled selected keys; undefined = uncontrolled. Getter form so
   *  wrappers (RadioGroup's single-key API) can translate live props. */
  value?: Array<string | number> | (() => Array<string | number> | undefined)
  defaultValue?: Array<string | number>
  options?: SelectionOption[]
  disabled?: boolean
  /**
   * Max simultaneously selectable keys. 1 = radio semantics (a new pick
   * REPLACES the old one); Infinity = checkbox semantics.
   */
  maxSelect?: number
  /** Whether an already-selected key can be deselected. Radio = false. */
  allowDeselect?: boolean
  onChange?: (value: Array<string | number>) => void
  /** Form integration: rules for the enclosing Item. */
  rules?: FormFieldRule[]
}

export type SelectionIns = {
  value: () => Array<string | number>
  options: () => SelectionOption[]
  isSelected: (value: string | number) => boolean
  isDisabled: (value: string | number) => boolean
  /** Toggle/add/replace per the cardinality rules. Returns the new value. */
  select: (value: string | number) => Array<string | number>
  deselect: (value: string | number) => Array<string | number>
  /** Replace the whole selection atomically (one onChange). Card-linked
   *  bulk toggles (Cascader's parent check) need this: per-key select
   *  loops read a STALE value inside a Solid 2 batch and clobber each
   *  other. maxSelect still applies: extra keys are dropped. */
  replaceAll: (values: Array<string | number>) => Array<string | number>
  clear: () => Array<string | number>
  /** Everything checked? (group "check all" indeterminate logic). */
  isAllSelected: () => boolean
  /** Some but not all enabled options selected? */
  isIndeterminate: () => boolean
  /** The enabled option keys (disabled options are skipped by bulk ops). */
  enabledValues: () => Array<string | number>
}

/** Normalize the controlled prop: plain array or getter (RadioGroup's
 *  single-key wrapper passes a getter that translates live). */
const controlledValue = (config: SelectionConfig): Array<string | number> | undefined => {
  const v = typeof config.value === 'function' ? (config.value as () => Array<string | number> | undefined)() : config.value
  return v
}

export const createSelection = (config: SelectionConfig = {}): SelectionIns => {
  // CONTROLLED MIRROR: instead of reading the controlled getter inside the
  // value memo (a chain of UI-layer proxies whose tracking proved fragile
  // in the browser — a controlled parent flipping to undefined did not
  // re-run the memo and the store served a stale value), the controlled
  // value is mirrored into the internal signal: synchronously at creation
  // (so the very first read is correct) and through an effect on every
  // change. value() reads ONLY the internal signal; emit writes it and
  // calls onChange — the same storeRef-sync-mirror pattern the form
  // engine uses.
  const initialControlled = controlledValue(config)
  const [_value, _setValue] = createSignal<Array<string | number>>(
    initialControlled ?? config.defaultValue ?? [],
    { ownedWrite: true },
  )

  if (typeof config.value === 'function') {
    createEffect(
      () => (config.value as () => Array<string | number> | undefined)(),
      (controlled) => {
        if (controlled !== undefined) {
          _setValue(controlled)
        }
      },
    )
  }

  const value = createMemo<Array<string | number>>(() => _value())

  const options = () => config.options ?? []
  const maxSelect = () => config.maxSelect ?? Infinity
  const allowDeselect = () => config.allowDeselect ?? true

  const isDisabled = (v: string | number) => {
    if (config.disabled) return true
    return options().some(o => o.value === v && o.disabled)
  }

  const isSelected = (v: string | number) => value().includes(v)

  const emit = (next: Array<string | number>) => {
    // Mirror pattern: the internal signal IS the value; write it always so
    // the UI reflects the intent immediately (a controlled parent that
    // ignores the change gets overwritten by the mirror effect when its
    // value updates).
    _setValue(next)
    config.onChange?.(next)
    return next
  }

  const select = (v: string | number): Array<string | number> => {
    if (isDisabled(v)) return value()
    const cur = value()
    if (cur.includes(v)) {
      // Already selected: deselect when allowed (checkbox semantics).
      if (allowDeselect()) return deselect(v)
      return cur
    }
    if (maxSelect() === 1) {
      // Radio semantics: replace.
      return emit([v])
    }
    if (cur.length >= maxSelect()) {
      // At cardinality cap and the key is new — drop nothing (antd's
      // Checkbox keeps the old set; Select.multiple ignores the click).
      return cur
    }
    return emit([...cur, v])
  }

  const deselect = (v: string | number): Array<string | number> => {
    if (isDisabled(v)) return value()
    return emit(value().filter(x => x !== v))
  }

  const replaceAll = (values: Array<string | number>): Array<string | number> => {
    // Bulk write: one emit, one onChange. maxSelect caps the result (keep
    // the FIRST maxSelect keys). Disabled keys are filtered like select().
    const allowed = values.filter(v => !isDisabled(v))
    const capped = maxSelect() === Infinity ? allowed : allowed.slice(0, maxSelect())
    return emit(capped)
  }

  const clear = (): Array<string | number> => {
    // Keep individually disabled options' membership untouched (they cannot
    // be re-selected by the user, so stripping them would lose state).
    const kept = value().filter(v => isDisabled(v))
    return emit(kept)
  }

  const enabledValues = () => options().filter(o => !o.disabled).map(o => o.value)

  const isAllSelected = createMemo(() => {
    const enabled = enabledValues()
    if (!enabled.length) return false
    return enabled.every(v => value().includes(v))
  })

  const isIndeterminate = createMemo(() =>
    !isAllSelected() && value().some(v => enabledValues().includes(v)),
  )

  return {
    value,
    options,
    isSelected,
    isDisabled,
    select,
    deselect,
    replaceAll,
    clear,
    isAllSelected,
    isIndeterminate,
    enabledValues,
  }
}

export const selectionSplits: (keyof SelectionConfig)[] = [
  'value', 'defaultValue', 'options', 'disabled',
]
