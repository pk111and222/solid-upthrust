import { createSignal } from 'solid-js'
import TimePicker from 'upthrust-ui/source/TimePicker'

export default function Range() {
  const [value, setValue] = createSignal<[string, string] | null>(['09:00', '17:30'])
  return <div class="flex flex-col gap-3 max-w-md">
    <TimePicker.RangePicker value={value()} onChange={setValue} placeholder={['开始时间', '结束时间']} />
    <output>{value() ? `${value()![0]} – ${value()![1]}` : '未选择'}</output>
  </div>
}
