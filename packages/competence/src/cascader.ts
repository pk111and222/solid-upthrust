import { createMemo, createSignal, untrack } from "solid-js";

/**
 * Headless logic for Cascader — the rc-cascader state core.
 *
 * ARCHITECTURE: Cascader is a PATH picker wearing a tree. It composes the
 * same shared machines as the rest of the form family:
 *
 *   createSelection  ← the option store (Radio/Checkbox/Select's engine):
 *                      single mode = one path (a key array), multiple =
 *                      a set of paths. Controlled-mirror semantics.
 *   createTrigger    ← the dropdown layer (owned by the UI, like Select).
 *
 * What THIS file adds — everything tree-shaped:
 *  - TREE MODEL: getNodeByValue / getTrailOptions (the per-level option
 *    arrays along a path) / getLabelPath, with a value→node index.
 *  - ACTIVE TRAIL: which node is highlighted at each level — drives the
 *    multi-column menu (hover/click a row reveals its children column).
 *  - CHANGE-ON-SELECT: antd semantics — false (default) commits only leaf
 *    picks; true commits every intermediate pick too.
 *  - SEARCH: flatten the tree into leaf/any-node paths and filter by label
 *    substring (searchFilterOption); the UI renders a flat path list.
 *  - CHECKABLE (multiple): parent↔children CHECK LINKAGE — checking a
 *    parent checks every descendant; a parent's checked state derives
 *    (all/some/none children checked → checked/indeterminate/unchecked).
 *    Internally only LEAF paths are stored (antd semantics) — parent
 *    checks are derived, never stored.
 */
import { createSelection, type SelectionIns } from "./selection";
import type { FormFieldRule } from "./formField";

export type CascaderOption = {
  value: string | number
  label: string
  disabled?: boolean
  /** Loading placeholder for async children (antd). */
  loading?: boolean
  children?: CascaderOption[]
  [key: string]: unknown
}

export type CascaderMode = 'single' | 'multiple'

export type CascaderConfig = {
  /** Controlled value: a path (single) or an array of paths (multiple). */
  value?: Array<string | number> | Array<Array<string | number>>
  defaultValue?: Array<string | number> | Array<Array<string | number>>
  options?: CascaderOption[]
  mode?: CascaderMode
  disabled?: boolean
  /** Commit on every level click, not just leaves. Default false. */
  changeOnSelect?: boolean
  /** Enable the search box. Default false. */
  showSearch?: boolean
  /** (input, path, nodes) => boolean; false disables client filtering. */
  searchFilterOption?: ((input: string, path: Array<string | number>, nodes: CascaderOption[]) => boolean) | false
  /** Multiple mode with parent↔children linkage. Default false. */
  checkable?: boolean
  /** Fire on every intermediate click (informational; antd onChange). */
  onChange?: (value: Array<string | number> | Array<Array<string | number>> | undefined, nodes: CascaderOption[]) => void
  /** Fires on each level click regardless of changeOnSelect (antd onSelect). */
  onSelect?: (path: Array<string | number>, nodes: CascaderOption[]) => void
  onSearch?: (value: string) => void
  onClear?: () => void
  /** Form integration: rules for the enclosing Item. */
  rules?: FormFieldRule[]
}

export type CascaderIns = {
  /** The selected path(s) — raw key arrays (single: one path). */
  value: () => Array<Array<string | number>>
  /** Single mode: the selected path (or undefined). */
  path: () => Array<string | number> | undefined
  /** The selected node chains (labels live here). */
  selectedNodes: () => CascaderOption[][]
  /** Display text: the joined label path (single). */
  labelText: () => string | undefined
  isMultiple: () => boolean
  isCheckable: () => boolean
  options: () => CascaderOption[]
  /** The value→node index (rebuilt when options change). */
  nodeIndex: () => Map<string | number, { node: CascaderOption; parent?: CascaderOption; trail: Array<string | number> }>
  getNode: (value: string | number) => CascaderOption | undefined
  /** The option arrays along a trail — one per menu column. */
  trailOptions: (trail?: Array<string | number>) => CascaderOption[][]
  /** The label path for a value trail. */
  labelPath: (trail: Array<string | number>) => string[]
  /** Is the trail's final node a leaf (no children)? */
  isLeaf: (trail: Array<string | number>) => boolean
  /** Click/hover a row: extends the active trail (and may commit). */
  activate: (trail: Array<string | number>, event?: 'click' | 'hover') => void
  /** The active trail — drives the menu columns. */
  activeTrail: () => Array<string | number>
  /** Point the active trail directly (UI layer / external control). */
  setActiveTrail: (trail: Array<string | number>) => void
  /** Commit a trail per changeOnSelect (called by activate). */
  commitTrail: (trail: Array<string | number>) => void
  /** Multiple: toggle a trail's check state with full linkage. */
  toggleCheck: (trail: Array<string | number>) => void
  /** Multiple: derived parent state — 'checked' | 'indeterminate' | 'unchecked'. */
  parentState: (trail: Array<string | number>) => 'checked' | 'indeterminate' | 'unchecked'
  /** Search text + flattened matching paths (label match, ancestors kept). */
  searchValue: () => string
  setSearchValue: (text: string) => void
  clearSearch: () => void
  /** [{ path, nodes }] for every node whose path matches the filter. */
  searchMatches: () => Array<{ path: Array<string | number>; nodes: CascaderOption[] }>
  clear: () => void
  isSelected: (trail: Array<string | number>) => boolean
  isDisabled: (value: string | number) => boolean
  isWidgetDisabled: () => boolean
  /** The shared selection store (advanced composition). */
  store: () => SelectionIns
}

/** Join a value trail into the map key: 'a/b/c' (values may contain '/'). */
const trailKey = (trail: Array<string | number>): string =>
  trail.map(v => `${typeof v}:${v}`).join('/')

const defaultSearchFilter = (
  input: string,
  _path: Array<string | number>,
  nodes: CascaderOption[],
): boolean => {
  const q = input.toLowerCase()
  // Match if ANY label along the chain contains the query (antd matches
  // the leaf; matching any node is friendlier and still a subset of antd's
  // render — the matched node's full path is offered).
  return nodes.some(n => n.label.toLowerCase().includes(q))
}

export const createCascader = (config: CascaderConfig = {}): CascaderIns => {
  const isMultiple = () => config.mode === 'multiple'
  const isCheckable = () => isMultiple() && (config.checkable ?? false)

  // ---- tree index ---------------------------------------------------------

  type IndexEntry = { node: CascaderOption; parent?: CascaderOption; trail: Array<string | number> }

  /** Depth-first index of EVERY node: value → { node, parent, trail }. */
  const nodeIndex = createMemo(() => {
    const map = new Map<string | number, IndexEntry>()
    const walk = (nodes: CascaderOption[], parent: CascaderOption | undefined, trail: Array<string | number>) => {
      for (const n of nodes) {
        map.set(n.value, { node: n, parent, trail: [...trail, n.value] })
        if (n.children?.length) walk(n.children, n, [...trail, n.value])
      }
    }
    walk(config.options ?? [], undefined, [])
    return map
  })

  const getNode = (value: string | number): CascaderOption | undefined =>
    nodeIndex().get(value)?.node

  /** The option arrays along a trail — column 0 is the root options, each
   *  next column is the previous pick's children. */
  const trailOptions = (trail?: Array<string | number>): CascaderOption[][] => {
    const columns: CascaderOption[][] = [config.options ?? []]
    const t = trail ?? []
    for (const v of t) {
      const node = nodeIndex().get(v)?.node
      if (!node?.children?.length) break
      columns.push(node.children)
    }
    return columns
  }

  const labelPath = (trail: Array<string | number>): string[] =>
    trail.map(v => nodeIndex().get(v)?.node?.label ?? String(v))

  const isLeaf = (trail: Array<string | number>): boolean => {
    const last = trail[trail.length - 1]
    if (last === undefined) return false
    const node = nodeIndex().get(last)?.node
    return !node?.children?.length
  }

  /** All leaf trails under a trail's node (the node itself when it is a leaf). */
  const leafTrailsOf = (trail: Array<string | number>): Array<Array<string | number>> => {
    const last = trail[trail.length - 1]
    const node = last !== undefined ? nodeIndex().get(last)?.node : undefined
    if (!node) return []
    if (!node.children?.length) return [[...trail]]
    const out: Array<Array<string | number>> = []
    const walk = (nodes: CascaderOption[], prefix: Array<string | number>) => {
      for (const n of nodes) {
        const next = [...prefix, n.value]
        if (n.children?.length) walk(n.children, next)
        else out.push(next)
      }
    }
    walk(node.children, [...trail])
    return out
  }

  // ---- shared selection store (path keys as joined strings) ---------------

  /** Store holds JOINED path keys ('s:a/z:j' style); translate in/out. */
  const toStoreValue = (
    v: Array<string | number> | Array<Array<string | number>> | undefined,
  ): Array<string | number> | undefined => {
    if (v === undefined) return undefined
    if (!Array.isArray(v)) return undefined
    // [] = ZERO paths (not "one empty path"); [ 'a', 'b' ] = one path;
    // [ ['a'], ['b'] ] = two paths. Distinguish by v[0] being an array.
    if (v.length === 0) return []
    const paths = (Array.isArray(v[0]) ? v : [v]) as Array<Array<string | number>>
    return paths.map(trailKey)
  }

  const fromStoreValue = (
    keys: Array<string | number>,
  ): Array<Array<string | number>> =>
    keys.map(k => String(k).split('/').map(seg => {
      const [type, ...rest] = seg.split(':')
      const raw = rest.join(':')
      return type === 'n' ? Number(raw) : raw
    })).filter(path => path.length > 0 && path.every(v => v !== ''))

  const store = createSelection({
    value: () => toStoreValue(config.value as any),
    defaultValue: toStoreValue(config.defaultValue as any),
    // The store's option space is meaningless for paths (dynamic tree);
    // membership is checked through isSelected below, options stay empty.
    options: [],
    get disabled() { return config.disabled },
    maxSelect: isMultiple() ? Infinity : 1,
    allowDeselect: isMultiple(),
    onChange: keys => {
      const paths = fromStoreValue(keys)
      const nodes = paths.map(p => p.map(v => nodeIndex().get(v)?.node).filter(Boolean) as CascaderOption[])
      config.onChange?.(
        (isMultiple() ? paths : paths[0]) as any,
        isMultiple() ? nodes.flat() : nodes[0] ?? [],
      )
    },
  })

  const value = createMemo<Array<Array<string | number>>>(() =>
    fromStoreValue(store.value()),
  )
  const path = createMemo<Array<string | number> | undefined>(() =>
    isMultiple() ? undefined : value()[0],
  )

  const selectedNodes = createMemo<CascaderOption[][]>(() =>
    value().map(p => p.map(v => nodeIndex().get(v)?.node).filter(Boolean) as CascaderOption[]),
  )

  const labelText = createMemo<string | undefined>(() => {
    const p = path()
    if (!p?.length) return undefined
    return labelPath(p).join(' / ')
  })

  const isSelected = (trail: Array<string | number>) =>
    store.isSelected(trailKey(trail))

  // Checkable stores ONLY leaf paths; a parent's membership is derived.
  const isSelectedTrail = (trail: Array<string | number>): boolean => {
    if (!isCheckable()) return isSelected(trail)
    // A trail is "checked" when every leaf under it is stored.
    const leaves = leafTrailsOf(trail)
    if (!leaves.length) return false
    return leaves.every(l => store.isSelected(trailKey(l)))
  }

  // ---- active trail (menu columns) ----------------------------------------

  // ownedWrite: hover/click arrive from DOM events.
  const [_activeTrail, _setActiveTrail] = createSignal<Array<string | number>>([], { ownedWrite: true })

  const activeTrail = () => _activeTrail()

  const activate = (trail: Array<string | number>, event: 'click' | 'hover' = 'click') => {
    const last = trail[trail.length - 1]
    if (last !== undefined && isDisabled(last)) return
    _setActiveTrail(trail)
    if (event === 'hover') return
    // Click: report + maybe commit.
    const nodes = trail.map(v => nodeIndex().get(v)?.node).filter(Boolean) as CascaderOption[]
    config.onSelect?.(trail, nodes)
    if (isCheckable()) return // multiple+checkable commits via checkboxes
    commitTrail(trail)
  }

  const commitTrail = (trail: Array<string | number>) => {
    const last = trail[trail.length - 1]
    if (last !== undefined && isDisabled(last)) return
    if (config.changeOnSelect !== true && !isLeaf(trail)) return
    if (isCheckable()) return
    store.select(trailKey(trail))
  }

  // ---- checkable linkage ---------------------------------------------------

  const toggleCheck = (trail: Array<string | number>) => {
    if (!isCheckable() || config.disabled) return
    const last = trail[trail.length - 1]
    if (last !== undefined && isDisabled(last)) return
    const leaves = leafTrailsOf(trail)
    if (!leaves.length) return
    const allChecked = leaves.every(l => store.isSelected(trailKey(l)))
    const keys = new Set(store.value())
    for (const leaf of leaves) {
      const k = trailKey(leaf)
      if (allChecked) keys.delete(k)
      else keys.add(k)
    }
    // Atomic bulk write: per-key select/deselect loops read a STALE value
    // inside a Solid 2 batch and clobber each other — replaceAll is one
    // emit, one onChange.
    store.replaceAll(Array.from(keys))
  }

  const parentState = (trail: Array<string | number>): 'checked' | 'indeterminate' | 'unchecked' => {
    if (!isCheckable()) return isSelected(trail) ? 'checked' : 'unchecked'
    const leaves = leafTrailsOf(trail)
    if (!leaves.length) return 'unchecked'
    const checkedCount = leaves.filter(l => store.isSelected(trailKey(l))).length
    if (checkedCount === 0) return 'unchecked'
    if (checkedCount === leaves.length) return 'checked'
    return 'indeterminate'
  }

  // ---- search ---------------------------------------------------------------

  const [_search, _setSearch] = createSignal('', { ownedWrite: true })

  const searchValue = () => _search()

  // Eager search recompute state: Solid 2 batching means reading _search()
  // through a memo in the same tick returns the OLD query — matches are
  // recomputed eagerly with the just-written text (the same pattern as
  // Select's resetActiveWith) and mirrored into a signal the memo reads.
  const _searchMatches = createSignal<Array<{ path: Array<string | number>; nodes: CascaderOption[] }>>([], { ownedWrite: true })
  const recomputeSearch = (q: string) => {
    const filter = config.searchFilterOption === false ? null : (config.searchFilterOption ?? defaultSearchFilter)
    const out: Array<{ path: Array<string | number>; nodes: CascaderOption[] }> = []
    if (q) {
      const walk = (nodes: CascaderOption[], trail: Array<string | number>, chain: CascaderOption[]) => {
        for (const n of nodes) {
          const nextTrail = [...trail, n.value]
          const nextChain = [...chain, n]
          if (filter === null || filter(q, nextTrail, nextChain)) {
            out.push({ path: nextTrail, nodes: nextChain })
          }
          if (n.children?.length) walk(n.children, nextTrail, nextChain)
        }
      }
      walk(config.options ?? [], [], [])
    }
    _searchMatches[1](out)
    return out
  }

  const setSearchValue = (text: string) => {
    _setSearch(text)
    config.onSearch?.(text)
    // Batch-safe eager recompute (see recomputeSearch above).
    untrack(() => recomputeSearch(text))
  }

  const clearSearch = () => {
    if (_search() === '') return
    _setSearch('')
    config.onSearch?.('')
    untrack(() => recomputeSearch(''))
  }

  /** The current matches: eager-recomputed on setSearchValue (batch-safe)
   *  and reactive for external option changes. */
  const searchMatches = createMemo(() => _searchMatches[0]())

  // ---- misc ----------------------------------------------------------------

  const isDisabled = (v: string | number): boolean => {
    const entry = nodeIndex().get(v)
    if (!entry) return false
    // A node is disabled when IT or any ANCESTOR is disabled (antd).
    let cur: CascaderOption | undefined = entry.node
    while (cur) {
      if (cur.disabled) return true
      cur = nodeIndex().get(cur.value)?.parent
    }
    return false
  }

  const clear = () => {
    if (config.disabled) return
    store.clear()
    config.onClear?.()
    _setSearch('')
    _setActiveTrail([])
  }

  return {
    value,
    path,
    selectedNodes,
    labelText,
    isMultiple,
    isCheckable,
    options: () => config.options ?? [],
    nodeIndex,
    getNode,
    trailOptions,
    labelPath,
    isLeaf,
    activate,
    activeTrail,
    setActiveTrail: (trail: Array<string | number>) => { _setActiveTrail(trail) },
    commitTrail,
    toggleCheck,
    parentState,
    searchValue,
    setSearchValue,
    clearSearch,
    searchMatches,
    clear,
    isSelected: isSelectedTrail,
    isDisabled,
    isWidgetDisabled: () => !!config.disabled,
    store: () => store,
  }
}

export const cascaderSplits: (keyof CascaderConfig)[] = [
  'value', 'defaultValue', 'options', 'mode', 'disabled', 'changeOnSelect',
  'showSearch', 'searchFilterOption', 'checkable',
]
