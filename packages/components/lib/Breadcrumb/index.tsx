import { Component, For, Show, merge, createMemo } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { breadcrumbClass, breadcrumbItemClass, breadcrumbSeparatorClass, breadcrumbLinkClass } from './styles'
import { twMerge } from 'tailwind-merge'
import Dropdown, { type DropdownMenuProps, type DropdownMenuItem } from '../Dropdown'

export interface BreadcrumbItemType {
  title: string | JSX.Element
  href?: string
  /** Dropdown menu rendered on this item. */
  menu?: DropdownMenuProps
  onClick?: (e: MouseEvent) => void
  /** Render an ellipsis instead of the title (dropdown behavior is via menu). */
  dropdownRender?: JSX.Element
}

export interface BreadcrumbProps {
  separator?: JSX.Element
  items?: BreadcrumbItemType[]
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export interface BreadcrumbItemProps {
  href?: string
  onClick?: (e: MouseEvent) => void
  class?: string
  children?: JSX.Element
}

const ChevronSeparator = () => (
  <span class="i-mdi-chevron-right text-[14px] align-middle" />
)

const BreadcrumbItem: Component<BreadcrumbItemProps> = (rawProps) => {
  const props = merge({}, rawProps)

  return (
    <Show
      when={props.href}
      fallback={<span class={twMerge(breadcrumbItemClass({ active: true }), props.class)}>{props.children}</span>}
    >
      <a
        href={props.href}
        onClick={props.onClick}
        class={twMerge(breadcrumbItemClass({ active: false }), props.class)}
      >
        {props.children}
      </a>
    </Show>
  )
}

const Breadcrumb = ((rawProps) => {
  const props = merge({ separator: '/' as JSX.Element }, rawProps)

  const isLast = (index: number) => index === (props.items?.length ?? 0) - 1

  // Sections with a `menu` or `dropdownRender` collapse into a Dropdown.
  const wrapInteractive = (item: BreadcrumbItemType, child: JSX.Element): JSX.Element => {
    if (item.menu) {
      return (
        <Dropdown menu={item.menu} trigger="hover" placement="bottomLeft">
          <span class="inline-flex items-center gap-[4px] cursor-pointer">
            {child}
            <span class="i-mdi-menu-down text-[12px] text-on-surface-variant" />
          </span>
        </Dropdown>
      )
    }
    if (item.dropdownRender) {
      return (
        <Dropdown menu={{ items: [] }} trigger="hover" placement="bottomLeft" disabled>
          {item.dropdownRender}
        </Dropdown>
      )
    }
    return child
  }

  const renderItem = (item: BreadcrumbItemType, index: number): JSX.Element => {
    const interactive = !!(item.menu || item.dropdownRender)
    const last = isLast(index)

    // Last item, or any item without href/menu, renders as plain text.
    const content: JSX.Element = last || (!item.href && !interactive) ? (
      <span class={breadcrumbItemClass({ active: last })}>{item.title}</span>
    ) : (
      <a
        href={item.href ?? 'javascript:;'}
        onClick={(e) => {
          if (!item.href) e.preventDefault()
          item.onClick?.(e)
        }}
        class={breadcrumbLinkClass({})}
      >
        {item.title}
      </a>
    )

    return interactive ? wrapInteractive(item, content) : content
  }

  return (
    <nav class={twMerge(breadcrumbClass({}), props.class)} style={props.style}>
      <Show when={props.items} fallback={props.children}>
        <For each={props.items}>
          {(item, index) => (
            <>
              <Show when={index() > 0}>
                <span class={breadcrumbSeparatorClass({})}>{props.separator}</span>
              </Show>
              {renderItem(item, index())}
            </>
          )}
        </For>
      </Show>
    </nav>
  )
}) as Component<BreadcrumbProps> & { Item: typeof BreadcrumbItem }

Breadcrumb.Item = BreadcrumbItem

export { BreadcrumbItem }
export default Breadcrumb
