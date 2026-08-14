import { Component, JSX, For, createMemo, mergeProps, children as resolveChildren } from 'solid-js'
import { spaceClass, compactClass } from './styles'
import { twMerge } from 'tailwind-merge'

type SpaceSize = 'small' | 'middle' | 'large' | number

export interface SpaceProps {
  direction?: 'horizontal' | 'vertical'
  size?: SpaceSize | [SpaceSize, SpaceSize]
  align?: 'start' | 'center' | 'end' | 'baseline'
  wrap?: boolean
  split?: JSX.Element
  block?: boolean
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export interface CompactProps {
  direction?: 'horizontal' | 'vertical'
  block?: boolean
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

const SIZE_MAP: Record<string, number> = {
  small: 8,
  middle: 16,
  large: 24,
}

function resolveSize(size: SpaceSize): string {
  if (typeof size === 'number') return `${size}px`
  return `${SIZE_MAP[size] || 8}px`
}

const Space: Component<SpaceProps> = (rawProps) => {
  const props = mergeProps(
    { direction: 'horizontal' as const, size: 'small' as SpaceSize, wrap: false, block: false },
    rawProps
  )

  const resolved = resolveChildren(() => rawProps.children)

  const items = createMemo(() => {
    const c = resolved()
    if (Array.isArray(c)) return c.filter((item) => item !== null && item !== undefined && item !== false && item !== true)
    if (c !== null && c !== undefined && c !== false && c !== true) return [c]
    return []
  })

  const _class = createMemo(() =>
    twMerge(
      spaceClass({ direction: props.direction, wrap: props.wrap, align: props.align, block: props.block }),
      props.class || ''
    )
  )

  const _style = createMemo((): JSX.CSSProperties => {
    const s: JSX.CSSProperties = { ...props.style }
    if (Array.isArray(props.size)) {
      s['column-gap'] = resolveSize(props.size[0])
      s['row-gap'] = resolveSize(props.size[1])
    } else {
      s.gap = resolveSize(props.size)
    }
    return s
  })

  return (
    <div class={_class()} style={_style()}>
      <For each={items()}>
        {(child, index) => (
          <>
            {index() > 0 && props.split ? <span class="flex-none">{props.split}</span> : null}
            <div class="space-item">{child}</div>
          </>
        )}
      </For>
    </div>
  )
}

export const Compact: Component<CompactProps> = (rawProps) => {
  const props = mergeProps({ direction: 'horizontal' as const, block: false }, rawProps)

  const _class = createMemo(() =>
    twMerge(
      compactClass({ direction: props.direction, block: props.block }),
      '[&>.space-item:not(:first-child):not(:last-child)]:rounded-none',
      props.direction === 'horizontal'
        ? '[&>.space-item:not(:first-child)]:ml-[-1px] [&>.space-item:first-child]:rounded-r-none [&>.space-item:last-child]:rounded-l-none'
        : '[&>.space-item:not(:first-child)]:mt-[-1px] [&>.space-item:first-child]:rounded-b-none [&>.space-item:last-child]:rounded-t-none',
      props.class || ''
    )
  )

  return (
    <div class={_class()} style={props.style}>
      {props.children}
    </div>
  )
}

export default Space
