import { createSignal } from 'solid-js'
import Select from 'upthrust-ui/source/Select'

const options = [{ label: '苹果', value: 'apple' }, { label: '香蕉', value: 'banana' }]
export default function LabelValue() {
  const [result, setResult] = createSignal('尚未变更')
  return <div class="px-3 flex flex-col gap-3">
    <Select aria-label="对象值单选" options={options} labelInValue onChange={value => setResult(JSON.stringify(value))} />
    <Select aria-label="对象值多选" options={options} mode="multiple" labelInValue onChange={value => setResult(JSON.stringify(value))} />
    <output>onChange：{result()}</output>
  </div>
}
