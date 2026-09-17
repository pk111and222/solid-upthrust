import { createMemo, createSignal, untrack } from 'solid-js'
import type { TableAction, TableColumn, TableConfig, TableFilterValue, TableKey, TablePaginationState, TableRowModel, TableSortOrder, TableSortState, TableState, TableUpdater } from './types'
import { buildTableColumns, buildTableColumnLayout, buildTableHeaders, getTableColumnWidth, getTableVisibleColumns } from './columns'
import { buildTableCoreRows, createFlatTableRowModel, createTableRowModel, expandTableRows } from './rows'
import { filterTableRows, getTableFacetedValues } from './filtering'
import { sortTableRows } from './sorting'
import { groupTableRows, aggregateTableValues } from './grouping'
import { createTableState } from './state'
import { createTableSelection } from './selection'
import { createTableEditing } from './editing'
import { createTableVirtualizer } from './virtual'
import { buildTableCells } from './cells'
import { clamp, positiveInteger, resolveTableUpdater, unique } from './utils'

export function createTable<T>(config: TableConfig<T>) {
  const columnModel = createMemo(() => buildTableColumns(config.columns, config.column))
  const columns = () => columnModel().leaves
  const core = createMemo(() => buildTableCoreRows(config, columns()))
  const expandedDefaults = untrack(() => groupTableRows(core(), columns(), config.state?.grouping ?? config.initialState?.grouping ?? []).flatRows.filter(row => row.subRows.length || (row.original !== undefined && config.expandable?.rowExpandable?.(row.original))).map(row => row.key))
  const store = createTableState(config, columns, expandedDefaults)
  const filters = store.slice('filters'), sorters = store.slice('sorters'), globalFilter = store.slice('globalFilter')
  const grouping = store.slice('grouping'), expandedKeys = store.slice('expandedRowKeys'), pagination = store.slice('pagination')
  const visibility = store.slice('columnVisibility'), order = store.slice('columnOrder'), sizing = store.slice('columnSizing'), pinning = store.slice('columnPinning')
  const columnState = () => ({ columnVisibility: visibility(), columnOrder: order(), columnSizing: sizing(), columnPinning: pinning() })
  const visibleColumns = createMemo(() => getTableVisibleColumns(columnModel(), columnState(), config))
  const layout = createMemo(() => buildTableColumnLayout(visibleColumns(), columnState()))
  const headers = createMemo(() => buildTableHeaders(columnModel(), layout()))

  const applyFeatures = (stage: 'filtered' | 'grouped' | 'sorted', model: TableRowModel<T>, state: () => TableState) => {
    const names = new Set<string>()
    for (const feature of config.features ?? []) {
      if (names.has(feature.name)) throw new Error(`Duplicate Table feature: ${feature.name}`)
      names.add(feature.name)
      if (feature.stage === stage) model = createTableRowModel(feature.transform(model, { state: state(), columns: columns() }))
    }
    return model
  }
  const filtered = createMemo(() => applyFeatures('filtered', filterTableRows(core(), columns(), filters(), globalFilter(), config), store.state))
  const grouped = createMemo(() => applyFeatures('grouped', groupTableRows(filtered(), columns(), grouping()), store.state))
  const sorted = createMemo(() => applyFeatures('sorted', sortTableRows(grouped(), columns(), sorters(), config.manualSorting), store.state))
  const expanded = createMemo(() => createFlatTableRowModel(expandTableRows(sorted().rows, new Set(expandedKeys()))))
  const total = createMemo(() => config.manualPagination
    ? (config.pagination && config.pagination.total !== undefined ? Math.max(0, config.pagination.total) : undefined)
    : config.paginateExpandedRows ? expanded().rows.length : sorted().rows.length)
  const getPageCount = () => total() === undefined ? -1 : Math.max(1, Math.ceil(total()! / positiveInteger(pagination().pageSize, 10)))
  const getPagination = (): TablePaginationState & { total?: number } => ({
    current: getPageCount() < 0 ? positiveInteger(pagination().current, 1) : clamp(positiveInteger(pagination().current, 1), 1, getPageCount()),
    pageSize: positiveInteger(pagination().pageSize, 10), total: total(),
  })
  const paginated = createMemo(() => {
    if (config.pagination === false || config.manualPagination) return expanded()
    const { current, pageSize } = getPagination(), start = (current - 1) * pageSize
    return createFlatTableRowModel(config.paginateExpandedRows ? expanded().rows.slice(start, start + pageSize)
      : expandTableRows(sorted().rows.slice(start, start + pageSize), new Set(expandedKeys())))
  })
  const cells = createMemo(() => {
    const regions = new Map(layout().map(item => [item.column.id, item.region]))
    return buildTableCells(paginated().rows, visibleColumns(), id => regions.get(id) ?? 'center')
  })
  const selection = createTableSelection(config, store, core, filtered, paginated)
  const editing = createTableEditing(config, core, columns)
  const virtual = createTableVirtualizer(() => paginated().rows, cells, config)
  const getRow = (key: TableKey) => core().rowsByKey.get(key) ?? grouped().rowsByKey.get(key)
  const getColumn = (id: string) => columnModel().byId.get(id)

  /** Build proposed output for onChange even when controlled state is rejected. */
  const proposedRows = (state: TableState) => {
    const filteredModel = applyFeatures('filtered', filterTableRows(core(), columns(), state.filters, state.globalFilter, config), () => state)
    const groupedModel = applyFeatures('grouped', groupTableRows(filteredModel, columns(), state.grouping), () => state)
    return applyFeatures('sorted', sortTableRows(groupedModel, columns(), state.sorters, config.manualSorting), () => state)
  }
  const notifyChange = (state: TableState, action: 'paginate' | 'filter' | 'sort') => {
    if (!config.onChange) return
    const model = proposedRows(state)
    const data = model.flatRows.flatMap(row => row.original === undefined ? [] : [row.original])
    config.onChange({ ...state.pagination, total: config.manualPagination ? config.pagination && config.pagination.total !== undefined ? config.pagination.total : undefined : config.paginateExpandedRows ? expandTableRows(model.rows, new Set(state.expandedRowKeys)).length : model.rows.length },
      state.filters, state.sorters.length > 1 ? state.sorters : state.sorters[0] ?? null, { action, currentDataSource: data })
  }
  const change = (patch: Partial<TableState>, action: TableAction) => {
    const next = store.update(patch, action)
    if (action === 'paginate' || action === 'sort' || action === 'filter') notifyChange(next, action)
    return next
  }
  const resetPage = (): Partial<TableState> => config.autoResetPageIndex === false ? {} : { pagination: { ...store.read().pagination, current: 1 } }
  const setSorters = (updater: TableUpdater<readonly TableSortState[]>) => untrack(() => {
    const next = resolveTableUpdater(updater, store.read().sorters)
    const seen = new Set<string>()
    const valid = next.filter(sort => {
      if (!getColumn(sort.columnKey)?.definition.sorter || seen.has(sort.columnKey)) return false
      seen.add(sort.columnKey); return sort.order === 'ascend' || sort.order === 'descend'
    })
    change({ sorters: valid, ...resetPage() }, 'sort')
  })
  const toggleSorting = (id: string, multiple?: boolean) => untrack(() => {
    const column = getColumn(id)
    if (!column?.definition.sorter) return
    const old = store.read().sorters, active = old.find(s => s.columnKey === id)
    const directions = column.definition.sortDirections ?? config.sortDirections ?? ['ascend', 'descend', null]
    if (!directions.length) return
    const next = directions[(active ? directions.indexOf(active.order) + 1 : 0) % directions.length]
    const sorter = column.definition.sorter
    const multi = multiple ?? (typeof sorter === 'object' && sorter.multiple !== undefined)
    const rest = multi ? old.filter(s => s.columnKey !== id) : []
    setSorters(next ? [...rest, { columnKey: id, order: next }] : rest)
  })
  const setColumnFilter = (id: string, values: readonly TableFilterValue[] | null) => untrack(() => {
    const column = getColumn(id)
    if (!column) return
    const filtered = values === null ? null : column.definition.filterMultiple === false ? unique(values).slice(0, 1) : unique(values)
    change({ filters: { ...store.read().filters, [id]: filtered }, ...resetPage() }, 'filter')
  })
  const resetColumnFilter = (id: string) => untrack(() => {
    const def = getColumn(id)?.definition
    setColumnFilter(id, def?.filterResetToDefaultFilteredValue ? def.defaultFilteredValue ?? null : null)
  })
  const setFilters = (updater: TableUpdater<TableState['filters']>) => untrack(() => change({ filters: resolveTableUpdater(updater, store.read().filters), ...resetPage() }, 'filter'))
  const setGlobalFilter = (value: string) => untrack(() => change({ globalFilter: value, ...resetPage() }, 'filter'))
  const setPagination = (updater: TableUpdater<TablePaginationState>) => untrack(() => {
    const request = resolveTableUpdater(updater, store.read().pagination)
    const pageSize = positiveInteger(request.pageSize, positiveInteger(store.read().pagination.pageSize, 10))
    const count = total() === undefined ? Infinity : Math.max(1, Math.ceil(total()! / pageSize))
    const current = clamp(positiveInteger(request.current, 1), 1, count)
    change({ pagination: { current, pageSize } }, 'paginate')
    if (config.pagination) config.pagination.onChange?.(current, pageSize)
  })
  const setPageSize = (size: number) => setPagination({ current: 1, pageSize: size })
  const canNextPage = () => config.pagination !== false && (getPageCount() < 0 ? paginated().rows.length >= getPagination().pageSize : getPagination().current < getPageCount())
  const canPreviousPage = () => config.pagination !== false && getPagination().current > 1
  const nextPage = () => untrack(() => { if (canNextPage()) setPagination({ ...store.read().pagination, current: getPagination().current + 1 }) })
  const previousPage = () => untrack(() => { if (canPreviousPage()) setPagination({ ...store.read().pagination, current: getPagination().current - 1 }) })
  const canExpand = (key: TableKey) => {
    const row = getRow(key)
    return !!row && (!!row.subRows.length || (row.original !== undefined && !!config.expandable?.rowExpandable?.(row.original)))
  }
  const setExpandedRowKeys = (updater: TableUpdater<readonly TableKey[]>) => untrack(() => {
    const keys = unique(resolveTableUpdater(updater, store.read().expandedRowKeys)).filter(canExpand)
    store.update({ expandedRowKeys: keys }, 'expand'); config.expandable?.onExpandedRowsChange?.(keys)
  })
  const toggleExpanded = (key: TableKey, value?: boolean) => untrack(() => {
    if (!canExpand(key)) return
    const keys = store.read().expandedRowKeys, expanded = value ?? !keys.includes(key)
    setExpandedRowKeys(expanded ? [...keys, key] : keys.filter(k => k !== key))
    const row = getRow(key)
    if (row?.original !== undefined) config.expandable?.onExpand?.(expanded, row.original)
  })
  const toggleAllExpanded = (value: boolean) => setExpandedRowKeys(value ? sorted().flatRows.filter(row => canExpand(row.key)).map(row => row.key) : [])
  const setGrouping = (updater: TableUpdater<readonly string[]>) => untrack(() => change({ grouping: unique(resolveTableUpdater(updater, store.read().grouping)).filter(id => !!getColumn(id)), ...resetPage() }, 'group'))
  const setColumnVisibility = (id: string, visible: boolean) => untrack(() => {
    if (getColumn(id)) store.update({ columnVisibility: { ...store.read().columnVisibility, [id]: visible } }, 'columns')
  })
  const setColumnOrder = (ids: readonly string[]) => untrack(() => store.update({ columnOrder: unique(ids).filter(id => !!getColumn(id)) }, 'columns'))
  const pinColumn = (id: string, region: 'start' | 'end' | false) => untrack(() => {
    const column = getColumn(id)
    if (!column || column.children.length) return
    const pinned = store.read().columnPinning
    const next = { start: pinned.start.filter(key => key !== id), end: pinned.end.filter(key => key !== id) }
    if (region) next[region].push(id)
    store.update({ columnPinning: next }, 'columns')
  })
  const setColumnWidth = (id: string, width: number) => untrack(() => {
    const column = getColumn(id)
    if (!column || column.children.length || column.definition.resizable === false || !Number.isFinite(width)) return
    const state = store.read(), sized = { ...state, columnSizing: { ...state.columnSizing, [id]: width } }
    store.update({ columnSizing: { ...state.columnSizing, [id]: getTableColumnWidth(column, sized) } }, 'columns')
  })
  const [resizing, setResizing] = createSignal<{ columnId: string; start: number; width: number; delta: number } | undefined>(undefined, { ownedWrite: true })
  let resizeSession: { columnId: string; start: number; width: number; delta: number } | undefined
  const beginColumnResize = (id: string, clientX: number) => untrack(() => {
    const column = getColumn(id)
    if (!column || column.children.length || column.definition.resizable === false || !Number.isFinite(clientX)) return false
    resizeSession = { columnId: id, start: clientX, width: getTableColumnWidth(column, store.read()), delta: 0 }; setResizing(resizeSession); return true
  })
  const updateColumnResize = (clientX: number, direction: 'ltr' | 'rtl' = 'ltr') => {
    if (!resizeSession || !Number.isFinite(clientX)) return
    resizeSession = { ...resizeSession, delta: (clientX - resizeSession.start) * (direction === 'rtl' ? -1 : 1) }; setResizing(resizeSession)
  }
  const endColumnResize = (commit = true) => {
    if (resizeSession && commit) setColumnWidth(resizeSession.columnId, resizeSession.width + resizeSession.delta)
    resizeSession = undefined; setResizing(undefined)
  }
  const getSummary = (scope: 'page' | 'filtered' | 'all' = 'page') => {
    const model = scope === 'page' ? paginated() : scope === 'filtered' ? filtered() : core()
    const rows = model.flatRows.filter(row => row.original !== undefined && !row.subRows.length)
    return Object.fromEntries(columns().filter(c => c.definition.aggregation).map(c => [c.id, aggregateTableValues(rows.map(row => row.getValue(c.id)), c.definition.aggregation!)]))
  }
  const getCellContext = (key: TableKey, columnId: string) => {
    const row = getRow(key), column = getColumn(columnId)
    return row && column ? { row, column, getValue: () => row.getValue(columnId) } : undefined
  }
  return {
    getState: store.state, setState: store.update, reset: store.reset, initialState: store.initialState,
    getAllColumns: () => columnModel().roots, getLeafColumns: columns, getColumn, getVisibleColumns: visibleColumns,
    getColumnLayout: layout, getHeaderGroups: headers, getTotalWidth: () => layout().reduce((sum, item) => sum + item.width, 0),
    getCoreRowModel: core, getFilteredRowModel: filtered, getGroupedRowModel: grouped, getSortedRowModel: sorted,
    getExpandedRowModel: expanded, getRowModel: paginated, getRow, getCellContext, getCellRows: cells, getSummary,
    setSorters, toggleSorting, setColumnFilter, resetColumnFilter, setFilters, setGlobalFilter,
    getFacetedValues: (id: string) => getTableFacetedValues(core(), columns(), filters(), globalFilter(), config, id),
    getPagination, getPageCount, canNextPage, canPreviousPage, setPagination, setPageSize, nextPage, previousPage,
    canExpand, isExpanded: (key: TableKey) => expandedKeys().includes(key), toggleExpanded, setExpandedRowKeys, toggleAllExpanded,
    setGrouping, setColumnVisibility, setColumnOrder, pinColumn, setColumnWidth,
    resizing, beginColumnResize, updateColumnResize, endColumnResize,
    selection, editing, virtual,
  }
}
export type TableIns<T> = ReturnType<typeof createTable<T>>
