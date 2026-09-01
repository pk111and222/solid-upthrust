import { Component, For, Show, createMemo, createSignal, merge } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  collapseRootClass,
  collapsePanelClass,
  collapseHeaderClass,
  collapseHeaderLabelClass,
  collapseRegionClass,
  collapseContentClass,
  collapseContentInnerClass,
  collapseExpandIconClass,
  COLLAPSE_EXPAND_ICON,
} from './styles'

export interface CollapseItem {
  /** Unique key; auto-indexed when omitted. */
  key?: string | number
  /** Header label. */
  label?: JSX.Element
  /** Panel body. */
  children?: JSX.Element
  /** Disable this panel's toggling. */
  disabled?: boolean
  /** Force-hide the expand icon (antd showExpandIcon=false per item). */
  showExpandIcon?: boolean
  /** Panel-level extra node rendered at the header's right (before the icon). */
  extra?: JSX.Element
  /** Custom expand icon renderer; receives the open state. */
  expandIcon?: (props: { isActive: boolean }) => JSX.Element
  /** Custom header content renderer; receives the open state. */
  labelRender?: (props: { isActive: boolean }) => JSX.Element
  class?: string
  style?: JSX.CSSProperties
}

export interface CollapseProps {
  items: CollapseItem[]
  /** Currently open panel keys (controlled). */
  activeKey?: Array<string | number>
  /** Initial open keys (uncontrolled). */
  defaultActiveKey?: Array<string | number>
  /** Open callback (fires on every toggle). */
  onChange?: (activeKey: Array<string | number>) => void
  /** Accordion mode: at most one panel open at a time. */
  accordion?: boolean
  /** Borderless, transparent background mode. */
  ghost?: boolean
  /** Allow panels to collapse (clicking an open header closes it). Default true. */
  collapsible?: boolean
  /** Global custom expand icon renderer. */
  expandIcon?: (props: { isActive: boolean }) => JSX.Element
  /** Expand icon position: after the label (end, default) or before it (start). */
  expandIconPosition?: 'start' | 'end'
  class?: string
  style?: JSX.CSSProperties
}

const Collapse: Component<CollapseProps> = (rawProps) => {
  const props = merge(
    {
      accordion: false,
      ghost: false,
      collapsible: true,
      expandIconPosition: 'end' as const,
    } as Partial<CollapseProps>,
    rawProps,
  )

  // Resolve stable string keys: item.key if given, else the item's index.
  const keyOf = createMemo(() =>
    props.items.map((item, i) => (item.key !== undefined ? String(item.key) : String(i)))
  )

  const [_activeKeys, _setActiveKeys] = createSignal<Array<string>>(
    (props.defaultActiveKey ?? []).map(String),
  )
  const activeKeys = createMemo<Array<string>>(() =>
    props.activeKey !== undefined
      ? props.activeKey.map(String)
      : _activeKeys(),
  )
  const isActive = (key: string) => activeKeys().includes(key)

  const toggle = (key: string) => {
    const current = activeKeys()
    let next: Array<string>
    if (props.accordion) {
      // Accordion: clicking the open panel closes it (antd allows full
      // collapse); opening one closes the rest.
      next = current.includes(key) ? [] : [key]
    } else {
      next = current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key]
    }
    // Uncontrolled commits internally; controlled flows through onChange.
    _setActiveKeys(next)
    // Report keys in the caller's own vocabulary when they control the
    // component (antd reports the raw values they passed).
    const reportKeys = props.activeKey !== undefined
      ? next.map((k) => {
          const original = props.activeKey!.find((ok) => String(ok) === k)
          return original !== undefined ? original : k
        })
      : next
    props.onChange?.(reportKeys)
  }

  const handleItemClick = (key: string, disabled?: boolean) => {
    if (disabled) return
    if (!props.collapsible && isActive(key)) return
    toggle(key)
  }

  const expandIconOf = (item: CollapseItem, active: boolean): JSX.Element =>
    item.expandIcon?.({ isActive: active })
    ?? props.expandIcon?.({ isActive: active })
    ?? (
      <span class={collapseExpandIconClass({ open: active })}>
        <span class={COLLAPSE_EXPAND_ICON} />
      </span>
    )

  const showExpandIcon = (item: CollapseItem) => item.showExpandIcon !== false

  return (
    <div
      class={twMerge(collapseRootClass({ bordered: !props.ghost }), props.class)}
      style={props.style}
    >
      <For each={props.items}>
        {(item, index) => {
          const key = () => keyOf()[index()]
          const active = () => isActive(key())
          return (
            <div
              class={twMerge(
                collapsePanelClass({ bordered: !props.ghost, last: index() === props.items.length - 1 }),
                item.class,
              )}
              style={item.style}
            >
              <button
                type="button"
                class={collapseHeaderClass({ ghost: props.ghost, disabled: !!item.disabled })}
                aria-expanded={active() ? 'true' : 'false'}
                aria-disabled={item.disabled ? 'true' : 'false'}
                onClick={() => handleItemClick(key(), item.disabled)}
              >
                <Show when={props.expandIconPosition === 'start' && showExpandIcon(item)}>
                  {expandIconOf(item, active())}
                </Show>
                <span class={collapseHeaderLabelClass({})}>
                  {item.labelRender ? item.labelRender({ isActive: active() }) : item.label}
                </span>
                <Show when={item.extra}>
                  <span
                    class="shrink-0 text-on-surface-variant"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.extra}
                  </span>
                </Show>
                <Show when={props.expandIconPosition === 'end' && showExpandIcon(item)}>
                  {expandIconOf(item, active())}
                </Show>
              </button>
              <div
                class={collapseRegionClass({ open: active() })}
                // Keep the region in the a11y tree only when it actually
                // contains content; screen readers skip empty regions.
                aria-hidden={active() ? undefined : 'true'}
              >
                <div class={collapseContentClass({})}>
                  <div class={collapseContentInnerClass({})}>
                    {item.children}
                  </div>
                </div>
              </div>
            </div>
          )
        }}
      </For>
    </div>
  )
}

export default Collapse
