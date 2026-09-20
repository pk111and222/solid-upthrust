import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { createTree } from '../../../competence/src/tree'
const nodes=[{value:'a',label:'Alpha'},{value:'b',label:'Branch',children:[{value:'c',label:'Child'}]},{value:'d',label:'Disabled',disabled:true}]
let dispose=()=>{}
afterEach(()=>{dispose();flush();vi.useRealTimers()})
// 新拖拽会取消上次悬停与定时展开，不能沿用旧的放置提示。
it('[tree.drag.restart] clears old target and hover timer',()=>{
 vi.useFakeTimers();createRoot(d=>{dispose=d;const tree=createTree({treeData:nodes,draggable:true})
 tree.startDrag('a');tree.dragOver('b',0);flush();expect(tree.dropTarget()?.key).toBe('b')
 tree.startDrag('c');flush();expect(tree.dropTarget()).toBeUndefined()
 vi.advanceTimersByTime(500);flush();expect(tree.expandedKeys()).toEqual([])
 })
})
// 悬停只触发一次进入事件，500ms 展开；离开和卸载取消未完成计时器。
it('[tree.drag.hover.cleanup] emits lifecycle and cancels timers',()=>{
 vi.useFakeTimers();createRoot(d=>{dispose=d
 const enter=vi.fn(),over=vi.fn(),leave=vi.fn(),end=vi.fn(),expand=vi.fn()
 const tree=createTree({treeData:nodes,draggable:n=>n.value!=='b',onDragEnter:enter,onDragOver:over,onDragLeave:leave,onDragEnd:end,onExpand:expand})
 expect(tree.startDrag('b')).toBe(false);expect(tree.startDrag('a')).toBe(true)
 tree.dragOver('b',0);tree.dragOver('b',0);expect(enter).toHaveBeenCalledTimes(1);expect(over).toHaveBeenCalledTimes(2)
 vi.advanceTimersByTime(499);flush();expect(expand).not.toHaveBeenCalled()
 vi.advanceTimersByTime(1);flush();expect(tree.isExpanded('b')).toBe(true)
 tree.dragLeave('b');flush();expect(leave).toHaveBeenCalledOnce();expect(tree.dropTarget()).toBeUndefined()
 tree.collapse('b');tree.dragOver('b',0);tree.dragLeave('b');vi.advanceTimersByTime(500);flush();expect(tree.isExpanded('b')).toBe(false)
 tree.dragOver('b',0);tree.endDrag();expect(end).toHaveBeenCalledOnce();expect(vi.getTimerCount()).toBe(0)
 tree.startDrag('a');tree.dragOver('b',0);dispose();dispose=()=>{};vi.advanceTimersByTime(500);expect(expand).toHaveBeenCalledTimes(2)
 })
})
// 拖放期间禁用源节点会拒绝提交；回调抛错仍清理拖拽状态。
it('[tree.drag.dynamic] rejects invalidated source and cleans callback errors',()=>{
 createRoot(d=>{dispose=d
 const [disabled,setDisabled]=createSignal(false,{ownedWrite:true}), dropped=vi.fn()
 const tree=createTree({treeData:nodes,draggable:true,get disabled(){return disabled()},onDrop:dropped})
 tree.startDrag('a');setDisabled(true);flush();expect(tree.drop('b',1)).toBe(false);flush();expect(dropped).not.toHaveBeenCalled();expect(tree.draggingKey()).toBeUndefined()
 const broken=createTree({treeData:nodes,draggable:true,onDrop:()=>{throw Error('handler')}})
 broken.startDrag('a');expect(()=>broken.drop('b',-1)).toThrow('handler');flush();expect(broken.draggingKey()).toBeUndefined()
 })
})
// 完整方向键覆盖边界和严格勾选；命令式 setter 不覆盖受控状态。
it('[tree.commands.boundaries] navigation and setters respect controlled state',()=>{
 createRoot(d=>{dispose=d;const tree=createTree({treeData:nodes,checkable:false})
 expect(tree.navigate('ArrowUp')).toBe('a');expect(tree.navigate('Home')).toBe('a');expect(tree.navigate('End')).toBe('b')
 tree.setExpandedKeys(['b']);flush();expect(tree.visibleKeys()).toEqual(['a','b','c'])
 tree.setActiveKey('c');tree.navigate('ArrowLeft');flush();expect(tree.activeKey()).toBe('b')
 tree.navigate('ArrowLeft');flush();expect(tree.isExpanded('b')).toBe(false)
 tree.navigate(' ');flush();expect(tree.selectedKeys()).toEqual(['b']);expect(tree.navigate('Escape')).toBeUndefined()
 tree.setCheckedKeys(['a']);flush();expect(tree.checkedKeys()).toEqual(['a'])
 const controlled=createTree({treeData:nodes,expandedKeys:[],checkedKeys:[]});controlled.setExpandedKeys(['b']);controlled.setCheckedKeys(['a']);flush()
 expect(controlled.expandedKeys()).toEqual([]);expect(controlled.checkedKeys()).toEqual([])
 })
})
