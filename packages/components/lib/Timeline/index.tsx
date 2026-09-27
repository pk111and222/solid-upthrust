import { For, Show, children as resolveChildren, createMemo, merge, omit } from 'solid-js'
import type { JSX } from '@solidjs/web'
import {
  normalizeTimelineItems, normalizeTimelineMode, timelineHeadSpan, timelineLayoutAlternate, timelineRailStatus,
  type TimelineItemStatus, type TimelineMode, type TimelineLegacyMode, type TimelineOrientation, type TimelinePlacement,
  type TimelineNormalizedItem,
} from 'upthrust-competence'
import { mergeClass } from '../../common/merge'
import { numberToText } from '../../common/renderable'
import { resolveSemantic, type SemanticInput } from '../../common/semantic'
import {
  timelineClass, timelineContentClass, timelineHeaderClass, timelineIconClass, timelineItemClass, timelineRailClass,
  timelineSectionClass, timelineTitleClass, timelineWrapperClass, type TimelineLayout,
} from './styles'

export type { TimelineMode, TimelineLegacyMode, TimelineOrientation, TimelinePlacement, TimelineItemStatus } from 'upthrust-competence'
export type TimelineVariant = 'outlined' | 'filled'
/** 预设 blue / red / green / gray，或任意 CSS 颜色。 */
export type TimelineColor = 'blue' | 'red' | 'green' | 'gray' | (string & {})

export interface TimelineItemSemanticClassNames {
  root?: string; wrapper?: string; icon?: string; header?: string; title?: string; section?: string; content?: string; rail?: string
}
export interface TimelineItemSemanticStyles {
  root?: JSX.CSSProperties; wrapper?: JSX.CSSProperties; icon?: JSX.CSSProperties; header?: JSX.CSSProperties
  title?: JSX.CSSProperties; section?: JSX.CSSProperties; content?: JSX.CSSProperties; rail?: JSX.CSSProperties
}

export interface TimelineItemProps {
  key?: string | number
  /** 圆点颜色，默认 blue。 */
  color?: TimelineColor
  title?: JSX.Element
  /** @deprecated 请使用 title */
  label?: JSX.Element
  content?: JSX.Element
  /** @deprecated 请使用 content */
  children?: JSX.Element
  /** 自定义节点图标。 */
  icon?: JSX.Element
  /** @deprecated 请使用 icon */
  dot?: JSX.Element
  /** 加载中：无 icon 时显示加载图标。 */
  loading?: boolean
  /** 节点位置（覆盖 mode 推导）。 */
  placement?: TimelinePlacement
  /** @deprecated 请使用 placement */
  position?: TimelinePlacement
  classNames?: TimelineItemSemanticClassNames
  styles?: TimelineItemSemanticStyles
  class?: string
  style?: JSX.CSSProperties
}

export interface TimelineSemanticClassNames {
  root?: string; item?: string; itemWrapper?: string; itemIcon?: string; itemSection?: string; itemHeader?: string
  itemTitle?: string; itemContent?: string; itemRail?: string
}
export interface TimelineSemanticStyles {
  root?: JSX.CSSProperties; item?: JSX.CSSProperties; itemWrapper?: JSX.CSSProperties; itemIcon?: JSX.CSSProperties
  itemSection?: JSX.CSSProperties; itemHeader?: JSX.CSSProperties; itemTitle?: JSX.CSSProperties
  itemContent?: JSX.CSSProperties; itemRail?: JSX.CSSProperties
}
/** 函数形式 classNames / styles 的参数：props 含合并后的 mode / orientation / variant / items。 */
export interface TimelineSemanticInfo {
  props: TimelineProps & { mode: TimelineMode; orientation: TimelineOrientation; variant: TimelineVariant; items: TimelineItemProps[] }
}

export interface TimelineProps extends Omit<JSX.HTMLAttributes<HTMLOListElement>, 'class' | 'style' | 'children'> {
  items?: TimelineItemProps[]
  /** 'start' | 'alternate' | 'end'，默认 'start'；'left' / 'right' 为废弃别名。 */
  mode?: TimelineMode | TimelineLegacyMode
  /** 默认 'vertical'。 */
  orientation?: TimelineOrientation
  /** 默认 'outlined'。 */
  variant?: TimelineVariant
  /** 节点倒序。 */
  reverse?: boolean
  /** 标题占比（到圆点中心的距离）：数字为 24 栅格份数，字符串为 CSS 长度；默认 12。 */
  titleSpan?: number | string
  /** @deprecated 直接追加一个 loading 节点 */
  pending?: JSX.Element
  /** @deprecated 直接追加一个带 icon 的节点 */
  pendingDot?: JSX.Element
  classNames?: SemanticInput<TimelineSemanticClassNames, TimelineSemanticInfo>
  styles?: SemanticInput<TimelineSemanticStyles, TimelineSemanticInfo>
  class?: string
  style?: JSX.CSSProperties
}

const OWN = ['items', 'mode', 'orientation', 'variant', 'reverse', 'titleSpan', 'pending', 'pendingDot', 'classNames', 'styles', 'class', 'style'] as const

/** antd isNonNullable + 非空字符串：只有这些值才渲染节点。 */
const present = (node: unknown) => node !== undefined && node !== null && node !== false && node !== ''

type Item = TimelineNormalizedItem<JSX.Element, TimelineItemProps>

const Timeline = (rawProps: TimelineProps) => {
  const props = merge({ orientation: 'vertical', variant: 'outlined', reverse: false } as const, rawProps)
  const rest = omit(rawProps, ...OWN)

  const mode = createMemo(() => normalizeTimelineMode(props.mode))
  // pending / pendingDot 是 JSX：解析一次，渲染复用同一份节点。
  const pending = resolveChildren(() => props.pending)
  const pendingDot = resolveChildren(() => props.pendingDot)
  const items = createMemo((): Item[] => {
    const list = normalizeTimelineItems<JSX.Element, TimelineItemProps>(
      props.items, mode(),
      present(pending()) ? { content: pending(), icon: present(pendingDot()) ? pendingDot() : undefined } : undefined,
    )
    return props.reverse ? list.reverse() : list
  })

  const info = (): TimelineSemanticInfo => ({
    props: { ...props, mode: mode(), items: items().map(item => item.source ?? { content: item.content }) },
  })
  const classNames = createMemo(() => resolveSemantic(props.classNames, info()))
  const styles = createMemo(() => resolveSemantic(props.styles, info()))

  const horizontal = () => props.orientation === 'horizontal'
  const alternate = createMemo(() => timelineLayoutAlternate(mode(), props.orientation, items()))

  const layoutOf = (item: Item): TimelineLayout => {
    const end = item.placement === 'end'
    if (horizontal()) return alternate() ? (end ? 'horizontal-alternate-end' : 'horizontal-alternate-start') : end ? 'horizontal-end' : 'horizontal'
    if (alternate()) return end ? 'alternate-end' : 'alternate'
    return end ? 'vertical-end' : 'vertical'
  }

  const rootStyle = (): JSX.CSSProperties => ({
    '--ut-tl-span': timelineHeadSpan(props.titleSpan, mode()),
    ...styles().root,
    ...props.style,
  })

  return (
    <ol
      {...rest}
      class={mergeClass(timelineClass({ orientation: props.orientation }), props.class, classNames().root)}
      style={rootStyle()}
      data-timeline-orientation={props.orientation}
      data-timeline-mode={mode()}
      data-timeline-alternate={alternate() ? 'true' : 'false'}
    >
      <For each={items()}>
        {(item, index) => {
          const source = () => item.source
          const layout = () => layoutOf(item)
          const last = () => index() === items().length - 1
          const hasTitle = () => present(item.title)
          const custom = () => item.icon !== undefined || item.loading
          const scheme = () => `${custom() ? 'custom' : props.variant}-${item.presetColor ?? 'blue'}` as const
          // 自定义颜色：antd 写 CSS 变量，这里按变体直接写对应属性。
          const dotStyle = (): JSX.CSSProperties => {
            const color = item.dotColor
            if (!color) return {}
            if (custom()) return { color }
            return props.variant === 'filled'
              ? { 'background-color': color, color }
              : { 'border-color': color, color }
          }
          const railStatus = () => timelineRailStatus(items(), index(), !!props.reverse)
          return (
            <li
              class={mergeClass(timelineItemClass({ layout: layout() }), classNames().item, source()?.class, source()?.classNames?.root)}
              style={{ ...styles().item, ...source()?.style, ...source()?.styles?.root }}
              data-timeline-part="item"
              data-timeline-status={item.status}
              data-timeline-placement={item.placement}
              data-timeline-color={item.presetColor ?? (item.dotColor ? 'custom' : 'blue')}
              data-timeline-pending={item.pending ? 'true' : undefined}
            >
              <div
                class={mergeClass(timelineWrapperClass({ layout: layout() }), classNames().itemWrapper, source()?.classNames?.wrapper)}
                style={{ ...styles().itemWrapper, ...source()?.styles?.wrapper }}
                data-timeline-part="wrapper"
              >
                <div
                  class={mergeClass(timelineIconClass({ layout: layout(), scheme: scheme() }), classNames().itemIcon, source()?.classNames?.icon)}
                  style={{ ...dotStyle(), ...styles().itemIcon, ...source()?.styles?.icon }}
                  data-timeline-part="icon"
                >
                  {item.icon !== undefined
                    ? numberToText(item.icon)
                    : item.loading ? <span class="i-mdi-loading animate-spin inline-block" role="img" aria-label="loading" /> : undefined}
                </div>
                <div
                  class={mergeClass(timelineSectionClass({ layout: layout() }), classNames().itemSection, source()?.classNames?.section)}
                  style={{ ...styles().itemSection, ...source()?.styles?.section }}
                  data-timeline-part="section"
                >
                  <div
                    class={mergeClass(timelineHeaderClass({ layout: layout(), titled: hasTitle() }), classNames().itemHeader, source()?.classNames?.header)}
                    style={{ ...styles().itemHeader, ...source()?.styles?.header }}
                    data-timeline-part="header"
                  >
                    <Show when={hasTitle()}>
                      <div
                        class={mergeClass(timelineTitleClass({ layout: layout() }), classNames().itemTitle, source()?.classNames?.title)}
                        style={{ ...styles().itemTitle, ...source()?.styles?.title }}
                        data-timeline-part="title"
                      >
                        {numberToText(item.title)}
                      </div>
                    </Show>
                    <Show when={!last()}>
                      <div
                        class={mergeClass(timelineRailClass({ layout: layout() }), classNames().itemRail, source()?.classNames?.rail)}
                        style={{ ...styles().itemRail, ...source()?.styles?.rail }}
                        data-timeline-part="rail"
                        data-timeline-rail={railStatus()}
                      />
                    </Show>
                  </div>
                  <Show when={present(item.content)}>
                    <div
                      class={mergeClass(timelineContentClass({ layout: layout(), emptyHeader: !hasTitle() }), classNames().itemContent, source()?.classNames?.content)}
                      style={{ ...styles().itemContent, ...source()?.styles?.content }}
                      data-timeline-part="content"
                    >
                      {numberToText(item.content)}
                    </div>
                  </Show>
                </div>
              </div>
            </li>
          )
        }}
      </For>
    </ol>
  )
}

/** @deprecated 请使用 items；Solid 无法从子元素读取 props，Timeline.Item 仅为类型兼容保留，不渲染任何内容。 */
const TimelineItem = (_props: TimelineItemProps): JSX.Element => null

export default /* @__PURE__ */ Object.assign(Timeline, { Item: TimelineItem })
