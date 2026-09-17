import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTour, placeTour, type TourConfig, type TourIns } from '../../../competence/src/tour/index'
let dispose: (() => void) | undefined
const setup = (config: TourConfig) => { let tour!: TourIns; createRoot(d => { dispose = d; tour = createTour(config) }); return tour }
afterEach(() => { dispose?.(); flush() })
describe('Tour state', () => {
  it('advances, returns and finishes once', async () => {
    const onFinish = vi.fn(), onClose = vi.fn(), onChange = vi.fn()
    const tour = setup({ steps: [{}, {}], defaultOpen: true, onFinish, onClose, onChange })
    expect(await tour.next()).toBe(true); flush(); expect(tour.current()).toBe(1)
    await tour.previous(); flush(); expect(tour.current()).toBe(0)
    await tour.next(); await tour.next(); flush()
    expect(tour.open()).toBe(false); expect(onFinish).toHaveBeenCalledExactlyOnceWith(1); expect(onClose).not.toHaveBeenCalled()
    expect(await tour.next()).toBe(false); expect(onChange).toHaveBeenCalledTimes(3)
  })
  it('proposes controlled changes without overriding the owner', async () => {
    const onChange = vi.fn(), onOpenChange = vi.fn()
    const tour = setup({ steps: [{}, {}], open: true, current: 0, onChange, onOpenChange })
    await tour.next(); flush(); expect(tour.current()).toBe(0); expect(onChange).toHaveBeenCalledWith(1, 0)
    tour.close('skip'); flush(); expect(tour.open()).toBe(true); expect(onOpenChange).toHaveBeenCalledWith(false)
  })
  it('clamps invalid initial steps and hides empty tours', () => {
    const tour = setup({ steps: [], defaultOpen: true, defaultCurrent: Infinity })
    expect(tour.current()).toBe(0); expect(tour.open()).toBe(false); expect(tour.step()).toBeUndefined()
  })
  it('vetoes navigation and rejects duplicate requests while pending', async () => {
    let resolve!: (value: boolean) => void
    const guard = vi.fn(() => new Promise<boolean>(r => { resolve = r }))
    const tour = setup({ steps: [{}, {}], defaultOpen: true, beforeChange: guard })
    const next = tour.next(); flush(); expect(tour.pending()).toBe(true)
    expect(await tour.next()).toBe(false); resolve(false); expect(await next).toBe(false); flush()
    expect(tour.pending()).toBe(false); expect(tour.current()).toBe(0); expect(guard).toHaveBeenCalledOnce()
  })
  it('discards an async result after closing and reopening', async () => {
    let resolve!: () => void
    const onChange = vi.fn(), onClose = vi.fn()
    const tour = setup({ steps: [{}, {}], defaultOpen: true, beforeChange: () => new Promise<void>(r => { resolve = r }), onChange, onClose })
    const next = tour.next(); tour.close('escape'); tour.setOpen(true); resolve(); expect(await next).toBe(false)
    expect(onChange).not.toHaveBeenCalled(); expect(onClose).toHaveBeenCalledWith(0, 'escape')
  })
  it('reports guard failures and releases the pending state', async () => {
    const error = new Error('validation'), onError = vi.fn()
    const tour = setup({ steps: [{}, {}], defaultOpen: true, beforeChange: () => { throw error }, onError })
    expect(await tour.next()).toBe(false); flush(); expect(tour.pending()).toBe(false); expect(onError).toHaveBeenCalledWith(error)
  })
  it('discards an async result after external step changes', async () => {
    const [current, setCurrent] = createSignal(0, { ownedWrite: true })
    let resolve!: () => void
    const onChange = vi.fn()
    const tour = setup({ steps: [{}, {}, {}], defaultOpen: true, get current() { return current() }, beforeChange: () => new Promise<void>(r => { resolve = r }), onChange })
    const next = tour.next(); setCurrent(2); flush(); resolve(); expect(await next).toBe(false); expect(onChange).not.toHaveBeenCalled()
  })
  it('does not invoke callbacks after disposal', async () => {
    let resolve!: () => void
    const onFinish = vi.fn()
    const tour = setup({ steps: [{}], defaultOpen: true, beforeChange: () => new Promise<void>(r => { resolve = r }), onFinish })
    const next = tour.next(); dispose?.(); dispose = undefined; resolve(); expect(await next).toBe(false); expect(onFinish).not.toHaveBeenCalled()
  })
})
describe('Tour placement', () => {
  const panel = { width: 200, height: 100 }, viewport = { width: 800, height: 600 }
  it('centers steps without a target', () => expect(placeTour(undefined, panel, viewport)).toMatchObject({ left: 300, top: 250 }))
  it('flips bottom near the viewport edge', () => expect(placeTour({ left: 300, top: 550, width: 80, height: 30 }, panel, viewport)).toEqual({ left: 240, top: 438, placement: 'top' }))
  it('flips right near the viewport edge', () => expect(placeTour({ left: 730, top: 200, width: 50, height: 40 }, panel, viewport, 'right')).toEqual({ left: 518, top: 170, placement: 'left' }))
  it('keeps the panel inside viewport margins', () => expect(placeTour({ left: 0, top: 0, width: 20, height: 20 }, panel, viewport, 'top')).toEqual({ left: 8, top: 32, placement: 'bottom' }))
})
