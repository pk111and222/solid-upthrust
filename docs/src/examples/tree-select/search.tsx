import { createSignal } from 'solid-js'
import TreeSelect from 'upthrust-ui/source/TreeSelect'

const treeData = [{ value: 'cities', label: '城市', children: [
  { value: 'hangzhou', label: '杭州' }, { value: 'ningbo', label: '宁波' }, { value: 'nanjing', label: '南京' },
] }]

export default function Search() {
  const [query, setQuery] = createSignal('')
  const [value, setValue] = createSignal<string | number | undefined>()
  return <div class="max-w-sm space-y-2">
    <TreeSelect treeData={treeData} showSearch defaultExpandAll virtual={false} value={value()}
      onChange={next => setValue(next as string | number | undefined)} onSearch={setQuery}
      notFoundContent="没有匹配城市" placeholder="搜索并选择城市" />
    <output>搜索：{query() || '空'}；已选：{value() ?? '无'}</output>
  </div>
}
