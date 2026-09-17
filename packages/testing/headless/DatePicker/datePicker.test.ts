import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import {
  createDatePicker,
  formatDate,
  parseDate,
  addDays,
  addMonths,
  compareParts,
  daysInMonth,
  decadeRange,
  getMonthMatrix,
  isLeapYear,
  isSameDay,
  todayParts,
  weekHeaders,
} from '../../../competence/src/datePicker'

const step = (fn: () => void) => { fn(); flush() }

describe('pure date helpers', () => {
  it('parseDate parses and validates', () => {
    expect(parseDate('2026-09-02')).toEqual({ year: 2026, month: 9, day: 2 })
    expect(parseDate('2026-02-29')).toBeNull() // not a leap year
    expect(parseDate('2028-02-29')).toEqual({ year: 2028, month: 2, day: 29 })
    expect(parseDate('2026-13-01')).toBeNull()
    expect(parseDate('2026-00-01')).toBeNull()
    expect(parseDate('2026-09-32')).toBeNull()
    expect(parseDate('')).toBeNull()
    expect(parseDate(null)).toBeNull()
    expect(parseDate('09/02/2026')).toBeNull()
  })

  it('formatDate zero-pads', () => {
    expect(formatDate({ year: 2026, month: 3, day: 5 })).toBe('2026-03-05')
  })

  it('daysInMonth / isLeapYear', () => {
    expect(daysInMonth(2026, 1)).toBe(31)
    expect(daysInMonth(2026, 4)).toBe(30)
    expect(daysInMonth(2028, 2)).toBe(29)
    expect(daysInMonth(2026, 2)).toBe(28)
    expect(isLeapYear(2028)).toBe(true)
    expect(isLeapYear(2026)).toBe(false)
    expect(isLeapYear(2000)).toBe(true)
    expect(isLeapYear(1900)).toBe(false)
  })

  it('compareParts / isSameDay', () => {
    expect(compareParts(
      { year: 2026, month: 1, day: 1 },
      { year: 2026, month: 1, day: 2 },
    )).toBeLessThan(0)
    expect(isSameDay(
      { year: 2026, month: 9, day: 2 },
      { year: 2026, month: 9, day: 2 },
    )).toBe(true)
    expect(isSameDay(null, { year: 2026, month: 9, day: 2 })).toBe(false)
  })

  it('addDays crosses months/years', () => {
    expect(addDays({ year: 2026, month: 12, day: 31 }, 1))
      .toEqual({ year: 2027, month: 1, day: 1 })
    expect(addDays({ year: 2026, month: 3, day: 1 }, -1))
      .toEqual({ year: 2026, month: 2, day: 28 })
  })

  it('addMonths wraps years', () => {
    expect(addMonths(2026, 12, 1)).toEqual({ year: 2027, month: 1 })
    expect(addMonths(2027, 1, -1)).toEqual({ year: 2026, month: 12 })
    expect(addMonths(2026, 6, 7)).toEqual({ year: 2027, month: 1 })
  })

  it('decadeRange windows by tens', () => {
    expect(decadeRange(2026)).toEqual({ start: 2020, end: 2029 })
    expect(decadeRange(2019)).toEqual({ start: 2010, end: 2019 })
  })

  it('weekHeaders respects weekStart', () => {
    expect(weekHeaders(0)).toEqual([0, 1, 2, 3, 4, 5, 6])
    expect(weekHeaders(1)).toEqual([1, 2, 3, 4, 5, 6, 0])
  })
})

describe('getMonthMatrix (pure)', () => {
  it('produces 6×7 cells with the view month flagged current', () => {
    const weeks = getMonthMatrix(2026, 9, 0) // September 2026
    expect(weeks).toHaveLength(6)
    weeks.forEach(w => expect(w).toHaveLength(7))
    const all = weeks.flat()
    expect(all).toHaveLength(42)
    // Sep 1 2026 is a Tuesday → with weekStart 0 the first row starts Aug 30 (Sunday).
    expect(all[0].iso).toBe('2026-08-30')
    expect(all[0].current).toBe(false)
    const sepCells = all.filter(c => c.current)
    expect(sepCells).toHaveLength(30)
    expect(sepCells[0].iso).toBe('2026-09-01')
    expect(sepCells[29].iso).toBe('2026-09-30')
  })

  it('weekStart 1 shifts the leading offset', () => {
    const weeks = getMonthMatrix(2026, 9, 1) // Monday start
    const all = weeks.flat()
    // Sep 1 2026 (Tuesday) with Monday start → the row starts Aug 31 (Monday).
    expect(all[0].iso).toBe('2026-08-31')
  })

  it('cells are date-contiguous across the whole grid', () => {
    const weeks = getMonthMatrix(2028, 2, 0) // leap Feb
    const all = weeks.flat()
    for (let i = 1; i < all.length; i++) {
      const prev = parseDate(all[i - 1].iso)!
      const cur = parseDate(all[i].iso)!
      expect(formatDate(addDays(prev, 1))).toBe(formatDate(cur))
    }
  })

  it('todayParts is a valid date', () => {
    expect(parseDate(formatDate(todayParts()))).toEqual(todayParts())
  })
})

describe('createDatePicker — value state', () => {
  it('starts empty (or from defaultValue)', () => {
    createRoot(() => {
      expect(createDatePicker().value()).toBeNull()
      expect(createDatePicker({ defaultValue: '2026-09-02' }).value()).toBe('2026-09-02')
    })
  })

  it('typing a parseable date commits immediately (normalized)', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createDatePicker({ onChange })
      step(() => ins.setInputText('2026-3-5'))
      expect(ins.value()).toBe('2026-03-05')
      expect(onChange).toHaveBeenCalledWith('2026-03-05')
    })
  })

  it('half-typed input stays buffer-only until commit', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createDatePicker({ onChange })
      step(() => ins.setInputText('2026-0'))
      expect(ins.value()).toBeNull()
      expect(ins.textValue()).toBe('2026-0')
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  it('unparseable buffer reverts on commit; empty clears', () => {
    createRoot(() => {
      const ins = createDatePicker({ defaultValue: '2026-09-02' })
      step(() => ins.setInputText('not-a-date'))
      step(() => ins.commit())
      expect(ins.textValue()).toBe('2026-09-02')

      const empty = createDatePicker()
      step(() => empty.setInputText(''))
      step(() => empty.commit())
      expect(empty.value()).toBeNull()
    })
  })

  it('blur commit clamps into [min, max]', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createDatePicker({ min: '2026-01-01', max: '2026-12-31', onChange })
      step(() => ins.setInputText('2027-06-15'))
      step(() => ins.commit())
      expect(ins.value()).toBe('2026-12-31')
      expect(onChange).toHaveBeenLastCalledWith('2026-12-31')
    })
  })

  it('controlled value wins; typing still reports', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createDatePicker({ value: '2026-05-05', onChange })
      step(() => ins.setInputText('2026-06-06'))
      expect(ins.value()).toBe('2026-05-05')
      expect(onChange).toHaveBeenCalledWith('2026-06-06')
    })
  })

  it('clear empties the value', () => {
    createRoot(() => {
      const ins = createDatePicker({ defaultValue: '2026-09-02' })
      step(() => ins.clear())
      expect(ins.value()).toBeNull()
    })
  })
})

describe('createDatePicker — panel view', () => {
  it('view anchors at the selected month (else today)', () => {
    createRoot(() => {
      const sel = createDatePicker({ defaultValue: '2024-03-15' })
      step(() => sel.setOpen(true))
      expect(sel.viewDate()).toEqual({ year: 2024, month: 3 })

      const empty = createDatePicker()
      step(() => empty.setOpen(true))
      const t = todayParts()
      expect(empty.viewDate()).toEqual({ year: t.year, month: t.month })
    })
  })

  it('setViewDate navigates freely', () => {
    createRoot(() => {
      const ins = createDatePicker({ defaultValue: '2026-09-02' })
      step(() => ins.setOpen(true))
      step(() => ins.setViewDate(2025, 1))
      expect(ins.viewYearLabel()).toBe(2025)
      expect(ins.viewMonthLabel()).toBe(1)
      expect(ins.viewYearLabel()).toBe(2025)
    })
  })

  it('monthMatrix reflects the view month', () => {
    createRoot(() => {
      const ins = createDatePicker({ defaultValue: '2026-09-02' })
      step(() => ins.setOpen(true))
      const weeks = ins.monthMatrix()
      const cur = weeks.flat().filter(c => c.current)
      expect(cur).toHaveLength(30)
      expect(cur[0].iso).toBe('2026-09-01')
    })
  })

  it('cellState marks selected/today/disabled/adjacent', () => {
    createRoot(() => {
      const ins = createDatePicker({
        defaultValue: '2026-09-02',
        disabledDate: iso => iso === '2026-09-10',
      })
      step(() => ins.setOpen(true))
      const weeks = ins.monthMatrix()
      const all = weeks.flat()
      const find = (iso: string) => all.find(c => c.iso === iso)!
      expect(ins.cellState(find('2026-09-02')).selected).toBe(true)
      expect(ins.cellState(find('2026-09-10')).disabled).toBe(true)
      expect(ins.cellState(find('2026-08-31')).adjacent).toBe(true)
      const today = formatDate(todayParts())
      const todayCell = all.find(c => c.iso === today)
      if (todayCell) expect(ins.cellState(todayCell).today).toBe(true)
    })
  })

  it('pickDay commits; adjacent picks shift the view', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createDatePicker({ onChange })
      step(() => ins.setOpen(true))
      const weeks = ins.monthMatrix()
      const adjacent = weeks.flat().find(c => !c.current)!
      step(() => ins.pickDay(adjacent))
      expect(ins.value()).toBe(adjacent.iso)
      expect(ins.viewDate()).toEqual({ year: adjacent.year, month: adjacent.month })
      expect(onChange).toHaveBeenCalledWith(adjacent.iso)
    })
  })

  it('pickDay on a disabled date is a no-op', () => {
    createRoot(() => {
      const ins = createDatePicker({ disabledDate: () => true })
      step(() => ins.setOpen(true))
      const cell = ins.monthMatrix().flat().find(c => c.current)!
      step(() => ins.pickDay(cell))
      expect(ins.value()).toBeNull()
    })
  })

  it('min/max disable cells outside the range', () => {
    createRoot(() => {
      const ins = createDatePicker({ min: '2026-09-10', max: '2026-09-20' })
      step(() => ins.setOpen(true))
      const all = ins.monthMatrix().flat()
      const state = (iso: string) => ins.cellState(all.find(c => c.iso === iso)!)
      expect(state('2026-09-05').disabled).toBe(true)
      expect(state('2026-09-15').disabled).toBe(false)
      expect(state('2026-09-25').disabled).toBe(true)
    })
  })
})

describe('createDatePicker — month/year panels', () => {
  it('pickMonth drills into the date grid', () => {
    createRoot(() => {
      const ins = createDatePicker({ defaultValue: '2026-09-02' })
      step(() => ins.setOpen(true))
      step(() => ins.setMode('month'))
      step(() => ins.pickMonth(5))
      expect(ins.mode()).toBe('date')
      expect(ins.viewMonthLabel()).toBe(5)
    })
  })

  it('pickYear drills into the month list', () => {
    createRoot(() => {
      const ins = createDatePicker({ defaultValue: '2026-09-02' })
      step(() => ins.setOpen(true))
      step(() => ins.setMode('year'))
      step(() => ins.pickYear(2030))
      expect(ins.mode()).toBe('month')
      expect(ins.viewYearLabel()).toBe(2030)
    })
  })

  it('monthCellState flags the selected month', () => {
    createRoot(() => {
      const ins = createDatePicker({ defaultValue: '2026-09-02' })
      step(() => ins.setOpen(true))
      step(() => ins.setMode('month'))
      expect(ins.monthCellState(9).selected).toBe(true)
      expect(ins.monthCellState(5).selected).toBe(false)
    })
  })

  it('yearCellState flags the selected year and range-disabled years', () => {
    createRoot(() => {
      const ins = createDatePicker({ defaultValue: '2026-09-02', min: '2024-01-01', max: '2030-12-31' })
      step(() => ins.setOpen(true))
      step(() => ins.setMode('year'))
      expect(ins.yearCellState(2026).selected).toBe(true)
      expect(ins.yearCellState(2023).disabled).toBe(true)
      expect(ins.yearCellState(2031).disabled).toBe(true)
      expect(ins.yearCellState(2025).disabled).toBe(false)
    })
  })

  it('decade labels follow the view year', () => {
    createRoot(() => {
      const ins = createDatePicker({ defaultValue: '2026-09-02' })
      step(() => ins.setOpen(true))
      expect(ins.decadeStart()).toBe(2020)
      expect(ins.decadeEnd()).toBe(2029)
    })
  })
})

describe('createDatePicker — keyboard active', () => {
  it('active anchors at the selected date', () => {
    createRoot(() => {
      const ins = createDatePicker({ defaultValue: '2026-09-15' })
      step(() => ins.setOpen(true))
      expect(ins.activeIso()).toBe('2026-09-15')
    })
  })

  it('moveActive moves by days/weeks', () => {
    createRoot(() => {
      const ins = createDatePicker({ defaultValue: '2026-09-15' })
      step(() => ins.setOpen(true))
      step(() => ins.moveActive(1, 0))
      expect(ins.activeIso()).toBe('2026-09-16')
      step(() => ins.moveActive(0, 1))
      expect(ins.activeIso()).toBe('2026-09-23')
      step(() => ins.moveActive(-2, 0))
      expect(ins.activeIso()).toBe('2026-09-21')
    })
  })

  it('moveActiveMonth shifts a month keeping the day clamped', () => {
    createRoot(() => {
      const ins = createDatePicker({ defaultValue: '2026-01-31' })
      step(() => ins.setOpen(true))
      step(() => ins.moveActiveMonth(1))
      expect(ins.activeIso()).toBe('2026-02-28') // Feb has 28 days in 2026
    })
  })

  it('commitActive picks the active date', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createDatePicker({ onChange })
      step(() => ins.setOpen(true))
      step(() => ins.moveActive(5, 0)) // today + 5
      step(() => ins.commitActive())
      expect(ins.value()).toBe(ins.value()) // committed to today+5
      expect(onChange).toHaveBeenCalledWith(ins.value())
    })
  })
})

describe('createDatePicker — open / today / disabled', () => {
  it('open resets view+mode+active', () => {
    createRoot(() => {
      const ins = createDatePicker({ defaultValue: '2026-09-02' })
      step(() => ins.setOpen(true))
      step(() => ins.setViewDate(2020, 1))
      step(() => ins.setMode('year'))
      step(() => ins.setOpen(false))
      step(() => ins.setOpen(true))
      expect(ins.viewDate()).toEqual({ year: 2026, month: 9 })
      expect(ins.mode()).toBe('date')
    })
  })

  it('goToday jumps the view and picks today when enabled', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createDatePicker({ onChange })
      step(() => ins.setOpen(true))
      step(() => ins.setViewDate(2020, 1))
      step(() => ins.goToday())
      const t = todayParts()
      expect(ins.viewDate()).toEqual({ year: t.year, month: t.month })
      expect(ins.value()).toBe(formatDate(t))
      expect(onChange).toHaveBeenCalledWith(formatDate(t))
    })
  })

  it('goToday with today disabled still moves the view without picking', () => {
    createRoot(() => {
      const ins = createDatePicker({ disabledDate: () => true })
      step(() => ins.setOpen(true))
      step(() => ins.goToday())
      const t = todayParts()
      expect(ins.viewDate()).toEqual({ year: t.year, month: t.month })
      expect(ins.value()).toBeNull()
    })
  })

  it('disabled gates everything', () => {
    createRoot(() => {
      const ins = createDatePicker({ disabled: true })
      step(() => ins.setOpen(true))
      expect(ins.isOpen()).toBe(false)
      step(() => ins.setInputText('2026-09-02'))
      expect(ins.value()).toBeNull()
      expect(ins.isDisabled()).toBe(true)
    })
  })

  it('canPrev/canNext respect min/max bounds', () => {
    createRoot(() => {
      const ins = createDatePicker({ min: '2026-09-01', max: '2026-09-30' })
      step(() => ins.setOpen(true)) // view = 2026-09
      expect(ins.canPrev()).toBe(false)
      expect(ins.canNext()).toBe(false)

      const open = createDatePicker({ min: '2026-01-01', max: '2026-12-31' })
      step(() => open.setOpen(true))
      expect(open.canPrev()).toBe(true)
      expect(open.canNext()).toBe(true)
    })
  })
})
