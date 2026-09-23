import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import AutoComplete from '../../../components/lib/AutoComplete'
import Form, { FormItem } from '../../../components/lib/Form'
import type { FormInstance } from '../../../competence/src/form'
import { mount } from '../../utils/mount'
let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })
const options = [{ value: 'a', label: 'Alpha' }, { value: 'x', disabled: true }, { value: 'b', label: 'Beta' }]
const key = (el: HTMLElement, name: string) => { el.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true })); flush() }
const input = (el: HTMLInputElement, text: string) => { el.value = text; el.dispatchEvent(new Event('input', { bubbles: true })); flush() }

// 焦点与失焦只回调一次，且携带真实 FocusEvent。
it('[autocomplete.events.focus] focus and blur fire once with real events', () => {
  const focus = vi.fn(), blur = vi.fn()
  const v = mount(() => <AutoComplete onFocus={focus} onBlur={blur} />); dispose = v.dispose
  const el = v.host.querySelector('input')!
  el.dispatchEvent(new FocusEvent('focus')); el.dispatchEvent(new FocusEvent('blur')); flush()
  expect(focus).toHaveBeenCalledOnce(); expect(blur).toHaveBeenCalledOnce()
  expect(focus.mock.calls[0][0]).toBeInstanceOf(FocusEvent)
  expect(blur.mock.calls[0][0]).toBeInstanceOf(FocusEvent)
})

// 键盘选值应回填标签、关闭浮层并保持 combobox 和 listbox 的关联。
it('[autocomplete.keyboard.commit] enter selects and closes', () => {
  const selected = vi.fn()
  const v = mount(() => <AutoComplete options={options} defaultOpen onSelect={selected} />); dispose = v.dispose
  const el = v.host.querySelector('input')!
  expect(el.getAttribute('role')).toBe('combobox')
  expect(el.getAttribute('aria-controls')).toBe(document.querySelector('[role="listbox"]')?.id)
  key(el, 'ArrowDown'); key(el, 'Enter')
  expect(el.value).toBe('Beta'); expect(selected).toHaveBeenCalledWith('b', options[2])
  expect(el.getAttribute('aria-expanded')).toBe('false')
  expect(document.querySelector('[role="listbox"]')?.getAttribute('aria-hidden')).toBe('true')
  input(el, 'Al'); expect(el.getAttribute('aria-expanded')).toBe('true')
})

// Form.Item 的文本与选项提交、外部重置都必须双向同步。
it('[autocomplete.form.field] typing, selection and reset update form', () => {
  let form: FormInstance | undefined
  const v = mount(() => <Form ref={f => { form = f }} initialValues={{ city: 'Alpha' }}>
    <FormItem name="city" label="城市"><AutoComplete options={options} /></FormItem>
  </Form>); dispose = v.dispose
  const el = v.host.querySelector('input')!
  input(el, 'Be'); expect(form?.getFieldValue('city')).toBe('Be')
  document.querySelector<HTMLElement>('[role="option"]')!.click(); flush()
  expect(form?.getFieldValue('city')).toBe('Beta')
  form?.resetFields(); flush(); expect(el.value).toBe('Alpha')
})

// 组合输入的 Enter 不应选中候选，compositionend 后浏览器尾随 input 不重复提交。
it('[autocomplete.ime.events] composition commits once without selecting', () => {
  const changed = vi.fn(), selected = vi.fn()
  const v = mount(() => <AutoComplete options={options} defaultOpen onChange={changed} onSelect={selected} />); dispose = v.dispose
  const el = v.host.querySelector('input')!
  el.dispatchEvent(new CompositionEvent('compositionstart')); flush()
  input(el, '中'); key(el, 'ArrowDown'); key(el, 'Enter')
  expect(selected).not.toHaveBeenCalled(); expect(changed).not.toHaveBeenCalled()
  el.dispatchEvent(new CompositionEvent('compositionend', { data: '中' })); flush()
  input(el, '中')
  expect(changed).toHaveBeenCalledExactlyOnceWith('中')
})

// 受控展开状态只由父层更新；关闭或禁用后浮层不可访问。
it('[autocomplete.open.controlled] external open and disable are reflected', () => {
  const [open, setOpen] = createSignal(false, { ownedWrite: true })
  const [disabled, setDisabled] = createSignal(false, { ownedWrite: true })
  const changed = vi.fn()
  const v = mount(() => <AutoComplete options={options} open={open()} disabled={disabled()} onOpenChange={changed} />); dispose = v.dispose
  const el = v.host.querySelector('input')!
  key(el, 'ArrowDown'); expect(changed).toHaveBeenCalledExactlyOnceWith(true)
  expect(el.getAttribute('aria-expanded')).toBe('false')
  setOpen(true); flush(); expect(el.getAttribute('aria-activedescendant')).toBeTruthy()
  setDisabled(true); flush(); expect(el.getAttribute('aria-expanded')).toBe('false')
  expect(document.querySelector('[role="listbox"]')?.getAttribute('aria-hidden')).toBe('true')
})
