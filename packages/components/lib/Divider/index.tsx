import { Show, children as resolveChildren, createMemo, omit } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { mergeClass } from '../../common/merge'
import { dividerContentVariants, dividerRailVariants, dividerVariants } from './styles'

/** 分割线方向。 */
export type DividerOrientation = 'horizontal' | 'vertical'
/** 标题位置；left/right 为旧写法，分别等价 start/end。 */
export type DividerTitlePlacement = 'start' | 'end' | 'center' | 'left' | 'right'
/** 线型。 */
export type DividerVariant = 'solid' | 'dashed' | 'dotted'
/** 水平分割线的上下间距档位；medium 是 middle 的别名。 */
export type DividerSize = 'small' | 'middle' | 'medium' | 'large'
/** 可语义化定制的节点。 */
export type DividerSemanticName = 'root' | 'rail' | 'content'

export interface DividerProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'style' | 'children'> {
  /**
   * 方向（antd 6）。旧版本里 orientation 表示标题位置，left/right/center
   * 仍按 titlePlacement 兼容处理。
   */
  orientation?: DividerOrientation | 'left' | 'right' | 'center'
  /** 是否垂直；orientation 为方向值时以 orientation 为准。 */
  vertical?: boolean
  /** 旧写法，等价于 orientation。 */
  type?: DividerOrientation
  /** 标题位置，默认 center；优先级高于旧 orientation left/right。 */
  titlePlacement?: DividerTitlePlacement
  /** 标题靠边时与该边的距离；数字与纯数字字符串按 px。center 时无效。 */
  orientationMargin?: string | number
  /** 线型，默认 solid。 */
  variant?: DividerVariant
  /** 旧写法，等价于 variant="dashed"；显式 variant 优先。 */
  dashed?: boolean
  /** 标题使用正文字号与常规字重。 */
  plain?: boolean
  /** 水平分割线的上下间距；垂直分割线忽略。 */
  size?: DividerSize
  /** 语义化类名。 */
  classNames?: Partial<Record<DividerSemanticName, string>>
  /** 语义化内联样式。 */
  styles?: Partial<Record<DividerSemanticName, JSX.CSSProperties>>
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

const OWN_PROPS = [
  'orientation', 'vertical', 'type', 'titlePlacement', 'orientationMargin', 'variant',
  'dashed', 'plain', 'size', 'classNames', 'styles', 'class', 'style', 'children',
] as const

/** orientation（方向值）> vertical > type。 */
const resolveVertical = (props: DividerProps) => {
  if (props.orientation === 'horizontal' || props.orientation === 'vertical') return props.orientation === 'vertical'
  if (props.vertical !== undefined) return !!props.vertical
  return props.type === 'vertical'
}

/** titlePlacement > 旧 orientation（left/right/center）；left/right 归一为 start/end。 */
const resolvePlacement = (props: DividerProps): 'start' | 'end' | 'center' => {
  const legacy = props.orientation === 'left' || props.orientation === 'right' || props.orientation === 'center' ? props.orientation : undefined
  const placement = props.titlePlacement ?? legacy
  if (placement === 'left' || placement === 'start') return 'start'
  if (placement === 'right' || placement === 'end') return 'end'
  return 'center'
}

const toCssLength = (value: string | number) =>
  typeof value === 'number' || /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value

const SPACING = { small: 'small', middle: 'middle', medium: 'middle', large: 'large' } as const

const Divider = (props: DividerProps) => {
  const rest = omit(props, ...OWN_PROPS)
  const resolved = resolveChildren(() => props.children)
  const vertical = createMemo(() => resolveVertical(props))
  // 与 antd 的 !!children 一致：false/null/undefined/空串都不算标题；垂直分割线不渲染标题。
  const hasTitle = createMemo(() => {
    if (vertical()) return false
    return resolved.toArray().some(child => child !== null && child !== undefined && child !== false && child !== '')
  })
  const variant = () => props.variant ?? (props.dashed ? 'dashed' : 'solid')
  const placement = createMemo(() => resolvePlacement(props))
  const margin = createMemo(() => {
    const value = props.orientationMargin
    if (value === undefined || value === '' || placement() === 'center') return undefined
    return toCssLength(value)
  })

  const rootClass = createMemo(() => {
    const titled = hasTitle()
    const size = props.size ? SPACING[props.size] : undefined
    // large 与默认一致：无标题 24px，带标题 16px。
    const spacing = vertical() ? 'none' : size && size !== 'large' ? size : titled ? 'middle' : 'large'
    return mergeClass(
      dividerVariants({ layout: vertical() ? 'vertical' : titled ? 'titled' : 'horizontal', variant: variant(), spacing }),
      props.class,
      props.classNames?.root,
    )
  })

  const rootStyle = createMemo(() =>
    props.styles?.root ? { ...props.style, ...props.styles.root } : props.style,
  )

  const railClass = (side: 'start' | 'end') => {
    const extent = placement() === side ? (margin() !== undefined ? 'none' : 'short') : 'fill'
    return mergeClass(dividerRailVariants({ variant: variant(), extent }), props.classNames?.rail)
  }

  // orientationMargin：标题贴近的一侧 rail 收为 0，改由标题自身的外边距留白，并去掉该侧内边距。
  const contentStyle = createMemo((): JSX.CSSProperties | undefined => {
    const value = margin()
    if (value === undefined) return props.styles?.content
    const side = placement() === 'start' ? 'start' : 'end'
    return { [`margin-inline-${side}`]: value, [`padding-inline-${side}`]: '0px', ...props.styles?.content }
  })

  return (
    <div
      {...rest}
      role="separator"
      aria-orientation={vertical() ? 'vertical' : undefined}
      class={rootClass()}
      style={rootStyle()}
    >
      <Show when={hasTitle()}>
        <span class={railClass('start')} style={props.styles?.rail} />
        <span
          class={mergeClass(dividerContentVariants({ plain: !!props.plain }), props.classNames?.content)}
          style={contentStyle()}
        >
          {resolved()}
        </span>
        <span class={railClass('end')} style={props.styles?.rail} />
      </Show>
    </div>
  )
}

export default Divider
