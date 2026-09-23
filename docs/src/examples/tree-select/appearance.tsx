import { createSignal } from 'solid-js'
import TreeSelect from 'upthrust-ui/source/TreeSelect'

const treeData = [{ value: 'company', label: '总部', children: [
  { value: 'design', label: '设计部', children: [{ value: 'ux', label: '体验设计' }] },
  { value: 'engineering', label: '研发部', children: [{ value: 'web', label: 'Web 前端' }] },
] }]

export default function Appearance() {
  const [value, setValue] = createSignal<string | number | undefined>('ux')
  return <div class="max-w-sm space-y-2">
    <TreeSelect treeData={treeData} defaultExpandAll virtual={false} allowClear treeLine treeIcon indent={28}
      icon={(node, expanded) => <span class={node.children?.length ? expanded ? 'i-mdi-folder-open text-primary' : 'i-mdi-folder text-primary' : 'i-mdi-file-document-outline text-secondary'} />}
      titleRender={node => <span class="font-medium">{node.label}</span>}
      value={value()} onChange={next => setValue(next as string | number | undefined)} placeholder="选择组织节点" />
    <output>当前节点：{value() ?? '未选择'}</output>
  </div>
}
