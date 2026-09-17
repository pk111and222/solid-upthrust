import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { type Component, For, Show, merge, createMemo, createSignal, createEffect, onCleanup, createUniqueId } from 'solid-js'
import type { JSX } from '@solidjs/web'
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

const Dropdown: Component<DropdownProps> = rawProps => {
  const props = merge(
    { trigger: 'hover' as DropdownTrigger, placement: 'bottomLeft' as DropdownPlacement },
    rawProps,
  )
  const menuId = `dropdown-menu-${createUniqueId()}`
  const trigger = createTrigger({
    get open() { return props.open },
    get defaultOpen() { return props.defaultOpen },
    get disabled() { return props.disabled },
    get action() { return props.trigger },
    get placement() { return props.placement },
    get onOpenChange() { return props.onOpenChange },
  })

  // Refs follow keys rather than initial indexes, so reordered items remain navigable.
  const itemEls = new Map<string, HTMLDivElement>()
  const [focusedKey, setFocusedKey] = createSignal<string | undefined>(undefined, { ownedWrite: true })
  const enabledItems = createMemo(() => props.menu.items.filter(item => item.type !== 'divider' && !item.disabled))
  let triggerEl: HTMLDivElement | undefined
  let layerEl: HTMLDivElement | undefined
  let restoreFocus: HTMLElement | undefined
  let focusedElement: HTMLElement | undefined
  let keyboardOpen: 'first' | 'last' | undefined

  const focusItem = (index: number) => {
    const items = enabledItems()
    if (!items.length) {
      setFocusedKey(undefined)
      layerEl?.focus({ preventScroll: true })
      return
    }
    const next = ((index % items.length) + items.length) % items.length
    setFocusedKey(items[next].key)
    itemEls.get(items[next].key)?.focus({ preventScroll: true })
  }

  const handleItemClick = (item: DropdownMenuItem) => {
    if (!trigger.open() || props.disabled || item.disabled || item.type === 'divider') return
    item.onClick?.()
    props.menu.onClick?.(item.key)
    trigger.setOpen(false)
  }

  const handleOverlayKeyDown = (event: KeyboardEvent) => {
    if (!trigger.open() || props.disabled) return
    const items = enabledItems()
    // The actual focused node wins over a mouse-hover highlight and pending signal writes.
    const active = items.findIndex(item => itemEls.get(item.key) === document.activeElement)
    const index = active >= 0 ? active : items.findIndex(item => item.key === focusedKey())
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      trigger.setOpen(false)
    } else if (event.key === 'Tab' && !items.length) {
      trigger.setOpen(false)
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Tab') {
      event.preventDefault()
      const backwards = event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)
      focusItem(index < 0 ? (backwards ? items.length - 1 : 0) : index + (backwards ? -1 : 1))
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (items[index]) handleItemClick(items[index])
    }
  }

  const handleTriggerKeyDown = (event: KeyboardEvent) => {
    if (props.disabled || event.defaultPrevented) return
    const arrow = event.key === 'ArrowDown' || event.key === 'ArrowUp'
    // Click triggers keep the child's native Enter/Space activation (one click only).
    if (!arrow && !(props.trigger !== 'click' && (event.key === 'Enter' || event.key === ' '))) return
    event.preventDefault()
    if (trigger.open()) {
      focusItem(event.key === 'ArrowUp' ? -1 : 0)
    } else {
      keyboardOpen = event.key === 'ArrowUp' ? 'last' : 'first'
      trigger.setOpen(true)
    }
  }

  // Let measurement and the triggering click settle before moving focus. Returning
  // cleanup cancels each pending focus on close, not just on component disposal.
  createEffect(
    () => ({ isOpen: trigger.open(), action: props.trigger }),
    ({ isOpen, action }) => {
      if (!isOpen) {
        setFocusedKey(undefined)
        focusedElement = undefined
        keyboardOpen = undefined
        if (restoreFocus?.isConnected && (layerEl?.contains(document.activeElement) || document.activeElement === document.body)) {
          restoreFocus.focus({ preventScroll: true })
        }
        restoreFocus = undefined
        return
      }
      if (action === 'hover' && !keyboardOpen) return
      const timer = setTimeout(() => {
        if (!trigger.open()) return
        const active = document.activeElement
        restoreFocus = active instanceof HTMLElement && active !== document.body && !layerEl?.contains(active)
          ? active
          : triggerEl?.querySelector<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), [tabindex]:not([tabindex="-1"])') ?? undefined
        focusItem(keyboardOpen === 'last' ? -1 : 0)
        keyboardOpen = undefined
      }, 160)
      return () => clearTimeout(timer)
    },
  )
  createEffect(
    () => ({ items: enabledItems(), isOpen: trigger.open() }),
    ({ items, isOpen }) => {
      if (!isOpen || !focusedElement) return
      const active = document.activeElement
      if (active !== focusedElement && !(active === document.body && !focusedElement.isConnected)) return
      if (!items.some(item => itemEls.get(item.key) === focusedElement)) focusItem(0)
    },
  )
  onCleanup(() => { itemEls.clear(); restoreFocus = undefined; focusedElement = undefined; layerEl = undefined; triggerEl = undefined })

  return (
    <div class={twMerge('relative inline-block', props.class)} style={props.style}>
      <div
        ref={el => { triggerEl = el; trigger.triggerRef(el) }}
        aria-haspopup="menu"
        aria-expanded={trigger.open() ? 'true' : 'false'}
        aria-controls={trigger.mounted() ? menuId : undefined}
        aria-disabled={props.disabled ? 'true' : undefined}
        onKeyDown={handleTriggerKeyDown}
      >
        {typeof props.children === 'number' ? String(props.children) : props.children}
      </div>
      <Portal>
        <Show when={trigger.mounted()}>
          <div
            ref={el => { layerEl = el; trigger.layerRef(el); trigger.bindLayerHover() }}
            class={twMerge(dropdownOverlayClass({ visible: trigger.open(), placement: trigger.actualPlacement() }), props.overlayClass)}
            style={{ ...trigger.layerStyle(), ...props.overlayStyle }}
            id={menuId}
            role="menu"
            aria-hidden={!trigger.open() ? 'true' : undefined}
            inert={!trigger.open()}
            tabindex={-1}
            onKeyDown={handleOverlayKeyDown}
          >
            <For each={props.menu.items}>
              {item => {
                let element: HTMLDivElement | undefined
                onCleanup(() => { if (itemEls.get(item.key) === element) itemEls.delete(item.key) })
                return <Show when={item.type !== 'divider'} fallback={<div role="separator" class={dropdownDividerClass({})} />}>
                  <div
                    ref={el => { element = el; itemEls.set(item.key, el) }}
                    class={dropdownItemClass({ disabled: !!item.disabled, danger: !!item.danger, focused: !item.disabled && focusedKey() === item.key })}
                    tabindex={-1}
                    role="menuitem"
                    aria-disabled={item.disabled ? 'true' : undefined}
                    onClick={() => handleItemClick(item)}
                    onFocus={event => { focusedElement = event.currentTarget; if (!item.disabled) setFocusedKey(item.key) }}
                    onMouseEnter={() => setFocusedKey(item.disabled ? undefined : item.key)}
                  >
                    <Show when={item.icon}><span aria-hidden="true" class={item.icon} /></Show>
                    {typeof item.label === 'number' ? String(item.label) : item.label}
                  </div>
                </Show>
              }}
            </For>
          </div>
        </Show>
      </Portal>
    </div>
  )
}

export default Dropdown
