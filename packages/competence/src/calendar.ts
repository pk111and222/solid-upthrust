import { createMemo, createSignal } from "solid-js";
import dayjs, { Dayjs } from "dayjs";
import {
  buildDateGrid, buildMonthGrid, buildMonthOptions, buildYearOptions,
  clampDateToRange, isMonthOutOfRange, isOutOfRange, isSameDate, isSameMonth,
  isSameYear, modeToPanelMode, selectMonthKeepingDate,
  type CalendarCell, type CalendarMode, type CalendarOption, type CalendarSelectSource,
} from "./calendarDate";
/**
 * Headless state machine for the Calendar panel — the generateCalendar /
 * rc-PickerPanel control core:
 *
 *  - controlled-or-uncontrolled `value` (defaults to now) and `mode`
 *  - `pickerValue` — the month/year the GRID displays (follows value when
 *    uncontrolled and untouched, antd/rc semantics)
 *  - event routing with antd parity: every cell click fires onSelect; a
 *    CHANGED value additionally fires onChange; a month-crossing date click
 *    (date panel) or year-crossing month click (month panel) also fires
 *    onPanelChange
 *  - disabled gating: validRange OR the consumer's disabledDate, where a
 *    month cell needs its whole span selectable
 *
 * No date math lives here — every derivation delegates to calendarDate.
 */

export type CalendarPanelConfig = {
  /** Controlled selected date. */
  value?: Dayjs
  defaultValue?: Dayjs
  /** Injected clock for tests. Default dayjs(). */
  now?: Dayjs
  /** Controlled calendar mode. */
  mode?: CalendarMode
  defaultMode?: CalendarMode
  validRange?: [Dayjs, Dayjs]
  disabledDate?: (date: Dayjs) => boolean
  onChange?: (date: Dayjs) => void
  onSelect?: (date: Dayjs, source: CalendarSelectSource) => void
  onPanelChange?: (date: Dayjs, mode: CalendarMode) => void
}

export type CalendarPanelIns = {
  /** Selected date (controlled value wins). */
  value: () => Dayjs
  /** Calendar mode: 'month' shows the date grid, 'year' shows months. */
  mode: () => CalendarMode
  /** Grid mode: mode 'year' → 'month' cells, else 'date' cells. */
  panelMode: () => 'date' | 'month'
  /** The month/year the grid displays (not the selection). */
  pickerValue: () => Dayjs
  today: () => Dayjs
  /** 7×6 date grid (panelMode 'date'). */
  dateGrid: () => CalendarCell[]
  /** 3×4 month grid (panelMode 'month'). */
  monthGrid: () => CalendarCell[]
  /** Full disabled check for a grid cell (validRange OR disabledDate). */
  isCellDisabled: (date: Dayjs) => boolean
  isDateSelected: (date: Dayjs) => boolean
  isMonthSelected: (date: Dayjs) => boolean
  /** Grid cell click — routes onSelect/onChange/onPanelChange. */
  selectDate: (date: Dayjs, source?: CalendarSelectSource) => void
  /** Month cell click in month panel (mode 'year'). */
  selectMonth: (date: Dayjs, source?: CalendarSelectSource) => void
  /** Move the displayed panel (header year/month select, prev/next). */
  setPickerValue: (date: Dayjs, source?: CalendarSelectSource) => void
  /** Switch calendar mode (fires onPanelChange with the current value). */
  setMode: (mode: CalendarMode) => void
  /** Header select options. */
  yearOptions: () => CalendarOption[]
  monthOptions: (months: string[]) => CalendarOption[]
  /** Day-of-week labels, rotated by the locale's week-first-day. */
  weekLabels: (shortWeekDays: string[], weekFirstDay: number) => string[]
}

export const createCalendarPanel = (config: CalendarPanelConfig = {}): CalendarPanelIns => {
  const now = () => config.now ?? dayjs()

  const [_value, _setValue] = createSignal(config.defaultValue ?? now(), { ownedWrite: true })
  const [_mode, _setMode] = createSignal<CalendarMode>(config.defaultMode ?? 'month', { ownedWrite: true })
  // Whether the panel has been navigated away from the value (header select
  // / prev-next). While false, the grid follows the value (rc syncs
  // pickerValue to mergedValue); once true, navigation owns the anchor.
  const [_panelTouched, _setPanelTouched] = createSignal(false, { ownedWrite: true })
  const [_pickerValue, _setPickerValue] = createSignal(
    config.defaultValue ?? now(),
    { ownedWrite: true },
  )

  const value = createMemo(() => config.value !== undefined ? config.value : _value())
  const mode = createMemo(() => config.mode !== undefined ? config.mode : _mode())
  const panelMode = createMemo(() => modeToPanelMode(mode()))
  const pickerValue = createMemo(() => {
    if (_panelTouched()) return _pickerValue()
    // Untouched: follow the value (rc syncs pickerValue to mergedValue[0]).
    // A controlled value moving the panel ALSO commits it, matching rc's
    // setInternalPickerValue effect.
    const v = value()
    const pv = _pickerValue()
    if (panelMode() === 'date') return isSameMonth(v, pv) ? pv : v
    return isSameYear(v, pv) ? pv : v
  })

  const today = createMemo(() => now())

  const dateGrid = createMemo(() => {
    const weekFirstDay = now().localeData().firstDayOfWeek()
    return buildDateGrid(pickerValue(), today(), weekFirstDay)
  })
  const monthGrid = createMemo(() => buildMonthGrid(pickerValue(), today()))

  const isCellDisabled = (date: Dayjs): boolean => {
    if (panelMode() === 'month') {
      if (isMonthOutOfRange(date, config.validRange)) return true
      // rc MonthPanel mergedDisabledDate: a month is disabled when BOTH its
      // first and last days fail the consumer check.
      const first = date.startOf('month')
      const last = date.endOf('month')
      if (!config.disabledDate) return false
      return config.disabledDate(first) && config.disabledDate(last)
    }
    return isOutOfRange(date, config.validRange) || !!config.disabledDate?.(date)
  }

  const isDateSelected = (date: Dayjs) => isSameDate(date, value())
  const isMonthSelected = (date: Dayjs) => isSameMonth(date, value())

  /**
   * Cell click routing (antd triggerChange): onSelect ALWAYS fires; the
   * onChange chain runs only when the value actually changes, and a panel
   * crossing adds onPanelChange BEFORE onChange (rc fires panelChange while
   * updating the merged value).
   */
  const commitValue = (next: Dayjs, source: CalendarSelectSource) => {
    const prev = value()
    const changed = !isSameDate(next, prev)
    if (changed) {
      const panelCrossed =
        (panelMode() === 'date' && !isSameMonth(next, prev))
        || (panelMode() === 'month' && !isSameYear(next, prev))
      if (panelCrossed) {
        _setPickerValue(next)
        config.onPanelChange?.(next, mode())
      }
      _setValue(next)
    }
    config.onSelect?.(next, source)
    if (changed) config.onChange?.(next)
  }

  const selectDate = (date: Dayjs, source: CalendarSelectSource = 'date') => {
    if (isCellDisabled(date)) return
    commitValue(date, source)
  }

  const selectMonth = (date: Dayjs, source: CalendarSelectSource = 'month') => {
    if (isCellDisabled(date)) return
    // Month grid: selection keeps day-of-month from the current value (rc
    // MonthSelect onChange = setMonth(value, month)).
    commitValue(selectMonthKeepingDate(value(), date.month()), source)
  }

  const setPickerValue = (date: Dayjs, source?: CalendarSelectSource) => {
    const next = clampDateToRange(date, config.validRange)
    _setPanelTouched(true)
    _setPickerValue(next)
    config.onPanelChange?.(next, mode())
    if (source) {
      // Header select moves carry a select notification too (antd Header
      // onChange routes through onInternalSelect).
      config.onSelect?.(next, source)
    }
  }

  const setMode = (next: CalendarMode) => {
    if (next === mode()) return
    _setMode(next)
    config.onPanelChange?.(value(), next)
  }

  const yearOptions = createMemo(() =>
    buildYearOptions(pickerValue().year(), config.validRange))

  const monthOptions = (months: string[]) =>
    buildMonthOptions(pickerValue().year(), months, config.validRange)

  const weekLabels = (shortWeekDays: string[], weekFirstDay: number) => {
    const labels: string[] = []
    for (let i = 0; i < 7; i += 1) {
      labels.push(shortWeekDays[(i + weekFirstDay) % 7])
    }
    return labels
  }

  return {
    value, mode, panelMode, pickerValue, today,
    dateGrid, monthGrid,
    isCellDisabled, isDateSelected, isMonthSelected,
    selectDate, selectMonth, setPickerValue, setMode,
    yearOptions, monthOptions, weekLabels,
  }
}

export const calendarSplits: (keyof CalendarPanelConfig)[] = [
  'value', 'defaultValue', 'now', 'mode', 'defaultMode',
  'validRange', 'disabledDate',
  'onChange', 'onSelect', 'onPanelChange',
]
