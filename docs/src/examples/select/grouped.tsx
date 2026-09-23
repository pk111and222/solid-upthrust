import { createSignal } from 'solid-js'
import Select from 'upthrust-ui/source/Select'

const options = [
  { label: '水果', options: [{ label: '苹果', value: 'apple' }, { label: '香蕉', value: 'banana' }] },
  { label: '饮料', options: [{ label: '茶', value: 'tea' }, { label: '咖啡', value: 'coffee' }] },
]
export default function Grouped() {
  const [value, setValue] = createSignal<string | number | undefined>()
  return <div class="px-3 flex flex-col gap-3">
    <Select aria-label="分组选项" options={options} showSearch value={value()} onChange={next => setValue(next as string | number | undefined)} placeholder="搜索或选择" />
    <output>已选：{String(value() ?? '未选择')}</output>
  </div>
}
