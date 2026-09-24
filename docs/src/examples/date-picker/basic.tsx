import { createSignal } from 'solid-js'
import DatePicker from 'upthrust-ui/source/DatePicker'

export default function Basic() {
  const [value, setValue] = createSignal<string | null>('2026-09-15')
  return <div class="flex flex-col gap-3 max-w-sm">
    <DatePicker value={value()} onChange={setValue} placeholder="请选择日期" />
    <output>当前日期：{value() ?? '未选择'}</output>
    <DatePicker defaultValue="2026-09-02" weekStart={1} placeholder="周一起始" />
  </div>
}
