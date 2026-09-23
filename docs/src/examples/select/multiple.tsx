import { createSignal } from 'solid-js'
import Select from 'upthrust-ui/source/Select'

const options = ['苹果', '香蕉', '樱桃', '梨'].map(label => ({ label, value: label }))
export default function Multiple() {
  const [value, setValue] = createSignal<Array<string | number>>(['苹果', '香蕉', '樱桃'])
  const [event, setEvent] = createSignal('尚无操作')
  return <div class="px-3 flex flex-col gap-3">
    <Select aria-label="多选水果" mode="multiple" options={options} value={value()} onChange={next => setValue(next as Array<string | number>)}
      maxTagCount={1} maxTagPlaceholder={omitted => <span>另有 {omitted.length} 项</span>} allowClear
      onSelect={key => setEvent(`选择 ${key}`)} onDeselect={key => setEvent(`移除 ${key}`)} onClear={() => setEvent('已清空')} />
    <output>{JSON.stringify(value())}；{event()}</output>
  </div>
}
