import { createEffect, createMemo, createSignal } from 'solid-js'
import { BREAKPOINTS } from './breakpoint'
import { createOwnerCleanup } from './utils'

export type AvatarSize = 'large' | 'middle' | 'small' | number | Partial<Record<keyof typeof BREAKPOINTS, number>>
const sizes = { large: 64, middle: 40, small: 28 }
const validSize = (value: number) => Number.isFinite(value) && value > 0 ? value : sizes.middle
/** Sparse maps inherit the last defined smaller breakpoint; xs covers widths below sm. */
export function resolveAvatarSize(size: AvatarSize | undefined, width: number): number {
  if (size === undefined) return sizes.middle
  if (typeof size === 'number') return validSize(size)
  if (typeof size === 'string') return sizes[size]
  let value = size.xs ?? sizes.middle
  for (const key of ['sm', 'md', 'lg', 'xl', 'xxl'] as const) {
    if (width >= BREAKPOINTS[key] && size[key] !== undefined) value = size[key]!
  }
  return validSize(value)
}

/** Listeners exist only while this size is responsive, and are removed on disposal. */
export function createAvatarSize(size: () => AvatarSize | undefined) {
  const readWidth = () => typeof window === 'undefined' ? 0 : window.innerWidth
  const [width, setWidth] = createSignal(readWidth())
  let remove: (() => void) | undefined
  createOwnerCleanup()(() => remove?.())
  createEffect(() => typeof size() === 'object', responsive => {
    remove?.(); remove = undefined
    if (!responsive || typeof window === 'undefined') return
    const resize = () => setWidth(readWidth())
    resize(); window.addEventListener('resize', resize)
    remove = () => window.removeEventListener('resize', resize)
  })
  return createMemo(() => resolveAvatarSize(size(), width()))
}
