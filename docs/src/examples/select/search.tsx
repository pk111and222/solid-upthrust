import { createSignal } from 'solid-js'
import Select from 'upthrust-ui/source/Select'

const options = [{ label: 'Apple', value: 'a' }, { label: 'Banana', value: 'b' }, { label: 'Grape', value: 'g' }]
export default function Search() {
  const [query, setQuery] = createSignal('')
  return <div class="px-3 flex flex-col gap-3">
    <Select aria-label="搜索水果" showSearch allowClear options={options} onSearch={setQuery} filterOption={(input, option) => option.label.toLowerCase().startsWith(input.toLowerCase())} notFoundContent="无匹配水果" />
    <output>搜索：{query() || '空'}</output>
  </div>
}
