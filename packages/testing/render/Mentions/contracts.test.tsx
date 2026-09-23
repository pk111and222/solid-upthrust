import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Mentions from '../../../components/lib/Mentions'
import Form, { FormItem } from '../../../components/lib/Form'
import type { FormInstance } from '../../../competence/src/form'
import { mount } from '../../utils/mount'

let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })
const options = [{ value: 'alice', label: 'Alice' }, { value: 'blocked', disabled: true }, { value: 'bob', label: 'Bob' }]
const type = (el: HTMLTextAreaElement, text: string) => {
  el.value = text
  el.setSelectionRange(text.length, text.length)
  el.dispatchEvent(new Event('input', { bubbles: true }))
  flush()
}
const key = (el: HTMLTextAreaElement, name: string) => {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }))
  flush()
}

// 输入框应关联候选列表，键盘跳过禁用项并将提及插入当前光标位置。
it('[mentions.keyboard.commit] exposes combobox semantics and commits active option', async () => {
  const onSelect = vi.fn()
  const view = mount(() => <Mentions options={options} aria-label="提及同事" onSelect={onSelect} />); dispose = view.dispose
  const el = view.host.querySelector('textarea')!
  expect(el.getAttribute('rows')).toBe('3')
  expect(el.getAttribute('role')).toBe('combobox')
  type(el, 'Hi @')
  expect(el.getAttribute('aria-expanded')).toBe('true')
  expect(el.getAttribute('aria-controls')).toBe(document.querySelector('[role="listbox"]')?.id)
  key(el, 'ArrowDown'); key(el, 'Enter')
  expect(el.value).toBe('Hi @bob ')
  await Promise.resolve()
  expect(el.selectionStart).toBe('Hi @bob '.length)
  expect(onSelect).toHaveBeenCalledExactlyOnceWith(options[2], '@')
  expect(el.getAttribute('aria-expanded')).toBe('false')
})

// 焦点事件仅回调一次且传递浏览器事件，点击候选时仍可完成选择。
it('[mentions.events.focus] forwards real focus events once', () => {
  const onFocus = vi.fn(), onBlur = vi.fn()
  const view = mount(() => <Mentions options={options} onFocus={onFocus} onBlur={onBlur} />); dispose = view.dispose
  const el = view.host.querySelector('textarea')!
  el.dispatchEvent(new FocusEvent('focus')); flush()
  el.dispatchEvent(new FocusEvent('blur')); flush()
  expect(onFocus).toHaveBeenCalledOnce(); expect(onBlur).toHaveBeenCalledOnce()
  expect(onFocus.mock.calls[0][0]).toBeInstanceOf(FocusEvent)
  expect(onBlur.mock.calls[0][0]).toBeInstanceOf(FocusEvent)
})

// Escape 关闭且不改文本，移动光标或再次输入才能恢复当前建议。
it('[mentions.open.dismiss] Escape hides the popup until a new edit', () => {
  const changed = vi.fn()
  const view = mount(() => <Mentions options={options} onOpenChange={changed} />); dispose = view.dispose
  const el = view.host.querySelector('textarea')!
  type(el, '@a'); expect(el.getAttribute('aria-expanded')).toBe('true')
  key(el, 'Escape'); expect(el.getAttribute('aria-expanded')).toBe('false')
  expect(el.value).toBe('@a')
  expect(document.querySelector('[role="listbox"]')?.getAttribute('aria-hidden')).toBe('true')
  type(el, '@al'); expect(el.getAttribute('aria-expanded')).toBe('true')
  expect(changed.mock.calls.map(call => call[0])).toEqual([true, false, true])
})

// Form.Item 应接受输入和选项提交，并把字段重置反映到文本框。
it('[mentions.form.field] syncs typing, selection and reset', () => {
  let form: FormInstance | undefined
  const view = mount(() => <Form ref={instance => { form = instance }} initialValues={{ message: 'Hi' }}>
    <FormItem name="message" label="消息"><Mentions options={options} /></FormItem>
  </Form>); dispose = view.dispose
  const el = view.host.querySelector('textarea')!
  expect(el.value).toBe('Hi')
  type(el, 'Hi @a')
  expect(form?.getFieldValue('message')).toBe('Hi @a')
  document.querySelector<HTMLElement>('[role="option"]')?.click(); flush()
  expect(form?.getFieldValue('message')).toBe('Hi @alice ')
  form?.resetFields(); flush()
  expect(el.value).toBe('Hi')
})

// 外部候选变化应原位刷新；受控文本始终服从父层写回。
it('[mentions.controlled.dynamic] updates options and controlled value', () => {
  const [value, setValue] = createSignal('@', { ownedWrite: true })
  const [pool, setPool] = createSignal(options.slice(0, 1), { ownedWrite: true })
  const view = mount(() => <Mentions value={value()} onChange={setValue} options={pool()} />); dispose = view.dispose
  const el = view.host.querySelector('textarea')!
  el.dispatchEvent(new FocusEvent('focus')); flush()
  expect(document.querySelectorAll('[role="option"]')).toHaveLength(1)
  setPool([{ value: 'next', label: 'Next' }]); flush()
  expect(document.querySelector('[role="option"]')?.textContent).toContain('Next')
  setValue('plain'); flush()
  expect(el.value).toBe('plain')
  expect(el.getAttribute('aria-expanded')).toBe('false')
})

// 禁用、名称、行数、状态与自定义前缀保持原生输入语义。
it('[mentions.props.surface] applies native textarea props and custom prefix', () => {
  const view = mount(() => <Mentions options={options} prefix="#" rows={2} name="message" id="mention-box" placeholder="输入 #" status="error" class="mention-demo" style={{ width: '240px' }} aria-labelledby="mention-title" />); dispose = view.dispose
  const el = view.host.querySelector('textarea')!
  expect(el.id).toBe('mention-box'); expect(el.name).toBe('message'); expect(el.getAttribute('rows')).toBe('2')
  expect(el.getAttribute('aria-labelledby')).toBe('mention-title')
  expect(el.parentElement?.className).toContain('mention-demo')
  expect(el.parentElement?.style.width).toBe('240px')
  expect(el.placeholder).toBe('输入 #'); expect(el.className).toContain('border-error')
  type(el, '#bo')
  expect(document.querySelectorAll('[role="option"]')).toHaveLength(1)
  expect(document.querySelector('[role="option"]')?.textContent).toContain('Bob')
})

// 自定义过滤和默认开态可显示全部候选；禁用项不能通过指针提交。
it('[mentions.filter.disabled] shows server options and blocks disabled choice', () => {
  const onChange = vi.fn()
  const view = mount(() => <Mentions defaultValue="@a" options={options} filterOption={false} defaultOpen onChange={onChange} />); dispose = view.dispose
  const el = view.host.querySelector('textarea')!
  expect(el.getAttribute('aria-expanded')).toBe('true')
  expect(document.querySelectorAll('[role="option"]')).toHaveLength(3)
  document.querySelectorAll<HTMLElement>('[role="option"]')[1].click(); flush()
  expect(onChange).not.toHaveBeenCalled()
  expect(el.value).toBe('@a')
})

// 受控开态只发出关闭请求；父层明确更新后浮层才关闭。
it('[mentions.open.controlled] preserves parent ownership of open', () => {
  const [open, setOpen] = createSignal(true, { ownedWrite: true })
  const onOpenChange = vi.fn()
  const view = mount(() => <Mentions defaultValue="@a" options={options} open={open()} onOpenChange={onOpenChange} />); dispose = view.dispose
  const el = view.host.querySelector('textarea')!
  expect(el.getAttribute('aria-expanded')).toBe('true')
  key(el, 'Escape')
  expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false)
  expect(el.getAttribute('aria-expanded')).toBe('true')
  setOpen(false); flush()
  expect(el.getAttribute('aria-expanded')).toBe('false')
})

// 父层不接受受控编辑时，浏览器 DOM 应回到有效 value。
it('[mentions.value.rejected] restores controlled text after a rejected edit', () => {
  const onChange = vi.fn()
  const view = mount(() => <Mentions value="fixed" onChange={onChange} />); dispose = view.dispose
  const el = view.host.querySelector('textarea')!
  type(el, 'other')
  expect(onChange).toHaveBeenCalledExactlyOnceWith('other')
  expect(el.value).toBe('fixed')
})

// 输入法期间 Enter 不选候选，提交后的原生尾随 input 不重复发回调。
it('[mentions.ime.events] commits once after composition', () => {
  const onChange = vi.fn(), onSelect = vi.fn()
  const view = mount(() => <Mentions options={[{ value: '中文' }]} onChange={onChange} onSelect={onSelect} />); dispose = view.dispose
  const el = view.host.querySelector('textarea')!
  el.dispatchEvent(new CompositionEvent('compositionstart')); flush()
  type(el, '@中'); key(el, 'Enter')
  expect(onSelect).not.toHaveBeenCalled(); expect(onChange).not.toHaveBeenCalled()
  el.dispatchEvent(new CompositionEvent('compositionend', { data: '中' })); flush()
  type(el, '@中')
  expect(onChange).toHaveBeenCalledExactlyOnceWith('@中')
})
