import { createSignal, flush, Show } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Layout, { Content, Footer, Header, Sider } from '../../../components/lib/Layout'
import { mount } from '../../utils/mount'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {} })

const render = (factory: () => JSX.Element) => {
  const mounted = mount(factory)
  cleanup = mounted.dispose
  return mounted.host
}
const classes = (el: Element) => el.className.split(/\s+/).filter(Boolean)
const byTestId = (host: HTMLElement, id: string) => host.querySelector(`[data-testid="${id}"]`) as HTMLElement

describe('Layout 结构', () => {
  // 五个区域分别渲染为 div / header / footer / main / aside，并带各自的标记类。
  it('[layout.render.tags] renders semantic tags with marker classes', () => {
    const host = render(() => (
      <Layout data-testid="root">
        <Header data-testid="header" />
        <Layout data-testid="inner"><Sider data-testid="sider" /><Content data-testid="content" /></Layout>
        <Footer data-testid="footer" />
      </Layout>
    ))
    const expected = {
      root: ['DIV', 'upthrust-layout'], header: ['HEADER', 'upthrust-layout-header'], inner: ['DIV', 'upthrust-layout'],
      sider: ['ASIDE', 'upthrust-layout-sider'], content: ['MAIN', 'upthrust-layout-content'], footer: ['FOOTER', 'upthrust-layout-footer'],
    }
    for (const [id, [tag, marker]] of Object.entries(expected)) {
      const el = byTestId(host, id)
      expect(el.tagName, id).toBe(tag)
      expect(classes(el), id).toContain(marker)
    }
  })

  // 默认纵向排列；Header / Footer 不参与伸缩，Content 占满剩余空间。
  it('[layout.render.column] stacks vertically by default', () => {
    const host = render(() => <Layout data-testid="root"><Header data-testid="h" /><Content data-testid="c" /><Footer data-testid="f" /></Layout>)
    const root = byTestId(host, 'root')
    expect(classes(root)).toEqual(expect.arrayContaining(['flex', 'flex-col', 'flex-auto', 'min-h-0']))
    expect(classes(root)).not.toContain('flex-row')
    expect(classes(byTestId(host, 'h'))).toEqual(expect.arrayContaining(['flex-none', 'h-[64px]']))
    expect(classes(byTestId(host, 'f'))).toContain('flex-none')
    expect(classes(byTestId(host, 'c'))).toEqual(expect.arrayContaining(['flex-auto', 'min-h-0']))
  })
})

describe('Layout hasSider', () => {
  const isRow = (el: HTMLElement) => classes(el).includes('flex-row') && !classes(el).includes('flex-col')

  // 直接子级有 Sider 时自动切为横向，并给直接子级 Layout / Content 挂宽度归零选择器。
  it('[layout.render.auto-has-sider] switches to a row when a Sider is inside', () => {
    const host = render(() => <Layout data-testid="root"><Sider /><Content /></Layout>)
    const root = byTestId(host, 'root')
    expect(isRow(root)).toBe(true)
    expect(classes(root)).toEqual(expect.arrayContaining(['[&>.upthrust-layout]:w-0', '[&>.upthrust-layout-content]:w-0']))
  })

  // Sider 被包裹在其他元素里也能注册（通过 context，而非检查直接子元素类型）。
  it('[layout.render.wrapped-sider] detects a Sider nested inside wrappers', () => {
    const Wrapper = (props: { children: JSX.Element }) => <div>{props.children}</div>
    const host = render(() => <Layout data-testid="root"><Wrapper><Sider /></Wrapper><Content /></Layout>)
    expect(isRow(byTestId(host, 'root'))).toBe(true)
  })

  // 显式 hasSider 优先：true 时无 Sider 也横向；false 时有 Sider 也纵向。
  it('[layout.render.explicit-has-sider] an explicit boolean overrides detection', () => {
    const host = render(() => (
      <>
        <Layout data-testid="on" hasSider><Content /></Layout>
        <Layout data-testid="off" hasSider={false}><Sider /><Content /></Layout>
      </>
    ))
    expect(isRow(byTestId(host, 'on'))).toBe(true)
    expect(classes(byTestId(host, 'off'))).toContain('flex-col')
  })

  // Sider 动态挂载 / 卸载时方向随之切换；多个 Sider 时全部卸载才恢复纵向。
  it('[layout.render.dynamic-sider] tracks Sider mount and unmount', () => {
    const [left, setLeft] = createSignal(false)
    const [right, setRight] = createSignal(false)
    const host = render(() => (
      <Layout data-testid="root">
        <Show when={left()}><Sider /></Show>
        <Content />
        <Show when={right()}><Sider /></Show>
      </Layout>
    ))
    const root = byTestId(host, 'root')
    expect(classes(root)).toContain('flex-col')
    setLeft(true); flush()
    expect(isRow(root)).toBe(true)
    setRight(true); flush()
    setLeft(false); flush()
    expect(isRow(root)).toBe(true)
    setRight(false); flush()
    expect(classes(root)).toContain('flex-col')
  })

  // 注册只影响最近的 Layout：内层 Layout 的 Sider 不会让外层变成横向。
  it('[layout.render.nested-isolation] a Sider registers with its nearest Layout only', () => {
    const host = render(() => (
      <Layout data-testid="outer">
        <Header />
        <Layout data-testid="inner"><Sider /><Content /></Layout>
      </Layout>
    ))
    expect(classes(byTestId(host, 'outer'))).toContain('flex-col')
    expect(isRow(byTestId(host, 'inner'))).toBe(true)
  })

  // 不在 Layout 内的 Sider 照常渲染，不抛 ContextNotFoundError。
  it('[layout.render.standalone-sider] renders a Sider outside any Layout', () => {
    const host = render(() => <Sider data-testid="s">S</Sider>)
    expect(byTestId(host, 's').textContent).toBe('S')
  })
})

describe('Layout 透传', () => {
  // 五个组件都透传原生属性、事件与 ref，并合并 style。
  it('[layout.render.passthrough] forwards attributes, events, refs and styles', () => {
    const onClick = vi.fn()
    const refs: HTMLElement[] = []
    const host = render(() => (
      <Layout id="l" ref={el => refs.push(el)} onClick={onClick} style={{ 'min-height': '100px' }}>
        <Header id="h" aria-label="页头" ref={el => refs.push(el)} style={{ color: 'red' }} />
        <Sider id="s" title="侧栏" ref={el => refs.push(el)} />
        <Content id="c" role="region" ref={el => refs.push(el)} />
        <Footer id="f" data-x="1" ref={el => refs.push(el)} />
      </Layout>
    ))
    expect(refs.map(el => el.id).sort()).toEqual(['c', 'f', 'h', 'l', 's'])
    expect(host.querySelector('#h')!.getAttribute('aria-label')).toBe('页头')
    expect((host.querySelector('#h') as HTMLElement).style.color).toBe('red')
    expect(host.querySelector('#s')!.getAttribute('title')).toBe('侧栏')
    expect(host.querySelector('#c')!.getAttribute('role')).toBe('region')
    expect(host.querySelector('#f')!.getAttribute('data-x')).toBe('1')
    expect((host.querySelector('#l') as HTMLElement).style.minHeight).toBe('100px')
    ;(host.querySelector('#c') as HTMLElement).click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  // class 与默认类冲突时以用户类为准（mergeClass 去重），不会同时存在两个冲突类。
  it('[layout.render.class-merge] user classes replace conflicting defaults', () => {
    const host = render(() => (
      <Layout data-testid="root" class="flex-row">
        <Header data-testid="h" class="px-0 h-16 bg-primary" />
        <Content data-testid="c" class="p-md" />
        <Footer data-testid="f" class="py-xs text-center" />
      </Layout>
    ))
    const root = classes(byTestId(host, 'root'))
    expect(root).toContain('flex-row')
    expect(root).not.toContain('flex-col')
    const header = classes(byTestId(host, 'h'))
    expect(header).toEqual(expect.arrayContaining(['px-0', 'h-16', 'bg-primary']))
    expect(header).not.toContain('px-lg')
    expect(header).not.toContain('h-[64px]')
    expect(header).not.toContain('bg-surface')
    const footer = classes(byTestId(host, 'f'))
    expect(footer).toEqual(expect.arrayContaining(['py-xs', 'px-lg', 'text-center']))
    expect(footer).not.toContain('py-lg')
    expect(classes(byTestId(host, 'c'))).toContain('p-md')
  })

  // hasSider 不会作为 DOM 属性泄漏到根节点。
  it('[layout.render.no-leak] does not leak hasSider onto the DOM', () => {
    const host = render(() => <Layout data-testid="root" hasSider />)
    const root = byTestId(host, 'root')
    expect(root.hasAttribute('hasSider')).toBe(false)
    expect(root.hasAttribute('hassider')).toBe(false)
  })
})
