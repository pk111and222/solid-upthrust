import { createSignal } from 'solid-js'
import TreeSelect from 'upthrust-ui/source/TreeSelect'

const treeData = Array.from({ length: 1000 }, (_, index) => ({ value: index, label: `节点 ${index}` }))

export default function Virtual() {
  const [value, setValue] = createSignal<string | number | undefined>()
  return <div class="max-w-sm space-y-2">
    <TreeSelect treeData={treeData} showSearch listHeight={192} listItemHeight={32}
      value={value()} onChange={next => setValue(next as string | number | undefined)} placeholder="搜索 1000 个节点" />
    <output>选中：{value() ?? '无'}</output>
  </div>
}
