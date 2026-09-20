import { createSignal, flush } from 'solid-js'
import { expect, it } from 'vitest'
import Tree, {moveTreeNode, type TreeProps, type TreeNode, type TreeDropInfo, type TreeDragInfo, type TreeDropPosition} from '../../../components/lib/Tree'
import ConfigProvider from '../../../components/lib/ConfigProvider'
import type * as Public from '../../../components/lib'
import {mount} from '../../utils/mount'
const exported:typeof Public.Tree=Tree
const move:typeof Public.moveTreeNode=moveTreeNode
const data:TreeNode[]=[{value:1,label:'One'},{value:2,label:'Two'}]
const position:TreeDropPosition=1
const onDrop=(info:TreeDropInfo)=>move(data,info.dragNode.value,info.node.value,position)
const onDragStart=(_info:TreeDragInfo)=>{}
// Tree 公开类型与 helper 可用，Provider 全局禁用可更新且显式属性优先。
it('[tree.exports.provider] mounts public types and updates defaults',()=>{
 const [disabled,setDisabled]=createSignal(true,{ownedWrite:true})
 const props:TreeProps={treeData:data,onDrop,onDragStart}
 const view=mount(()=><ConfigProvider componentDisabled={disabled()}><Tree {...props}/><Tree {...props} disabled={false}/></ConfigProvider>)
 try {
 expect(exported).toBe(Tree);expect(view.host.querySelectorAll('[role="tree"]')).toHaveLength(2)
 expect(view.host.querySelector('[role="tree"]')?.getAttribute('aria-disabled')).toBe('true')
 expect(view.host.querySelectorAll('[role="tree"]')[1].getAttribute('aria-disabled')).toBe('false')
 setDisabled(false);flush();expect(view.host.querySelector('[role="tree"]')?.getAttribute('aria-disabled')).toBe('false')
 }finally{view.dispose()}
 expect(view.host.isConnected).toBe(false)
})
