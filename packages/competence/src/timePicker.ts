import { createMemo, createSignal, untrack } from "solid-js";

/**
 * Headless logic for TimePicker — the rc-time-picker/rc-picker core.
 *
 * ARCHITROPY: a time value is NOT a single number — it's a (h, m, s)
 * triple. The value model lives here as PURE functions (parse/format/
 * clamp/compare), and the machine owns:
 *
 *   - VALUE: controlled-or-uncontrolled time string ('HH:mm' /
 *     'HH:mm:ss' per `format`); null when empty. commit-on-blur snaps
 *     half-typed input into range (the InputNumber contract).
 *   - PANEL: which units the format shows (hours always; minutes/
 *     seconds per format tokens); the SELECTED column (typing or arrows
 *     move focus between the h/m/s segments in the input) driving
 *     stepper increments; the panel's ACTIVE option per column for the
 *     dropdown keyboard highlight (arrows/Enter — the Select contract).
 *   - STEPPING: hourStep/minuteStep/secondStep scale both the stepper
 *     and the panel's option lattice; values snap onto the lattice.
 *
 * The UI layer renders the input (segmented HH:mm:ss) + a portal panel
 * (createTrigger — the shared floating engine); this layer stays DOM-free.
 */
import type { FormFieldRule } from "./formField";

export type TimePickerUnit = 'hour' | 'minute' | 'second'

export type TimePickerConfig = {
  /** Controlled time string ('08:30:00'); null/undefined = empty. */
  value?: string | null
  defaultValue?: string | null
  /** 'HH:mm' (default) or 'HH:mm:ss'. */
  format?: 'HH:mm' | 'HH:mm:ss'
  /** Disallow times before/after (inclusive), 'HH:mm[:ss]' strings. */
  min?: string
  max?: string
  hourStep?: number
  minuteStep?: number
  secondStep?: number
  disabled?: boolean
  /** Hide the seconds column even in HH:mm:ss (panel-only concern). */
  hideDisabledOptions?: boolean
  onChange?: (value: string | null) => void
  onFocus?: () => void
  onBlur?: () => void
  /** Controlled panel open (mirrors the UI trigger). */
  open?: boolean
  /** Form integration: rules for the enclosing Item. */
  rules?: FormFieldRule[]
}

export type TimeParts = { hour: number; minute: number; second: number }

// ---- pure time helpers ------------------------------------------------------

/** 'HH:mm[:ss]' → parts; null when unparseable/empty. */
export const parseTime = (value: string | null | undefined): TimeParts | null => {
  if (!value) return null
  const m = value.trim().match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/)
  if (!m) return null
  const hour = Number(m[1])
  const minute = Number(m[2])
  const second = m[3] !== undefined ? Number(m[3]) : 0
  if (hour > 23 || minute > 59 || second > 59) return null
  return { hour, minute, second }
}

/** parts → 'HH:mm' or 'HH:mm:ss' (zero-padded). */
export const formatTime = (parts: TimeParts, format: 'HH:mm' | 'HH:mm:ss' = 'HH:mm'): string => {
  const pad = (n: number) => String(n).padStart(2, '0')
  const base = `${pad(parts.hour)}:${pad(parts.minute)}`
  return format === 'HH:mm:ss' ? `${base}:${pad(parts.second)}` : base
}

/** Total seconds — comparison/arithmetic. */
export const toSeconds = (parts: TimeParts): number =>
  parts.hour * 3600 + parts.minute * 60 + parts.second

export const fromSeconds = (total: number): TimeParts => {
  const t = ((total % 86400) + 86400) % 86400
  return {
    hour: Math.floor(t / 3600),
    minute: Math.floor((t % 3600) / 60),
    second: t % 60,
  }
}

/** Clamp parts into [min, max] (inclusive bounds; undefined = open). */
export const clampTime = (
  parts: TimeParts,
  min?: TimeParts,
  max?: TimeParts,
): TimeParts => {
  const t = toSeconds(parts)
  if (min !== undefined) {
    const lo = toSeconds(min)
    if (t < lo) return { ...min }
  }
  if (max !== undefined) {
    const hi = toSeconds(max)
    if (t > hi) return { ...max }
  }
  return parts
}

/** The option lattice for a column: hours 0..23/hourStep, minutes &
 *  seconds 0..59/step (disabled options still render, flagged). */
export const unitOptions = (
  unit: TimePickerUnit,
  step: number,
): Array<{ value: number; disabled: boolean }> => {
  const max = unit === 'hour' ? 23 : 59
  const s = Math.max(1, Math.floor(step))
  const out: Array<{ value: number; disabled: boolean }> = []
  for (let v = 0; v <= max; v++) {
    out.push({ value: v, disabled: v % s !== 0 })
  }
  return out
}

// ---- the machine -------------------------------------------------------------

export type TimePickerIns = {
  /** The effective time string (controlled wins), null when empty. */
  value: () => string | null
  /** The parsed parts (null when empty). */
  parts: () => TimeParts | null
  format: () => 'HH:mm' | 'HH:mm:ss'
  isDisabled: () => boolean
  /** Replace the RAW INPUT text (typing); commits when parseable. */
  setInputText: (text: string) => void
  /** The raw buffer — what the input shows. */
  textValue: () => string
  /** Blur-time snap: parse + clamp + relattice the buffer. */
  commit: () => void
  notifyFocus: () => void
  notifyBlur: () => void
  isFocused: () => boolean
  /** Imperative value write (programmatic/API). */
  setValue: (value: string | null) => void
  /** The input segment the stepper acts on ('hour' default; typing/arrows move it). */
  selectedUnit: () => TimePickerUnit
  setSelectedUnit: (unit: TimePickerUnit) => void
  /**
   * Stepper: ±1 step on the selected unit (clamped + lattice-snapped).
   * `unit` should be passed EXPLICITLY by the UI (the stepper click knows
   * its column): reading the selectedUnit signal right after
   * setSelectedUnit returns the UNCOMMITTED old value inside a Solid 2
   * batch. Falls back to the signal for programmatic calls.
   */
  stepSelected: (delta: number, unit?: TimePickerUnit) => void
  /** Panel columns in display order per format. */
  units: () => TimePickerUnit[]
  /** The option list of a column (per step). */
  columnOptions: (unit: TimePickerUnit) => Array<{ value: number; disabled: boolean }>
  /** The panel's keyboard-active option per column. */
  activeValue: (unit: TimePickerUnit) => number | undefined
  moveActive: (unit: TimePickerUnit, delta: number) => void
  setActiveValue: (unit: TimePickerUnit, value: number) => void
  /** Panel pick: set one unit, snapping onto the lattice. */
  pickUnit: (unit: TimePickerUnit, value: number) => void
  /** Whether a lattice value is disabled (off-step or out of range). */
  isOptionDisabled: (unit: TimePickerUnit, value: number) => boolean
  /** Panel open state (the UI trigger owns the DOM; this mirrors). */
  isOpen: () => boolean
  setOpen: (open: boolean) => void
  /** Clear to null. */
  clear: () => void
}

const UNIT_RANGE: Record<TimePickerUnit, number> = { hour: 23, minute: 59, second: 59 }
const UNIT_ORDER: TimePickerUnit[] = ['hour', 'minute', 'second']

export const createTimePicker = (config: TimePickerConfig = {}): TimePickerIns => {
  const format = () => config.format ?? 'HH:mm'
  const stepOf = (unit: TimePickerUnit): number =>
    unit === 'hour' ? (config.hourStep ?? 1)
      : unit === 'minute' ? (config.minuteStep ?? 1)
        : (config.secondStep ?? 1)

  const minParts = () => parseTime(config.min) ?? undefined
  const maxParts = () => parseTime(config.max) ?? undefined

  // ownedWrite: typing/keyboard/panel picks arrive from DOM events.
  const [_buffer, _setBuffer] = createSignal<string | null>(
    config.defaultValue ?? null,
    { ownedWrite: true },
  )
  // The last VALID time string (for the unparseable-revert path) — the
  // value memo reads the buffer, so mid-batch it would echo the broken
  // text back; this mirror keeps the revert target stable.
  let _lastValid: string | null = (() => {
    const p = parseTime(config.defaultValue ?? null)
    return p ? formatTime(p, config.format ?? 'HH:mm') : null
  })()
  // True when the USER typed into the buffer this focus session — commit
  // (blur snap) must only run then. Without the guard, a PANEL PICK in
  // controlled mode closes the panel → input blurs → commit sees the STALE
  // (empty) buffer and emits null, wiping the pick the parent just accepted.
  let _dirtyTyped = false
  const [_focused, _setFocused] = createSignal(false, { ownedWrite: true })
  const [_selectedUnit, _setSelectedUnit] = createSignal<TimePickerUnit>('hour', { ownedWrite: true })
  const [_active, _setActive] = createSignal<Partial<Record<TimePickerUnit, number>>>({}, { ownedWrite: true })
  const [_open, _setOpen] = createSignal(false, { ownedWrite: true })

  /** The controlled value as a normalized string (or null). */
  const controlledValue = (): string | null | undefined => {
    if (config.value === undefined) return undefined
    if (config.value === null) return null
    const p = parseTime(config.value)
    return p ? formatTime(p, format()) : null
  }

  const value = createMemo<string | null>(() => {
    const c = controlledValue()
    if (c !== undefined) return c
    const raw = _buffer()
    if (raw === null) return null
    const p = parseTime(raw)
    return p ? formatTime(p, format()) : null
  })

  const parts = createMemo<TimeParts | null>(() => parseTime(value()))

  const isDisabled = () => !!config.disabled

  /** Emit a parts change in the API shape (value string). */
  const emitParts = (next: TimeParts | null) => {
    const text = next === null ? null : formatTime(next, format())
    if (text !== null) _lastValid = text
    if (controlledValue() === undefined) {
      _setBuffer(text)
    }
    config.onChange?.(text)
  }

  /** Snap parts: clamp range + snap each unit onto its step lattice
   *  (round DOWN to the lattice per antd). */
  const snapParts = (p: TimeParts): TimeParts => {
    const snap = (v: number, unit: TimePickerUnit) => {
      const s = stepOf(unit)
      return Math.max(0, Math.min(UNIT_RANGE[unit], Math.floor(v / s) * s))
    }
    return clampTime(
      { hour: snap(p.hour, 'hour'), minute: snap(p.minute, 'minute'), second: snap(p.second, 'second') },
      minParts(),
      maxParts(),
    )
  }

  const setInputText = (text: string) => {
    if (isDisabled()) return
    _dirtyTyped = true
    _setBuffer(text)
    // antd commits on every parseable keystroke (live filtering); half-typed
    // input stays buffer-only until blur.
    const p = parseTime(text)
    if (p) {
      const snapped = snapParts(p)
      if (controlledValue() === undefined) {
        _setBuffer(formatTime(snapped, format()))
      }
      config.onChange?.(formatTime(snapped, format()))
    }
    // Move the selected segment to the one being edited (the UI sets it
    // precisely via setSelectedUnit; this keeps the stepper sensible when
    // it doesn't).
  }

  const commit = () => {
    if (!_dirtyTyped) {
      // No user typing this session (focus+blur, or a panel pick): sync the
      // buffer to the current value and leave the value untouched.
      _setBuffer(value())
      return
    }
    _dirtyTyped = false
    const raw = _buffer()
    if (raw === null || raw.trim() === '') {
      if (value() !== null) emitParts(null)
      return
    }
    const p = parseTime(raw)
    if (!p) {
      // Unparseable: revert to the last committed value (antd keeps the
      // previous valid time) — _lastValid, because value() reads the
      // broken buffer mid-batch.
      _setBuffer(_lastValid)
      return
    }
    const snapped = snapParts(p)
    const text = formatTime(snapped, format())
    _setBuffer(text)
    if (text !== value()) emitParts(snapped)
  }

  const notifyFocus = () => {
    _setFocused(true)
    _dirtyTyped = false
    config.onFocus?.()
  }

  const notifyBlur = () => {
    _setFocused(false)
    commit()
    config.onBlur?.()
  }

  const setValue = (next: string | null) => {
    if (isDisabled()) return
    if (next === null) {
      emitParts(null)
      return
    }
    const p = parseTime(next)
    if (!p) return
    emitParts(snapParts(p))
  }

  // ---- stepper -----------------------------------------------------------

  const selectedUnit = () => _selectedUnit()
  const setSelectedUnit = (unit: TimePickerUnit) => {
    _setSelectedUnit(unit)
  }

  const stepSelected = (delta: number, unitArg?: TimePickerUnit) => {
    if (isDisabled()) return
    const cur = parts()
    const unit = unitArg ?? selectedUnit()
    const s = stepOf(unit)
    // Empty input stepping starts at 00:00:00 (antd-ish: now-free, keeps
    // the machine deterministic/tests stable).
    const base: TimeParts = cur ?? { hour: 0, minute: 0, second: 0 }
    const raw = { ...base }
    raw[unit] = base[unit] + delta * s
    // Wrap within the unit's range (e.g. 23 + 1 → 0). The stepped unit is
    // NOT lattice-floored (rc-picker semantics: the stepper moves by step
    // multiples from the current value; only typing/picking snap) — just
    // range-clamp the whole time.
    const range = UNIT_RANGE[unit]
    const wrapped = ((raw[unit] % (range + 1)) + (range + 1)) % (range + 1)
    raw[unit] = wrapped
    emitParts(clampTime(raw, minParts(), maxParts()))
  }

  // ---- panel columns --------------------------------------------------------

  const units = createMemo<TimePickerUnit[]>(() =>
    format() === 'HH:mm:ss'
      ? ['hour', 'minute', 'second']
      : ['hour', 'minute'],
  )

  const columnOptions = (unit: TimePickerUnit) => unitOptions(unit, stepOf(unit))

  const isOptionDisabled = (unit: TimePickerUnit, v: number): boolean => {
    const opts = columnOptions(unit)
    const opt = opts.find(o => o.value === v)
    if (opt?.disabled) return true
    // Off-lattice values are always disabled; on-lattice values are also
    // disabled when the resulting time leaves [min, max].
    if (minParts() || maxParts()) {
      const cur = parts() ?? { hour: 0, minute: 0, second: 0 }
      const candidate = { ...cur, [unit]: v } as TimeParts
      if (minParts() && toSeconds(candidate) < toSeconds(minParts()!)) return true
      if (maxParts() && toSeconds(candidate) > toSeconds(maxParts()!)) return true
    }
    return false
  }

  /** Anchor a column's active option at the current value (or 0 when empty). */
  const anchorActive = (unit: TimePickerUnit): number => parts()?.[unit] ?? 0

  const activeValue = (unit: TimePickerUnit): number | undefined => {
    const a = _active()[unit]
    return a !== undefined ? a : anchorActive(unit)
  }

  const moveActive = (unit: TimePickerUnit, delta: number) => {
    const opts = columnOptions(unit).filter(o => !o.disabled)
    if (!opts.length) return
    const cur = activeValue(unit)
    const idx = opts.findIndex(o => o.value === cur)
    const next = idx === -1
      ? (delta > 0 ? 0 : opts.length - 1)
      : (idx + delta + opts.length) % opts.length
    const value = opts[next].value
    _setActive(prev => ({ ...prev, [unit]: value }))
  }

  const setActiveValue = (unit: TimePickerUnit, v: number) => {
    _setActive(prev => ({ ...prev, [unit]: v }))
  }

  const pickUnit = (unit: TimePickerUnit, v: number) => {
    if (isDisabled() || isOptionDisabled(unit, v)) return
    const base = parts() ?? { hour: 0, minute: 0, second: 0 }
    const next = { ...base, [unit]: v } as TimeParts
    emitParts(snapParts(next))
    _setActive(prev => ({ ...prev, [unit]: v }))
  }

  // ---- open ----------------------------------------------------------------

  // setOpen runs from the UI layer's dual-function createEffect, whose effect
  // callback executes with strictRead="an effect callback" set — reading the
  // (possibly getter-backed) config.open there trips STRICT_READ_UNTRACKED.
  // Reads that gate a WRITE go through untrack; isOpen stays tracked.
  const isOpen = () => (config.open !== undefined ? false : _open()) || config.open === true

  const setOpen = (open: boolean) => {
    if (untrack(() => isDisabled())) return
    if (untrack(() => config.open !== undefined)) return
    if (open === untrack(() => _open())) return
    _setOpen(open)
    if (open) {
      // Anchor every column's active at the current value.
      _setActive({})
    }
  }

  const clear = () => {
    if (isDisabled()) return
    emitParts(null)
    _setActive({})
  }

  return {
    value,
    parts,
    format,
    isDisabled,
    setInputText,
    textValue: () => {
      const raw = _buffer()
      if (raw !== null) return raw
      return value() ?? ''
    },
    commit,
    notifyFocus,
    notifyBlur,
    isFocused: () => _focused(),
    setValue,
    selectedUnit,
    setSelectedUnit,
    stepSelected,
    units,
    columnOptions,
    activeValue,
    moveActive,
    setActiveValue,
    pickUnit,
    isOptionDisabled,
    isOpen,
    setOpen,
    clear,
  }
}

export const timePickerSplits: (keyof TimePickerConfig)[] = [
  'value', 'defaultValue', 'format', 'min', 'max',
  'hourStep', 'minuteStep', 'secondStep', 'disabled',
]

void UNIT_ORDER
