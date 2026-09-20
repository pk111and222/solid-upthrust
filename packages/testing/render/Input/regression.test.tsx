import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Input from '../../../components/lib/Input'
import Search from '../../../components/lib/Input/Search'
import TextArea from '../../../components/lib/Input/TextArea'
import { mount } from '../../utils/mount'
let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })
// 自定义清空图标必须遵守非空、禁用和只读约束。
it.each([{ defaultValue: '' }, { defaultValue: 'x', disabled: true }, { defaultValue: 'x', readonly: true }])('[input.clear.guard] custom clear respects %j', props => {
  const view = mount(() => <Input {...props} allowClear={{ clearIcon: <b>清空</b> }} />)
  dispose = view.dispose
  expect(view.host.querySelector('[aria-label="clear"]')).toBeNull()
})
// 输入法结束回调应透传，结束后的同值 input 不得重复报告，候选确认 Enter 不触发提交。
it('[input.ime.commit] commits once and forwards compositionEnd', () => {
  const change = vi.fn(), start = vi.fn(), end = vi.fn(), enter = vi.fn()
  const view = mount(() => <Input onChange={change} onCompositionStart={start} onCompositionEnd={end} onPressEnter={enter} />)
  dispose = view.dispose
  const el = view.host.querySelector('input')!
  el.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true })); flush()
  el.value = '中文'; el.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true })); flush()
  el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', isComposing: true, bubbles: true }))
  expect(change).not.toHaveBeenCalled(); expect(enter).not.toHaveBeenCalled()
  el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true })); flush()
  el.dispatchEvent(new InputEvent('input', { bubbles: true })); flush()
  expect(change).toHaveBeenCalledTimes(1); expect(end).toHaveBeenCalledTimes(1); expect(start).toHaveBeenCalledTimes(1)
})
// 注册 onChange 后，Search 清空仍须报告 source=clear。
it('[input.search.clear] emits both change and clear search', () => {
  const change = vi.fn(), search = vi.fn()
  const view = mount(() => <Search defaultValue="query" allowClear onChange={change} onSearch={search} />)
  dispose = view.dispose
  ;(view.host.querySelector('[aria-label="clear"]') as HTMLElement).click(); flush()
  expect(change).toHaveBeenCalledTimes(1)
  expect(search).toHaveBeenCalledWith('', expect.any(MouseEvent), { source: 'clear' })
})
// TextArea 卸载时销毁自身创建的隐藏测量节点。
it('[input.textarea.cleanup] removes autosize mirror', () => {
  const previous = document.querySelectorAll('textarea').length
  const view = mount(() => <TextArea autoSize defaultValue="text" />)
  dispose = view.dispose
  view.dispose(); dispose = () => {}
  expect(document.querySelectorAll('textarea')).toHaveLength(previous)
})
// 受控父层拒绝修改时，原生 DOM 值也必须恢复，不能只让计数保持旧值。
it('[input.controlled.reject] restores the DOM value', () => {
  const view = mount(() => <Input value="fixed" onChange={() => {}} />)
  dispose = view.dispose
  const el = view.host.querySelector('input')!
  el.value = 'changed'; el.dispatchEvent(new InputEvent('input', { bubbles: true })); flush()
  expect(el.value).toBe('fixed')
})
