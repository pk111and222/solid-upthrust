import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { createSelection } from '../../../../competence/src/selection'
let dispose=()=>{}
afterEach(()=>{dispose();dispose=()=>{}})
// 初始 effect 已执行后仍必须保留受控值，不能接受父层拒绝的意图。
it.each(['literal','getter'] as const)('[selection.controlled.reject] after initial flush: %s', mode=>{
 createRoot(cleanup=>{dispose=cleanup
  const cb=vi.fn(), store=createSelection({value:mode==='literal'?['a']:()=>['a'],maxSelect:1,onChange:cb})
  flush(); store.select('b'); flush(); expect(store.value()).toEqual(['a']); expect(cb).toHaveBeenCalledWith(['b'])
 })
})
// 接受父层更新及释放控制后仍可操作；直接 getter 与函数 getter 都追踪动态值。
it.each(['property','function'] as const)('[selection.controlled.dynamic] update and release: %s', mode=>{
 createRoot(cleanup=>{dispose=cleanup
  const [value,set]=createSignal<string[]|undefined>(['a'],{ownedWrite:true})
  const store=createSelection({get value(){return mode==='property'?value():value},maxSelect:1}); flush()
  set(['b']);flush();expect(store.value()).toEqual(['b']);set(undefined);flush();store.select('c');flush();expect(store.value()).toEqual(['c'])
 })
})
