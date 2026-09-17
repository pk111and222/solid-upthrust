import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createDatePickerAdvanced, createDateRangePickerAdvanced, startOfPickerPeriod, normalizeTime } from '../../../competence/src/datePickerAdvanced'
const cell = (year:number, month:number, day:number) => ({ year, month, day, iso: `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`, current:true, weekday:0 })
describe('period pickers', () => {
  it('normalizes weeks across year boundaries and quarters', () => {
    expect(startOfPickerPeriod('2026-01-01','week',1)).toBe('2025-12-29')
    expect(startOfPickerPeriod('2026-09-15','quarter')).toBe('2026-07-01')
    expect(startOfPickerPeriod('2026-02-30','quarter')).toBeNull()
  })
  it('starts in the quarter panel and selects its representative date', () => createRoot(() => {
    const picker = createDatePickerAdvanced({ picker:'quarter', defaultValue:'2026-09-15' })
    picker.setOpen(true); flush(); expect(picker.mode()).toBe('month')
    picker.pickMonth(10); flush(); expect(picker.value()).toBe('2026-10-01')
  }))
  it('highlights the entire selected week and honors disabled constraints', () => createRoot(() => {
    const picker = createDatePickerAdvanced({ picker:'week', weekStart:1, defaultValue:'2026-09-15', min:'2026-09-01' })
    expect(picker.cellState(cell(2026,9,20)).selected).toBe(true)
    expect(picker.cellState(cell(2026,9,21)).selected).toBe(false)
    expect(picker.setValue('2026-08-20')).toBe(false)
  }))
})
describe('date/time and presets value path', () => {
  it('retains time while picking a new day, supports time editing and clear', () => createRoot(() => {
    const picker = createDatePickerAdvanced({ showTime:true, defaultValue:'2026-09-15 12:30:45' })
    picker.pickDay(cell(2026,9,16)); flush(); expect(picker.value()).toBe('2026-09-16 12:30:45')
    picker.setTime('08:05'); flush(); expect(picker.value()).toBe('2026-09-16 08:05:00')
    picker.clear(); flush(); expect(picker.value()).toBeNull()
  }))
  it('validates typed dates and times and reverts invalid input', () => createRoot(() => {
    const picker = createDatePickerAdvanced({ showTime:true, defaultValue:'2026-09-15 12:30:00' })
    picker.setInputText('2026-09-16 23:59:59'); flush(); picker.commit(); flush()
    expect(picker.value()).toBe('2026-09-16 23:59:59')
    picker.setInputText('2026-09-16 25:00:00'); flush(); picker.commit(); flush()
    expect(picker.textValue()).toBe('2026-09-16 23:59:59')
    expect(normalizeTime('24:00')).toBeNull()
  }))
  it('does not mutate a controlled value before the parent accepts the change', () => createRoot(() => {
    const onChange = vi.fn()
    const [value, setValue] = createSignal<string|null>('2026-09-15', {ownedWrite:true})
    const picker = createDatePickerAdvanced({ get value() { return value() }, onChange })
    picker.setValue('2026-09-16'); flush(); expect(picker.value()).toBe('2026-09-15'); expect(onChange).toHaveBeenCalledWith('2026-09-16')
    setValue('2026-09-16'); flush(); expect(picker.value()).toBe('2026-09-16')
  }))
  it('validates preset endpoints, preserves time and rejects inverted time edits', () => createRoot(() => {
    const picker = createDateRangePickerAdvanced({showTime:true, min:'2026-09-01', defaultValue:['2026-09-15 09:00:00','2026-09-15 18:00:00']})
    expect(picker.setTime('start','19:00')).toBe(false)
    expect(picker.setValue(['2026-08-01','2026-09-02'])).toBe(false)
    picker.setTime('end','20:00'); flush(); expect(picker.value()?.[1]).toBe('2026-09-15 20:00:00')
    picker.setValue(['2026-09-20 12:00:00','2026-09-22 13:00:00']); flush(); expect(picker.startValue()).toBe('2026-09-20 12:00:00')
  }))
  it('selects both range endpoints through the existing calendar machine', () => createRoot(() => {
    const picker = createDateRangePickerAdvanced({ showTime:true })
    picker.setOpen(true); flush(); picker.pickDay(cell(2026,9,10)); flush(); picker.pickDay(cell(2026,9,12)); flush()
    expect(picker.value()).toEqual(['2026-09-10 00:00:00','2026-09-12 00:00:00'])
  }))
})

it('navigates quarter cells with the keyboard instead of moving by single days', () => createRoot(() => {
  const picker = createDatePickerAdvanced({picker:'quarter',defaultValue:'2026-01-01'})
  picker.setOpen(true); flush(); picker.moveActive(1,0); flush(); picker.commitActive(); flush()
  expect(picker.value()).toBe('2026-04-01')
}))
it('does not accept a date with arbitrary trailing text', () => createRoot(() => {
  const picker = createDatePickerAdvanced({defaultValue:'2026-09-15'})
  expect(picker.setValue('2026-09-16 wrong')).toBe(false)
}))
