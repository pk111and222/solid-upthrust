import Tree from 'upthrust-ui/source/Tree'
import { nodes } from './data'
export default function Check() {
  return <Tree treeData={nodes} defaultExpandAll defaultCheckedKeys={['a']} selectable={false} />
}
