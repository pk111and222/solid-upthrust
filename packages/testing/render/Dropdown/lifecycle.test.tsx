import { createSignal, flush } from 'solid-js'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import Dropdown, { type DropdownMenuItem, type DropdownTrigger } from '../../../components/lib/Dropdown'
import { mount } from '../../utils/mount'

let cleanup = () => {}
beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { cleanup(); cleanup = () => {}; vi.useRealTimers() })
const key = (element: Element, value: string, shiftKey = false) => {
  const event = new KeyboardEvent('keydown', { key: value, shiftKey, bubbles: true, cancelable: true })
  element.dispatchEvent(event); flush()
  return event
}
const settleFocus = () => { vi.advanceTimersByTime(160); flush() }

// 快速打开再关闭不能在延迟聚焦任务到期时把焦点抢进已经关闭的菜单。
it('[dropdown.lifecycle.focus-cancel] cancels pending focus when closed', () => {
  const view = mount(() => <Dropdown trigger="click" menu={{ items: [{ key: 'a', label: 'A' }] }}><button type="button">打开</button></Dropdown>)
  cleanup = view.dispose
  const button = view.host.querySelector('button')!
  button.focus(); button.click(); flush(); button.click(); flush()
  settleFocus()
  expect(document.activeElement).toBe(button)
})

// Escape 实际关闭后归还焦点，拒绝关闭的受控父组件不能让菜单丢失焦点。
it('[dropdown.lifecycle.focus-controlled] restores only after an accepted close', () => {
  const [open, setOpen] = createSignal(true, { ownedWrite: true })
  const onOpenChange = vi.fn()
  const view = mount(() => <Dropdown open={open()} trigger="click" onOpenChange={onOpenChange} menu={{ items: [{ key: 'a', label: 'A' }] }}><button type="button">打开</button></Dropdown>)
  cleanup = view.dispose
  const button = view.host.querySelector('button')!
  button.focus(); settleFocus()
  const item = document.querySelector<HTMLElement>('[role="menuitem"]')!
  item.focus(); item.click(); flush()
  expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false)
  expect(document.activeElement).toBe(item)
  setOpen(false); flush()
  expect(document.activeElement).toBe(button)
})

// 重新排列同一批对象后键盘必须按当前 DOM 顺序聚焦，不能继续使用旧 ref 下标。
it('[dropdown.keyboard.reorder] follows reordered and disabled items', () => {
  const a: DropdownMenuItem = { key: 'a', label: 'A' }
  const b: DropdownMenuItem = { key: 'b', label: 'B' }
  const [items, setItems] = createSignal([a, b], { ownedWrite: true })
  const onClick = vi.fn()
  const view = mount(() => <Dropdown trigger="click" menu={{ items: items(), onClick }}><button type="button">排序</button></Dropdown>)
  cleanup = view.dispose
  view.host.querySelector('button')!.click(); flush(); settleFocus()
  setItems([b, a]); flush()
  const menu = document.querySelector<HTMLElement>('[role="menu"]')!
  const nodes = menu.querySelectorAll<HTMLElement>('[role="menuitem"]')
  nodes[0].focus(); key(nodes[0], 'ArrowDown')
  expect(document.activeElement?.textContent).toBe('A')
  key(document.activeElement!, 'Enter')
  expect(onClick).toHaveBeenCalledExactlyOnceWith('a')
})

// 空菜单与全禁用菜单仍可接收 Escape，不产生越界的聚焦或激活。
it.each<{ items: DropdownMenuItem[] }>([{ items: [] }, { items: [{ key: 'disabled', label: '禁用', disabled: true }] }, { items: [{ key: 'divider', label: '', type: 'divider' }] }])('[dropdown.keyboard.empty] handles no enabled items: $items', ({ items }) => {
  const changed = vi.fn()
  const view = mount(() => <Dropdown trigger="click" onOpenChange={changed} menu={{ items }}><button type="button">空菜单</button></Dropdown>)
  cleanup = view.dispose
  const button = view.host.querySelector('button')!
  button.focus(); button.click(); flush(); settleFocus()
  const menu = document.querySelector<HTMLElement>('[role="menu"]')!
  expect(document.activeElement).toBe(menu)
  key(menu, 'ArrowDown'); key(menu, 'ArrowUp'); key(menu, 'Enter'); key(menu, ' ')
  expect(changed).toHaveBeenCalledExactlyOnceWith(true)
  key(menu, 'Escape')
  expect(changed).toHaveBeenLastCalledWith(false)
  expect(document.activeElement).toBe(button)
})

// 空菜单 Tab 不拦截浏览器默认顺序，只请求关闭，避免困住焦点。
it('[dropdown.keyboard.empty-tab] allows leaving an empty menu', () => {
  const changed = vi.fn()
  const view = mount(() => <Dropdown trigger="click" onOpenChange={changed} menu={{ items: [] }}><button type="button">空菜单</button></Dropdown>)
  cleanup = view.dispose
  view.host.querySelector('button')!.click(); flush(); settleFocus()
  const event = key(document.querySelector('[role="menu"]')!, 'Tab')
  expect(event.defaultPrevented).toBe(false)
  expect(changed).toHaveBeenLastCalledWith(false)
})

// 聚焦项被删除或禁用后焦点留在菜单中的下一个可用位置，不掉回页面 body。
it('[dropdown.keyboard.removed] keeps focus in a changing menu', () => {
  const [items, setItems] = createSignal<DropdownMenuItem[]>([{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }], { ownedWrite: true })
  const view = mount(() => <Dropdown trigger="click" menu={{ items: items() }}><button type="button">替换</button></Dropdown>)
  cleanup = view.dispose
  view.host.querySelector('button')!.click(); flush(); settleFocus()
  setItems([{ key: 'c', label: 'C' }, { key: 'd', label: 'D' }]); flush()
  expect(document.activeElement?.textContent).toBe('C')
  setItems([{ key: 'c', label: 'C', disabled: true }, { key: 'd', label: 'D' }]); flush()
  expect(document.activeElement?.textContent).toBe('D')
  setItems([]); flush()
  expect(document.activeElement?.getAttribute('role')).toBe('menu')
})

// 三种触发方式都能从原生可聚焦孩子用方向键打开，hover/contextMenu 还支持 Enter/Space。
it.each((['click', 'hover', 'contextMenu'] as DropdownTrigger[]).flatMap(action => (action === 'click' ? ['ArrowDown', 'ArrowUp'] : ['ArrowDown', 'ArrowUp', 'Enter', ' ']).map(value => ({ action, value }))))('[dropdown.keyboard.open] $action / $value', ({ action, value }) => {
  const changed = vi.fn()
  const view = mount(() => <Dropdown trigger={action} onOpenChange={changed} menu={{ items: [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }] }}><button type="button">键盘打开</button></Dropdown>)
  cleanup = view.dispose
  const button = view.host.querySelector('button')!
  button.focus()
  const event = key(button, value); settleFocus()
  expect(event.defaultPrevented).toBe(true)
  expect(changed).toHaveBeenCalledExactlyOnceWith(true)
  expect(document.activeElement?.textContent).toBe(value === 'ArrowUp' ? 'B' : 'A')
})

// 反向 Tab 反向循环，禁用项和分隔线不进入循环。
it('[dropdown.keyboard.shift-tab] cycles backwards', () => {
  const view = mount(() => <Dropdown trigger="click" menu={{ items: [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }] }}><button type="button">循环</button></Dropdown>)
  cleanup = view.dispose
  view.host.querySelector('button')!.click(); flush(); settleFocus()
  key(document.activeElement!, 'Tab', true)
  expect(document.activeElement?.textContent).toBe('B')
  key(document.activeElement!, 'Tab', true)
  expect(document.activeElement?.textContent).toBe('A')
})

// 鼠标从触发器移到另一控件后关闭时，不把用户新选择的焦点强拉回原触发器。
it('[dropdown.lifecycle.outside-focus] preserves a new outside focus target', () => {
  const [open, setOpen] = createSignal(false, { ownedWrite: true })
  const view = mount(() => <>
    <Dropdown trigger="click" open={open()} onOpenChange={setOpen} menu={{ items: [{ key: 'a', label: 'A' }] }}><button type="button">打开</button></Dropdown>
    <input aria-label="下一个控件" />
  </>)
  cleanup = view.dispose
  const button = view.host.querySelector('button')!
  button.focus(); button.click(); flush(); settleFocus()
  const input = view.host.querySelector('input')!
  input.focus(); setOpen(false); flush()
  expect(document.activeElement).toBe(input)
})

// 延迟销毁期间保留退出动画，但关闭的菜单必须退出辅助技术和键盘交互。
it('[dropdown.lifecycle.closed-aria] marks a retained closed menu hidden and inert', () => {
  const view = mount(() => <Dropdown trigger="click" menu={{ items: [{ key: 'a', label: 'A' }] }}><button type="button">打开</button></Dropdown>)
  cleanup = view.dispose
  const button = view.host.querySelector('button')!
  button.click(); flush()
  const menu = document.querySelector<HTMLElement>('[role="menu"]')!
  expect(menu.getAttribute('aria-hidden')).not.toBe('true')
  key(menu, 'Escape')
  expect(menu.isConnected).toBe(true)
  expect(menu.getAttribute('aria-hidden')).toBe('true')
  expect(menu.hasAttribute('inert')).toBe(true)
})

// 卸载后旧节点与待执行任务均不能触发回调，且 Portal 被完整移除。
it('[dropdown.lifecycle.dispose] releases DOM, focus tasks and listeners', () => {
  const changed = vi.fn()
  const view = mount(() => <Dropdown trigger="click" onOpenChange={changed} menu={{ items: [{ key: 'a', label: 'A' }] }}><button type="button">卸载</button></Dropdown>)
  cleanup = view.dispose
  const button = view.host.querySelector('button')!
  button.click(); flush()
  view.dispose(); cleanup = () => {}
  changed.mockClear(); button.click(); settleFocus()
  expect(changed).not.toHaveBeenCalled()
  expect(document.querySelector('[role="menu"]')).toBeNull()
  expect(vi.getTimerCount()).toBe(0)
})
