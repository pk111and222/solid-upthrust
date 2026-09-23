import { createSignal } from 'solid-js'
import Mentions from 'upthrust-ui/source/Mentions'

const options = [
  { value: 'alice', label: 'Alice' },
  { value: 'bob', label: 'Bob' },
  { value: 'blocked', label: '停用账号', disabled: true },
]

export default function Basic() {
  const [value, setValue] = createSignal('')
  const [selected, setSelected] = createSignal('未选择')
  return <div class="flex flex-col gap-3 max-w-sm">
    <Mentions aria-label="提及同事" value={value()} onChange={setValue} options={options}
      onSelect={option => setSelected(option.value)} placeholder="输入 @ 搜索同事" />
    <output>文本：{value() || '空'}；最近选中：{selected()}</output>
  </div>
}
