import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { createDropdown, dropdownSplits, type DropdownConfig, type DropdownPlacement } from '../../../competence/src/dropdown'

let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {}; vi.useRealTimers() })
function setup(config: DropdownConfig = {}) {
  return createRoot(cleanup => { dispose = cleanup; return createDropdown(config) })
}

// 旧 headless 导出保留原来的方法与初始值，不把它当作当前 UI 的 createTrigger 实现。
it('[dropdown.legacy.exports] preserves the compatibility API', () => {
  const dropdown = setup({ defaultOpen: true })
  expect(dropdown.open()).toBe(true)
  expect(dropdown.refs.open).toBe(dropdown.open)
  expect(dropdown.refs.setOpen).toBe(dropdown.setOpen)
  expect(dropdown.refs.toggle).toBe(dropdown.toggle)
  expect(dropdownSplits).toEqual(['open', 'defaultOpen', 'disabled', 'trigger', 'onOpenChange', 'placement'])
  dropdown.setOpen(false); flush()
  expect(dropdown.open()).toBe(false)
})

// 旧 API 的受控开关仅请求父组件更新，disabled 阻止内部变更但不覆盖父层状态。
it('[dropdown.legacy.controlled] retains controlled and disabled semantics', () => {
  const [open, setOpen] = createSignal(true, { ownedWrite: true })
  const [disabled, setDisabled] = createSignal(false, { ownedWrite: true })
  const changed = vi.fn()
  const dropdown = setup({ get open() { return open() }, get disabled() { return disabled() }, onOpenChange: changed })
  dropdown.setOpen(false); flush()
  expect(dropdown.open()).toBe(true)
  expect(changed).toHaveBeenCalledExactlyOnceWith(false)
  setOpen(false); setDisabled(true); flush()
  dropdown.toggle(); flush()
  expect(dropdown.open()).toBe(false)
  expect(changed).toHaveBeenCalledOnce()
})

// 旧 API 使用就地百分比布局而非 Portal 测量，六种位置的既有样式保持不变。
it.each<DropdownPlacement>(['bottomLeft', 'bottomRight', 'bottom', 'topLeft', 'topRight', 'top'])('[dropdown.legacy.position] preserves inline %s positioning', placement => {
  const dropdown = setup({ placement })
  dropdown.triggerRef(document.createElement('button')); flush()
  const style = dropdown.overlayStyle()
  expect(style.position).toBe('absolute')
  expect(style[placement.startsWith('bottom') ? 'top' : 'bottom']).toBe('100%')
  expect(style[placement.endsWith('Right') ? 'right' : 'left']).toBe('0')
})

// 旧右键模式保留阻止原生菜单的契约，overlay 内点击不关闭，外部 pointer 才关闭。
it('[dropdown.legacy.context-outside] preserves contextMenu and outside dismissal', () => {
  const changed = vi.fn()
  const dropdown = setup({ trigger: 'contextMenu', onOpenChange: changed })
  const button = document.createElement('button')
  const layer = document.createElement('div')
  document.body.append(button, layer)
  try {
    dropdown.triggerRef(button); dropdown.overlayRef(layer)
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
    button.dispatchEvent(event); flush()
    expect(event.defaultPrevented).toBe(true)
    expect(changed).toHaveBeenCalledExactlyOnceWith(true)
    layer.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); flush()
    expect(dropdown.open()).toBe(true)
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); flush()
    expect(changed).toHaveBeenLastCalledWith(false)
    expect(dropdown.open()).toBe(false)
  } finally { button.remove(); layer.remove() }
})

// 旧 API 进入浮层会取消延迟关闭；卸载必须清理仍未触发的 hover timer。
it('[dropdown.legacy.hover-cleanup] cancels pending hover callbacks on disposal', () => {
  vi.useFakeTimers()
  const changed = vi.fn()
  const dropdown = setup({ onOpenChange: changed })
  const button = document.createElement('button')
  const layer = document.createElement('div')
  dropdown.triggerRef(button); dropdown.overlayRef(layer)
  button.dispatchEvent(new MouseEvent('mouseenter')); flush()
  button.dispatchEvent(new MouseEvent('mouseleave'))
  layer.dispatchEvent(new MouseEvent('mouseenter'))
  vi.advanceTimersByTime(100); flush()
  expect(dropdown.open()).toBe(true)
  layer.dispatchEvent(new MouseEvent('mouseleave'))
  dispose(); dispose = () => {}; changed.mockClear()
  vi.advanceTimersByTime(100); flush()
  expect(changed).not.toHaveBeenCalled()
  expect(vi.getTimerCount()).toBe(0)
})

// 兼容 API 的点击监听只绑定存活实例，owner 销毁后旧触发器不能再发出请求。
it('[dropdown.legacy.click] detaches click and document listeners', () => {
  const changed = vi.fn()
  const dropdown = setup({ trigger: 'click', onOpenChange: changed })
  const button = document.createElement('button')
  dropdown.triggerRef(button)
  button.click(); flush()
  expect(dropdown.open()).toBe(true)
  dispose(); dispose = () => {}; changed.mockClear()
  button.click(); document.dispatchEvent(new PointerEvent('pointerdown')); flush()
  expect(changed).not.toHaveBeenCalled()
})
