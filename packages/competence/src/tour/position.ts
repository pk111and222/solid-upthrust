import { createEffect, createSignal, untrack } from 'solid-js'
import { placeTour, tourGap, type TourPosition, type TourRect, type TourStepConfig } from './index'
export interface TourHighlight extends TourRect { radius: number }
const DEFAULT_SCROLL: ScrollIntoViewOptions = { block: 'center', inline: 'center' }
const inViewport = (box: DOMRect) => box.top >= 0 && box.left >= 0 && box.right <= window.innerWidth && box.bottom <= window.innerHeight
export function createTourPosition(config: { open: () => boolean; step: () => TourStepConfig | undefined; panel: () => HTMLElement | undefined; defaults: () => TourStepConfig }) {
  const [target, setTarget] = createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true })
  const [rect, setRect] = createSignal<TourHighlight | undefined>(undefined, { ownedWrite: true })
  const [position, setPosition] = createSignal<TourPosition>({ left: 8, top: 8, placement: 'center' }, { ownedWrite: true })
  createEffect(() => ({ open: config.open(), step: config.step(), panel: config.panel(), defaults: config.defaults() }), ({ open, step, panel, defaults }) => {
    if (!open || !step || !panel || typeof window === 'undefined') { setTarget(undefined); setRect(undefined); return }
    let frame: number | undefined, observed: HTMLElement | undefined, stopped = false
    const options = { ...defaults, ...Object.fromEntries(Object.entries(step).filter(([, v]) => v !== undefined)) } as TourStepConfig
    const scrollOptions = options.scrollIntoViewOptions ?? options.scrollIntoView ?? DEFAULT_SCROLL
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
          // rc-tour useTarget：目标不在视口内时才滚动；scrollIntoViewOptions=false 不滚动。
          if (scrollOptions !== false && !inViewport(observed.getBoundingClientRect())) observed.scrollIntoView?.(scrollOptions)
        }
      }
      const box = observed?.getBoundingClientRect(), gap = tourGap(options.gap, options.radius)
      const next = box && box.width > 0 && box.height > 0
        ? { left: box.left - gap.x, top: box.top - gap.y, width: box.width + gap.x * 2, height: box.height + gap.y * 2, radius: gap.radius }
        : undefined
      setRect(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next)
      const size = panel.getBoundingClientRect()
      const placement = options.placement ?? (next ? 'bottom' : 'center')
      const arrow = next ? options.arrow ?? true : false
      const p = placeTour(next, size, { width: window.innerWidth, height: window.innerHeight }, placement, 12, typeof arrow === 'object' && arrow.pointAtCenter)
      if (!arrow) delete p.arrow
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
