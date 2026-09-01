import { Component, Show, createMemo, merge } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import { createBadge, badgeOffsetStyle, type BadgeStatus } from 'upthrust-competence'
import {
  badgeWrapperClass,
  badgeCountClass,
  badgeDotClass,
  badgeStatusDotClass,
  badgeStatusTextClass,
  ribbonClass,
  ribbonContentClass,
  ribbonWrapperClass,
} from './styles'

export type BadgeSize = 'small' | 'middle'
/** antd PresetStatusColorType + 'gray' (the library's neutral mapping). */
export type BadgeColor = 'blue' | 'red' | 'green' | 'gray' | string
export type BadgePlacement = 'start' | 'end'

export interface BadgeSemanticSlots {
  root?: string
  indicator?: string
}

export interface BadgeSemanticStyles {
  root?: JSX.CSSProperties
  indicator?: JSX.CSSProperties
}

export interface BadgeProps {
  /** Number/string renders a pill (numbers get overflow formatting); JSX = custom badge node. */
  count?: number | string | JSX.Element
  /** Cap for numeric counts; above shows `${overflowCount}+`. Default 99. */
  overflowCount?: number
  /** Zero counts stay hidden unless true. */
  showZero?: boolean
  /** Red dot mode — no number. */
  dot?: boolean
  size?: BadgeSize
  /** `[x, y]` badge offset from the corner; positive x pushes further out. */
  offset?: [number | string, number | string]
  status?: BadgeStatus
  /** Named preset ('blue'|'red'|'green'|'gray') or any CSS color. */
  color?: BadgeColor
  /** Status text beside the dot (status mode). */
  text?: JSX.Element
  /** Badge tooltip; default = the count. null/false disables. */
  title?: string | null | false
  classNames?: BadgeSemanticSlots
  styles?: BadgeSemanticStyles
  class?: string
  style?: JSX.CSSProperties
  /** Wrapping target — the badge anchors to its top-right corner. */
  children?: JSX.Element
}

/** Named colors route to token classes; anything else inlines the background. */
const NAMED_COLORS = ['blue', 'red', 'green', 'gray'] as const
type NamedColor = (typeof NAMED_COLORS)[number]

const namedColorOf = (color?: string): NamedColor | undefined =>
  color && (NAMED_COLORS as readonly string[]).includes(color) ? (color as NamedColor) : undefined

/** Statuses and named colors share one class-key space (see styles.ts). */
const indicatorColorKey = (status?: BadgeStatus, color?: string): string => {
  if (status) return status
  const named = namedColorOf(color)
  if (named === 'blue') return 'primary'
  if (named === 'red') return 'error'
  if (named === 'green') return 'success'
  if (named === 'gray') return 'gray'
  // an explicit non-preset color inlines its background; NO color/status at
  // all is antd's default red (badgeColor = colorError)
  if (color) return 'custom'
  return 'error'
}

const isCustomColor = (status?: BadgeStatus, color?: string): boolean =>
  !status && !!color && !namedColorOf(color)

const isTextNode = (v: unknown): v is string | number =>
  typeof v === 'string' || typeof v === 'number'

const Badge: Component<BadgeProps> = (rawProps) => {
  const props = merge({ size: 'middle' as BadgeSize, overflowCount: 99 }, rawProps)

  // antd's count prop accepts ReactNode; the headless resolver only cares
  // about numbers/strings (a JSX node is a pass-through custom badge).
  const countValue = createMemo<unknown>(() =>
    isTextNode(props.count) || typeof props.count === 'number' ? props.count : props.count !== undefined && props.count !== null ? 'custom' : undefined,
  )

  const badge = createBadge({
    get count() { return countValue() as number | string | undefined },
    get overflowCount() { return props.overflowCount },
    get showZero() { return props.showZero },
    get dot() { return props.dot },
    get status() { return props.status },
    get color() { return props.color },
    get text() { return isTextNode(props.text) ? props.text : props.text !== undefined ? 'text' : undefined },
  })
  const display = badge.display

  const hasChildren = createMemo(() => props.children !== undefined && props.children !== null)

  // Status mode = no children AND (status/color set with nothing better to show)
  const isStatusMode = createMemo(() => {
    if (hasChildren()) return false
    const d = display()
    // antd isStatusBadge: !children && hasStatus && (text || hasStatusValue || !ignoreCount)
    if (!d.hasStatus) return false
    return d.textVisible || d.hasStatus || !d.ignoreCount
  })

  const offsetStyle = createMemo(() => badgeOffsetStyle(props.offset))

  const customInlineStyle = createMemo((): JSX.CSSProperties | undefined => {
    if (!isCustomColor(props.status, props.color)) return undefined
    return { 'background-color': props.color! }
  })

  // antd: title defaults to the rendered count (numbers/strings only — a
  // custom-node count gets NO default title; the 'custom' sentinel sent to
  // the resolver must never leak into the DOM).
  const titleNode = createMemo(() => {
    if (props.title === null || props.title === false) return undefined
    if (props.title !== undefined) return props.title
    return isTextNode(props.count) ? String(props.count) : undefined
  })

  const colorKey = createMemo(() => indicatorColorKey(props.status, props.color))
  const sizeMode = createMemo(() => `${props.size}-${hasChildren() ? 'wrapped' : 'standalone'}` as const)

  // antd Badge semantics: the top-level `style` lands on the INDICATOR
  // (antd's legacyStyleKey routes it there), not the wrapper — the classic
  // usage is `style={{ backgroundColor: 'transparent', color: '#999' }}`
  // to restyle a custom count node.
  const indicatorStyle = createMemo((): JSX.CSSProperties => ({
    ...offsetStyle(),
    ...customInlineStyle(),
    ...props.style,
    ...props.styles?.indicator,
  }))

  // Pill content: a custom count node renders as-is; otherwise the formatted
  // count. Built as a memo (NOT as <Show>{props.count}</Show> — Solid's Show
  // requires JSX-compiled accessor children; a raw prop value passed as
  // children throws "Comp is not a function" in Solid 2's DEV tracing).
  const countContent = createMemo((): JSX.Element => {
    if (typeof props.count === 'object' || typeof props.count === 'function') {
      return props.count as JSX.Element
    }
    return display().displayCount as JSX.Element
  })

  return (
    <span
      class={twMerge(
        badgeWrapperClass({ mode: isStatusMode() ? 'standalone' : hasChildren() ? 'wrapped' : 'standalone' }),
        props.class,
        props.classNames?.root,
      )}
      style={props.styles?.root}
      data-show={!display().hidden}
    >
      {props.children}

      <Show when={isStatusMode()}>
        <span
          class={twMerge(badgeStatusDotClass({ status: colorKey() as never }), props.classNames?.indicator)}
          style={indicatorStyle()}
        />
        <Show when={display().textVisible}>
          <span class={badgeStatusTextClass({})}>{props.text}</span>
        </Show>
      </Show>

      <Show when={!isStatusMode()}>
        <Show
          when={display().showAsDot}
          fallback={
            <Show when={!display().hidden}>
              <span
                class={twMerge(
                  badgeCountClass({
                    sizeMode: sizeMode(),
                    color: colorKey() as never,
                    words: display().multipleWords,
                    visible: true,
                  }),
                  props.classNames?.indicator,
                )}
                style={indicatorStyle()}
                title={titleNode() as string | undefined}
              >
                {countContent()}
              </span>
            </Show>
          }
        >
          <span
            class={twMerge(
              badgeDotClass({
                mode: hasChildren() ? 'wrapped' : 'standalone',
                color: colorKey() as never,
                visible: !display().hidden,
              }),
              props.classNames?.indicator,
            )}
            style={indicatorStyle()}
            title={titleNode()}
          />
        </Show>
      </Show>
    </span>
  )
}

export interface BadgeRibbonProps {
  /** Ribbon label. */
  text?: JSX.Element
  /** Named preset ('blue'|'red'|'green'|'gray') or any CSS color. Default primary. */
  color?: BadgeColor
  /** Corner the ribbon hangs from. Default 'end'. */
  placement?: BadgePlacement
  classNames?: { root?: string; indicator?: string; content?: string }
  styles?: { root?: JSX.CSSProperties; indicator?: JSX.CSSProperties; content?: JSX.CSSProperties }
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

const BadgeRibbon: Component<BadgeRibbonProps> = (rawProps) => {
  const props = merge({ placement: 'end' as BadgePlacement, color: 'blue' as BadgeColor }, rawProps)

  const named = createMemo(() => namedColorOf(props.color))
  const colorKey = createMemo(() => (props.color ? (named() ?? 'custom') : 'blue'))
  const customStyle = createMemo((): JSX.CSSProperties | undefined =>
    colorKey() === 'custom' ? { 'background-color': props.color } : undefined,
  )

  return (
    <div class={twMerge(ribbonWrapperClass({}), props.class, props.classNames?.root)} style={props.styles?.root}>
      {props.children}
      <div
        class={twMerge(ribbonClass({ placement: props.placement, color: colorKey() as never }), props.classNames?.indicator)}
        style={{ ...customStyle(), ...props.styles?.indicator }}
      >
        <span class={twMerge(ribbonContentClass({}), props.classNames?.content)} style={props.styles?.content}>
          {props.text}
        </span>
      </div>
    </div>
  )
}

export default Badge
export { BadgeRibbon }
