import { createSignal, flush } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { siderBreakpointQuery } from '../../../competence/src/sider'
import Layout, { Content, Sider, type SiderProps } from '../../../components/lib/Layout'
import { createFakeMatchMedia } from '../../utils/matchMedia'
import { mount } from '../../utils/mount'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {}; vi.unstubAllGlobals() })

const render = (factory: () => JSX.Element) => {
  const mounted = mount(factory)
  cleanup = mounted.dispose
  return mounted.host
}
const classes = (el: Element) => el.className.split(/\s+/).filter(Boolean)
const mdQuery = siderBreakpointQuery('md')

/** 渲染单个 Sider，返回根、内容容器与触发器查询。 */
const renderSider = (props: SiderProps = {}) => {
  const host = render(() => <Sider data-testid="sider" {...props}>{props.children ?? <nav>菜单</nav>}</Sider>)
  const root = host.querySelector('[data-testid="sider"]') as HTMLElement
  return {
    host, root,
    body: root.firstElementChild as HTMLElement,
    trigger: () => root.querySelector('[role="button"]') as HTMLElement | null,
  }
}
const widthOf = (root: HTMLElement) => ({
  flex: root.style.flex, width: root.style.width, min: root.style.minWidth, max: root.style.maxWidth,
})
/** flex 简写会被 CSSOM 规范化，用参照元素得到同一规范化结果再比较。 */
const expectWidth = (root: HTMLElement, value: string) => {
  const probe = document.createElement('div')
  probe.style.flex = `0 0 ${value}`
  expect(widthOf(root)).toEqual({ flex: probe.style.flex, width: value, min: value, max: value })
}
const press = (el: HTMLElement, key: string) => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  el.dispatchEvent(event)
  flush()
  return event
}

describe('Sider 宽度', () => {
  // 默认展开 200px、深色主题、无触发器；宽度同时写 flex-basis / width / min / max。
  it('[sider.render.defaults] defaults to a 200px dark sider without a trigger', () => {
    const { root, body, trigger } = renderSider()
    expectWidth(root, '200px')
    expect(classes(root)).toEqual(expect.arrayContaining(['upthrust-layout-sider', 'bg-inverse-surface', 'text-inverse-on-surface']))
    expect(body.textContent).toBe('菜单')
    expect(classes(body)).toEqual(expect.arrayContaining(['flex-auto', 'overflow-x-hidden', 'overflow-y-auto']))
    expect(trigger()).toBeNull()
    expect(body.hasAttribute('inert')).toBe(false)
  })

  // 宽度格式与 antd 一致：数字与纯数字字符串补 px，其余 CSS 长度原样使用。
  it.each([
    [240, '240px'], ['240', '240px'], ['15rem', '15rem'], ['20%', '20%'], ['calc(100% - 10px)', 'calc(100% - 10px)'],
  ] as const)('[sider.render.width-format] width=%j → %s', (width, css) => {
    expectWidth(renderSider({ width }).root, css)
  })

  // 收起时使用 collapsedWidth（默认 80），同样支持字符串宽度。
  it('[sider.render.collapsed-width] uses collapsedWidth when collapsed', () => {
    expectWidth(renderSider({ defaultCollapsed: true }).root, '80px')
    cleanup()
    expectWidth(renderSider({ collapsed: true, collapsedWidth: '4rem' }).root, '4rem')
  })

  // 与 antd 一致：style 里的宽度声明被 width 覆盖，其余样式保留；styles.root 先于 style 合并。
  it('[sider.render.style-precedence] width wins over style while other styles merge', () => {
    const { root } = renderSider({
      width: 300, style: { width: '10px', 'max-width': '10px', color: 'red' },
      styles: { root: { color: 'blue', 'background-color': 'black' } },
    })
    expectWidth(root, '300px')
    expect(root.style.color).toBe('red')
    expect(root.style.backgroundColor).toBe('black')
  })
})

describe('Sider 收起交互', () => {
  // collapsible：渲染底部触发器；点击切换宽度与 aria-expanded，回调来源为 clickTrigger。
  it('[sider.render.click] toggles on trigger click', () => {
    const onCollapse = vi.fn()
    const { root, trigger } = renderSider({ collapsible: true, onCollapse })
    const button = trigger()!
    expect(button.tagName).toBe('DIV')
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(button.getAttribute('aria-label')).toBe('切换侧边栏')
    expect(button.tabIndex).toBe(0)
    expect(classes(button)).toEqual(expect.arrayContaining(['sticky', 'bottom-0', 'h-[48px]']))
    button.click(); flush()
    expectWidth(root, '80px')
    expect(trigger()!.getAttribute('aria-expanded')).toBe('false')
    expect(onCollapse).toHaveBeenLastCalledWith(true, 'clickTrigger')
    trigger()!.click(); flush()
    expectWidth(root, '200px')
    expect(onCollapse).toHaveBeenLastCalledWith(false, 'clickTrigger')
  })

  // 键盘：Enter / 空格切换并阻止默认行为（空格不滚动页面）；其他键忽略。
  it('[sider.render.keyboard] toggles with Enter and Space', () => {
    const onCollapse = vi.fn()
    const { trigger } = renderSider({ collapsible: true, onCollapse })
    expect(press(trigger()!, 'Enter').defaultPrevented).toBe(true)
    expect(onCollapse).toHaveBeenLastCalledWith(true, 'clickTrigger')
    expect(press(trigger()!, ' ').defaultPrevented).toBe(true)
    expect(onCollapse).toHaveBeenLastCalledWith(false, 'clickTrigger')
    expect(press(trigger()!, 'a').defaultPrevented).toBe(false)
    expect(onCollapse).toHaveBeenCalledTimes(2)
  })

  // 受控：点击只回调期望值，宽度等父级更新 collapsed 后才变化。
  it('[sider.render.controlled] waits for the controlled prop', () => {
    const [collapsed, setCollapsed] = createSignal(false)
    const onCollapse = vi.fn()
    const host = render(() => (
      <Sider data-testid="s" collapsible collapsed={collapsed()} onCollapse={onCollapse} />
    ))
    const root = host.querySelector('[data-testid="s"]') as HTMLElement
    ;(root.querySelector('[role="button"]') as HTMLElement).click(); flush()
    expectWidth(root, '200px')
    expect(onCollapse).toHaveBeenLastCalledWith(true, 'clickTrigger')
    setCollapsed(true); flush()
    expectWidth(root, '80px')
  })

  // 默认箭头：展开指向左（收起方向），收起指向右；reverseArrow 整体翻转。
  it.each([
    [false, false, 'i-mdi-chevron-left'], [true, false, 'i-mdi-chevron-right'],
    [false, true, 'i-mdi-chevron-right'], [true, true, 'i-mdi-chevron-left'],
  ])('[sider.render.arrow] collapsed=%s reverseArrow=%s → %s', (collapsed, reverseArrow, icon) => {
    const { trigger } = renderSider({ collapsible: true, collapsed, reverseArrow })
    const glyph = trigger()!.querySelector('[aria-hidden="true"]')!
    expect(classes(glyph)).toContain(icon)
  })

  // trigger=null：collapsible 时也不渲染触发器，可配合受控 collapsed 自建按钮。
  it('[sider.render.trigger-null] renders no trigger when trigger is null', () => {
    const { trigger, root } = renderSider({ collapsible: true, trigger: null, collapsed: true })
    expect(trigger()).toBeNull()
    expectWidth(root, '80px')
  })

  // 自定义 trigger：替换默认箭头，仍由外层按钮负责切换与无障碍属性。
  it('[sider.render.trigger-custom] renders a custom trigger inside the button', () => {
    const onCollapse = vi.fn()
    const { trigger } = renderSider({ collapsible: true, onCollapse, trigger: <b data-custom>切换</b> })
    const button = trigger()!
    expect(button.querySelector('[data-custom]')!.textContent).toBe('切换')
    expect(button.querySelector('.i-mdi-chevron-left')).toBeNull()
    ;(button.querySelector('[data-custom]') as HTMLElement).click(); flush()
    expect(onCollapse).toHaveBeenCalledWith(true, 'clickTrigger')
  })

  // 触发器随主题切换配色；浅色主题根节点为 surface 背景。
  it('[sider.render.light] applies the light theme to root and trigger', () => {
    const { root, trigger } = renderSider({ collapsible: true, theme: 'light' })
    expect(classes(root)).toEqual(expect.arrayContaining(['bg-surface', 'text-on-surface']))
    expect(classes(root)).not.toContain('bg-inverse-surface')
    expect(classes(trigger()!)).toEqual(expect.arrayContaining(['bg-surface', 'border-outline-variant']))
  })
})

describe('Sider 零宽模式', () => {
  // collapsedWidth=0 + collapsible：改用挂在外侧的零宽触发器（span、菜单图标、右侧）。
  it('[sider.render.zero-trigger] renders the outside tab trigger', () => {
    const onCollapse = vi.fn()
    const { root, trigger } = renderSider({ collapsible: true, collapsedWidth: 0, onCollapse })
    const button = trigger()!
    expect(button.tagName).toBe('SPAN')
    expect(classes(button)).toEqual(expect.arrayContaining(['absolute', 'top-[64px]', 'right-[-40px]', 'rounded-r-lg', 'bg-inverse-surface']))
    expect(button.querySelector('.i-mdi-menu')).not.toBeNull()
    button.click(); flush()
    expectWidth(root, '0px')
    expect(onCollapse).toHaveBeenLastCalledWith(true, 'clickTrigger')
    expect(trigger()!.getAttribute('aria-expanded')).toBe('false')
  })

  // 零宽收起后内容设为 inert（不可聚焦、不进入无障碍树）；展开后移除。
  it('[sider.render.inert] makes the hidden body inert', () => {
    const [collapsed, setCollapsed] = createSignal(true)
    const host = render(() => <Sider data-testid="s" collapsedWidth={0} collapsed={collapsed()}><a href="#x">链接</a></Sider>)
    const body = (host.querySelector('[data-testid="s"]') as HTMLElement).firstElementChild!
    expect(body.hasAttribute('inert')).toBe(true)
    setCollapsed(false); flush()
    expect(body.hasAttribute('inert')).toBe(false)
  })

  // reverseArrow + 浅色：零宽触发器挂到左侧，浅色配色并带边框、去掉贴边一侧边框。
  it('[sider.render.zero-trigger-reverse] moves the tab to the start side', () => {
    const { trigger } = renderSider({ collapsible: true, collapsedWidth: '0', reverseArrow: true, theme: 'light' })
    const cls = classes(trigger()!)
    expect(cls).toEqual(expect.arrayContaining(['left-[-40px]', 'rounded-l-lg', 'bg-surface', 'border', 'border-r-0']))
    expect(cls).not.toContain('right-[-40px]')
  })

  // zeroWidthTriggerStyle 写在零宽触发器上；自定义 trigger 同样替换零宽触发器内容。
  it('[sider.render.zero-trigger-custom] applies zeroWidthTriggerStyle and custom content', () => {
    const { trigger } = renderSider({
      collapsible: true, collapsedWidth: 0, zeroWidthTriggerStyle: { top: '12px' }, trigger: <i data-custom>≡</i>,
    })
    expect(trigger()!.style.top).toBe('12px')
    expect(trigger()!.querySelector('[data-custom]')).not.toBeNull()
    expect(trigger()!.querySelector('.i-mdi-menu')).toBeNull()
  })

  // 非 collapsible 的零宽 Sider：只在低于断点时出现零宽触发器（antd 同条件），可以手动展开。
  it('[sider.render.zero-trigger-broken] shows the tab only below the breakpoint', () => {
    const mm = createFakeMatchMedia({ [mdQuery]: false })
    vi.stubGlobal('matchMedia', mm.matchMedia)
    const { root, trigger } = renderSider({ breakpoint: 'md', collapsedWidth: 0 })
    expect(trigger()).toBeNull()
    expectWidth(root, '200px')
    mm.setMatch(mdQuery, true); flush()
    expectWidth(root, '0px')
    expect(trigger()).not.toBeNull()
    trigger()!.click(); flush()
    expectWidth(root, '200px')
    mm.setMatch(mdQuery, false); flush()
    expect(trigger()).toBeNull()
  })

  // 非零宽且非 collapsible：低于断点只收起，不出现触发器。
  it('[sider.render.no-trigger-when-not-zero] a non-zero collapsed width never adds a trigger by itself', () => {
    const mm = createFakeMatchMedia({ [mdQuery]: true })
    vi.stubGlobal('matchMedia', mm.matchMedia)
    const { root, trigger } = renderSider({ breakpoint: 'md' })
    expectWidth(root, '80px')
    expect(trigger()).toBeNull()
  })
})

describe('Sider 响应式与透传', () => {
  // 断点回调透传到组件 props：挂载时 onBreakpoint 按当前宽度调用，跨过断点后 onCollapse 记为 responsive。
  it('[sider.render.responsive] forwards breakpoint callbacks', () => {
    const mm = createFakeMatchMedia({ [mdQuery]: false })
    vi.stubGlobal('matchMedia', mm.matchMedia)
    const onBreakpoint = vi.fn()
    const onCollapse = vi.fn()
    const { root } = renderSider({ breakpoint: 'md', onBreakpoint, onCollapse })
    expect(onBreakpoint.mock.calls).toEqual([[false]])
    expect(onCollapse).not.toHaveBeenCalled()
    mm.setMatch(mdQuery, true); flush()
    expectWidth(root, '80px')
    expect(onBreakpoint).toHaveBeenLastCalledWith(true)
    expect(onCollapse).toHaveBeenLastCalledWith(true, 'responsive')
  })

  // 语义化 classNames / styles 分别作用在根节点与内容容器上。
  it('[sider.render.semantic] applies classNames and styles to root and body', () => {
    const { root, body } = renderSider({
      class: 'shadow', classNames: { root: 'rounded-lg', body: 'py-xs' }, styles: { body: { color: 'red' } },
    })
    expect(classes(root)).toEqual(expect.arrayContaining(['shadow', 'rounded-lg']))
    expect(classes(body)).toContain('py-xs')
    expect(body.style.color).toBe('red')
  })

  // 组件专属 props 不会作为 DOM 属性泄漏到 aside 上。
  it('[sider.render.no-leak] keeps component props off the DOM', () => {
    const { root } = renderSider({
      width: 240, collapsedWidth: 0, collapsible: true, reverseArrow: true, breakpoint: 'lg', theme: 'light',
      defaultCollapsed: false, zeroWidthTriggerStyle: {}, classNames: {}, styles: {}, onBreakpoint: () => {},
    })
    for (const name of ['width', 'collapsedwidth', 'collapsible', 'reversearrow', 'breakpoint', 'theme', 'defaultcollapsed', 'classnames', 'styles']) {
      expect(root.hasAttribute(name), name).toBe(false)
    }
  })

  // 在 Layout 中卸载 Sider 后，原先的收起监听被清理，不再触发回调。
  it('[sider.render.cleanup] disposes the media listener with the component', () => {
    const mm = createFakeMatchMedia({ [mdQuery]: false })
    vi.stubGlobal('matchMedia', mm.matchMedia)
    const onBreakpoint = vi.fn()
    render(() => <Layout><Sider breakpoint="md" onBreakpoint={onBreakpoint} /><Content /></Layout>)
    cleanup(); cleanup = () => {}
    mm.setMatch(mdQuery, true)
    expect(onBreakpoint).toHaveBeenCalledTimes(1)
  })
})
