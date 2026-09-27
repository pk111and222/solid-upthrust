import { Match, Show, Switch, children as resolveChildren, createMemo, merge, omit } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { badgeOffsetStyle, createBadge, resolveBadgeColorKey, type BadgeStatus, type PresetColor } from 'upthrust-competence'
import { mergeClass } from '../../common/merge'
import { numberToText } from '../../common/renderable'
import {
  badgeCountClass, badgeCustomClass, badgeDotClass, badgeRootClass, badgeStatusDotClass, badgeStatusTextClass,
  ribbonClass, ribbonContentClass, ribbonWrapperClass,
} from './styles'

export type { BadgeStatus } from 'upthrust-competence'
/** middle 为本库命名；medium 为 antd 6 命名，两者等价。 */
export type BadgeSize = 'small' | 'middle' | 'medium'
/** antd 预设色板、本库扩展的 gray，或任意 CSS 颜色。 */
export type BadgeColor = PresetColor | 'gray' | (string & {})
export type BadgePlacement = 'start' | 'end'

export interface BadgeSemanticSlots {
  root?: string
  indicator?: string
}

export interface BadgeSemanticStyles {
  root?: JSX.CSSProperties
  indicator?: JSX.CSSProperties
}

export interface BadgeProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'title' | 'children' | 'class' | 'style' | 'color'> {
  /** 数字/字符串渲染为圆角数字（超出 overflowCount 显示 N+）；JSX 为自定义徽标节点。 */
  count?: number | string | JSX.Element
  /** 封顶数值，默认 99。 */
  overflowCount?: number
  /** 数值为 0 时仍然显示。 */
  showZero?: boolean
  /** 只显示小圆点。 */
  dot?: boolean
  /** 数字尺寸，默认 middle。 */
  size?: BadgeSize
  /** [x, y] 偏移：x 越大越向右外移（right: -x），y 为 margin-top。 */
  offset?: [number | string, number | string]
  status?: BadgeStatus
  color?: BadgeColor
  /** 状态点旁的文本（status 或 color 时生效）。 */
  text?: JSX.Element
  /** 悬停提示，默认取 count；null/false 移除。 */
  title?: string | null | false
  classNames?: BadgeSemanticSlots
  styles?: BadgeSemanticStyles
  class?: string
  /** 与 antd 一致：状态点模式作用于根节点，其余作用于徽标节点。 */
  style?: JSX.CSSProperties
  /** 被包裹的元素，徽标定位在其右上角。 */
  children?: JSX.Element
}

const OWN = [
  'count', 'overflowCount', 'showZero', 'dot', 'size', 'offset', 'status', 'color', 'text', 'title',
  'classNames', 'styles', 'class', 'style', 'children',
] as const

const isRenderable = (node: unknown) => node !== undefined && node !== null && node !== false && node !== true && node !== ''

/** 单节点直接返回，多节点保持数组；空数组视为未设置。 */
const single = (value: unknown) => Array.isArray(value) ? (value.length === 0 ? undefined : value.length === 1 ? value[0] : value) : value

/** antd ScrollNumber：style.borderColor 以内嵌阴影模拟描边。 */
const withBorderShadow = (style: JSX.CSSProperties): JSX.CSSProperties => {
  const border = style['border-color']
  return border ? { ...style, 'box-shadow': `0 0 0 1px ${border} inset` } : style
}

const Badge = (rawProps: BadgeProps) => {
  const props = merge({ size: 'middle' as BadgeSize, overflowCount: 99 }, rawProps)
  const rest = omit(rawProps, ...OWN)

  // JSX 属性每次读取都会新建节点：children / count / text 各解析一次后复用。
  const resolvedChildren = resolveChildren(() => props.children)
  const resolvedCount = resolveChildren(() => props.count as JSX.Element)
  const resolvedText = resolveChildren(() => props.text)
  const hasChildren = createMemo(() => resolvedChildren.toArray().some(isRenderable))
  const count = createMemo(() => single(resolvedCount()))
  const text = createMemo(() => single(resolvedText()))

  const badge = createBadge({
    get count() { return count() },
    get overflowCount() { return props.overflowCount },
    get showZero() { return props.showZero },
    get dot() { return props.dot },
    get status() { return props.status },
    get color() { return props.color },
    get text() { return text() },
    get hasChildren() { return hasChildren() },
  })
  const display = badge.display

  // 离场动画期间保留最后一次可见的内容与形态（antd 的 countRef / isDotRef）。
  const shown = createMemo<{ dot: boolean; custom: boolean; count: unknown; words: boolean; title: string | undefined }>(previous => {
    const d = display()
    if (d.hidden && previous) return previous
    const raw = count()
    const fallbackTitle = typeof raw === 'string' || typeof raw === 'number' ? String(raw) : undefined
    const title = props.title === null || props.title === false ? undefined : props.title ?? fallbackTitle
    return { dot: d.showAsDot, custom: d.isCustom, count: numberToText(d.displayCount), words: d.multipleWords, title }
  })

  const offsetStyle = createMemo(() => badgeOffsetStyle(props.offset))
  const isCustomColor = () => resolveBadgeColorKey('count', undefined, props.color) === 'custom'

  const indicatorStyle = createMemo((): JSX.CSSProperties => withBorderShadow({
    ...offsetStyle(),
    ...props.styles?.indicator,
    ...props.style,
    // antd：自定义颜色最后写入，覆盖 style 中的背景
    ...(isCustomColor() ? { 'background-color': props.color } : undefined),
  }))

  const rootClass = (mode: 'wrapped' | 'standalone' | 'status') =>
    mergeClass(badgeRootClass({ mode }), props.class, props.classNames?.root)

  const anchor = () => hasChildren() ? 'wrapped' as const : 'standalone' as const
  const visible = () => !display().hidden
  const size = () => props.size === 'small' ? 'small' as const : 'middle' as const

  const statusRootStyle = createMemo((): JSX.CSSProperties => ({ ...offsetStyle(), ...props.styles?.root, ...props.style }))
  const statusKey = createMemo(() => resolveBadgeColorKey('status', props.status, props.color))
  const dotKey = createMemo(() => resolveBadgeColorKey('dot', props.status, props.color))
  const countKey = createMemo(() => resolveBadgeColorKey('count', props.status, props.color))

  // 三种徽标节点各自常驻：只有形态切换才重建，可见性/数字变化只改属性，缩放过渡才能播放。
  const dataShow = () => visible() ? 'true' : 'false'
  const ariaHidden = () => visible() ? undefined : 'true' as const
  const title = () => visible() ? shown().title : undefined

  return <Show
    when={!display().isStatusBadge}
    fallback={<span {...rest} class={rootClass('status')} style={statusRootStyle()}>
      <span
        class={mergeClass(badgeStatusDotClass({ color: statusKey(), processing: props.status === 'processing' }), props.classNames?.indicator)}
        style={{ ...props.styles?.indicator, ...(statusKey() === 'custom' ? { color: props.color, 'background-color': props.color } : undefined) }}
      />
      <Show when={display().textVisible}>
        <span class={badgeStatusTextClass} style={statusRootStyle().color ? { color: statusRootStyle().color } : undefined}>{numberToText(text()) as JSX.Element}</span>
      </Show>
    </span>}
  >
    <span {...rest} class={rootClass(hasChildren() ? 'wrapped' : 'standalone')} style={props.styles?.root}>
      {resolvedChildren()}
      {/* 包裹时常驻节点以播放缩放离场；独立使用时隐藏即移除，不占位。 */}
      <Show when={hasChildren() || visible()}>
        <Switch>
          <Match when={shown().custom}>
            <span
              data-show={dataShow()} aria-hidden={ariaHidden()} title={title()}
              class={mergeClass(badgeCustomClass({ anchor: anchor(), visible: visible() }), props.classNames?.indicator)}
              style={withBorderShadow({ ...offsetStyle(), ...props.styles?.indicator, ...props.style })}
            >{shown().count as JSX.Element}</span>
          </Match>
          <Match when={shown().dot}>
            <span
              data-show={dataShow()} aria-hidden={ariaHidden()} title={title()}
              class={mergeClass(badgeDotClass({ anchor: anchor(), color: dotKey(), visible: visible() }), props.classNames?.indicator)}
              style={indicatorStyle()}
            />
          </Match>
          <Match when={true}>
            <span
              data-show={dataShow()} aria-hidden={ariaHidden()} title={title()}
              class={mergeClass(badgeCountClass({ anchor: anchor(), size: size(), color: countKey(), words: shown().words, visible: visible() }), props.classNames?.indicator)}
              style={indicatorStyle()}
            >{shown().count as JSX.Element}</span>
          </Match>
        </Switch>
      </Show>
      <Show when={display().textVisible}>
        <span class={badgeStatusTextClass}>{numberToText(text()) as JSX.Element}</span>
      </Show>
    </span>
  </Show>
}

export interface BadgeRibbonProps {
  /** 缎带内容。 */
  text?: JSX.Element
  /** 预设色板、本库扩展的 gray 或任意 CSS 颜色；默认主题主色。 */
  color?: BadgeColor
  /** 缎带所在的角，默认 end。 */
  placement?: BadgePlacement
  classNames?: { root?: string; indicator?: string; content?: string }
  styles?: { root?: JSX.CSSProperties; indicator?: JSX.CSSProperties; content?: JSX.CSSProperties }
  /** 与 antd 一致作用于缎带节点（indicator）。根节点使用 classNames.root / styles.root。 */
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

const BadgeRibbon = (rawProps: BadgeRibbonProps) => {
  const props = merge({ placement: 'end' as BadgePlacement }, rawProps)
  const colorKey = createMemo(() => {
    if (props.color === undefined || props.color === null || props.color === '') return 'primary' as const
    const key = resolveBadgeColorKey('count', undefined, props.color)
    return key === 'error' ? 'primary' as const : key
  })
  const ribbonStyle = createMemo((): JSX.CSSProperties | undefined => {
    const custom = colorKey() === 'custom' ? { 'background-color': props.color, color: props.color } : undefined
    if (!custom && !props.styles?.indicator && !props.style) return undefined
    return { ...custom, ...props.styles?.indicator, ...props.style }
  })

  return <div class={mergeClass(ribbonWrapperClass, props.classNames?.root)} style={props.styles?.root}>
    {props.children}
    <div
      class={mergeClass(ribbonClass({ placement: props.placement, color: colorKey() as never }), props.class, props.classNames?.indicator)}
      style={ribbonStyle()}
    >
      <span class={mergeClass(ribbonContentClass, props.classNames?.content)} style={props.styles?.content}>{props.text}</span>
    </div>
  </div>
}

export default Badge
export { BadgeRibbon }
