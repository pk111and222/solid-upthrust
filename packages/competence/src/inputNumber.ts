import { createEffect, createMemo, createSignal, untrack } from "solid-js";

/**
 * Headless numeric editing and stepping for InputNumber:
 *
 *  - VALUE STATE: committed number/null and lexical draft are separate.
 *    Valid text commits live; incomplete unparseable text stays draft-only
 *    until blur. A trailing decimal point parses but remains visible.
 *  - PARSING: `parser` (string → string) runs BEFORE numeric parsing
 *    (e.g. strips currency symbols); `formatter` (number → string)
 *    renders the display text. Both optional.
 *  - STEPPING: step (default 1) with shiftMultiplier (default 10, Shift+Up
 *    multiplies); up()/down() clamp into [min, max] and round to `precision`
 *    (explicit precision wins; otherwise preserves value/step decimals).
 *  - KEYBOARD: the renderer forwards ArrowUp/ArrowDown to up()/down(); this
 *    layer owns no DOM listeners.
 *  - COMMIT: onBlur the buffer re-parses and snaps into range;
 *    the out-of-range flag colors the
 *    text red while typing.
 */
import type { FormFieldRule } from "./formField";

export type InputNumberParser = (text: string) => string
export type InputNumberFormatter = (value: number) => string

export type InputNumberConfig = {
  /** Controlled numeric value; undefined = uncontrolled. */
  value?: number | null
  defaultValue?: number | null
  min?: number
  max?: number
  /** Increment per step. Default 1. */
  step?: number | number[]
  /** Multiplier when stepping with Shift held. Default 10. */
  shiftMultiplier?: number
  /** Explicit decimals; otherwise preserve value and step precision. */
  precision?: number
  /** Runs on raw input text BEFORE numeric parsing. */
  parser?: InputNumberParser
  /** Renders the display text from a committed number. */
  formatter?: InputNumberFormatter
  disabled?: boolean
  readonly?: boolean
  onChange?: (value: number | null) => void
  onStep?: (value: number, info: { offset: number; type: 'up' | 'down' }) => void
  onFocus?: () => void
  onBlur?: () => void
  /** Form integration: rules for the enclosing Item. */
  rules?: FormFieldRule[]
}

export type InputNumberIns = {
  /** The committed numeric value (null when empty/unparseable). */
  value: () => number | null
  /** The raw input buffer — what the text field shows while focused. */
  textValue: () => string
  /** Display text: the buffer while focused, formatter(value) otherwise. */
  displayValue: () => string
  /** True while the buffer parses out of [min, max] (red text hint). */
  outOfRange: () => boolean
  isFocused: () => boolean
  /** Replace the buffer from a typing event; commits when parseable. */
  setInputText: (text: string) => void
  up: (multiplied?: boolean) => void
  down: (multiplied?: boolean) => void
  /** Blur-time snap: re-parse, clamp, format. */
  commit: () => void
  notifyFocus: () => void
  setValue: (value: number | null) => void
  isDisabled: () => boolean
  isReadonly: () => boolean
  /** Whether the up/down actions are currently available. */
  canUp: () => boolean
  canDown: () => boolean
}

/** Count fractional digits, including scientific notation such as 1.5e-7. */
const decimalPlaces = (value: number): number => {
  const [coefficient, exponent = '0'] = String(value).toLowerCase().split('e')
  return Math.max(0, (coefficient.split('.')[1]?.length ?? 0) - Number(exponent))
}
const round = (value: number, precision: number): number =>
  Number(value.toFixed(Number.isFinite(precision) ? Math.max(0, Math.min(100, Math.trunc(precision))) : 0))

type Draft = { text: string; anchor: number | null; parsed: number | null }

export const createInputNumber = (config: InputNumberConfig = {}): InputNumberIns => {
  // DOM handlers are imperative entry points outside a reactive owner.
  const [internal, setInternal] = createSignal<number | null>(
    untrack(() => config.defaultValue ?? null), { ownedWrite: true },
  )
  const [draft, setDraft] = createSignal<Draft | null>(null, { ownedWrite: true })
  const [focused, setFocused] = createSignal(false, { ownedWrite: true })
  const value = createMemo(() => config.value !== undefined ? config.value : internal())
  createEffect(() => config.value, current => untrack(() => {
    const edit = draft()
    if (!edit) return
    if (current === edit.parsed) setDraft({ ...edit, anchor: current })
    else if (current !== edit.anchor) setDraft(null)
  }))
  const blocked = () => !!config.disabled || !!config.readonly
  const parse = (raw: string): number | null => {
    const prepared = config.parser ? config.parser(raw) : raw
    const cleaned = prepared.replace(/[^\d.eE+-]/g, '')
    if (!cleaned.trim() || cleaned === '-') return null
    const number = Number(cleaned)
    return Number.isFinite(number) ? number : null
  }
  const format = (number: number | null) => number === null ? '' : config.formatter ? config.formatter(number) : String(number)
  // A new controlled value supersedes a stale draft, while accepting the
  // parsed value keeps incomplete lexical forms (e.g. "1.") editable.
  const activeDraft = () => {
    const edit = draft()
    return edit && (config.value === undefined || value() === edit.anchor || value() === edit.parsed) ? edit : null
  }
  const displayValue = createMemo(() => focused() && activeDraft() ? activeDraft()!.text : format(value()))
  const outOfRange = createMemo(() => {
    const number = activeDraft()?.parsed ?? value()
    return number !== null && ((config.min !== undefined && number < config.min) || (config.max !== undefined && number > config.max))
  })
  const clamp = (number: number) => Math.min(config.max ?? Infinity, Math.max(config.min ?? -Infinity, number))
  const emitChange = (next: number | null) => {
    const previous = value()
    if (config.value === undefined) setInternal(next)
    if (next !== previous) config.onChange?.(next)
  }
  const canUp = () => !blocked() && (config.max === undefined || value() === null || value()! < config.max)
  const canDown = () => !blocked() && (config.min === undefined || value() === null || value()! > config.min)
  const stepBy = (direction: 1 | -1, multiplied: boolean) => {
    if (direction === 1 ? !canUp() : !canDown()) return
    // Legacy array input is retained as a unit step; it is not a stop list.
    const base = Array.isArray(config.step) ? 1 : (config.step ?? 1)
    const amount = base * (multiplied ? (config.shiftMultiplier ?? 10) : 1)
    if (!Number.isFinite(amount) || amount <= 0) return
    const previous = value()
    const start = previous ?? config.min ?? 0
    const precision = config.precision ?? Math.max(decimalPlaces(start), decimalPlaces(amount))
    const next = clamp(round(start + direction * amount, precision))
    setDraft(null)
    if (next === previous) return
    emitChange(next)
    config.onStep?.(next, { offset: next - (previous ?? 0), type: direction === 1 ? 'up' : 'down' })
  }
  const setInputText = (text: string) => {
    if (blocked()) return
    const parsed = parse(text)
    setDraft({ text, parsed, anchor: value() })
    if (text.trim() === '' || text === '-') emitChange(null)
    else if (parsed !== null) emitChange(parsed)
  }
  const commit = () => {
    const edit = activeDraft()
    setFocused(false)
    if (!blocked()) {
      const parsed = edit ? parse(edit.text) : value()
      const next = parsed === null ? null : clamp(config.precision === undefined ? parsed : round(parsed, config.precision))
      emitChange(next)
    }
    setDraft(null)
    config.onBlur?.()
  }
  const notifyFocus = () => {
    setDraft(null)
    setFocused(true)
    config.onFocus?.()
  }
  const setValue = (next: number | null) => { setDraft(null); emitChange(next) }
  return {
    value, displayValue, outOfRange,
    textValue: () => activeDraft()?.text ?? format(value()),
    isFocused: focused, setInputText,
    up: (multiplied = false) => stepBy(1, multiplied),
    down: (multiplied = false) => stepBy(-1, multiplied),
    commit, notifyFocus, setValue,
    isDisabled: () => !!config.disabled,
    isReadonly: () => !!config.readonly,
    canUp, canDown,
  }
}

export const inputNumberSplits: (keyof InputNumberConfig)[] = [
  'value', 'defaultValue', 'min', 'max', 'step', 'shiftMultiplier',
  'precision', 'parser', 'formatter', 'disabled', 'readonly',
]
