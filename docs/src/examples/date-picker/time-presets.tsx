import { createSignal } from 'solid-js'
import DatePicker from 'upthrust-ui/source/DatePicker'

export default function TimePresets() {
  const [value, setValue] = createSignal<string | null>('2026-09-15 09:30:00')
  return <div class="flex flex-col gap-3 max-w-md">
    <DatePicker showTime value={value()} onChange={setValue} presets={[{ label: '项目起始日', value: '2026-09-01 09:00:00' }]} />
    <output>日期时间：{value() ?? '未选择'}</output>
    <DatePicker.RangePicker showTime defaultValue={['2026-09-10 09:00:00', '2026-09-20 18:00:00']} presets={[{ label: '本周工作日', value: ['2026-09-14 09:00:00', '2026-09-18 18:00:00'] }]} />
  </div>
}
