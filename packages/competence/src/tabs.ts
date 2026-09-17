import { createMemo, createSignal } from "solid-js";
import { createOwnerCleanup } from "./utils";

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
  editable?: boolean
  draggable?: boolean
  onEdit?: (target: string | MouseEvent, action: 'add' | 'remove') => void
  onReorder?: (keys: string[], info: { key: string; from: number; to: number }) => void
}

export type TabsIns = {
  activeKey: () => string
  setActiveKey: (key: string) => void
  nextTab: () => void
  prevTab: () => void
}

export const createTabs = (config: TabsConfig) => {
  const onOwnerCleanup = createOwnerCleanup();
  const getDefaultKey = () => {
    if (config.defaultActiveKey) return config.defaultActiveKey
    const first = config.items.find(item => !item.disabled)
    return first?.key ?? ''
  }

  const [_activeKey, _setActiveKey] = createSignal(getDefaultKey(), { ownedWrite: true })
  const [order, setOrder] = createSignal<{ source: TabItem[]; keys: string[] } | undefined>(undefined, { ownedWrite: true })
  const [draggingKey, setDraggingKey] = createSignal<string | undefined>(undefined, { ownedWrite: true })
  let dragKey: string | undefined
  const items = createMemo(() => {
    const source = config.items
    const ordering = order()
    if (!ordering || ordering.source !== source) return source
    const current = new Map(source.map(item => [item.key, item]))
    const sorted = ordering.keys.flatMap(key => { const item = current.get(key); current.delete(key); return item ? [item] : [] })
    return [...sorted, ...current.values()]
  })

  const activeKey = createMemo(() => config.activeKey !== undefined ? config.activeKey : items().some(item => item.key === _activeKey() && !item.disabled) ? _activeKey() : items().find(item => !item.disabled)?.key ?? '')

  const setActiveKey = (key: string) => {
    const item = config.items.find(i => i.key === key)
    if (!item || item.disabled || key === activeKey()) return
    _setActiveKey(key)
    config.onChange?.(key)
  }

  const isActive = (key: string) => activeKey() === key

  const getEnabledKeys = () => items().filter(i => !i.disabled).map(i => i.key)
  const add = (event?: MouseEvent) => { if (config.editable) config.onEdit?.(event ?? '', 'add') }
  const remove = (key: string) => {
    const item = config.items.find(item => item.key === key)
    if (!config.editable || !item || item.disabled || item.closable === false) return
    // Items belong to the caller; this is a request, not a hidden mutation.
    config.onEdit?.(key, 'remove')
  }
  const reorder = (key: string, target: string) => {
    if (!config.draggable) return
    const list = items(), from = list.findIndex(item => item.key === key), to = list.findIndex(item => item.key === target)
    if (from < 0 || to < 0 || from === to || list[from].disabled || list[to].disabled) return
    const keys = list.map(item => item.key)
    keys.splice(to, 0, keys.splice(from, 1)[0]); setOrder({ source: config.items, keys })
    config.onReorder?.(keys, { key, from, to })
  }
  const startDrag = (key: string) => {
    if (!config.draggable || !items().some(item => item.key === key && !item.disabled)) return false
    dragKey = key; setDraggingKey(key); return true
  }
  const endDrag = () => { dragKey = undefined; setDraggingKey(undefined) }
  const drop = (target: string) => { if (dragKey) reorder(dragKey, target); endDrag() }

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
    onOwnerCleanup(() => {
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
    items, add, remove, reorder, startDrag, endDrag, drop, draggingKey,
    activeKey,
    setActiveKey,
    isActive,
    nextTab,
    prevTab,
    tabListRef,
    refs
  }
}

export const tabsSplits: (keyof TabsConfig)[] = ['activeKey', 'defaultActiveKey', 'items', 'onChange', 'onTabClick', 'editable', 'draggable', 'onEdit', 'onReorder']
