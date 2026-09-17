import { createEffect, createSignal, untrack } from 'solid-js'
import { placeTour, type TourRect, type TourStepConfig } from './index'
export function createTourPosition(config: { open: () => boolean; step: () => TourStepConfig | undefined; panel: () => HTMLElement | undefined; defaults: () => TourStepConfig }) {
  const [target, setTarget] = createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true })
  const [rect, setRect] = createSignal<TourRect | undefined>(undefined, { ownedWrite: true })
  const [position, setPosition] = createSignal({ left: 8, top: 8, placement: 'bottom' as const } as ReturnType<typeof placeTour>, { ownedWrite: true })
  createEffect(() => ({ open: config.open(), step: config.step(), panel: config.panel(), defaults: config.defaults() }), ({ open, step, panel, defaults }) => {
    if (!open || !step || !panel || typeof window === 'undefined') { setTarget(undefined); setRect(undefined); return }
    let frame: number | undefined, observed: HTMLElement | undefined, stopped = false
    const options = { ...defaults, ...step }
    const schedule = () => { if (frame === undefined && !stopped) frame = requestAnimationFrame(() => { frame = undefined; measure() }) }
    const resize = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(schedule)
    resize?.observe(panel)
    const measure = () => untrack(() => {
      let element: HTMLElement | null | undefined
      try { element = typeof step.target === 'function' ? step.target() : step.target } catch { element = undefined }
      if (!element?.isConnected) element = undefined
      if (element !== observed) {
        if (observed) resize?.unobserve(observed)
        observed = element ?? undefined; setTarget(observed)
        if (observed) {
          resize?.observe(observed)
          if (options.scrollIntoView !== false) observed.scrollIntoView?.(typeof options.scrollIntoView === 'object' ? options.scrollIntoView : { block: 'center', inline: 'nearest', behavior: 'instant' })
        }
      }
      const box = observed?.getBoundingClientRect(), gap = Math.max(0, options.gap ?? 6)
      const left = Math.max(0, (box?.left ?? 0) - gap), top = Math.max(0, (box?.top ?? 0) - gap)
      const right = Math.min(window.innerWidth, (box?.right ?? 0) + gap), bottom = Math.min(window.innerHeight, (box?.bottom ?? 0) + gap)
      const next = box && box.width > 0 && box.height > 0 && right > left && bottom > top ? { left, top, width: right - left, height: bottom - top } : undefined
      setRect(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next)
      const size = panel.getBoundingClientRect()
      const p = placeTour(next, size, { width: window.innerWidth, height: window.innerHeight }, options.placement)
      setPosition(previous => JSON.stringify(previous) === JSON.stringify(p) ? previous : p)
    })
    const mutation = typeof MutationObserver === 'undefined' ? undefined : new MutationObserver(schedule)
    mutation?.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('scroll', schedule, true); window.addEventListener('resize', schedule)
    measure()
    return () => { stopped = true; resize?.disconnect(); mutation?.disconnect(); window.removeEventListener('scroll', schedule, true); window.removeEventListener('resize', schedule); if (frame !== undefined) cancelAnimationFrame(frame) }
  })
  return { target, rect, position }
}
