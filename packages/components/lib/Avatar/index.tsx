import { Component, For, Show, children as resolveChildren, createContext, createEffect, createMemo, createSignal, merge, useContext } from 'solid-js'
import { createOwnerCleanup } from 'upthrust-competence'
import type { JSX } from '@solidjs/web'
import { avatarClass, avatarGroupClass, avatarGroupItemClass, avatarGroupMoreClass } from './styles'

export type AvatarSize = 'large' | 'middle' | 'small' | number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number }

export interface AvatarProps {
  /** Image source; falls back to icon, then children initials on error/absence */
  src?: string
  srcSet?: string
  alt?: string
  icon?: JSX.Element
  size?: AvatarSize
  shape?: 'circle' | 'square'
  /** Background color (any CSS color). Text stays white unless `textColor`. */
  color?: string
  /** Text color when customizing (defaults to on-primary white) */
  textColor?: string
  /** Max character count of the initials fallback (scales from the tail) */
  maxCount?: number
  onError?: (e: Event) => boolean | void
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

// Named sizes (px)
const NAMED_SIZE_PX: Record<'large' | 'middle' | 'small', number> = {
  large: 64,
  middle: 40,
  small: 28,
}

// Default responsive breakpoints for object-size form
const DEFAULT_RESPONSIVE = { xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }

// Breakpoint min widths — same scale as competence BREAKPOINTS (xs=480 ... xxl=1600)
// except xs which starts at 0 for avatar sizing.
const BP_MIN: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl', number> = {
  xs: 0, sm: 480, md: 576, lg: 768, xl: 992, xxl: 1200,
}

function resolveSizePx(size: AvatarSize | undefined, vw: number): number {
  if (size === undefined) return NAMED_SIZE_PX.middle
  if (typeof size === 'number') return size
  if (typeof size === 'string') return NAMED_SIZE_PX[size]
  // responsive object: pick the value of the largest breakpoint <= viewport
  const scale = { ...DEFAULT_RESPONSIVE, ...size }
  let px = scale.xs
  for (const bp of ['sm', 'md', 'lg', 'xl', 'xxl'] as const) {
    if (vw >= BP_MIN[bp]) px = scale[bp] ?? px
  }
  return px
}

/** Shares the group's viewport-width signal and overrides with member avatars. */
interface AvatarContextValue {
  vw: () => number
  size?: AvatarSize
  shape?: 'circle' | 'square'
}

// Solid 2's useContext THROWS when no provider is mounted (standalone avatar),
// so the default makes the context always resolvable; standalone avatars just
// read the neutral defaults and never notice the difference.
const AvatarContext = createContext<AvatarContextValue>({ vw: () => 1280 })

const Avatar: Component<AvatarProps> = (rawProps) => {
  const ctx = useContext(AvatarContext)
  // No shape default here: a merged default would shadow the group's shape
  // (merge fills undefined props, so `shape ?? ctx.shape` would never see
  // the group value). Group context supplies the fallback instead.
  const props = merge({ maxCount: 2 }, rawProps)
  const [imgFailed, setImgFailed] = createSignal(false)

  // Standalone avatars own a viewport signal; inside a group the group's signal wins.
  const [selfVw, setSelfVw] = createSignal(typeof window !== 'undefined' ? window.innerWidth : 1280)
  const vw = () => ctx?.vw() ?? selfVw()

  // Solid 2 (rc) runs the dual-function createEffect's effect callback
  // under a null owner — onCleanup there warns NO_OWNER_CLEANUP and never
  // runs. Bind to the owner captured at component creation instead.
  const onOwnerCleanup = createOwnerCleanup()

  // Responsive size needs a resize listener; bind only when actually used
  // (numeric/named sizes never re-resolve, so no listener for them).
  createEffect(
    () => (props.size !== undefined && typeof props.size === 'object') || !!ctx,
    (need) => {
      if (!need || typeof window === 'undefined') return
      const onResize = () => setSelfVw(window.innerWidth)
      window.addEventListener('resize', onResize)
      onOwnerCleanup(() => window.removeEventListener('resize', onResize))
    },
  )

  // Group-level size/shape override what the member passes,
  // but an explicit member size still wins over the group default.
  const effSize = () => props.size ?? ctx?.size
  const effShape = () => props.shape ?? ctx?.shape ?? 'circle'

  const sizePx = createMemo(() => resolveSizePx(effSize(), vw()))
  const namedSize = () =>
    effSize() === undefined || typeof effSize() === 'string'
      ? (effSize() as 'large' | 'middle' | 'small' | undefined ?? 'middle')
      : undefined

  // initials fallback: scales from the tail for latin, keeps whole for CJK
  const initials = createMemo(() => {
    const text = String(props.children ?? '').trim()
    if (!text) return ''
    const max = props.maxCount ?? 2
    return text.length > max ? text.slice(text.length - max) : text
  })

  const showImage = () => !!props.src && !imgFailed()
  const showIcon = () => !showImage() && !!props.icon && !initials()
  const showInitials = () => !showImage() && !showIcon()

  const onError = (e: Event) => {
    const ret = props.onError?.(e)
    // Returning false suppresses the fallback
    if (ret !== false) setImgFailed(true)
  }

  // font scales with the box: uses ~ size/2.9 for middle-ish glyphs
  const fontSize = createMemo(() => `${Math.round(sizePx() / 2.9)}px`)

  const _style = createMemo((): JSX.CSSProperties => ({
    width: `${sizePx()}px`,
    height: `${sizePx()}px`,
    'font-size': fontSize(),
    ...(props.color ? { 'background-color': props.color } : {}),
    ...(props.textColor ? { color: props.textColor } : {}),
    ...props.style,
  }))

  return (
    <span
      class={avatarClass({
        shape: effShape(),
        size: namedSize() as any,
        customColor: !!props.color,
      })}
      style={_style()}
      title={props.alt}
    >
      <Show when={showImage()}>
        <img
          src={props.src}
          srcset={props.srcSet}
          alt={props.alt}
          class="h-full w-full object-cover"
          onError={onError}
        />
      </Show>
      <Show when={showIcon()}>
        <span class="flex items-center justify-center">{props.icon}</span>
      </Show>
      <Show when={showInitials()}>
        <span class="leading-none">{initials()}</span>
      </Show>
    </span>
  )
}

export interface AvatarGroupProps {
  maxCount?: number
  maxStyle?: JSX.CSSProperties
  maxPopoverTrigger?: 'hover' | 'click' | 'focus' // reserved for future Popover wiring
  size?: AvatarSize
  shape?: 'circle' | 'square'
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

const AvatarGroup: Component<AvatarGroupProps> = (rawProps) => {
  const props = merge({ shape: 'circle' as const }, rawProps)
  const [vw, setVw] = createSignal(typeof window !== 'undefined' ? window.innerWidth : 1280)

  // Owner-bound cleanup (dual-function effect callbacks run under null
  // owner in Solid 2 rc — see standalone Avatar above).
  const onOwnerCleanup = createOwnerCleanup()

  // The group owns the viewport signal only when its size form is responsive
  // (object). Fixed sizes never change, so no listener churn.
  createEffect(
    () => props.size !== undefined && typeof props.size === 'object',
    (isResponsive) => {
      if (!isResponsive || typeof window === 'undefined') return
      const onResize = () => setVw(window.innerWidth)
      window.addEventListener('resize', onResize)
      onOwnerCleanup(() => window.removeEventListener('resize', onResize))
    },
  )

  const sizePx = createMemo(() => resolveSizePx(props.size, vw()))

  const ctx: AvatarContextValue = {
    vw,
    get size() { return props.size },
    get shape() { return props.shape },
  }

  return (
    <AvatarContext value={ctx}>
      <AvatarGroupInner
        shape={props.shape}
        sizePx={sizePx}
        maxCount={props.maxCount}
        maxStyle={props.maxStyle}
        style={props.style}
      >
        {props.children}
      </AvatarGroupInner>
    </AvatarContext>
  )
}

const AvatarGroupInner: Component<{
  shape: 'circle' | 'square'
  sizePx: () => number
  maxCount?: number
  maxStyle?: JSX.CSSProperties
  style?: JSX.CSSProperties
  children?: JSX.Element
}> = (props) => {
  const resolved = resolveChildren(() => props.children)

  const childrenArr = createMemo(() => {
    const kids = resolved()
    if (Array.isArray(kids)) return kids.filter(Boolean)
    return kids ? [kids] : []
  })

  const shown = createMemo(() => {
    const all = childrenArr()
    if (props.maxCount === undefined || all.length <= props.maxCount) return all
    return all.slice(0, Math.max(0, props.maxCount - 1))
  })

  const hiddenCount = createMemo(() => {
    const all = childrenArr()
    if (props.maxCount === undefined || all.length <= props.maxCount) return 0
    return all.length - shown().length
  })

  return (
    <span class={avatarGroupClass({})} style={props.style}>
      <For each={shown()}>
        {(child, i) => (
          <span class={i() > 0 ? avatarGroupItemClass({ shape: props.shape }) : ''} style={{ 'margin-left': i() > 0 ? `-${Math.round(props.sizePx() / 5)}px` : undefined }}>
            {child}
          </span>
        )}
      </For>
      <Show when={hiddenCount() > 0}>
        <span
          class={avatarGroupMoreClass({ shape: props.shape })}
          style={{
            width: `${props.sizePx()}px`,
            height: `${props.sizePx()}px`,
            'font-size': `${Math.round(props.sizePx() / 3.2)}px`,
            'margin-left': `-${Math.round(props.sizePx() / 5)}px`,
            ...props.maxStyle,
          }}
        >
          +{hiddenCount()}
        </span>
      </Show>
    </span>
  )
}

export default Avatar
export { AvatarGroup }
