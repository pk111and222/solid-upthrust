import { flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { mount } from '../../utils/mount'
import Popover from '../../../components/lib/Popover'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {}; vi.useRealTimers() })

function overlay() { return document.querySelector<HTMLElement>('[role="dialog"]') }

// Popover 未声明 mouseEnterDelay/mouseLeaveDelay，走 createTrigger 的裸默认值：
// 打开延迟 0ms（悬停立即展示），与 Tooltip 的 antd 对齐 100ms 打开延迟不同。
it('[popover.trigger.hover-instant-open] opens immediately on hover, unlike Tooltip default delay', () => {
  const view = mount(() => (
    <Popover content="提示">
      <button type="button">触发器</button>
    </Popover>
  ))
  cleanup = view.dispose
  const btn = view.host.querySelector('button')!
  btn.dispatchEvent(new Event('mouseenter', { bubbles: true }))
  flush()
  expect(overlay()).not.toBeNull()
})

// 关闭仍保留裸默认的 100ms 防抖。
it('[popover.trigger.hover-close-delay] closes after the default 100ms leave debounce', () => {
  vi.useFakeTimers()
  const view = mount(() => (
    <Popover content="提示">
      <button type="button">触发器</button>
    </Popover>
  ))
  cleanup = view.dispose
  const btn = view.host.querySelector('button')!
  btn.dispatchEvent(new Event('mouseenter', { bubbles: true })); flush()
  expect(overlay()).not.toBeNull()
  btn.dispatchEvent(new Event('mouseleave', { bubbles: true }))
  vi.advanceTimersByTime(99); flush()
  expect(document.querySelector('[role="dialog"]')?.className).not.toContain('opacity-0')
  vi.advanceTimersByTime(1); flush()
  expect(document.querySelector('[role="dialog"]')?.className).toContain('opacity-0')
})

// click 触发同步切换。
it('[popover.trigger.click] toggles synchronously on click', () => {
  const view = mount(() => (
    <Popover content="提示" trigger="click">
      <button type="button">触发器</button>
    </Popover>
  ))
  cleanup = view.dispose
  const btn = view.host.querySelector('button')!
  btn.click(); flush()
  expect(overlay()).not.toBeNull()
  btn.click(); flush()
  expect(overlay()?.className).toContain('opacity-0')
})

// focus 触发用于键盘可达性。
it('[popover.trigger.focus] opens on focusin and closes on focusout', () => {
  const view = mount(() => (
    <Popover content="提示" trigger="focus">
      <button type="button">触发器</button>
    </Popover>
  ))
  cleanup = view.dispose
  const btn = view.host.querySelector('button')!
  btn.dispatchEvent(new Event('focusin', { bubbles: true })); flush()
  expect(overlay()).not.toBeNull()
  btn.dispatchEvent(new Event('focusout', { bubbles: true })); flush()
  expect(overlay()?.className).toContain('opacity-0')
})

// 鼠标移到浮层本体上应取消关闭倒计时（bindLayerHover 接线）。
it('[popover.trigger.layer-hover] stays open while the pointer is over the floating layer', () => {
  vi.useFakeTimers()
  const view = mount(() => (
    <Popover content="提示">
      <button type="button">触发器</button>
    </Popover>
  ))
  cleanup = view.dispose
  const btn = view.host.querySelector('button')!
  btn.dispatchEvent(new Event('mouseenter', { bubbles: true })); flush()
  const layer = overlay()!
  btn.dispatchEvent(new Event('mouseleave', { bubbles: true }))
  layer.dispatchEvent(new Event('mouseenter', { bubbles: true }))
  vi.advanceTimersByTime(100); flush()
  expect(document.querySelector('[role="dialog"]')?.className).not.toContain('opacity-0')

  layer.dispatchEvent(new Event('mouseleave', { bubbles: true }))
  vi.advanceTimersByTime(100); flush()
  expect(document.querySelector('[role="dialog"]')?.className).toContain('opacity-0')
})

// 显式 disabled 阻止打开，即便内容非空。
it('[popover.trigger.disabled] blocks opening regardless of trigger action', () => {
  const view = mount(() => (
    <Popover content="提示" trigger="click" disabled>
      <button type="button">触发器</button>
    </Popover>
  ))
  cleanup = view.dispose
  view.host.querySelector('button')!.click(); flush()
  expect(overlay()).toBeNull()
})
