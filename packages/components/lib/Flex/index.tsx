import { createMemo, omit } from 'solid-js'
import { Dynamic, type JSX, type ValidComponent } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import { flexClass, isPresetGap, type FlexAlign, type FlexGap, type FlexJustify, type FlexWrap } from './styles'

export type { FlexAlign, FlexGap, FlexJustify, FlexWrap } from './styles'

/** 主轴方向；合法值优先于 vertical。 */
export type FlexOrientation = 'horizontal' | 'vertical'

export interface FlexProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'class' | 'style' | 'children'> {
  /** 是否纵向排列；orientation 为合法值时以 orientation 为准。默认 false。 */
  vertical?: boolean
  /** 主轴方向，优先级高于 vertical。 */
  orientation?: FlexOrientation
  /** 换行方式：true 等价 'wrap'，false 等价 'nowrap'；不传时沿用 CSS 初始值 nowrap。 */
  wrap?: boolean | FlexWrap
  /** 主轴对齐（justify-content）。 */
  justify?: FlexJustify
  /** 交叉轴对齐（align-items）。 */
  align?: FlexAlign
  /** 容器自身的 flex 简写，原样写入 style（数字 1 即 flex:1）。 */
  flex?: string | number
  /** 子元素间距：small/middle/medium/large 走主题 token，数字按 px，其他字符串原样写入。 */
  gap?: FlexGap
  /** 使用 inline-flex。默认 false。 */
  inline?: boolean
  /** 宿主元素：原生标签名或组件，默认 'div'。 */
  component?: ValidComponent
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

const OWN_PROPS = [
  'vertical', 'orientation', 'wrap', 'justify', 'align', 'flex', 'gap',
  'inline', 'component', 'class', 'style', 'children',
] as const

const resolveVertical = (props: FlexProps) =>
  props.orientation === 'horizontal' || props.orientation === 'vertical'
    ? props.orientation === 'vertical'
    : !!props.vertical

const resolveWrap = (wrap: FlexProps['wrap']): FlexWrap | undefined =>
  wrap === true ? 'wrap' : wrap === false ? 'nowrap' : wrap

const Flex = (props: FlexProps) => {
  const rest = omit(props, ...OWN_PROPS)

  const classes = createMemo(() => twMerge(
    flexClass({
      inline: !!props.inline,
      vertical: resolveVertical(props),
      wrap: resolveWrap(props.wrap),
      justify: props.justify,
      align: props.align,
      gap: isPresetGap(props.gap) ? props.gap : undefined,
    }),
    props.class,
  ))

  // gap/flex 属性覆盖 style 里的同名项；预设 gap 由类名负责，不写内联值。
  const style = createMemo((): JSX.CSSProperties | undefined => {
    const { gap, flex } = props
    const customGap = gap != null && !isPresetGap(gap)
    if (!customGap && flex == null) return props.style
    const next: JSX.CSSProperties = { ...props.style }
    if (customGap) next.gap = typeof gap === 'number' ? `${gap}px` : gap
    if (flex != null) next.flex = String(flex)
    return next
  })

  return (
    <Dynamic component={props.component ?? 'div'} {...rest} class={classes()} style={style()}>
      {props.children}
    </Dynamic>
  )
}

export default Flex
