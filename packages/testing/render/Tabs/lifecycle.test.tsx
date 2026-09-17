import { flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { mount } from '../../utils/mount'
import Tabs, { type TabsIns } from '../../../components/lib/Tabs'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {} })

const items = [
  { key: 'a', label: 'A', children: 'Panel A' },
  { key: 'b', label: 'B', children: 'Panel B' },
]

// destroyInactiveTabPane=false（默认）：所有面板始终挂载在 DOM，用 display 切换；
// destroyInactiveTabPane=true：未激活面板整个不挂载，切走即销毁（状态丢失是预期行为）。
it('[tabs.lifecycle.destroy-inactive] destroyInactiveTabPane controls whether inactive panels stay mounted', () => {
  const kept = mount(() => <Tabs items={items} />)
  expect(kept.host.querySelectorAll('[role="tabpanel"]')).toHaveLength(2)
  kept.dispose()

  const destroyed = mount(() => <Tabs destroyInactiveTabPane items={items} />)
  cleanup = destroyed.dispose
  expect(destroyed.host.querySelectorAll('[role="tabpanel"]')).toHaveLength(1)
  destroyed.host.querySelectorAll<HTMLElement>('[role="tab"]')[1].click(); flush()
  expect(destroyed.host.querySelectorAll('[role="tabpanel"]')).toHaveLength(1)
  expect(destroyed.host.querySelector('[role="tabpanel"]')?.textContent).toBe('Panel B')
})

// ref 暴露 activeKey/setActiveKey/nextTab/prevTab，非受控模式下可用其命令式切换。
it('[tabs.lifecycle.ref] exposes an imperative activeKey/setActiveKey/nextTab/prevTab handle', () => {
  let ins: TabsIns | undefined
  const view = mount(() => <Tabs items={items} ref={(v) => { ins = v }} />)
  cleanup = view.dispose
  expect(ins).toBeDefined()
  expect(ins!.activeKey()).toBe('a')
  ins!.nextTab(); flush()
  expect(ins!.activeKey()).toBe('b')
  expect(view.host.querySelector('[aria-selected="true"]')?.textContent).toBe('B')
  ins!.prevTab(); flush()
  expect(ins!.activeKey()).toBe('a')
  ins!.setActiveKey('b'); flush()
  expect(ins!.activeKey()).toBe('b')
})

// 卸载后不残留计时器/监听：resize 监听在组件销毁时必须解绑（回归 window.resize 泄漏）。
it('[tabs.lifecycle.unmount-cleanup] removes the window resize listener on unmount', () => {
  const addSpy = vi.spyOn(window, 'addEventListener')
  const removeSpy = vi.spyOn(window, 'removeEventListener')
  const view = mount(() => <Tabs items={items} />)
  const resizeAdds = addSpy.mock.calls.filter(call => call[0] === 'resize').length
  view.dispose()
  const resizeRemoves = removeSpy.mock.calls.filter(call => call[0] === 'resize').length
  expect(resizeRemoves).toBe(resizeAdds)
  addSpy.mockRestore(); removeSpy.mockRestore()
})
