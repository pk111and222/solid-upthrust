import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTour, placeTour, tourClosable, tourGap, type TourConfig, type TourIns } from '../../../competence/src/tour/index'
let dispose: (() => void) | undefined
const setup = (config: TourConfig) => { let tour!: TourIns; createRoot(d => { dispose = d; tour = createTour(config) }); return tour }
afterEach(() => { dispose?.(); flush() })
describe('Tour state', () => {
  // 前进 / 后退 / 结束：结束时先 onClose(current, 'finish') 再 onFinish（rc-tour handleClose → onFinish），之后不再前进。
  it('[tour.state.navigate] advances, returns and finishes once', async () => {
    const onFinish = vi.fn(), onClose = vi.fn(), onChange = vi.fn()
    const tour = setup({ steps: [{}, {}], defaultOpen: true, onFinish, onClose, onChange })
    expect(await tour.next()).toBe(true); flush(); expect(tour.current()).toBe(1)
    await tour.previous(); flush(); expect(tour.current()).toBe(0)
    await tour.next(); await tour.next(); flush()
    expect(tour.open()).toBe(false); expect(onFinish).toHaveBeenCalledExactlyOnceWith(1); expect(onClose).toHaveBeenCalledExactlyOnceWith(1, 'finish')
    expect(onClose.mock.invocationCallOrder[0]).toBeLessThan(onFinish.mock.invocationCallOrder[0])
    expect(await tour.next()).toBe(false); expect(onChange).toHaveBeenCalledTimes(3)
  })
  // 受控 open / current：只通过回调提议变更，不覆盖所有者的值。
  it('[tour.state.controlled] proposes controlled changes without overriding the owner', async () => {
    const onChange = vi.fn(), onOpenChange = vi.fn()
    const tour = setup({ steps: [{}, {}], open: true, current: 0, onChange, onOpenChange })
    await tour.next(); flush(); expect(tour.current()).toBe(0); expect(onChange).toHaveBeenCalledWith(1, 0)
    tour.close('skip'); flush(); expect(tour.open()).toBe(true); expect(onOpenChange).toHaveBeenCalledWith(false)
  })
  // 非法初始步骤被夹紧；空 steps 不打开。
  it('[tour.state.clamp] clamps invalid initial steps and hides empty tours', () => {
    const tour = setup({ steps: [], defaultOpen: true, defaultCurrent: Infinity })
    expect(tour.current()).toBe(0); expect(tour.open()).toBe(false); expect(tour.step()).toBeUndefined()
  })
  // rc-tour：从关闭重新打开时（非受控 current）回到第 0 步。
  it('[tour.state.reopen] resets to the first step when reopened', async () => {
    const tour = setup({ steps: [{}, {}, {}], defaultOpen: true })
    await tour.next(); await tour.next(); flush(); expect(tour.current()).toBe(2)
    tour.close(); flush(); expect(tour.open()).toBe(false)
    tour.setOpen(true); flush(); expect(tour.open()).toBe(true); expect(tour.current()).toBe(0)
  })
  // beforeChange 异步守卫：pending 期间拒绝重复请求，返回 false 否决切换。
  it('[tour.state.guard] vetoes navigation and rejects duplicate requests while pending', async () => {
    let resolve!: (value: boolean) => void
    const guard = vi.fn(() => new Promise<boolean>(r => { resolve = r }))
    const tour = setup({ steps: [{}, {}], defaultOpen: true, beforeChange: guard })
    const next = tour.next(); flush(); expect(tour.pending()).toBe(true)
    expect(await tour.next()).toBe(false); resolve(false); expect(await next).toBe(false); flush()
    expect(tour.pending()).toBe(false); expect(tour.current()).toBe(0); expect(guard).toHaveBeenCalledOnce()
  })
  // 守卫未决期间关闭再打开：旧结果作废。
  it('[tour.state.stale-open] discards an async result after closing and reopening', async () => {
    let resolve!: () => void
    const onChange = vi.fn(), onClose = vi.fn()
    const tour = setup({ steps: [{}, {}], defaultOpen: true, beforeChange: () => new Promise<void>(r => { resolve = r }), onChange, onClose })
    const next = tour.next(); tour.close('escape'); tour.setOpen(true); resolve(); expect(await next).toBe(false)
    expect(onChange).not.toHaveBeenCalled(); expect(onClose).toHaveBeenCalledWith(0, 'escape')
  })
  // 守卫抛错：交给 onError 并释放 pending。
  it('[tour.state.error] reports guard failures and releases the pending state', async () => {
    const error = new Error('validation'), onError = vi.fn()
    const tour = setup({ steps: [{}, {}], defaultOpen: true, beforeChange: () => { throw error }, onError })
    expect(await tour.next()).toBe(false); flush(); expect(tour.pending()).toBe(false); expect(onError).toHaveBeenCalledWith(error)
  })
  // 守卫未决期间外部修改受控 current：旧结果作废。
  it('[tour.state.stale-current] discards an async result after external step changes', async () => {
    const [current, setCurrent] = createSignal(0, { ownedWrite: true })
    let resolve!: () => void
    const onChange = vi.fn()
    const tour = setup({ steps: [{}, {}, {}], defaultOpen: true, get current() { return current() }, beforeChange: () => new Promise<void>(r => { resolve = r }), onChange })
    const next = tour.next(); setCurrent(2); flush(); resolve(); expect(await next).toBe(false); expect(onChange).not.toHaveBeenCalled()
  })
  // 销毁后不再触发回调。
  it('[tour.state.dispose] does not invoke callbacks after disposal', async () => {
    let resolve!: () => void
    const onFinish = vi.fn()
    const tour = setup({ steps: [{}], defaultOpen: true, beforeChange: () => new Promise<void>(r => { resolve = r }), onFinish })
    const next = tour.next(); dispose?.(); dispose = undefined; resolve(); expect(await next).toBe(false); expect(onFinish).not.toHaveBeenCalled()
  })
})
describe('Tour helpers', () => {
  // gap 归一：默认 offset 6 / radius 2；数字为旧写法；[x, y] 分轴；旧 radius 作为回退；负值夹到 0。
  it('[tour.gap] normalizes gap offsets and radius', () => {
    expect(tourGap(undefined)).toEqual({ x: 6, y: 6, radius: 2 })
    expect(tourGap(8)).toEqual({ x: 8, y: 8, radius: 2 })
    expect(tourGap({ offset: [4, 10], radius: 12 })).toEqual({ x: 4, y: 10, radius: 12 })
    expect(tourGap({ offset: -3 }, 8)).toEqual({ x: 0, y: 0, radius: 8 })
  })
  // closable 合并（rc useClosable）：步骤级优先；false 或 closeIcon=false 为 null；Tour 级默认可关闭；对象保留额外字段。
  it('[tour.closable] merges step and tour closable settings', () => {
    expect(tourClosable(undefined, undefined, undefined, undefined)).toEqual({ closeIcon: undefined })
    expect(tourClosable(undefined, undefined, false, undefined)).toBeNull()
    expect(tourClosable(true, undefined, false, undefined)).toEqual({ closeIcon: undefined })
    expect(tourClosable(undefined, undefined, undefined, false)).toBeNull()
    expect(tourClosable(undefined, 'x', undefined, 'y')).toEqual({ closeIcon: 'x' })
    expect(tourClosable({ 'aria-label': 'bye' } as object, undefined, undefined, 'y')).toEqual({ 'aria-label': 'bye', closeIcon: undefined })
    expect(tourClosable(undefined, undefined, { closeIcon: 'z' }, false)).toEqual({ closeIcon: 'z' })
  })
})
describe('Tour placement', () => {
  const panel = { width: 200, height: 100 }, viewport = { width: 800, height: 600 }
  // 无目标：视口居中，placement 为 center，无箭头。
  it('[tour.place.center] centers steps without a target', () => {
    expect(placeTour(undefined, panel, viewport)).toEqual({ left: 300, top: 250, placement: 'center' })
    expect(placeTour({ left: 10, top: 10, width: 10, height: 10 }, panel, viewport, 'center')).toEqual({ left: 300, top: 250, placement: 'center' })
  })
  // bottom 溢出翻到 top；箭头在面板底边、跟随目标中心。
  it('[tour.place.flip-bottom] flips bottom near the viewport edge', () => {
    expect(placeTour({ left: 300, top: 550, width: 80, height: 30 }, panel, viewport)).toEqual({ left: 240, top: 438, placement: 'top', arrow: { x: 100, y: 100, side: 'bottom' } })
  })
  // right 溢出翻到 left；箭头在面板右边。
  it('[tour.place.flip-right] flips right near the viewport edge', () => {
    expect(placeTour({ left: 730, top: 200, width: 50, height: 40 }, panel, viewport, 'right')).toEqual({ left: 518, top: 170, placement: 'left', arrow: { x: 200, y: 50, side: 'right' } })
  })
  // 夹在视口 8px 边距内；箭头夹在圆角外 12px。
  it('[tour.place.clamp] keeps the panel inside viewport margins', () => {
    expect(placeTour({ left: 0, top: 0, width: 20, height: 20 }, panel, viewport, 'top')).toEqual({ left: 8, top: 32, placement: 'bottom', arrow: { x: 12, y: 0, side: 'top' } })
  })
  // 对齐方位：bottomLeft 左对齐、topRight 右对齐、leftTop 顶对齐、rightBottom 底对齐。
  it('[tour.place.aligned] aligns start / end placements', () => {
    const target = { left: 300, top: 250, width: 100, height: 40 }
    expect(placeTour(target, panel, viewport, 'bottomLeft')).toMatchObject({ left: 300, top: 302, placement: 'bottomLeft' })
    expect(placeTour(target, panel, viewport, 'topRight')).toMatchObject({ left: 200, top: 138, placement: 'topRight' })
    expect(placeTour(target, panel, viewport, 'leftTop')).toMatchObject({ left: 88, top: 250, placement: 'leftTop' })
    expect(placeTour(target, panel, viewport, 'rightBottom')).toMatchObject({ left: 412, top: 190, placement: 'rightBottom' })
  })
  // pointAtCenter：对齐方位平移面板，让箭头距面板边 12px 指向目标中心。
  it('[tour.place.point-at-center] shifts aligned placements toward the target center', () => {
    const p = placeTour({ left: 300, top: 250, width: 100, height: 40 }, panel, viewport, 'bottomLeft', 12, true)
    expect(p).toEqual({ left: 338, top: 302, placement: 'bottomLeft', arrow: { x: 12, y: 0, side: 'top' } })
  })
})
