import { createSignal } from 'solid-js'
import TreeSelect from 'upthrust-ui/source/TreeSelect'

const treeData = [{ value: 'group', label: '分组', children: [
  { value: 'a', label: '甲' }, { value: 'b', label: '乙' },
] }]

export default function Controlled() {
  const [open, setOpen] = createSignal(false)
  const [expanded, setExpanded] = createSignal<Array<string | number>>(['group'])
  const [value, setValue] = createSignal<string | number | undefined>('a')
  return <div class="max-w-sm space-y-2">
    <TreeSelect treeData={treeData} open={open()} onOpenChange={setOpen}
      expandedKeys={expanded()} onExpand={setExpanded} value={value()} onChange={next => setValue(next as string | number | undefined)}
      virtual={false} placeholder="受控树选择" />
    <div class="flex gap-2"><button type="button" onClick={() => setOpen(!open())}>切换展开</button>
      <button type="button" onClick={() => setValue(undefined)}>清空值</button></div>
    <output>展开：{open() ? '是' : '否'}；节点：{value() ?? '无'}</output>
  </div>
}
