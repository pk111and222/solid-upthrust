import { createMemo, createSignal, onCleanup, untrack } from 'solid-js'
export type TourPlacement = 'top' | 'bottom' | 'left' | 'right'
export type TourCloseReason = 'close' | 'skip' | 'escape' | 'mask'
export interface TourStepConfig {
  target?: HTMLElement | null | (() => HTMLElement | null | undefined)
  placement?: TourPlacement
  gap?: number
  radius?: number
  scrollIntoView?: boolean | ScrollIntoViewOptions
  mask?: boolean
  disabledInteraction?: boolean
}
export interface TourConfig<T extends TourStepConfig = TourStepConfig> {
  steps: readonly T[]
  open?: boolean
  defaultOpen?: boolean
  current?: number
  defaultCurrent?: number
  onOpenChange?: (open: boolean) => void
  onChange?: (current: number, previous: number) => void
  onClose?: (current: number, reason: TourCloseReason) => void
  onFinish?: (current: number) => void
  beforeChange?: (next: number, current: number) => boolean | void | Promise<boolean | void>
  onError?: (error: unknown) => void
}
export function createTour<T extends TourStepConfig>(config: TourConfig<T>) {
  let innerOpen = untrack(() => config.defaultOpen ?? false), innerCurrent = untrack(() => config.defaultCurrent ?? 0)
  let busy = false, version = 0, disposed = false
  const [revision, setRevision] = createSignal(0, { ownedWrite: true })
  const touch = () => setRevision(n => n + 1)
  const index = () => Math.min(Math.max(0, Number.isFinite(config.current ?? innerCurrent) ? Math.floor(config.current ?? innerCurrent) : 0), Math.max(0, config.steps.length - 1))
  const current = createMemo(() => { revision(); return index() })
  const open = createMemo(() => { revision(); return config.steps.length > 0 && (config.open ?? innerOpen) })
  const pending = createMemo(() => { revision(); return busy })
  const step = () => config.steps[current()]
  const setOpen = (value: boolean) => untrack(() => {
    if (disposed) return
    version++; busy = false
    if (config.open === undefined) innerOpen = value
    touch(); config.onOpenChange?.(value)
  })
  const close = (reason: TourCloseReason = 'close') => untrack(() => {
    if (!(config.open ?? innerOpen) || disposed) return
    const previous = index(); setOpen(false); config.onClose?.(previous, reason)
  })
  const goTo = async (next: number): Promise<boolean> => {
    const snapshot = untrack(() => ({ current: index(), open: config.open ?? innerOpen, steps: config.steps, guard: config.beforeChange }))
    if (disposed || busy || !snapshot.open || !Number.isInteger(next) || next < 0 || next > snapshot.steps.length || next === snapshot.current) return false
    const token = ++version; busy = true; touch()
    try {
      if (await snapshot.guard?.(next, snapshot.current) === false) return false
      if (disposed || token !== version || !untrack(open) || untrack(index) !== snapshot.current || untrack(() => config.steps.length) !== snapshot.steps.length) return false
      untrack(() => {
        if (next === snapshot.steps.length) { setOpen(false); config.onFinish?.(snapshot.current) }
        else { if (config.current === undefined) innerCurrent = next; touch(); config.onChange?.(next, snapshot.current) }
      })
      return true
    } catch (error) { if (!disposed && token === version) untrack(() => config.onError?.(error)); return false }
    finally { if (!disposed && token === version) { busy = false; touch() } }
  }
  onCleanup(() => { disposed = true; version++ })
  return { open, current, step, pending, setOpen, close, goTo, next: () => goTo(untrack(index) + 1), previous: () => goTo(untrack(index) - 1) }
}
export type TourIns<T extends TourStepConfig = TourStepConfig> = ReturnType<typeof createTour<T>>
export interface TourRect { left: number; top: number; width: number; height: number }
export function placeTour(target: TourRect | undefined, panel: { width: number; height: number }, viewport: { width: number; height: number }, placement: TourPlacement = 'bottom') {
  const clamp = (n: number, size: number, limit: number) => Math.max(8, Math.min(n, limit - size - 8))
  if (!target) return { left: clamp((viewport.width - panel.width) / 2, panel.width, viewport.width), top: clamp((viewport.height - panel.height) / 2, panel.height, viewport.height), placement }
  const positions = {
    top: { left: target.left + (target.width - panel.width) / 2, top: target.top - panel.height - 12 },
    bottom: { left: target.left + (target.width - panel.width) / 2, top: target.top + target.height + 12 },
    left: { left: target.left - panel.width - 12, top: target.top + (target.height - panel.height) / 2 },
    right: { left: target.left + target.width + 12, top: target.top + (target.height - panel.height) / 2 },
  }
  const opposite: Record<TourPlacement, TourPlacement> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }
  const overflow = (p: { top: number; left: number }) => Math.max(0, 8 - p.top) + Math.max(0, p.top + panel.height + 8 - viewport.height) + Math.max(0, 8 - p.left) + Math.max(0, p.left + panel.width + 8 - viewport.width)
  const actual = overflow(positions[opposite[placement]]) < overflow(positions[placement]) ? opposite[placement] : placement
  return { left: clamp(positions[actual].left, panel.width, viewport.width), top: clamp(positions[actual].top, panel.height, viewport.height), placement: actual }
}
export { createTourPosition } from './position'
