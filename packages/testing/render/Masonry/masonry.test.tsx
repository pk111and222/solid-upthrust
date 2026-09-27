import { createSignal, flush } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SCREEN_QUERIES } from '../../../competence/src/breakpoint'
import Masonry, { type MasonryItem, type MasonryProps } from '../../../components/lib/Masonry'
import { createFakeMatchMedia } from '../../utils/matchMedia'
import { mount } from '../../utils/mount'

type Data = { label: string }

let cleanup = () => {}
/** 每项的测量高度（按内容里的 data-key 查找）。 */
const heightOf = new Map<string, number>()
/** 手动驱动的 rAF 队列。 */
let frames = new Map<number, FrameRequestCallback>()
let nextFrame = 1
const cancelFrame = vi.fn((id: number) => { frames.delete(id) })
/** 记录所有 ResizeObserver 实例，便于触发与检查断开。 */
const observers: FakeObserver[] = []
class FakeObserver {
  observed = new Set<Element>()
  disconnected = false
  constructor(readonly callback: ResizeObserverCallback) { observers.push(this) }
  observe(el: Element) { this.observed.add(el) }
  unobserve(el: Element) { this.observed.delete(el) }
  disconnect() { this.disconnected = true; this.observed.clear() }
  fire() { this.callback([], this as unknown as ResizeObserver) }
}
let media = createFakeMatchMedia({})

beforeEach(() => {
  heightOf.clear()
  frames = new Map()
  nextFrame = 1
  cancelFrame.mockClear()
  observers.length = 0
  media = createFakeMatchMedia({})
  vi.stubGlobal('matchMedia', media.matchMedia)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    const id = nextFrame++
    frames.set(id, callback)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', cancelFrame)
  vi.stubGlobal('ResizeObserver', FakeObserver)
  const setProperty = CSSStyleDeclaration.prototype.setProperty
  vi.spyOn(CSSStyleDeclaration.prototype, 'setProperty').mockImplementation(function (this: CSSStyleDeclaration, name, value, priority) {
    if (!written.has(this)) written.set(this, new Map())
    written.get(this)!.set(name, String(value))
    return setProperty.call(this, name, value, priority)
  })
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const key = this.querySelector('[data-key]')?.getAttribute('data-key') ?? ''
    const height = heightOf.get(key) ?? 0
    return { x: 0, y: 0, top: 0, left: 0, right: 0, bottom: height, width: 0, height, toJSON() {} } as DOMRect
  })
})
afterEach(() => {
  cleanup()
  cleanup = () => {}
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

/** 执行当前排队的所有帧。 */
const runFrames = () => {
  const pending = [...frames.values()]
  frames.clear()
  pending.forEach(callback => callback(0))
  flush()
}
const setScreens = (...matched: (keyof typeof SCREEN_QUERIES)[]) => {
  for (const [screen, query] of Object.entries(SCREEN_QUERIES)) media.setMatch(query, matched.includes(screen as keyof typeof SCREEN_QUERIES))
  flush()
}

/** 以 [key, 高度] 列表生成数据项，并登记测量高度。 */
const itemsOf = (list: [string, number][], extra: Partial<MasonryItem<Data>>[] = []): MasonryItem<Data>[] =>
  list.map(([key, height], i) => {
    heightOf.set(key, height)
    return { key, data: { label: key.toUpperCase() }, ...extra[i] }
  })
const itemRender: MasonryProps<Data>['itemRender'] = info => <i data-key={String(info.key)}>{info.data?.label}</i>

const render = (factory: () => JSX.Element) => {
  const mounted = mount(factory)
  cleanup = mounted.dispose
  const root = mounted.host.firstElementChild as HTMLElement
  const items = () => [...root.children] as HTMLElement[]
  return { host: mounted.host, root, items, columns: () => items().map(item => item.dataset.column) }
}
const renderMasonry = (props: MasonryProps<Data>) => render(() => <Masonry itemRender={itemRender} {...props} />)
const classes = (el: Element) => el.className.split(/\s+/).filter(Boolean)
const tops = (items: HTMLElement[]) => items.map(item => item.style.top)
/** happy-dom 会静默丢弃含 var() 的 width / left（真实浏览器由 Playwright 覆盖），这里读取组件最后写入的值。 */
const written = new WeakMap<CSSStyleDeclaration, Map<string, string>>()
const writtenStyle = (el: HTMLElement, name: string) => written.get(el.style)?.get(name)

describe('Masonry 测量与布局', () => {
  // 首次测量前：等宽网格回退（默认 3 列、间距 0），单项为 static，没有 data-column；已排队一次测量帧。
  it('[masonry.render.grid-fallback] renders a grid before the first measurement', () => {
    const view = renderMasonry({ items: itemsOf([['a', 10], ['b', 20]]) })
    expect(classes(view.root)).toEqual(expect.arrayContaining(['upthrust-masonry', 'grid', 'items-start']))
    expect(view.root.style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))')
    expect(view.root.style.columnGap).toBe('0px')
    expect(view.root.style.rowGap).toBe('0px')
    expect(view.items().map(item => item.textContent)).toEqual(['A', 'B'])
    expect(view.items().every(item => classes(item).includes('min-w-0') && !classes(item).includes('absolute'))).toBe(true)
    expect(view.columns()).toEqual([undefined, undefined])
    expect(frames.size).toBe(1)
  })

  // 测量后切换为绝对定位：按最短列放置，top 累加垂直间距，根节点高度为最高列；宽度与 left 由 CSS 变量计算。
  it('[masonry.render.absolute] positions items into the shortest column after measuring', () => {
    const view = renderMasonry({ columns: 2, gutter: 10, items: itemsOf([['a', 100], ['b', 50], ['c', 80], ['d', 30]]) })
    runFrames()
    expect(classes(view.root)).toContain('relative')
    expect(classes(view.root)).not.toContain('grid')
    expect(view.root.style.height).toBe('140px')
    expect(view.root.style.gridTemplateColumns).toBe('')
    expect(view.columns()).toEqual(['0', '1', '1', '0'])
    expect(tops(view.items())).toEqual(['0px', '0px', '60px', '110px'])
    const [first, second] = view.items()
    expect(classes(first)).toContain('absolute')
    expect(first.style.getPropertyValue('--upthrust-masonry-item-width')).toBe('calc((100% + 10px) / 2)')
    expect(writtenStyle(first, 'width')).toBe('calc(var(--upthrust-masonry-item-width) - 10px)')
    expect(writtenStyle(second, 'left')).toBe('calc(var(--upthrust-masonry-item-width) * 1)')
  })

  // gutter 数组：[水平, 垂直]，垂直只影响 top，水平只影响宽度计算。
  it('[masonry.render.gutter-pair] applies horizontal and vertical gutters separately', () => {
    const view = renderMasonry({ columns: 1, gutter: [24, 'small'], items: itemsOf([['a', 10], ['b', 10]]) })
    expect(view.root.style.columnGap).toBe('24px')
    expect(view.root.style.rowGap).toBe('8px')
    runFrames()
    expect(tops(view.items())).toEqual(['0px', '18px'])
    expect(view.items()[0].style.getPropertyValue('--upthrust-masonry-item-width')).toBe('calc((100% + 24px) / 1)')
  })

  // 高度不变时重复测量不会触发更新；高度变化时重新排布。
  it('[masonry.render.remeasure] re-lays out only when heights change', () => {
    const onLayoutChange = vi.fn()
    const view = renderMasonry({ columns: 2, onLayoutChange, items: itemsOf([['a', 100], ['b', 50], ['c', 80]]) })
    runFrames()
    expect(view.columns()).toEqual(['0', '1', '1'])
    const root = observers[0]
    root.fire()
    runFrames()
    expect(onLayoutChange).toHaveBeenCalledTimes(1)
    // b 变高：c 改放到第 0 列。
    heightOf.set('b', 200)
    root.fire()
    runFrames()
    expect(view.columns()).toEqual(['0', '1', '0'])
    expect(tops(view.items())).toEqual(['0px', '0px', '100px'])
    expect(view.root.style.height).toBe('200px')
  })

  // 同一帧内多次触发只测量一次。
  it('[masonry.render.batch] coalesces triggers within one frame', () => {
    renderMasonry({ items: itemsOf([['a', 10]]) })
    const [root] = observers
    root.fire()
    root.fire()
    expect(frames.size).toBe(1)
  })

  // 列数与间距变化同样触发重新测量与排布。
  it('[masonry.render.reactive-props] re-lays out when columns or gutter change', () => {
    const [columns, setColumns] = createSignal(1, { ownedWrite: true })
    const [gutter, setGutter] = createSignal(0, { ownedWrite: true })
    const view = render(() => (
      <Masonry columns={columns()} gutter={gutter()} items={itemsOf([['a', 10], ['b', 10]])} itemRender={itemRender} />
    ))
    runFrames()
    expect(view.columns()).toEqual(['0', '0'])
    setColumns(2)
    flush()
    expect(view.columns()).toEqual(['0', '1'])
    setGutter(16)
    flush()
    expect(writtenStyle(view.items()[1], 'width')).toBe('calc(var(--upthrust-masonry-item-width) - 16px)')
    setColumns(1)
    flush()
    expect(tops(view.items())).toEqual(['0px', '26px'])
  })
})

describe('Masonry 响应式', () => {
  // 响应式列数：取已命中断点中最宽且有定义的值；都未命中时取 xs，再退回 1。
  it('[masonry.render.responsive-columns] follows the matched breakpoint', () => {
    const view = renderMasonry({ columns: { sm: 2, lg: 4 }, items: itemsOf([['a', 10]]) })
    expect(view.root.style.gridTemplateColumns).toBe('repeat(1, minmax(0, 1fr))')
    setScreens('sm', 'md')
    expect(view.root.style.gridTemplateColumns).toBe('repeat(2, minmax(0, 1fr))')
    setScreens('sm', 'md', 'lg', 'xl')
    expect(view.root.style.gridTemplateColumns).toBe('repeat(4, minmax(0, 1fr))')
    setScreens('xs')
    expect(view.root.style.gridTemplateColumns).toBe('repeat(1, minmax(0, 1fr))')
  })

  // 响应式间距：水平 / 垂直分别解析，垂直未命中时沿用水平（antd useGutter 行为）。
  it('[masonry.render.responsive-gutter] resolves responsive gutters per axis', () => {
    const view = renderMasonry({ gutter: [{ xs: 4, md: 16 }, { lg: 'large' }], items: itemsOf([['a', 10]]) })
    setScreens('xs')
    expect([view.root.style.columnGap, view.root.style.rowGap]).toEqual(['4px', '4px'])
    setScreens('sm', 'md')
    expect([view.root.style.columnGap, view.root.style.rowGap]).toEqual(['16px', '16px'])
    setScreens('sm', 'md', 'lg')
    expect([view.root.style.columnGap, view.root.style.rowGap]).toEqual(['16px', '24px'])
  })

  // 没有 matchMedia（SSR / 旧环境）时按“全部命中”取最宽定义值。
  it('[masonry.render.no-media] uses the widest value without matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined)
    const view = renderMasonry({ columns: { xs: 1, md: 3, xl: 5 }, items: itemsOf([['a', 10]]) })
    expect(view.root.style.gridTemplateColumns).toBe('repeat(5, minmax(0, 1fr))')
  })
})

describe('Masonry 数据项', () => {
  // onLayoutChange：所有项测量完成后上报 { ...item, column }；列分配不变不重复上报。
  it('[masonry.render.layout-change] reports columns once per distinct assignment', () => {
    const onLayoutChange = vi.fn()
    const [items, setItems] = createSignal(itemsOf([['a', 30], ['b', 10]]), { ownedWrite: true })
    render(() => <Masonry columns={2} items={items()} itemRender={itemRender} onLayoutChange={onLayoutChange} />)
    expect(onLayoutChange).not.toHaveBeenCalled()
    runFrames()
    expect(onLayoutChange).toHaveBeenCalledTimes(1)
    expect(onLayoutChange).toHaveBeenLastCalledWith([
      { key: 'a', data: { label: 'A' }, column: 0 },
      { key: 'b', data: { label: 'B' }, column: 1 },
    ])
    // 新增项未测量前不上报。
    setItems([...items(), ...itemsOf([['c', 10]])])
    flush()
    expect(onLayoutChange).toHaveBeenCalledTimes(1)
    runFrames()
    expect(onLayoutChange).toHaveBeenCalledTimes(2)
    expect(onLayoutChange.mock.lastCall![0].map((item: { column: number }) => item.column)).toEqual([0, 1, 1])
  })

  // 新增项：测量前为 pending（透明、无过渡，避免从原点飞入），测量后变为 placed；已有项保持 placed。
  it('[masonry.render.pending] new items stay hidden until measured', () => {
    const [items, setItems] = createSignal(itemsOf([['a', 10]]), { ownedWrite: true })
    const view = render(() => <Masonry items={items()} itemRender={itemRender} />)
    runFrames()
    const first = view.items()[0]
    expect(classes(first)).not.toContain('opacity-0')
    setItems([...items(), ...itemsOf([['b', 10]])])
    flush()
    const [, added] = view.items()
    expect(classes(added)).toEqual(expect.arrayContaining(['absolute', 'opacity-0']))
    expect(view.items()[0]).toBe(first)
    runFrames()
    expect(classes(added)).not.toContain('opacity-0')
    expect(added.className).toContain('[transition:')
  })

  // 删除项：DOM 移除，剩余项重新排布、上报。
  it('[masonry.render.remove] removing items re-lays out the rest', () => {
    const onLayoutChange = vi.fn()
    const all = itemsOf([['a', 50], ['b', 10], ['c', 10]])
    const [items, setItems] = createSignal(all, { ownedWrite: true })
    const view = render(() => <Masonry columns={2} items={items()} itemRender={itemRender} onLayoutChange={onLayoutChange} />)
    runFrames()
    expect(view.columns()).toEqual(['0', '1', '1'])
    setItems([all[0], all[2]])
    flush()
    runFrames()
    expect(view.items().map(item => item.textContent)).toEqual(['A', 'C'])
    expect(view.columns()).toEqual(['0', '1'])
    expect(onLayoutChange.mock.lastCall![0].map((item: { key: string }) => item.key)).toEqual(['a', 'c'])
  })

  // itemRender 的 column 是响应式 getter：列变化时只更新读取处，内容节点不重建。
  it('[masonry.render.item-render-column] exposes a reactive column to itemRender', () => {
    const view = renderMasonry({
      columns: 2,
      items: itemsOf([['a', 100], ['b', 50], ['c', 10]]),
      itemRender: info => <i data-key={String(info.key)}>{`${info.data?.label}@${info.column}#${info.index}`}</i>,
    })
    runFrames()
    expect(view.items().map(item => item.textContent)).toEqual(['A@0#0', 'B@1#1', 'C@1#2'])
    const node = view.items()[2].firstElementChild
    heightOf.set('b', 300)
    observers[0].fire()
    runFrames()
    expect(view.items()[2].textContent).toBe('C@0#2')
    expect(view.items()[2].firstElementChild).toBe(node)
  })

  // item.column 固定列（超出范围取最后一列）；item.children 优先于 itemRender。
  it('[masonry.render.pinned] honours pinned columns and item children', () => {
    const items = itemsOf([['a', 10], ['b', 10], ['c', 10]], [{ column: 2 }, { column: 9 }, {}])
    items[2].children = <i data-key="c">自定义</i>
    const view = renderMasonry({ columns: 3, items })
    runFrames()
    expect(view.columns()).toEqual(['2', '2', '0'])
    expect(tops(view.items())).toEqual(['0px', '10px', '0px'])
    expect(view.items()[2].textContent).toBe('自定义')
  })

  // sequential（本库扩展）：按阅读顺序均衡分列，不看高度。
  it('[masonry.render.sequential] distributes items in reading order', () => {
    const view = renderMasonry({ columns: 2, sequential: true, items: itemsOf([['a', 500], ['b', 10], ['c', 10], ['d', 10], ['e', 10]]) })
    runFrames()
    expect(view.columns()).toEqual(['0', '0', '0', '1', '1'])
    expect(tops(view.items())).toEqual(['0px', '500px', '510px', '0px', '10px'])
  })

  // children 模式：每个子节点为一项（key 为下标），false / null 被过滤；设置 items 时忽略 children。
  it('[masonry.render.children] supports plain children and ignores them with items', () => {
    heightOf.set('x', 30)
    heightOf.set('y', 20)
    const view = render(() => (
      <Masonry columns={2}>
        <i data-key="x">X</i>
        {false}
        {null}
        <i data-key="y">Y</i>
      </Masonry>
    ))
    expect(view.items().map(item => item.textContent)).toEqual(['X', 'Y'])
    runFrames()
    expect(view.columns()).toEqual(['0', '1'])
    cleanup()

    const withItems = render(() => (
      <Masonry items={itemsOf([['a', 10]])} itemRender={itemRender}>
        <i>ignored</i>
      </Masonry>
    ))
    expect(withItems.items().map(item => item.textContent)).toEqual(['A'])
  })
})

describe('Masonry 观察与清理', () => {
  // 图片等资源在捕获阶段触发 load / error（不冒泡）时重新测量。
  it('[masonry.render.load] schedules a measurement on captured load / error', () => {
    const view = renderMasonry({ items: [{ key: 'a', children: <img data-key="a" alt="" /> }] })
    runFrames()
    heightOf.set('a', 120)
    const img = view.root.querySelector('img')!
    img.dispatchEvent(new Event('load'))
    expect(frames.size).toBe(1)
    runFrames()
    expect(view.root.style.height).toBe('120px')
    img.dispatchEvent(new Event('error'))
    expect(frames.size).toBe(1)
  })

  // fresh：共享一个观察器监听每一项；新增项同步加入，删除项移出；关闭 fresh 时断开。
  it('[masonry.render.fresh] observes each item while fresh is on', () => {
    const [fresh, setFresh] = createSignal(true, { ownedWrite: true })
    const [items, setItems] = createSignal(itemsOf([['a', 10], ['b', 10]]), { ownedWrite: true })
    const view = render(() => <Masonry fresh={fresh()} items={items()} itemRender={itemRender} />)
    runFrames()
    const itemObserver = observers.find(observer => observer.observed.has(view.items()[0]))!
    expect(itemObserver.observed.size).toBe(2)
    setItems([...items(), ...itemsOf([['c', 10]])])
    flush()
    expect(itemObserver.observed.size).toBe(3)
    setItems(items().slice(1))
    flush()
    expect(itemObserver.observed.size).toBe(2)
    runFrames()
    heightOf.set('b', 99)
    itemObserver.fire()
    runFrames()
    expect(view.root.style.height).toBe('99px')
    setFresh(false)
    flush()
    expect(itemObserver.disconnected).toBe(true)
  })

  // 默认不开 fresh：只有根节点观察器。
  it('[masonry.render.no-fresh] observes only the root by default', () => {
    const view = renderMasonry({ items: itemsOf([['a', 10]]) })
    expect(observers).toHaveLength(1)
    expect([...observers[0].observed]).toEqual([view.root])
  })

  // 卸载：取消排队中的帧、断开观察器、移除捕获监听。
  it('[masonry.render.cleanup] cancels frames and disconnects on unmount', () => {
    const view = renderMasonry({ fresh: true, items: itemsOf([['a', 10]]) })
    const remove = vi.spyOn(view.root, 'removeEventListener')
    expect(frames.size).toBe(1)
    const [frameId] = frames.keys()
    cleanup()
    cleanup = () => {}
    expect(cancelFrame).toHaveBeenCalledWith(frameId)
    expect(observers.every(observer => observer.disconnected)).toBe(true)
    expect(remove.mock.calls.map(([type, , capture]) => [type, capture])).toEqual(
      expect.arrayContaining([['load', true], ['error', true]]),
    )
  })

  // 没有 requestAnimationFrame（SSR）时保持网格回退，不报错。
  it('[masonry.render.no-raf] stays in grid mode without requestAnimationFrame', () => {
    vi.stubGlobal('requestAnimationFrame', undefined)
    const view = renderMasonry({ items: itemsOf([['a', 10]]) })
    expect(classes(view.root)).toContain('grid')
  })
})

describe('Masonry 定制', () => {
  // classNames / styles 与 class / style 合并；测量后根节点 style 仍保留，并追加 height。
  it('[masonry.render.semantic] merges semantic class names and styles', () => {
    const view = renderMasonry({
      class: 'own',
      style: { color: 'red' },
      classNames: { root: 'c-root', item: 'c-item' },
      styles: { root: { padding: '4px', color: 'blue' }, item: { 'border-radius': '8px' } },
      items: itemsOf([['a', 10]]),
    })
    expect(classes(view.root)).toEqual(expect.arrayContaining(['own', 'c-root']))
    // 组件 style 覆盖 styles.root。
    expect(view.root.style.color).toBe('red')
    expect(view.root.style.padding).toBe('4px')
    expect(classes(view.items()[0])).toContain('c-item')
    expect(view.items()[0].style.borderRadius).toBe('8px')
    runFrames()
    expect([view.root.style.color, view.root.style.padding, view.root.style.height]).toEqual(['red', '4px', '10px'])
    expect(view.items()[0].style.borderRadius).toBe('8px')
  })

  // 其余属性透传到根节点；ref 拿到根元素。
  it('[masonry.render.rest] passes attributes through and forwards ref', () => {
    let element: HTMLDivElement | undefined
    const view = renderMasonry({ id: 'wall', role: 'list', 'aria-label': '图片墙', ref: el => { element = el }, items: [] })
    expect(view.root.id).toBe('wall')
    expect(view.root.getAttribute('role')).toBe('list')
    expect(view.root.getAttribute('aria-label')).toBe('图片墙')
    expect(element).toBe(view.root)
    expect(view.items()).toHaveLength(0)
  })

  // 空列表：测量后高度为 0，不报错。
  it('[masonry.render.empty] handles an empty list', () => {
    const view = renderMasonry({ items: [] })
    runFrames()
    expect(view.root.style.height).toBe('0px')
  })
})
