import { createSignal } from 'solid-js'
import TimePicker from 'upthrust-ui/source/TimePicker'

export default function Shift() {
  const [value, setValue] = createSignal<[string, string] | null>(['09:00', '18:00'])
  return <div class="flex flex-col gap-3 max-w-md">
    <TimePicker.RangePicker value={value()} onChange={setValue} min="08:00" max="20:00"
      minuteStep={30} placeholder={['上班时间', '下班时间']} allowClear />
    <output>班次：{value()?.join(' – ') ?? '未设置'}</output>
    <button type="button" onClick={() => setValue(['10:00', '19:00'])}>设置晚班</button>
  </div>
}
