import { createSignal } from 'solid-js'
import DatePicker from 'upthrust-ui/source/DatePicker'

export default function Disabled() {
  const [value, setValue] = createSignal<string | null>('2026-09-15')
  return <div class="flex flex-col gap-3 max-w-sm">
    <DatePicker value={value()} onChange={setValue} min="2026-09-01" max="2026-09-30"
      disabledDate={date => date.endsWith('-06') || date.endsWith('-13') || date.endsWith('-20')} />
    <output>可预约日期：{value() ?? '未选择'}（每月 6、13、20 日禁用）</output>
  </div>
}
