import { createSignal, flush } from 'solid-js'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import Anchor, { type AnchorLinkItemProps } from '../../../components/lib/Anchor'
import { mount } from '../../utils/mount'

let dispose = () => {}
let frames: FrameRequestCallback[] = []
/** rAF 手动推进：ink 测量推迟到下一帧（Solid 2 的函数 ref 在 DOM 插入前执行）。 */
const runFrames = () => { const list = frames; frames = []; list.forEach(cb => cb(0)); flush() }
beforeEach(() => {
  frames = []
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => { frames.push(cb); return frames.length })
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
})
afterEach(() => { dispose(); dispose = () => {}; vi.restoreAllMocks(); document.body.querySelectorAll('[data-section]').forEach(el => el.remove()) })

const items: AnchorLinkItemProps[] = [
  { key: 'a', href: '#sec-a', title: 'A' },
  { key: 'b', href: '#sec-b', title: 'B', children: [{ key: 'b1', href: '#sec-b1', title: 'B1' }] },
]
const link = (host: HTMLElement, key: string) => host.querySelector<HTMLAnchorElement>(`a[data-anchor-key="${key}"]`)!
const ink = (host: HTMLElement) => host.querySelector<HTMLElement>('[data-anchor-ink]')!
/** 在文档中放入目标区块，避免 scrollTo 因找不到元素直接返回。 */
const sections = (...ids: string[]) => ids.forEach(id => { const el = document.createElement('div'); el.id = id; el.dataset.section = ''; document.body.append(el) })

// 结构：wrapper > container（轨道）> div.link > a.title；嵌套链接渲染在父链接 div 内，不再使用 padding-left 缩进。
it('[anchor.render.structure] nested links live inside the parent link', () => {
  const view = mount(() => <Anchor affix={false} items={items} />); dispose = view.dispose
  const container = view.host.querySelector('[data-anchor-direction="vertical"]')!
  const parent = link(view.host, 'b').parentElement!
  expect(parent.parentElement).toBe(container)
  expect(link(view.host, 'b1').parentElement!.parentElement).toBe(parent)
  expect(link(view.host, 'b1').parentElement!.style.paddingLeft).toBe('')
  expect(link(view.host, 'a').getAttribute('href')).toBe('#sec-a')
  expect(link(view.host, 'a').getAttribute('title')).toBe('A')
})

// horizontal 忽略 children，只渲染顶层链接。
it('[anchor.render.horizontal] ignores children', () => {
  const view = mount(() => <Anchor direction="horizontal" affix={false} items={items} />); dispose = view.dispose
  expect(view.host.querySelectorAll('a[data-anchor-key]').length).toBe(2)
  expect(link(view.host, 'b1')).toBeNull()
})

// 点击：先回调 onClick(e, {title, href})，再高亮并 pushState 写入 hash；onChange 收到 href（破坏性：旧实现收到 key）。
it('[anchor.render.click] onClick, pushState and href-based onChange', () => {
  sections('sec-a', 'sec-b')
  const push = vi.spyOn(window.history, 'pushState').mockImplementation(() => {})
  const onClick = vi.fn(), onChange = vi.fn()
  const view = mount(() => <Anchor affix={false} items={items} onClick={onClick} onChange={onChange} />); dispose = view.dispose
  link(view.host, 'b').click(); flush()
  expect(onClick).toHaveBeenCalledWith(expect.any(MouseEvent), { title: 'B', href: '#sec-b' })
  expect(push).toHaveBeenCalledWith(null, '', '#sec-b')
  expect(onChange).toHaveBeenLastCalledWith('#sec-b')
  expect(link(view.host, 'b').getAttribute('aria-current')).toBe('location')
  expect(link(view.host, 'b').className).toContain('text-primary')
})

// replace（全局或单项）改用 replaceState；onClick 中 preventDefault 则不写地址栏但仍高亮。
it('[anchor.render.replace] replaceState and preventDefault', () => {
  sections('sec-a', 'sec-b')
  const push = vi.spyOn(window.history, 'pushState').mockImplementation(() => {})
  const replace = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})
  const [prevent, setPrevent] = createSignal(false, { ownedWrite: true })
  const view = mount(() => <Anchor affix={false} replace items={items} onClick={e => { if (prevent()) e.preventDefault() }} />); dispose = view.dispose
  link(view.host, 'a').click(); flush()
  expect(replace).toHaveBeenCalledWith(null, '', '#sec-a')
  setPrevent(true); flush()
  replace.mockClear()
  link(view.host, 'b').click(); flush()
  expect(replace).not.toHaveBeenCalled(); expect(push).not.toHaveBeenCalled()
  expect(link(view.host, 'b').getAttribute('aria-current')).toBe('location')
})

// 外链（http(s)://）不拦截默认跳转，也不写 history。
it('[anchor.render.external] external links keep native navigation', () => {
  const push = vi.spyOn(window.history, 'pushState').mockImplementation(() => {})
  const view = mount(() => <Anchor affix={false} items={[{ key: 'x', href: 'https://example.com/', title: 'X', target: '_blank' }]} />); dispose = view.dispose
  const event = new MouseEvent('click', { bubbles: true, cancelable: true })
  // 阻止 happy-dom 真正导航：在冒泡末端（document）截获前检查组件是否 preventDefault。
  let prevented: boolean | undefined
  const spy = (e: Event) => { prevented = e.defaultPrevented; e.preventDefault() }
  document.addEventListener('click', spy)
  link(view.host, 'x').dispatchEvent(event); flush()
  document.removeEventListener('click', spy)
  expect(prevented).toBe(false)
  expect(push).not.toHaveBeenCalled()
  expect(link(view.host, 'x').getAttribute('target')).toBe('_blank')
})

// getCurrentAnchor 收到 href、返回 href（兼容返回 key），决定高亮；onChange 收到经过它之后的 href。
it('[anchor.render.currentAnchor] href in, href or key out', () => {
  const [value, setValue] = createSignal('#sec-b', { ownedWrite: true })
  const received: string[] = []
  const view = mount(() => <Anchor affix={false} items={items} getCurrentAnchor={href => { received.push(href); return value() }} />); dispose = view.dispose
  flush()
  expect(link(view.host, 'b').getAttribute('aria-current')).toBe('location')
  expect(received.every(href => href === '' || href.startsWith('#'))).toBe(true)
  setValue('b1'); flush()
  expect(link(view.host, 'b1').getAttribute('aria-current')).toBe('location')
  expect(link(view.host, 'b').getAttribute('aria-current')).toBeNull()
})

// ink：下一帧按激活标题的 offsetTop / offsetHeight 定位；affix={false} 时 vertical 默认隐藏，showInkInFixed 打开；horizontal 始终显示。
it('[anchor.render.ink] measured from the active title and gated by showInkInFixed', () => {
  const [showInk, setShowInk] = createSignal(false, { ownedWrite: true })
  const view = mount(() => <Anchor affix={false} showInkInFixed={showInk()} items={items} getCurrentAnchor={() => '#sec-b'} />); dispose = view.dispose
  const title = link(view.host, 'b')
  Object.defineProperty(title, 'offsetTop', { configurable: true, value: 34 })
  Object.defineProperty(title, 'offsetHeight', { configurable: true, value: 22 })
  runFrames()
  expect(ink(view.host).style.top).toBe('34px')
  expect(ink(view.host).style.height).toBe('22px')
  expect(ink(view.host).className).toContain('hidden')
  setShowInk(true); flush()
  expect(ink(view.host).className).toContain('block')

  const horizontal = mount(() => <Anchor direction="horizontal" affix={false} items={items} getCurrentAnchor={() => '#sec-a'} />)
  try {
    const a = link(horizontal.host, 'a')
    Object.defineProperty(a, 'offsetLeft', { configurable: true, value: 0 })
    Object.defineProperty(a, 'offsetWidth', { configurable: true, value: 40 })
    runFrames()
    expect(ink(horizontal.host).style.width).toBe('40px')
    expect(ink(horizontal.host).className).toContain('block')
  } finally { horizontal.dispose() }
})

// 默认 affix：内容包在 Affix 占位层里（data-affixed 标记）；affix={false} 时没有 Affix。
it('[anchor.render.affix] wraps in Affix by default', () => {
  const view = mount(() => <Anchor offsetTop={80} items={items} />); dispose = view.dispose
  expect(view.host.querySelector('[data-affixed]')).not.toBeNull()
  const plain = mount(() => <Anchor affix={false} items={items} />)
  try { expect(plain.host.querySelector('[data-affixed]')).toBeNull() } finally { plain.dispose() }
})

// getScrollContainer 旧名仍可用：scroll-spy 监听传入的容器；getContainer 优先。
it('[anchor.render.container] getContainer and legacy getScrollContainer', () => {
  const scroller = document.createElement('div'); document.body.append(scroller)
  const legacy = document.createElement('div'); document.body.append(legacy)
  const addScroller = vi.spyOn(scroller, 'addEventListener'), addLegacy = vi.spyOn(legacy, 'addEventListener')
  const view = mount(() => <Anchor affix={false} items={items} getScrollContainer={() => legacy} />); dispose = view.dispose
  expect(addLegacy.mock.calls.some(([name]) => name === 'scroll')).toBe(true)
  const both = mount(() => <Anchor affix={false} items={items} getContainer={() => scroller} getScrollContainer={() => legacy} />)
  try { expect(addScroller.mock.calls.some(([name]) => name === 'scroll')).toBe(true) } finally { both.dispose(); scroller.remove(); legacy.remove() }
})
