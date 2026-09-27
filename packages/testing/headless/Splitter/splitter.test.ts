import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  autoSplitterSizes, createSplitter, normalizeCollapsible, resolveSplitterOrientation, resolveSplitterSize, splitterSplits,
  type SplitterConfig, type SplitterPanelConfig,
} from '../../../competence/src/splitter'

let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })

/** 在独立 owner 里创建 splitter；测试结束统一释放。 */
const setup = (config: SplitterConfig = {}, container?: number) => createRoot((release) => {
  dispose = release
  const splitter = createSplitter(config)
  if (container !== undefined) splitter.setContainerSize(container)
  flush()
  return splitter
})

const registerPanels = (splitter: ReturnType<typeof createSplitter>, panels: SplitterPanelConfig[]) => {
  const handles = panels.map((panel) => splitter.register(panel))
  flush()
  return handles
}

describe('Splitter 纯函数', () => {
  // 方向优先级：orientation > vertical(boolean) > 已废弃的 layout > 默认 horizontal；非法值忽略。
  it('[splitter.fn.orientation] orientation wins over vertical, then layout', () => {
    expect(resolveSplitterOrientation('vertical', false, 'horizontal')).toBe('vertical')
    expect(resolveSplitterOrientation(undefined, true)).toBe('vertical')
    expect(resolveSplitterOrientation(undefined, false, 'vertical')).toBe('horizontal')
    expect(resolveSplitterOrientation(undefined, undefined, 'vertical')).toBe('vertical')
    expect(resolveSplitterOrientation()).toBe('horizontal')
    expect(resolveSplitterOrientation('diagonal' as never)).toBe('horizontal')
  })

  // 尺寸解析：数字与纯数字字符串按 px，百分比按容器，空串 / 非法 / NaN 视为未设置。
  it('[splitter.fn.size] resolves px, numeric strings and percentages', () => {
    expect(resolveSplitterSize(240, 1000)).toBe(240)
    expect(resolveSplitterSize('240', 1000)).toBe(240)
    expect(resolveSplitterSize('30%', 1000)).toBe(300)
    expect(resolveSplitterSize(' 25% ', 400)).toBe(100)
    for (const invalid of ['%', 'abc', '', Number.NaN, undefined, null]) {
      expect(resolveSplitterSize(invalid as never, 1000)).toBeUndefined()
    }
  })

  // collapsible 归一：true 表示双向；对象保留各自开关；按钮显示方式默认 'auto'。
  it('[splitter.fn.collapsible] normalizes boolean and object forms', () => {
    expect(normalizeCollapsible(true)).toEqual({ start: true, end: true, showCollapsibleIcon: 'auto' })
    expect(normalizeCollapsible(undefined)).toEqual({ start: false, end: false, showCollapsibleIcon: 'auto' })
    expect(normalizeCollapsible({ start: true, showCollapsibleIcon: true }))
      .toEqual({ start: true, end: false, showCollapsibleIcon: true })
  })

  // 自动补齐：未设置的面板平分剩余；全部设置时按比例缩放；全为 0 时平分；已溢出时未设置者为 0。
  it('[splitter.fn.auto] fills, scales and splits sizes like antd autoPtgSizes', () => {
    expect(autoSplitterSizes([200, undefined], [], [], 1000)).toEqual([200, 800])
    expect(autoSplitterSizes([100, 300], [], [], 800)).toEqual([200, 600])
    expect(autoSplitterSizes([0, 0], [], [], 600)).toEqual([300, 300])
    expect(autoSplitterSizes([600, 600, undefined], [], [], 1000)).toEqual([500, 500, 0])
  })

  // 平分会越过某个自由面板的 max 时，改为按顺序贪心填充（先满足 min，再填到 max）。
  it('[splitter.fn.auto-greedy] fills free panels greedily when an even share breaks a limit', () => {
    expect(autoSplitterSizes([undefined, undefined], [0, 0], [200, undefined], 1000)).toEqual([200, 800])
  })

  // 本库比 antd 多一步：已设置的尺寸也会被夹进自身 min/max，多出的空间交给仍有余量的面板。
  it('[splitter.fn.auto-fit] clamps defined sizes into their own limits', () => {
    expect(autoSplitterSizes([900, undefined], [undefined, undefined], [600, undefined], 1000)).toEqual([600, 400])
  })

  // splitterSplits 覆盖配置的全部键，供 UI 层 omit。
  it('[splitter.fn.splits] lists every config key', () => {
    expect([...splitterSplits].sort()).toEqual([
      'items', 'keyboardStep', 'layout', 'onCollapse', 'onResize', 'onResizeEnd', 'onResizeStart', 'orientation', 'vertical',
    ])
  })
})

describe('createSplitter 尺寸', () => {
  // px 与百分比混用：200 + 50% 后剩余给未设置的面板；测量前 sizes 为空。
  it('[splitter.size.mixed] normalizes mixed px / percent defaultSize against the container', () => {
    const splitter = setup()
    registerPanels(splitter, [{ defaultSize: 200 }, { defaultSize: '50%' }, {}])
    expect(splitter.sizes()).toEqual([])
    splitter.setContainerSize(1000)
    flush()
    expect(splitter.sizes()).toEqual([200, 500, 300])
  })

  // 都未设置尺寸时平分容器。
  it('[splitter.size.even] splits evenly when no defaultSize is given', () => {
    const splitter = setup({}, 800)
    registerPanels(splitter, [{}, {}])
    expect(splitter.sizes()).toEqual([400, 400])
  })

  // 测量前 panelSizes 输出原始 size ?? defaultSize（供 SSR 做 flex-basis）；容器尺寸 <= 0 被忽略。
  it('[splitter.size.unmeasured] exposes raw sizes before measuring and ignores a hidden container', () => {
    const splitter = setup({ items: [{ defaultSize: '30%' }, { defaultSize: 200 }, {}] })
    expect(splitter.panelSizes()).toEqual(['30%', 200, undefined])
    splitter.setContainerSize(1000)
    flush()
    splitter.setContainerSize(0)
    flush()
    expect(splitter.containerSize()).toBe(1000)
    expect(splitter.panelSizes()).toEqual([300, 200, 500])
  })

  // 受控：任一面板设置 size 时全部面板受控（defaultSize 失效），拖拽只通知不改尺寸，更新 size 后才生效。
  it('[splitter.size.controlled] controlled size ignores defaultSize and waits for the prop', () => {
    const [size, setSize] = createSignal<number>(300, { ownedWrite: true })
    const onResize = vi.fn()
    const items: SplitterPanelConfig[] = [{ get size() { return size() } }, { defaultSize: 100 }, {}]
    const splitter = setup({ items, onResize }, 1000)
    expect(splitter.sizes()).toEqual([300, 350, 350])

    splitter.resizeBy(0, 100)
    flush()
    expect(onResize).toHaveBeenLastCalledWith([400, 250, 350])
    expect(splitter.sizes()).toEqual([300, 350, 350])

    setSize(400)
    flush()
    expect(splitter.sizes()).toEqual([400, 300, 300])
  })

  // 拖拽后的尺寸按 items 条目引用记忆：调整顺序后尺寸跟随条目。
  it('[splitter.size.remember] remembers dragged sizes per item reference', () => {
    const a: SplitterPanelConfig = {}
    const b: SplitterPanelConfig = {}
    const c: SplitterPanelConfig = {}
    const [items, setItems] = createSignal<SplitterPanelConfig[]>([a, b, c], { ownedWrite: true })
    const splitter = setup({ get items() { return items() } }, 900)
    splitter.resizeBy(0, 100)
    flush()
    expect(splitter.sizes()).toEqual([400, 200, 300])

    setItems([c, a, b])
    flush()
    expect(splitter.sizes()).toEqual([300, 400, 200])
  })

  // 每次读取都重新创建的字面量条目无法按引用匹配，退回按位置记忆，连续拖拽仍能累积。
  it('[splitter.size.inline-items] falls back to positions for recreated inline entries', () => {
    const splitter = setup({ get items() { return [{}, {}] } }, 1000)
    splitter.resizeBy(0, 100)
    flush()
    splitter.resizeBy(0, 100)
    flush()
    expect(splitter.sizes()).toEqual([700, 300])
  })

  // 注销面板后剩余面板重新归一；已注销句柄的 index 为 -1。
  it('[splitter.size.unregister] unregisters panels and re-normalizes the remaining set', () => {
    const splitter = setup({}, 900)
    const handles = registerPanels(splitter, [{ defaultSize: 200 }, {}, {}])
    expect(splitter.sizes()).toHaveLength(3)
    handles[0].dispose()
    flush()
    expect(splitter.sizes()).toEqual([450, 450])
    expect(handles[0].index()).toBe(-1)
  })

  // 容器尺寸变化时按比例缩放已拖拽的尺寸。
  it('[splitter.size.rescale] rescales proportionally when the container resizes', () => {
    const splitter = setup({}, 1000)
    registerPanels(splitter, [{}, {}])
    splitter.resizeBy(0, 200)
    flush()
    splitter.setContainerSize(500)
    flush()
    expect(splitter.sizes()).toEqual([350, 150])
  })
})

describe('createSplitter 拖拽', () => {
  // resizeBy 随机 500 次增量：相邻两面板之和严格守恒。
  it('[splitter.drag.conserve] keeps the pair sum strictly constant while dragging (500 random deltas)', () => {
    const splitter = setup({}, 1000)
    registerPanels(splitter, [{ min: 50 }, { max: '80%' }])
    let seed = 42
    const random = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648
      return seed / 2147483648
    }
    let lastSum = splitter.sizes().reduce((s, v) => s + v, 0)
    for (let i = 0; i < 500; i++) {
      splitter.resizeBy(0, (random() - 0.5) * 400)
      flush()
      const total = splitter.sizes().reduce((s, v) => s + v, 0)
      expect(Math.abs(total - lastSum)).toBeLessThan(1e-6)
      lastSum = total
    }
  })

  // 撞到 min 时停止，相邻面板吸收其余偏移。
  it('[splitter.drag.clamp] clamps to min and max constraints and compensates the neighbor', () => {
    const splitter = setup({}, 1000)
    registerPanels(splitter, [{ min: 200 }, { min: 100 }])
    expect(splitter.resizeBy(0, -1000)).toBe(true)
    flush()
    expect(splitter.sizes()).toEqual([200, 800])
    expect(splitter.resizeBy(0, 1000)).toBe(true)
    flush()
    expect(splitter.sizes()).toEqual([900, 100])
    // 已经顶到边界时再拖不产生变化。
    expect(splitter.resizeBy(0, 50)).toBe(false)
  })

  // 极端偏移扫描：任何时刻都不违反 min / max，且总和不变。
  it('[splitter.drag.extreme] never violates min/max, even under extreme deltas', () => {
    const splitter = setup({}, 1000)
    registerPanels(splitter, [{ min: 100, max: 400 }, { min: 100 }])
    for (let delta = -2000; delta <= 2000; delta += 97) {
      splitter.resizeBy(0, delta)
      flush()
      const [a, b] = splitter.sizes()
      expect(a).toBeGreaterThanOrEqual(100)
      expect(a).toBeLessThanOrEqual(400)
      expect(b).toBeGreaterThanOrEqual(100)
      expect(a + b).toBeCloseTo(1000, 6)
    }
  })

  // 拖拽会话：updateResize 的偏移相对按下位置（非增量）；开始 / 结束回调与 movingIndex 成对。
  it('[splitter.drag.session] offsets are measured from the drag start', () => {
    const onResizeStart = vi.fn()
    const onResizeEnd = vi.fn()
    const splitter = setup({ items: [{}, {}], onResizeStart, onResizeEnd }, 1000)
    expect(splitter.startResize(0)).toBe(true)
    flush()
    expect(onResizeStart).toHaveBeenCalledWith([500, 500])
    expect(splitter.movingIndex()).toBe(0)
    expect(splitter.updateResize(0, 50)).toEqual([550, 450])
    expect(splitter.updateResize(0, 80)).toEqual([580, 420])
    splitter.endResize()
    flush()
    expect(onResizeEnd).toHaveBeenCalledWith([580, 420])
    expect(splitter.movingIndex()).toBeUndefined()
    expect(splitter.sizes()).toEqual([580, 420])
  })

  // 延迟模式：拖拽中不提交，endResize(offset) 一次性应用，只触发 onResizeEnd 不触发 onResize。
  it('[splitter.drag.lazy] applies the lazy offset once on release', () => {
    const onResize = vi.fn()
    const onResizeEnd = vi.fn()
    const splitter = setup({ items: [{}, {}], onResize, onResizeEnd }, 1000)
    splitter.startResize(0)
    splitter.endResize(120)
    flush()
    expect(splitter.sizes()).toEqual([620, 380])
    expect(onResize).not.toHaveBeenCalled()
    expect(onResizeEnd).toHaveBeenCalledWith([620, 380])
  })

  // 延迟模式的预览偏移被夹在分隔条实际可移动的范围内。
  it('[splitter.drag.constrain] clamps a raw offset to the movable range', () => {
    const splitter = setup({ items: [{ min: 100 }, { min: 200 }] }, 1000)
    expect(splitter.constrainOffset(0, 1000)).toBe(300)
    expect(splitter.constrainOffset(0, -1000)).toBe(-400)
    expect(splitter.constrainOffset(0, 50)).toBe(50)
  })

  // 相邻面板不可调整时分隔条禁用：startResize / keyboardResize 返回 false，不触发 onResizeStart。
  it('[splitter.drag.disabled] refuses to start on a disabled bar', () => {
    const onResizeStart = vi.fn()
    const splitter = setup({ onResizeStart }, 900)
    registerPanels(splitter, [{}, { resizable: false }, {}])
    expect(splitter.isBarDisabled(0)).toBe(true)
    expect(splitter.isBarDisabled(1)).toBe(true)
    expect(splitter.startResize(0)).toBe(false)
    expect(splitter.keyboardResize(1, 'ArrowRight')).toBe(false)
    flush()
    expect(splitter.movingIndex()).toBeUndefined()
    expect(onResizeStart).not.toHaveBeenCalled()
  })

  // 两条分隔条重合（中间面板为 0）时向后拖动的是前面仍有尺寸的那一条（antd 的方向确认）。
  it('[splitter.drag.stacked] dragging backward from stacked bars moves the earlier bar', () => {
    const splitter = setup({ items: [{ defaultSize: 300 }, { defaultSize: 0 }, {}] }, 900)
    expect(splitter.sizes()).toEqual([300, 0, 600])
    splitter.startResize(1)
    expect(splitter.updateResize(1, -100)).toEqual([200, 100, 600])
    flush()
    expect(splitter.movingIndex()).toBe(0)
    splitter.endResize()
    flush()
    // 向前拖动则移动按下的那一条。
    splitter.startResize(1)
    expect(splitter.updateResize(1, 100)).toEqual([200, 200, 500])
    splitter.endResize()
  })
})

describe('createSplitter 键盘', () => {
  // 横向：左右方向键按步长移动，Home / End 移到极限；其它键不处理。
  it('[splitter.keyboard.horizontal] steps with the keyboard and jumps to min/max with Home/End', () => {
    const splitter = setup({ keyboardStep: 16 }, 1000)
    registerPanels(splitter, [{ min: 100 }, {}])
    expect(splitter.keyboardResize(0, 'ArrowRight')).toBe(true)
    flush()
    expect(splitter.sizes()[0]).toBe(516)
    expect(splitter.keyboardResize(0, 'ArrowLeft')).toBe(true)
    flush()
    expect(splitter.sizes()[0]).toBe(500)
    expect(splitter.keyboardResize(0, 'Home')).toBe(true)
    flush()
    expect(splitter.sizes()[0]).toBe(100)
    expect(splitter.keyboardResize(0, 'End')).toBe(true)
    flush()
    expect(splitter.sizes()).toEqual([1000, 0])
    expect(splitter.keyboardResize(0, 'Enter')).toBe(false)
  })

  // 纵向：上下方向键生效，左右方向键不处理；默认步长 16；一次按键触发完整的开始 / 变化 / 结束回调。
  it('[splitter.keyboard.vertical] uses ArrowUp / ArrowDown when vertical', () => {
    const onResizeStart = vi.fn()
    const onResize = vi.fn()
    const onResizeEnd = vi.fn()
    const splitter = setup({ orientation: 'vertical', items: [{}, {}], onResizeStart, onResize, onResizeEnd }, 400)
    expect(splitter.keyboardResize(0, 'ArrowRight')).toBe(false)
    expect(splitter.keyboardResize(0, 'ArrowDown')).toBe(true)
    flush()
    expect(splitter.sizes()).toEqual([216, 184])
    expect(onResizeStart).toHaveBeenCalledWith([200, 200])
    expect(onResize).toHaveBeenCalledWith([216, 184])
    expect(onResizeEnd).toHaveBeenCalledWith([216, 184])
    expect(splitter.keyboardResize(0, 'ArrowUp')).toBe(true)
    flush()
    expect(splitter.sizes()).toEqual([200, 200])
  })

  // 没有拖拽会话时直接 endResize 也会以当前尺寸触发 onResizeEnd；resizeBy 只触发 onResize。
  it('[splitter.keyboard.callbacks] fires onResize during resizeBy and onResizeEnd on release', () => {
    const onResize = vi.fn()
    const onResizeEnd = vi.fn()
    const splitter = setup({ onResize, onResizeEnd }, 600)
    registerPanels(splitter, [{}, {}])
    splitter.resizeBy(0, 50)
    flush()
    expect(onResize).toHaveBeenCalledWith([350, 250])
    expect(onResizeEnd).not.toHaveBeenCalled()
    splitter.endResize()
    expect(onResizeEnd).toHaveBeenCalledWith([350, 250])
  })

  // 契约变更：aria 数值由 px 改为容器百分比（取整），与 antd 一致。
  it('[splitter.keyboard.aria] reports aria values as rounded percentages', () => {
    const splitter = setup({}, 1000)
    registerPanels(splitter, [{ min: 100, max: '60%' }, {}])
    expect(splitter.aria(0)).toEqual({ valueNow: 50, valueMin: 10, valueMax: 60 })
    splitter.resizeBy(0, 33)
    flush()
    expect(splitter.aria(0).valueNow).toBe(53)
  })
})

describe('createSplitter 折叠', () => {
  // 折叠后再展开：记住折叠前的尺寸并恢复；onCollapse 给出每个面板是否为 0。
  it('[splitter.collapse.toggle] collapses and restores the cached size', () => {
    const onCollapse = vi.fn()
    const onResizeEnd = vi.fn()
    const splitter = setup({ items: [{ collapsible: true }, { collapsible: true }], onCollapse, onResizeEnd }, 1000)
    expect(splitter.barInfo(0)).toMatchObject({ startCollapsible: true, endCollapsible: true })

    expect(splitter.collapse(0, 'start')).toBe(true)
    flush()
    expect(splitter.sizes()).toEqual([0, 1000])
    expect(onCollapse).toHaveBeenLastCalledWith([true, false], [0, 1000])
    expect(onResizeEnd).toHaveBeenLastCalledWith([0, 1000])
    // 已折叠：start 方向不可再用，end 方向变成“展开前一个面板”。
    expect(splitter.barInfo(0)).toMatchObject({ startCollapsible: false, endCollapsible: true })
    expect(splitter.collapse(0, 'start')).toBe(false)

    expect(splitter.collapse(0, 'end')).toBe(true)
    flush()
    expect(splitter.sizes()).toEqual([500, 500])
    expect(onCollapse).toHaveBeenLastCalledWith([false, false], [500, 500])
  })

  // 没有缓存（初始即为 0）时展开到 min；无 min 时展开到可移动范围的一半。
  it('[splitter.collapse.expand] expands to min, or half of the movable range', () => {
    const splitter = setup({ items: [{ defaultSize: 0, collapsible: true }, {}] }, 1000)
    expect(splitter.barInfo(0)).toMatchObject({ startCollapsible: false, endCollapsible: true })
    splitter.collapse(0, 'end')
    flush()
    expect(splitter.sizes()).toEqual([500, 500])
    dispose()

    const withMin = setup({ items: [{ defaultSize: 0, min: 200, collapsible: true }, {}] }, 1000)
    // 小于 min 的折叠面板不能拖开，只能用按钮展开。
    expect(withMin.barInfo(0).resizable).toBe(false)
    withMin.collapse(0, 'end')
    flush()
    expect(withMin.sizes()).toEqual([200, 800])
    expect(withMin.barInfo(0).resizable).toBe(true)
  })

  // 按钮显示方式由两侧面板合并：一侧 true 即常显，一侧 false 即不显示。
  it('[splitter.collapse.icon-mode] merges the icon visibility of both neighbours', () => {
    const splitter = setup({
      items: [
        { collapsible: { end: true, showCollapsibleIcon: true } },
        { collapsible: { start: true, showCollapsibleIcon: false } },
      ],
    }, 1000)
    expect(splitter.barInfo(0)).toEqual({
      resizable: true,
      startCollapsible: true,
      endCollapsible: true,
      showStartCollapsibleIcon: true,
      showEndCollapsibleIcon: false,
    })
  })

  // 越界的分隔条下标返回全关的信息，不抛错。
  it('[splitter.collapse.out-of-range] out-of-range bars report no capabilities', () => {
    const splitter = setup({ items: [{ collapsible: true }, {}] }, 1000)
    expect(splitter.barInfo(5)).toMatchObject({ resizable: false, startCollapsible: false, endCollapsible: false })
    expect(splitter.collapse(5, 'start')).toBe(false)
  })
})
