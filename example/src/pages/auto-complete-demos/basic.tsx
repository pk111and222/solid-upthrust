import { createSignal } from 'solid-js'
import { AutoComplete } from 'upthrust-ui'

export default function Basic() {
  const [value, setValue] = createSignal('')
  const [selected, setSelected] = createSignal('未选择')
  return <div class="flex flex-col gap-3 max-w-sm">
    <AutoComplete aria-label="城市" value={value()} onChange={setValue}
      options={[{ value: 'beijing', label: '北京' }, { value: 'disabled', label: '停用城市', disabled: true }, { value: 'shanghai', label: '上海' }]}
      onSelect={key => setSelected(key)} placeholder="输入城市或拼音" />
    <output>文本：{value() || '空'}；选项键：{selected()}</output>
  </div>
}
