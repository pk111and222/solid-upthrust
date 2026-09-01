import { Component, For, Show, createMemo, createSignal, merge } from 'solid-js'
import type { JSX } from '@solidjs/web'
import Skeleton from '../Skeleton'
import Tabs from '../Tabs'
import { cardActionItemClass, cardActionItemDividerClass, cardActionSpanClass, cardActionsClass, cardBodyClass, cardClass, cardCoverClass, cardExtraClass, cardGridClass, cardHeadClass, cardHeadWrapperClass, cardMetaAvatarClass, cardMetaClass, cardMetaDescriptionClass, cardMetaSectionClass, cardMetaTitleClass, cardTabsClass, cardTitleAccentClass, cardTitleClass } from './styles'
import { twMerge } from 'tailwind-merge'

/**
 * Card — pure presentation container (antd API). No headless counterpart:
 * every piece is stateless layout (the tab strip's state lives in the Tabs
 * material; loading swaps children for a Skeleton block).
 */

export type CardVariant = 'outlined' | 'borderless'
export type CardSize = 'small' | 'middle'

/** One entry of the card's tab strip (label + key, Tabs material parity). */
export interface CardTabItem {
  key: string
  label: string
  disabled?: boolean
}

export interface CardProps {
  /** Card title (head row). */
  title?: JSX.Element
  /** Content at the head's inline-end (actions link, extra controls). */
  extra?: JSX.Element
  /** 'outlined' (hairline) or 'borderless' (tertiary shadow). Default outlined. */
  variant?: CardVariant
  /** Compact paddings and a 38px head. Default middle. */
  size?: CardSize
  /** Nested card: grey head band + tighter body padding. */
  type?: 'inner'
  /** Full-bleed media slot above the body (image clipped to top radius). */
  cover?: JSX.Element
  /** Bottom action row; items split the width evenly. */
  actions?: JSX.Element[]
  /** Tab strip rendered under the head row (replaces head's hairline). */
  tabList?: CardTabItem[]
  activeTabKey?: string
  defaultActiveTabKey?: string
  onTabChange?: (key: string) => void
  /** Replace the body with an active skeleton while pending. */
  loading?: boolean
  /** Lift to standard shadow + transparent border on hover. */
  hoverable?: boolean
  children?: JSX.Element
  /** Semantic slots, antd parity. */
  classNames?: Partial<Record<'root' | 'header' | 'body' | 'extra' | 'title' | 'actions' | 'cover', string>>
  styles?: Partial<Record<'root' | 'header' | 'body' | 'extra' | 'title' | 'actions' | 'cover', JSX.CSSProperties>>
  class?: string
  style?: JSX.CSSProperties
}

const Card: Component<CardProps> = (rawProps) => {
  const props = merge(
    { variant: 'outlined', size: 'middle', hoverable: false, loading: false } as Partial<CardProps>,
    rawProps,
  )

  // contain-grid: any CardGrid child switches the body to the flex-wrap
  // grid stage. antd checks child element types; Solid children are DOM
  // nodes, so CardGrid marks its root via a data attribute and the body
  // grid flag is derived from the DOM instead.
  const [containGrid, setContainGrid] = createSignal(false)
  const bodyRef = (el: HTMLDivElement) => {
    queueMicrotask(() => {
      setContainGrid(!!el.querySelector('[data-card-grid]'))
    })
  }

  const hasHead = () => props.title !== undefined || props.extra !== undefined || !!props.tabList?.length
  const hasActions = () => !!props.actions?.length
  const hasChildren = () => props.children !== undefined && props.children !== null

  const body = createMemo(() => {
    // antd: body renders when loading OR children exist.
    if (!props.loading && !hasChildren()) return null
    return (
      <div
        ref={bodyRef}
        class={twMerge(
          cardBodyClass({
            size: props.size,
            inner: props.type === 'inner',
            first: !hasHead() && props.cover === undefined,
            last: !hasActions(),
            grid: containGrid(),
          }),
          props.classNames?.body,
        )}
        style={props.styles?.body}
      >
        <Show when={!props.loading} fallback={
          <Skeleton loading active paragraph={{ rows: 4 }} title={false} />
        }>
          {props.children}
        </Show>
      </div>
    )
  })

  const head = createMemo(() => {
    if (!hasHead()) return null
    return (
      <div
        class={twMerge(
          cardHeadClass({
            size: props.size,
            inner: props.type === 'inner',
            hasTabs: !!props.tabList?.length,
            // Grid bodies start flush (their inset lines are the head's
            // bottom edge) — the head's bottom padding would show as a
            // white band between title and grid.
            grid: containGrid(),
          }),
          props.classNames?.header,
        )}
        style={props.styles?.header}
      >
        <Show when={props.title !== undefined || props.extra !== undefined}>
          <div class={cardHeadWrapperClass({ padded: !!props.tabList?.length })}>
            <Show when={props.title !== undefined}>
              {/* 3px primary accent — the head's visual anchor (B-end list
                  cue); hidden when the head is only `extra`. */}
              <div class={cardTitleAccentClass({ size: props.size })} />
              <div class={twMerge(cardTitleClass(), props.classNames?.title)} style={props.styles?.title}>
                {props.title}
              </div>
            </Show>
            <Show when={props.extra !== undefined}>
              <div class={twMerge(cardExtraClass(), props.classNames?.extra)} style={props.styles?.extra}>
                {props.extra}
              </div>
            </Show>
          </div>
        </Show>
        <Show when={props.tabList?.length}>
          <div class={cardTabsClass()}>
            <Tabs
              activeKey={props.activeTabKey}
              defaultActiveKey={props.defaultActiveTabKey}
              items={props.tabList!.map(t => ({ key: t.key, label: t.label, disabled: t.disabled }))}
              size={props.size === 'small' ? 'small' : 'large'}
              onChange={props.onTabChange}
            />
          </div>
        </Show>
      </div>
    )
  })

  const cover = createMemo(() => {
    if (props.cover === undefined) return null
    return (
      <div
        class={twMerge(
          cardCoverClass({
            // Media zoom rides the card's hoverable flag — the zoom is
            // transform-only (compositor-friendly) and clips inside cover.
            zoom: props.hoverable,
          }),
          props.classNames?.cover,
        )}
        style={props.styles?.cover}
      >
        {props.cover}
      </div>
    )
  })

  const actions = createMemo(() => {
    if (!hasActions()) return null
    return (
      <ul
        class={twMerge(cardActionsClass(), cardActionItemDividerClass(), props.classNames?.actions)}
        style={props.styles?.actions}
      >
        <For each={props.actions}>
          {(action) => (
            <li class={cardActionItemClass()}>
              <span class={cardActionSpanClass()}>
                {action}
              </span>
            </li>
          )}
        </For>
      </ul>
    )
  })

  return (
    <div
      class={twMerge(
        cardClass({
          variant: props.variant,
          inner: props.type === 'inner',
          hoverable: props.hoverable,
          loading: props.loading,
        }),
        props.class,
        props.classNames?.root,
      )}
      style={{ ...props.styles?.root, ...props.style }}
    >
      {head()}
      {cover()}
      {body()}
      {actions()}
    </div>
  )
}

// ---- Card.Grid ----------------------------------------------------------------

export interface CardGridProps {
  /** Lift to standard shadow on hover. Default true. */
  hoverable?: boolean
  children?: JSX.Element
  class?: string
  style?: JSX.CSSProperties
}

/**
 * A grid cell inside a Card body. Marks itself with `data-card-grid` so the
 * parent Card's body switches to the grid stage (flex-wrap + shadow
 * borders).
 */
const CardGrid: Component<CardGridProps> = (rawProps) => {
  const props = merge({ hoverable: true } as Partial<CardGridProps>, rawProps)
  return (
    <div
      data-card-grid=""
      class={twMerge(cardGridClass({ hoverable: props.hoverable }), props.class)}
      style={props.style}
    >
      {props.children}
    </div>
  )
}

// ---- Card.Meta ----------------------------------------------------------------

export interface CardMetaProps {
  avatar?: JSX.Element
  title?: JSX.Element
  description?: JSX.Element
  class?: string
  style?: JSX.CSSProperties
}

/** Avatar + title/description block (antd Card.Meta). */
const CardMeta: Component<CardMetaProps> = (props) => {
  return (
    <div class={twMerge(cardMetaClass(), props.class)} style={props.style}>
      <Show when={props.avatar}>
        <div class={cardMetaAvatarClass()}>{props.avatar}</div>
      </Show>
      <Show when={props.title !== undefined || props.description !== undefined}>
        <div class={cardMetaSectionClass()}>
          <Show when={props.title !== undefined}>
            <div class={cardMetaTitleClass()}>{props.title}</div>
          </Show>
          <Show when={props.description !== undefined}>
            <div class={cardMetaDescriptionClass()}>{props.description}</div>
          </Show>
        </div>
      </Show>
    </div>
  )
}

export default Card
export { CardGrid, CardMeta }
