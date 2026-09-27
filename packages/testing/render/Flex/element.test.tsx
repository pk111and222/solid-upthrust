import type { JSX } from '@solidjs/web'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Flex from '../../../components/lib/Flex'
import { mount } from '../../utils/mount'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {} })

const render = (factory: () => JSX.Element) => {
  const mounted = mount(factory)
  cleanup = mounted.dispose
  return mounted.host
}

describe('Flex 宿主元素', () => {
  // component 接受原生标签名，语义列表可直接渲染为 ul > li，不产生额外包裹层。
  it('[flex.component.tag] renders the requested intrinsic element without wrappers', () => {
    const host = render(() => <Flex component="ul" gap="small"><li>A</li><li>B</li></Flex>)
    const list = host.firstElementChild!
    expect(list.tagName).toBe('UL')
    expect([...list.children].map(child => child.tagName)).toEqual(['LI', 'LI'])
    expect(list.className).toContain('gap-xs')
  })

  // component 也接受函数组件；Flex 计算好的 class/style 与其余属性一起交给该组件。
  it('[flex.component.function] forwards computed props to a function component', () => {
    const Section = (props: { class?: string; style?: JSX.CSSProperties; id?: string; children?: JSX.Element }) =>
      <section data-custom class={props.class} style={props.style} id={props.id}>{props.children}</section>
    const host = render(() => <Flex component={Section} id="custom" vertical gap={10}><b>A</b></Flex>)
    const section = host.querySelector('section')!
    expect(section.hasAttribute('data-custom')).toBe(true)
    expect(section.id).toBe('custom')
    expect(section.className).toContain('flex-col')
    expect(section.style.gap).toBe('10px')
  })

  // 原生属性、aria/data 属性与事件透传到宿主元素，点击回调每次只触发一次。
  it('[flex.attrs] passes native attributes, aria/data attributes and events through', () => {
    const onClick = vi.fn()
    const host = render(() => <Flex id="toolbar" role="toolbar" aria-label="操作栏" data-testid="flex" title="tip" tabindex={0} onClick={onClick}><span>A</span></Flex>)
    const el = host.firstElementChild as HTMLElement
    expect(el.id).toBe('toolbar')
    expect(el.getAttribute('role')).toBe('toolbar')
    expect(el.getAttribute('aria-label')).toBe('操作栏')
    expect(el.dataset.testid).toBe('flex')
    expect(el.title).toBe('tip')
    expect(el.tabIndex).toBe(0)
    el.click()
    ;(el.firstElementChild as HTMLElement).click()
    expect(onClick).toHaveBeenCalledTimes(2)
    // 组件自身的布局属性不会作为 DOM 属性泄漏。
    for (const name of ['vertical', 'orientation', 'wrap', 'justify', 'align', 'gap', 'inline', 'component']) expect(el.hasAttribute(name)).toBe(false)
  })

  // ref 拿到真实宿主 DOM 节点。
  it('[flex.ref] exposes the host element through ref', () => {
    let node: HTMLElement | undefined
    const host = render(() => <Flex component="nav" ref={el => { node = el }}><a href="#a">A</a></Flex>)
    expect(node).toBe(host.firstElementChild)
    expect(node?.tagName).toBe('NAV')
  })

  // 与 antd 一致：容器无子节点时通过 empty:hidden 隐藏，避免空容器占位（真实 display 由 L4 验证）。
  it('[flex.empty] keeps the empty:hidden class for childless containers', () => {
    const host = render(() => <Flex gap="large" />)
    const el = host.firstElementChild as HTMLElement
    expect(el.childNodes).toHaveLength(0)
    expect(el.className.split(' ')).toContain('empty:hidden')
  })
})
