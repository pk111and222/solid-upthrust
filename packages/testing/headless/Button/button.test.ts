import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { createButton } from '../../../competence/src/button'
let dispose=()=>{}
afterEach(() => {dispose(); vi.useRealTimers()})
// 受控布尔 loading 和 disabled 更新后立即阻止激活，解除后恢复回调。
it('[button.controlled.activation] reads reactive state and latest callback', () => {
  const [loading,setLoading]=createSignal(true,{ownedWrite:true})
  const [disabled,setDisabled]=createSignal(false,{ownedWrite:true})
  const first=vi.fn(),second=vi.fn(); let callback=first
  const state=createRoot(cleanup=>{dispose=cleanup;return createButton({get loading(){return loading()},get disabled(){return disabled()},get onClick(){return callback}})})
  const el=document.createElement('button'); state.button(el)
  expect(state.loading()).toBe(true); el.click(); expect(first).not.toHaveBeenCalled()
  setLoading(false); flush(); el.click(); expect(first).toHaveBeenCalledOnce()
  setDisabled(true); flush(); expect(state.disabled()).toBe(true); el.click(); expect(first).toHaveBeenCalledOnce()
  setDisabled(false); callback=second; flush(); state.refs.click(); expect(second).toHaveBeenCalledOnce()
})
// 对象 loading 保留点击后定时加载的既有契约，期间重复点击被拦截。
it('[button.loading.duration] starts on click and ends at delay', () => {
  vi.useFakeTimers(); const onClick=vi.fn()
  const state=createRoot(cleanup=>{dispose=cleanup;return createButton({loading:{delay:120},onClick})})
  const el=document.createElement('button'); state.button(el); expect(state.loading()).toBe(false)
  el.click(); flush(); expect(state.loading()).toBe(true); el.click(); expect(onClick).toHaveBeenCalledOnce()
  vi.advanceTimersByTime(119); flush(); expect(state.loading()).toBe(true)
  vi.advanceTimersByTime(1); flush(); expect(state.loading()).toBe(false); el.click(); expect(onClick).toHaveBeenCalledTimes(2)
})
// 零延时在下一次计时器调度后结束，不丢失首次点击。
it('[button.loading.zero] supports zero duration', () => {
  vi.useFakeTimers(); const onClick=vi.fn()
  const state=createRoot(cleanup=>{dispose=cleanup;return createButton({loading:{delay:0},onClick})})
  const el=document.createElement('button'); state.button(el); el.click(); flush(); expect(state.loading()).toBe(true)
  vi.advanceTimersByTime(0); flush(); expect(state.loading()).toBe(false); expect(onClick).toHaveBeenCalledOnce()
})
// 波纹重复激活延长计时，销毁移除所有监听与计时器。
it('[button.lifecycle.cleanup] clears listeners and timers', () => {
  vi.useFakeTimers(); const onClick=vi.fn()
  const state=createRoot(cleanup=>{dispose=cleanup;return createButton({onClick})})
  const el=document.createElement('button'); state.button(el); el.click(); flush(); expect(state.waveActive()).toBe(true)
  vi.advanceTimersByTime(300); el.click(); vi.advanceTimersByTime(100); flush(); expect(state.waveActive()).toBe(true)
  vi.advanceTimersByTime(300); flush(); expect(state.waveActive()).toBe(false)
  el.click(); dispose(); flush(); dispose=()=>{}; expect(vi.getTimerCount()).toBe(0); expect(state.refs.buttonEle()).toBeUndefined()
  el.click(); expect(onClick).toHaveBeenCalledTimes(3)
})
