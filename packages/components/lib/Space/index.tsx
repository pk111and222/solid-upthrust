import { For, Show, children as resolveChildren, createMemo, omit } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { mergeClass } from '../../common/merge'
import {
  SPACE_ADDON_CLASS, SPACE_ITEM_CLASS, SPACE_SEPARATOR_CLASS,
  compactVariants, isPresetSize, spaceVariants, type SpacePresetSize,
} from './styles'

export type { SpacePresetSize } from './styles'

/** 排列方向。 */
export type SpaceOrientation = 'horizontal' | 'vertical'
/** 间距：预设档位走主题 token，数字按 px，其余字符串原样写入 CSS。 */
export type SpaceSize = SpacePresetSize | number | (string & {})
/** 交叉轴对齐。 */
export type SpaceAlign = 'start' | 'end' | 'center' | 'baseline'
/** 可语义化定制的节点。 */
export type SpaceSemanticName = 'root' | 'item' | 'separator'

export interface SpaceProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'style' | 'children'> {
  /** 排列方向，优先级高于 vertical 与 direction。 */
  orientation?: SpaceOrientation
  /** 是否纵向排列；优先级高于 direction。 */
  vertical?: boolean
  /** 旧写法，等价于 orientation。 */
  direction?: SpaceOrientation
  /** 间距；数组形式为 [水平, 垂直]。默认 'small'（8px）。 */
  size?: SpaceSize | [SpaceSize, SpaceSize]
  /** 交叉轴对齐；水平方向默认 center，纵向默认不设置（stretch）。 */
  align?: SpaceAlign
  /** 是否自动换行（仅水平方向有意义）。 */
  wrap?: boolean
  /** 撑满父容器宽度（display:flex + width:100%）。 */
  block?: boolean
  /** 相邻子节点之间的分隔内容（antd 6 名称）。 */
  separator?: JSX.Element
  /** 同 separator，保留的旧名称；两者同时传入时 separator 优先。 */
  split?: JSX.Element
  /** 语义化类名。 */
  classNames?: Partial<Record<SpaceSemanticName, string>>
  /** 语义化内联样式。 */
  styles?: Partial<Record<SpaceSemanticName, JSX.CSSProperties>>
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export interface SpaceCompactProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'style' | 'children'> {
  /** 排列方向，优先级高于 vertical 与 direction。 */
  orientation?: SpaceOrientation
  /** 是否纵向排列；优先级高于 direction。 */
  vertical?: boolean
  /** 旧写法，等价于 orientation。 */
  direction?: SpaceOrientation
  /** 撑满父容器宽度。 */
  block?: boolean
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

/** @deprecated 使用 SpaceCompactProps。 */
export type CompactProps = SpaceCompactProps

export interface SpaceAddonProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'class' | 'children'> {
  class?: string
  children?: JSX.Element
}

type OrientationProps = Pick<SpaceProps, 'orientation' | 'vertical' | 'direction'>

/** orientation（合法值）> vertical > direction。 */
const resolveVertical = (props: OrientationProps) => {
  if (props.orientation === 'horizontal' || props.orientation === 'vertical') return props.orientation === 'vertical'
  if (props.vertical !== undefined) return !!props.vertical
  return props.direction === 'vertical'
}

const toCssSize = (size: SpaceSize) => (typeof size === 'number' ? `${size}px` : size)

/** 与 antd 相同：null/undefined/布尔/空串不算子节点；数字 0 保留。 */
const isRenderable = (child: unknown) =>
  child !== null && child !== undefined && typeof child !== 'boolean' && child !== ''

/** 数字子节点转成字符串再插入：Solid 对纯数字走 textContent 赋值，happy-dom 会把 0 写成空串。 */
const renderChild = (child: unknown) => (typeof child === 'number' ? String(child) : child) as JSX.Element

const SPACE_PROPS = [
  'orientation', 'vertical', 'direction', 'size', 'align', 'wrap', 'block',
  'separator', 'split', 'classNames', 'styles', 'class', 'style', 'children',
] as const

const SpaceRoot = (props: SpaceProps) => {
  const rest = omit(props, ...SPACE_PROPS)
  const resolved = resolveChildren(() => props.children)
  const items = createMemo(() => resolved.toArray().filter(isRenderable))
  const vertical = createMemo(() => resolveVertical(props))
  // split/separator 的 JSX 每次读取都会新建节点：这里只用于判断有无，渲染时逐处再读一次。
  const hasSeparator = createMemo(() => isRenderable(props.separator ?? props.split))
  const size = () => props.size ?? 'small'

  const classes = createMemo(() => {
    const value = size()
    const [x, y] = Array.isArray(value) ? value : [undefined, undefined]
    return mergeClass(
      spaceVariants({
        block: !!props.block,
        vertical: vertical(),
        wrap: !!props.wrap,
        align: props.align ?? (vertical() ? undefined : 'center'),
        gap: !Array.isArray(value) && isPresetSize(value) ? value : undefined,
        gapX: isPresetSize(x) ? x : undefined,
        gapY: isPresetSize(y) ? y : undefined,
      }),
      props.class,
      props.classNames?.root,
    )
  })

  // 自定义尺寸写内联 gap；预设档位由类名负责，不产生空的 style 属性。
  const style = createMemo((): JSX.CSSProperties | undefined => {
    const value = size()
    const custom: JSX.CSSProperties = {}
    if (Array.isArray(value)) {
      const [x, y] = value
      if (x != null && !isPresetSize(x)) custom['column-gap'] = toCssSize(x)
      if (y != null && !isPresetSize(y)) custom['row-gap'] = toCssSize(y)
    } else if (value != null && !isPresetSize(value)) {
      custom.gap = toCssSize(value)
    }
    const hasCustom = Object.keys(custom).length > 0
    if (!hasCustom && !props.styles?.root) return props.style
    return { ...custom, ...props.style, ...props.styles?.root }
  })

  return (
    <Show when={items().length > 0}>
      <div {...rest} class={classes()} style={style()}>
        <For each={items()}>
          {(child, index) => (
            <>
              <Show when={index() > 0 && hasSeparator()}>
                <span class={mergeClass(SPACE_SEPARATOR_CLASS, props.classNames?.separator)} style={props.styles?.separator}>
                  {props.separator ?? props.split}
                </span>
              </Show>
              <div class={mergeClass(SPACE_ITEM_CLASS, props.classNames?.item)} style={props.styles?.item}>
                {renderChild(child)}
              </div>
            </>
          )}
        </For>
      </div>
    </Show>
  )
}

const COMPACT_PROPS = ['orientation', 'vertical', 'direction', 'block', 'class', 'children'] as const

/** 紧凑布局：子元素首尾相接、合并边框与圆角，常用于按钮组、输入框组合。 */
export const Compact = (props: SpaceCompactProps) => {
  const rest = omit(props, ...COMPACT_PROPS)
  const classes = createMemo(() => mergeClass(
    compactVariants({ block: !!props.block, vertical: resolveVertical(props) }),
    props.class,
  ))
  return <div {...rest} class={classes()}>{props.children}</div>
}

/** 紧凑组合里的文本单元（如 URL 前缀、单位），与按钮/输入框拼接。 */
export const Addon = (props: SpaceAddonProps) => {
  const rest = omit(props, 'class', 'children')
  return <span {...rest} class={mergeClass(...SPACE_ADDON_CLASS, props.class)}>{props.children}</span>
}

const Space = Object.assign(SpaceRoot, { Compact, Addon })

export default Space
