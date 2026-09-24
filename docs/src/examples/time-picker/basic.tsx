import { createSignal } from 'solid-js'
import TimePicker from 'upthrust-ui/source/TimePicker'

export default function Basic() {
  const [time, setTime] = createSignal<string | null>('09:30')
  const [seconds, setSeconds] = createSignal<string | null>('09:30:15')
  return <div class="flex flex-col gap-4 max-w-sm">
    <label class="flex flex-col gap-1">时间
      <TimePicker value={time()} onChange={setTime} />
    </label>
    <output>当前时间：{time() ?? '未选择'}</output>
    <label class="flex flex-col gap-1">精确到秒
      <TimePicker format="HH:mm:ss" value={seconds()} onChange={setSeconds} />
    </label>
    <output>当前时间：{seconds() ?? '未选择'}</output>
  </div>
}
