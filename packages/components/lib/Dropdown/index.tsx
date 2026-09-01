import { Component, For, Show, merge, createMemo, createSignal, createEffect, onCleanup } from 'solid-js'
import { Portal, type JSX } from '@solidjs/web'
import { createTrigger, type TriggerPlacement } from 'upthrust-competence'
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

// Kept for API compatibility — createTrigger uses the same placement names.
export type DropdownTrigger = 'click' | 'hover' | 'contextMenu'
export type DropdownPlacement = TriggerPlacement

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
  const props = merge(
    { trigger: 'hover' as DropdownTrigger, placement: 'bottomLeft' as DropdownPlacement },
    rawProps
  )

  const trigger = createTrigger({
    get open() { return props.open },
    get defaultOpen() { return props.defaultOpen },
    get disabled() { return props.disabled },
    get action() { return props.trigger },
    get placement() { return props.placement },
    get onOpenChange() { return props.onOpenChange },
  })

  // ---- keyboard navigation ---------------------------------------------
  // Arrow keys move focus among enabled items; Escape closes; Enter
  // activates the focused item. Focus lives in the overlay so Tab order of
  // the page is untouched until the menu opens.
  const [focusIndex, setFocusIndex] = createSignal(-1)
  let itemEls: HTMLDivElement[] = []

  const enabledItems = createMemo(() => props.menu.items.filter(i => i.type !== 'divider' && !i.disabled))

  const focusItem = (index: number) => {
    const items = enabledItems()
    if (!items.length) return
    const next = ((index % items.length) + items.length) % items.length
    setFocusIndex(next)
    itemEls[next]?.focus()
  }

  const resetKeyboard = () => setFocusIndex(-1)

  const handleOverlayKeyDown = (e: KeyboardEvent) => {
    if (!trigger.open()) return
    const count = enabledItems().length
    if (e.key === 'Escape') {
      e.preventDefault()
      trigger.setOpen(false)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      focusItem(focusIndex() + 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      focusItem(focusIndex() - 1)
    } else if (e.key === 'Enter' || e.key === ' ') {
      const item = enabledItems()[focusIndex()]
      if (item) {
        e.preventDefault()
        handleItemClick(item)
      }
    } else if (e.key === 'Tab' && count) {
      // Keep focus cycling inside the menu while open.
      e.preventDefault()
      focusItem(focusIndex() + 1)
    }
  }

  const handleItemClick = (item: DropdownMenuItem) => {
    if (item.disabled) return
    item.onClick?.()
    props.menu.onClick?.(item.key)
    trigger.setOpen(false)
    resetKeyboard()
  }

  // Move focus into the overlay when it opens (click/contextMenu triggers —
  // hover keeps focus where the user's pointer is).
  createEffect(
    () => trigger.open(),
    (isOpen) => {
      if (isOpen && props.trigger !== 'hover') {
        // Focus after the entrance animation settles (~160ms ≈ duration-fast
        // plus a frame). Focusing earlier is fragile: the layer is parked
        // hidden for one frame while createTrigger measures (focus on a
        // hidden element is dropped), and the click's implicit focus on the
        // trigger is applied asynchronously — both race a same-frame focus.
        const t = setTimeout(() => focusItem(0), 160)
        onCleanup(() => clearTimeout(t))
      } else if (!isOpen) {
        resetKeyboard()
      }
    }
  )
  onCleanup(() => { itemEls = [] })

  const registerItem = (el: HTMLDivElement, index: number) => {
    itemEls[index] = el
  }

  return (
    <div class={twMerge("relative inline-block", props.class)} style={props.style}>
      <div ref={trigger.triggerRef}>
        {props.children}
      </div>
      <Portal>
        <Show when={trigger.mounted()}>
          <div
            ref={(el) => { trigger.layerRef(el); trigger.bindLayerHover() }}
            class={twMerge(
              dropdownOverlayClass({ visible: trigger.open(), placement: trigger.actualPlacement() }),
              props.overlayClass
            )}
            style={{ ...trigger.layerStyle(), ...props.overlayStyle }}
            role="menu"
            tabindex={-1}
            onKeyDown={handleOverlayKeyDown}
          >
            <For each={props.menu.items}>
              {(item) => (
                <Show
                  when={item.type !== 'divider'}
                  fallback={<div class={dropdownDividerClass({})} />}
                >
                  <div
                    ref={(el) => registerItem(el, enabledItems().indexOf(item))}
                    class={dropdownItemClass({
                      disabled: item.disabled,
                      danger: item.danger,
                      focused: enabledItems()[focusIndex()] === item,
                    })}
                    tabindex={-1}
                    role="menuitem"
                    aria-disabled={item.disabled ? 'true' : undefined}
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={() => setFocusIndex(enabledItems().indexOf(item))}
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
        </Show>
      </Portal>
    </div>
  )
}

export default Dropdown
