import { createSignal } from 'solid-js'
import Select from 'upthrust-ui/source/Select'

const options = [{ label: '苹果', value: 'apple' }, { label: '香蕉', value: 'banana' }, { label: '葡萄（禁用）', value: 'grape', disabled: true }]
export default function Basic() {
  const [value, setValue] = createSignal<string | number | undefined>('apple')
  return <div class="px-3 flex flex-col gap-3">
    <Select aria-label="水果" options={options} value={value()} onChange={next => setValue(next as string | number | undefined)} allowClear placeholder="选择水果" />
    <output>当前值：{String(value() ?? '未选择')}</output>
  </div>
}
