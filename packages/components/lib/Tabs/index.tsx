import { Component, JSX, For, Show, mergeProps, createMemo, createSignal } from 'solid-js'
import { createTabs, type TabItem } from 'upthrust-competence'
import { tabsContainerClass, tabBarClass, tabItemClass, tabPanelClass } from './styles'
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
  const props = mergeProps(
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

  const handleTabClick = (key: string, e: MouseEvent) => {
    tabs.setActiveKey(key)
    props.onTabClick?.(key, e)
  }

  return (
    <div class={twMerge(tabsContainerClass({ tabPosition: props.tabPosition }), props.class)} style={props.style}>
      <div
        class={tabBarClass({ tabPosition: props.tabPosition, type: props.type, centered: props.centered })}
        role="tablist"
        ref={tabs.tabListRef}
        tabIndex={0}
      >
        <For each={props.items}>
          {(item) => (
            <div
              class={tabItemClass({ active: tabs.isActive(item.key), disabled: item.disabled, type: props.type, size: props.size })}
              role="tab"
              aria-selected={tabs.isActive(item.key)}
              onClick={(e) => handleTabClick(item.key, e)}
            >
              <Show when={item.icon}>
                <span class={`${item.icon} mr-1 align-middle`} />
              </Show>
              {item.label}
              <Show when={tabs.isActive(item.key) && props.type === 'line'}>
                <span class="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
              </Show>
            </div>
          )}
        </For>
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
}

export default Tabs
