import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Pagination from '../../../components/lib/Pagination'
import { mount } from '../../utils/mount'
let dispose = () => {}
afterEach(() => dispose())
// 表单中的页码和容量按钮不能触发表单提交，跳页框必须有可访问名称。
it('[pagination.form.buttons] uses non-submit controls', () => {
  const view = mount(() => <form><Pagination total={100} showQuickJumper pageSizeOptions={[10, 20]} /></form>); dispose = view.dispose
  expect([...view.host.querySelectorAll('button')].every(b => b.type === 'button')).toBe(true)
  expect(view.host.querySelector('input')?.getAttribute('aria-label')).toBe('跳转页码')
  expect(view.host.querySelector('nav')?.getAttribute('aria-label')).toBe('分页')
})
// 快速跳页只接受完整正整数，Enter 不冒泡为表单默认动作。
it('[pagination.jumper.validation] rejects mixed text and prevents submit', () => {
  const changed = vi.fn()
  const view = mount(() => <Pagination total={100} showQuickJumper onChange={changed} />); dispose = view.dispose
  const input = view.host.querySelector('input')!
  for (const value of ['2x', '2.5', '-3', '', 'Infinity']) {
    input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); flush()
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    input.dispatchEvent(event); flush(); expect(event.defaultPrevented).toBe(true)
  }
  expect(changed).not.toHaveBeenCalled()
  input.value = ' 3 '; input.dispatchEvent(new Event('input', { bubbles: true })); flush()
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })); flush()
  expect(changed).toHaveBeenCalledExactlyOnceWith(3, 10); expect(input.value).toBe('')
})
// 禁用保留容量入口并禁止交互；解除禁用、单页隐藏和空总数都响应更新。
it('[pagination.disabled.dynamic] retains disabled controls and toggles visibility', () => {
  const [disabled, setDisabled] = createSignal(true, { ownedWrite: true })
  const [total, setTotal] = createSignal(100, { ownedWrite: true })
  const view = mount(() => <Pagination total={total()} disabled={disabled()} hideOnSinglePage showQuickJumper pageSizeOptions={[10, 20]} />); dispose = view.dispose
  expect(view.host.textContent).toContain('10 条/页')
  expect([...view.host.querySelectorAll('button,input')].every(b => (b as HTMLButtonElement).disabled)).toBe(true)
  setDisabled(false); flush(); expect(view.host.querySelector('input')?.disabled).toBe(false)
  setTotal(10); flush(); expect(view.host.querySelector('nav')).toBeNull()
  setTotal(20); flush(); expect(view.host.querySelector('nav')).not.toBeNull()
})
// 外部页码与容量更新后，页码高亮和总数区间同步，样式属性正确透传。
it('[pagination.props.presentation] tracks controlled state and presentation', () => {
  const [current, setCurrent] = createSignal(1, { ownedWrite: true })
  const changed = vi.fn()
  const view = mount(() => <Pagination total={85} current={current()} pageSize={20} size="small" align="end" class="custom-pagination" style={{ margin: '7px' }} onChange={changed} showTotal={(t,r) => `${r[0]}-${r[1]}/${t}`} />); dispose = view.dispose
  const nav = view.host.querySelector('nav')!
  expect(nav.className).toContain('justify-end'); expect(nav.className).toContain('custom-pagination'); expect(nav.style.margin).toBe('7px')
  view.host.querySelector<HTMLButtonElement>('[aria-label="Next Page"]')!.click(); flush()
  expect(changed).toHaveBeenCalledExactlyOnceWith(2,20); expect(view.host.querySelector('[aria-current]')?.textContent).toBe('1')
  setCurrent(5); flush(); expect(nav.textContent).toContain('81-85/85')
  expect(view.host.querySelector('[aria-current]')?.textContent).toBe('5')
})
// 容量选项过滤重复和无效项；打开菜单后动态禁用关闭浮层，卸载移除 portal。
it('[pagination.options.lifecycle] filters options and closes when disabled', () => {
  const [disabled, setDisabled] = createSignal(false, { ownedWrite: true })
  const [options, setOptions] = createSignal([0, 10, 10, 20, NaN], { ownedWrite: true })
  const view = mount(() => <Pagination total={100} disabled={disabled()} pageSizeOptions={options()} />); dispose = view.dispose
  const trigger = [...view.host.querySelectorAll('button')].find(b => b.textContent?.includes('条/页'))!
  trigger.click(); flush()
  expect(document.querySelectorAll('[role="menuitem"]')).toHaveLength(2)
  setDisabled(true); flush()
  expect(document.querySelector('[role="menu"]')).toBeNull()
  setOptions([]); flush(); expect(view.host.textContent).not.toContain('条/页')
  view.dispose(); dispose = () => {}
  expect(document.querySelector('[role="menu"]')).toBeNull()
})
