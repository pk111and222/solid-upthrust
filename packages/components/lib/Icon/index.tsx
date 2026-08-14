import { Component, JSX, createMemo, mergeProps } from 'solid-js'
import { iconClass } from './styles'

export interface IconProps {
  name: string
  size?: 'small' | 'medium' | 'large' | number | string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'inherit'
  spin?: boolean
  rotate?: number
  class?: string
  style?: JSX.CSSProperties
}

const NAMED_SIZES = ['small', 'medium', 'large']

const Icon: Component<IconProps> = (rawProps) => {
  const props = mergeProps({ size: 'medium' as const, color: 'inherit' as const, spin: false }, rawProps)

  const _class = createMemo(() => {
    const variantCls = iconClass({
      size: NAMED_SIZES.includes(props.size as string) ? props.size as 'small' | 'medium' | 'large' : undefined,
      color: props.color,
      spin: props.spin,
    })
    return `i-mdi-${props.name} ${variantCls} ${props.class || ''}`.trim()
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

  return <div class={_class()} style={_style()} />
}

export default Icon
