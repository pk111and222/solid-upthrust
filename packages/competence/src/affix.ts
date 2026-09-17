import { createEffect, createSignal, onCleanup, untrack } from 'solid-js'

export interface AffixRect { top: number; left: number; width: number; height: number }
export interface AffixPosition { top: number; left: number; width: number; height: number; relativeTop: number }
export interface AffixConfig {
  offsetTop?: number
  offsetBottom?: number
  disabled?: boolean
  target?: () => HTMLElement | Window | undefined | null
  onChange?: (affixed: boolean) => void
}
/** Viewport coordinates; top takes precedence if both offsets are supplied. */
export function calculateAffix(placeholder: AffixRect, target: { top: number; bottom: number }, config: Pick<AffixConfig, 'offsetTop' | 'offsetBottom' | 'disabled'>): AffixPosition | undefined {
  if (config.disabled || placeholder.width <= 0 || placeholder.height <= 0 || target.bottom <= target.top) return
  const topMode = config.offsetTop !== undefined || config.offsetBottom === undefined
  const offset = topMode ? config.offsetTop ?? 0 : config.offsetBottom ?? 0
  if (!Number.isFinite(offset)) return
  const top = topMode ? target.top + offset : target.bottom - offset - placeholder.height
  if (topMode ? placeholder.top >= top : placeholder.top <= top) return
  return { top, left: placeholder.left, width: placeholder.width, height: placeholder.height, relativeTop: top - placeholder.top }
}
export function createAffix(config: AffixConfig = {}) {
  const [placeholder, setPlaceholder] = createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true })
  const [content, setContent] = createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true })
  const [position, setPosition] = createSignal<AffixPosition | undefined>(undefined, { ownedWrite: true })
  const [elementTarget, setElementTarget] = createSignal(false, { ownedWrite: true })
  let current: AffixPosition | undefined, frame: number | undefined, disposed = false
  const resolveTarget = () => config.target ? config.target() : typeof window === 'undefined' ? undefined : window
  const commit = (next: AffixPosition | undefined) => {
    const changed = !!current !== !!next
    if (current && next && Object.keys(next).every(key => current![key as keyof AffixPosition] === next[key as keyof AffixPosition])) return
    current = next; setPosition(next)
    if (changed) config.onChange?.(!!next)
  }
  const updatePosition = () => untrack(() => {
    if (disposed) return
    const anchor = placeholder(), inner = content(), target = resolveTarget()
    if (!anchor || !inner || !target || !anchor.isConnected || !inner.isConnected) { commit(undefined); return }
    const isElement = 'getBoundingClientRect' in target
    setElementTarget(isElement)
    if (isElement && (!(target as HTMLElement).isConnected || !target.contains(anchor))) { commit(undefined); return }
    const rect = anchor.getBoundingClientRect(), height = inner.getBoundingClientRect().height
    const targetRect = isElement ? target.getBoundingClientRect() : undefined
    const top = targetRect ? targetRect.top + (target as HTMLElement).clientTop : 0
    const bottom = top + (isElement ? (target as HTMLElement).clientHeight : (target as Window).innerHeight)
    commit(calculateAffix({ top: rect.top, left: rect.left, width: rect.width, height }, { top, bottom }, config))
  })
  const scheduleUpdate = () => {
    if (disposed || frame !== undefined || typeof window === 'undefined') return
    frame = window.requestAnimationFrame(() => { frame = undefined; updatePosition() })
  }
  createEffect(() => ({ anchor: placeholder(), inner: content(), target: resolveTarget(), top: config.offsetTop, bottom: config.offsetBottom, disabled: config.disabled }), ({ anchor, inner, target }) => {
    if (!anchor || !inner || !target || typeof window === 'undefined') { updatePosition(); return }
    window.addEventListener('scroll', scheduleUpdate, true)
    window.addEventListener('resize', scheduleUpdate)
    target.addEventListener('scroll', scheduleUpdate, { passive: true })
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(scheduleUpdate)
    observer?.observe(anchor); observer?.observe(inner)
    if ('getBoundingClientRect' in target) observer?.observe(target)
    updatePosition()
    return () => {
      window.removeEventListener('scroll', scheduleUpdate, true)
      window.removeEventListener('resize', scheduleUpdate)
      target.removeEventListener('scroll', scheduleUpdate)
      observer?.disconnect()
      if (frame !== undefined) { window.cancelAnimationFrame(frame); frame = undefined }
    }
  })
  onCleanup(() => { disposed = true; if (frame !== undefined && typeof window !== 'undefined') window.cancelAnimationFrame(frame) })
  return { position, affixed: () => !!position(), elementTarget, updatePosition,
    placeholderRef: (element: HTMLElement) => setPlaceholder(element), contentRef: (element: HTMLElement) => setContent(element) }
}
export type AffixIns = ReturnType<typeof createAffix>
