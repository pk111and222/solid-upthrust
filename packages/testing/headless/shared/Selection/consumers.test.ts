import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { createSelect } from '../../../../competence/src/select'
import { createSegmented } from '../../../../competence/src/segmented'
import { createCascader } from '../../../../competence/src/cascader'
let dispose=()=>{}
afterEach(()=>{dispose();dispose=()=>{}})
// 共享选择改动后 Select 包装层保持受控拒绝和父层确认契约。
it('[selection.consumer.select] controlled scalar and clear',()=>{
 createRoot(cleanup=>{dispose=cleanup
  const [value,set]=createSignal<string|undefined>('a',{ownedWrite:true}),cb=vi.fn()
  const select=createSelect({get value(){return value()},options:[{label:'A',value:'a'},{label:'B',value:'b'}],onChange:cb});flush()
  select.selectOption('b');flush();expect(select.value()).toEqual(['a']);expect(cb).toHaveBeenCalledWith('b')
  set('b');flush();expect(select.value()).toEqual(['b']);select.clear();flush();expect(select.value()).toEqual(['b']);expect(cb).toHaveBeenLastCalledWith(undefined)
 })
})
// Cascader 路径编码仍保留父层控制，清空请求不会提前抹掉展示值。
it('[selection.consumer.cascader] controlled path and clear',()=>{
 createRoot(cleanup=>{dispose=cleanup
  const cb=vi.fn(), cascader=createCascader({value:['a'],options:[{label:'A',value:'a'}],onChange:cb});flush()
  cascader.clear();flush();expect(cascader.value()).toEqual([['a']]);expect(cb).toHaveBeenCalledWith(undefined,[])
 })
})

// Segmented 复用单选 store，父层拒绝后值与无焦点的滑块目标仍保持原选项。
it('[selection.consumer.segmented] controlled selection and thumb target',()=>{
 createRoot(cleanup=>{dispose=cleanup
  const cb=vi.fn(), segmented=createSegmented({value:'a',options:[{label:'A',value:'a'},{label:'B',value:'b'}],onChange:cb});flush()
  segmented.select('b');flush();expect(segmented.value()).toBe('a');expect(segmented.thumbValue()).toBe('a');expect(cb).toHaveBeenCalledWith('b')
 })
})
