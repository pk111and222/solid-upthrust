import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it } from 'vitest'
import { mount } from '../../utils/mount'
import ConfigProvider from '../../../components/lib/ConfigProvider'
import Popover from '../../../components/lib/Popover'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {} })

// 最小触发器与内容可以真实挂载并在受控更新下切换可见性。
it('[popover.mount.basic] mounts through ConfigProvider and updates controlled open', () => {
  const [open, setOpen] = createSignal(false, { ownedWrite: true })
  const view = mount(() => (
    <ConfigProvider>
      <Popover content="卡片内容" open={open()} onOpenChange={setOpen}>
        <button type="button">触发器</button>
      </Popover>
    </ConfigProvider>
  ))
  cleanup = view.dispose
  expect(view.host.querySelector('button')?.textContent).toBe('触发器')
  expect(document.querySelector('[role="dialog"]')).toBeNull()
  setOpen(true); flush()
  const overlay = document.querySelector('[role="dialog"]')
  expect(overlay?.textContent).toBe('卡片内容')
  expect(view.host.querySelector('[data-upthrust-config]')?.contains(overlay)).toBe(true)
})

// ConfigProvider.components.Popover 只能提供 trigger/placement 默认值，显式 props 仍优先。
it('[popover.mount.provider-defaults] applies ConfigProvider component defaults but explicit props win', () => {
  const view = mount(() => (
    <ConfigProvider components={{ Popover: { trigger: 'click', placement: 'bottom' } }}>
      <Popover content="默认由全局配置">
        <button type="button">继承默认</button>
      </Popover>
      <Popover content="显式覆盖" trigger="focus">
        <button type="button">显式触发方式</button>
      </Popover>
    </ConfigProvider>
  ))
  cleanup = view.dispose
  const [inherited, explicit] = view.host.querySelectorAll('button')

  inherited.dispatchEvent(new Event('mouseenter', { bubbles: true })); flush()
  expect(document.querySelector('[role="dialog"]')).toBeNull()
  inherited.click(); flush()
  expect(document.querySelector('[role="dialog"]')?.textContent).toBe('默认由全局配置')

  explicit.click(); flush()
  expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1)
  explicit.dispatchEvent(new Event('focusin', { bubbles: true })); flush()
  expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(2)
})
