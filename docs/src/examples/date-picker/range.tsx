import { createSignal } from 'solid-js'
import DatePicker from 'upthrust-ui/source/DatePicker'

export default function Range() {
  const [value, setValue] = createSignal<[string, string] | null>(['2026-09-10', '2026-09-20'])
  return <div class="flex flex-col gap-3 max-w-md">
    <DatePicker.RangePicker value={value()} onChange={setValue} placeholder={['开始日期', '结束日期']} />
    <output>日期区间：{value()?.join(' – ') ?? '未选择'}</output>
  </div>
}
