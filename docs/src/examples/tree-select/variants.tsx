import TreeSelect from 'upthrust-ui/source/TreeSelect'

const treeData = [{ value: 'a', label: '甲' }, { value: 'b', label: '乙', disabled: true }]

export default function Variants() {
  return <div class="max-w-sm space-y-2">
    <TreeSelect treeData={treeData} size="small" placeholder="小尺寸" />
    <TreeSelect treeData={treeData} size="middle" status="warning" placeholder="警告状态" />
    <TreeSelect treeData={treeData} size="large" status="error" placeholder="错误状态" />
    <TreeSelect treeData={treeData} disabled placeholder="整体禁用" />
    <TreeSelect treeData={[]} notFoundContent="无节点" placeholder="空数据" />
  </div>
}
