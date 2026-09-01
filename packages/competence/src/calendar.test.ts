import { createRoot, flush } from 'solid-js'
import dayjs, { Dayjs } from 'dayjs'
import { describe, expect, it, vi } from 'vitest'
import { createCalendarPanel } from './calendar'

const NOW = dayjs('2026-08-31')

const boot = (config: Parameters<typeof createCalendarPanel>[0]) =>
  createRoot(() => createCalendarPanel({ now: NOW, ...config }))

describe('createCalendarPanel — value & mode', () => {
  it('defaults value/mode to now and month', () => {
    const cal = boot({})
    expect(cal.value().format('YYYY-MM-DD')).toBe('2026-08-31')
    expect(cal.mode()).toBe('month')
    expect(cal.panelMode()).toBe('date')
  })

  it('controlled value and mode win over internal signals', () => {
    const cal = boot({ value: dayjs('2024-02-10'), mode: 'year' })
    expect(cal.value().format('YYYY-MM-DD')).toBe('2024-02-10')
    expect(cal.mode()).toBe('year')
    expect(cal.panelMode()).toBe('month')
  })

  it('panelMode flips date ↔ month with mode', () => {
    const cal = boot({ defaultMode: 'month' })
    expect(cal.panelMode()).toBe('date')
    cal.setMode('year')
    flush()
    expect(cal.panelMode()).toBe('month')
  })
})

describe('pickerValue follow', () => {
  it('follows a controlled value landing in another month', () => {
    const cal = boot({ value: dayjs('2024-02-10') })
    expect(cal.pickerValue().format('YYYY-MM')).toBe('2024-02')
  })

  it('keeps panel position after explicit navigation', () => {
    const cal = boot({ defaultValue: dayjs('2026-08-31') })
    cal.setPickerValue(dayjs('2026-01-15'))
    flush()
    expect(cal.pickerValue().format('YYYY-MM')).toBe('2026-01')
    // selectDate in the SAME month keeps the panel where it is
    cal.selectDate(dayjs('2026-01-08'))
    flush()
    expect(cal.pickerValue().format('YYYY-MM')).toBe('2026-01')
  })
})

describe('event routing (antd parity)', () => {
  it('fires onSelect on every click but onChange only on change', () => {
    const onSelect = vi.fn()
    const onChange = vi.fn()
    const cal = boot({ defaultValue: dayjs('2026-08-31'), onSelect, onChange })
    cal.selectDate(dayjs('2026-08-12'))
    flush()
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(dayjs('2026-08-12'), 'date')
    expect(onChange).toHaveBeenCalledTimes(1)
    // Same-date click: select fires, change does not.
    cal.selectDate(dayjs('2026-08-12'))
    flush()
    expect(onSelect).toHaveBeenCalledTimes(2)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('adds onPanelChange when a date click crosses the month', () => {
    const onPanelChange = vi.fn()
    const onChange = vi.fn()
    const cal = boot({ defaultValue: dayjs('2026-08-31'), onPanelChange, onChange })
    cal.selectDate(dayjs('2026-09-05'))
    flush()
    expect(onPanelChange).toHaveBeenCalledWith(dayjs('2026-09-05'), 'month')
    expect(onChange).toHaveBeenCalledWith(dayjs('2026-09-05'))
    // Same-month click: no panel event.
    onPanelChange.mockClear()
    cal.selectDate(dayjs('2026-09-08'))
    flush()
    expect(onPanelChange).not.toHaveBeenCalled()
  })

  it('setMode fires onPanelChange with the current value and new mode', () => {
    const onPanelChange = vi.fn()
    const cal = boot({ defaultValue: dayjs('2026-08-31'), onPanelChange })
    cal.setMode('year')
    flush()
    expect(onPanelChange).toHaveBeenCalledWith(dayjs('2026-08-31'), 'year')
  })

  it('setPickerValue fires onPanelChange and header-source onSelect', () => {
    const onPanelChange = vi.fn()
    const onSelect = vi.fn()
    const cal = boot({ defaultValue: dayjs('2026-08-31'), onPanelChange, onSelect })
    cal.setPickerValue(dayjs('2026-05-01'), 'month')
    flush()
    expect(onPanelChange).toHaveBeenCalledWith(dayjs('2026-05-01'), 'month')
    expect(onSelect).toHaveBeenCalledWith(dayjs('2026-05-01'), 'month')
  })
})

describe('disabled gating', () => {
  it('blocks cells outside validRange', () => {
    const cal = boot({
      defaultValue: dayjs('2026-08-31'),
      validRange: [dayjs('2026-08-01'), dayjs('2026-08-20')],
    })
    expect(cal.isCellDisabled(dayjs('2026-08-15'))).toBe(false)
    expect(cal.isCellDisabled(dayjs('2026-08-21'))).toBe(true)
    const onChange = vi.fn()
    // selectDate on a disabled cell is a no-op
    const cal2 = boot({
      defaultValue: dayjs('2026-08-31'),
      validRange: [dayjs('2026-08-01'), dayjs('2026-08-20')],
      onChange,
    })
    cal2.selectDate(dayjs('2026-08-25'))
    flush()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('blocks cells via disabledDate', () => {
    const cal = boot({
      defaultValue: dayjs('2026-08-31'),
      disabledDate: (d: Dayjs) => d.day() === 0, // Sundays
    })
    expect(cal.isCellDisabled(dayjs('2026-08-30'))).toBe(true) // Sunday
    expect(cal.isCellDisabled(dayjs('2026-08-29'))).toBe(false) // Saturday
  })

  it('month cells need both month ends disabled (rc mergedDisabledDate)', () => {
    const cal = boot({
      defaultMode: 'year',
      disabledDate: (d: Dayjs) => d.isBefore(dayjs('2026-03-10')),
    })
    // January 2026: first day (01-01) and last day (01-31) both before 03-10.
    expect(cal.isCellDisabled(dayjs('2026-01-15'))).toBe(true)
    // March 2026: 03-01 disabled but 03-31 not → month selectable.
    expect(cal.isCellDisabled(dayjs('2026-03-15'))).toBe(false)
  })
})

describe('month-panel selection', () => {
  it('selectMonth keeps the value day-of-month', () => {
    const cal = boot({ defaultValue: dayjs('2026-08-31'), defaultMode: 'year' })
    cal.selectMonth(dayjs('2026-02-01'))
    flush()
    expect(cal.value().format('YYYY-MM-DD')).toBe('2026-02-28')
    // Feb 2026 has 28 days — dayjs clamps 31 → end of month.
    expect(cal.value().month()).toBe(1)
  })
})

describe('grids', () => {
  it('dateGrid returns 42 cells and monthGrid 12', () => {
    const cal = boot({ defaultValue: dayjs('2026-08-31') })
    expect(cal.dateGrid()).toHaveLength(42)
    const yearCal = boot({ defaultMode: 'year', defaultValue: dayjs('2026-08-31') })
    expect(yearCal.monthGrid()).toHaveLength(12)
  })

  it('selection flags track the value', () => {
    const cal = boot({ defaultValue: dayjs('2026-08-15') })
    expect(cal.isDateSelected(dayjs('2026-08-15'))).toBe(true)
    expect(cal.isDateSelected(dayjs('2026-08-16'))).toBe(false)
    const yearCal = boot({ defaultMode: 'year', defaultValue: dayjs('2026-08-15') })
    expect(yearCal.isMonthSelected(dayjs('2026-08-01'))).toBe(true)
    expect(yearCal.isMonthSelected(dayjs('2026-09-01'))).toBe(false)
  })
})

describe('header options', () => {
  const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
  it('yearOptions centers on the panel year', () => {
    const cal = boot({ defaultValue: dayjs('2026-08-31') })
    const opts = cal.yearOptions()
    expect(opts).toHaveLength(20)
    expect(opts[0].value).toBe(2016)
  })

  it('monthOptions clips by validRange in the boundary year', () => {
    const cal = boot({
      defaultValue: dayjs('2026-08-31'),
      validRange: [dayjs('2026-03-15'), dayjs('2026-10-20')],
    })
    const opts = cal.monthOptions(months)
    expect(opts).toHaveLength(8)
    expect(opts[0].value).toBe(2)
  })

  it('weekLabels rotates by the week-first-day', () => {
    const cal = boot({})
    const sunFirst = ['日','一','二','三','四','五','六']
    expect(cal.weekLabels(sunFirst, 0)).toEqual(sunFirst)
    expect(cal.weekLabels(sunFirst, 1)).toEqual(['一','二','三','四','五','六','日'])
  })
})
