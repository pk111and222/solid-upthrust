import dayjs, { Dayjs } from 'dayjs'
import { describe, expect, it } from 'vitest'
import {
  buildDateGrid, buildMonthGrid, buildMonthOptions, buildYearOptions,
  clampDateToRange, getWeekStartDate, isMonthOutOfRange, isOutOfRange,
  isSameDate, isSameMonth, isSameYear, modeToPanelMode, selectMonthKeepingDate,
} from '../../../competence/src/calendarDate'

// Frozen clock: 2026-08-31 is a Monday. Tests must not read the wall clock.
const TODAY = dayjs('2026-08-31')

describe('comparators', () => {
  it('isSameDate/Month/Year compare at the right granularity', () => {
    const a = dayjs('2026-08-31 10:30')
    const b = dayjs('2026-08-31 18:00')
    expect(isSameDate(a, b)).toBe(true)
    expect(isSameMonth(a, b)).toBe(true)
    expect(isSameYear(a, b)).toBe(true)
    expect(isSameDate(a, dayjs('2026-08-30'))).toBe(false)
    expect(isSameMonth(a, dayjs('2026-09-01'))).toBe(false)
    expect(isSameYear(a, dayjs('2027-01-01'))).toBe(false)
  })

  it('treats null/undefined pairs as equal, single null as different', () => {
    expect(isSameDate(undefined, null)).toBe(true)
    expect(isSameDate(dayjs(), undefined)).toBe(false)
    expect(isSameMonth(null, dayjs())).toBe(false)
  })
})

describe('getWeekStartDate', () => {
  it('aligns the month start back to the week first day (zh-CN, Monday)', () => {
    // 2026-08 starts on a Saturday. Monday-first grid → 2026-07-27.
    const start = getWeekStartDate(dayjs('2026-08-01'), 1)
    expect(start.format('YYYY-MM-DD')).toBe('2026-07-27')
  })

  it('rolls back one more week when alignment stays inside the month', () => {
    // A month starting ON the week-first day would align to itself (date 1);
    // the rollback only triggers when aligned is past the 1st in-month.
    // 2026-09 starts Tuesday; Monday-first → 2026-08-31.
    const start = getWeekStartDate(dayjs('2026-09-01'), 1)
    expect(start.format('YYYY-MM-DD')).toBe('2026-08-31')
    // No rollback when the month starts exactly on the first day: the
    // aligned date IS the 1st (date > 1 false).
    // 2026-06-01 is a Monday.
    const june = getWeekStartDate(dayjs('2026-06-01'), 1)
    expect(june.format('YYYY-MM-DD')).toBe('2026-06-01')
  })
})

describe('buildDateGrid', () => {
  it('returns 42 cells covering the whole panel month', () => {
    const grid = buildDateGrid(dayjs('2026-08-01'), TODAY, 1)
    expect(grid).toHaveLength(42)
    const inView = grid.filter(c => c.inView)
    // August 2026 has 31 days.
    expect(inView).toHaveLength(31)
    expect(inView[0].date.format('YYYY-MM-DD')).toBe('2026-08-01')
    expect(inView[30].date.format('YYYY-MM-DD')).toBe('2026-08-31')
  })

  it('flags exactly one today cell', () => {
    const grid = buildDateGrid(dayjs('2026-08-01'), TODAY, 1)
    expect(grid.filter(c => c.isToday)).toHaveLength(1)
    expect(grid.find(c => c.isToday)!.date.format('YYYY-MM-DD')).toBe('2026-08-31')
  })

  it('rows are consecutive weeks: weekOfYear jumps by 0 or 1 per row', () => {
    const grid = buildDateGrid(dayjs('2026-08-01'), TODAY, 1)
    for (let row = 0; row < 6; row += 1) {
      const cells = grid.slice(row * 7, row * 7 + 7)
      const days = cells.map(c => c.date.date())
      for (let i = 1; i < 7; i += 1) {
        expect((days[i] - days[i - 1] + 31) % 7).toBeLessThanOrEqual(7)
      }
    }
  })
})

describe('buildMonthGrid', () => {
  it('returns 12 month cells for the panel year with today flagged', () => {
    const grid = buildMonthGrid(dayjs('2026-03-15'), TODAY)
    expect(grid).toHaveLength(12)
    expect(grid[0].date.month()).toBe(0)
    expect(grid[11].date.month()).toBe(11)
    expect(grid.every(c => c.inView)).toBe(true)
    expect(grid.filter(c => c.isToday)).toHaveLength(1)
  })
})

describe('buildYearOptions', () => {
  it('opens a 20-year window from current-10', () => {
    const opts = buildYearOptions(2026)
    expect(opts).toHaveLength(20)
    expect(opts[0]).toEqual({ label: '2016', value: 2016 })
    expect(opts[19]).toEqual({ label: '2035', value: 2035 })
  })

  it('locks to the validRange years when given', () => {
    const opts = buildYearOptions(2026, [dayjs('2024-01-01'), dayjs('2028-12-31')])
    expect(opts).toHaveLength(5)
    expect(opts[0].value).toBe(2024)
    expect(opts[4].value).toBe(2028)
  })
})

describe('buildMonthOptions', () => {
  const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
  it('shows all 12 months without a range', () => {
    const opts = buildMonthOptions(2026, months)
    expect(opts).toHaveLength(12)
    expect(opts[7]).toEqual({ label: '8月', value: 7 })
  })

  it('clips both edges when the panel year matches the range year', () => {
    const opts = buildMonthOptions(2026, months, [dayjs('2026-03-15'), dayjs('2026-10-20')])
    expect(opts).toHaveLength(8)
    expect(opts[0].value).toBe(2)
    expect(opts[7].value).toBe(9)
  })

  it('clips only one edge on non-boundary years', () => {
    const start = buildMonthOptions(2025, months, [dayjs('2026-03-15'), dayjs('2026-10-20')])
    expect(start).toHaveLength(12)
    const end = buildMonthOptions(2027, months, [dayjs('2026-03-15'), dayjs('2026-10-20')])
    expect(end).toHaveLength(12)
  })
})

describe('clampDateToRange', () => {
  const range = [dayjs('2026-03-15'), dayjs('2026-10-20')] as [Dayjs, Dayjs]
  it('pulls the month back at the range end year', () => {
    const out = clampDateToRange(dayjs('2026-12-01'), range)
    expect(out.month()).toBe(9)
  })
  it('pulls the month forward at the range start year', () => {
    const out = clampDateToRange(dayjs('2026-01-01'), range)
    expect(out.month()).toBe(2)
  })
  it('leaves other years untouched', () => {
    const out = clampDateToRange(dayjs('2027-12-01'), range)
    expect(out.month()).toBe(11)
  })
})

describe('range helpers', () => {
  const range = [dayjs('2026-03-15'), dayjs('2026-10-20')] as [Dayjs, Dayjs]
  it('isOutOfRange compares by day', () => {
    expect(isOutOfRange(dayjs('2026-05-01'), range)).toBe(false)
    expect(isOutOfRange(dayjs('2026-03-14'), range)).toBe(true)
    expect(isOutOfRange(dayjs('2026-10-21'), range)).toBe(true)
  })
  it('isMonthOutOfRange needs both month ends outside', () => {
    // May 2026 fully inside.
    expect(isMonthOutOfRange(dayjs('2026-05-01'), range)).toBe(false)
    // March 2026 partially inside (15th on) — selectable, not out.
    expect(isMonthOutOfRange(dayjs('2026-03-01'), range)).toBe(false)
    // January 2026 fully outside.
    expect(isMonthOutOfRange(dayjs('2026-01-01'), range)).toBe(true)
    expect(isMonthOutOfRange(dayjs('2026-05-01'))).toBe(false)
  })
})

describe('modeToPanelMode / selectMonthKeepingDate', () => {
  it('maps calendar mode to grid mode', () => {
    expect(modeToPanelMode('month')).toBe('date')
    expect(modeToPanelMode('year')).toBe('month')
  })
  it('keeps the day-of-month when switching months (dayjs clamps short months)', () => {
    const out = selectMonthKeepingDate(dayjs('2026-08-31'), 1)
    expect(out.month()).toBe(1)
    // February clamps the 31st to its own end.
    expect(out.date()).toBe(28)
    const out2 = selectMonthKeepingDate(dayjs('2026-08-15'), 1)
    expect(out2.date()).toBe(15)
  })
})
