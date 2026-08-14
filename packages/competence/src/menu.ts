import { createMemo, createSignal } from "solid-js";

export type MenuMode = 'vertical' | 'horizontal' | 'inline'

export type MenuItem = {
  key: string
  label: string
  icon?: string
  disabled?: boolean
  danger?: boolean
  children?: MenuItem[]
  type?: 'group' | 'divider'
}

export type MenuConfig = {
  items: MenuItem[]
  mode?: MenuMode
  selectedKeys?: string[]
  defaultSelectedKeys?: string[]
  openKeys?: string[]
  defaultOpenKeys?: string[]
  multiple?: boolean
  onSelect?: (info: { key: string; selectedKeys: string[] }) => void
  onOpenChange?: (openKeys: string[]) => void
}

export type MenuIns = {
  selectedKeys: () => string[]
  openKeys: () => string[]
  select: (key: string) => void
  toggleOpen: (key: string) => void
}

export const createMenu = (config: MenuConfig) => {
  const [_selectedKeys, _setSelectedKeys] = createSignal<string[]>(config.defaultSelectedKeys ?? [])
  const [_openKeys, _setOpenKeys] = createSignal<string[]>(config.defaultOpenKeys ?? [])

  const selectedKeys = createMemo(() => config.selectedKeys !== undefined ? config.selectedKeys : _selectedKeys())
  const openKeys = createMemo(() => config.openKeys !== undefined ? config.openKeys : _openKeys())

  const select = (key: string) => {
    const item = findItem(config.items, key)
    if (item?.disabled) return

    let newKeys: string[]
    if (config.multiple) {
      const current = selectedKeys()
      newKeys = current.includes(key) ? current.filter(k => k !== key) : [...current, key]
    } else {
      newKeys = [key]
    }
    _setSelectedKeys(newKeys)
    config.onSelect?.({ key, selectedKeys: newKeys })
  }

  const toggleOpen = (key: string) => {
    const current = openKeys()
    const newKeys = current.includes(key) ? current.filter(k => k !== key) : [...current, key]
    _setOpenKeys(newKeys)
    config.onOpenChange?.(newKeys)
  }

  const openSub = (key: string) => {
    const current = openKeys()
    if (!current.includes(key)) {
      const newKeys = [...current, key]
      _setOpenKeys(newKeys)
      config.onOpenChange?.(newKeys)
    }
  }

  const closeSub = (key: string) => {
    const current = openKeys()
    if (current.includes(key)) {
      const newKeys = current.filter(k => k !== key)
      _setOpenKeys(newKeys)
      config.onOpenChange?.(newKeys)
    }
  }

  const isSelected = (key: string) => selectedKeys().includes(key)
  const isOpen = (key: string) => openKeys().includes(key)

  const refs: MenuIns = {
    selectedKeys,
    openKeys,
    select,
    toggleOpen
  }

  return {
    selectedKeys,
    openKeys,
    select,
    toggleOpen,
    openSub,
    closeSub,
    isSelected,
    isOpen,
    refs
  }
}

function findItem(items: MenuItem[], key: string): MenuItem | undefined {
  for (const item of items) {
    if (item.key === key) return item
    if (item.children) {
      const found = findItem(item.children, key)
      if (found) return found
    }
  }
  return undefined
}

export const menuSplits: (keyof MenuConfig)[] = ['items', 'mode', 'selectedKeys', 'defaultSelectedKeys', 'openKeys', 'defaultOpenKeys', 'multiple', 'onSelect', 'onOpenChange']
