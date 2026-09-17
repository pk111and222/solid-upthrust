import { createMemo, createSignal } from "solid-js";

/**
 * Headless logic for InputNumber — the rc-input-number core subset:
 *
 *  - VALUE STATE: controlled-or-uncontrolled numeric value. The internal
 *    buffer is the RAW INPUT TEXT (string | null), so typing "1." or "-"
 *    half-typed numbers doesn't commit garbage; `value` only reports a
 *    parsed number when the buffer is a complete valid number.
 *  - PARSING: `parser` (string → string) runs BEFORE numeric parsing
 *    (antd: strips currency symbols etc.); `formatter` (number → string)
 *    renders the display text. Both optional.
 *  - STEPPING: step (default 1) with shiftMultiplier (default 10, Shift+Up
 *    multiplies); up()/down() clamp into [min, max] and round to `precision`
 *    (explicit precision wins; otherwise derived from step's decimals).
 *  - KEYBOARD: the renderer forwards ArrowUp/ArrowDown to up()/down(); this
 *    layer owns no DOM listeners.
 *  - COMMIT: onBlur the buffer re-parses and snaps into range (antd: an
 *    out-of-range input clamps on blur); the out-of-range flag colors the
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
  /** Explicit decimals to round to; default derives from step's precision. */
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

const isEmptyBuffer = (text: string) => text === '' || text === '-'

/**
 * Number of decimals implied by a step value (antd getPrecision): 0.1 → 1,
 * 0.01 → 2, 1 → 0.
 */
const stepPrecision = (step: number): number => {
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

const toFixedWithPrecision = (value: number, precision: number): number =>
  Number(value.toFixed(Math.min(precision, 100)))

export const createInputNumber = (config: InputNumberConfig = {}): InputNumberIns => {
  // ownedWrite: typing/stepping/blur fire from DOM events — imperative
  // entry points outside any reactive owner.
  const [_buffer, _setBuffer] = createSignal<string | null>(
    config.defaultValue === null || config.defaultValue === undefined
      ? null
      : String(config.defaultValue),
    { ownedWrite: true },
  )
  const [_focused, _setFocused] = createSignal(false, { ownedWrite: true })

  const parseBuffer = (raw: string): number | null => {
    const prepared = config.parser ? config.parser(raw) : raw
    const cleaned = prepared.replace(/[^\d.eE+-]/g, '')
    if (cleaned === '' || isEmptyBuffer(cleaned)) return null
    const num = Number(cleaned)
    return Number.isFinite(num) ? num : null
  }

  const value = createMemo<number | null>(() => {
    if (config.value !== undefined) return config.value
    const raw = _buffer()
    if (raw === null || isEmptyBuffer(raw)) return null
    return parseBuffer(raw)
  })

  const effectivePrecision = createMemo(() => {
    if (config.precision !== undefined) return config.precision
    const step = Array.isArray(config.step) ? 1 : (config.step ?? 1)
    return stepPrecision(step)
  })

  const clamp = (num: number): number => {
    let out = num
    if (config.min !== undefined) out = Math.max(config.min, out)
    if (config.max !== undefined) out = Math.min(config.max, out)
    return out
  }

  const stepBase = (): number => {
    if (Array.isArray(config.step)) return 1
    return config.step ?? 1
  }

  const emitChange = (next: number | null) => {
    if (config.value === undefined) {
      _setBuffer(next === null ? null : String(next))
    }
    config.onChange?.(next)
  }

  const outOfRange = createMemo(() => {
    const v = value()
    if (v === null) return false
    if (config.min !== undefined && v < config.min) return true
    if (config.max !== undefined && v > config.max) return true
    return false
  })

  /** Display text: while focused show what the user typed; else the
   *  formatted committed value (empty when null). */
  const displayValue = createMemo(() => {
    if (_focused()) {
      // Controlled mode: the buffer holds only what the USER typed. Stepping
      // in controlled mode never writes the buffer (the parent owns state),
      // so a stale/null buffer would blank the field mid-interaction — fall
      // back to the formatted controlled value when the buffer is empty.
      const raw = _buffer()
      if (raw !== null && !isEmptyBuffer(raw)) return raw
      const v = value()
      if (v === null) return ''
      return config.formatter ? config.formatter(v) : String(v)
    }
    const v = value()
    if (v === null) return ''
    return config.formatter ? config.formatter(v) : String(v)
  })

  const currentOrDefault = (): number => {
    const v = value()
    if (v !== null) return v
    // Empty field stepping starts from min (or 0) — antd semantics.
    if (config.min !== undefined) return config.min
    return 0
  }

  const stepBy = (direction: 1 | -1, multiplied: boolean) => {
    if (config.disabled || config.readonly) return
    const base = stepBase()
    const stepValue = multiplied
      ? base * (config.shiftMultiplier ?? 10)
      : base
    const raw = currentOrDefault() + direction * stepValue
    const clamped = clamp(raw)
    const rounded = toFixedWithPrecision(clamped, effectivePrecision())
    if (rounded === value()) return
    // Always mirror the stepped value into the buffer — in controlled mode
    // this is display-only (the parent owns truth); uncontrolled mode it IS
    // the value. Without this, a focused controlled field freezes visually
    // while stepping (the parent's value moves but the buffer never does).
    _setBuffer(String(rounded))
    config.onChange?.(rounded)
    config.onStep?.(rounded, { offset: rounded - (value() ?? 0), type: direction === 1 ? 'up' : 'down' })
  }

  const up = (multiplied = false) => stepBy(1, multiplied)
  const down = (multiplied = false) => stepBy(-1, multiplied)

  const setInputText = (text: string) => {
    if (config.disabled || config.readonly) return
    _setBuffer(text)
    // antd commits on every parseable keystroke (controlled parents see
    // live values); half-typed ("1.", "-") stays buffer-only.
    if (isEmptyBuffer(text)) {
      if (value() !== null) config.onChange?.(null)
      return
    }
    const parsed = parseBuffer(text)
    if (parsed !== null) config.onChange?.(parsed)
  }

  const commit = () => {
    const raw = _buffer()
    if (raw === null || isEmptyBuffer(raw)) {
      if (value() !== null) emitChange(null)
      return
    }
    const parsed = parseBuffer(raw)
    if (parsed === null) {
      emitChange(null)
      return
    }
    const clamped = clamp(parsed)
    const rounded = toFixedWithPrecision(clamped, effectivePrecision())
    const formatted = config.formatter ? config.formatter(rounded) : String(rounded)
    _setBuffer(formatted)
    if (rounded !== value()) emitChange(rounded)
  }

  const notifyFocus = () => {
    _setFocused(true)
    // Controlled mode: seed the buffer with the current committed value so
    // the focused field keeps showing it (typing then replaces the buffer).
    if (config.value !== undefined) {
      const v = value()
      _setBuffer(v === null ? null : (config.formatter ? config.formatter(v) : String(v)))
    }
    config.onFocus?.()
  }

  const commitBlur = () => {
    _setFocused(false)
    commit()
    config.onBlur?.()
  }

  const setValue = (next: number | null) => {
    if (config.value === undefined) {
      _setBuffer(next === null ? null : String(next))
    }
    config.onChange?.(next)
  }

  const atMax = createMemo(() => {
    const v = value()
    return config.max !== undefined && v !== null && v >= config.max
  })
  const atMin = createMemo(() => {
    const v = value()
    return config.min !== undefined && v !== null && v <= config.min
  })

  return {
    value,
    textValue: () => _buffer() ?? '',
    displayValue,
    outOfRange,
    isFocused: () => _focused(),
    setInputText,
    up,
    down,
    commit: commitBlur,
    notifyFocus,
    setValue,
    isDisabled: () => !!config.disabled,
    isReadonly: () => !!config.readonly,
    canUp: () => !config.disabled && !config.readonly && !atMax(),
    canDown: () => !config.disabled && !config.readonly && !atMin(),
  }
}

export const inputNumberSplits: (keyof InputNumberConfig)[] = [
  'value', 'defaultValue', 'min', 'max', 'step', 'shiftMultiplier',
  'precision', 'parser', 'formatter', 'disabled', 'readonly',
]
