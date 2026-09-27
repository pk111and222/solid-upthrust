import { createRoot, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Grid, { Col, Row } from '../../../components/lib/Grid'
import { createFakeMatchMedia } from '../../utils/matchMedia'
import { mount } from '../../utils/mount'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {}; vi.unstubAllGlobals(); vi.restoreAllMocks() })

const render = (factory: Parameters<typeof mount>[0]) => {
  const mounted = mount(factory)
  cleanup = mounted.dispose
  return mounted.host
}

describe('Grid 宿主元素', () => {
  // Row/Col 的原生属性、aria/data 属性与事件透传到 div，布局专用 props 不会以 attribute 泄漏。
  it('[grid.attrs] passes native attributes and events to Row and Col', () => {
    const onRow = vi.fn()
    const onCol = vi.fn()
    const host = render(() => (
      <Row id="row" role="list" aria-label="栅格" data-testid="row" gutter={8} justify="center" onClick={onRow}>
        <Col id="col" role="listitem" title="tip" data-testid="col" span={12} offset={2} onClick={onCol}>A</Col>
      </Row>
    ))
    const row = host.querySelector('#row') as HTMLElement
    const colEl = host.querySelector('#col') as HTMLElement
    expect(row.getAttribute('role')).toBe('list')
    expect(row.getAttribute('aria-label')).toBe('栅格')
    expect(row.dataset.testid).toBe('row')
    expect(colEl.getAttribute('role')).toBe('listitem')
    expect(colEl.title).toBe('tip')
    for (const name of ['gutter', 'justify', 'wrap']) expect(row.hasAttribute(name)).toBe(false)
    for (const name of ['span', 'offset', 'push', 'pull', 'order', 'flex', 'md']) expect(colEl.hasAttribute(name)).toBe(false)
    colEl.click()
    expect(onCol).toHaveBeenCalledTimes(1)
    expect(onRow).toHaveBeenCalledTimes(1)
  })

  // ref 拿到真实 div 元素。
  it('[grid.ref] exposes the host elements through ref', () => {
    let rowRef: HTMLDivElement | undefined
    let colRef: HTMLDivElement | undefined
    const host = render(() => <Row ref={el => { rowRef = el }}><Col ref={el => { colRef = el }} span={6}>A</Col></Row>)
    expect(rowRef).toBe(host.firstElementChild)
    expect(colRef).toBe(host.firstElementChild!.firstElementChild)
  })

  // class 经 twMerge 合并，用户类覆盖同组默认类。
  it('[grid.class-merge] merges user classes over defaults', () => {
    const host = render(() => <Row class="flex-nowrap mb-4"><Col class="max-w-none" span={6}>A</Col></Row>)
    const row = host.firstElementChild as HTMLElement
    expect(row.className).toContain('mb-4')
    expect(row.className).toContain('flex-nowrap')
    expect(row.className.split(' ')).not.toContain('flex-wrap')
    expect((row.firstElementChild as HTMLElement).className.split(' ')).not.toContain('max-w-full')
  })
})

describe('Grid.useBreakpoint', () => {
  // 返回当前命中的断点表：xs 为 max-width 查询，其余为 min-width；媒体变化后更新。
  it('[grid.use-breakpoint] reports screens and follows media changes', () => {
    const mm = createFakeMatchMedia({ '(min-width: 576px)': true, '(min-width: 768px)': true })
    vi.stubGlobal('matchMedia', mm.matchMedia)
    let screens!: () => Record<string, boolean | undefined>
    render(() => { screens = Grid.useBreakpoint(); return null })
    expect(screens()).toEqual({ xs: false, sm: true, md: true, lg: false, xl: false, xxl: false, xxxl: false })
    mm.setMatch('(min-width: 1920px)', true)
    flush()
    expect(screens().xxxl).toBe(true)
  })

  // 多个订阅者共用一组 matchMedia 监听；最后一个订阅者卸载后全部移除，不泄漏。
  it('[grid.use-breakpoint.cleanup] shares listeners and removes them after the last subscriber', () => {
    const mm = createFakeMatchMedia({})
    const add = vi.spyOn(EventTarget.prototype, 'addEventListener')
    const remove = vi.spyOn(EventTarget.prototype, 'removeEventListener')
    vi.stubGlobal('matchMedia', mm.matchMedia)
    const disposers: (() => void)[] = []
    for (let i = 0; i < 3; i++) createRoot(dispose => { Grid.useBreakpoint(); disposers.push(dispose) })
    const changeAdds = () => add.mock.calls.filter(([type]) => type === 'change').length
    const changeRemoves = () => remove.mock.calls.filter(([type]) => type === 'change').length
    expect(changeAdds()).toBe(7)
    disposers[0](); disposers[1]()
    expect(changeRemoves()).toBe(0)
    disposers[2]()
    expect(changeRemoves()).toBe(7)
  })

  // 没有 matchMedia（SSR）时返回空表，不抛错。
  it('[grid.use-breakpoint.ssr] returns an empty map without matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined)
    let screens!: () => Record<string, boolean | undefined>
    render(() => { screens = Grid.useBreakpoint(); return null })
    expect(screens()).toEqual({})
  })
})
