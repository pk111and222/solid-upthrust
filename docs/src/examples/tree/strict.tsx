import Tree from 'upthrust-ui/source/Tree'
import { nodes } from './data'
export default function Strict() {
  return <Tree treeData={[...nodes,{value:'n',label:'不可选行',selectable:false,checkable:false}]} multiple checkable checkStrictly defaultExpandAll defaultCheckedKeys={['p']} defaultSelectedKeys={['a','z']} />
}
