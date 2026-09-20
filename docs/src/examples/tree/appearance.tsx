import Tree from 'upthrust-ui/source/Tree'
import { nodes } from './data'
export default function Appearance() {
  return <Tree treeData={nodes} showLine showIcon defaultExpandAll indent={32} class="custom-tree" style={{ 'max-width':'320px' }}
    icon={(node,expanded)=><span class={node.children?.length ? expanded ? 'i-mdi-folder-open-outline' : 'i-mdi-folder-outline' : 'i-mdi-file-outline'} />}
    titleRender={node=><strong>{node.label}</strong>} />
}
