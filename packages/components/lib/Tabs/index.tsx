import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, merge, createEffect, createSignal, untrack } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createTabs, createOwnerCleanup, type TabItem, type TabsIns } from 'upthrust-competence'
import { tabsContainerClass, tabBarClass, tabItemClass, tabInkBarClass, tabPanelClass } from './styles'
import { twMerge } from 'tailwind-merge'

export type { TabsIns } from 'upthrust-competence'
export type TabsItem = TabItem & {
  children?: JSX.Element
}

export interface TabsProps {
  activeKey?: string
  defaultActiveKey?: string
  items: TabsItem[]
  type?: 'line' | 'card' | 'editable-card'
  editable?: boolean
  hideAdd?: boolean
  addIcon?: JSX.Element
  draggable?: boolean
  onEdit?: (target: string | MouseEvent, action: 'add' | 'remove') => void
  onReorder?: (items: TabsItem[], info: { key: string; from: number; to: number }) => void
  size?: 'small' | 'middle' | 'large'
  tabPosition?: 'top' | 'bottom' | 'left' | 'right'
  centered?: boolean
  onChange?: (activeKey: string) => void
  onTabClick?: (key: string, e: MouseEvent) => void
  destroyInactiveTabPane?: boolean
  class?: string
  style?: JSX.CSSProperties
  ref?: (val: TabsIns) => void
}

const Tabs: Component<TabsProps> = (providedProps) => {
  const rawProps = useComponentProps('Tabs', providedProps)
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
    get editable() { return props.editable ?? props.type === 'editable-card' },
    get draggable() { return props.draggable },
    get onEdit() { return props.onEdit },
    onReorder(keys, info) {
      const index = new Map(props.items.map(item => [item.key, item]))
      props.onReorder?.(keys.map(key => index.get(key)!), info)
    },
  })
  const visualType = () => props.type === 'editable-card' ? 'card' : props.type
  const items = () => tabs.items() as TabsItem[]
  // Solid 2 runs ref callbacks under a null owner — cleanups for listeners
  // registered from refs must bind to the component owner.
  const onOwnerCleanup = createOwnerCleanup()

  untrack(() => props.ref?.(tabs.refs))

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
      // Roving tabindex (WAI-ARIA APG tabs pattern): move DOM focus to the
      // newly active tab, but only when focus is already inside the tab bar
      // (arrow-key navigation) — a controlled activeKey update from elsewhere
      // on the page, or a change while nothing in the tabs is focused, must
      // not steal focus.
      const list = barListRef()
      if (prevKey !== undefined && list?.contains(document.activeElement)) {
        tabNodeRefs.get(key)?.focus()
      }
    }
  )

  // Re-measure on geometry-affecting prop changes.
  createEffect(
    () => [props.size, props.tabPosition, items().map(item => item.key).join('|'), props.centered, props.type],
    () => {
      const keys = new Set(items().map(item => item.key))
      for (const key of tabNodeRefs.keys()) if (!keys.has(key)) tabNodeRefs.delete(key)
      queueMicrotask(measureInk)
    }
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
          type: visualType(),
          positionType: `${props.tabPosition}-${visualType()}` as any,
          centered: props.centered,
        })}
        role="tablist"
        ref={mergeRefs}
        tabindex={-1}
      >
        <For each={items()}>
          {(item) => (
            <div
              class={tabItemClass({
                state: `${tabs.isActive(item.key) ? 'active' : 'idle'}-${visualType()}` as any,
                disabled: !!item.disabled,
                type: visualType(),
                size: visualType() === 'card' ? 'middle' : props.size,
                typeSize: `${visualType()}-${props.size}` as any,
                tabPosition: props.tabPosition,
                typePosition: `${visualType()}-${props.tabPosition}` as any,
                statePosition: `${tabs.isActive(item.key) ? 'active' : 'idle'}-${props.tabPosition}` as any,
              })}
              role="tab"
              tabindex={tabs.isActive(item.key) ? 0 : -1}
              draggable={props.draggable && !item.disabled ? 'true' : 'false'}
              onDragStart={e => { if (!tabs.startDrag(item.key)) { e.preventDefault(); return }; e.dataTransfer?.setData('text/plain', item.key) }}
              onDragOver={e => { if (tabs.draggingKey() && !item.disabled) e.preventDefault() }}
              onDrop={e => { e.preventDefault(); tabs.drop(item.key) }}
              onDragEnd={tabs.endDrag}
              onKeyDown={e => {
                if (e.key === 'Delete') { e.preventDefault(); tabs.remove(item.key) }
                if (props.draggable && e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                  e.preventDefault(); e.stopPropagation()
                  const next = items()[items().findIndex(tab => tab.key === item.key) + (e.key === 'ArrowLeft' ? -1 : 1)]
                  if (next) tabs.reorder(item.key, next.key)
                }
              }}
              aria-selected={tabs.isActive(item.key) ? 'true' : 'false'}
              aria-disabled={item.disabled ? 'true' : 'false'}
              onClick={(e) => !item.disabled && handleTabClick(item.key, e)}
              ref={(el) => tabNodeRefs.set(item.key, el)}
            >
              <Show when={item.icon}>
                <span class={`${item.icon} text-[1em]`} />
              </Show>
              {item.label}
              <Show when={(props.editable ?? props.type === 'editable-card') && item.closable !== false}>
                <button type="button" class="ml-2 p-0 inline-flex border-0 bg-transparent text-on-surface-variant hover:text-primary cursor-pointer" aria-label={`关闭 ${item.label}`} disabled={item.disabled}
                  onClick={e => { e.stopPropagation(); tabs.remove(item.key) }}><span class="i-mdi-close" /></button>
              </Show>
            </div>
          )}
        </For>
        <Show when={(props.editable ?? props.type === 'editable-card') && !props.hideAdd}>
          <button type="button" class="shrink-0 p-2 inline-flex items-center justify-center border-0 bg-transparent text-on-surface-variant hover:text-primary cursor-pointer" aria-label="新增页签" onClick={e => tabs.add(e)}>{props.addIcon ?? <span class="i-mdi-plus" />}</button>
        </Show>
        <Show when={visualType() === 'line'}>
          <div class={tabInkBarClass({ tabPosition: props.tabPosition })} style={inkStyle()} />
        </Show>
      </div>

      <div class={tabPanelClass({})}>
        <For each={items()}>
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
