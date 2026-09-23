import { createSignal } from 'solid-js'
import Select from 'upthrust-ui/source/Select'

export default function Tags() {
  const [value, setValue] = createSignal<Array<string | number>>([])
  return <div class="px-3 flex flex-col gap-3">
    <Select aria-label="自定义标签" mode="tags" options={[{ label: '前端', value: 'frontend' }, { label: '后端', value: 'backend' }]}
      value={value()} onChange={next => setValue(next as Array<string | number>)} placeholder="输入文字后回车" />
    <output>标签：{JSON.stringify(value())}</output>
  </div>
}
