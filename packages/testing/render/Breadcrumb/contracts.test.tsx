import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Breadcrumb, { type BreadcrumbItemRender, type BreadcrumbItemType } from '../../../components/lib/Breadcrumb'
import { mount } from '../../utils/mount'

let dispose = () => {}
afterEach(() => dispose())

const render = (view: () => ReturnType<typeof Breadcrumb>) => {
  const mounted = mount(view); dispose = mounted.dispose
  return mounted.host
}
const lis = (host: HTMLElement) => [...host.querySelectorAll<HTMLLIElement>('nav > ol > li')]
const separators = (host: HTMLElement) => [...host.querySelectorAll<HTMLLIElement>('li[aria-hidden="true"]')]
const texts = (host: HTMLElement) => lis(host).map(li => li.textContent)

// 结构：nav[aria-label] > ol > li；分隔符为独立 li[aria-hidden]，最后一项后没有分隔符；最后一项 li 带 last:text-on-surface。
it('[breadcrumb.render.structure] nav > ol > li with separator li between items', () => {
  const host = render(() => <Breadcrumb items={[{ title: '首页' }, { title: '列表', href: '#l' }, { title: '当前' }]} />)
  const nav = host.querySelector('nav')!
  expect(nav.getAttribute('aria-label')).toBe('breadcrumb')
  expect(nav.firstElementChild!.tagName).toBe('OL')
  expect(texts(host)).toEqual(['首页', '/', '列表', '/', '当前'])
  expect(separators(host)).toHaveLength(2)
  expect(lis(host).at(-1)!.hasAttribute('aria-hidden')).toBe(false)
  expect(lis(host).at(-1)!.className).toContain('last:text-on-surface')
  expect(nav.className).toContain('text-on-surface/45')
})

// 链接：有 href 渲染 a（最后一项也是）；无 href 渲染 span 且保留 onClick（修复前被丢弃）；不再出现 javascript:;。
it('[breadcrumb.render.link] href renders a, otherwise span keeps onClick', () => {
  const onSpan = vi.fn()
  const onLink = vi.fn((e: MouseEvent) => e.preventDefault())
  const host = render(() => <Breadcrumb items={[{ title: '文字', onClick: onSpan }, { title: '链接', href: '#a', onClick: onLink }, { title: '末项', href: '#last' }]} />)
  const [first, , second, , last] = lis(host)
  const span = first!.querySelector('span')!
  expect(first!.querySelector('a')).toBeNull()
  span.click()
  expect(onSpan).toHaveBeenCalledOnce()
  second!.querySelector('a')!.click()
  expect(onLink).toHaveBeenCalledOnce()
  expect(last!.querySelector('a')?.getAttribute('href')).toBe('#last')
  expect(host.innerHTML).not.toContain('javascript:')
})

// 项级 class / style 作用于 a / span；分隔符文本来自 separator，默认 '/'，可为 JSX。
it('[breadcrumb.render.itemClass] item class and custom separator', () => {
  const host = render(() => <Breadcrumb separator={<b>›</b>} items={[{ title: 'A', class: 'custom-a', style: { color: 'red' } }, { title: 'B', href: '#b', class: 'custom-b' }]} />)
  expect(host.querySelector('span.custom-a')?.getAttribute('style')).toContain('red')
  expect(host.querySelector('a.custom-b')).not.toBeNull()
  expect(separators(host)[0]!.querySelector('b')?.textContent).toBe('›')
})

// params + path：path 依次累积为 #/users/1/detail，开头的 / 被去掉；字符串 title 的已知 :name 被替换，未知参数保留。
it('[breadcrumb.render.params] path accumulation and param replacement', () => {
  const host = render(() => <Breadcrumb params={{ id: '1' }} items={[{ title: '用户', path: '/users' }, { title: ':id', path: ':id' }, { title: ':id 的 :unknown', path: 'detail' }]} />)
  expect([...host.querySelectorAll('a')].map(a => a.getAttribute('href'))).toEqual(['#/users', '#/users/1', '#/users/1/detail'])
  expect([...host.querySelectorAll('a')].map(a => a.textContent)).toEqual(['用户', '1', '1 的 :unknown'])
})

// path 覆盖 href；没有 path 的项保留自己的 href。
it('[breadcrumb.render.pathOverride] path wins over href', () => {
  const host = render(() => <Breadcrumb items={[{ title: 'A', path: 'a', href: '#ignored' }, { title: 'B', href: '#b' }]} />)
  expect([...host.querySelectorAll('a')].map(a => a.getAttribute('href'))).toEqual(['#/a', '#b'])
})

// type: 'separator'：单独渲染一个分隔符 li（默认 '/'）；separator="" 时不自动插入分隔符。
it('[breadcrumb.render.separatorType] explicit separator items', () => {
  const host = render(() => <Breadcrumb separator="" items={[{ title: '位置' }, { type: 'separator', separator: ':' }, { title: 'A', href: '#a' }, { type: 'separator' }, { title: 'B' }]} />)
  expect(texts(host)).toEqual(['位置', ':', 'A', '/', 'B'])
  expect(separators(host)).toHaveLength(2)
})

// title 为空的项及其后的分隔符不渲染。
it('[breadcrumb.render.emptyTitle] null title is skipped', () => {
  const host = render(() => <Breadcrumb items={[{ title: 'A' }, { title: null }, { title: 'B' }]} />)
  expect(texts(host)).toEqual(['A', '/', 'B'])
})

// itemRender 收到 (route, params, routes, paths)，paths 为该项及之前的累积路径；返回值替换默认 a / span。
it('[breadcrumb.render.itemRender] custom renderer receives accumulated paths', () => {
  const calls: string[][] = []
  const items: BreadcrumbItemType[] = [{ title: '首页', path: 'home' }, { title: '列表', path: 'list' }]
  const itemRender: BreadcrumbItemRender = (route, params, routes, paths) => {
    calls.push(paths)
    expect(routes).toBe(items)
    expect(params).toEqual({ x: '1' })
    return <i data-render>{route.title as string}</i>
  }
  const host = render(() => <Breadcrumb params={{ x: '1' }} items={items} itemRender={itemRender} />)
  expect(calls).toEqual([['home'], ['home', 'list']])
  expect([...host.querySelectorAll('[data-render]')].map(el => el.textContent)).toEqual(['首页', '列表'])
  expect(host.querySelector('a')).toBeNull()
})

// 语义化对象：root / item / separator 的类与样式分别落在 nav、项 li、分隔符 li；class / style 作用于根。
it('[breadcrumb.render.semanticObject] classNames and styles objects', () => {
  const host = render(() => <Breadcrumb class="root-extra" style={{ margin: '3px' }} classNames={{ root: 'sem-root', item: 'sem-item', separator: 'sem-sep' }} styles={{ item: { color: 'blue' }, separator: { color: 'green' } }} items={[{ title: 'A' }, { title: 'B' }]} />)
  const nav = host.querySelector('nav')!
  expect(nav.className).toContain('sem-root')
  expect(nav.className).toContain('root-extra')
  expect(nav.getAttribute('style')).toContain('3px')
  const [a, sep, b] = lis(host)
  expect(a!.className).toContain('sem-item')
  expect(b!.getAttribute('style')).toContain('blue')
  expect(sep!.className).toContain('sem-sep')
  expect(sep!.getAttribute('style')).toContain('green')
})

// 语义化函数：info.props 为合并默认值后的属性（separator 默认 '/'），props 变化时重新求值。
it('[breadcrumb.render.semanticFunction] function form reads merged props', () => {
  const [sep, setSep] = createSignal<string | undefined>(undefined)
  const host = render(() => <Breadcrumb separator={sep()} classNames={info => ({ separator: info.props.separator === '/' ? 'is-default' : 'is-custom' })} items={[{ title: 'A' }, { title: 'B' }]} />)
  expect(separators(host)[0]!.className).toContain('is-default')
  setSep('>'); flush()
  expect(separators(host)[0]!.className).toContain('is-custom')
  expect(separators(host)[0]!.textContent).toBe('>')
})

// menu 映射：菜单项 title 为 label 别名，path 渲染为 <a href={item.href + path}>；缺省 key 用索引；触发区带下拉箭头。
it('[breadcrumb.render.menu] menu items map title / path', () => {
  const onClick = vi.fn()
  const host = render(() => <Breadcrumb items={[{ title: '组件', href: '#/c', menu: { items: [{ title: '布局', path: '/layout' }, { key: 'nav', label: '导航' }], onClick } }, { title: '当前' }]} />)
  const trigger = host.querySelector('[aria-haspopup="menu"]')!
  expect(trigger.querySelector('.i-mdi-chevron-down')).not.toBeNull()
  trigger.dispatchEvent(new MouseEvent('mouseenter')); flush()
  const items = [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')]
  expect(items.map(el => el.textContent)).toEqual(['布局', '导航'])
  expect(items[0]!.querySelector('a')?.getAttribute('href')).toBe('#/c/layout')
  items[0]!.click(); flush()
  expect(onClick).toHaveBeenCalledExactlyOnceWith('0')
})

// dropdownProps 透传：trigger: 'click' 时悬浮不打开，点击打开并回调 onOpenChange。
it('[breadcrumb.render.dropdownProps] click trigger via dropdownProps', () => {
  const onOpenChange = vi.fn()
  const host = render(() => <Breadcrumb items={[{ title: 'A', menu: { items: [{ key: 'x', label: 'X' }] }, dropdownProps: { trigger: 'click', onOpenChange } }]} />)
  const trigger = host.querySelector<HTMLElement>('[aria-haspopup="menu"]')!
  trigger.dispatchEvent(new MouseEvent('mouseenter')); flush()
  expect(trigger.getAttribute('aria-expanded')).toBe('false')
  trigger.click(); flush()
  expect(trigger.getAttribute('aria-expanded')).toBe('true')
  expect(onOpenChange).toHaveBeenCalledWith(true)
})

// 旧 children 写法：Breadcrumb.Item 输出 li，每项后自动分隔符（最后一个由 CSS 隐藏），无 href 的项 onClick 生效。
it('[breadcrumb.render.children] legacy Breadcrumb.Item usage', () => {
  const onClick = vi.fn()
  const host = render(() => (
    <Breadcrumb separator=">">
      <Breadcrumb.Item href="#home">首页</Breadcrumb.Item>
      <Breadcrumb.Item onClick={onClick}>当前</Breadcrumb.Item>
    </Breadcrumb>
  ))
  expect(texts(host)).toEqual(['首页', '>', '当前', '>'])
  expect(host.querySelector('ol')!.className).toContain('[&>li[data-breadcrumb-auto]:last-child]:hidden')
  expect(host.querySelector('a')?.getAttribute('href')).toBe('#home')
  lis(host)[2]!.querySelector('span')!.click()
  expect(onClick).toHaveBeenCalledOnce()
})
