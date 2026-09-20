import Tree from 'upthrust-ui/source/Tree'
import { nodes } from './data'
import { createSignal } from 'solid-js'
export default function Controlled() {
  const [expanded,setExpanded]=createSignal<Array<string|number>>([])
  const [selected,setSelected]=createSignal<Array<string|number>>([])
  const [checked,setChecked]=createSignal<Array<string|number>>([])
  return <><Tree treeData={nodes} checkable expandedKeys={expanded()} selectedKeys={selected()} checkedKeys={checked()}
    onExpand={setExpanded} onSelect={setSelected} onCheck={setChecked} />
    <output>展开：{expanded().join(',')}；选中：{selected().join(',')}；勾选：{checked().join(',')}</output></>
}
