import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { mount } from '../../utils/mount'
import ConfigProvider from '../../../components/lib/ConfigProvider'
import Tooltip from '../../../components/lib/Tooltip'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {}; vi.useRealTimers() })

// 最小触发器与标题可以真实挂载并在受控更新下切换可见性。
it('[tooltip.mount.basic] mounts through ConfigProvider and updates controlled open', () => {
  const [open, setOpen] = createSignal(false, { ownedWrite: true })
  const view = mount(() => (
    <ConfigProvider>
      <Tooltip title="提示内容" open={open()} onOpenChange={setOpen}>
        <button type="button">触发器</button>
      </Tooltip>
    </ConfigProvider>
  ))
  cleanup = view.dispose
  expect(view.host.querySelector('button')?.textContent).toBe('触发器')
  expect(document.querySelector('[role="tooltip"]')).toBeNull()
  setOpen(true); flush()
  const overlay = document.querySelector('[role="tooltip"]')
  expect(overlay?.textContent).toBe('提示内容')
  expect(view.host.querySelector('[data-upthrust-config]')?.contains(overlay)).toBe(true)
})

// ConfigProvider.components.Tooltip 只能提供 trigger/placement 默认值（DefaultKeys 范围），显式 props 仍优先。
it('[tooltip.mount.provider-defaults] applies ConfigProvider component defaults but explicit props win', () => {
  const view = mount(() => (
    <ConfigProvider components={{ Tooltip: { trigger: 'click', placement: 'bottom' } }}>
      <Tooltip title="默认由全局配置">
        <button type="button">继承默认</button>
      </Tooltip>
      <Tooltip title="显式覆盖" trigger="focus">
        <button type="button">显式触发方式</button>
      </Tooltip>
    </ConfigProvider>
  ))
  cleanup = view.dispose
  const [inherited, explicit] = view.host.querySelectorAll('button')

  // hover 不再生效，需要 click 才能打开（继承自 Provider 默认）。
  inherited.dispatchEvent(new Event('mouseenter', { bubbles: true })); flush()
  expect(document.querySelector('[role="tooltip"]')).toBeNull()
  inherited.click(); flush()
  expect(document.querySelector('[role="tooltip"]')?.textContent).toBe('默认由全局配置')

  // 显式 trigger="focus" 不受 Provider 默认值覆盖。
  explicit.click(); flush()
  expect(document.querySelectorAll('[role="tooltip"]')).toHaveLength(1)
  explicit.dispatchEvent(new Event('focusin', { bubbles: true })); flush()
  expect(document.querySelectorAll('[role="tooltip"]')).toHaveLength(2)
})

// title 在打开期间响应式地变为空值：disabled 冻结开关状态（继承自共享 Trigger 语义），
// 但内容渲染门槛额外看 hasTitle，浮层必须回到不可见状态，不留下只有 padding 的空气泡；
// title 恢复后重新可见，不需要用户再次触发。
it('[tooltip.mount.title-becomes-empty] hides the layer when a reactive title empties while open, restores when refilled', () => {
  const [title, setTitle] = createSignal<string | undefined>('提示')
  const view = mount(() => (
    <Tooltip title={title()}>
      <button type="button">触发器</button>
    </Tooltip>
  ))
  cleanup = view.dispose
  vi.useFakeTimers()
  const btn = view.host.querySelector('button')!
  btn.dispatchEvent(new Event('mouseenter', { bubbles: true }))
  vi.advanceTimersByTime(100); flush()
  expect(document.querySelector('[role="tooltip"]')?.className).not.toContain('opacity-0')

  setTitle(undefined); flush()
  const emptied = document.querySelector('[role="tooltip"]')
  expect(emptied).not.toBeNull() // 仍挂载（disabled 冻结开关状态），但必须不可见。
  expect(emptied?.className).toContain('opacity-0')
  expect(emptied?.textContent).toBe('')

  setTitle('提示恢复'); flush()
  const restored = document.querySelector('[role="tooltip"]')
  expect(restored?.className).not.toContain('opacity-0')
  expect(restored?.textContent).toBe('提示恢复')
})
