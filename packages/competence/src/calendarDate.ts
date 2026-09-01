import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday.js";
import weekOfYear from "dayjs/plugin/weekOfYear.js";
import localeData from "dayjs/plugin/localeData.js";
import advancedFormat from "dayjs/plugin/advancedFormat.js";

/**
 * Headless date computation for Calendar — the pure math layer the panel
 * state machine and (later) the DatePicker both sit on. Zero signals: every
 * function takes Dayjs values (plus an injected `today`) and returns plain
 * structures, so tests freeze the clock by passing a fixed date.
 *
 * Mirrors the @rc-component/picker dateUtil subset Calendar needs:
 * week-start alignment with the 6-row rollback, date/month grids, and the
 * validRange clamping the year/month selects apply.
 */

// Idempotent plugin registration (rc generate/dayjs does the same).
dayjs.extend(weekday)
dayjs.extend(weekOfYear)
dayjs.extend(localeData)
dayjs.extend(advancedFormat)

export { dayjs, type Dayjs }

/** Calendar mode — what the whole component shows. */
export type CalendarMode = 'month' | 'year'

/** Source of a select event, antd parity. */
export type CalendarSelectSource = 'year' | 'month' | 'date' | 'customize'

/** One grid cell: a Dayjs anchor plus the flags the renderer styles on. */
export type CalendarCell = {
  date: Dayjs
  /** True when the cell belongs to the panel's own month/year. */
  inView: boolean
  isToday: boolean
  /** Week-of-year for the row this date starts (showWeek column). */
  weekOfYear: number
}

/** Year/month select option rows (calendar header). */
export type CalendarOption = { label: string; value: number }

const WEEK_DAY_COUNT = 7
const DATE_ROW_COUNT = 6

export const isSameYear = (a?: Dayjs | null, b?: Dayjs | null): boolean => {
  if (!a && !b) return true
  if (!a || !b) return false
  return a.year() === b.year()
}

export const isSameMonth = (a?: Dayjs | null, b?: Dayjs | null): boolean => {
  if (!a && !b) return true
  if (!a || !b) return false
  return isSameYear(a, b) && a.month() === b.month()
}

export const isSameDate = (a?: Dayjs | null, b?: Dayjs | null): boolean => {
  if (!a && !b) return true
  if (!a || !b) return false
  return isSameMonth(a, b) && a.date() === b.date()
}

/**
 * First cell of the date grid — rc's getWeekStartDate: align the month's
 * 1st backward to the week's first day, then roll back one more week when
 * that landed inside the SAME month past the 1st (a month starting late in
 * the week still needs 6 rows to cover its tail).
 */
export const getWeekStartDate = (monthStart: Dayjs, weekFirstDay: number): Dayjs => {
  const startDateWeekDay = monthStart.weekday() + monthStart.localeData().firstDayOfWeek()
  let aligned = monthStart.add(weekFirstDay - startDateWeekDay, 'day')
  if (aligned.month() === monthStart.month() && aligned.date() > 1) {
    aligned = aligned.add(-7, 'day')
  }
  return aligned
}

/**
 * The 7×6 date grid anchored on the panel month. `weekFirstDay` follows
 * dayjs's locale (zh-CN: 1=Monday, en: 0=Sunday).
 */
export const buildDateGrid = (
  pickerValue: Dayjs,
  today: Dayjs,
  weekFirstDay: number,
): CalendarCell[] => {
  const monthStart = pickerValue.startOf('month')
  const base = getWeekStartDate(monthStart, weekFirstDay)
  const cells: CalendarCell[] = []
  for (let i = 0; i < WEEK_DAY_COUNT * DATE_ROW_COUNT; i += 1) {
    const date = base.add(i, 'day')
    cells.push({
      date,
      inView: isSameMonth(date, pickerValue),
      isToday: isSameDate(date, today),
      weekOfYear: date.week(),
    })
  }
  return cells
}

/** The 3×4 month grid anchored on the panel year. */
export const buildMonthGrid = (pickerValue: Dayjs, today: Dayjs): CalendarCell[] => {
  const base = pickerValue.startOf('year')
  const cells: CalendarCell[] = []
  for (let i = 0; i < 12; i += 1) {
    const date = base.add(i, 'month')
    cells.push({
      date,
      inView: true,
      isToday: isSameMonth(date, today),
      weekOfYear: 0,
    })
  }
  return cells
}

/**
 * Year select options — antd Header: a 20-year window centered-ish on the
 * current year (current-10 .. current+9), or exactly the validRange years
 * when one is given.
 */
export const buildYearOptions = (
  year: number,
  validRange?: [Dayjs, Dayjs],
): CalendarOption[] => {
  let start = year - 10
  let end = start + 20
  if (validRange) {
    start = validRange[0].year()
    end = validRange[1].year() + 1
  }
  const options: CalendarOption[] = []
  for (let i = start; i < end; i += 1) {
    options.push({ label: String(i), value: i })
  }
  return options
}

/**
 * Month select options — 0..11, clipped to the validRange when the panel
 * year touches its edges (rc MonthSelect).
 */
export const buildMonthOptions = (
  year: number,
  months: string[],
  validRange?: [Dayjs, Dayjs],
): CalendarOption[] => {
  let start = 0
  let end = 11
  if (validRange) {
    if (validRange[1].year() === year) end = validRange[1].month()
    if (validRange[0].year() === year) start = validRange[0].month()
  }
  const options: CalendarOption[] = []
  for (let i = start; i <= end; i += 1) {
    options.push({ label: months[i] ?? String(i + 1), value: i })
  }
  return options
}

/**
 * Clamp a year/month-picked date into the validRange — rc YearSelect
 * semantics: switching to the range's boundary year pulls the month back
 * inside the range.
 */
export const clampDateToRange = (date: Dayjs, validRange?: [Dayjs, Dayjs]): Dayjs => {
  if (!validRange) return date
  const [start, end] = validRange
  let next = date
  if (next.year() === end.year() && next.month() > end.month()) {
    next = next.month(end.month())
  }
  if (next.year() === start.year() && next.month() < start.month()) {
    next = next.month(start.month())
  }
  return next
}

/**
 * Date-grid selection: clicking a date in another month keeps the day-of-
 * month (rc setMonth semantics — no day clamping on the picker's own grid
 * cells because every cell is a real date).
 */
export const selectMonthKeepingDate = (base: Dayjs, month: number): Dayjs =>
  base.month(month)

/** Panel-mode mapping: calendar mode 'year' shows months, 'month' shows dates. */
export const modeToPanelMode = (mode: CalendarMode): 'date' | 'month' =>
  mode === 'year' ? 'month' : 'date'

/**
 * Out-of-range test for whole dates — the merged disabled check
 * (validRange OR disabledDate) is the panel machine's job; this is the pure
 * range half.
 */
export const isOutOfRange = (date: Dayjs, validRange?: [Dayjs, Dayjs]): boolean => {
  if (!validRange) return false
  const [start, end] = validRange
  return date.isBefore(start, 'day') || date.isAfter(end, 'day')
}

/**
 * Month-panel disabled: a month is selectable only when BOTH its first and
 * last days are in range (rc MonthPanel mergedDisabledDate — start AND end
 * must pass the check).
 */
export const isMonthOutOfRange = (date: Dayjs, validRange?: [Dayjs, Dayjs]): boolean => {
  if (!validRange) return false
  const first = date.startOf('month')
  const last = date.endOf('month')
  const firstOut = isOutOfRange(first, validRange)
  const lastOut = isOutOfRange(last, validRange)
  return firstOut && lastOut
}
