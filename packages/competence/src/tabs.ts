import { createMemo, createSignal, onCleanup, onMount } from "solid-js";

export type TabItem = {
  key: string
  label: string
  disabled?: boolean
  closable?: boolean
  icon?: string
}

export type TabsConfig = {
  activeKey?: string
  defaultActiveKey?: string
  items: TabItem[]
  onChange?: (activeKey: string) => void
  onTabClick?: (key: string, e: MouseEvent) => void
}

export type TabsIns = {
  activeKey: () => string
  setActiveKey: (key: string) => void
  nextTab: () => void
  prevTab: () => void
}

export const createTabs = (config: TabsConfig) => {
  const getDefaultKey = () => {
    if (config.defaultActiveKey) return config.defaultActiveKey
    const first = config.items.find(item => !item.disabled)
    return first?.key ?? ''
  }

  const [_activeKey, _setActiveKey] = createSignal(getDefaultKey())

  const activeKey = createMemo(() => config.activeKey !== undefined ? config.activeKey : _activeKey())

  const setActiveKey = (key: string) => {
    const item = config.items.find(i => i.key === key)
    if (item?.disabled) return
    _setActiveKey(key)
    config.onChange?.(key)
  }

  const isActive = (key: string) => activeKey() === key

  const getEnabledKeys = () => config.items.filter(i => !i.disabled).map(i => i.key)

  const nextTab = () => {
    const keys = getEnabledKeys()
    const idx = keys.indexOf(activeKey())
    if (idx < keys.length - 1) setActiveKey(keys[idx + 1])
  }

  const prevTab = () => {
    const keys = getEnabledKeys()
    const idx = keys.indexOf(activeKey())
    if (idx > 0) setActiveKey(keys[idx - 1])
  }

  let _tabListEl: HTMLElement | undefined

  const tabListRef = (el: HTMLElement) => {
    _tabListEl = el
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        nextTab()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        prevTab()
      }
    }
    el.addEventListener('keydown', handleKeyDown)
    onCleanup(() => {
      el.removeEventListener('keydown', handleKeyDown)
    })
  }

  const refs: TabsIns = {
    activeKey,
    setActiveKey,
    nextTab,
    prevTab
  }

  return {
    activeKey,
    setActiveKey,
    isActive,
    nextTab,
    prevTab,
    tabListRef,
    refs
  }
}

export const tabsSplits: (keyof TabsConfig)[] = ['activeKey', 'defaultActiveKey', 'items', 'onChange', 'onTabClick']
