import { createEffect, createMemo, createSignal, createUniqueId, untrack } from "solid-js";

/**
 * Headless logic for Menu — the rc-menu (@rc-component/menu 1.5) state core.
 *
 *  - key-path registry derived from the items tree (groups are NOT part of a
 *    path, dividers are skipped); keyless groups / dividers get stable
 *    positional keys so the UI can iterate the same normalized tree
 *  - selection: selectable / multiple, onClick fires BEFORE onSelect /
 *    onDeselect, and (single-select, non-inline) any click closes every open
 *    popup — whether or not the menu is selectable
 *  - open keys: remove-then-push ordering, closing a popup in non-inline mode
 *    also closes its sub-path popups, callbacks fire only when the list changed
 *  - mode derivation: inline / vertical + inlineCollapsed → internal vertical
 *    + collapsed; after mount a mode change restores the cached inline open
 *    keys when entering inline, otherwise clears them (onOpenChange fires)
 *  - keyboard: the rc useAccessibility port, DOM-driven through
 *    `data-menu-owner` / `data-menu-key` markers so portaled popups take part
 *
 * Imperative reads go through synchronous mirrors because Solid 2 commits
 * signal writes in batches: a click right after an open-change in the same
 * tick must see the pending keys.
 */

export type MenuMode = 'vertical' | 'horizontal' | 'inline'
export type MenuTheme = 'light' | 'dark'
export type MenuItemKind = 'item' | 'submenu' | 'group' | 'divider'

/**
 * Item shape shared by the headless and UI layers. `Node` is the renderable
 * node type (JSX.Element in the UI layer); the headless layer never renders.
 */
export type MenuItem<Node = unknown> = {
  /** Unique key. Optional for groups and dividers. */
  key?: string
  label?: Node
  icon?: Node | string
  /** Collapsed tooltip title; `false` disables the tooltip for this item. */
  title?: string | false
  extra?: Node
  disabled?: boolean
  danger?: boolean
  /** Divider only: dashed line. */
  dashed?: boolean
  type?: 'item' | 'submenu' | 'group' | 'divider'
  children?: MenuItem<Node>[]
  /** SubMenu only: popup theme, inherits from the menu by default. */
  theme?: MenuTheme
  /** SubMenu only: extra class on the popup (no effect in inline mode). */
  popupClassName?: string
  /** SubMenu only: [x, y] popup offset in px (no effect in inline mode). */
  popupOffset?: [number, number]
  /** SubMenu only: title click callback. */
  onTitleClick?: (info: { key: string; domEvent: MouseEvent | KeyboardEvent }) => void
}

export type MenuNode<Item extends MenuItem<any> = MenuItem> = {
  key: string
  item: Item
  kind: MenuItemKind
  /** Root-first key path; groups are skipped. For a group: its parent's path. */
  path: string[]
  children: MenuNode<Item>[]
}

export type MenuClickInfo<Item extends MenuItem<any> = MenuItem> = {
  key: string
  /** Leaf-first key path (rc / antd legacy order). */
  keyPath: string[]
  domEvent?: MouseEvent | KeyboardEvent
  /** The item object this key was declared with. */
  item: Item
  /** antd 6 name for `item` (same object). */
  itemData: Item
}

export type MenuSelectInfo<Item extends MenuItem<any> = MenuItem> = MenuClickInfo<Item> & { selectedKeys: string[] }

export type MenuConfig<Item extends MenuItem<any> = MenuItem> = {
  items?: Item[]
  /** Default 'vertical'. */
  mode?: MenuMode
  /** Already merged with the Sider context by the UI layer. */
  inlineCollapsed?: boolean
  /** Default true. */
  selectable?: boolean
  multiple?: boolean
  selectedKeys?: string[]
  defaultSelectedKeys?: string[]
  openKeys?: string[]
  defaultOpenKeys?: string[]
  onClick?: (info: MenuClickInfo<Item>) => void
  onSelect?: (info: MenuSelectInfo<Item>) => void
  onDeselect?: (info: MenuSelectInfo<Item>) => void
  onOpenChange?: (openKeys: string[]) => void
  /** DOM marker id; generated when omitted. */
  id?: string
  /** Frame scheduler for keyboard focus moves (tests inject a sync one). */
  raf?: (cb: () => void) => void
}

export type MenuIns = {
  selectedKeys: () => string[]
  openKeys: () => string[]
  select: (key: string) => void
  toggleOpen: (key: string) => void
}

const kindOf = (item: MenuItem<any>): MenuItemKind => {
  if (item.type === 'divider') return 'divider'
  if (item.type === 'group') return 'group'
  if (item.type === 'submenu' || Array.isArray(item.children)) return 'submenu'
  return 'item'
}

/** Normalize an items tree into render nodes with resolved keys and paths. Pure. */
export const buildMenuNodes = <Item extends MenuItem<any>>(items: readonly Item[] | undefined, parentPath: string[] = [], prefix = 'menu-'): MenuNode<Item>[] =>
  (items ?? []).filter(Boolean).map((item, index) => {
    const kind = kindOf(item)
    const key = item.key ?? `${prefix}${kind}-${index}`
    if (kind === 'group') {
      return { key, item, kind, path: parentPath, children: buildMenuNodes(item.children as Item[] | undefined, parentPath, `${key}-`) }
    }
    const path = [...parentPath, key]
    const children = kind === 'submenu' ? buildMenuNodes(item.children as Item[] | undefined, path, `${key}-`) : []
    return { key, item, kind, path, children }
  })

const sameList = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((key, index) => key === b[index])

const NAV_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', 'Home', 'End']
const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

type Offset = { offset: number; sibling: boolean } | { inlineTrigger: true } | null

/** rc-menu getOffset (LTR): what a key means for the focused level. Pure. */
export const getMenuKeyOffset = (mode: MenuMode, isRootLevel: boolean, key: string): Offset => {
  if (mode === 'inline' && key === 'Enter') return { inlineTrigger: true }
  const inline: Record<string, string> = { ArrowUp: 'prev', ArrowDown: 'next' }
  const horizontal: Record<string, string> = { ArrowLeft: 'prev', ArrowRight: 'next', ArrowDown: 'children', Enter: 'children' }
  const vertical: Record<string, string> = {
    ArrowUp: 'prev', ArrowDown: 'next', Enter: 'children', Escape: 'parent', ArrowLeft: 'parent', ArrowRight: 'children',
  }
  const table = mode === 'inline' ? inline : mode === 'horizontal' && isRootLevel ? horizontal : vertical
  switch (table[key]) {
    case 'prev': return { offset: -1, sibling: true }
    case 'next': return { offset: 1, sibling: true }
    case 'parent': return { offset: -1, sibling: false }
    case 'children': return { offset: 1, sibling: false }
    default: return null
  }
}

export const createMenu = <Item extends MenuItem<any> = MenuItem>(config: MenuConfig<Item>) => {
  const id = config.id ?? `menu-${createUniqueId()}`

  // ---- registry -----------------------------------------------------------
  const nodes = createMemo(() => buildMenuNodes(config.items))
  const registry = createMemo(() => {
    const map = new Map<string, MenuNode<Item>>()
    const walk = (list: MenuNode<Item>[]) => list.forEach(node => {
      if (node.kind !== 'divider') map.set(node.key, node)
      walk(node.children)
    })
    walk(nodes())
    return map
  })
  const entryOf = (key: string) => untrack(registry).get(key)
  /** Root-first path of a key; [] for unknown keys. */
  const pathOf = (key: string) => registry().get(key)?.path ?? []
  /** Keys of every node nested below `key` (the rc getSubPathKeys). */
  const subPathKeys = (key: string) => {
    const result = new Set<string>()
    for (const node of untrack(registry).values()) {
      if (node.kind !== 'group' && node.key !== key && node.path.includes(key)) result.add(node.key)
    }
    return result
  }

  // ---- selection ----------------------------------------------------------
  const [_selected, _setSelected] = createSignal<string[]>(config.defaultSelectedKeys ?? [], { ownedWrite: true })
  let selectedRef = untrack(() => config.defaultSelectedKeys ?? [])
  const selectedKeys = createMemo(() => config.selectedKeys !== undefined ? config.selectedKeys : _selected())
  const readSelected = () => config.selectedKeys !== undefined ? config.selectedKeys : selectedRef
  const isSelected = (key: string) => selectedKeys().includes(key)
  /** Submenus that contain a selected descendant (the rc submenu-selected class). */
  const selectedAncestors = createMemo(() => {
    const result = new Set<string>()
    const map = registry()
    for (const key of selectedKeys()) {
      const path = map.get(key)?.path ?? []
      path.slice(0, -1).forEach(k => result.add(k))
    }
    return result
  })
  const isChildSelected = (key: string) => selectedAncestors().has(key)

  // ---- open keys ----------------------------------------------------------
  const [_open, _setOpen] = createSignal<string[]>(config.defaultOpenKeys ?? [], { ownedWrite: true })
  let openRef = untrack(() => config.defaultOpenKeys ?? [])
  const openKeys = createMemo(() => config.openKeys !== undefined ? config.openKeys : _open())
  const readOpen = () => config.openKeys !== undefined ? config.openKeys : openRef
  const isOpen = (key: string) => openKeys().includes(key)
  const writeOpen = (keys: string[]) => {
    openRef = keys
    _setOpen(keys)
  }
  const triggerOpenKeys = (keys: string[]) => {
    writeOpen(keys)
    config.onOpenChange?.(keys)
  }

  // ---- mode ---------------------------------------------------------------
  const derived = createMemo(() => {
    const mode = config.mode ?? 'vertical'
    return (mode === 'inline' || mode === 'vertical') && config.inlineCollapsed ? 'vertical-collapsed' : mode
  })
  const mode = createMemo((): MenuMode => derived() === 'vertical-collapsed' ? 'vertical' : derived() as MenuMode)
  const inlineCollapsed = createMemo(() => derived() === 'vertical-collapsed')

  // Inline open keys survive a collapse / mode round-trip (rc inlineCacheOpenKeys).
  let inlineCache = untrack(readOpen)
  let mounted = false
  createEffect(derived, value => {
    if (!mounted) {
      mounted = true
      return
    }
    if (value === 'inline') writeOpen(inlineCache)
    else triggerOpenKeys([])
  })
  // Track only the open keys: the mode effect above re-seeds them one commit
  // later, and the cache must not be overwritten by the pre-restore value.
  createEffect(openKeys, keys => {
    if (untrack(derived) === 'inline') inlineCache = keys
  })

  // ---- actions ------------------------------------------------------------
  const openChange = (key: string, open: boolean) => {
    const current = readOpen()
    let next = current.filter(k => k !== key)
    if (open) next.push(key)
    else if (untrack(mode) !== 'inline') {
      const sub = subPathKeys(key)
      next = next.filter(k => !sub.has(k))
    }
    if (!sameList(current, next)) triggerOpenKeys(next)
  }

  const click = (key: string, domEvent?: MouseEvent | KeyboardEvent) => {
    const node = entryOf(key)
    if (!node || node.kind !== 'item' || node.item.disabled) return
    const info: MenuClickInfo<Item> = { key, keyPath: [...node.path].reverse(), domEvent, item: node.item, itemData: node.item }
    config.onClick?.(info)
    if (config.selectable ?? true) {
      const current = readSelected()
      const exist = current.includes(key)
      const next = config.multiple
        ? exist ? current.filter(k => k !== key) : [...current, key]
        : [key]
      selectedRef = next
      _setSelected(next)
      const selectInfo = { ...info, selectedKeys: next }
      if (exist) config.onDeselect?.(selectInfo)
      else config.onSelect?.(selectInfo)
    }
    // Whatever selectable, a single-select click closes every popup.
    if (!config.multiple && readOpen().length && untrack(mode) !== 'inline') triggerOpenKeys([])
  }

  /** SubMenu title click: onTitleClick, and inline mode toggles the list. */
  const titleClick = (key: string, domEvent: MouseEvent | KeyboardEvent) => {
    const node = entryOf(key)
    if (!node || node.kind !== 'submenu' || node.item.disabled) return
    node.item.onTitleClick?.({ key, domEvent })
    if (untrack(mode) === 'inline') openChange(key, !readOpen().includes(key))
  }

  // ---- keyboard -----------------------------------------------------------
  const raf = (cb: () => void) => config.raf ? config.raf(cb) : requestAnimationFrame(cb)

  /** Focusable menu elements of THIS menu, portaled popups included. */
  const collect = () => {
    const key2el = new Map<string, HTMLElement>()
    const el2key = new Map<HTMLElement, string>()
    if (typeof document === 'undefined') return { key2el, el2key }
    document.querySelectorAll<HTMLElement>(`[data-menu-owner="${id}"]`).forEach(el => {
      if (!el.hasAttribute('tabindex') || el.closest('[inert]')) return
      const key = el.getAttribute('data-menu-key')
      if (key === null) return
      key2el.set(key, el)
      el2key.set(el, key)
    })
    return { key2el, el2key }
  }

  const levelElements = (container: Element, el2key: Map<HTMLElement, string>, wholeTree: boolean) =>
    [...el2key.keys()].filter(el => container.contains(el) && (wholeTree || el.closest('[data-menu-list]') === container))

  const nextElement = (list: HTMLElement[], current: HTMLElement | null, offset: number) => {
    if (!list.length) return undefined
    let index = current ? list.indexOf(current) : -1
    if (offset < 0) index = index === -1 ? list.length - 1 : index - 1
    else if (offset > 0) index += 1
    return list[(index + list.length) % list.length]
  }

  /** Focus a menu element — its link when it wraps one — retrying across frames until it takes. */
  const tryFocus = (target: HTMLElement | undefined | (() => HTMLElement | undefined), attempts = 30) => {
    const attempt = (left: number) => {
      const el = typeof target === 'function' ? target() : target
      if (el) {
        const link = el.querySelector<HTMLElement>('a[href]')
        const focusTarget = link ?? el
        focusTarget.focus({ preventScroll: false })
        if (document.activeElement === focusTarget) return
      }
      if (left > 0) raf(() => attempt(left - 1))
    }
    attempt(attempts)
  }

  const onKeyDown = (event: KeyboardEvent, root: HTMLElement | undefined) => {
    if (!NAV_KEYS.includes(event.key) || !root) return
    const currentMode = untrack(mode)
    const { key2el, el2key } = collect()
    let cursor = document.activeElement as HTMLElement | null
    let focusEl: HTMLElement | null = null
    while (cursor) {
      if (el2key.has(cursor)) { focusEl = cursor; break }
      cursor = cursor.parentElement
    }
    const focusKey = focusEl ? el2key.get(focusEl)! : undefined
    const node = focusKey !== undefined ? entryOf(focusKey) : undefined
    const offset = getMenuKeyOffset(currentMode, node?.path.length === 1, event.key)
    const isEdge = event.key === 'Home' || event.key === 'End'
    if (!offset && !isEdge) return
    if (ARROW_KEYS.includes(event.key) || isEdge) event.preventDefault()

    // Enter on a plain item is a click (rc MenuItem onKeyDown).
    if (event.key === 'Enter' && node?.kind === 'item') {
      click(node.key, event)
      return
    }

    if (isEdge || (offset && 'sibling' in offset && offset.sibling) || !focusEl) {
      const container = !focusEl || currentMode === 'inline' ? root : focusEl.closest('[data-menu-list]') ?? root
      const list = levelElements(container, el2key, currentMode === 'inline')
      const step = offset && 'offset' in offset ? offset.offset : 1
      const target = event.key === 'Home' ? list[0] : event.key === 'End' ? list[list.length - 1] : nextElement(list, focusEl, step)
      tryFocus(target, 0)
      return
    }
    if (!node) return
    if (offset && 'inlineTrigger' in offset) {
      if (node.kind === 'submenu') titleClick(node.key, event)
      return
    }
    if (!offset) return
    if (offset.offset > 0) {
      if (node.kind !== 'submenu' || node.item.disabled) return
      openChange(node.key, true)
      const controls = focusEl.getAttribute('aria-controls')
      // The popup mounts, measures and reveals over the next frames.
      raf(() => tryFocus(() => {
        const container = controls ? document.getElementById(controls) : null
        if (!container || container.closest('[inert]')) return undefined
        const fresh = collect()
        return levelElements(container, fresh.el2key, false)[0]
      }))
      return
    }
    const parentKey = node.path[node.path.length - 2]
    if (parentKey === undefined) return
    openChange(parentKey, false)
    tryFocus(key2el.get(parentKey), 0)
  }

  /** Focus the first focusable item of the root list (rc MenuRef.focus). */
  const focus = (root: HTMLElement | undefined, options?: FocusOptions) => {
    if (!root) return
    const { el2key } = collect()
    const target = levelElements(root, el2key, true)[0]
    const link = target?.querySelector<HTMLElement>('a[href]')
    ;(link ?? target)?.focus(options)
  }

  // ---- compatibility ------------------------------------------------------
  /** Legacy: select an item as if it were clicked. */
  const select = (key: string) => click(key)
  const toggleOpen = (key: string) => openChange(key, !readOpen().includes(key))
  const openSub = (key: string) => openChange(key, true)
  const closeSub = (key: string) => openChange(key, false)

  const refs: MenuIns = { selectedKeys, openKeys, select, toggleOpen }

  return {
    id,
    nodes,
    registry,
    pathOf,
    subPathKeys,
    mode,
    inlineCollapsed,
    selectedKeys,
    openKeys,
    isSelected,
    isChildSelected,
    isOpen,
    click,
    titleClick,
    openChange,
    onKeyDown,
    focus,
    select,
    toggleOpen,
    openSub,
    closeSub,
    refs,
  }
}

export const menuSplits: (keyof MenuConfig)[] = [
  'items', 'mode', 'inlineCollapsed', 'selectable', 'multiple', 'selectedKeys', 'defaultSelectedKeys',
  'openKeys', 'defaultOpenKeys', 'onClick', 'onSelect', 'onDeselect', 'onOpenChange', 'id', 'raf',
]
