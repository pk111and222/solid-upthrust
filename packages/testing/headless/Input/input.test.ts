import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { createInput } from '../../../competence/src/input'
let dispose = () => {}
afterEach(() => dispose())
const root = (fn: () => void) => createRoot(d => { dispose = d; fn() })
// 默认值只初始化一次，输入和清空同步通知调用者。
it('[input.value.uncontrolled] input and clear', () => root(() => {
  const change = vi.fn(), state = createInput({ defaultValue: 'a', onChange: change })
  expect(state.value()).toBe('a'); state.input('b'); flush(); expect(state.value()).toBe('b')
  state.clear(); flush(); expect(state.value()).toBe(''); expect(change.mock.calls.map(c => c[0])).toEqual(['b', ''])
}))
// 受控请求不修改值，只有父层更新才改变显示。
it('[input.value.controlled] parent owns value', () => root(() => {
  const [value, setValue] = createSignal('a', { ownedWrite: true })
  const state = createInput({ get value() { return value() } })
  state.input('b'); flush(); expect(state.value()).toBe('a')
  setValue('c'); flush(); expect(state.value()).toBe('c')
}))
// 禁用或只读均拦截修改和清空，保留原内容。
it.each(['disabled', 'readonly'] as const)('[input.value.blocked] %s', key => root(() => {
  const change = vi.fn(), state = createInput({ [key]: true, defaultValue: 'a', onChange: change })
  state.input('b'); state.clear(); flush(); expect(state.value()).toBe('a'); expect(change).not.toHaveBeenCalled()
}))
// 输入法草稿可见，但组合结束才报告一次；尾随同值 input 被去重，后续普通输入正常。
it('[input.ime.sequence] draft and one commit', () => root(() => {
  const change = vi.fn(), state = createInput({ onChange: change })
  state.compositionStart(); state.input('中'); flush(); expect(state.value()).toBe('中'); expect(change).not.toHaveBeenCalled()
  expect(state.canEnter(new KeyboardEvent('keydown'))).toBe(false)
  state.compositionEnd('中文'); flush(); state.input('中文'); flush(); expect(change).toHaveBeenCalledTimes(1)
  state.input('中文!'); flush(); expect(change).toHaveBeenCalledTimes(2)
}))
// 浏览器输入法确认按键不应触发 Enter 行为，普通 Enter 可用。
it('[input.ime.enter] composing event guard', () => root(() => {
  const state = createInput()
  expect(state.canEnter(new KeyboardEvent('keydown', { isComposing: true }))).toBe(false)
  expect(state.canEnter(new KeyboardEvent('keydown', { key: 'Enter' }))).toBe(true)
}))
// 默认值的动态修改不重置用户输入；显式空字符串属于受控值。
it('[input.value.default-once] default does not override edits', () => root(() => {
 const [seed,setSeed]=createSignal('seed',{ownedWrite:true})
 const state=createInput({get defaultValue(){return seed()}})
 state.input('edited');flush();setSeed('new seed');flush();expect(state.value()).toBe('edited')
 expect(createInput({value:'',defaultValue:'ignored'}).value()).toBe('')
}))
