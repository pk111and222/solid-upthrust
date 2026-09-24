import { createSignal } from 'solid-js'
import DatePicker from 'upthrust-ui/source/DatePicker'

export default function Filter() {
  const [month, setMonth] = createSignal<string | null>('2026-09-01')
  const [quarter, setQuarter] = createSignal<string | null>(null)
  return <div class="flex flex-col gap-3 max-w-sm">
    <DatePicker picker="month" value={month()} onChange={setMonth} placeholder="筛选月份" />
    <DatePicker picker="quarter" value={quarter()} onChange={setQuarter} placeholder="筛选季度" allowClear />
    <output>月份：{month() ?? '不限'}；季度：{quarter() ?? '不限'}</output>
  </div>
}
