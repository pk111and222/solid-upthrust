import { createSignal, flush } from 'solid-js'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import Dropdown, { type DropdownTrigger } from '../../../components/lib/Dropdown'
import { mount } from '../../utils/mount'

let cleanup = () => {}
beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { cleanup(); cleanup = () => {}; vi.useRealTimers() })
const advance = (ms: number) => { vi.advanceTimersByTime(ms); flush() }

// 父组件可独立开关，关闭保留离场 DOM，宽限期内复用，超时再销毁并可重新挂载。
it('[dropdown.controlled.external] mounts, retains and destroys external controlled changes', () => {
  const [open, setOpen] = createSignal(false, { ownedWrite: true })
  const changed = vi.fn()
  const view = mount(() => <Dropdown open={open()} onOpenChange={changed} menu={{ items: [{ key: 'x', label: 'X' }] }}><button type="button">控制</button></Dropdown>)
  cleanup = view.dispose
  expect(document.querySelector('[role="menu"]')).toBeNull()
  setOpen(true); flush()
  const first = document.querySelector('[role="menu"]')!
  expect(first).not.toBeNull()
  setOpen(false); flush(); advance(500)
  expect(first.isConnected).toBe(true)
  setOpen(true); flush()
  expect(document.querySelector('[role="menu"]')).toBe(first)
  setOpen(false); flush(); advance(1300)
  expect(first.isConnected).toBe(false)
  setOpen(true); flush()
  expect(document.querySelector('[role="menu"]')).not.toBe(first)
  expect(changed).not.toHaveBeenCalled()
})

// 受控父组件拒绝开关请求时，不能挂载幽灵菜单或销毁仍需显示的菜单。
it('[dropdown.controlled.rejected] requests changes without drifting visible state', () => {
  const [open, setOpen] = createSignal(false, { ownedWrite: true })
  const changed = vi.fn()
  const view = mount(() => <Dropdown trigger="click" open={open()} onOpenChange={changed} menu={{ items: [{ key: 'x', label: 'X' }] }}><button type="button">拒绝</button></Dropdown>)
  cleanup = view.dispose
  const button = view.host.querySelector('button')!
  button.click(); flush(); advance(200)
  expect(changed).toHaveBeenCalledExactlyOnceWith(true)
  expect(document.querySelector('[role="menu"]')).toBeNull()
  setOpen(true); flush(); advance(160)
  const menu = document.querySelector('[role="menu"]')!
  button.click(); flush(); advance(1500)
  expect(changed).toHaveBeenLastCalledWith(false)
  expect(menu.isConnected).toBe(true)
  expect(menu.getAttribute('aria-hidden')).not.toBe('true')
})

// defaultOpen 仅初始化一次，不能在后续 prop 更新时重置用户的开关选择。
it.each([true, false])('[dropdown.controlled.default] only seeds defaultOpen=%s', defaultOpen => {
  const [value, setValue] = createSignal(defaultOpen, { ownedWrite: true })
  const view = mount(() => <Dropdown defaultOpen={value()} trigger="click" menu={{ items: [] }}><button type="button">初始值</button></Dropdown>)
  cleanup = view.dispose
  const wrapper = view.host.querySelector('[aria-haspopup="menu"]')!
  expect(wrapper.getAttribute('aria-expanded')).toBe(String(defaultOpen))
  setValue(!defaultOpen); flush()
  expect(wrapper.getAttribute('aria-expanded')).toBe(String(defaultOpen))
  view.host.querySelector('button')!.click(); flush()
  expect(wrapper.getAttribute('aria-expanded')).toBe(String(!defaultOpen))
})

// 动态切换触发方式应移除旧动作语义，右键仅在启用时阻止原生菜单。
it('[dropdown.trigger.dynamic] follows action and disabled updates', () => {
  const [action, setAction] = createSignal<DropdownTrigger>('click', { ownedWrite: true })
  const [disabled, setDisabled] = createSignal(false, { ownedWrite: true })
  const changed = vi.fn()
  const view = mount(() => <Dropdown trigger={action()} disabled={disabled()} onOpenChange={changed} menu={{ items: [] }}><button type="button">切换</button></Dropdown>)
  cleanup = view.dispose
  const wrapper = view.host.querySelector<HTMLElement>('[aria-haspopup="menu"]')!
  setAction('hover'); flush()
  wrapper.click(); flush()
  expect(changed).not.toHaveBeenCalled()
  wrapper.dispatchEvent(new MouseEvent('mouseenter')); flush()
  expect(changed).toHaveBeenLastCalledWith(true)
  wrapper.dispatchEvent(new MouseEvent('mouseleave')); advance(100)
  expect(changed).toHaveBeenLastCalledWith(false)
  setAction('contextMenu'); setDisabled(true); flush()
  const blocked = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
  wrapper.dispatchEvent(blocked); flush()
  expect(blocked.defaultPrevented).toBe(false)
  setDisabled(false); flush()
  const context = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
  wrapper.dispatchEvent(context); flush()
  expect(context.defaultPrevented).toBe(true)
  expect(changed).toHaveBeenLastCalledWith(true)
})

// hover 默认不夺焦点，跨越触发器和浮层的间隙后仍保持打开，移出 100ms 后关闭。
it('[dropdown.trigger.hover] bridges trigger and layer without stealing focus', () => {
  const changed = vi.fn()
  const view = mount(() => <><button type="button">原焦点</button><Dropdown onOpenChange={changed} menu={{ items: [{ key: 'x', label: 'X' }] }}><button type="button">悬停</button></Dropdown></>)
  cleanup = view.dispose
  const original = view.host.querySelector('button')!
  original.focus()
  const wrapper = view.host.querySelector('[aria-haspopup="menu"]')!
  wrapper.dispatchEvent(new MouseEvent('mouseenter')); flush()
  const menu = document.querySelector('[role="menu"]')!
  wrapper.dispatchEvent(new MouseEvent('mouseleave')); advance(50)
  menu.dispatchEvent(new MouseEvent('mouseenter')); advance(200)
  expect(document.activeElement).toBe(original)
  expect(changed).toHaveBeenCalledExactlyOnceWith(true)
  menu.dispatchEvent(new MouseEvent('mouseleave')); advance(99)
  expect(changed).toHaveBeenCalledOnce()
  advance(1)
  expect(changed.mock.calls).toEqual([[true], [false]])
})

// 禁用与三种触发方式成对覆盖，启用后同一节点可继续使用。
it.each(['click', 'hover', 'contextMenu'] as const)('[dropdown.disabled] blocks %s until enabled', action => {
  const [disabled, setDisabled] = createSignal(true, { ownedWrite: true })
  const changed = vi.fn()
  const view = mount(() => <Dropdown trigger={action} disabled={disabled()} onOpenChange={changed} menu={{ items: [] }}><button type="button">启用</button></Dropdown>)
  cleanup = view.dispose
  const wrapper = view.host.querySelector('[aria-haspopup="menu"]')!
  const fire = () => { wrapper.dispatchEvent(new MouseEvent({ click: 'click', hover: 'mouseenter', contextMenu: 'contextmenu' }[action], { bubbles: true, cancelable: true })); flush() }
  fire(); advance(200)
  expect(changed).not.toHaveBeenCalled()
  expect(document.querySelector('[role="menu"]')).toBeNull()
  setDisabled(false); flush(); fire()
  expect(changed).toHaveBeenCalledExactlyOnceWith(true)
})

// 显式受控关闭优先于 defaultOpen，初始化时也不能生成隐藏的幽灵菜单。
it('[dropdown.controlled.default-priority] controlled false overrides defaultOpen', () => {
  const view = mount(() => <Dropdown open={false} defaultOpen menu={{ items: [] }}><button>受控初始值</button></Dropdown>)
  cleanup = view.dispose
  expect(view.host.querySelector('[aria-haspopup="menu"]')?.getAttribute('aria-expanded')).toBe('false')
  expect(document.querySelector('[role="menu"]')).toBeNull()
  advance(1500)
  expect(document.querySelector('[role="menu"]')).toBeNull()
})
