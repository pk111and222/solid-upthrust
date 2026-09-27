import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { Text, Paragraph } from '../../../components/lib/Typography'
import { mount } from '../../utils/mount'
let view: ReturnType<typeof mount>
afterEach(() => { view?.dispose(); vi.restoreAllMocks() })
// 受控初始编辑文本、图标/提示、长度约束、键盘保存与父层更新。
it('[typography.edit.dom] initializes controlled textarea and updates owner', () => {
  const [text, setText] = createSignal('初始', { ownedWrite: true })
  view = mount(() => <Paragraph editable={{ text: text(), onChange: setText, maxLength: 5, icon: '修改', tooltip: '改文案' }}>{text()}</Paragraph>)
  const edit = view.host.querySelector('button')!; expect(edit.title).toBe('改文案'); expect(edit.textContent).toBe('修改'); edit.click(); flush()
  const field = view.host.querySelector('textarea')!; expect(field.value).toBe('初始'); expect(field.maxLength).toBe(5)
  field.value = 'new'; field.dispatchEvent(new Event('input', { bubbles: true })); field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); flush()
  expect(text()).toBe('new'); expect(view.host.querySelector('textarea')).toBeNull()
})
// 输入法 Enter 与 Shift+Enter 保留编辑；失焦只提交一次。
it('[typography.edit.keyboard] respects IME and newline and saves on blur', () => {
  const onChange = vi.fn(), onEnd = vi.fn()
  view = mount(() => <Text editable={{ onChange, onEnd }}>initial</Text>)
  view.host.querySelector('button')!.click(); flush(); const field = view.host.querySelector('textarea')!
  field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true }))
  field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true })); flush()
  expect(view.host.querySelector('textarea')).toBe(field); expect(onChange).not.toHaveBeenCalled()
  field.value = 'new line'; field.dispatchEvent(new Event('blur')); flush()
  expect(onChange).toHaveBeenCalledExactlyOnceWith('new line'); expect(onEnd).toHaveBeenCalledTimes(1)
})
// 禁用和移除 editable 时不会遗留可操作输入框。
it('[typography.edit.toggle] disables and removes controls reactively', () => {
  const [disabled, setDisabled] = createSignal(false, { ownedWrite: true })
  view = mount(() => <Text disabled={disabled()} editable copyable>text</Text>)
  view.host.querySelector('button')!.click(); flush(); setDisabled(true); flush()
  expect(view.host.querySelector('textarea')).toBeNull(); expect(view.host.querySelector('button')).toBeNull()
})
// 无 Clipboard API 时使用临时 textarea，成功和失败均清理并恢复焦点。
it.each([true, false])('[typography.copy.fallback] execCommand success=%s', async ok => {
  vi.spyOn(navigator, 'clipboard', 'get').mockReturnValue(undefined as unknown as Clipboard)
  const exec = vi.fn().mockReturnValue(ok); Object.defineProperty(document, 'execCommand', { configurable: true, value: exec })
  const onCopy = vi.fn(), onError = vi.fn()
  view = mount(() => <Text copyable={{ text: '', onCopy, onError, icon: 'COPY', tooltips: false }}>text</Text>)
  const button = view.host.querySelector('button')!; button.focus(); button.click(); await Promise.resolve(); await Promise.resolve(); flush()
  expect(exec).toHaveBeenCalledWith('copy'); expect(document.querySelector('textarea')).toBeNull(); expect(document.activeElement).toBe(button)
  expect(onCopy).toHaveBeenCalledTimes(ok ? 1 : 0); expect(onError).toHaveBeenCalledTimes(ok ? 0 : 1)
  Reflect.deleteProperty(document, 'execCommand')
})
