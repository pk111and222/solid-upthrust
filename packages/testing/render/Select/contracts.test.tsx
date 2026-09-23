import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Select from '../../../components/lib/Select'
import Form, { FormItem } from '../../../components/lib/Form'
import { FormItemContext, type FormItemControl } from '../../../components/lib/Input/context'
import type { FormInstance } from '../../../competence/src/form'
import { mount } from '../../utils/mount'

let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })
const options = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '樱桃', value: 'cherry' },
]

// 单选选项提交后，实际浮层与 combobox 展开状态都应关闭。
it('[select.single.close] picking an option closes the trigger layer', () => {
  const changed = vi.fn()
  const view = mount(() => <Select options={options} defaultOpen onChange={changed} virtual={false} />)
  dispose = view.dispose
  const box = view.host.querySelector('[role="combobox"]')!
  expect(box.getAttribute('aria-expanded')).toBe('true')
  expect(document.querySelectorAll<HTMLElement>('[role="option"]')[1]?.textContent).toContain('香蕉')
  document.querySelectorAll<HTMLElement>('[role="option"]')[1].click(); flush()
  expect(changed).toHaveBeenCalledWith('banana')
  expect(box.getAttribute('aria-expanded')).toBe('false')
  expect(document.querySelector('[role="listbox"]')?.getAttribute('aria-hidden')).toBe('true')
})

// 搜索输入中的方向键只移动一个候选，不能再次由外层 combobox 处理。
it('[select.keyboard.search] arrow key from search input moves once', () => {
  const view = mount(() => <Select options={options} showSearch defaultOpen virtual={false} />)
  dispose = view.dispose
  const input = view.host.querySelector('input')!
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); flush()
  const active = [...document.querySelectorAll('[role="option"]')].find(node => node.classList.contains('bg-on-surface/6'))
  expect(active?.textContent).toContain('香蕉')
})

// Form.Item 注入的字段回调应收到 Select 选值，并驱动受控显示。
it('[select.form.field] injected value and onChange update selection', () => {
  const [value, setValue] = createSignal<unknown>('apple', { ownedWrite: true })
  const field = vi.fn((next: unknown) => setValue(next))
  const context: FormItemControl = {
    value, onChange: field, id: () => 'fruit', disabled: () => false,
    size: () => 'small', validateStatus: () => 'error',
  }
  const view = mount(() => <FormItemContext value={context}>
    <Select options={options} defaultOpen virtual={false} />
  </FormItemContext>)
  dispose = view.dispose
  const box = view.host.querySelector('[role="combobox"]')!
  expect(box.id).toBe('fruit')
  expect(box.textContent).toContain('苹果')
  document.querySelectorAll<HTMLElement>('[role="option"]')[1].click(); flush()
  expect(field).toHaveBeenCalledWith('banana', undefined)
  expect(box.textContent).toContain('香蕉')
})

// 清空操作应可用键盘激活；不得触发选择器的点击开关。
it('[select.clear.button] click clears without toggling dropdown', async () => {
  const clear = vi.fn(), changed = vi.fn()
  const view = mount(() => <Select options={options} defaultValue="apple" allowClear onClear={clear} onChange={changed} />)
  dispose = view.dispose
  const button = view.host.querySelector<HTMLButtonElement>('button[aria-label="清空"]')!
  expect(button).not.toBeNull()
  expect(button.querySelector('.i-mdi-close')).not.toBeNull()
  expect(view.host.querySelector('.i-mdi-chevron-down')).toBeNull()
  button.click(); flush()
  expect(clear).toHaveBeenCalledOnce()
  expect(changed).toHaveBeenCalledWith(undefined)
  expect(view.host.querySelector('.i-mdi-chevron-down')).toBeNull()
  await vi.waitFor(() => expect(view.host.querySelector('.i-mdi-chevron-down')).not.toBeNull())
  expect(view.host.querySelector('[role="combobox"]')?.getAttribute('aria-expanded')).toBe('false')
})

// Select 浮层与选择器同宽起步，但选项内容更宽时由内容决定最终宽度。
it('[select.popup.content-width] popup uses content width with selector minimum', () => {
  const measure = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return this.getAttribute('role') === 'combobox'
      ? new DOMRect(0, 0, 240, 32)
      : new DOMRect(0, 0, 0, 0)
  })
  try {
    const view = mount(() => <Select options={options} defaultOpen />); dispose = view.dispose
    const popup = document.querySelector<HTMLElement>('[role="listbox"]')!
    expect(popup.style.width).toBe('max-content')
    expect(popup.style.minWidth).toBe('240px')
  } finally { measure.mockRestore() }
})

// 显式设置选择器宽度时，弹层严格继承该宽度，不再由内容撑宽。
it('[select.popup.explicit-width] explicit selector width overrides content sizing', () => {
  const measure = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return this.getAttribute('role') === 'combobox' ? new DOMRect(0, 0, 180, 32) : new DOMRect(0, 0, 0, 0)
  })
  try {
    const view = mount(() => <Select options={options} defaultOpen style={{ width: '180px' }} />); dispose = view.dispose
    const popup = document.querySelector<HTMLElement>('[role="listbox"]')!
    expect(popup.style.width).toBe('180px')
    expect(popup.style.minWidth).toBe('')
  } finally { measure.mockRestore() }
})

// 受控单选写回 undefined 后应真正清空 UI，并让清除按钮恢复为下拉箭头。
it('[select.clear.controlled] parent accepts empty value', async () => {
  const [value, setValue] = createSignal<string | undefined>('apple', { ownedWrite: true })
  const view = mount(() => <Select options={options} value={value()} onChange={next => setValue(next as string | undefined)} allowClear />)
  dispose = view.dispose
  const box = view.host.querySelector<HTMLElement>('[role="combobox"]')!
  expect(box.textContent).toContain('苹果')
  view.host.querySelector<HTMLButtonElement>('button[aria-label="清空"]')!.click(); flush()
  expect(value()).toBeUndefined()
  expect(box.textContent).not.toContain('苹果')
  await vi.waitFor(() => expect(box.querySelector('.i-mdi-chevron-down')).not.toBeNull())
})

// 多选标签的移除按钮必须提交一次变更，且不打开下拉层。
it('[select.tags.remove] tag close is an accessible button', () => {
  const changed = vi.fn()
  const view = mount(() => <Select options={options} mode="multiple" defaultValue={['apple', 'banana']} onChange={changed} />)
  dispose = view.dispose
  const button = view.host.querySelector<HTMLButtonElement>('button[aria-label="移除 苹果"]')!
  expect(button).not.toBeNull()
  button.click(); flush()
  expect(changed).toHaveBeenCalledWith(['banana'])
  expect(view.host.querySelector('[role="combobox"]')?.getAttribute('aria-expanded')).toBe('false')
})

// 受控 open 只提出切换请求，父层接受后才改变展开状态。
it('[select.open.controlled] parent controls popup lifecycle', () => {
  const [open, setOpen] = createSignal(false, { ownedWrite: true })
  const changed = vi.fn()
  const view = mount(() => <Select aria-label="水果" options={options} open={open()} onOpenChange={changed} />)
  dispose = view.dispose
  const box = view.host.querySelector<HTMLElement>('[role="combobox"]')!
  box.click(); flush()
  expect(changed).toHaveBeenCalledExactlyOnceWith(true)
  expect(box.getAttribute('aria-expanded')).toBe('false')
  setOpen(true); flush()
  expect(box.getAttribute('aria-expanded')).toBe('true')
  const list = document.querySelector('[role="listbox"]')!
  expect(box.getAttribute('aria-controls')).toBe(list.id)
  expect(list.getAttribute('aria-hidden')).toBeNull()
  setOpen(false); flush()
  expect(box.getAttribute('aria-expanded')).toBe('false')
  expect(list.getAttribute('aria-hidden')).toBe('true')
})

// 公开展示属性与隐藏输入使用真实 DOM 值，禁用时隐藏输入不参加提交。
it('[select.props.presentation] size, status, loading, name and filter passthrough', () => {
  const view = mount(() => <Select aria-label="状态水果" options={options} mode="multiple" defaultValue={['apple', 'banana']}
    name="fruit" size="small" status="error" loading maxTagCount={1} filterOption={false}
    class="custom-select" style={{ width: '200px' }} />)
  dispose = view.dispose
  const box = view.host.querySelector<HTMLElement>('[role="combobox"]')!
  expect(box.className).toContain('h-auto')
  expect(box.getAttribute('aria-invalid')).toBe('true')
  expect(view.host.querySelector('[role="status"]')?.getAttribute('aria-label')).toBe('加载中')
  expect(view.host.querySelectorAll('input[name="fruit"]')).toHaveLength(2)
  expect(view.host.querySelector('.custom-select')).not.toBeNull()
  expect((view.host.querySelector('.custom-select') as HTMLElement).style.width).toBe('200px')
  expect(box.textContent).toContain('+1')
})

// 真实 Form.Item 的字段值、选择提交与 resetFields 应保持同步。
it('[select.form.real] form submit and reset', async () => {
  const finish = vi.fn()
  let form: FormInstance | undefined
  const view = mount(() => <Form ref={instance => { form = instance }} initialValues={{ fruit: 'apple' }} onFinish={finish}>
    <FormItem name="fruit" label="水果"><Select options={options} defaultOpen virtual={false} allowClear /></FormItem>
    <button type="submit">提交</button>
  </Form>)
  dispose = view.dispose
  const box = view.host.querySelector('[role="combobox"]')!
  expect(box.id).toBe('upthrust-form-item-fruit')
  expect(box.getAttribute('aria-disabled')).toBe('false')
  expect(box.textContent).toContain('苹果')
  expect(document.querySelectorAll<HTMLElement>('[role="option"]')[1]?.textContent).toContain('香蕉')
  document.querySelectorAll<HTMLElement>('[role="option"]')[1].click(); flush()
  expect(form?.getFieldValue('fruit')).toBe('banana')
  expect(box.textContent).toContain('香蕉')
  await form?.submit()
  expect(finish).toHaveBeenCalledWith({ fruit: 'banana' })
  box.querySelector<HTMLButtonElement>('button[aria-label="清空"]')!.click(); flush()
  expect(form?.getFieldValue('fruit')).toBeUndefined()
  expect(box.textContent).not.toContain('香蕉')
  form?.resetFields(); flush()
  expect(box.textContent).toContain('苹果')
})
