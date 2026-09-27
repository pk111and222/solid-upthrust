import { For, Show, createSignal, flush } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Splitter, { Panel, type SplitterProps, type SplitterSize } from '../../../components/lib/Splitter'
import { mount } from '../../utils/mount'

let cleanup = () => {}
/** 容器的测量尺寸（offsetWidth / offsetHeight 都读它）；0 表示未布局。 */
let containerSize = 1000
beforeEach(() => {
  containerSize = 1000
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => containerSize)
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => containerSize)
})
afterEach(() => {
  cleanup()
  cleanup = () => {}
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const render = (factory: () => JSX.Element) => {
  const mounted = mount(factory)
  cleanup = mounted.dispose
  return mounted.host
}
const classes = (el: Element) => el.className.split(/\s+/).filter(Boolean)

/** 渲染 Splitter 并返回常用节点查询。 */
const renderSplitter = (props: SplitterProps, panels: () => JSX.Element) => {
  const host = render(() => <Splitter data-testid="splitter" {...props}>{panels()}</Splitter>)
  const root = host.querySelector('[data-testid="splitter"]') as HTMLElement
  return {
    host,
    root,
    panels: () => [...root.children].filter(el => el.classList.contains('upthrust-splitter-panel')) as HTMLElement[],
    bars: () => [...root.children].filter(el => el.classList.contains('upthrust-splitter-bar')) as HTMLElement[],
    draggers: () => [...root.querySelectorAll(':scope > .upthrust-splitter-bar > [role="separator"]')] as HTMLElement[],
    mask: () => root.querySelector(':scope > .upthrust-splitter-mask'),
  }
}
const basis = (panels: HTMLElement[]) => panels.map(panel => panel.style.flexBasis)

/** happy-dom 的 pageX 不由 clientX 推导，这里直接写入。 */
const pointer = (target: EventTarget, type: string, x: number, y = 0, init: PointerEventInit = {}) => {
  const event = new PointerEvent(type, { bubbles: true, cancelable: true, button: 0, pointerType: 'mouse', ...init })
  Object.defineProperty(event, 'pageX', { value: x })
  Object.defineProperty(event, 'pageY', { value: y })
  target.dispatchEvent(event)
  flush()
  return event
}
const press = (el: HTMLElement, key: string) => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  el.dispatchEvent(event)
  flush()
  return event
}
/** 完整拖拽：按下 → 移动若干次 → 松开。 */
const drag = (dragger: HTMLElement, from: number, moves: number[], axis: 'x' | 'y' = 'x') => {
  const at = (value: number) => (axis === 'x' ? [value, 0] : [0, value]) as [number, number]
  pointer(dragger, 'pointerdown', ...at(from))
  for (const move of moves) pointer(window, 'pointermove', ...at(move))
  pointer(window, 'pointerup', ...at(moves.at(-1) ?? from))
}

describe('Splitter 结构与尺寸', () => {
  // 三个面板之间插入两条分隔条；测量后 flex-basis 按 px / 百分比 / 平分补齐写入，flex-grow 为 0。
  it('[splitter.render.structure] renders panels with bars in between and sized flex-basis', () => {
    const view = renderSplitter({}, () => (
      <>
        <Panel defaultSize={200}>A</Panel>
        <Panel defaultSize="50%">B</Panel>
        <Panel>C</Panel>
      </>
    ))
    expect(classes(view.root)).toEqual(expect.arrayContaining(['upthrust-splitter', 'flex', 'flex-row']))
    expect([...view.root.children].map(el => (el.classList.contains('upthrust-splitter-bar') ? '|' : el.textContent)))
      .toEqual(['A', '|', 'B', '|', 'C'])
    expect(basis(view.panels())).toEqual(['200px', '500px', '300px'])
    expect(view.panels().map(panel => panel.style.flexGrow)).toEqual(['0', '0', '0'])
    expect(view.mask()).toBeNull()
  })

  // 测量前（容器未布局 / SSR 首帧）按原始 defaultSize 输出：百分比原样、数字补 px、未设置的用 auto + grow 铺满。
  it('[splitter.render.unmeasured] falls back to raw sizes before the container is measured', () => {
    containerSize = 0
    const view = renderSplitter({}, () => (
      <>
        <Panel defaultSize="30%">A</Panel>
        <Panel defaultSize="120">B</Panel>
        <Panel>C</Panel>
      </>
    ))
    expect(basis(view.panels())).toEqual(['30%', '120px', 'auto'])
    expect(view.panels().map(panel => panel.style.flexGrow)).toEqual(['0', '0', '1'])
  })

  // 分隔条的无障碍属性：role=separator，横向分隔条的 aria-orientation 为 vertical，数值为容器百分比。
  it('[splitter.render.aria] exposes separator semantics with percentage values', () => {
    const view = renderSplitter({}, () => (
      <>
        <Panel defaultSize={300} min={100} max="60%">A</Panel>
        <Panel>B</Panel>
      </>
    ))
    const [dragger] = view.draggers()
    expect(dragger.getAttribute('tabindex')).toBe('0')
    expect(dragger.getAttribute('aria-disabled')).toBe('false')
    expect(dragger.getAttribute('aria-orientation')).toBe('vertical')
    expect([dragger.getAttribute('aria-valuenow'), dragger.getAttribute('aria-valuemin'), dragger.getAttribute('aria-valuemax')])
      .toEqual(['30', '10', '60'])
  })

  // 纵向：flex-col、读取 offsetHeight、分隔条 aria-orientation 为 horizontal；vertical 与已废弃的 layout 同样生效。
  it.each([
    ['orientation', { orientation: 'vertical' }],
    ['vertical', { vertical: true }],
    ['layout', { layout: 'vertical' }],
  ] as const)('[splitter.render.vertical] %s switches to a vertical splitter', (_, props) => {
    const height = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => 400)
    const view = renderSplitter(props, () => (<><Panel>A</Panel><Panel>B</Panel></>))
    expect(classes(view.root)).toContain('flex-col')
    expect(basis(view.panels())).toEqual(['200px', '200px'])
    expect(view.draggers()[0].getAttribute('aria-orientation')).toBe('horizontal')
    expect(classes(view.draggers()[0])).toContain('cursor-row-resize')
    height.mockRestore()
  })

  // 容器带边框与内边距：只按内容区分配尺寸（1000 − 2×1 − 2×9 = 980），主轴外的边与纵向同理。
  it('[splitter.render.contentBox] excludes borders and padding on the main axis', () => {
    const view = renderSplitter({ style: { border: '1px solid', padding: '4px 9px' } }, () => (<><Panel>A</Panel><Panel>B</Panel></>))
    expect(basis(view.panels())).toEqual(['490px', '490px'])
    cleanup()
    const vertical = renderSplitter({ orientation: 'vertical', style: { border: '1px solid', padding: '4px 9px' } }, () => (<><Panel>A</Panel><Panel>B</Panel></>))
    expect(basis(vertical.panels())).toEqual(['495px', '495px'])
  })

  // 其余属性透传到根节点；ref 拿到根元素。
  it('[splitter.render.rest] passes other attributes through and forwards ref', () => {
    let element: HTMLDivElement | undefined
    const view = renderSplitter({ id: 'sp', 'aria-label': '工作区', ref: el => { element = el } }, () => <Panel>A</Panel>)
    expect(view.root.id).toBe('sp')
    expect(view.root.getAttribute('aria-label')).toBe('工作区')
    expect(element).toBe(view.root)
    // 单个面板没有分隔条。
    expect(view.bars()).toHaveLength(0)
  })

  // 容器尺寸变化（ResizeObserver）时重新测量；尺寸变为 0（隐藏）时保留上一次布局。
  it('[splitter.render.observe] re-measures on resize and ignores a hidden container', () => {
    let notify: ResizeObserverCallback = () => {}
    const disconnect = vi.fn()
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: ResizeObserverCallback) { notify = callback }
      observe() {}
      disconnect = disconnect
    })
    const view = renderSplitter({}, () => (<><Panel defaultSize={200}>A</Panel><Panel>B</Panel></>))
    expect(basis(view.panels())).toEqual(['200px', '800px'])
    // 未拖拽过：px 默认值保持 200，其余面板吸收变化（antd 行为）。
    containerSize = 500
    notify([], {} as ResizeObserver)
    flush()
    expect(basis(view.panels())).toEqual(['200px', '300px'])
    // 拖拽后尺寸按比例记录，再次缩放时等比缩放。
    drag(view.draggers()[0], 200, [250])
    expect(basis(view.panels())).toEqual(['250px', '250px'])
    containerSize = 800
    notify([], {} as ResizeObserver)
    flush()
    expect(basis(view.panels())).toEqual(['400px', '400px'])
    containerSize = 0
    notify([], {} as ResizeObserver)
    flush()
    expect(basis(view.panels())).toEqual(['400px', '400px'])
    cleanup()
    cleanup = () => {}
    expect(disconnect).toHaveBeenCalledTimes(1)
  })

  // 动态增删面板：分隔条数量跟随，新面板参与平分。
  it('[splitter.render.dynamic] adds and removes panels reactively', () => {
    const [count, setCount] = createSignal(2, { ownedWrite: true })
    const view = renderSplitter({}, () => (
      <For each={Array.from({ length: count() }, (_, i) => i)}>{i => <Panel>{`P${i}`}</Panel>}</For>
    ))
    expect(view.bars()).toHaveLength(1)
    setCount(4)
    flush()
    expect(view.bars()).toHaveLength(3)
    expect(basis(view.panels())).toEqual(['250px', '250px', '250px', '250px'])
    setCount(1)
    flush()
    expect(view.bars()).toHaveLength(0)
    expect(basis(view.panels())).toEqual(['1000px'])
  })
})

describe('Splitter 拖拽', () => {
  // 指针拖拽：偏移相对按下位置；过程中出现遮罩与 active 状态，回调依次触发；松开后恢复。
  it('[splitter.render.drag] resizes with pointer events on the window', () => {
    const onResizeStart = vi.fn()
    const onResize = vi.fn()
    const onResizeEnd = vi.fn()
    const view = renderSplitter({ onResizeStart, onResize, onResizeEnd }, () => (<><Panel>A</Panel><Panel>B</Panel></>))
    const [dragger] = view.draggers()

    const down = pointer(dragger, 'pointerdown', 500)
    expect(down.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(dragger)
    expect(onResizeStart).toHaveBeenCalledWith([500, 500])
    expect(view.mask()).not.toBeNull()
    expect(classes(dragger)).toContain('z-2')

    pointer(window, 'pointermove', 560)
    pointer(window, 'pointermove', 620)
    expect(basis(view.panels())).toEqual(['620px', '380px'])
    expect(onResize).toHaveBeenLastCalledWith([620, 380])
    expect(dragger.getAttribute('aria-valuenow')).toBe('62')

    pointer(window, 'pointerup', 620)
    expect(onResizeEnd).toHaveBeenCalledWith([620, 380])
    expect(view.mask()).toBeNull()
    expect(classes(dragger)).toContain('z-1')

    // 松开后窗口监听已移除，继续移动不再改变尺寸。
    pointer(window, 'pointermove', 100)
    expect(basis(view.panels())).toEqual(['620px', '380px'])
  })

  // pointercancel 与 pointerup 一样结束拖拽。
  it('[splitter.render.cancel] pointercancel ends the drag', () => {
    const onResizeEnd = vi.fn()
    const view = renderSplitter({ onResizeEnd }, () => (<><Panel>A</Panel><Panel>B</Panel></>))
    pointer(view.draggers()[0], 'pointerdown', 500)
    pointer(window, 'pointermove', 450)
    pointer(window, 'pointercancel', 450)
    expect(onResizeEnd).toHaveBeenCalledWith([450, 550])
    expect(view.mask()).toBeNull()
  })

  // 纵向拖拽读取 pageY。
  it('[splitter.render.drag-vertical] vertical drags follow pageY', () => {
    const view = renderSplitter({ orientation: 'vertical' }, () => (<><Panel>A</Panel><Panel>B</Panel></>))
    drag(view.draggers()[0], 500, [540], 'y')
    expect(basis(view.panels())).toEqual(['540px', '460px'])
  })

  // 鼠标右键 / 中键不开始拖拽。
  it('[splitter.render.secondary-button] ignores non-primary mouse buttons', () => {
    const onResizeStart = vi.fn()
    const view = renderSplitter({ onResizeStart }, () => (<><Panel>A</Panel><Panel>B</Panel></>))
    pointer(view.draggers()[0], 'pointerdown', 500, 0, { button: 2 })
    expect(onResizeStart).not.toHaveBeenCalled()
    expect(view.mask()).toBeNull()
  })

  // 撞到 min / max 时停止，另一侧吸收剩余偏移。
  it('[splitter.render.drag-limits] clamps drags into min / max', () => {
    const view = renderSplitter({}, () => (<><Panel min={100} max="70%">A</Panel><Panel>B</Panel></>))
    drag(view.draggers()[0], 500, [2000])
    expect(basis(view.panels())).toEqual(['700px', '300px'])
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1000)
    drag(view.draggers()[0], 700, [-2000])
    expect(basis(view.panels())).toEqual(['100px', '900px'])
  })

  // 延迟模式：拖拽中只移动预览线（受约束的偏移），松开后一次性应用；期间不触发 onResize。
  it('[splitter.render.lazy] previews the offset and applies it on release', () => {
    const onResize = vi.fn()
    const onResizeEnd = vi.fn()
    const view = renderSplitter({ lazy: true, onResize, onResizeEnd }, () => (<><Panel>A</Panel><Panel max={600}>B</Panel></>))
    const [bar] = view.bars()
    pointer(view.draggers()[0], 'pointerdown', 500)
    pointer(window, 'pointermove', 300)
    expect(basis(view.panels())).toEqual(['500px', '500px'])
    // 超出 B 的 max 600：预览偏移被夹到 -100。
    const preview = bar.querySelector('.upthrust-splitter-preview') as HTMLElement
    expect(preview.style.transform).toBe('translate3d(-100px, 0, 0)')
    pointer(window, 'pointerup', 300)
    expect(basis(view.panels())).toEqual(['400px', '600px'])
    expect(onResize).not.toHaveBeenCalled()
    expect(onResizeEnd).toHaveBeenCalledWith([400, 600])
    expect(bar.querySelector('.upthrust-splitter-preview')).toBeNull()
  })

  // 延迟模式纵向预览沿 Y 轴平移。
  it('[splitter.render.lazy-vertical] vertical lazy preview translates on Y', () => {
    const view = renderSplitter({ lazy: true, vertical: true }, () => (<><Panel>A</Panel><Panel>B</Panel></>))
    pointer(view.draggers()[0], 'pointerdown', 0, 500)
    pointer(window, 'pointermove', 0, 530)
    const preview = view.bars()[0].querySelector('.upthrust-splitter-preview') as HTMLElement
    expect(preview.style.transform).toBe('translate3d(0, 30px, 0)')
    pointer(window, 'pointerup', 0, 530)
    expect(basis(view.panels())).toEqual(['530px', '470px'])
  })

  // 不可调整：相邻面板 resizable=false 时分隔条禁用，不可聚焦、不可拖拽、不响应键盘。
  it('[splitter.render.disabled] disables bars next to a non-resizable panel', () => {
    const onResizeStart = vi.fn()
    const view = renderSplitter({ onResizeStart }, () => (<><Panel>A</Panel><Panel resizable={false}>B</Panel></>))
    const [dragger] = view.draggers()
    expect(dragger.getAttribute('tabindex')).toBe('-1')
    expect(dragger.getAttribute('aria-disabled')).toBe('true')
    expect(classes(dragger)).toEqual(expect.arrayContaining(['cursor-default', 'after:hidden']))
    const down = pointer(dragger, 'pointerdown', 500)
    expect(down.defaultPrevented).toBe(false)
    expect(press(dragger, 'ArrowRight').defaultPrevented).toBe(false)
    expect(onResizeStart).not.toHaveBeenCalled()
    expect(view.mask()).toBeNull()
  })

  // 双击分隔条触发 onDraggerDoubleClick(index)；300ms 内的第二次按下不会开始新的拖拽。
  it('[splitter.render.double-click] reports double clicks and skips the second press', () => {
    const onDraggerDoubleClick = vi.fn()
    const onResizeStart = vi.fn()
    const view = renderSplitter({ onDraggerDoubleClick, onResizeStart }, () => (
      <><Panel>A</Panel><Panel>B</Panel><Panel>C</Panel></>
    ))
    const second = view.draggers()[1]
    const now = vi.spyOn(Date, 'now').mockReturnValue(10_000)
    pointer(second, 'pointerdown', 600)
    pointer(window, 'pointerup', 600)
    now.mockReturnValue(10_150)
    pointer(second, 'pointerdown', 600)
    expect(onResizeStart).toHaveBeenCalledTimes(1)
    expect(view.mask()).toBeNull()
    second.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
    expect(onDraggerDoubleClick).toHaveBeenCalledWith(1)
  })

  // 拖拽中卸载组件：窗口监听随之移除，不留下泄漏。
  it('[splitter.render.unmount-during-drag] removes window listeners when unmounted mid-drag', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const view = renderSplitter({}, () => (<><Panel>A</Panel><Panel>B</Panel></>))
    pointer(view.draggers()[0], 'pointerdown', 500)
    cleanup()
    cleanup = () => {}
    const removed = remove.mock.calls.map(([type]) => type)
    expect(removed).toEqual(expect.arrayContaining(['pointermove', 'pointerup', 'pointercancel']))
  })

  // 受控 size：拖拽只触发回调不改 DOM，外部更新 size 后才生效。
  it('[splitter.render.controlled] controlled sizes wait for the prop', () => {
    const [size, setSize] = createSignal<SplitterSize>(300, { ownedWrite: true })
    const onResize = vi.fn()
    const view = renderSplitter({ onResize }, () => (<><Panel size={size()}>A</Panel><Panel>B</Panel></>))
    expect(basis(view.panels())).toEqual(['300px', '700px'])
    drag(view.draggers()[0], 300, [400])
    expect(onResize).toHaveBeenLastCalledWith([400, 600])
    expect(basis(view.panels())).toEqual(['300px', '700px'])
    setSize('40%')
    flush()
    expect(basis(view.panels())).toEqual(['400px', '600px'])
  })
})

describe('Splitter 键盘', () => {
  // 方向键按 keyboardStep 调整并阻止默认滚动；Home / End 到极限；无关按键不拦截。
  it('[splitter.render.keyboard] resizes with arrow keys, Home and End', () => {
    const onResizeEnd = vi.fn()
    const view = renderSplitter({ keyboardStep: 50, onResizeEnd }, () => (<><Panel min={100}>A</Panel><Panel>B</Panel></>))
    const [dragger] = view.draggers()
    expect(press(dragger, 'ArrowRight').defaultPrevented).toBe(true)
    expect(basis(view.panels())).toEqual(['550px', '450px'])
    expect(onResizeEnd).toHaveBeenLastCalledWith([550, 450])
    press(dragger, 'ArrowLeft')
    press(dragger, 'ArrowLeft')
    expect(basis(view.panels())).toEqual(['450px', '550px'])
    press(dragger, 'Home')
    expect(basis(view.panels())).toEqual(['100px', '900px'])
    press(dragger, 'End')
    expect(basis(view.panels())).toEqual(['1000px', '0px'])
    expect(press(dragger, 'Tab').defaultPrevented).toBe(false)
  })

  // 纵向时只响应上下方向键。
  it('[splitter.render.keyboard-vertical] vertical splitters use ArrowUp / ArrowDown', () => {
    const view = renderSplitter({ orientation: 'vertical' }, () => (<><Panel>A</Panel><Panel>B</Panel></>))
    const [dragger] = view.draggers()
    expect(press(dragger, 'ArrowRight').defaultPrevented).toBe(false)
    expect(press(dragger, 'ArrowDown').defaultPrevented).toBe(true)
    expect(basis(view.panels())).toEqual(['516px', '484px'])
  })
})

describe('Splitter 折叠', () => {
  const buttons = (bar: HTMLElement) => [...bar.querySelectorAll('[role="button"]')] as HTMLElement[]

  // 折叠按钮：点击向起始侧折叠，再点另一侧展开恢复原尺寸；onCollapse 给出每个面板的折叠状态。
  it('[splitter.render.collapse] collapses and restores with the collapse buttons', () => {
    const onCollapse = vi.fn()
    const view = renderSplitter({ onCollapse }, () => (
      <><Panel defaultSize={300} collapsible>A</Panel><Panel collapsible>B</Panel></>
    ))
    const [bar] = view.bars()
    expect(buttons(bar).map(button => button.getAttribute('aria-label'))).toEqual(['切换起始侧面板', '切换末尾侧面板'])
    expect(buttons(bar).map(button => button.getAttribute('tabindex'))).toEqual(['0', '0'])

    buttons(bar)[0].click()
    flush()
    expect(basis(view.panels())).toEqual(['0px', '1000px'])
    expect(onCollapse).toHaveBeenLastCalledWith([true, false], [0, 1000])
    expect(classes(view.panels()[0])).toContain('overflow-hidden')
    // 已折叠到 0：只剩“展开”按钮。
    expect(buttons(bar)).toHaveLength(1)

    buttons(bar)[0].click()
    flush()
    expect(basis(view.panels())).toEqual(['300px', '700px'])
    expect(onCollapse).toHaveBeenLastCalledWith([false, false], [300, 700])
  })

  // 折叠按钮支持 Enter / 空格，并阻止空格的默认滚动。
  it('[splitter.render.collapse-keyboard] collapse buttons respond to Enter and Space', () => {
    const view = renderSplitter({}, () => (<><Panel>A</Panel><Panel collapsible>B</Panel></>))
    const [bar] = view.bars()
    // 只有 B 可折叠：B 在分隔条末尾侧 → 只有向末尾折叠（end）按钮。
    expect(buttons(bar).map(button => button.getAttribute('aria-label'))).toEqual(['切换末尾侧面板'])
    expect(press(buttons(bar)[0], ' ').defaultPrevented).toBe(true)
    expect(basis(view.panels())).toEqual(['1000px', '0px'])
    press(buttons(bar)[0], 'Enter')
    expect(basis(view.panels())).toEqual(['500px', '500px'])
  })

  // 按钮显示方式：默认 auto（悬停显示），true 常显，false 不显示。
  it.each([
    [undefined, 'opacity-0'],
    [true, 'opacity-100'],
    [false, 'hidden'],
  ] as const)('[splitter.render.collapse-visibility] showCollapsibleIcon=%s → %s', (mode, expected) => {
    const view = renderSplitter({}, () => (
      <><Panel collapsible={{ end: true, showCollapsibleIcon: mode }}>A</Panel><Panel>B</Panel></>
    ))
    const [button] = buttons(view.bars()[0])
    expect(classes(button)).toContain(expected)
  })

  // 默认图标按方向与位置变化；自定义图标替换默认图标并去掉按钮背景（collapsibleIcon 为已废弃的等价写法）。
  it('[splitter.render.collapse-icon] uses directional icons or custom ones', () => {
    const view = renderSplitter({ vertical: true }, () => (<><Panel collapsible>A</Panel><Panel collapsible>B</Panel></>))
    const icons = buttons(view.bars()[0]).map(button => button.querySelector('span')?.className)
    expect(icons).toEqual(['i-mdi-chevron-up', 'i-mdi-chevron-down'])
    cleanup()

    for (const props of [
      { collapsible: { icon: { start: <b>S</b>, end: <b>E</b> } } },
      { collapsibleIcon: { start: <b>S</b>, end: <b>E</b> } },
    ] satisfies SplitterProps[]) {
      const custom = renderSplitter(props, () => (<><Panel collapsible>A</Panel><Panel collapsible>B</Panel></>))
      const list = buttons(custom.bars()[0])
      expect(list.map(button => button.textContent)).toEqual(['S', 'E'])
      expect(classes(list[0])).toContain('bg-transparent')
      expect(list[0].querySelector('[class^="i-mdi"]')).toBeNull()
      cleanup()
    }
    cleanup = () => {}
  })

  // collapsible.motion：非拖拽时面板带 flex-basis 过渡，拖拽中关闭（否则面板追着指针缓动）。
  it('[splitter.render.motion] animates collapse but not drags', () => {
    const view = renderSplitter({ collapsible: { motion: true } }, () => (<><Panel collapsible>A</Panel><Panel>B</Panel></>))
    const hasMotion = () => view.panels().every(panel => panel.className.includes('[transition:flex-basis'))
    expect(hasMotion()).toBe(true)
    pointer(view.draggers()[0], 'pointerdown', 500)
    expect(view.panels().some(panel => panel.className.includes('[transition:flex-basis'))).toBe(false)
    pointer(window, 'pointerup', 500)
    expect(hasMotion()).toBe(true)
  })

  // destroyOnHidden：折叠后卸载内容，展开后重新挂载；面板自身设置优先于 Splitter。
  it('[splitter.render.destroy-on-hidden] unmounts collapsed content', () => {
    const view = renderSplitter({ destroyOnHidden: true }, () => (
      <>
        <Panel collapsible><i data-testid="a">A</i></Panel>
        <Panel collapsible destroyOnHidden={false}><i data-testid="b">B</i></Panel>
      </>
    ))
    const [bar] = view.bars()
    buttons(bar)[0].click()
    flush()
    expect(view.root.querySelector('[data-testid="a"]')).toBeNull()
    buttons(bar)[0].click()
    flush()
    expect(view.root.querySelector('[data-testid="a"]')).not.toBeNull()
    // B 折叠时仍保留内容。
    buttons(bar)[1].click()
    flush()
    expect(basis(view.panels())).toEqual(['1000px', '0px'])
    expect(view.root.querySelector('[data-testid="b"]')).not.toBeNull()
  })

  // 默认不卸载：折叠的面板保留内容，只是尺寸为 0。
  it('[splitter.render.keep-hidden] keeps collapsed content by default', () => {
    const view = renderSplitter({}, () => (<><Panel defaultSize={0}><i data-testid="a">A</i></Panel><Panel>B</Panel></>))
    expect(basis(view.panels())).toEqual(['0px', '1000px'])
    expect(view.root.querySelector('[data-testid="a"]')).not.toBeNull()
  })
})

describe('Splitter 定制与组合', () => {
  // classNames / styles：root、panel、dragger 的 default / active 分别合并，active 只在拖拽中追加。
  it('[splitter.render.semantic] merges semantic class names and styles', () => {
    const view = renderSplitter({
      class: 'own',
      style: { 'min-height': '100px' },
      classNames: { root: 'c-root', panel: 'c-panel', dragger: { default: 'c-drag', active: 'c-active' } },
      styles: {
        root: { color: 'red' },
        panel: { padding: '4px' },
        dragger: { default: { 'background-color': 'blue' }, active: { 'background-color': 'green' } },
      },
    }, () => (<><Panel class="p-own" style={{ padding: '8px' }}>A</Panel><Panel>B</Panel></>))
    expect(classes(view.root)).toEqual(expect.arrayContaining(['own', 'c-root']))
    expect(view.root.style.color).toBe('red')
    expect(view.root.style.minHeight).toBe('100px')
    const [first, second] = view.panels()
    expect(classes(first)).toEqual(expect.arrayContaining(['c-panel', 'p-own']))
    // 面板自身 style 覆盖 styles.panel。
    expect(first.style.padding).toBe('8px')
    expect(second.style.padding).toBe('4px')

    const [dragger] = view.draggers()
    expect(classes(dragger)).toContain('c-drag')
    expect(classes(dragger)).not.toContain('c-active')
    expect(dragger.style.backgroundColor).toBe('blue')
    pointer(dragger, 'pointerdown', 500)
    expect(classes(dragger)).toEqual(expect.arrayContaining(['c-drag', 'c-active']))
    expect(dragger.style.backgroundColor).toBe('green')
    pointer(window, 'pointerup', 500)
  })

  // classNames.dragger 传字符串等同 { default }。
  it('[splitter.render.dragger-string] accepts a string dragger class name', () => {
    const view = renderSplitter({ classNames: { dragger: 'c-drag' } }, () => (<><Panel>A</Panel><Panel>B</Panel></>))
    expect(classes(view.draggers()[0])).toContain('c-drag')
  })

  // 自定义拖拽图标：渲染在分隔条中央并隐藏默认抓手；拖拽中切换为主色。
  it('[splitter.render.dragger-icon] renders a custom dragger icon', () => {
    const view = renderSplitter({ draggerIcon: <b data-testid="grip">⋮</b> }, () => (<><Panel>A</Panel><Panel>B</Panel></>))
    const [dragger] = view.draggers()
    const icon = dragger.querySelector('.upthrust-splitter-dragger-icon') as HTMLElement
    expect(icon.querySelector('[data-testid="grip"]')).not.toBeNull()
    expect(classes(dragger)).toContain('after:hidden')
    expect(classes(icon)).toContain('text-on-surface/15')
    pointer(dragger, 'pointerdown', 500)
    expect(classes(icon)).toContain('text-primary')
    pointer(window, 'pointerup', 500)
  })

  // Panel 的其余属性透传到面板节点。
  it('[splitter.render.panel-rest] passes panel attributes through', () => {
    const view = renderSplitter({}, () => (<><Panel id="left" data-kind="nav" aria-label="导航">A</Panel><Panel>B</Panel></>))
    const [first] = view.panels()
    expect(first.id).toBe('left')
    expect(first.dataset.kind).toBe('nav')
    expect(first.getAttribute('aria-label')).toBe('导航')
  })

  // Splitter 之外单独使用的 Panel 渲染为普通滚动块；面板内容里的 Panel 同样不会被当作外层的面板。
  it('[splitter.render.standalone] renders Panel as a plain block outside a splitter', () => {
    const host = render(() => <Panel id="alone" class="x" defaultSize={200}>独立</Panel>)
    const alone = host.querySelector('#alone') as HTMLElement
    expect(alone.textContent).toBe('独立')
    expect(classes(alone)).toEqual(expect.arrayContaining(['upthrust-splitter-panel', 'overflow-auto', 'x']))
    expect(alone.style.flexBasis).toBe('')
    cleanup()

    const view = renderSplitter({}, () => (
      <>
        <Panel><Panel id="inner">内部</Panel></Panel>
        <Panel>B</Panel>
      </>
    ))
    expect(view.panels()).toHaveLength(2)
    expect(view.root.querySelector('#inner')?.textContent).toBe('内部')
  })

  // 嵌套：内层 Splitter 在外层面板中独立工作，各自的分隔条互不干扰。
  it('[splitter.render.nested] nested splitters work independently', () => {
    const view = renderSplitter({}, () => (
      <>
        <Panel defaultSize="40%">A</Panel>
        <Panel>
          <Splitter vertical data-testid="inner">
            <Panel>B1</Panel>
            <Panel>B2</Panel>
            <Panel>B3</Panel>
          </Splitter>
        </Panel>
      </>
    ))
    const inner = view.root.querySelector('[data-testid="inner"]') as HTMLElement
    expect(view.bars()).toHaveLength(1)
    expect(inner.querySelectorAll(':scope > .upthrust-splitter-bar')).toHaveLength(2)
    expect(view.root.querySelectorAll('[role="separator"]')).toHaveLength(3)
    expect(basis(view.panels())).toEqual(['400px', '600px'])

    const innerDragger = inner.querySelector(':scope > .upthrust-splitter-bar > [role="separator"]') as HTMLElement
    const innerPanels = [...inner.children].filter(el => el.classList.contains('upthrust-splitter-panel')) as HTMLElement[]
    press(innerDragger, 'ArrowDown')
    expect(innerPanels[0].style.flexBasis).not.toBe(innerPanels[1].style.flexBasis)
    // 外层不受影响。
    expect(basis(view.panels())).toEqual(['400px', '600px'])
  })

  // 条件渲染的 Panel：切换后面板与分隔条同步增删。
  it('[splitter.render.conditional] conditional panels toggle bars', () => {
    const [show, setShow] = createSignal(true, { ownedWrite: true })
    const view = renderSplitter({}, () => (
      <>
        <Panel>A</Panel>
        <Show when={show()}><Panel>B</Panel></Show>
        <Panel>C</Panel>
      </>
    ))
    expect(view.panels().map(panel => panel.textContent)).toEqual(['A', 'B', 'C'])
    setShow(false)
    flush()
    expect(view.panels().map(panel => panel.textContent)).toEqual(['A', 'C'])
    expect(view.bars()).toHaveLength(1)
  })
})
