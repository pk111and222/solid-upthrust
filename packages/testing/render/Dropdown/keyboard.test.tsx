import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { mount } from '../../utils/mount'
import Button from '../../../components/lib/Button'
import Dropdown from '../../../components/lib/Dropdown'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {}; vi.useRealTimers() })

// click 打开后将焦点移入首个可用项，disabled/divider 不进入导航序列，方向键循环。
it('[dropdown.keyboard.navigation] cycles enabled menu items', () => {
  vi.useFakeTimers()
  const view = mount(() => (
    <Dropdown trigger="click" menu={{ items: [
      { key: 'disabled', label: '禁用', disabled: true },
      { key: 'first', label: '第一项' },
      { key: 'divider', label: '', type: 'divider' },
      { key: 'last', label: '最后项' },
    ] }}>
      <Button>键盘菜单</Button>
    </Dropdown>
  ))
  cleanup = view.dispose
  const trigger = view.host.querySelector('button')!
  trigger.click(); flush()
  const overlay = document.querySelector<HTMLElement>('[role="menu"]')!
  const items = overlay.querySelectorAll<HTMLElement>('[role="menuitem"]')

  vi.advanceTimersByTime(160); flush()
  expect(document.activeElement).toBe(items[1])
  items[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
  flush()
  expect(document.activeElement).toBe(items[2])
  items[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
  flush()
  expect(document.activeElement).toBe(items[1])
  items[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))
  flush()
  expect(document.activeElement).toBe(items[2])
})

// Enter 和 Space 分别选择当前项，Tab 在可用项间循环，每次只触发一次回调。
it.each(['Enter', ' '])('[dropdown.keyboard.activation] activates with %s after Tab', activationKey => {
  vi.useFakeTimers()
  const onClick = vi.fn()
  const view = mount(() => (
    <Dropdown trigger="click" menu={{ items: [
      { key: 'one', label: '第一项' },
      { key: 'two', label: '第二项' },
    ], onClick }}>
      <Button>激活菜单</Button>
    </Dropdown>
  ))
  cleanup = view.dispose
  view.host.querySelector('button')!.click(); flush()
  const overlay = document.querySelector<HTMLElement>('[role="menu"]')!
  const items = overlay.querySelectorAll<HTMLElement>('[role="menuitem"]')
  vi.advanceTimersByTime(160); flush()
  items[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))
  flush()
  expect(document.activeElement).toBe(items[1])
  items[1].dispatchEvent(new KeyboardEvent('keydown', { key: activationKey, bubbles: true, cancelable: true }))
  flush()
  expect(onClick).toHaveBeenCalledWith('two')
  expect(onClick).toHaveBeenCalledOnce()
})

// Escape 和浮层外 pointerdown 都关闭菜单，受控值由父层更新后才改变可见状态。
it('[dropdown.dismiss.controlled] dismisses uncontrolled and respects controlled open', () => {
  const uncontrolled = mount(() => <Dropdown trigger="click" menu={{ items: [{ key: 'x', label: 'x' }] }}><Button>非受控</Button></Dropdown>)
  cleanup = uncontrolled.dispose
  uncontrolled.host.querySelector('button')!.click(); flush()
  let overlay = document.querySelector<HTMLElement>('[role="menu"]')!
  overlay.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); flush()
  expect(overlay.className).toContain('opacity-0')
  uncontrolled.dispose(); cleanup = () => {}

  const [open, setOpen] = createSignal(false, { ownedWrite: true })
  const changes: boolean[] = []
  const controlled = mount(() => <Dropdown open={open()} onOpenChange={value => { changes.push(value); setOpen(value) }} trigger="click" menu={{ items: [{ key: 'x', label: 'x' }] }}><Button>受控</Button></Dropdown>)
  cleanup = controlled.dispose
  controlled.host.querySelector('button')!.click(); flush()
  expect(open()).toBe(true)
  overlay = document.querySelector<HTMLElement>('[role="menu"]')!
  document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
  flush()
  expect(open()).toBe(false)
  expect(changes).toEqual([true, false])
})

// open/disabled/trigger 的受控 props 变化应同步到同一个组件实例。
it('[dropdown.controlled.dynamic] follows dynamic open and disabled props', () => {
  const [open, setOpen] = createSignal(false, { ownedWrite: true })
  const [disabled, setDisabled] = createSignal(false, { ownedWrite: true })
  const view = mount(() => <Dropdown open={open()} disabled={disabled()} trigger="click" menu={{ items: [{ key: 'x', label: 'x' }] }}><Button>动态</Button></Dropdown>)
  cleanup = view.dispose
  expect(document.querySelector('[role="menu"]')).toBeNull()
  setOpen(true); flush()
  expect(document.querySelector('[role="menu"]')).not.toBeNull()
  setDisabled(true); flush()
  view.host.querySelector('button')!.click(); flush()
  // disabled 阻止用户请求，但不覆盖父组件明确传入的 open。
  expect(open()).toBe(true)
  expect(document.querySelector('[role="menu"]')?.className).toContain('opacity-100')
  setOpen(false); flush()
  expect(document.querySelector('[role="menu"]')?.className).toContain('opacity-0')
})
