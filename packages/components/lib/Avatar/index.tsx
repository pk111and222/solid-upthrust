import { Component, For, Show, children as resolveChildren, createContext, createMemo, createSignal, merge, useContext } from 'solid-js'
import { createAvatarSize, type AvatarSize } from 'upthrust-competence'
import { mergeClass } from '../../common/merge'
import Popover from '../Popover'
export type { AvatarSize } from 'upthrust-competence'
import type { JSX } from '@solidjs/web'
import { avatarClass, avatarGroupClass, avatarGroupItemClass, avatarGroupMoreClass } from './styles'

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

interface AvatarContextValue {
  size?: AvatarSize
  shape?: 'circle' | 'square'
}
const AvatarContext = createContext<AvatarContextValue>({})

const Avatar: Component<AvatarProps> = (rawProps) => {
  const ctx = useContext(AvatarContext)
  const props = merge({ maxCount: 2 }, rawProps)
  const source = createMemo(() => ({ src: props.src, srcSet: props.srcSet }))
  const [failed, setFailed] = createSignal<ReturnType<typeof source>>()
  const effSize = () => props.size ?? ctx.size
  const effShape = () => props.shape ?? ctx.shape ?? 'circle'

  const sizePx = createAvatarSize(effSize)
  const namedSize = () =>
    effSize() === undefined || typeof effSize() === 'string'
      ? (effSize() as 'large' | 'middle' | 'small' | undefined ?? 'middle')
      : undefined

  const initials = createMemo(() => {
    const child = props.children
    if (typeof child !== 'string' && typeof child !== 'number') return child
    const text = Array.from(String(child).trim())
    const max = Number.isFinite(props.maxCount) ? Math.max(0, Math.floor(props.maxCount!)) : 2
    return max === 0 ? '' : text.slice(-max).join('')
  })
  const showImage = () => !!props.src && failed() !== source()
  const showIcon = () => !showImage() && props.icon != null && props.icon !== false
  const onError = (e: Event) => {
    const current = source()
    if (props.onError?.(e) !== false) setFailed(current)
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
      class={mergeClass(avatarClass({
        shape: effShape(),
        size: namedSize(),
        customColor: !!props.color,
      }), props.class)}
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
      <Show when={!showImage() && !showIcon()}>
        <span class="leading-none">{initials()}</span>
      </Show>
    </span>
  )
}

export interface AvatarGroupProps {
  maxCount?: number
  maxStyle?: JSX.CSSProperties
  maxPopoverTrigger?: 'hover' | 'click' | 'focus'
  size?: AvatarSize
  shape?: 'circle' | 'square'
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

const AvatarGroup: Component<AvatarGroupProps> = (rawProps) => {
  const props = merge({ shape: 'circle' as const }, rawProps)
  const sizePx = createAvatarSize(() => props.size)
  const ctx: AvatarContextValue = {
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
        class={props.class}
        maxPopoverTrigger={props.maxPopoverTrigger}
      >
        {props.children}
      </AvatarGroupInner>
    </AvatarContext>
  )
}

const AvatarGroupInner: Component<{
  shape: 'circle' | 'square'
  class?: string
  maxPopoverTrigger?: 'hover' | 'click' | 'focus'
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
    if (props.maxCount === undefined || !Number.isFinite(props.maxCount)) return all
    return all.slice(0, Math.max(0, Math.floor(props.maxCount)))
  })

  const hiddenCount = createMemo(() => {
    const all = childrenArr()
    return all.length - shown().length
  })

  return (
    <span class={mergeClass(avatarGroupClass({}), props.class)} style={props.style}>
      <For each={shown()}>
        {(child, i) => (
          <span class={mergeClass("inline-flex shrink-0", avatarGroupItemClass({ shape: props.shape }))} style={{ 'margin-left': i() > 0 ? `-${Math.round(props.sizePx() / 5)}px` : undefined }}>
            {child}
          </span>
        )}
      </For>
      <Show when={hiddenCount() > 0}>
        <Popover trigger={props.maxPopoverTrigger ?? 'hover'} content={<span class="flex gap-2"><For each={childrenArr().slice(shown().length)}>{child => <span class="inline-flex">{child}</span>}</For></span>}>
        <button type="button" aria-label={`查看其余 ${hiddenCount()} 个头像`}
          class={mergeClass(avatarGroupMoreClass({ shape: props.shape }), 'p-0 cursor-pointer')}
          style={{
            width: `${props.sizePx()}px`,
            height: `${props.sizePx()}px`,
            'font-size': `${Math.round(props.sizePx() / 3.2)}px`,
            'margin-left': shown().length ? `-${Math.round(props.sizePx() / 5)}px` : '0px',
            ...props.maxStyle,
          }}
        >
          +{hiddenCount()}
        </button>
        </Popover>
      </Show>
    </span>
  )
}

export default Avatar
export { AvatarGroup }
