import { createContext, createMemo, omit, useContext, type Accessor } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { mergeClass } from '../../common/merge'
import { createBreakpoint, resolveResponsive, type ResponsiveValue, type ScreenMap } from 'upthrust-competence'
import { colLayout, halfGutter, parseFlex, rowGap, type ColSize, type ColSpanType, type GutterValue } from './layout'
import { COL_BASE_CLASS, COL_DEFAULT_MAX_WIDTH_CLASS, rowClass } from './styles'

export type { ColSize, ColSpanType, GutterValue } from './layout'
export type { ResponsiveValue, ScreenMap } from 'upthrust-competence'

/** 主轴对齐（justify-content）。 */
export type RowJustify = 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'
/** 交叉轴对齐（align-items）。 */
export type RowAlign = 'top' | 'middle' | 'bottom' | 'stretch'
/** 单方向间距：数字（px）、CSS 长度字符串，或按断点取值的对象。 */
export type Gutter = GutterValue | ResponsiveValue<GutterValue>

export interface RowProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'style' | 'children'> {
  /** 栅格间距；数组形式为 [水平, 垂直]。数字按 px，字符串为 CSS 长度，对象按断点取值。 */
  gutter?: Gutter | [Gutter, Gutter]
  /** 水平排列方式，支持按断点取值。 */
  justify?: RowJustify | ResponsiveValue<RowJustify>
  /** 垂直对齐方式，支持按断点取值；不传时为 CSS 默认的 stretch。 */
  align?: RowAlign | ResponsiveValue<RowAlign>
  /** 是否自动换行。默认 true。 */
  wrap?: boolean
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export interface ColProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'style' | 'children'> {
  /** 栅格占位格数（共 24 格），0 隐藏；不传时宽度由内容决定。 */
  span?: ColSpanType
  /** 左侧间隔格数。 */
  offset?: ColSpanType
  /** 向右移动格数。 */
  push?: ColSpanType
  /** 向左移动格数。 */
  pull?: ColSpanType
  /** 栅格顺序（CSS order）。 */
  order?: ColSpanType
  /** flex 布局属性：数字 n → `n n auto`，长度 → `0 0 长度`，其余原样。 */
  flex?: number | string
  /** 屏幕 < 576px，无媒体查询，与基础 props 合并。 */
  xs?: ColSpanType | ColSize
  /** 屏幕 ≥ 576px。 */
  sm?: ColSpanType | ColSize
  /** 屏幕 ≥ 768px。 */
  md?: ColSpanType | ColSize
  /** 屏幕 ≥ 992px。 */
  lg?: ColSpanType | ColSize
  /** 屏幕 ≥ 1200px。 */
  xl?: ColSpanType | ColSize
  /** 屏幕 ≥ 1600px。 */
  xxl?: ColSpanType | ColSize
  /** 屏幕 ≥ 1920px。 */
  xxxl?: ColSpanType | ColSize
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

type RowContextValue = {
  /** 当前断点下解析后的 [水平, 垂直] 间距。 */
  gutter: Accessor<[GutterValue | undefined, GutterValue | undefined]>
  wrap: Accessor<boolean>
}

const RowContext = createContext<RowContextValue>({ gutter: () => [undefined, undefined], wrap: () => true })

const ROW_PROPS = ['gutter', 'justify', 'align', 'wrap', 'class', 'style', 'children'] as const
const COL_PROPS = [
  'span', 'offset', 'push', 'pull', 'order', 'flex',
  'xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl', 'class', 'style', 'children',
] as const

export const Row = (props: RowProps) => {
  const rest = omit(props, ...ROW_PROPS)
  const breakpoint = createBreakpoint()
  const wrap = () => props.wrap !== false

  const gutter = createMemo((): [GutterValue | undefined, GutterValue | undefined] => {
    const screens = breakpoint.screens()
    const [h, v] = Array.isArray(props.gutter) ? props.gutter : [props.gutter, undefined]
    return [resolveResponsive(h, screens), resolveResponsive(v, screens)]
  })

  const classes = createMemo(() => {
    const screens = breakpoint.screens()
    return mergeClass(
      rowClass({
        wrap: wrap(),
        justify: resolveResponsive(props.justify, screens),
        align: resolveResponsive(props.align, screens),
      }),
      props.class,
    )
  })

  // 间距覆盖 style 里的同名项；没有间距时原样返回用户 style，不产生空的 style 属性。
  const style = createMemo((): JSX.CSSProperties | undefined => {
    const [h, v] = gutter()
    const margin = halfGutter(h, -1)
    const gap = rowGap(v)
    if (!margin && !gap) return props.style
    const next: JSX.CSSProperties = { ...props.style }
    if (margin) { next['margin-left'] = margin; next['margin-right'] = margin }
    if (gap) next['row-gap'] = gap
    return next
  })

  return (
    <RowContext value={{ gutter, wrap }}>
      <div {...rest} class={classes()} style={style()}>
        {props.children}
      </div>
    </RowContext>
  )
}

export const Col = (props: ColProps) => {
  const rest = omit(props, ...COL_PROPS)
  const row = useContext(RowContext)
  const layout = createMemo(() => colLayout(props))

  const classes = createMemo(() => {
    const { classes: layerClasses, hasBaseMaxWidth } = layout()
    return mergeClass(
      ...COL_BASE_CLASS,
      hasBaseMaxWidth ? undefined : COL_DEFAULT_MAX_WIDTH_CLASS,
      ...layerClasses,
      props.class,
    )
  })

  // 顺序：断点变量 → 间距内边距 → flex 内联值 → 用户 style（同名项以用户为准）。
  const style = createMemo((): JSX.CSSProperties | undefined => {
    const { vars } = layout()
    const padding = halfGutter(row.gutter()[0], 1)
    const flex = props.flex
    const hasFlex = flex !== undefined && flex !== ''
    if (!padding && !hasFlex && Object.keys(vars).length === 0) return props.style
    const next: JSX.CSSProperties = { ...vars }
    if (padding) { next['padding-left'] = padding; next['padding-right'] = padding }
    if (hasFlex) {
      next.flex = parseFlex(flex)
      // 不换行的行里，flex 列补 min-width:0，避免长内容撑破行宽。
      if (!row.wrap()) next['min-width'] = '0'
    }
    return { ...next, ...props.style }
  })

  return (
    <div {...rest} class={classes()} style={style()}>
      {props.children}
    </div>
  )
}

/**
 * 当前命中的断点表 `{ xs, sm, md, lg, xl, xxl, xxxl }`，随窗口变化更新；
 * 没有 matchMedia（SSR）时为空对象。须在组件或 createRoot 内调用。
 */
export const useBreakpoint = (): Accessor<ScreenMap> => {
  const breakpoint = createBreakpoint()
  return () => breakpoint.screens() ?? {}
}

const Grid = { Row, Col, useBreakpoint }

export default Grid
