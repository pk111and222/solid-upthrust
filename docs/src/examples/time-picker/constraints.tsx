import { createSignal } from 'solid-js'
import TimePicker from 'upthrust-ui/source/TimePicker'

export default function Constraints() {
  const [value, setValue] = createSignal<string | null>('09:30')
  return <div class="flex flex-col gap-3 max-w-sm">
    <TimePicker value={value()} onChange={setValue} min="09:00" max="18:00" hourStep={2} minuteStep={15} />
    <output>09:00–18:00；小时步长 2，分钟步长 15。当前：{value()}</output>
    <TimePicker disabled defaultValue="10:30" />
    <TimePicker status="error" placeholder="错误状态" />
  </div>
}
