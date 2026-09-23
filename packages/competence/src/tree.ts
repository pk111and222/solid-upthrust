import { createTreeDrag, type TreeDragConfig, type TreeDragIns } from './treeDrag'
import { createMemo, createSignal, untrack } from "solid-js";

/** Shared tree indexing, controlled state, check conduction and keyboard navigation.
 * Disabled branches form boundaries; non-checkable nodes allow conduction
 * through to their children. TreeSelect adds its value-reporting strategy.
 */
import type { FormFieldRule } from "./formField";

export type TreeSelectNode = {
  value: string | number
  label: string
  disabled?: boolean
  /** Rows are clickable-selectable unless false (antd selectable). */
  selectable?: boolean
  /** Rows are checkable unless false (antd checkable per node). */
  checkable?: boolean
  children?: TreeSelectNode[]
  [key: string]: unknown
}

export type TreeCheckState = 'checked' | 'indeterminate' | 'unchecked'

// ---- tree shape helpers (pure) -----------------------------------------------

/** Depth-first walk collecting EVERY node with its path and depth. */
export const flattenTree = (
  nodes: TreeSelectNode[],
  parent?: TreeSelectNode,
  path: Array<string | number> = [],
  level = 0,
): Array<{ node: TreeSelectNode; parent?: TreeSelectNode; path: Array<string | number>; level: number }> => {
  const out: Array<{ node: TreeSelectNode; parent?: TreeSelectNode; path: Array<string | number>; level: number }> = []
  for (const n of nodes) {
    const entry = { node: n, parent, path: [...path, n.value], level }
    out.push(entry)
    if (n.children?.length) out.push(...flattenTree(n.children, n, entry.path, level + 1))
  }
  return out
}

/** The value-keyed lookup (rebuilt by a memo when treeData changes). */
export type TreeIndex = Map<string | number, {
  node: TreeSelectNode
  parent?: TreeSelectNode
  path: Array<string | number>
  level: number
}>

export const buildTreeIndex = (nodes: TreeSelectNode[]): TreeIndex => {
  const map: TreeIndex = new Map()
  for (const e of flattenTree(nodes)) map.set(e.node.value, e)
  return map
}

/** Every node value that has children (the expandable set). */
export const branchKeysOf = (nodes: TreeSelectNode[]): Array<string | number> => {
  const out: Array<string | number> = []
  const walk = (list: TreeSelectNode[]) => {
    for (const n of list) {
      if (n.children?.length) {
        out.push(n.value)
        walk(n.children)
      }
    }
  }
  walk(nodes)
  return out
}

// ---- createTree -----------------------------------------------------------------

export type TreeConfig = TreeDragConfig & {
  treeData?: TreeSelectNode[]
  /** Controlled expanded keys. */
  expandedKeys?: Array<string | number>
  defaultExpandedKeys?: Array<string | number>
  /** Expand every branch on mount. Default false. */
  defaultExpandAll?: boolean
  /** Controlled selected (highlighted) keys. */
  selectedKeys?: Array<string | number>
  defaultSelectedKeys?: Array<string | number>
  /** Controlled checked keys (checkable). */
  checkedKeys?: Array<string | number>
  defaultCheckedKeys?: Array<string | number>
  /** Parent↔children checkbox linkage. Default true. */
  checkable?: boolean
  /** Rows are clickable-selected. Default true. */
  selectable?: boolean
  multiple?: boolean
  /** Check nodes independently without parent/child linkage. */
  checkStrictly?: boolean
  /** Disable the whole widget. */
  disabled?: boolean
  onExpand?: (expandedKeys: Array<string | number>, info: { node: TreeSelectNode; expanded: boolean }) => void
  onSelect?: (selectedKeys: Array<string | number>, info: { node: TreeSelectNode; selected: boolean }) => void
  onCheck?: (checkedKeys: Array<string | number>, info: { node: TreeSelectNode; checked: boolean }) => void
}

export type TreeIns = TreeDragIns & {
  treeData: () => TreeSelectNode[]
  nodeIndex: () => TreeIndex
  getNode: (value: string | number) => TreeSelectNode | undefined
  isDisabled: (value: string | number) => boolean
  hasChildren: (value: string | number) => boolean
  isSelectable: (value: string | number) => boolean
  isCheckableNode: (value: string | number) => boolean
  // ---- expand ----
  expandedKeys: () => Array<string | number>
  isExpanded: (value: string | number) => boolean
  expand: (value: string | number) => void
  collapse: (value: string | number) => void
  toggleExpand: (value: string | number) => void
  setExpandedKeys: (keys: Array<string | number>) => void
  // ---- select ----
  selectedKeys: () => Array<string | number>
  isSelected: (value: string | number) => boolean
  select: (value: string | number) => void
  // ---- check ----
  checkedKeys: () => Array<string | number>
  halfCheckedKeys: () => Array<string | number>
  isHalfChecked: (value: string | number) => boolean
  isChecked: (value: string | number) => boolean
  checkState: (value: string | number) => TreeCheckState
  toggleCheck: (value: string | number) => void
  setCheckedKeys: (keys: Array<string | number>) => void
  visibleKeys: () => Array<string | number>
  activeKey: () => string | number | undefined
  setActiveKey: (key: string | number) => void
  navigate: (key: string) => string | number | undefined
  // ---- search ----
  searchValue: () => string
  setSearchValue: (text: string) => void
  searching: () => boolean
  /**
   * The tree to RENDER: the full data normally; while searching, the tree
   * pruned to matching nodes (a node survives when IT or any descendant
   * matches) with the matched label highlighted via nodeMeta.
   */
  displayTree: () => TreeSelectNode[]
  /** value → did this node's own label match the query (for highlight). */
  matchSet: () => Set<string | number>
  isSearching: () => boolean
  clear: () => void
  isWidgetDisabled: () => boolean
}

const nodeLabel = (n: TreeSelectNode): string =>
  typeof n.label === 'string' ? n.label : String(n.label)

export const createTree = (config: TreeConfig = {}): TreeIns => {
  const checkable = createMemo(() => config.checkable ?? true)
  const widgetDisabled = createMemo(() => !!config.disabled)
  const selectable = createMemo(() => config.selectable ?? true)
  const nodeIndex = createMemo(() => buildTreeIndex(config.treeData ?? []))
  const getNode = (key: string | number) => nodeIndex().get(key)?.node
  const isBranchDisabled = (key: string | number): boolean => {
    const entry = nodeIndex().get(key)
    return !entry || entry.path.some(k => !!getNode(k)?.disabled)
  }
  const isDisabled = (key: string | number) => widgetDisabled() || isBranchDisabled(key)
  const hasChildren = (key: string | number) => !!getNode(key)?.children?.length
  const isSelectable = (key: string | number) => selectable() && !!getNode(key) && getNode(key)?.selectable !== false
  const isCheckableNode = (key: string | number) => checkable() && !!getNode(key) && getNode(key)?.checkable !== false

  const [_expanded, _setExpanded] = createSignal<Array<string | number>>(
    config.defaultExpandAll ? branchKeysOf(config.treeData ?? []) : config.defaultExpandedKeys ?? [], { ownedWrite: true },
  )
  const expandedKeys = () => config.expandedKeys ?? _expanded()
  const isExpanded = (key: string | number) => expandedKeys().includes(key)
  const emitExpanded = (keys: Array<string | number>, node: TreeSelectNode, expanded: boolean) => {
    if (config.expandedKeys === undefined) _setExpanded(keys)
    config.onExpand?.(keys, { node, expanded })
  }
  const expand = (key: string | number) => {
    const node = getNode(key)
    if (node && !config.disabled && hasChildren(key) && !isExpanded(key)) emitExpanded([...expandedKeys(), key], node, true)
  }
  const collapse = (key: string | number) => {
    const node = getNode(key)
    if (node && !config.disabled && isExpanded(key)) emitExpanded(expandedKeys().filter(k => k !== key), node, false)
  }
  const toggleExpand = (key: string | number) => isExpanded(key) ? collapse(key) : expand(key)
  const setExpandedKeys = (keys: Array<string | number>) => {
    if (config.expandedKeys === undefined) _setExpanded(keys)
  }

  const [_selected, _setSelected] = createSignal<Array<string | number>>(config.defaultSelectedKeys ?? [], { ownedWrite: true })
  const selectedKeys = () => config.selectedKeys ?? _selected()
  const isSelected = (key: string | number) => selectedKeys().includes(key)
  const select = (key: string | number) => {
    const node = getNode(key)
    if (!node || isDisabled(key) || !isSelectable(key)) return
    const selected = !isSelected(key)
    const next = config.multiple
      ? selected ? [...selectedKeys(), key] : selectedKeys().filter(k => k !== key)
      : selected ? [key] : []
    if (config.selectedKeys === undefined) _setSelected(next)
    config.onSelect?.(next, { node, selected })
  }

  const [_checked, _setChecked] = createSignal<Array<string | number>>(config.defaultCheckedKeys ?? [], { ownedWrite: true })
  // Disabled branches are boundaries: neither parent checks nor derivation
  // may alter any node below them. Uncheckable nodes remain traversable.
  const coveredKeys = (key: string | number): Array<string | number> => {
    const out: Array<string | number> = []
    const visit = (node: TreeSelectNode) => {
      if (node.disabled) return
      if (node.checkable !== false) out.push(node.value)
      node.children?.forEach(visit)
    }
    const node = getNode(key)
    if (node) visit(node)
    return out
  }
  const normalize = (keys: Array<string | number>, expandSeeds: boolean) => {
    if (config.checkStrictly || !checkable()) return [...new Set(keys)]
    const next = new Set(keys)
    if (expandSeeds) for (const key of keys) {
      if (!isBranchDisabled(key)) coveredKeys(key).forEach(k => next.add(k))
    }
    // Descendants settle before parents. This both promotes complete branches
    // and removes stale parent keys after a child is unchecked.
    for (const [key, entry] of [...nodeIndex()].reverse()) {
      if (isBranchDisabled(key) || entry.node.checkable === false) continue
      const children = coveredKeys(key).filter(k => k !== key)
      if (!children.length) continue
      if (children.every(k => next.has(k))) next.add(key)
      else next.delete(key)
    }
    return [...next]
  }
  const checkedKeys = createMemo(() => normalize(config.checkedKeys ?? _checked(), true))
  const isChecked = (key: string | number) => checkedKeys().includes(key)
  const halfCheckedKeys = createMemo(() => {
    if (config.checkStrictly || !checkable()) return []
    return [...nodeIndex().keys()].filter(key => !isBranchDisabled(key) && isCheckableNode(key) && !isChecked(key)
      && coveredKeys(key).some(k => k !== key && isChecked(k)))
  })
  const isHalfChecked = (key: string | number) => halfCheckedKeys().includes(key)
  const checkState = (key: string | number): TreeCheckState => !isCheckableNode(key) ? 'unchecked'
    : isChecked(key) ? 'checked' : isHalfChecked(key) ? 'indeterminate' : 'unchecked'
  const toggleCheck = (key: string | number) => {
    const node = getNode(key)
    if (!node || isDisabled(key) || !isCheckableNode(key)) return
    const checked = !isChecked(key)
    const next = new Set(checkedKeys())
    for (const k of config.checkStrictly ? [key] : coveredKeys(key)) {
      if (checked) next.add(k)
      else next.delete(k)
    }
    const keys = normalize([...next], false)
    if (config.checkedKeys === undefined) _setChecked(keys)
    config.onCheck?.(keys, { node, checked })
  }
  const setCheckedKeys = (keys: Array<string | number>) => {
    if (config.checkedKeys === undefined) _setChecked(keys)
  }

  const [_search, _setSearch] = createSignal('', { ownedWrite: true })
  const searchValue = () => _search()
  const searching = () => !!_search().trim()
  const searchResult = createMemo(() => {
    const query = _search().trim().toLowerCase()
    const matches = new Set<string | number>()
    if (!query) return { nodes: config.treeData ?? [], matches }
    const visit = (nodes: TreeSelectNode[]): TreeSelectNode[] => nodes.flatMap(node => {
      const matched = nodeLabel(node).toLowerCase().includes(query)
      if (matched) matches.add(node.value)
      const children = visit(node.children ?? [])
      return matched || children.length ? [{ ...node, children, __forceExpanded: children.length > 0 }] : []
    })
    return { nodes: visit(config.treeData ?? []), matches }
  })
  const displayTree = () => searchResult().nodes
  const matchSet = () => searchResult().matches
  const setSearchValue = (text: string) => _setSearch(text)
  const clear = () => _setSearch('')
  const visibleKeys = createMemo(() => {
    const keys: Array<string | number> = []
    const visit = (nodes: TreeSelectNode[]) => nodes.forEach(node => {
      if (!isDisabled(node.value)) keys.push(node.value)
      if (node.__forceExpanded === true || isExpanded(node.value)) visit(node.children ?? [])
    })
    visit(displayTree())
    return keys
  })
  const [_active, _setActive] = createSignal<string | number | undefined>(undefined, { ownedWrite: true })
  const activeKey = () => {
    const current = _active()
    return current !== undefined && visibleKeys().includes(current) ? current : visibleKeys()[0]
  }
  const setActiveKey = (key: string | number) => { if (!isDisabled(key)) _setActive(key) }
  const navigate = (key: string) => {
    if (config.disabled) return undefined
    const keys = visibleKeys()
    const current = activeKey()
    if (current === undefined) return undefined
    const index = keys.indexOf(current)
    let next = current
    switch (key) {
      case 'ArrowDown': next = keys[Math.min(index + 1, keys.length - 1)]; break
      case 'ArrowUp': next = keys[Math.max(index - 1, 0)]; break
      case 'Home': next = keys[0]; break
      case 'End': next = keys[keys.length - 1]; break
      case 'ArrowRight':
        if (hasChildren(current) && !isExpanded(current) && !searching()) expand(current)
        else if (getNode(current)?.children?.some(node => node.value === keys[index + 1])) next = keys[index + 1]
        break
      case 'ArrowLeft':
        if (hasChildren(current) && isExpanded(current) && !searching()) collapse(current)
        else next = nodeIndex().get(current)?.parent?.value ?? current
        break
      case 'Enter': select(current); break
      case ' ': if (checkable()) toggleCheck(current); else select(current); break
      default: return undefined
    }
    setActiveKey(next)
    return next
  }
  // UI callbacks are imperative reads, not reactive computations.
  const intent = <A extends unknown[], R>(fn: (...args: A) => R) => (...args: A) => untrack(() => fn(...args))
  return {
    ...createTreeDrag(config, { getNode, nodeIndex, isDisabled, expand: intent(expand) }),
    treeData: () => config.treeData ?? [], nodeIndex, getNode, isDisabled, hasChildren, isSelectable, isCheckableNode,
    expandedKeys, isExpanded, expand: intent(expand), collapse: intent(collapse), toggleExpand: intent(toggleExpand), setExpandedKeys: intent(setExpandedKeys),
    selectedKeys, isSelected, select: intent(select), checkedKeys, halfCheckedKeys, isHalfChecked, isChecked, checkState, toggleCheck: intent(toggleCheck), setCheckedKeys: intent(setCheckedKeys),
    searchValue, setSearchValue, searching, displayTree, matchSet, isSearching: searching, clear,
    visibleKeys, activeKey, setActiveKey: intent(setActiveKey), navigate: intent(navigate), isWidgetDisabled: widgetDisabled,
  }
}

// ---- createTreeSelect ---------------------------------------------------------

export type TreeSelectCheckStrategy = 'SHOW_PARENT' | 'SHOW_CHILD' | 'SHOW_ALL'

export type TreeSelectConfig = {
  /** Controlled value: single key (single) or key array (multiple). */
  value?: string | number | Array<string | number>
  defaultValue?: string | number | Array<string | number>
  treeData?: TreeSelectNode[]
  /** 'multiple' turns on the checkbox mode. */
  mode?: 'multiple'
  /** Parent↔children linkage when multiple. Default true. */
  treeCheckable?: boolean
  /** Independent parent/child checks (no linkage). Default false. */
  treeCheckStrictly?: boolean
  /** Which nodes the value reports: default SHOW_PARENT. */
  treeCheckStrategy?: TreeSelectCheckStrategy
  disabled?: boolean
  /** Controlled dropdown open. */
  open?: boolean
  defaultOpen?: boolean
  /** Expand every branch of the dropdown tree. Default false. */
  defaultExpandAll?: boolean
  /** Controlled expanded keys of the dropdown tree. */
  expandedKeys?: Array<string | number>
  onExpand?: (expandedKeys: Array<string | number>, info: { node: TreeSelectNode; expanded: boolean }) => void
  onOpenChange?: (open: boolean) => void
  onSearch?: (value: string) => void
  onSelect?: (value: string | number, node: TreeSelectNode) => void
  onDeselect?: (value: string | number, node: TreeSelectNode) => void
  onChange?: (
    value: string | number | Array<string | number> | undefined,
    nodes: TreeSelectNode | TreeSelectNode[] | undefined,
  ) => void
  onClear?: () => void
  /** Form integration: rules for the enclosing Item. */
  rules?: FormFieldRule[]
}

export type TreeSelectIns = {
  value: () => Array<string | number>
  /** The selection-store keys — leaf-expanded form (pre-strategy). */
  rawChecked: () => Array<string | number>
  singleValue: () => string | number | undefined
  selectedNodes: () => TreeSelectNode[]
  isMultiple: () => boolean
  /** The checkable gate (multiple mode implies it). */
  isCheckable: () => boolean
  isStrict: () => boolean
  /** The API-shape value after the strategy collapse. */
  changeValue: () => string | number | Array<string | number> | undefined
  changeNodes: () => TreeSelectNode | TreeSelectNode[] | undefined
  // ---- delegated tree ----
  /** The underlying createTree engine (advanced composition). */
  tree: () => TreeIns
  getNode: (value: string | number) => TreeSelectNode | undefined
  labelOf: (value: string | number) => string
  /** Pick a row (single mode): select + commit + close hint. */
  pickNode: (value: string | number) => void
  /** Multiple: checkbox toggle with linkage (or strict toggle). */
  toggleCheck: (value: string | number) => void
  /** Remove one key from the value (tag ×) — expands the key first. */
  removeKey: (value: string | number) => void
  clear: () => void
  isSelected: (value: string | number) => boolean
  /** Search delegated to the tree. */
  searchValue: () => string
  setSearchValue: (text: string) => void
  /** Open state (composed with the UI trigger). */
  isOpen: () => boolean
  setOpen: (open: boolean) => void
  isWidgetDisabled: () => boolean
}

export const createTreeSelect = (config: TreeSelectConfig = {}): TreeSelectIns => {
  const isMultiple = () => config.mode === 'multiple'
  const isCheckable = () => isMultiple() && (config.treeCheckable ?? true)
  const isStrict = () => isMultiple() && (config.treeCheckStrictly ?? false)
  const strategy = () => config.treeCheckStrategy ?? 'SHOW_PARENT'
  let hasControlledValue = untrack(() => config.value !== undefined)

  const toArray = (v: string | number | Array<string | number> | undefined): Array<string | number> | undefined => {
    if (v === undefined) return undefined
    return Array.isArray(v) ? v : [v]
  }

  /**
   * The controlled value mirrored into the tree's checked keys. With a
   * strategy, an incoming value like ['parent'] means EVERY descendant of
   * 'parent' — the raw-checked set is the strategy's EXPANSION.
   */
  const expandStrategy = (keys: Array<string | number>): Array<string | number> => {
    if (!isCheckable() || isStrict()) return keys
    const idx = buildTreeIndex(config.treeData ?? [])
    const out = new Set<string | number>()
    const walk = (value: string | number) => {
      const entry = idx.get(value)
      if (!entry) {
        out.add(value)
        return
      }
      // SHOW_PARENT collapse expands: the stored parent key represents
      // its whole subtree. Keys that are present in the tree keep their
      // own membership too (a child listed alongside its checked parent
      // is already covered, harmless).
      const covered: Array<string | number> = []
      const collect = (n: TreeSelectNode) => {
        if (n.checkable !== false && !n.disabled) covered.push(n.value)
        for (const c of n.children ?? []) collect(c)
      }
      collect(entry.node)
      if (covered.length) for (const k of covered) out.add(k)
      else out.add(value)
    }
    for (const k of keys) walk(k)
    return Array.from(out)
  }

  /** Apply the strategy: which keys represent the checked set upward. */
  const collapseStrategy = (keys: Array<string | number>): Array<string | number> => {
    if (!isCheckable() || isStrict()) return keys
    const idx = buildTreeIndex(config.treeData ?? [])
    const set = new Set(keys)
    if (strategy() === 'SHOW_ALL') return keys
    /**
     * A node is COVERED when it is in the set and every checkable,
     * non-disabled child is covered (a leaf: itself). SHOW_PARENT reports
     * the TOPMOST covered keys — their checked descendants are represented
     * by them and skipped. SHOW_CHILD reports the DEEPEST covered keys
     * (the checked leaves) — the parent is never reported even when full.
     */
    const covered = (n: TreeSelectNode): boolean => {
      if (!set.has(n.value)) return false
      if (!n.children?.length) return true
      return n.children.every(c => c.disabled || c.checkable === false || covered(c))
    }
    const out: Array<string | number> = []
    const visit = (nodes: TreeSelectNode[]) => {
      for (const n of nodes) {
        if (n.disabled || n.checkable === false) continue
        if (strategy() === 'SHOW_PARENT' && covered(n)) {
          out.push(n.value)
          continue // the subtree is represented by this key
        }
        if (n.children?.length) visit(n.children)
        else if (set.has(n.value)) out.push(n.value)
      }
    }
    visit(config.treeData ?? [])
    if (strategy() === 'SHOW_CHILD') {
      // Only leaves survive.
      return out.filter(k => !idx.get(k)?.node.children?.length)
    }
    return out
  }

  const initialChecked = (): Array<string | number> => {
    // Controlled first, then defaultValue.
    const controlled = toArray(config.value as string | number | Array<string | number> | undefined)
    const raw = controlled ?? toArray(config.defaultValue)
    if (raw === undefined) return []
    return expandStrategy(raw)
  }

  /** Single mode's selection seed (row highlight mirrors the value). */
  const initialSingleSel = (): Array<string | number> => {
    const controlled = toArray(config.value as string | number | Array<string | number> | undefined)
    const raw = controlled ?? toArray(config.defaultValue)
    return raw ?? []
  }

  // The strategy-applied raw value, mirrored as the tree's checkedKeys via
  // the controlled prop (one engine for linkage + derivation).
  const [_checked, _setChecked] = createSignal<Array<string | number>>(untrack(initialChecked), { ownedWrite: true })
  const controlledValue = (): Array<string | number> | undefined => {
    const value = config.value
    if (value !== undefined) hasControlledValue = true
    return hasControlledValue ? toArray(value) ?? [] : undefined
  }
  const isValueControlled = () => controlledValue() !== undefined
  const checkedSource = () => {
    const value = controlledValue()
    return value === undefined ? _checked() : expandStrategy(value)
  }

  const [_singleSel, _setSingleSel] = createSignal<Array<string | number>>(
    untrack(initialSingleSel), { ownedWrite: true },
  )
  const selectedSource = () => controlledValue() ?? _singleSel()

  /** Fire onChange with the strategy-collapsed value + nodes. */
  const emitChange = (keys: Array<string | number>) => {
    const collapsed = collapseStrategy(keys)
    const nodes = collapsed.map(k => getNode(k)).filter(Boolean) as TreeSelectNode[]
    if (isMultiple()) {
      if (!isCheckable() && !untrack(isValueControlled)) _setSingleSel(keys)
      config.onChange?.(collapsed, nodes)
    } else {
      // Single mode: the selection signal IS the value mirror.
      if (!untrack(isValueControlled)) _setSingleSel(keys)
      config.onChange?.(collapsed[0], nodes[0])
    }
  }

  const tree = createTree({
    get treeData() { return config.treeData },
    get checkable() { return isCheckable() },
    get checkStrictly() { return isStrict() },
    get selectedKeys() { return selectedSource() },
    get selectable() { return !isCheckable() },
    get multiple() { return isMultiple() && !isCheckable() },
    get disabled() { return config.disabled },
    get defaultExpandAll() { return config.defaultExpandAll },
    get expandedKeys() { return config.expandedKeys },
    get onExpand() { return config.onExpand },
    // The picker's own _checked signal IS the source the tree mirrors.
    // NOTE: pass it as CONTROLLED so createTree never writes its internal
    // signal directly — every write flows through onCheck below where
    // the picker commits BOTH its signal and the change event (otherwise
    // the controlled-mirror effect would bounce the write back and forth).
    get checkedKeys() { return checkedSource() },
    onCheck: (keys, info) => {
      if (!untrack(isValueControlled)) _setChecked(keys)
      emitChange(keys)
      if (info.node && info.checked) {
        config.onSelect?.(info.node.value, info.node)
      } else if (info.node && !info.checked) {
        config.onDeselect?.(info.node.value, info.node)
      }
    },
    onSelect: (keys, info) => {
      if (isMultiple() && isCheckable()) return
      if (isMultiple()) {
        if (info.selected) config.onSelect?.(info.node.value, info.node)
        else config.onDeselect?.(info.node.value, info.node)
        emitChange(keys)
        return
      }
      if (info.selected) {
        config.onSelect?.(info.node.value, info.node)
        emitChange([info.node.value])
      } else {
        emitChange([])
      }
    },
  })

  const getNode = (value: string | number) => tree.getNode(value)
  const labelOf = (value: string | number) => nodeLabel(getNode(value) ?? ({ label: String(value) } as TreeSelectNode))

  /** The raw (strategy-expanded) checked set — what the tree stores. */
  const rawChecked = () => tree.checkedKeys()

  /**
   * The reported value: multiple derives from the checked set through the
   * strategy collapse; SINGLE mode keeps its own selection signal (row
   * highlight ≠ checked — single mode has no checkboxes). Seeded from the
   * controlled/default value so the first read is correct.
   */

  const value = createMemo<Array<string | number>>(() =>
    isCheckable() ? collapseStrategy(rawChecked()) : selectedSource(),
  )

  const singleValue = () => {
    const v = value()
    return v.length ? v[0] : undefined
  }

  const selectedNodes = createMemo<TreeSelectNode[]>(() =>
    value().map(k => getNode(k)).filter(Boolean) as TreeSelectNode[],
  )

  const changeValue = () => {
    const v = value()
    if (!isMultiple()) return v[0]
    return v
  }

  const changeNodes = () => {
    if (!isMultiple()) return selectedNodes()[0]
    return selectedNodes()
  }

  // ---- open ------------------------------------------------------------------

  // ownedWrite: the UI trigger's open effect drives this — an imperative
  // entry point outside any reactive owner.
  const [_open, _setOpen] = createSignal(config.defaultOpen ?? false, { ownedWrite: true })
  const isOpen = () => (config.open !== undefined ? config.open : _open())

  const setOpen = (open: boolean) => {
    if (untrack(() => !!config.disabled)) return
    if (open === untrack(isOpen)) return
    // `config.open` is a UI-layer getter proxy (props.open). Reading its
    // VALUE inside this imperative path outside a tracking scope trips
    // STRICT_READ_UNTRACKED (the Form antd6 lesson) — the presence check
    // below reads it ONCE inside untrack. The same applies to the isOpen()
    // guard: untracked reads are fine here because the effect that CALLS
    // setOpen already tracks `open` on its own.
    const controlled = untrack(() => config.open !== undefined)
    if (controlled) {
      // Controlled: report only.
      config.onOpenChange?.(open)
      if (open) tree.setSearchValue('')
      return
    }
    if (open === untrack(() => _open())) return
    _setOpen(open)
    config.onOpenChange?.(open)
    if (open) {
      // Reset search on open (antd).
      tree.setSearchValue('')
    }
  }

  // ---- search ------------------------------------------------------------------

  const searchValue = () => tree.searchValue()
  const setSearchValue = (text: string) => {
    if (config.disabled) return
    tree.setSearchValue(text)
    config.onSearch?.(text)
  }

  // ---- picking -----------------------------------------------------------------

  const pickNode = (value: string | number) => {
    if (isCheckable()) return
    tree.select(value)
  }

  const toggleCheck = (value: string | number) => {
    if (config.disabled || !isCheckable() || tree.isDisabled(value) || !tree.isCheckableNode(value)) return
    if (isStrict()) {
      // No linkage: the strict toggle writes the single key.
      const cur = new Set(rawChecked())
      if (cur.has(value)) cur.delete(value)
      else cur.add(value)
      const keys = Array.from(cur)
      if (!untrack(isValueControlled)) _setChecked(keys)
      emitChange(keys)
      const node = getNode(value)
      if (node) {
        if (cur.has(value)) config.onSelect?.(value, node)
        else config.onDeselect?.(value, node)
      }
      return
    }
    tree.toggleCheck(value)
  }

  const removeKey = (value: string | number) => {
    if (config.disabled) return
    if (isMultiple() && !isCheckable()) {
      const keys = selectedSource().filter(k => k !== value)
      emitChange(keys)
      const node = getNode(value)
      if (node) config.onDeselect?.(value, node)
      return
    }
    if (isStrict()) {
      const keys = rawChecked().filter(k => k !== value)
      if (!untrack(isValueControlled)) _setChecked(keys)
      emitChange(keys)
      return
    }
    // Linked: uncheck the subtree this key represents (strategy-expanded).
    tree.toggleCheck(value)
    // toggleCheck only acts when the node state is checked/half; a
    // SHOW_PARENT-reported key is checked in raw form, so it works.
  }

  const clear = () => {
    if (config.disabled) return
    if (!untrack(isValueControlled)) {
      _setChecked([])
      _setSingleSel([])
    }
    emitChange([])
    config.onClear?.()
    tree.setSearchValue('')
  }

  const isSelected = (value: string | number) =>
    isMultiple() ? tree.isChecked(value) : value === singleValue()

  return {
    value,
    rawChecked,
    singleValue,
    selectedNodes,
    isMultiple,
    isCheckable,
    isStrict,
    changeValue,
    changeNodes,
    tree: () => tree,
    getNode,
    labelOf,
    pickNode,
    toggleCheck,
    removeKey,
    clear,
    isSelected,
    searchValue,
    setSearchValue,
    isOpen,
    setOpen,
    isWidgetDisabled: () => !!config.disabled,
  }
}

export const treeSplits: (keyof TreeConfig)[] = [
  'treeData', 'expandedKeys', 'defaultExpandedKeys', 'defaultExpandAll',
  'selectedKeys', 'defaultSelectedKeys', 'checkedKeys', 'defaultCheckedKeys',
  'checkable', 'selectable', 'disabled', 'multiple', 'checkStrictly',
]

export const treeSelectSplits: (keyof TreeSelectConfig)[] = [
  'value', 'defaultValue', 'treeData', 'mode', 'treeCheckable',
  'treeCheckStrictly', 'treeCheckStrategy', 'disabled', 'open', 'defaultOpen',
  'defaultExpandAll', 'expandedKeys',
]
