import Tree from 'upthrust-ui/source/Tree'
import { nodes } from './data'
import { createSignal } from 'solid-js'
import { moveTreeNode, type TreeNode } from 'upthrust-ui/source/Tree'
export default function Drag() {
  const [data,setData]=createSignal<TreeNode[]>(nodes)
  const [event,setEvent]=createSignal('未拖动')
  return <><Tree treeData={data()} defaultExpandAll draggable={node=>node.value!=='p'} allowDrop={info=>info.dropNode.value!=='d'}
    onDragStart={info=>setEvent(`开始：${info.node.value}`)} onDragEnter={info=>setEvent(`进入：${info.node.value}`)}
    onDragOver={info=>setEvent(`悬停：${info.node.value}`)} onDragLeave={info=>setEvent(`离开：${info.node.value}`)}
    onDragEnd={()=>setEvent('拖拽结束')} onDrop={info=>setData(list=>moveTreeNode(list,info.dragNode.value,info.node.value,info.dropPosition))} />
    <output>{event()}</output></>
}
