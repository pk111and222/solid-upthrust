import { flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { mount } from '../../utils/mount'
import Tooltip from '../../../components/lib/Tooltip'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {}; vi.useRealTimers() })

function overlay() { return document.querySelector<HTMLElement>('[role="tooltip"]') }

// 默认 hover 触发有 antd 对齐的 100ms 开启延迟：快速划过不应闪现浮层。
it('[tooltip.trigger.hover-default-delay] opens only after the default 100ms mouseEnterDelay', () => {
  vi.useFakeTimers()
  const view = mount(() => (
    <Tooltip title="提示">
      <button type="button">触发器</button>
    </Tooltip>
  ))
  cleanup = view.dispose
  const btn = view.host.querySelector('button')!
  btn.dispatchEvent(new Event('mouseenter', { bubbles: true }))
  flush()
  expect(overlay()).toBeNull()
  vi.advanceTimersByTime(99)
  flush()
  expect(overlay()).toBeNull()
  vi.advanceTimersByTime(1)
  flush()
  expect(overlay()).not.toBeNull()

  // 离开后同样有 100ms 默认关闭延迟。
  btn.dispatchEvent(new Event('mouseleave', { bubbles: true }))
  vi.advanceTimersByTime(99)
  flush()
  expect(document.querySelector('[role="tooltip"]')?.className).not.toContain('opacity-0')
  vi.advanceTimersByTime(1)
  flush()
  expect(document.querySelector('[role="tooltip"]')?.className).toContain('opacity-0')
})

// click 触发同步切换，不受 mouseEnterDelay/mouseLeaveDelay 影响。
it('[tooltip.trigger.click] toggles synchronously on click', () => {
  const view = mount(() => (
    <Tooltip title="提示" trigger="click">
      <button type="button">触发器</button>
    </Tooltip>
  ))
  cleanup = view.dispose
  const btn = view.host.querySelector('button')!
  btn.click(); flush()
  expect(overlay()).not.toBeNull()
  btn.click(); flush()
  expect(overlay()?.className).toContain('opacity-0')
})

// focus 触发用于键盘可达性：focusin 打开，focusout 关闭。
it('[tooltip.trigger.focus] opens on focusin and closes on focusout', () => {
  const view = mount(() => (
    <Tooltip title="提示" trigger="focus">
      <button type="button">触发器</button>
    </Tooltip>
  ))
  cleanup = view.dispose
  const btn = view.host.querySelector('button')!
  btn.dispatchEvent(new Event('focusin', { bubbles: true })); flush()
  expect(overlay()).not.toBeNull()
  btn.dispatchEvent(new Event('focusout', { bubbles: true })); flush()
  expect(overlay()?.className).toContain('opacity-0')
})

// mouseEnterDelay/mouseLeaveDelay 自定义值必须覆盖默认 100ms。
it('[tooltip.trigger.custom-delay] honors custom mouseEnterDelay and mouseLeaveDelay', () => {
  vi.useFakeTimers()
  const view = mount(() => (
    <Tooltip title="提示" mouseEnterDelay={500} mouseLeaveDelay={800}>
      <button type="button">触发器</button>
    </Tooltip>
  ))
  cleanup = view.dispose
  const btn = view.host.querySelector('button')!
  btn.dispatchEvent(new Event('mouseenter', { bubbles: true })); flush()
  vi.advanceTimersByTime(499); flush()
  expect(overlay()).toBeNull()
  vi.advanceTimersByTime(1); flush()
  expect(overlay()).not.toBeNull()

  btn.dispatchEvent(new Event('mouseleave', { bubbles: true }))
  vi.advanceTimersByTime(799); flush()
  expect(document.querySelector('[role="tooltip"]')?.className).not.toContain('opacity-0')
  vi.advanceTimersByTime(1); flush()
  expect(document.querySelector('[role="tooltip"]')?.className).toContain('opacity-0')
})

// 鼠标移到浮层本体上应取消关闭倒计时，这是 Tooltip 自身接线（bindLayerHover）而非共享逻辑本身。
it('[tooltip.trigger.layer-hover] stays open while the pointer is over the floating layer', () => {
  vi.useFakeTimers()
  const view = mount(() => (
    <Tooltip title="提示">
      <button type="button">触发器</button>
    </Tooltip>
  ))
  cleanup = view.dispose
  const btn = view.host.querySelector('button')!
  btn.dispatchEvent(new Event('mouseenter', { bubbles: true }))
  vi.advanceTimersByTime(100); flush()
  const layer = overlay()!
  btn.dispatchEvent(new Event('mouseleave', { bubbles: true }))
  layer.dispatchEvent(new Event('mouseenter', { bubbles: true }))
  vi.advanceTimersByTime(100); flush()
  expect(document.querySelector('[role="tooltip"]')?.className).not.toContain('opacity-0')

  layer.dispatchEvent(new Event('mouseleave', { bubbles: true }))
  vi.advanceTimersByTime(100); flush()
  expect(document.querySelector('[role="tooltip"]')?.className).toContain('opacity-0')
})

// 显式 disabled 阻止 hover/click 打开，即便标题非空。
it('[tooltip.trigger.disabled] blocks opening regardless of trigger action', () => {
  const view = mount(() => (
    <Tooltip title="提示" trigger="click" disabled>
      <button type="button">触发器</button>
    </Tooltip>
  ))
  cleanup = view.dispose
  view.host.querySelector('button')!.click(); flush()
  expect(overlay()).toBeNull()
})
