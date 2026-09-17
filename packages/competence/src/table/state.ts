import { createMemo, createSignal, untrack } from 'solid-js'
import type { TableAction, TableColumn, TableConfig, TableKey, TableState } from './types'
import { positiveInteger } from './utils'

export function createTableState<T>(config: TableConfig<T>, columns: () => readonly TableColumn<T>[], expandedDefaults: readonly TableKey[]) {
  const defaults = untrack((): TableState => {
    const pagination = config.pagination || {}
    const filters = Object.fromEntries(columns().filter(c => c.definition.defaultFilteredValue !== undefined).map(c => [c.id, c.definition.defaultFilteredValue!]))
    const sorters = columns().flatMap(c => c.definition.defaultSortOrder ? [{ columnKey: c.id, order: c.definition.defaultSortOrder }] : [])
    return {
      pagination: { current: positiveInteger(pagination.defaultCurrent, 1), pageSize: positiveInteger(pagination.defaultPageSize, 10) },
      sorters, filters, globalFilter: '',
      selectedRowKeys: config.rowSelection?.defaultSelectedRowKeys ?? [],
      expandedRowKeys: config.expandable?.defaultExpandAllRows ? expandedDefaults : config.expandable?.defaultExpandedRowKeys ?? [],
      columnVisibility: {}, columnOrder: [], columnSizing: {},
      columnPinning: {
        start: columns().filter(c => [true, 'start', 'left'].includes(c.definition.fixed ?? false)).map(c => c.id),
        end: columns().filter(c => ['end', 'right'].includes(String(c.definition.fixed))).map(c => c.id),
      },
      grouping: [], ...config.initialState,
    }
  })
  // An imperative snapshot composes multiple updates in the same Solid batch.
  // Reactive consumers subscribe to revision instead of stale signal snapshots.
  let internal = defaults
  const [revision, setRevision] = createSignal(0, { ownedWrite: true })
  const controlledFilters = createMemo(() => Object.fromEntries(columns().filter(c => c.definition.filteredValue !== undefined).map(c => [c.id, c.definition.filteredValue!])))
  const controlledSorters = createMemo(() => columns().some(c => c.definition.sortOrder !== undefined)
    ? columns().flatMap(c => c.definition.sortOrder ? [{ columnKey: c.id, order: c.definition.sortOrder }] : []) : undefined)
  const resolve = (): TableState => {
    const state = config.state ?? {}
    const pagination = config.pagination || {}
    const rawPage = state.pagination ?? internal.pagination
    const filters = Object.keys(controlledFilters()).length ? { ...internal.filters, ...controlledFilters() } : internal.filters
    return {
      ...internal, ...state,
      filters: state.filters ?? filters,
      sorters: state.sorters ?? controlledSorters() ?? internal.sorters,
      pagination: state.pagination ?? {
        current: positiveInteger(pagination.current ?? rawPage.current, 1),
        pageSize: positiveInteger(pagination.pageSize ?? rawPage.pageSize, 10),
      },
      selectedRowKeys: state.selectedRowKeys ?? config.rowSelection?.selectedRowKeys ?? internal.selectedRowKeys,
      expandedRowKeys: state.expandedRowKeys ?? config.expandable?.expandedRowKeys ?? internal.expandedRowKeys,
    }
  }
  const state = createMemo(() => { revision(); return resolve() })
  const read = () => untrack(resolve)
  const update = (updater: Partial<TableState> | ((previous: TableState) => Partial<TableState>), action: TableAction = 'state'): TableState => untrack(() => {
    const previous = read()
    const patch = typeof updater === 'function' ? updater(previous) : updater
    const proposed = { ...previous, ...patch }
    const owned = { ...internal, ...patch }
    // Controlled state is a proposal, never an optimistic visual commit.
    for (const key of Object.keys(config.state ?? {}) as (keyof TableState)[]) {
      if (config.state?.[key] !== undefined) Object.assign(owned, { [key]: internal[key] })
    }
    if (config.state?.pagination === undefined) {
      const pagination = config.pagination || {}
      owned.pagination = {
        current: pagination.current === undefined ? proposed.pagination.current : internal.pagination.current,
        pageSize: pagination.pageSize === undefined ? proposed.pagination.pageSize : internal.pagination.pageSize,
      }
    }
    if (config.rowSelection?.selectedRowKeys !== undefined) owned.selectedRowKeys = internal.selectedRowKeys
    if (config.expandable?.expandedRowKeys !== undefined) owned.expandedRowKeys = internal.expandedRowKeys
    if (controlledSorters() !== undefined) owned.sorters = internal.sorters
    if (Object.keys(controlledFilters()).length) {
      const ownFilters = { ...owned.filters }
      for (const key of Object.keys(controlledFilters())) {
        if (key in internal.filters) ownFilters[key] = internal.filters[key]
        else delete ownFilters[key]
      }
      owned.filters = ownFilters
    }
    internal = owned
    setRevision(n => n + 1)
    config.onStateChange?.(proposed, { action })
    return proposed
  })
  const slice = <K extends keyof TableState>(key: K) => {
    let previous: TableState[K] | undefined
    return createMemo(() => {
      const next = state()[key]
      if (previous && typeof previous === 'object' && typeof next === 'object') {
        const before = Object.entries(previous), after = Object.entries(next)
        if (before.length === after.length && before.every(([name, value]) => Object.is(value, (next as unknown as Record<string, unknown>)[name]))) return previous
      }
      previous = next
      return next
    })
  }
  return { state, read, update, initialState: defaults, slice, reset: () => update(defaults, 'reset') }
}
export type TableStateController<T> = ReturnType<typeof createTableState<T>>
