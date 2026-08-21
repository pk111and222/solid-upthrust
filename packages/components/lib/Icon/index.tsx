import { Component,  createMemo, merge } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { iconClass } from './styles'

export interface IconProps {
  /** Iconify identifier: "collection:name" (e.g. "mdi:home", "material-symbols:15mp-outline"). Without colon defaults to mdi. */
  name: string
  size?: 'small' | 'middle' | 'large' | number | string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'inherit'
  spin?: boolean
  rotate?: number
  class?: string
  style?: JSX.CSSProperties
  onClick?: (e: MouseEvent) => void
}

const NAMED_SIZES = ['small', 'middle', 'large']

function toIconClass(name: string): string {
  const colonIdx = name.indexOf(':')
  if (colonIdx === -1) {
    return `i-mdi-${name}`
  }
  const collection = name.slice(0, colonIdx)
  const icon = name.slice(colonIdx + 1)
  return `i-${collection}-${icon}`
}

const Icon: Component<IconProps> = (rawProps) => {
  const props = merge({ size: 'middle' as const, color: 'inherit' as const, spin: false }, rawProps)

  const _class = createMemo(() => {
    const variantCls = iconClass({
      size: NAMED_SIZES.includes(props.size as string) ? props.size as 'small' | 'middle' | 'large' : undefined,
      color: props.color,
      spin: props.spin,
    })
    return `${toIconClass(props.name)} ${variantCls} ${props.class || ''}`.trim()
  })

  const _style = createMemo((): JSX.CSSProperties => {
    const s: JSX.CSSProperties = { ...props.style }
    if (typeof props.size === 'number') {
      s['font-size'] = `${props.size}px`
    } else if (typeof props.size === 'string' && !NAMED_SIZES.includes(props.size)) {
      s['font-size'] = props.size
    }
    if (props.rotate) {
      s.transform = `rotate(${props.rotate}deg)`
    }
    return s
  })

  return <span class={_class()} style={_style()} onClick={props.onClick} />
}

export default Icon
export { toIconClass }
