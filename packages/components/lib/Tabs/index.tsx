import { Component, For, Show, merge, createEffect, createSignal } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createTabs, createOwnerCleanup, type TabItem } from 'upthrust-competence'
import { tabsContainerClass, tabBarClass, tabItemClass, tabInkBarClass, tabPanelClass } from './styles'
import { twMerge } from 'tailwind-merge'

export type TabsItem = TabItem & {
  children?: JSX.Element
}

export interface TabsProps {
  activeKey?: string
  defaultActiveKey?: string
  items: TabsItem[]
  type?: 'line' | 'card'
  size?: 'small' | 'middle' | 'large'
  tabPosition?: 'top' | 'bottom' | 'left' | 'right'
  centered?: boolean
  onChange?: (activeKey: string) => void
  onTabClick?: (key: string, e: MouseEvent) => void
  destroyInactiveTabPane?: boolean
  class?: string
  style?: JSX.CSSProperties
}

const Tabs: Component<TabsProps> = (rawProps) => {
  const props = merge(
    { type: 'line' as const, size: 'middle' as const, tabPosition: 'top' as const, centered: false, destroyInactiveTabPane: false },
    rawProps
  )

  const tabs = createTabs({
    get activeKey() { return props.activeKey },
    get defaultActiveKey() { return props.defaultActiveKey },
    get items() { return props.items },
    get onChange() { return props.onChange },
    get onTabClick() { return props.onTabClick },
  })
  // Solid 2 runs ref callbacks under a null owner — cleanups for listeners
  // registered from refs must bind to the component owner.
  const onOwnerCleanup = createOwnerCleanup()

  const handleTabClick = (key: string, e: MouseEvent) => {
    tabs.setActiveKey(key)
    props.onTabClick?.(key, e)
  }

  // ---- Ink bar: measure the active tab node and slide one shared bar to it ----
  const [barListRef, setBarListRef] = createSignal<HTMLDivElement>()
  const tabNodeRefs = new Map<string, HTMLElement>()
  const [inkStyle, setInkStyle] = createSignal<JSX.CSSProperties>({ opacity: 0 })

  const measureInk = () => {
    const list = barListRef()
    const el = tabNodeRefs.get(tabs.activeKey())
    if (!list || !el) {
      setInkStyle({ opacity: 0 })
      return
    }
    const bar = list.getBoundingClientRect()
    const tab = el.getBoundingClientRect()
    // Top/bottom: slide horizontally. Left/right: slide vertically.
    if (props.tabPosition === 'left' || props.tabPosition === 'right') {
      setInkStyle({
        top: `${tab.top - bar.top}px`,
        height: `${tab.height}px`,
        opacity: 1,
      })
    } else {
      setInkStyle({
        left: `${tab.left - bar.left}px`,
        width: `${tab.width}px`,
        opacity: 1,
      })
    }
  }

  // Re-measure whenever the active tab changes. First measurement is deferred
  // a microtask so refs have settled and the bar appears in place (no fly-in).
  createEffect(
    () => tabs.activeKey(),
    (key, prevKey) => {
      if (prevKey === undefined) queueMicrotask(measureInk)
      else measureInk()
    }
  )

  // Re-measure on geometry-affecting prop changes.
  createEffect(
    () => [props.size, props.tabPosition, props.items.length, props.centered, props.type],
    () => queueMicrotask(measureInk)
  )

  // Keep the bar aligned through window resize. Registered in the merged ref
  // (which runs under the component owner's lifecycle via onOwnerCleanup).
  const registerResize = (list: HTMLDivElement) => {
    const handleResize = () => measureInk()
    window.addEventListener('resize', handleResize)
    onOwnerCleanup(() => window.removeEventListener('resize', handleResize))
  }

  return (
    <div class={twMerge(tabsContainerClass({ tabPosition: props.tabPosition }), props.class)} style={props.style}>
      <div
        class={tabBarClass({
          tabPosition: props.tabPosition,
          type: props.type,
          positionType: `${props.tabPosition}-${props.type}` as any,
          centered: props.centered,
        })}
        role="tablist"
        ref={mergeRefs}
        tabindex={0}
      >
        <For each={props.items}>
          {(item) => (
            <div
              class={tabItemClass({
                state: `${tabs.isActive(item.key) ? 'active' : 'idle'}-${props.type}` as any,
                disabled: !!item.disabled,
                type: props.type,
                size: props.type === 'card' ? 'middle' : props.size,
                typeSize: `${props.type}-${props.size}` as any,
                tabPosition: props.tabPosition,
                typePosition: `${props.type}-${props.tabPosition}` as any,
                statePosition: `${tabs.isActive(item.key) ? 'active' : 'idle'}-${props.tabPosition}` as any,
              })}
              role="tab"
              aria-selected={tabs.isActive(item.key) ? 'true' : 'false'}
              aria-disabled={item.disabled ? 'true' : 'false'}
              onClick={(e) => !item.disabled && handleTabClick(item.key, e)}
              ref={(el) => tabNodeRefs.set(item.key, el)}
            >
              <Show when={item.icon}>
                <span class={`${item.icon} text-[1em]`} />
              </Show>
              {item.label}
            </div>
          )}
        </For>
        <Show when={props.type === 'line'}>
          <div class={tabInkBarClass({ tabPosition: props.tabPosition })} style={inkStyle()} />
        </Show>
      </div>

      <div class={tabPanelClass({})}>
        <For each={props.items}>
          {(item) => (
            <Show when={props.destroyInactiveTabPane ? tabs.isActive(item.key) : true}>
              <div
                role="tabpanel"
                style={{ display: tabs.isActive(item.key) ? undefined : 'none' }}
              >
                {item.children}
              </div>
            </Show>
          )}
        </For>
      </div>
    </div>
  )

  // --- late-bound refs (hoisted; safe to reference before JSX evaluates) ---
  function mergeRefs(el: HTMLDivElement) {
    setBarListRef(el)
    registerResize(el)
    tabs.tabListRef(el)
  }
}

export default Tabs
