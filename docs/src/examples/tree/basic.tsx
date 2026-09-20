import Tree from 'upthrust-ui/source/Tree'
import { nodes } from './data'
export default function Basic() {
  return <Tree treeData={nodes} defaultExpandedKeys={['p']} defaultSelectedKeys={['a']} aria-label="项目树" />
}
