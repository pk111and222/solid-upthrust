import { createSignal } from 'solid-js'
import TreeSelect from 'upthrust-ui/source/TreeSelect'

const treeData = [
  { value: 'zj', label: '浙江', children: [{ value: 'hz', label: '杭州', children: [{ value: 'xh', label: '西湖' }, { value: 'bj', label: '滨江' }] }] },
  { value: 'js', label: '江苏', children: [{ value: 'nj', label: '南京' }] },
]

export default function Basic() {
  const [value, setValue] = createSignal<string | number | undefined>()
  return <div class="max-w-sm space-y-2">
    <TreeSelect treeData={treeData} defaultExpandAll virtual={false} allowClear value={value()}
      onChange={next => setValue(next as string | number | undefined)} placeholder="选择地区" />
    <output>当前值：{value() ?? '未选择'}</output>
  </div>
}
