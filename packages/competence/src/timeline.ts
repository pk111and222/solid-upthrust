/**
 * Timeline 的纯数据层：对照 antd 6.6.5 `timeline/{Timeline,useItems}` 移植模式归一、
 * 旧字段兼容、pending 追加、reverse 与导轨状态。节点内容（JSX）以泛型透传，不在这里渲染。
 */

export type TimelineMode = 'start' | 'end' | 'alternate'
/** @deprecated left / right 请改用 start / end */
export type TimelineLegacyMode = 'left' | 'right'
export type TimelinePlacement = 'start' | 'end'
export type TimelineOrientation = 'vertical' | 'horizontal'
export type TimelineItemStatus = 'finish' | 'process'
export type TimelinePresetColor = 'blue' | 'red' | 'green' | 'gray'

export const TIMELINE_PRESET_COLORS: readonly TimelinePresetColor[] = ['blue', 'red', 'green', 'gray']

export interface TimelineItemSource<N> {
  color?: string
  title?: N
  /** @deprecated 请使用 title */
  label?: N
  content?: N
  /** @deprecated 请使用 content */
  children?: N
  icon?: N
  /** @deprecated 请使用 icon */
  dot?: N
  placement?: TimelinePlacement
  /** @deprecated 请使用 placement */
  position?: TimelinePlacement
  loading?: boolean
}

export interface TimelineNormalizedItem<N, S> {
  /** 原始条目（含 class / style / classNames 等扩展字段）；pending 追加项为 undefined。 */
  source?: S
  title?: N
  content?: N
  /** 显式图标；loading 且无图标时为 undefined、`loading` 为 true，由 UI 渲染加载图标。 */
  icon?: N
  loading: boolean
  placement: TimelinePlacement
  status: TimelineItemStatus
  /** 预设色名；自定义颜色写入 dotColor。 */
  presetColor?: TimelinePresetColor
  dotColor?: string
  /** 由 pending 属性追加的节点。 */
  pending: boolean
}

export const normalizeTimelineMode = (mode?: string): TimelineMode => {
  if (mode === 'left') return 'start'
  if (mode === 'right') return 'end'
  return mode === 'alternate' || mode === 'start' || mode === 'end' ? mode : 'start'
}

/** useItems：旧字段回落、交替布局的奇偶 placement、pending 追加（在 reverse 之前）。 */
export const normalizeTimelineItems = <N, S extends TimelineItemSource<N>>(
  items: readonly S[] | undefined,
  mode: TimelineMode,
  pending?: { content: N; icon?: N },
): TimelineNormalizedItem<N, S>[] => {
  const merged = (items ?? []).map((item, index): TimelineNormalizedItem<N, S> => {
    const color = item.color
    const preset = color && (TIMELINE_PRESET_COLORS as readonly string[]).includes(color) ? color as TimelinePresetColor : undefined
    const icon = item.icon ?? item.dot
    return {
      source: item,
      title: item.title ?? item.label,
      content: item.content ?? item.children,
      icon: icon ?? undefined,
      loading: !icon && !!item.loading,
      placement: item.placement ?? item.position ?? (mode === 'alternate' ? (index % 2 === 0 ? 'start' : 'end') : mode),
      status: item.loading ? 'process' : 'finish',
      presetColor: preset,
      dotColor: color && !preset ? color : undefined,
      pending: false,
    }
  })
  if (pending) {
    merged.push({
      source: undefined,
      title: undefined,
      content: pending.content,
      icon: pending.icon ?? undefined,
      loading: pending.icon === undefined || pending.icon === null,
      // antd 追加项不带 placement，Steps 按根模式渲染；交替模式下它跟随奇偶。
      placement: mode === 'alternate' ? (merged.length % 2 === 0 ? 'start' : 'end') : mode,
      status: 'process',
      pending: true,
    })
  }
  return merged
}

/** 导轨状态：默认跟随下一个节点；reverse 时跟随自身（antd railFollowPrevStatus）。 */
export const timelineRailStatus = <T extends { status: TimelineItemStatus }>(items: readonly T[], index: number, reverse: boolean) =>
  reverse ? items[index]?.status : items[index + 1]?.status

/** 交替布局：mode=alternate，或纵向时任一节点有标题。 */
export const timelineLayoutAlternate = (mode: TimelineMode, orientation: TimelineOrientation, items: readonly { title?: unknown }[]) =>
  mode === 'alternate' || (orientation === 'vertical' && items.some(item => !!item.title))

/**
 * 标题占比（到圆点中心的距离）：数字为 24 栅格份数，字符串为任意长度。交替模式与横向不生效。
 * 返回 CSS 长度，默认 12 份 = 50%。
 */
export const timelineHeadSpan = (titleSpan: number | string | undefined | null, mode: TimelineMode) => {
  if (titleSpan === undefined || titleSpan === null || mode === 'alternate') return 'calc(12 / 24 * 100%)'
  return typeof titleSpan === 'number' ? `calc(${titleSpan} / 24 * 100%)` : titleSpan
}
