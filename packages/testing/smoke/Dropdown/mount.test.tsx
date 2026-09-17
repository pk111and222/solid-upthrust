import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it } from 'vitest'
import Button from '../../../components/lib/Button'
import ConfigProvider from '../../../components/lib/ConfigProvider'
import Dropdown from '../../../components/lib/Dropdown'
import { mount } from '../../utils/mount'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {} })

// 最小触发器、菜单和局部 Provider 可以真实挂载，Portal 菜单在打开后出现在文档中。
it('[dropdown.mount.provider] mounts through ConfigProvider and updates controlled open', () => {
  const [open, setOpen] = createSignal(false, { ownedWrite: true })
  const view = mount(() => (
    <ConfigProvider>
      <Dropdown
        open={open()}
        onOpenChange={setOpen}
        trigger="click"
        menu={{ items: [{ key: 'one', label: '第一项' }] }}
      >
        <Button>打开菜单</Button>
      </Dropdown>
    </ConfigProvider>
  ))
  cleanup = view.dispose

  const button = view.host.querySelector('button')!
  expect(button.textContent).toContain('打开菜单')
  expect(document.querySelector('[role="menu"]')).toBeNull()
  button.click(); flush()
  expect(open()).toBe(true)
  expect(document.querySelector('[role="menu"]')?.textContent).toContain('第一项')
  expect(view.host.querySelector('[data-upthrust-config]')?.contains(document.querySelector('[role="menu"]'))).toBe(true)

  setOpen(false); flush()
  expect(document.querySelector('[role="menu"]')?.className).toContain('opacity-0')
})

// wrapper=false 借用外层主题容器，且 Dropdown 不继承全局 componentDisabled 默认值。
it('[dropdown.mount.fragment] uses the nearest theme scope without inheriting control defaults', () => {
  const view = mount(() => <ConfigProvider class="dropdown-theme-scope" componentDisabled>
    <ConfigProvider wrapper={false}>
      <Dropdown trigger="click" menu={{ items: [{ key: 'a', label: 'A' }] }}><button type="button">原生触发器</button></Dropdown>
    </ConfigProvider>
  </ConfigProvider>)
  cleanup = view.dispose
  const scope = view.host.querySelector('.dropdown-theme-scope')!
  expect(view.host.querySelectorAll('[data-upthrust-config]')).toHaveLength(1)
  view.host.querySelector('button')!.click(); flush()
  expect(scope.querySelector('[role="menu"]')?.textContent).toBe('A')
})

// 菜单项变化应通过响应式 props 反映到已挂载组件，而不是固定初始快照。
it('[dropdown.mount.dynamic] follows menu item updates and releases portal on unmount', () => {
  const [items, setItems] = createSignal([{ key: 'old', label: '旧菜单' }], { ownedWrite: true })
  const view = mount(() => (
    <Dropdown trigger="click" menu={{ items: items() }}>
      <Button>动态菜单</Button>
    </Dropdown>
  ))
  cleanup = view.dispose

  view.host.querySelector('button')!.click(); flush()
  expect(document.querySelector('[role="menu"]')?.textContent).toContain('旧菜单')
  setItems([{ key: 'new', label: '新菜单' }]); flush()
  expect(document.querySelector('[role="menu"]')?.textContent).toContain('新菜单')

  view.dispose(); cleanup = () => {}
  expect(document.querySelector('[role="menu"]')).toBeNull()
})
