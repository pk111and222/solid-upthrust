import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Menu, { type MenuItemType } from '../../../components/lib/Menu'
import Layout from '../../../components/lib/Layout'
import { mount } from '../../utils/mount'

let dispose = () => {}
afterEach(() => dispose())

const items: MenuItemType[] = [
  { key: 'a', label: '选项 A', icon: 'i-mdi-home' },
  { key: 'sub1', label: '子菜单', icon: 'i-mdi-cog', children: [
    { type: 'group', label: '分组', children: [{ key: 'b', label: '选项 B' }] },
    { key: 'sub2', label: '三级', children: [{ key: 'c', label: '选项 C' }] },
  ] },
  { type: 'divider' },
  { key: 'plain', label: '纯文字' },
  { key: 'x', label: '禁用', disabled: true },
]

const byKey = (host: HTMLElement, key: string) => host.querySelector<HTMLElement>(`[data-menu-key="${key}"]`)!

// 结构与 aria：根 ul role=menu 可聚焦，子菜单标题带 expanded/haspopup/controls，禁用项无 tabindex，分组与分割线的 role 正确。
it('[menu.render.aria] roles and aria attributes', () => {
  const view = mount(() => <Menu mode="inline" items={items} defaultSelectedKeys={['a']} />); dispose = view.dispose
  const root = view.host.querySelector('ul')!
  expect(root.getAttribute('role')).toBe('menu')
  expect(root.getAttribute('tabindex')).toBe('0')
  const title = byKey(view.host, 'sub1')
  expect(title.getAttribute('aria-expanded')).toBe('false')
  expect(title.getAttribute('aria-haspopup')).toBe('true')
  expect(document.getElementById(title.getAttribute('aria-controls')!)?.getAttribute('role')).toBe('menu')
  expect(title.parentElement!.getAttribute('role')).toBe('none')
  expect(byKey(view.host, 'a').getAttribute('aria-selected')).toBe('true')
  expect(byKey(view.host, 'x').hasAttribute('tabindex')).toBe(false)
  expect(byKey(view.host, 'x').getAttribute('aria-disabled')).toBe('true')
  expect(view.host.querySelector('[role="group"]')).not.toBeNull()
  expect(view.host.querySelector('[role="separator"]')).not.toBeNull()
})

// inline 缩进 = 层级 × inlineIndent（分组不计层级）；关闭的子列表 inert。
it('[menu.render.indent] inline padding follows the key path', () => {
  const view = mount(() => <Menu mode="inline" inlineIndent={20} items={items} defaultOpenKeys={['sub1', 'sub2']} />); dispose = view.dispose
  expect(byKey(view.host, 'a').style.paddingLeft).toBe('20px')
  expect(byKey(view.host, 'b').style.paddingLeft).toBe('40px')
  expect(byKey(view.host, 'c').style.paddingLeft).toBe('60px')
  const list = document.getElementById(byKey(view.host, 'sub2').getAttribute('aria-controls')!)!
  expect(list.hasAttribute('inert')).toBe(false)
})

// inline 点击标题切换展开并回调 onOpenChange / onTitleClick；点击菜单项 onClick 先于 onSelect。
it('[menu.render.click] title toggle and item click order', () => {
  const calls: string[] = []
  const onTitleClick = vi.fn()
  const onOpenChange = vi.fn()
  const withTitle = items.map(item => item.key === 'sub1' ? { ...item, onTitleClick } : item)
  const view = mount(() => <Menu mode="inline" items={withTitle} onOpenChange={onOpenChange}
    onClick={info => calls.push(`click:${info.keyPath.join('/')}`)} onSelect={info => calls.push(`select:${info.selectedKeys}`)} />); dispose = view.dispose
  byKey(view.host, 'sub1').click(); flush()
  expect(onTitleClick).toHaveBeenCalledWith(expect.objectContaining({ key: 'sub1' }))
  expect(onOpenChange).toHaveBeenLastCalledWith(['sub1'])
  expect(byKey(view.host, 'sub1').getAttribute('aria-expanded')).toBe('true')
  byKey(view.host, 'b').click(); flush()
  expect(calls).toEqual(['click:b/sub1', 'select:b'])
  byKey(view.host, 'x').click(); flush()
  expect(calls).toHaveLength(2)
})

// SiderContext：未传 inlineCollapsed 时跟随 Sider 收起；显式 false 优先于 Sider。收起后无图标一级项只显示首字符。
it('[menu.render.sider] follows sider collapse', () => {
  const [collapsed, setCollapsed] = createSignal(false, { ownedWrite: true })
  const view = mount(() => <Layout.Sider collapsed={collapsed()}>
    <Menu data-case="auto" mode="inline" theme="dark" items={items} />
    <Menu data-case="explicit" mode="inline" inlineCollapsed={false} items={items} />
  </Layout.Sider>); dispose = view.dispose
  const auto = view.host.querySelector<HTMLElement>('[data-case="auto"]')!
  const explicit = view.host.querySelector<HTMLElement>('[data-case="explicit"]')!
  expect(auto.className).toContain('bg-inverse-surface')
  expect(auto.className).not.toContain('w-[80px]')
  setCollapsed(true); flush()
  expect(auto.className).toContain('w-[80px]')
  expect(explicit.className).not.toContain('w-[80px]')
  expect(byKey(auto, 'plain').textContent).toBe('纯')
  // 收起后 inline 切成 vertical：缩进消失。
  expect(byKey(auto, 'a').style.paddingLeft).toBe('')
})

// 语义化 classNames / styles：函数形式拿到合并后的 props；一级与子菜单内节点分别取 item / subMenu.item。
it('[menu.render.semantic] classNames and styles', () => {
  const view = mount(() => <Menu mode="inline" items={items} defaultOpenKeys={['sub1']}
    classNames={{ root: 'my-root', item: 'my-item', subMenu: { item: 'my-sub-item', list: 'my-sub-list' }, itemTitle: 'my-title' }}
    styles={info => ({ root: { 'margin-top': info.props.mode === 'inline' ? '3px' : '0px' }, subMenu: { item: { color: 'red' } } })} />); dispose = view.dispose
  const root = view.host.querySelector<HTMLElement>('ul')!
  expect(root.className).toContain('my-root')
  expect(root.style.marginTop).toBe('3px')
  expect(byKey(view.host, 'a').className).toContain('my-item')
  expect(byKey(view.host, 'b').className).toContain('my-sub-item')
  expect(byKey(view.host, 'b').style.color).toBe('red')
  expect(document.getElementById(byKey(view.host, 'sub1').getAttribute('aria-controls')!)!.className).toContain('my-sub-list')
})

// 键盘：inline 方向键在整棵可见树移动，Enter 切换子菜单，Enter 在菜单项上等同点击。
it('[menu.render.keyboard] inline arrow navigation and Enter', () => {
  const onClick = vi.fn()
  const view = mount(() => <Menu mode="inline" items={items} onClick={onClick} />); dispose = view.dispose
  const root = view.host.querySelector<HTMLElement>('ul')!
  const press = (key: string) => { document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })); flush() }
  root.focus()
  press('ArrowDown')
  expect(document.activeElement).toBe(byKey(view.host, 'a'))
  press('ArrowDown')
  expect(document.activeElement).toBe(byKey(view.host, 'sub1'))
  press('Enter')
  expect(byKey(view.host, 'sub1').getAttribute('aria-expanded')).toBe('true')
  press('ArrowDown')
  expect(document.activeElement).toBe(byKey(view.host, 'b'))
  press('Enter')
  expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ key: 'b' }))
  press('End')
  expect(document.activeElement).toBe(byKey(view.host, 'plain'))
})

// ref 暴露根节点与 focus()：聚焦第一个可聚焦项。
it('[menu.render.ref] exposes menu and focus', () => {
  let ref: { menu: HTMLUListElement; focus: () => void } | undefined
  const view = mount(() => <Menu items={items} ref={r => { ref = r }} />); dispose = view.dispose
  expect(ref?.menu.tagName).toBe('UL')
  ref!.focus()
  expect(document.activeElement).toBe(byKey(view.host, 'a'))
})
