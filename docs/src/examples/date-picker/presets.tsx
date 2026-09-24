import { createSignal } from 'solid-js'
import DatePicker from 'upthrust-ui/source/DatePicker'

export default function Presets() {
  const [value, setValue] = createSignal<[string, string] | null>(null)
  return <div class="flex flex-col gap-3 max-w-md">
    <DatePicker.RangePicker value={value()} onChange={setValue} placeholder={['开始日期', '结束日期']}
      presets={[{ label: '本月示例', value: ['2026-09-01', '2026-09-30'] }, { label: '发布窗口', value: () => ['2026-09-15', '2026-09-22'] }]} />
    <output>筛选区间：{value()?.join(' – ') ?? '未选择'}</output>
  </div>
}
