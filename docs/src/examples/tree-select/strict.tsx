import { createSignal } from 'solid-js'
import TreeSelect from 'upthrust-ui/source/TreeSelect'

const treeData = [{ value: 'all', label: '全部权限', children: [
  { value: 'read', label: '读取' }, { value: 'write', label: '写入' },
] }]

export default function Strict() {
  const [checked, setChecked] = createSignal<Array<string | number>>([])
  const [rows, setRows] = createSignal<Array<string | number>>([])
  return <div class="max-w-sm space-y-3">
    <TreeSelect treeData={treeData} mode="multiple" treeCheckStrictly defaultExpandAll virtual={false}
      value={checked()} onChange={next => setChecked(next as Array<string | number>)} placeholder="父子独立勾选" />
    <output>独立勾选：{checked().join(', ') || '无'}</output>
    <TreeSelect treeData={treeData} mode="multiple" treeCheckable={false} defaultExpandAll virtual={false}
      value={rows()} onChange={next => setRows(next as Array<string | number>)} placeholder="逐行多选" />
    <output>逐行选择：{rows().join(', ') || '无'}</output>
  </div>
}
