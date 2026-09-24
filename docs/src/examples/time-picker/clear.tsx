import { createSignal } from 'solid-js'
import TimePicker from 'upthrust-ui/source/TimePicker'

export default function ClearTime() {
  const [value, setValue] = createSignal<string | null>('14:30')
  return <div class="flex flex-col gap-3 max-w-sm">
    <TimePicker value={value()} onChange={setValue} placeholder="请选择会议时间" allowClear />
    <output>会议时间：{value() ?? '未安排'}</output>
    <TimePicker allowClear={false} defaultValue="09:00" placeholder="不可清空" />
  </div>
}
