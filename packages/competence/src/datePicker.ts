import { createMemo, createSignal, untrack } from "solid-js";

/**
 * Headless logic for DatePicker — the rc-date-picker core (date mode).
 *
 * ARCHITECTURE (the TimePicker pattern): a date is a triple (y, m, d) —
 * pure functions below own ALL calendar math (parse/format/month matrix/
 * navigation); the machine owns:
 *
 *   - VALUE: controlled-or-uncontrolled 'YYYY-MM-DD' string; null = empty.
 *     The input buffer commits on blur (half-typed reverts, out-of-range
 *     clamps — the InputNumber/TimePicker contract).
 *   - PANEL VIEW: `viewDate` (the month the calendar shows) — jumps to
 *     the selected month on open, free navigation after; `mode`
 *     (date/month/year — the antd panel drill-down), and the panel's
 *     ACTIVE cell for keyboard navigation (the Select contract: arrows move,
 *     Enter picks, PageUp/PageDown flip months).
 *   - DAY STATE: selected / today / disabled-derivation per cell.
 *     disabled comes from disabledDate(y,m,d) OR min/max bounds; the panel
 *     also exposes month/year cells with their own disable derivation.
 *
 * The UI layer renders the input + portal panel (createTrigger — the
 * shared floating engine); this layer stays DOM-free.
 */
import type { FormFieldRule } from "./formField";

export type DatePickerMode = 'date' | 'month' | 'year'

export type DatePickerConfig = {
  /** Controlled 'YYYY-MM-DD' string; null/undefined = empty. */
  value?: string | null
  defaultValue?: string | null
  /** Earliest pickable date (inclusive), 'YYYY-MM-DD'. */
  min?: string
  /** Latest pickable date (inclusive), 'YYYY-MM-DD'. */
  max?: string
  /** Extra disable predicate (per day cell). */
  disabledDate?: (iso: string) => boolean
  disabled?: boolean
  /** First day of week: 0=Sunday (default), 1=Monday. */
  weekStart?: 0 | 1
  /** Controlled panel open (mirrors the UI trigger). */
  open?: boolean
  onChange?: (value: string | null) => void
  onFocus?: () => void
  onBlur?: () => void
  /** Form integration: rules for the enclosing Item. */
  rules?: FormFieldRule[]
}

export type DateParts = { year: number; month: number; day: number } // month: 1-12

// ---- pure date helpers --------------------------------------------------------

const PAD = (n: number, w = 2) => String(n).padStart(w, '0')

/** 'YYYY-MM-DD' → parts; null when unparseable/empty/invalid. */
export const parseDate = (value: string | null | undefined): DateParts | null => {
  if (!value) return null
  const m = value.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  if (month < 1 || month > 12) return null
  if (day < 1 || day > daysInMonth(year, month)) return null
  return { year, month, day }
}

/** parts → 'YYYY-MM-DD' (zero-padded). */
export const formatDate = (parts: DateParts): string =>
  `${PAD(parts.year, 4)}-${PAD(parts.month)}-${PAD(parts.day)}`

export const daysInMonth = (year: number, month: number): number =>
  new Date(year, month, 0).getDate()

export const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0

/** Today's parts (local time). */
export const todayParts = (): DateParts => {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }
}

/** Compare two parts (negative when a < b). */
export const compareParts = (a: DateParts, b: DateParts): number =>
  a.year !== b.year ? a.year - b.year
    : a.month !== b.month ? a.month - b.month
      : a.day - b.day

export const isSameDay = (a: DateParts | null, b: DateParts | null): boolean =>
  !!a && !!b && compareParts(a, b) === 0

/** parts → weekday 0-6 (0=Sunday), local time. */
export const weekdayOf = (p: DateParts): number =>
  new Date(p.year, p.month - 1, p.day).getDay()

/**
 * The month matrix: 6 rows × 7 cols covering the whole visible grid.
 * Cells carry `current: false` for the spillover days and `iso` for the
 * full date string (spill days belong to adjacent months). `weekStart`
 * shifts the column order.
 */
export type MonthCell = {
  year: number
  month: number // 1-12 (the cell's OWN month — spillovers differ from view)
  day: number
  iso: string
  current: boolean // inside the VIEW month
  weekday: number // 0-6 (Sunday=0) in absolute terms
}

export const getMonthMatrix = (
  year: number,
  month: number, // 1-12, the view month
  weekStart: 0 | 1 = 0,
): MonthCell[][] => {
  const first: DateParts = { year, month, day: 1 }
  const firstWeekday = weekdayOf(first) // 0=Sunday
  // The leading offset: how many cells before day 1.
  const lead = (firstWeekday - weekStart + 7) % 7
  const total = daysInMonth(year, month)
  const cells: MonthCell[] = []
  // Previous-month spillover.
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const prevTotal = daysInMonth(prevYear, prevMonth)
  for (let i = lead - 1; i >= 0; i--) {
    const day = prevTotal - i
    cells.push({
      year: prevYear, month: prevMonth, day,
      iso: formatDate({ year: prevYear, month: prevMonth, day }),
      current: false,
      weekday: (weekStart + cells.length) % 7,
    })
  }
  // The view month.
  for (let day = 1; day <= total; day++) {
    cells.push({
      year, month, day,
      iso: formatDate({ year, month, day }),
      current: true,
      weekday: (weekStart + cells.length) % 7,
    })
  }
  // Next-month spillover to 42 cells (6 full weeks — stable panel height).
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  let nextDay = 1
  while (cells.length < 42) {
    cells.push({
      year: nextYear, month: nextMonth, day: nextDay,
      iso: formatDate({ year: nextYear, month: nextMonth, day: nextDay }),
      current: false,
      weekday: (weekStart + cells.length) % 7,
    })
    nextDay++
  }
  // Slice into weeks.
  const weeks: MonthCell[][] = []
  for (let r = 0; r < 6; r++) {
    weeks.push(cells.slice(r * 7, r * 7 + 7))
  }
  return weeks
}

/** The weekday header labels' absolute weekday values, respecting weekStart. */
export const weekHeaders = (weekStart: 0 | 1 = 0): number[] =>
  weekStart === 1 ? [1, 2, 3, 4, 5, 6, 0] : [0, 1, 2, 3, 4, 5, 6]

/** Navigation on {year, month} (month 1-12). */
export const addMonths = (year: number, month: number, delta: number): { year: number; month: number } => {
  const zero = year * 12 + (month - 1) + delta
  return { year: Math.floor(zero / 12), month: (zero % 12 + 12) % 12 + 1 }
}

/** Clamp day into the month's length (Jan 31 + 1mo → Feb 28/29). */
export const clampDay = (p: DateParts): DateParts => ({
  year: p.year, month: p.month, day: Math.min(p.day, daysInMonth(p.year, p.month)),
})

export const addDays = (p: DateParts, delta: number): DateParts => {
  const d = new Date(p.year, p.month - 1, p.day)
  d.setDate(d.getDate() + delta)
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }
}

/** The 10-year window the year panel shows (antd decade view). */
export const decadeRange = (year: number): { start: number; end: number } => {
  const start = Math.floor(year / 10) * 10
  return { start, end: start + 9 }
}

// ---- the machine ---------------------------------------------------------------

export type DatePickerIns = {
  /** The effective 'YYYY-MM-DD' (controlled wins), null when empty. */
  value: () => string | null
  /** The parsed parts (null when empty). */
  parts: () => DateParts | null
  isDisabled: () => boolean
  /** Replace the RAW INPUT text (typing); commits when parseable. */
  setInputText: (text: string) => void
  /** The raw buffer — what the input shows. */
  textValue: () => string
  /** Blur-time snap: parse + clamp the buffer (typing-only, guarded). */
  commit: () => void
  notifyFocus: () => void
  notifyBlur: () => void
  isFocused: () => boolean
  /** Imperative value write (programmatic/API). */
  setValue: (value: string | null) => void
  clear: () => void
  // ---- panel view ----
  /** The calendar month being viewed ({year, month: 1-12}). */
  viewDate: () => { year: number; month: number }
  /** Jump the view (prev/next buttons). */
  setViewDate: (year: number, month: number) => void
  /** Panel mode: date grid / month list / year list. */
  mode: () => DatePickerMode
  setMode: (mode: DatePickerMode) => void
  /** The 6×7 matrix for the date grid. */
  monthMatrix: () => MonthCell[][]
  /** Weekday header values (respecting weekStart). */
  weekHeaderValues: () => number[]
  /** Day-cell state derivation. */
  cellState: (cell: MonthCell) => { selected: boolean; today: boolean; disabled: boolean; adjacent: boolean }
  /** Month-cell state for the month panel (month 1-12 of view year). */
  monthCellState: (month: number) => { selected: boolean; disabled: boolean }
  /** Year-cell state for the year panel. */
  yearCellState: (year: number) => { selected: boolean; disabled: boolean }
  /** Pick a day cell (adjacent cells shift the view too). */
  pickDay: (cell: MonthCell) => void
  /** Pick a month (month panel) — drills into the date grid. */
  pickMonth: (month: number) => void
  /** Pick a year (year panel) — drills into the month list. */
  pickYear: (year: number) => void
  /** Header labels. */
  viewYearLabel: () => number
  viewMonthLabel: () => number
  decadeStart: () => number
  decadeEnd: () => number
  /** Whether prev/next navigation is allowed at the current view/mode. */
  canPrev: () => boolean
  canNext: () => boolean
  /** The active cell (keyboard nav) as iso; undefined = none. */
  activeIso: () => string | undefined
  moveActive: (deltaX: number, deltaY: number) => void
  moveActiveMonth: (delta: number) => void
  setActiveIso: (iso: string) => void
  /** Keyboard: commit the active cell per mode. */
  commitActive: () => void
  /** Panel open state (the UI trigger owns the DOM; this mirrors). */
  isOpen: () => boolean
  setOpen: (open: boolean) => void
  /** Jump the view to today (antd "Today" button). */
  goToday: () => void
}

export const createDatePicker = (config: DatePickerConfig = {}): DatePickerIns => {
  const weekStart = (): 0 | 1 => config.weekStart ?? 0
  const minParts = () => parseDate(config.min)
  const maxParts = () => parseDate(config.max)

  const isDateDisabled = (p: DateParts): boolean => {
    if (config.disabledDate?.(formatDate(p))) return true
    const lo = minParts()
    if (lo && compareParts(p, lo) < 0) return true
    const hi = maxParts()
    if (hi && compareParts(p, hi) > 0) return true
    return false
  }

  // ownedWrite: typing/keyboard/picks arrive from DOM events.
  const [_buffer, _setBuffer] = createSignal<string | null>(config.defaultValue ?? null, { ownedWrite: true })
  // The last VALID date string — the unparseable-revert path must not read
  // value() (the uncontrolled memo reads the broken buffer mid-batch).
  let _lastValid: string | null = (() => {
    const p = parseDate(config.defaultValue ?? null)
    return p ? formatDate(p) : null
  })()
  const [_focused, _setFocused] = createSignal(false, { ownedWrite: true })
  const [_open, _setOpen] = createSignal(false, { ownedWrite: true })
  const [_mode, _setMode] = createSignal<DatePickerMode>('date', { ownedWrite: true })
  const [_activeIso, _setActiveIso] = createSignal<string | undefined>(undefined, { ownedWrite: true })

  const controlledValue = (): string | null | undefined => {
    if (config.value === undefined) return undefined
    if (config.value === null) return null
    const p = parseDate(config.value)
    return p ? formatDate(p) : null
  }

  const value = createMemo<string | null>(() => {
    const c = controlledValue()
    if (c !== undefined) return c
    const raw = _buffer()
    if (raw === null) return null
    const p = parseDate(raw)
    return p ? formatDate(p) : null
  })

  const parts = createMemo<DateParts | null>(() => parseDate(value()))

  const isDisabled = () => !!config.disabled

  // The view month: the selected month when set, else today.
  const initialView = () => {
    const p = parts() ?? todayParts()
    return { year: p.year, month: p.month }
  }
  const [_view, _setView] = createSignal<{ year: number; month: number }>(initialView(), { ownedWrite: true })

  const viewDate = () => _view()

  /** Emit a parts change in the API shape. */
  const emitParts = (next: DateParts | null) => {
    const text = next === null ? null : formatDate(next)
    if (text !== null) _lastValid = text
    if (controlledValue() === undefined) {
      _setBuffer(text)
    }
    config.onChange?.(text)
  }

  let _dirtyTyped = false

  const setInputText = (text: string) => {
    if (isDisabled()) return
    _dirtyTyped = true
    // Unconditional display mirror (controlled mode keeps the parent as truth —
    // the InputNumber/TimePicker lesson).
    _setBuffer(text)
    const p = parseDate(text)
    if (p) {
      if (controlledValue() === undefined) {
        _setBuffer(formatDate(p))
      }
      config.onChange?.(formatDate(p))
    }
  }

  const commit = () => {
    if (!_dirtyTyped) {
      _setBuffer(value())
      return
    }
    _dirtyTyped = false
    const raw = _buffer()
    if (raw === null || raw.trim() === '') {
      if (value() !== null) emitParts(null)
      return
    }
    const p = parseDate(raw)
    if (!p) {
      // Unparseable: revert to the last valid value (_lastValid — value()
      // echoes the broken buffer mid-batch).
      _setBuffer(_lastValid)
      return
    }
    // Clamp into [min, max] (dates have no lattice — just range).
    let clamped = p
    const lo = minParts()
    if (lo && compareParts(p, lo) < 0) clamped = lo
    const hi = maxParts()
    if (hi && compareParts(p, hi) > 0) clamped = hi
    const text = formatDate(clamped)
    _setBuffer(text)
    if (text !== value()) emitParts(clamped)
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
    const p = parseDate(next)
    if (!p) return
    emitParts(p)
  }

  const clear = () => {
    if (isDisabled()) return
    emitParts(null)
    _setActiveIso(undefined)
  }

  // ---- panel view ------------------------------------------------------------

  const setViewDate = (year: number, month: number) => {
    _setView({ year, month })
  }

  const mode = () => _mode()
  const setMode = (m: DatePickerMode) => {
    _setMode(m)
  }

  const monthMatrix = createMemo<MonthCell[][]>(() =>
    getMonthMatrix(_view().year, _view().month, weekStart()),
  )

  const weekHeaderValues = () => weekHeaders(weekStart())

  const cellState = (cell: MonthCell) => ({
    selected: value() === cell.iso,
    today: isSameDay(todayParts(), parseDate(cell.iso)),
    disabled: isDateDisabled(parseDate(cell.iso)!),
    adjacent: !cell.current,
  })

  const monthCellState = (month: number) => {
    const sel = parts()
    const view = _view()
    // A month cell is disabled when EVERY day in it is disabled — cheap
    // approximation: first/last day both disabled.
    const first: DateParts = { year: view.year, month, day: 1 }
    const last: DateParts = { year: view.year, month, day: daysInMonth(view.year, month) }
    return {
      selected: !!sel && sel.year === view.year && sel.month === month,
      disabled: isDateDisabled(first) && isDateDisabled(last),
    }
  }

  const yearCellState = (year: number) => {
    const sel = parts()
    const disabledByRange = (() => {
      const lo = minParts()
      if (lo && year < lo.year) return true
      const hi = maxParts()
      if (hi && year > hi.year) return true
      return false
    })()
    return {
      selected: !!sel && sel.year === year,
      disabled: disabledByRange,
    }
  }

  const pickDay = (cell: MonthCell) => {
    if (isDisabled()) return
    const p: DateParts = { year: cell.year, month: cell.month, day: cell.day }
    if (isDateDisabled(p)) return
    emitParts(p)
    // Adjacent-cell pick: keep the view on the picked month.
    if (!cell.current) _setView({ year: cell.year, month: cell.month })
    _setActiveIso(cell.iso)
  }

  const pickMonth = (month: number) => {
    const st = monthCellState(month)
    if (st.disabled) return
    _setView({ year: _view().year, month })
    _setMode('date')
  }

  const pickYear = (year: number) => {
    const st = yearCellState(year)
    if (st.disabled) return
    _setView({ year, month: _view().month })
    _setMode('month')
  }

  const viewYearLabel = () => _view().year
  const viewMonthLabel = () => _view().month
  const decadeStart = () => decadeRange(_view().year).start
  const decadeEnd = () => decadeRange(_view().year).end

  /** Prev/next allowed: the navigation must not fully escape [min, max]. */
  const canPrev = () => {
    const lo = minParts()
    if (!lo) return true
    const v = _view()
    return v.year > lo.year || v.month > lo.month
  }
  const canNext = () => {
    const hi = maxParts()
    if (!hi) return true
    const v = _view()
    return v.year < hi.year || v.month < hi.month
  }

  // ---- keyboard active ----------------------------------------------------------

  /** Anchor: the selected date, else today (clamped to enabled). */
  const anchorParts = (): DateParts => {
    const sel = parts()
    if (sel) return sel
    const t = todayParts()
    return t
  }

  const activeIso = () => {
    const a = _activeIso()
    if (a !== undefined) return a
    const anchor = anchorParts()
    return formatDate(anchor)
  }

  const moveActive = (deltaX: number, deltaY: number) => {
    const cur = parseDate(activeIso())
    if (!cur) return
    let next = addDays(cur, deltaX + deltaY * 7)
    next = clampDay(next)
    _setActiveIso(formatDate(next))
  }

  const moveActiveMonth = (delta: number) => {
    const cur = parseDate(activeIso())
    if (!cur) return
    const shifted = addMonths(cur.year, cur.month, delta)
    const next = clampDay({ year: shifted.year, month: shifted.month, day: cur.day })
    _setActiveIso(formatDate(next))
  }

  const setActiveIso = (iso: string) => {
    _setActiveIso(iso)
  }

  const commitActive = () => {
    const iso = activeIso()
    const p = parseDate(iso)
    if (!p) return
    if (isDateDisabled(p)) return
    emitParts(p)
    _setView({ year: p.year, month: p.month })
  }

  // ---- open ----------------------------------------------------------------------

  // setOpen runs from the UI layer's dual-function createEffect, whose effect
  // callback executes with strictRead="an effect callback" set — reading the
  // (possibly getter-backed) config.open there trips STRICT_READ_UNTRACKED.
  // Reads that gate a WRITE go through untrack; isOpen stays tracked (render
  // path — recomputes when the controlled prop or internal state flips).
  const isOpen = () => (config.open !== undefined ? false : _open()) || config.open === true

  const setOpen = (open: boolean) => {
    if (untrack(() => isDisabled())) return
    if (untrack(() => config.open !== undefined)) return
    if (open === untrack(() => _open())) return
    _setOpen(open)
    if (open) {
      // View jumps to the selected month (or today); mode resets to the grid.
      const init = initialView()
      _setView(init)
      _setMode('date')
      _setActiveIso(undefined)
    }
  }

  const goToday = () => {
    if (isDisabled()) return
    const t = todayParts()
    if (!isDateDisabled(t)) {
      emitParts(t)
    }
    _setView({ year: t.year, month: t.month })
    _setActiveIso(formatDate(t))
  }

  return {
    value,
    parts,
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
    clear,
    viewDate,
    setViewDate,
    mode,
    setMode,
    monthMatrix,
    weekHeaderValues,
    cellState,
    monthCellState,
    yearCellState,
    pickDay,
    pickMonth,
    pickYear,
    viewYearLabel,
    viewMonthLabel,
    decadeStart,
    decadeEnd,
    canPrev,
    canNext,
    activeIso,
    moveActive,
    moveActiveMonth,
    setActiveIso,
    commitActive,
    isOpen,
    setOpen,
    goToday,
  }
}

export const datePickerSplits: (keyof DatePickerConfig)[] = [
  'value', 'defaultValue', 'min', 'max', 'disabledDate', 'disabled', 'weekStart',
]

// ==== RangePicker (date) ========================================================

/**
 * Headless logic for RangePicker — TWO coupled createDatePicker values.
 *
 * ARCHITECTURE: a range is [start, end] 'YYYY-MM-DD' strings with the
 * invariant start <= end. Rather than reimplementing calendar math, this
 * machine COMPOSES two createDatePicker instances and adds the range glue:
 *
 *   - ACTIVE END: which input the next pick lands in ('start' | 'end').
 *     antd/rc-picker semantics: pick start → active flips to end → pick
 *     end → closes. The active end's view is the LEFT panel; the other
 *     panel shows the following month.
 *   - VALUE ORDER: picking a date BEFORE the current start while the end
 *     is empty/active RESTARTS the range at that date (rc-picker's
 *     re-select behavior).
 *   - ORDERING SWAP: both ends always satisfy start <= end — a pick that
 *     inverts the pair swaps it.
 *   - HOVER PREVIEW: while the end is pending, hoverReport marks the
 *     would-be range cells (in-range + endpoint) for the UI highlight.
 *   - DISABLE CLOSURE: with a start selected, dates before it are
 *     disabled for the end pick (antd default; see `allowEmpty` for the
 *     future). min/max/disabledDate apply to BOTH ends.
 *
 * The UI layer renders two inputs + a shared two-month panel (createTrigger).
 */
export type DateRangeValue = [string, string]
export type RangeActiveEnd = 'start' | 'end'

export type DateRangePickerConfig = {
  /** Controlled ['YYYY-MM-DD','YYYY-MM-DD']; null = empty. */
  value?: DateRangeValue | null
  defaultValue?: DateRangeValue | null
  min?: string
  max?: string
  disabledDate?: (iso: string) => boolean
  disabled?: boolean
  weekStart?: 0 | 1
  /** Controlled panel open (mirrors the UI trigger). */
  open?: boolean
  onChange?: (value: DateRangeValue | null) => void
  onFocus?: () => void
  onBlur?: () => void
}

export type RangeCellState = {
  selected: boolean
  today: boolean
  disabled: boolean
  adjacent: boolean
  /** Inside the committed [start, end] range (exclusive of endpoints). */
  inRange: boolean
  /** Inside the hover-preview range (endpoint-style highlight on the ends). */
  hoverInRange: boolean
  /** This cell IS the hovered endpoint preview. */
  hoverEndpoint: boolean
  'range-start': boolean
  'range-end': boolean
}

export type DateRangePickerIns = {
  /** The effective pair (controlled wins), null when empty. */
  value: () => DateRangeValue | null
  /** The individual end values (null when that end is unset). */
  startValue: () => string | null
  endValue: () => string | null
  /** Which input receives the next pick. */
  activeEnd: () => RangeActiveEnd
  /** Both-end picks done? (drives the UI's "close panel" decision). */
  isComplete: () => boolean
  isDisabled: () => boolean
  setInputText: (end: RangeActiveEnd, text: string) => void
  /** The raw buffer per end. */
  textValue: (end: RangeActiveEnd) => string
  /** Blur-time snap for the typed end. */
  commit: (end: RangeActiveEnd) => void
  notifyFocus: (end: RangeActiveEnd) => void
  notifyBlur: (end: RangeActiveEnd) => void
  isFocused: () => boolean
  setValue: (value: DateRangeValue | null) => void
  clear: () => void
  // ---- panels ----
  /** The LEFT panel's view ({year, month: 1-12}). */
  leftView: () => { year: number; month: number }
  rightView: () => { year: number; month: number }
  /** Set the LEFT view directly; the right follows (left + 1 month). */
  setLeftView: (year: number, month: number) => void
  /** Month matrices for the two panels (never overlapping — right = left+1). */
  leftMatrix: () => MonthCell[][]
  rightMatrix: () => MonthCell[][]
  monthMatrix: (panel: 'left' | 'right') => MonthCell[][]
  weekHeaderValues: () => number[]
  /** Day-cell derivation including range highlighting. */
  rangeCellState: (cell: MonthCell) => RangeCellState
  /** Pick a day into the ACTIVE end (the range state machine). */
  pickDay: (cell: MonthCell) => void
  /** Report hover for the pending-end preview (null clears). */
  hoverReport: (iso: string | null) => void
  /** The hovered iso driving the preview. */
  hoverIso: () => string | null
  /** Keyboard active cell for the active end's panel. */
  activeIso: () => string | undefined
  moveActive: (deltaX: number, deltaY: number) => void
  moveActiveMonth: (delta: number) => void
  setActiveIso: (iso: string) => void
  commitActive: () => void
  /** Whether the prev/next navigation escapes [min, max]. */
  canPrev: () => boolean
  canNext: () => boolean
  isOpen: () => boolean
  setOpen: (open: boolean) => void
  /** Focus an input end (switches the pick target). */
  focusEnd: (end: RangeActiveEnd) => void
}

export const createDateRangePicker = (config: DateRangePickerConfig = {}): DateRangePickerIns => {
  const weekStart = (): 0 | 1 => config.weekStart ?? 0
  const minParts = () => parseDate(config.min)
  const maxParts = () => parseDate(config.max)

  const isDateDisabled = (p: DateParts): boolean => {
    if (config.disabledDate?.(formatDate(p))) return true
    const lo = minParts()
    if (lo && compareParts(p, lo) < 0) return true
    const hi = maxParts()
    if (hi && compareParts(p, hi) > 0) return true
    return false
  }

  // Range disables: the START end allows ANY pickable date (a backward
  // pick restarts the range). The END end forbids dates before the
  // committed start — except while the pair still sits at its pending
  // seed ([iso, iso]), where a backward pick also restarts (rc-picker).
  const isPickable = (p: DateParts, end: RangeActiveEnd): boolean => {
    if (isDateDisabled(p)) return false
    if (end === 'start') return true
    const pair = pairNow()
    if (pair === null) return true
    const [s, e] = pair
    if (s === e) return true // pending seed: any direction restarts
    const sp = parseDate(s)!
    if (compareParts(p, sp) < 0) return false
    return true
  }

  const parsePair = (v: DateRangeValue | null | undefined): DateRangeValue | null => {
    if (!v) return null
    const a = parseDate(v[0])
    const b = parseDate(v[1])
    if (!a || !b) return null
    const [lo, hi] = compareParts(a, b) <= 0 ? [a, b] : [b, a]
    return [formatDate(lo), formatDate(hi)]
  }

  // ownedWrite: picks/typing/keyboard arrive from DOM events.
  const [_buffer, _setBuffer] = createSignal<DateRangeValue | null>(parsePair(config.defaultValue), { ownedWrite: true })
  const [_activeEnd, _setActiveEnd] = createSignal<RangeActiveEnd>('start', { ownedWrite: true })
  const [_hover, _setHover] = createSignal<string | null>(null, { ownedWrite: true })
  const [_open, _setOpen] = createSignal(false, { ownedWrite: true })
  const [_focused, _setFocused] = createSignal(false, { ownedWrite: true })
  const [_activeIso, _setActiveIso] = createSignal<string | undefined>(undefined, { ownedWrite: true })

  const controlledValue = (): DateRangeValue | null | undefined => {
    if (config.value === undefined) return undefined
    return parsePair(config.value)
  }

  const value = createMemo<DateRangeValue | null>(() => {
    const c = controlledValue()
    if (c !== undefined) return c
    return parsePair(_buffer())
  })

  const startParts = createMemo<DateParts | null>(() => parseDate(value()?.[0] ?? null))
  const endParts = createMemo<DateParts | null>(() => parseDate(value()?.[1] ?? null))

  const startValue = () => value()?.[0] ?? null
  const endValue = () => value()?.[1] ?? null

  const isDisabled = () => !!config.disabled

  // A pair is complete when BOTH ends are set. The pending state only
  // exists when start is set and end is not (typing or picking).
  const isComplete = () => value() !== null

  const emitPair = (next: DateRangeValue | null) => {
    if (controlledValue() === undefined) {
      _setBuffer(next)
      _pendingPair = next
    }
    config.onChange?.(next)
  }

  /**
   * Solid 2 batches signal writes: right after _setBuffer inside a pick
   * (pickDay → emitEnd → emitEnd chained), the value() memo still reads
   * the STALE pair — the second emitEnd would restart the range instead
   * of extending it (the batched-writes pitfall). This mirror carries the
   * pending pair for read-after-write sequences; the value memo stays
   * the render-facing truth.
   */
  let _pendingPair: DateRangeValue | null = parsePair(config.defaultValue)
  const pairNow = (): DateRangeValue | null => {
    const c = controlledValue()
    if (c !== undefined) return c
    return _pendingPair ?? null
  }

  /**
   * Write one end, keeping the start<=end invariant (swap on inversion).
   * The pending phase (both ends equal at the seed) follows rc-picker:
   *  - a START-end pick before/at the seed RESTARTS the range here;
   *  - an END-end pick extends the pending seed to a real span (>= seed).
   */
  const emitEnd = (end: RangeActiveEnd, p: DateParts | null) => {
    const cur = pairNow()
    if (p === null) {
      // Clearing one end clears the whole pair (antd keeps no half-range).
      if (cur !== null) emitPair(null)
      return
    }
    const iso = formatDate(p)
    if (cur === null) {
      // First pick: the range seeds [iso, iso]; the other end stays open
      // for re-pick — represented by activeEnd flipping in pickDay.
      emitPair([iso, iso])
      return
    }
    const [s, e] = cur
    const pending = s === e
    if (pending) {
      if (end === 'end' && compareParts(p, parseDate(s)!) > 0) {
        // Extending the pending seed forward: [seed, iso].
        emitPair([s, iso])
      } else {
        // A backward pick (either end) restarts the range at the new date.
        emitPair([iso, iso])
      }
      return
    }
    if (end === 'start') {
      emitPair(compareParts(p, parseDate(e)!) <= 0 ? [iso, e] : [iso, iso])
    } else {
      emitPair(compareParts(parseDate(s)!, p) <= 0 ? [s, iso] : [iso, iso])
    }
  }

  // ---- typing (per-end) ------------------------------------------------------

  let _dirtyTyped: Record<RangeActiveEnd, boolean> = { start: false, end: false }
  let _lastValid: DateRangeValue | null = parsePair(config.defaultValue)

  const setInputText = (end: RangeActiveEnd, text: string) => {
    if (isDisabled()) return
    _dirtyTyped[end] = true
    // Unconditional display mirror per end (controlled mode: parent is truth).
    const cur = value()
    const next: DateRangeValue | null = [
      end === 'start' ? text : (cur?.[0] ?? ''),
      end === 'end' ? text : (cur?.[1] ?? ''),
    ]
    _setBuffer(end === 'start'
      ? (next[0] === '' && !next[1] ? null : [next[0], next[1]])
      : (next[1] === '' && !next[0] ? null : [next[0], next[1]]))
    const p = parseDate(text)
    if (p) {
      // A typed parseable date writes that end live (antd commits every
      // parseable keystroke). The pair invariant fix-up happens on commit.
      const cur2 = value()
      if (cur2 === null) {
        emitPair([formatDate(p), formatDate(p)])
      } else if (end === 'start') {
        const e = parseDate(cur2[1])!
        emitPair(compareParts(p, e) <= 0 ? [formatDate(p), cur2[1]] : [formatDate(p), formatDate(p)])
      } else {
        const s = parseDate(cur2[0])!
        emitPair(compareParts(s, p) <= 0 ? [cur2[0], formatDate(p)] : [formatDate(p), formatDate(p)])
      }
    }
  }

  const textValue = (end: RangeActiveEnd): string => {
    const raw = _buffer()
    if (raw !== null) return end === 'start' ? raw[0] : raw[1]
    return value()?.[end === 'start' ? 0 : 1] ?? ''
  }

  const commit = (end: RangeActiveEnd) => {
    if (!_dirtyTyped[end]) return
    _dirtyTyped[end] = false
    const text = textValue(end)
    if (text.trim() === '') return
    const p = parseDate(text)
    if (!p) {
      // Unparseable: revert the typed end to the last valid pair's end.
      const revert = _lastValid ?? null
      _setBuffer(revert)
      return
    }
    // Clamp into [min, max] like the single picker.
    let clamped = p
    const lo = minParts()
    if (lo && compareParts(p, lo) < 0) clamped = lo
    const hi = maxParts()
    if (hi && compareParts(p, hi) > 0) clamped = hi
    if (isPickable(clamped, end)) emitEnd(end, clamped)
  }

  const notifyFocus = (end: RangeActiveEnd) => {
    _setFocused(true)
    _dirtyTyped = { start: false, end: false }
    focusEnd(end)
    config.onFocus?.()
  }

  const notifyBlur = (end: RangeActiveEnd) => {
    commit(end)
    _setFocused(false)
    config.onBlur?.()
  }

  const setValue = (next: DateRangeValue | null) => {
    if (isDisabled()) return
    emitPair(parsePair(next))
  }

  const clear = () => {
    if (isDisabled()) return
    emitPair(null)
    _setActiveIso(undefined)
    _setActiveEnd('start')
  }

  // ---- panels -----------------------------------------------------------------

  /** Left view anchors at the ACTIVE end's month (or today). */
  const anchorParts = (): DateParts => {
    if (_activeEnd() === 'start') return startParts() ?? todayParts()
    return endParts() ?? startParts() ?? todayParts()
  }

  const initialLeftView = () => {
    const p = anchorParts()
    return { year: p.year, month: p.month }
  }
  const [_leftView, _setLeftView] = createSignal<{ year: number; month: number }>(initialLeftView(), { ownedWrite: true })

  const leftView = () => _leftView()
  const rightView = () => {
    const v = _leftView()
    const next = addMonths(v.year, v.month, 1)
    return { year: next.year, month: next.month }
  }

  const setLeftView = (year: number, month: number) => {
    _setLeftView({ year, month })
  }

  const leftMatrix = createMemo<MonthCell[][]>(() => getMonthMatrix(_leftView().year, _leftView().month, weekStart()))
  const rightMatrix = createMemo<MonthCell[][]>(() => {
    const v = rightView()
    return getMonthMatrix(v.year, v.month, weekStart())
  })
  const monthMatrix = (panel: 'left' | 'right') => (panel === 'left' ? leftMatrix() : rightMatrix())

  const weekHeaderValues = () => weekHeaders(weekStart())

  const hoverIso = () => _hover()

  /**
   * The pair is "hover-done" when the user has moved past the pending
   * window: the pair's two ends DIVERGE (a real span was committed). The
   * pending preview only applies while both ends still sit at the seed.
   */
  const hoverDone = (pair: DateRangeValue | null): boolean => {
    if (!pair) return true
    return pair[0] !== pair[1]
  }

  const rangeCellState = (cell: MonthCell): RangeCellState => {
    const pair = value()
    const s = pair?.[0]
    const e = pair?.[1]
    const iso = cell.iso
    const sel = iso === s || iso === e
    // Pending state: start committed, end open, pointer hovering. The pair
    // is still [start, start] (the first pick seeds both ends); the
    // hover-preview window is between the SEED start and the hover point.
    const pendingStart = _activeEnd() === 'end' && !!s && !hoverDone(pair) ? s : null
    const hov = _hover()
    let inRange = false
    let hoverInRange = false
    let hoverEndpoint = false
    if (s && e && compareParts(parseDate(s)!, parseDate(e)!) < 0) {
      inRange = iso > s && iso < e // ISO string compare works for YYYY-MM-DD
    }
    if (pendingStart && hov) {
      const lo = pendingStart < hov ? pendingStart : hov
      const hi = pendingStart < hov ? hov : pendingStart
      hoverInRange = iso > lo && iso < hi
      hoverEndpoint = iso === hov
    }
    return {
      selected: sel,
      today: isSameDay(todayParts(), parseDate(cell.iso)),
      disabled: !isPickable(parseDate(cell.iso)!, _activeEnd()) || isDateDisabled(parseDate(cell.iso)!),
      adjacent: !cell.current,
      inRange,
      hoverInRange,
      hoverEndpoint,
      'range-start': iso === s,
      'range-end': iso === e,
    }
  }

  const pickDay = (cell: MonthCell) => {
    if (isDisabled()) return
    const p: DateParts = { year: cell.year, month: cell.month, day: cell.day }
    if (!isPickable(p, _activeEnd())) return
    emitEnd(_activeEnd(), p)
    _setActiveIso(cell.iso)
    _setHover(null)
    // The pick sequence: start → flip to end; the end pick completes the
    // pair. But a pick on the END end that lands ON the seed (or restarts
    // before it) keeps the flow at the end — the next pick continues
    // editing that end.
    _setActiveEnd('end')
    // Keep the pair's LAST valid snapshot for the revert path.
    const pair = value()
    if (pair) _lastValid = pair
  }

  const hoverReport = (iso: string | null) => {
    _setHover(iso)
  }

  // ---- keyboard active ----------------------------------------------------------

  const activeIso = () => {
    const a = _activeIso()
    if (a !== undefined) return a
    return formatDate(anchorParts())
  }

  const moveActive = (deltaX: number, deltaY: number) => {
    const cur = parseDate(activeIso())
    if (!cur) return
    let next = addDays(cur, deltaX + deltaY * 7)
    next = clampDay(next)
    _setActiveIso(formatDate(next))
    // Keep the left panel in view when the active walks out.
    const v = _leftView()
    if (next.month !== v.month || next.year !== v.year) {
      _setLeftView({ year: next.year, month: next.month })
    }
  }

  const moveActiveMonth = (delta: number) => {
    const cur = parseDate(activeIso())
    if (!cur) return
    const shifted = addMonths(cur.year, cur.month, delta)
    const next = clampDay({ year: shifted.year, month: shifted.month, day: cur.day })
    _setActiveIso(formatDate(next))
    _setLeftView({ year: shifted.year, month: shifted.month })
  }

  const setActiveIso = (iso: string) => {
    _setActiveIso(iso)
  }

  const commitActive = () => {
    const iso = activeIso()
    const p = parseDate(iso)
    if (!p) return
    if (!isPickable(p, _activeEnd())) return
    emitEnd(_activeEnd(), p)
    _setViewToParts(p)
  }

  const _setViewToParts = (p: DateParts) => {
    _setLeftView({ year: p.year, month: p.month })
  }

  // ---- navigation bounds -------------------------------------------------------

  const canPrev = () => {
    const lo = minParts()
    if (!lo) return true
    const v = _leftView()
    return v.year > lo.year || v.month > lo.month
  }
  const canNext = () => {
    const hi = maxParts()
    if (!hi) return true
    // The RIGHT panel's month must stay <= max's month.
    const r = rightView()
    return r.year < hi.year || r.month < hi.month
  }

  // ---- open ----------------------------------------------------------------------

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
      // Fresh session: view anchors at the active end, active resets,
      // pending hover cleared.
      _setLeftView(initialLeftView())
      _setActiveIso(undefined)
      _setHover(null)
      // A complete pair re-opens with the START end as the pick target
      // (rc-picker restarts the pick flow).
      if (isComplete()) _setActiveEnd('start')
    }
  }

  const focusEnd = (end: RangeActiveEnd) => {
    if (isDisabled()) return
    _setActiveEnd(end)
    // Focusing the end with a complete pair re-enters the pick flow for
    // that end: antd treats it as editing this end.
  }

  return {
    value,
    startValue,
    endValue,
    activeEnd: () => _activeEnd(),
    isComplete,
    isDisabled,
    setInputText,
    textValue,
    commit,
    notifyFocus,
    notifyBlur,
    isFocused: () => _focused(),
    setValue,
    clear,
    leftView,
    rightView,
    setLeftView,
    leftMatrix,
    rightMatrix,
    monthMatrix,
    weekHeaderValues,
    rangeCellState,
    pickDay,
    hoverReport,
    hoverIso,
    activeIso,
    moveActive,
    moveActiveMonth,
    setActiveIso,
    commitActive,
    canPrev,
    canNext,
    isOpen,
    setOpen,
    focusEnd,
  }
}

export const dateRangePickerSplits: (keyof DateRangePickerConfig)[] = [
  'value', 'defaultValue', 'min', 'max', 'disabledDate', 'disabled', 'weekStart',
]
