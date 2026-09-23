import { createSignal } from 'solid-js'
import TreeSelect from 'upthrust-ui/source/TreeSelect'

const treeData = [{ value: 'team', label: '研发团队', children: [
  { value: 'frontend', label: '前端' }, { value: 'backend', label: '后端' }, { value: 'qa', label: '测试' },
] }]

export default function Multiple() {
  const [value, setValue] = createSignal<Array<string | number>>([])
  return <div class="max-w-sm space-y-2">
    <TreeSelect treeData={treeData} mode="multiple" value={value()} defaultExpandAll virtual={false}
      treeCheckStrategy="SHOW_PARENT" maxTagCount={2}
      onChange={next => setValue(next as Array<string | number>)} placeholder="勾选团队" />
    <output>已选：{value().length ? value().join(', ') : '无'}</output>
  </div>
}
