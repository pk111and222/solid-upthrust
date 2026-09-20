import { createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
export default function Demo() {
  const [value, setValue] = createSignal('hello')
  return <div class="space-y-3"><Input placeholder="受控输入" value={value()} onChange={setValue} allowClear showCount maxLength={20} /><output>当前值：{value()}</output></div>
}
