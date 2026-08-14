import { Component, JSX, createMemo, mergeProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
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

const GAP_MAP: Record<string, string> = {
  small: '8px',
  middle: '16px',
  large: '24px',
}

const Flex: Component<FlexProps> = (rawProps) => {
  const props = mergeProps(
    { vertical: false, wrap: 'nowrap' as const, justify: 'normal' as const, align: 'normal' as const, inline: false, component: 'div' },
    rawProps
  )

  const _class = createMemo(() =>
    twMerge(
      flexClass({
        vertical: props.vertical,
        wrap: props.wrap,
        justify: props.justify,
        align: props.align,
        inline: props.inline,
      }),
      props.class || ''
    )
  )

  const _style = createMemo((): JSX.CSSProperties => {
    const s: JSX.CSSProperties = { ...props.style }
    if (props.gap !== undefined) {
      const gapValue = typeof props.gap === 'number'
        ? `${props.gap}px`
        : (GAP_MAP[props.gap] || props.gap)
      s.gap = gapValue
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
