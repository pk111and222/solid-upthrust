import { Component, For, Show, createMemo, merge } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  timelineClass,
  timelineItemClass,
  timelineDotColumnClass,
  timelineRailClass,
  timelineDotClass,
  timelineCustomIconClass,
  timelineLoadingIconClass,
  timelineTitleClass,
  timelineContentClass,
} from './styles'

export type TimelineColor = 'blue' | 'red' | 'green' | 'gray' | string
export type TimelinePlacement = 'start' | 'end'
export type TimelineMode = TimelinePlacement | 'alternate'
export type TimelineOrientation = 'vertical' | 'horizontal'
export type TimelineVariant = 'outlined' | 'filled'

export interface TimelineItemProps {
  key?: string | number
  color?: TimelineColor
  title?: JSX.Element
  content?: JSX.Element
  icon?: JSX.Element
  loading?: boolean
  placement?: TimelinePlacement
  class?: string
  style?: JSX.CSSProperties
}

export interface TimelineProps {
  items: TimelineItemProps[]
  mode?: TimelineMode
  orientation?: TimelineOrientation
  variant?: TimelineVariant
  titleSpan?: number | string
  reverse?: boolean
  class?: string
  style?: JSX.CSSProperties
}

const NAMED_COLORS = ['blue', 'red', 'green', 'gray'] as const

type NamedColor = (typeof NAMED_COLORS)[number]

const Timeline: Component<TimelineProps> = (rawProps) => {
  const props = merge({
    mode: 'start' as const,
    orientation: 'vertical' as const,
    variant: 'outlined' as const,
    reverse: false,
  }, rawProps)

  const orderedItems = createMemo(() => {
    const items = [...props.items]
    if (props.reverse) items.reverse()
    return items
  })

  const hasTitle = createMemo(() => orderedItems().some((item) => item.title !== undefined))

  const titleSpanStyle = createMemo(() => {
    if (props.orientation !== 'vertical' || props.mode === 'alternate' || props.titleSpan === undefined) {
      return undefined
    }

    const titleSpan = typeof props.titleSpan === 'number' ? `${props.titleSpan}px` : props.titleSpan
    return { '--timeline-axis-position': titleSpan } as JSX.CSSProperties
  })

  const titledGridStyle = createMemo(() => {
    if (props.orientation !== 'vertical' || props.mode === 'alternate' || !hasTitle()) return undefined

    const axisPosition = typeof props.titleSpan === 'number'
      ? `${props.titleSpan}px`
      : props.titleSpan || '12%'
    const axisColumn = '24px'
    const contentGap = '20px'

    return props.mode === 'start'
      ? { 'grid-template-columns': `minmax(0, calc(${axisPosition} - ${contentGap})) ${axisColumn} minmax(0, 1fr)` } as JSX.CSSProperties
      : { 'grid-template-columns': 'minmax(0, 1fr) 24px minmax(0, calc(' + axisPosition + ' - ' + contentGap + '))' } as JSX.CSSProperties
  })

  const placementOf = (item: TimelineItemProps, index: number): TimelinePlacement =>
    item.placement ?? (props.mode === 'alternate' ? (index % 2 === 0 ? 'start' : 'end') : props.mode)

  const namedColorOf = (color?: TimelineColor): NamedColor =>
    color && (NAMED_COLORS as readonly string[]).includes(color) ? color as NamedColor : 'blue'

  const customColorOf = (color?: TimelineColor) =>
    color && !(NAMED_COLORS as readonly string[]).includes(color) ? color : undefined

  const verticalItemLayout = (item: TimelineItemProps, index: number) => {
    const placement = placementOf(item, index)

    if (!hasTitle()) return `vertical-plain-${placement}` as const

    return props.mode === 'alternate' ? 'vertical-alternate' as const : 'vertical-titled' as const
  }

  const titlePosition = (placement: TimelinePlacement) => {
    if (props.orientation === 'horizontal') return placement === 'start' ? 'horizontal-top' : 'horizontal-bottom'
    return placement === 'start' ? 'vertical-left' : 'vertical-right'
  }

  const contentPosition = (item: TimelineItemProps, placement: TimelinePlacement) => {
    if (props.orientation === 'horizontal') return placement === 'start' ? 'horizontal-bottom' : 'horizontal-top'
    if (!hasTitle()) return placement === 'start' ? 'vertical-plain-start' : 'vertical-plain-end'
    return placement === 'start' ? 'vertical-right' : 'vertical-left'
  }

  const dotPosition = (placement: TimelinePlacement) => {
    if (props.orientation === 'horizontal') return 'horizontal' as const
    if (!hasTitle()) return placement === 'start' ? 'vertical-start' as const : 'vertical-end' as const
    return 'vertical-center' as const
  }

  return (
    <div
      class={twMerge(timelineClass({ orientation: props.orientation }), props.class)}
      style={{ ...titleSpanStyle(), ...props.style }}
    >
      <For each={orderedItems()}>
        {(item, index) => {
          const placement = createMemo(() => placementOf(item, index()))
          const namedColor = createMemo(() => namedColorOf(item.color))
          const customColor = createMemo(() => customColorOf(item.color))
          const hasCustomIcon = createMemo(() => item.icon !== undefined || item.loading === true)
          const isLast = createMemo(() => index() === orderedItems().length - 1)
          const dotStyle = createMemo(() => {
            if (!customColor()) return undefined
            return props.variant === 'filled'
              ? { 'border-color': customColor(), 'background-color': customColor() } as JSX.CSSProperties
              : { 'border-color': customColor() } as JSX.CSSProperties
          })

          return (
            <div
              class={twMerge(timelineItemClass({
                layout: props.orientation === 'horizontal' ? 'horizontal' : verticalItemLayout(item, index()),
              }), item.class)}
              style={{ ...titledGridStyle(), ...item.style }}
            >
              <Show when={hasTitle() && props.orientation === 'vertical'}>
                <div class={timelineTitleClass({ position: titlePosition(placement()) as 'vertical-left' | 'vertical-right' })}>
                  {item.title}
                </div>
              </Show>

              <div class={timelineDotColumnClass({ position: dotPosition(placement()) })}>
                <div class={timelineRailClass({ orientation: props.orientation, last: isLast() })} />
                <Show
                  when={hasCustomIcon()}
                  fallback={
                    <span
                      class={timelineDotClass({
                        colorScheme: `${props.variant}-${namedColor()}` as `${TimelineVariant}-${NamedColor}`,
                        orientation: props.orientation,
                      })}
                      style={dotStyle()}
                    />
                  }
                >
                  <span class={timelineCustomIconClass({ color: namedColor(), orientation: props.orientation })}>
                    <Show when={item.icon} fallback={<span class={timelineLoadingIconClass({})} />}>
                      {item.icon}
                    </Show>
                  </span>
                </Show>
              </div>

              <Show when={hasTitle() && props.orientation === 'horizontal'}>
                <div class={timelineTitleClass({ position: titlePosition(placement()) as 'horizontal-top' | 'horizontal-bottom' })}>
                  {item.title}
                </div>
              </Show>

              <Show when={item.content !== undefined}>
                <div class={timelineContentClass({ position: contentPosition(item, placement()) })}>
                  {item.content}
                </div>
              </Show>
            </div>
          )
        }}
      </For>
    </div>
  )
}

export default Timeline
