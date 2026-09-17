import { createRoot, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTourPosition } from '../../../competence/src/tour/position'
import type { TourStepConfig } from '../../../competence/src/tour/index'
let dispose: (() => void) | undefined
const box = (left: number, top: number, width: number, height: number) => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON() {} })
function setup(step: TourStepConfig) {
  const panel = document.createElement('div'); document.body.append(panel)
  vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue(box(0, 0, 200, 100))
  let position!: ReturnType<typeof createTourPosition>
  createRoot(d => { dispose = d; position = createTourPosition({ open: () => true, step: () => step, panel: () => panel, defaults: () => ({}) }) }); flush()
  return position
}
afterEach(() => { dispose?.(); dispose = undefined; document.body.innerHTML = ''; vi.restoreAllMocks(); flush() })
describe('Tour target tracking', () => {
  it('measures the highlight gap and scrolls the target once', () => {
    const target = document.createElement('div'); document.body.append(target)
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(box(100, 120, 80, 40))
    const scroll = vi.spyOn(target, 'scrollIntoView')
    const position = setup({ target, gap: 8 })
    expect(position.rect()).toEqual({ left: 92, top: 112, width: 96, height: 56 }); expect(scroll).toHaveBeenCalledOnce()
  })
  it('resolves a late target and falls back after its removal', () => {
    let frame!: FrameRequestCallback
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(fn => { frame = fn; return 123 })
    const target = document.createElement('div'); target.id = 'late'
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(box(100, 120, 80, 40))
    const position = setup({ target: () => document.getElementById('late'), scrollIntoView: false })
    expect(position.rect()).toBeUndefined()
    document.body.append(target); window.dispatchEvent(new Event('resize')); frame(0); flush(); expect(position.target()).toBe(target); expect(position.rect()).toBeDefined()
    target.remove(); window.dispatchEvent(new Event('scroll')); frame(0); flush(); expect(position.rect()).toBeUndefined()
  })
  it('coalesces scroll and resize work and cancels frames on disposal', () => {
    const request = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(123), cancel = vi.spyOn(window, 'cancelAnimationFrame')
    setup({})
    window.dispatchEvent(new Event('scroll')); window.dispatchEvent(new Event('resize')); expect(request).toHaveBeenCalledOnce()
    dispose?.(); dispose = undefined; expect(cancel).toHaveBeenCalledWith(123)
    window.dispatchEvent(new Event('scroll')); expect(request).toHaveBeenCalledOnce()
  })
})
