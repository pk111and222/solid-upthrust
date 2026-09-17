import { createMemo, createSignal } from 'solid-js'
import {
  createDatePicker, createDateRangePicker, parseDate, formatDate, todayParts, addMonths,
  type DatePickerConfig, type DateRangePickerConfig, type DateRangeValue,
  type DateParts, type MonthCell, type RangeActiveEnd,
} from './datePicker'

export type DatePickerType = 'date' | 'week' | 'month' | 'quarter' | 'year'
export interface DatePickerTimeConfig { defaultValue?: string; format?: 'HH:mm' | 'HH:mm:ss' }
export interface DatePickerAdvancedConfig extends DatePickerConfig {
  picker?: DatePickerType
  showTime?: boolean | DatePickerTimeConfig
}
export interface DateRangePickerAdvancedConfig extends DateRangePickerConfig {
  showTime?: boolean | DatePickerTimeConfig
}
export interface DatePreset<T, Label = string> { label: Label; value: T | (() => T) }
export const normalizeTime = (value: string): string | null => {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value)
  return match && +match[1] < 24 && +match[2] < 60 && +(match[3] ?? '0') < 60 ? `${match[1]}:${match[2]}:${match[3] ?? '00'}` : null
}
const dateOf = (value: string | null | undefined) => value?.trim().split(/[ T]/)[0] ?? null
const timeOf = (value: string | null | undefined) => normalizeTime(value?.split(/[ T]/)[1] ?? '')
export function startOfPickerPeriod(value: string, picker: DatePickerType = 'date', weekStart: 0 | 1 = 0): string | null {
  if (!/^\d{4}-\d{1,2}-\d{1,2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/.test(value.trim())) return null
  const parts = parseDate(dateOf(value))
  if (!parts) return null
  if (picker === 'week') {
    const day = new Date(parts.year, parts.month - 1, parts.day)
    day.setDate(day.getDate() - (day.getDay() - weekStart + 7) % 7)
    return formatDate({ year: day.getFullYear(), month: day.getMonth() + 1, day: day.getDate() })
  }
  if (picker === 'month') parts.day = 1
  if (picker === 'quarter') { parts.month = Math.floor((parts.month - 1) / 3) * 3 + 1; parts.day = 1 }
  if (picker === 'year') { parts.month = 1; parts.day = 1 }
  return formatDate(parts)
}
const initialTime = (config: { showTime?: boolean | DatePickerTimeConfig }) => typeof config.showTime === 'object' ? normalizeTime(config.showTime.defaultValue ?? '') ?? '00:00:00' : '00:00:00'
const allowedDate = (value: string, config: Pick<DatePickerConfig, 'min' | 'max' | 'disabled' | 'disabledDate'>) => {
  const date = dateOf(value)!
  return !!parseDate(date) && !config.disabled && !(config.min && date < dateOf(config.min)!) && !(config.max && date > dateOf(config.max)!) && !config.disabledDate?.(date)
}

/** Adds period/time value semantics while reusing the calendar/navigation state machine. */
export function createDatePickerAdvanced(config: DatePickerAdvancedConfig = {}) {
  const normalize = (input: string | null | undefined) => {
    if (!input) return null
    const date = startOfPickerPeriod(input, config.picker, config.weekStart)
    if (!date) return null
    if (config.showTime) {
      const suppliedTime = input.split(/[ T]/)[1]
      if (suppliedTime !== undefined && !normalizeTime(suppliedTime)) return null
      return `${date} ${timeOf(input) ?? initialTime(config)}`
    }
    return date
  }
  const [local, setLocal] = createSignal<string | null>(normalize(config.defaultValue), { ownedWrite: true })
  const [typed, setTyped] = createSignal<string | undefined>(undefined, { ownedWrite: true })
  let pending = normalize(config.defaultValue)
  const current = () => normalize(config.value !== undefined ? config.value : pending)
  const value = createMemo(() => normalize(config.value !== undefined ? config.value : local()))
  const canSelect = (input: string) => {
    const normalized = normalize(input)
    return !!normalized && allowedDate(normalized, config) && !(config.showTime && ((config.min?.includes(' ') && normalized < config.min) || (config.max?.includes(' ') && normalized > config.max)))
  }
  const setValue = (input: string | null): boolean => {
    if (config.disabled || (input !== null && !canSelect(input))) return false
    const next = normalize(input)
    if (config.value === undefined) { pending = next; setLocal(next) }
    setTyped(undefined); config.onChange?.(next)
    return true
  }
  const base = createDatePicker({
    get value() { return dateOf(value()) },
    get disabled() { return config.disabled }, get disabledDate() { return config.disabledDate },
    get min() { return dateOf(config.min) ?? undefined }, get max() { return dateOf(config.max) ?? undefined },
    get weekStart() { return config.weekStart },
    get onFocus() { return config.onFocus }, get onBlur() { return config.onBlur },
    onChange(date) { setValue(date && config.showTime ? `${date} ${timeOf(current()) ?? initialTime(config)}` : date) },
  })
  const cellFor = (date: DateParts): MonthCell => ({ ...date, iso: formatDate(date), current: true, weekday: new Date(date.year, date.month - 1, date.day).getDay() })
  const setTime = (time: string) => {
    const normalized = normalizeTime(time)
    if (!normalized || !config.showTime) return false
    return setValue(`${dateOf(current()) ?? formatDate(todayParts())} ${normalized}`)
  }
  const pickMonth = (month: number) => {
    if (config.picker === 'month' || config.picker === 'quarter') return setValue(formatDate({ year: base.viewDate().year, month, day: 1 }))
    base.pickMonth(month)
    return false
  }
  const pickYear = (year: number) => {
    if (config.picker === 'year') return setValue(formatDate({ year, month: 1, day: 1 }))
    base.pickYear(year)
    return false
  }
  const commit = () => { if (typed() !== undefined) { setValue(typed()!.trim() || null); setTyped(undefined) } }
  return {
    ...base, value, canSelect, setValue, setTime,
    timeValue: () => timeOf(value()) ?? initialTime(config),
    clear: () => { setValue(null) },
    textValue: () => typed() ?? value() ?? '',
    setInputText: (text: string) => {
      if (config.disabled) return
      if (!config.showTime && parseDate(text) && canSelect(text)) setValue(text)
      else setTyped(text)
    },
    commit,
    notifyBlur: () => { commit(); base.notifyBlur() },
    pickMonth, pickYear,
    yearCellState: (year: number) => ({ ...base.yearCellState(year), disabled: config.picker === 'year' ? !canSelect(formatDate({ year, month: 1, day: 1 })) : base.yearCellState(year).disabled }),
    monthCellState: (month: number) => ({ ...base.monthCellState(month), disabled: config.picker === 'month' || config.picker === 'quarter' ? !canSelect(formatDate({ year: base.viewDate().year, month, day: 1 })) : base.monthCellState(month).disabled }),
    cellState: (cell: MonthCell) => ({ ...base.cellState(cell), selected: config.picker === 'week' ? dateOf(value()) === startOfPickerPeriod(cell.iso, 'week', config.weekStart) : base.cellState(cell).selected, disabled: !canSelect(cell.iso) }),
    commitActive: () => {
      const active = parseDate(base.activeIso())
      if (!active) return false
      if (base.mode() === 'year') return pickYear(active.year)
      if (base.mode() === 'month') return pickMonth(active.month)
      if (!canSelect(formatDate(active))) return false
      base.pickDay(cellFor(active))
      return true
    },
    moveActive: (x: number, y: number) => {
      if (base.mode() === 'date') { base.moveActive(x, y); return }
      const active = parseDate(base.activeIso()) ?? todayParts()
      const next = base.mode() === 'year'
        ? { year: active.year + x + y * 3, month: active.month }
        : addMonths(active.year, active.month, (x + y * 3) * (config.picker === 'quarter' ? 3 : 1))
      base.setActiveIso(formatDate({ ...next, day: 1 }))
      base.setViewDate(next.year, next.month)
    },
    setOpen: (open: boolean) => {
      base.setOpen(open)
      if (open) base.setMode(config.picker === 'year' ? 'year' : config.picker === 'month' || config.picker === 'quarter' ? 'month' : 'date')
    },
  }
}

export function createDateRangePickerAdvanced(config: DateRangePickerAdvancedConfig = {}) {
  const normalizeEnd = (input: string) => {
    const date = startOfPickerPeriod(input)
    if (!date) return null
    if (!config.showTime) return date
    const suppliedTime = input.split(/[ T]/)[1]
    if (suppliedTime !== undefined && !normalizeTime(suppliedTime)) return null
    return `${date} ${timeOf(input) ?? initialTime(config)}`
  }
  const normalize = (pair: DateRangeValue | null | undefined): DateRangeValue | null => {
    if (!pair) return null
    const start = normalizeEnd(pair[0]), end = normalizeEnd(pair[1])
    return start && end ? start <= end ? [start, end] : [end, start] : null
  }
  const [local, setLocal] = createSignal(normalize(config.defaultValue), { ownedWrite: true })
  const [typed, setTyped] = createSignal<Partial<Record<RangeActiveEnd, string>>>({}, { ownedWrite: true })
  let pending = normalize(config.defaultValue)
  const value = createMemo(() => config.value !== undefined ? normalize(config.value) : local())
  const current = () => config.value !== undefined ? normalize(config.value) : pending
  const canSelect = (pair: DateRangeValue) => {
    const normalized = normalize(pair)
    return !!normalized && normalized.every(end => allowedDate(end, config) && !(config.showTime && ((config.min?.includes(' ') && end < config.min) || (config.max?.includes(' ') && end > config.max))))
  }
  const setValue = (pair: DateRangeValue | null): boolean => {
    if (config.disabled || (pair !== null && !canSelect(pair))) return false
    const next = normalize(pair)
    if (config.value === undefined) { pending = next; setLocal(next) }
    setTyped({}); config.onChange?.(next); return true
  }
  const base = createDateRangePicker({
    get value(): DateRangeValue | null { const pair = value(); return pair ? [dateOf(pair[0])!, dateOf(pair[1])!] : null },
    get disabled() { return config.disabled }, get disabledDate() { return config.disabledDate },
    get min() { return dateOf(config.min) ?? undefined }, get max() { return dateOf(config.max) ?? undefined },
    get weekStart() { return config.weekStart },
    get onFocus() { return config.onFocus }, get onBlur() { return config.onBlur },
    onChange(pair) {
      setValue(pair && config.showTime ? [
        `${pair[0]} ${timeOf(current()?.[0]) ?? initialTime(config)}`,
        `${pair[1]} ${timeOf(current()?.[1]) ?? initialTime(config)}`,
      ] : pair)
    },
  })
  const setTime = (end: RangeActiveEnd, time: string) => {
    const normalized = normalizeTime(time), pair = current()
    if (!config.showTime || !normalized || !pair) return false
    const next: DateRangeValue = [...pair]
    next[end === 'start' ? 0 : 1] = `${dateOf(next[end === 'start' ? 0 : 1])} ${normalized}`
    if (next[0] > next[1]) return false
    return setValue(next)
  }
  const commit = (end: RangeActiveEnd) => {
    const text = typed()[end]
    if (text === undefined) return
    const pair = current()
    if (!text.trim()) setValue(null)
    else if (pair) { const next: DateRangeValue = [...pair]; next[end === 'start' ? 0 : 1] = text; setValue(next) }
    else setValue([text, text])
    setTyped(previous => ({ ...previous, [end]: undefined }))
  }
  return {
    ...base, value, canSelect, setValue, setTime,
    startValue: () => value()?.[0] ?? null, endValue: () => value()?.[1] ?? null,
    timeValue: (end: RangeActiveEnd) => timeOf(value()?.[end === 'start' ? 0 : 1]) ?? initialTime(config),
    clear: () => { setValue(null) },
    textValue: (end: RangeActiveEnd) => typed()[end] ?? value()?.[end === 'start' ? 0 : 1] ?? '',
    setInputText: (end: RangeActiveEnd, text: string) => { if (!config.disabled) setTyped(previous => ({ ...previous, [end]: text })) },
    commit, notifyBlur: (end: RangeActiveEnd) => { commit(end); base.notifyBlur(end) },
  }
}
