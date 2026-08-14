import { Component, JSX, For, Show, mergeProps, createContext, useContext } from 'solid-js'
import { createMenu, type MenuItem, type MenuMode } from 'upthrust-competence'
import { menuContainerClass, menuItemClass, menuSubTitleClass, menuGroupTitleClass, menuDividerClass, menuSubContentClass } from './styles'
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

  return (
    <Show when={props.item.type !== 'divider'} fallback={<div class={menuDividerClass({})} />}>
      <Show when={props.item.type !== 'group'} fallback={
        <div>
          <div class={menuGroupTitleClass({})}>{props.item.label}</div>
          <For each={props.item.children}>
            {(child) => <MenuItemRender item={child} level={(props.level ?? 0) + 1} />}
          </For>
        </div>
      }>
        <Show when={!props.item.children?.length} fallback={
          <div>
            <div
              class={menuSubTitleClass({ open: ctx.isOpen(props.item.key) })}
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
        }>
          <div
            class={menuItemClass({ selected: ctx.isSelected(props.item.key), disabled: props.item.disabled, danger: props.item.danger, mode: ctx.mode })}
            style={props.level ? { 'padding-left': `${(props.level + 1) * 16}px` } : undefined}
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
  const props = mergeProps(
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
    <MenuContext.Provider value={ctxValue}>
      <div class={twMerge(menuContainerClass({ mode: props.mode }), props.class)} style={props.style} role="menu">
        <For each={props.items}>
          {(item) => <MenuItemRender item={item} />}
        </For>
      </div>
    </MenuContext.Provider>
  )
}

export default Menu
