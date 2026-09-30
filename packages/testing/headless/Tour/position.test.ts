import { createRoot, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTourPosition } from '../../../competence/src/tour/position'
import type { TourStepConfig } from '../../../competence/src/tour/index'
let dispose: (() => void) | undefined
const box = (left: number, top: number, width: number, height: number) => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON() {} })
function setup(step: TourStepConfig, defaults: TourStepConfig = {}) {
  const panel = document.createElement('div'); document.body.append(panel)
  vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue(box(0, 0, 200, 100))
  let position!: ReturnType<typeof createTourPosition>
  createRoot(d => { dispose = d; position = createTourPosition({ open: () => true, step: () => step, panel: () => panel, defaults: () => defaults }) }); flush()
  return position
}
const target = (rect = box(100, 120, 80, 40)) => {
  const el = document.createElement('div'); document.body.append(el)
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(rect)
  return el
}
afterEach(() => { dispose?.(); dispose = undefined; document.body.innerHTML = ''; vi.restoreAllMocks(); flush() })
describe('Tour target tracking', () => {
  // 高亮区 = 目标外扩 gap（默认 6 / 圆角 2）；目标在视口内时不滚动（rc-tour useTarget）；默认 placement bottom 并带箭头。
  it('[tour.position.default] measures the default gap and skips in-view scrolling', () => {
    const el = target(), scroll = vi.spyOn(el, 'scrollIntoView')
    const position = setup({ target: el })
    expect(position.rect()).toEqual({ left: 94, top: 114, width: 92, height: 52, radius: 2 })
    expect(scroll).not.toHaveBeenCalled()
    expect(position.position()).toMatchObject({ placement: 'bottom', top: 178, arrow: { side: 'top' } })
  })
  // gap 对象：offset [x, y] + radius；旧的数字 gap 与 radius 仍可用。
  it('[tour.position.gap] applies gap offsets and radius', () => {
    const position = setup({ target: target(), gap: { offset: [4, 10], radius: 12 } })
    expect(position.rect()).toEqual({ left: 96, top: 110, width: 88, height: 60, radius: 12 })
    dispose?.(); dispose = undefined
    const legacy = setup({ target: target(), gap: 8, radius: 6 })
    expect(legacy.rect()).toEqual({ left: 92, top: 112, width: 96, height: 56, radius: 6 })
  })
  // 目标在视口外：按 scrollIntoViewOptions（默认 center / center）滚动一次；false 不滚动。
  it('[tour.position.scroll] scrolls off-screen targets with the configured options', () => {
    const el = target(box(100, 2000, 80, 40)), scroll = vi.spyOn(el, 'scrollIntoView')
    setup({ target: el })
    expect(scroll).toHaveBeenCalledExactlyOnceWith({ block: 'center', inline: 'center' })
    dispose?.(); dispose = undefined
    const off = target(box(100, 2000, 80, 40)), none = vi.spyOn(off, 'scrollIntoView')
    setup({ target: off, scrollIntoViewOptions: false })
    expect(none).not.toHaveBeenCalled()
  })
  // 步骤级字段覆盖 Tour 级默认；arrow=false 时不输出箭头；无目标时居中、placement center。
  it('[tour.position.defaults] merges step options over tour defaults', () => {
    const position = setup({ target: target(), placement: 'right' }, { placement: 'top', arrow: false })
    expect(position.position()).toMatchObject({ placement: 'right' })
    expect(position.position().arrow).toBeUndefined()
    dispose?.(); dispose = undefined
    const center = setup({})
    expect(center.rect()).toBeUndefined(); expect(center.position()).toMatchObject({ placement: 'center' }); expect(center.position().arrow).toBeUndefined()
  })
  // 目标延迟出现 / 被移除：rAF 重新测量后更新或回退。
  it('[tour.position.late] resolves a late target and falls back after its removal', () => {
    let frame!: FrameRequestCallback
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(fn => { frame = fn; return 123 })
    const el = document.createElement('div'); el.id = 'late'
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(box(100, 120, 80, 40))
    const position = setup({ target: () => document.getElementById('late'), scrollIntoView: false })
    expect(position.rect()).toBeUndefined()
    document.body.append(el); window.dispatchEvent(new Event('resize')); frame(0); flush(); expect(position.target()).toBe(el); expect(position.rect()).toBeDefined()
    el.remove(); window.dispatchEvent(new Event('scroll')); frame(0); flush(); expect(position.rect()).toBeUndefined()
  })
  // scroll / resize 合并到同一帧；销毁时取消未执行的帧并移除监听。
  it('[tour.position.coalesce] coalesces scroll and resize work and cancels frames on disposal', () => {
    const request = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(123), cancel = vi.spyOn(window, 'cancelAnimationFrame')
    setup({})
    window.dispatchEvent(new Event('scroll')); window.dispatchEvent(new Event('resize')); expect(request).toHaveBeenCalledOnce()
    dispose?.(); dispose = undefined; expect(cancel).toHaveBeenCalledWith(123)
    window.dispatchEvent(new Event('scroll')); expect(request).toHaveBeenCalledOnce()
  })
})
