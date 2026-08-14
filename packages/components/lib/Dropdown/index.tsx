import { Component, JSX, For, Show, mergeProps, createMemo } from 'solid-js'
import { createDropdown, type DropdownPlacement, type DropdownTrigger } from 'upthrust-competence'
import { dropdownOverlayClass, dropdownItemClass, dropdownDividerClass } from './styles'
import { twMerge } from 'tailwind-merge'

export interface DropdownMenuItem {
  key: string
  label: string | JSX.Element
  icon?: string
  disabled?: boolean
  danger?: boolean
  type?: 'divider'
  onClick?: () => void
}

export interface DropdownMenuProps {
  items: DropdownMenuItem[]
  onClick?: (key: string) => void
}

export interface DropdownProps {
  menu: DropdownMenuProps
  trigger?: DropdownTrigger
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  placement?: DropdownPlacement
  overlayClass?: string
  overlayStyle?: JSX.CSSProperties
  children: JSX.Element
  class?: string
  style?: JSX.CSSProperties
}

const Dropdown: Component<DropdownProps> = (rawProps) => {
  const props = mergeProps(
    { trigger: 'hover' as DropdownTrigger, placement: 'bottomLeft' as DropdownPlacement },
    rawProps
  )

  const dropdown = createDropdown({
    get open() { return props.open },
    get defaultOpen() { return props.defaultOpen },
    get disabled() { return props.disabled },
    get trigger() { return props.trigger },
    get onOpenChange() { return props.onOpenChange },
    get placement() { return props.placement },
  })

  const handleItemClick = (item: DropdownMenuItem) => {
    if (item.disabled) return
    item.onClick?.()
    props.menu.onClick?.(item.key)
    dropdown.setOpen(false)
  }

  return (
    <div class={twMerge("relative inline-block", props.class)} style={props.style}>
      <div ref={dropdown.triggerRef}>
        {props.children}
      </div>
      <div
        ref={dropdown.overlayRef}
        class={twMerge(dropdownOverlayClass({ visible: dropdown.open() }), props.overlayClass)}
        style={{ ...dropdown.overlayStyle(), ...props.overlayStyle }}
      >
        <For each={props.menu.items}>
          {(item) => (
            <Show
              when={item.type !== 'divider'}
              fallback={<div class={dropdownDividerClass({})} />}
            >
              <div
                class={dropdownItemClass({ disabled: item.disabled, danger: item.danger })}
                onClick={() => handleItemClick(item)}
              >
                <Show when={item.icon}>
                  <span class={item.icon} />
                </Show>
                {item.label}
              </div>
            </Show>
          )}
        </For>
      </div>
    </div>
  )
}

export default Dropdown
