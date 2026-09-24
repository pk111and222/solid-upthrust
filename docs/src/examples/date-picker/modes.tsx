import { createSignal } from 'solid-js'
import DatePicker from 'upthrust-ui/source/DatePicker'

export default function Modes() {
  const [value, setValue] = createSignal<string | null>(null)
  return <div class="flex flex-col gap-3 max-w-sm">
    <DatePicker picker="week" weekStart={1} defaultValue="2026-09-15" onChange={setValue} />
    <DatePicker picker="month" defaultValue="2026-09-01" onChange={setValue} />
    <DatePicker picker="quarter" defaultValue="2026-07-01" onChange={setValue} />
    <DatePicker picker="year" defaultValue="2026-01-01" onChange={setValue} />
    <output>所选周期起始日：{value() ?? '未修改'}</output>
  </div>
}
