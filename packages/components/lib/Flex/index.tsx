import { Component,  createMemo, merge } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { Dynamic } from '@solidjs/web'
import { flexClass } from './styles'
import { twMerge } from 'tailwind-merge'

type FlexGap = 'small' | 'middle' | 'large' | number | string

export interface FlexProps {
  vertical?: boolean
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse'
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly' | 'normal'
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline' | 'normal'
  flex?: string | number
  gap?: FlexGap
  inline?: boolean
  component?: string
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

const GAP_CLASS: Record<string, string> = {
  small: 'gap-xs',
  middle: 'gap-md',
  large: 'gap-lg',
}

const Flex: Component<FlexProps> = (rawProps) => {
  const props = merge(
    { vertical: false, wrap: 'nowrap' as const, justify: 'normal' as const, align: 'normal' as const, inline: false, component: 'div' },
    rawProps
  )

  const _class = createMemo(() => {
    const base = flexClass({
      vertical: !!props.vertical,
      wrap: props.wrap,
      justify: props.justify,
      align: props.align,
      inline: !!props.inline,
    })
    const gapCls = typeof props.gap === 'string' && GAP_CLASS[props.gap] ? GAP_CLASS[props.gap] : ''
    return twMerge(base, gapCls, props.class || '')
  })

  const _style = createMemo((): JSX.CSSProperties => {
    const s: JSX.CSSProperties = { ...props.style }
    if (props.gap !== undefined && typeof props.gap === 'number') {
      s.gap = `${props.gap}px`
    } else if (typeof props.gap === 'string' && !GAP_CLASS[props.gap]) {
      s.gap = props.gap
    }
    if (props.flex !== undefined) {
      s.flex = typeof props.flex === 'number' ? `${props.flex} ${props.flex} auto` : props.flex
    }
    return s
  })

  return (
    <Dynamic component={props.component as any} class={_class()} style={_style()}>
      {props.children}
    </Dynamic>
  )
}

export default Flex
