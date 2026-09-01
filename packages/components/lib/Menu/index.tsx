import { Component, For, Show, merge, createMemo, createContext, useContext } from 'solid-js'
import { Portal, type JSX } from '@solidjs/web'
import { createMenu, createTrigger, type MenuItem, type MenuMode } from 'upthrust-competence'
import {
  menuContainerClass, menuItemClass, menuSubTitleClass, menuGroupTitleClass,
  menuDividerClass, menuSubContentClass, menuSubPopupClass,
} from './styles'
import { twMerge } from 'tailwind-merge'

export type { MenuItem } from 'upthrust-competence'

export interface MenuProps {
  items?: MenuItem[]
  mode?: MenuMode
  selectedKeys?: string[]
  defaultSelectedKeys?: string[]
  openKeys?: string[]
  defaultOpenKeys?: string[]
  multiple?: boolean
  onSelect?: (info: { key: string; selectedKeys: string[] }) => void
  onOpenChange?: (openKeys: string[]) => void
  class?: string
  style?: JSX.CSSProperties
}

type MenuContextValue = {
  mode: MenuMode
  isSelected: (key: string) => boolean
  isOpen: (key: string) => boolean
  select: (key: string) => void
  toggleOpen: (key: string) => void
}

const MenuContext = createContext<MenuContextValue>()

const MenuItemRender: Component<{ item: MenuItem; level?: number }> = (props) => {
  const ctx = useContext(MenuContext)!
  const isHorizontal = () => ctx.mode === 'horizontal'

  // Horizontal submenus portal their popup through createTrigger (measured
  // positioning + viewport collision) instead of hand-rolled absolute CSS.
  // createTrigger owns the open state entirely — toggling through it (not a
  // shadow signal) is what drives its measure-then-reveal sequence.
  const popup = createTrigger({ action: 'click', placement: 'bottomLeft' })

  const itemState = createMemo(() => {
    if (!ctx.isSelected(props.item.key)) return 'idle' as const
    return isHorizontal() ? 'selected-horizontal' as const : 'selected-vertical' as const
  })

  return (
    <Show when={props.item.type !== 'divider'} fallback={<div class={menuDividerClass({})} />}>
      <Show when={props.item.type !== 'group'} fallback={
        <div class="min-w-0">
          <div class={menuGroupTitleClass({})}>{props.item.label}</div>
          <For each={props.item.children}>
            {(child) => <MenuItemRender item={child} level={(props.level ?? 0) + 1} />}
          </For>
        </div>
      }>
        <Show when={!props.item.children?.length} fallback={
          // Submenu: horizontal floats over content (popup), vertical
          // and inline expand in place.
          <Show
            when={isHorizontal()}
            fallback={
              <div>
                <div
                  class={menuSubTitleClass({ open: ctx.isOpen(props.item.key), mode: ctx.mode })}
                  style={props.level ? { 'padding-left': `${(props.level + 1) * 16}px` } : undefined}
                  onClick={() => ctx.toggleOpen(props.item.key)}
                >
                  <span class="flex items-center gap-2">
                    <Show when={props.item.icon}>
                      <span class={props.item.icon} />
                    </Show>
                    {props.item.label}
                  </span>
                  <span class={`i-mdi-chevron-down text-base transition-transform duration-200 ${ctx.isOpen(props.item.key) ? 'rotate-180' : ''}`} />
                </div>
                <div class={menuSubContentClass({ open: ctx.isOpen(props.item.key) })}>
                  <For each={props.item.children}>
                    {(child) => <MenuItemRender item={child} level={(props.level ?? 0) + 1} />}
                  </For>
                </div>
              </div>
            }
          >
            <div class="relative" ref={popup.triggerRef}>
              <div
                class={menuSubTitleClass({ open: ctx.isOpen(props.item.key), mode: ctx.mode })}
                onClick={() => ctx.toggleOpen(props.item.key)}
              >
                <span class="flex items-center gap-2">
                  <Show when={props.item.icon}>
                    <span class={props.item.icon} />
                  </Show>
                  {props.item.label}
                </span>
                <span class={`i-mdi-chevron-down text-base transition-transform duration-200 ${ctx.isOpen(props.item.key) ? 'rotate-180' : ''}`} />
              </div>
              <Portal>
                <Show when={popup.mounted()}>
                  <div
                    ref={popup.layerRef}
                    class={menuSubPopupClass({ open: popup.open() })}
                    style={popup.layerStyle()}
                  >
                    <For each={props.item.children}>
                      {(child) => <MenuItemRender item={child} level={0} />}
                    </For>
                  </div>
                </Show>
              </Portal>
            </div>
          </Show>
        }>
          <div
            class={menuItemClass({
              state: itemState(),
              disabled: props.item.disabled,
              danger: props.item.danger,
              mode: isHorizontal() ? 'horizontal' : ctx.mode,
            })}
            style={!isHorizontal() && props.level ? { 'padding-left': `${(props.level + 1) * 16}px` } : undefined}
            role="menuitem"
            aria-selected={ctx.isSelected(props.item.key) ? 'true' : undefined}
            onClick={() => ctx.select(props.item.key)}
          >
            <Show when={props.item.icon}>
              <span class={props.item.icon} />
            </Show>
            {props.item.label}
          </div>
        </Show>
      </Show>
    </Show>
  )
}

const Menu: Component<MenuProps> = (rawProps) => {
  const props = merge(
    { mode: 'vertical' as MenuMode, items: [] as MenuItem[] },
    rawProps
  )

  const menu = createMenu({
    get items() { return props.items! },
    get mode() { return props.mode },
    get selectedKeys() { return props.selectedKeys },
    get defaultSelectedKeys() { return props.defaultSelectedKeys },
    get openKeys() { return props.openKeys },
    get defaultOpenKeys() { return props.defaultOpenKeys },
    get multiple() { return props.multiple },
    get onSelect() { return props.onSelect },
    get onOpenChange() { return props.onOpenChange },
  })

  const ctxValue: MenuContextValue = {
    get mode() { return props.mode! },
    isSelected: menu.isSelected,
    isOpen: menu.isOpen,
    select: menu.select,
    toggleOpen: menu.toggleOpen,
  }

  return (
    <MenuContext value={ctxValue}>
      <div class={twMerge(menuContainerClass({ mode: props.mode }), props.class)} style={props.style} role="menu">
        <For each={props.items}>
          {(item) => <MenuItemRender item={item} />}
        </For>
      </div>
    </MenuContext>
  )
}

export default Menu
