import { createMemo, createSignal, onCleanup, untrack } from 'solid-js'
/** rc-tour PlacementType：12 个方位 + 无目标时的 center。 */
export type TourPlacement =
  | 'top' | 'topLeft' | 'topRight'
  | 'bottom' | 'bottomLeft' | 'bottomRight'
  | 'left' | 'leftTop' | 'leftBottom'
  | 'right' | 'rightTop' | 'rightBottom'
  | 'center'
export type TourCloseReason = 'close' | 'skip' | 'escape' | 'mask' | 'finish'
/** rc-tour Gap：offset 为高亮区外扩（数字或 [x, y]），radius 为高亮圆角。 */
export interface TourGap { offset?: number | [number, number]; radius?: number }
export interface TourMaskConfig { style?: object; color?: string }
export interface TourStepConfig {
  target?: HTMLElement | null | (() => HTMLElement | null | undefined)
  placement?: TourPlacement
  /** 高亮区外扩与圆角；数字为旧写法，等同 `{ offset: n }`。 */
  gap?: number | TourGap
  /** @deprecated 使用 `gap.radius`。 */
  radius?: number
  /** 目标不在视口内时的滚动方式，默认 `{ block: 'center', inline: 'center' }`；false 不滚动。 */
  scrollIntoViewOptions?: boolean | ScrollIntoViewOptions
  /** @deprecated 使用 `scrollIntoViewOptions`。 */
  scrollIntoView?: boolean | ScrollIntoViewOptions
  mask?: boolean | TourMaskConfig
  arrow?: boolean | { pointAtCenter: boolean }
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
  let busy = false, version = 0, disposed = false, wasOpen: boolean | undefined
  const [revision, setRevision] = createSignal(0, { ownedWrite: true })
  const touch = () => setRevision(n => n + 1)
  const index = () => Math.min(Math.max(0, Number.isFinite(config.current ?? innerCurrent) ? Math.floor(config.current ?? innerCurrent) : 0), Math.max(0, config.steps.length - 1))
  // rc-tour：从关闭到打开时（非受控 current）回到第 0 步。不订阅的观察者：在 memo 内比较上一次的 open。
  const open = createMemo(() => {
    revision()
    const value = config.steps.length > 0 && (config.open ?? innerOpen)
    if (value && wasOpen === false) innerCurrent = 0
    wasOpen = value
    return value
  })
  const current = createMemo(() => { revision(); open(); return index() })
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
        // rc-tour onFinish：先 handleClose（onClose）再 onFinish。
        if (next === snapshot.steps.length) { setOpen(false); config.onClose?.(snapshot.current, 'finish'); config.onFinish?.(snapshot.current) }
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
export interface TourArrow { x: number; y: number; side: 'top' | 'bottom' | 'left' | 'right' }
export interface TourPosition { left: number; top: number; placement: TourPlacement; arrow?: TourArrow }

/** rc-tour useTarget 的 gap 归一：offset 默认 6（可分 x / y），radius 默认 2；数字 gap 为旧写法。 */
export function tourGap(gap: number | TourGap | undefined, legacyRadius?: number) {
  const g = typeof gap === 'number' ? { offset: gap } : gap ?? {}
  const pick = (i: 0 | 1) => { const v = Array.isArray(g.offset) ? g.offset[i] : g.offset; return typeof v === 'number' && Number.isFinite(v) ? Math.max(0, v) : 6 }
  const radius = typeof g.radius === 'number' && Number.isFinite(g.radius) ? g.radius : legacyRadius ?? 2
  return { x: pick(0), y: pick(1), radius: Math.max(0, radius) }
}

/**
 * rc-tour useClosable：步骤级 closable / closeIcon 优先于 Tour 级；closable=false 或 closeIcon=false（且对象未给图标）时为 null（不可关闭，
 * 同时屏蔽 Escape）。Tour 级默认可关闭。
 */
export function tourClosable<I>(stepClosable: boolean | ({ closeIcon?: I } & object) | undefined, stepCloseIcon: I | boolean | undefined, closable: boolean | ({ closeIcon?: I } & object) | undefined, closeIcon: I | boolean | undefined) {
  const resolve = (c: typeof closable, icon: I | boolean | undefined, preset: boolean): ({ closeIcon?: I } & object) | null | 'empty' => {
    const isObj = c !== null && typeof c === 'object'
    if (c === false || (icon === false && (!isObj || !(c as { closeIcon?: I }).closeIcon))) return null
    const mergedIcon = typeof icon !== 'boolean' ? icon : undefined
    if (isObj) return { ...(c as object), closeIcon: (c as { closeIcon?: I }).closeIcon ?? mergedIcon }
    return preset || c || icon ? { closeIcon: mergedIcon } : 'empty'
  }
  const step = resolve(stepClosable, stepCloseIcon, false)
  return step !== 'empty' ? step : resolve(closable, closeIcon, true) as ({ closeIcon?: I } & object) | null
}

const OPPOSITE: Record<string, string> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }
const sideOf = (p: TourPlacement) => (p.startsWith('top') ? 'top' : p.startsWith('bottom') ? 'bottom' : p.startsWith('left') ? 'left' : 'right') as 'top' | 'bottom' | 'left' | 'right'
/** 箭头贴边的最小距离（4px 半宽 + 8px 圆角）。 */
const ARROW_MARGIN = 12

/**
 * 纯函数定位：目标（高亮区）外 `offset`（antd：半箭头 8 + marginXXS 4 = 12）处放置面板，
 * 首选方向溢出更多时翻到对侧（保持对齐方式），再夹在视口 8px 边距内；无目标或 center 时居中。
 * 箭头落在面板朝向目标的一边、跟随目标中心（夹在圆角之外）；pointAtCenter 时 xxLeft / xxTop 等对齐方位平移面板让箭头贴边 12px 指向目标中心。
 */
export function placeTour(target: TourRect | undefined, panel: { width: number; height: number }, viewport: { width: number; height: number }, placement: TourPlacement = 'bottom', offset = 12, pointAtCenter = false): TourPosition {
  const clamp = (n: number, size: number, limit: number) => Math.max(8, Math.min(n, limit - size - 8))
  if (!target || placement === 'center') return { left: clamp((viewport.width - panel.width) / 2, panel.width, viewport.width), top: clamp((viewport.height - panel.height) / 2, panel.height, viewport.height), placement: 'center' }
  const at = (p: TourPlacement) => {
    const side = sideOf(p), start = p.endsWith('Left') || p.endsWith('Top'), end = p.endsWith('Right') || p.endsWith('Bottom')
    if (side === 'top' || side === 'bottom') return {
      top: side === 'top' ? target.top - panel.height - offset : target.top + target.height + offset,
      left: pointAtCenter && start ? target.left + target.width / 2 - ARROW_MARGIN
        : pointAtCenter && end ? target.left + target.width / 2 + ARROW_MARGIN - panel.width
        : start ? target.left : end ? target.left + target.width - panel.width : target.left + (target.width - panel.width) / 2,
    }
    return {
      left: side === 'left' ? target.left - panel.width - offset : target.left + target.width + offset,
      top: pointAtCenter && start ? target.top + target.height / 2 - ARROW_MARGIN
        : pointAtCenter && end ? target.top + target.height / 2 + ARROW_MARGIN - panel.height
        : start ? target.top : end ? target.top + target.height - panel.height : target.top + (target.height - panel.height) / 2,
    }
  }
  const overflow = (p: { top: number; left: number }) => Math.max(0, 8 - p.top) + Math.max(0, p.top + panel.height + 8 - viewport.height) + Math.max(0, 8 - p.left) + Math.max(0, p.left + panel.width + 8 - viewport.width)
  const side = sideOf(placement)
  const flipped = placement.replace(side, OPPOSITE[side]) as TourPlacement
  const actual = overflow(at(flipped)) < overflow(at(placement)) ? flipped : placement
  const raw = at(actual)
  const left = clamp(raw.left, panel.width, viewport.width), top = clamp(raw.top, panel.height, viewport.height)
  const actualSide = sideOf(actual)
  const arrowSide = OPPOSITE[actualSide] as TourArrow['side']
  const along = (center: number, size: number) => Math.min(Math.max(center, ARROW_MARGIN), Math.max(ARROW_MARGIN, size - ARROW_MARGIN))
  const arrow: TourArrow = actualSide === 'top' || actualSide === 'bottom'
    ? { x: along(target.left + target.width / 2 - left, panel.width), y: actualSide === 'bottom' ? 0 : panel.height, side: arrowSide }
    : { x: actualSide === 'right' ? 0 : panel.width, y: along(target.top + target.height / 2 - top, panel.height), side: arrowSide }
  return { left, top, placement: actual, arrow }
}
export { createTourPosition } from './position'
