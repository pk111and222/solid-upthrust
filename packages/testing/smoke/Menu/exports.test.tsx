import { expect, it } from 'vitest'
import Menu, { type MenuItemType, type MenuProps, type MenuRef } from '../../../components/lib/Menu'
import { SiderContext } from '../../../components/lib/Layout'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'

const exported: typeof Public.Menu = Menu
const exportedContext: typeof Public.SiderContext = SiderContext
const item: Public.MenuItemType = { key: 'a', label: 'A' } satisfies MenuItemType

// 公开出口：Menu、SiderContext 与菜单类型从包入口导出，公开类型可用于挂载，卸载后宿主移除。
it('[menu.exports] public types mount and clean up', () => {
  let ref: MenuRef | undefined
  const props: MenuProps = { items: [item], mode: 'horizontal', theme: 'dark', ref: r => { ref = r } }
  const view = mount(() => <Menu {...props} />)
  try {
    expect(exported).toBe(Menu)
    expect(exportedContext).toBe(SiderContext)
    expect(view.host.querySelector('[role="menu"]')?.className).toContain('bg-inverse-surface')
    expect(ref?.menu).toBe(view.host.querySelector('ul'))
  } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
