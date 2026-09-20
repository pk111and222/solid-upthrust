import Tree from 'upthrust-ui/source/Tree'
import { nodes } from './data'
import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
export default function Disabled() {
  const [disabled,setDisabled]=createSignal(true)
  return <><Button onClick={()=>setDisabled(value=>!value)}>切换禁用</Button>
    <Tree treeData={nodes} disabled={disabled()} checkable defaultExpandAll showSearch />
  </>
}
