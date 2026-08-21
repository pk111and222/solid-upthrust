import { createSignal, onCleanup, createMemo } from "solid-js";
import { createOwnerCleanup } from "./utils";

export type DropdownPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight' | 'bottom' | 'top'
export type DropdownTrigger = 'click' | 'hover' | 'contextMenu'

export type DropdownConfig = {
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  trigger?: DropdownTrigger
  onOpenChange?: (open: boolean) => void
  placement?: DropdownPlacement
}

export type DropdownIns = {
  open: () => boolean
  setOpen: (v: boolean) => void
  toggle: () => void
}

export const createDropdown = (config: DropdownConfig = {}) => {
  const onOwnerCleanup = createOwnerCleanup();
  const [_open, _setOpen] = createSignal(config.defaultOpen ?? false)

  const open = createMemo(() => config.open !== undefined ? config.open : _open())

  const setOpen = (v: boolean) => {
    if (config.disabled) return
    _setOpen(v)
    config.onOpenChange?.(v)
  }

  const toggle = () => setOpen(!open())

  let _triggerEl: HTMLElement | undefined
  let _overlayEl: HTMLElement | undefined
  let _hoverTimeout: ReturnType<typeof setTimeout> | undefined

  const triggerRef = (el: HTMLElement) => {
    _triggerEl = el
    const trigger = config.trigger ?? 'hover'

    if (trigger === 'click') {
      const handleClick = (e: MouseEvent) => {
        e.stopPropagation()
        toggle()
      }
      el.addEventListener('click', handleClick)
      onOwnerCleanup(() => el.removeEventListener('click', handleClick))
    } else if (trigger === 'hover') {
      const handleEnter = () => {
        if (_hoverTimeout) clearTimeout(_hoverTimeout)
        setOpen(true)
      }
      const handleLeave = () => {
        _hoverTimeout = setTimeout(() => setOpen(false), 100)
      }
      el.addEventListener('mouseenter', handleEnter)
      el.addEventListener('mouseleave', handleLeave)
      onOwnerCleanup(() => {
        el.removeEventListener('mouseenter', handleEnter)
        el.removeEventListener('mouseleave', handleLeave)
      })
    } else if (trigger === 'contextMenu') {
      const handleContext = (e: MouseEvent) => {
        e.preventDefault()
        setOpen(true)
      }
      el.addEventListener('contextmenu', handleContext)
      onOwnerCleanup(() => el.removeEventListener('contextmenu', handleContext))
    }
  }

  const overlayRef = (el: HTMLElement) => {
    _overlayEl = el
    const trigger = config.trigger ?? 'hover'

    if (trigger === 'hover') {
      const handleEnter = () => {
        if (_hoverTimeout) clearTimeout(_hoverTimeout)
      }
      const handleLeave = () => {
        _hoverTimeout = setTimeout(() => setOpen(false), 100)
      }
      el.addEventListener('mouseenter', handleEnter)
      el.addEventListener('mouseleave', handleLeave)
      onOwnerCleanup(() => {
        el.removeEventListener('mouseenter', handleEnter)
        el.removeEventListener('mouseleave', handleLeave)
      })
    }
  }

  // One-shot subscription (no reactive reads): register directly per Solid 2 guidance.
  const handleClickOutside = (e: PointerEvent) => {
    if (!open()) return
    const target = e.target as Node
    if (_triggerEl?.contains(target) || _overlayEl?.contains(target)) return
    setOpen(false)
  }
  document.addEventListener('pointerdown', handleClickOutside)
  onCleanup(() => document.removeEventListener('pointerdown', handleClickOutside))

  const overlayStyle = createMemo((): Record<string, string> => {
    if (!_triggerEl) return { position: 'absolute' }
    const placement = config.placement ?? 'bottomLeft'
    const base: Record<string, string> = { position: 'absolute', 'z-index': '1050' }

    if (placement.startsWith('bottom')) {
      base.top = '100%'
      base['margin-top'] = '4px'
    } else {
      base.bottom = '100%'
      base['margin-bottom'] = '4px'
    }

    if (placement.endsWith('Left') || placement === 'bottom' || placement === 'top') {
      base.left = '0'
    } else {
      base.right = '0'
    }

    return base
  })

  const refs: DropdownIns = {
    open,
    setOpen,
    toggle
  }

  return {
    open,
    setOpen,
    toggle,
    triggerRef,
    overlayRef,
    overlayStyle,
    refs
  }
}

export const dropdownSplits: (keyof DropdownConfig)[] = ['open', 'defaultOpen', 'disabled', 'trigger', 'onOpenChange', 'placement']
