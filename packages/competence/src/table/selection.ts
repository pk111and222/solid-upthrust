import { createEffect, createMemo, untrack } from 'solid-js'
import type { TableConfig, TableKey, TableRow, TableRowModel, TableSelectionAction } from './types'
import type { TableStateController } from './state'

export function createTableSelection<T>(config: TableConfig<T>, store: TableStateController<T>, core: () => TableRowModel<T>, filtered: () => TableRowModel<T>, page: () => TableRowModel<T>) {
  const selectedSlice = store.slice('selectedRowKeys')
  const cache = new Map<TableKey, T>()
  const disabled = (row: TableRow<T>) => row.original === undefined || !!config.rowSelection?.getCheckboxProps?.(row.original)?.disabled
  // Only selected records are retained across server-side page changes.
  createEffect(() => ({ model: core(), keys: selectedSlice(), preserve: config.rowSelection?.preserveSelectedRowKeys }), ({ model, keys, preserve }) => {
    if (!preserve) cache.clear()
    const keep = new Set(keys)
    for (const key of cache.keys()) if (!keep.has(key)) cache.delete(key)
    for (const key of keys) { const record = model.rowsByKey.get(key)?.original; if (record !== undefined) cache.set(key, record) }
  })
  const children = (row: TableRow<T>): TableRow<T>[] => {
    if (disabled(row)) return []
    return [row, ...row.subRows.flatMap(children)]
  }
  const normalize = (keys: readonly TableKey[], expand: boolean): TableKey[] => {
    let result = keys.filter(key => config.rowSelection?.preserveSelectedRowKeys || core().rowsByKey.has(key))
    if (config.rowSelection?.type === 'radio') return result.slice(0, 1)
    if (config.rowSelection?.checkStrictly !== false) return [...new Set(result)]
    const next = new Set(result)
    if (expand) result.forEach(key => { const row = core().rowsByKey.get(key); if (row) children(row).forEach(child => next.add(child.key)) })
    for (const row of [...core().flatRows].reverse()) {
      if (disabled(row)) continue
      const descendants = children(row).slice(1)
      if (!descendants.length) continue
      if (descendants.every(child => next.has(child.key))) next.add(row.key)
      else next.delete(row.key)
    }
    return [...next]
  }
  const selectedKeys = createMemo(() => normalize(selectedSlice(), true))
  const recordsFor = (keys: readonly TableKey[]) => keys.flatMap(key => {
    const record = core().rowsByKey.get(key)?.original ?? cache.get(key)
    return record === undefined ? [] : [record]
  })
  const getSelectedRecords = () => recordsFor(selectedKeys())
  const getCheckState = (key: TableKey): 'checked' | 'mixed' | 'unchecked' => {
    if (selectedKeys().includes(key)) return 'checked'
    const row = core().rowsByKey.get(key)
    return config.rowSelection?.checkStrictly === false && row && children(row).slice(1).some(child => selectedKeys().includes(child.key)) ? 'mixed' : 'unchecked'
  }
  const emit = (keys: readonly TableKey[], type: TableSelectionAction) => {
    const next = normalize(keys, false)
    // Capture the current page before onChange switches dataSource.
    next.forEach(key => { const record = core().rowsByKey.get(key)?.original; if (record !== undefined) cache.set(key, record) })
    const records = recordsFor(next)
    store.update({ selectedRowKeys: next }, 'select')
    config.rowSelection?.onChange?.(next, records, { type })
    return { keys: next, records }
  }
  const scopeRows = (scope: 'page' | 'filtered' | 'all') => (scope === 'page' ? page() : scope === 'filtered' ? filtered() : core()).flatRows.filter(row => !disabled(row))
  const toggleRow = (key: TableKey, checked?: boolean) => untrack(() => {
    if (!config.rowSelection) return
    const row = core().rowsByKey.get(key)
    if (!row || disabled(row)) return
    const keys = new Set(normalize(store.read().selectedRowKeys, true))
    const nextChecked = checked ?? !keys.has(key)
    if (config.rowSelection.type === 'radio') {
      if (!nextChecked) return
      const result = emit([key], 'single'); config.rowSelection.onSelect?.(row.original!, true, result.records); return
    }
    for (const child of config.rowSelection.checkStrictly === false ? children(row) : [row]) {
      if (nextChecked) keys.add(child.key); else keys.delete(child.key)
    }
    const result = emit([...keys], 'single')
    config.rowSelection.onSelect?.(row.original!, nextChecked, result.records)
  })
  const selectAll = (checked = true, scope: 'page' | 'filtered' | 'all' = 'page') => untrack(() => {
    if (!config.rowSelection || config.rowSelection.type === 'radio') return
    const keys = new Set(normalize(store.read().selectedRowKeys, true))
    for (const row of scopeRows(scope)) for (const child of config.rowSelection.checkStrictly === false ? children(row) : [row]) {
      if (checked) keys.add(child.key); else keys.delete(child.key)
    }
    emit([...keys], 'all')
  })
  const invertSelection = (scope: 'page' | 'filtered' | 'all' = 'page') => untrack(() => {
    if (!config.rowSelection || config.rowSelection.type === 'radio') return
    const keys = new Set(normalize(store.read().selectedRowKeys, true))
    // In linked mode, toggle leaves then derive parents, avoiding a double toggle.
    const rows = scopeRows(scope).filter(row => config.rowSelection?.checkStrictly !== false || children(row).length === 1)
    rows.forEach(row => keys.has(row.key) ? keys.delete(row.key) : keys.add(row.key))
    emit([...keys], 'invert')
  })
  const clearSelection = () => untrack(() => {
    if (!config.rowSelection) return
    const keys = store.read().selectedRowKeys.filter(key => { const row = core().rowsByKey.get(key); return row && disabled(row) })
    emit(keys, 'none')
  })
  const selectRange = (from: TableKey, to: TableKey, checked = true) => untrack(() => {
    if (!config.rowSelection || config.rowSelection.type === 'radio') return
    const rows = page().rows, start = rows.findIndex(row => row.key === from), end = rows.findIndex(row => row.key === to)
    if (start < 0 || end < 0) return
    const keys = new Set(normalize(store.read().selectedRowKeys, true))
    rows.slice(Math.min(start, end), Math.max(start, end) + 1).filter(row => !disabled(row)).forEach(row => {
      for (const item of config.rowSelection?.checkStrictly === false ? children(row) : [row]) {
        if (checked) keys.add(item.key); else keys.delete(item.key)
      }
    })
    emit([...keys], 'multiple')
  })
  const getSelectAllState = (scope: 'page' | 'filtered' | 'all' = 'page') => {
    const rows = scopeRows(scope), count = rows.filter(row => selectedKeys().includes(row.key)).length
    return { checked: rows.length > 0 && count === rows.length, indeterminate: count > 0 && count < rows.length,
      disabled: !config.rowSelection || !rows.length || config.rowSelection.type === 'radio' }
  }
  return { selectedKeys, getSelectedRecords, getCheckState, getSelectAllState, toggleRow, selectAll, invertSelection, clearSelection, selectRange,
    isRowDisabled: (key: TableKey) => { const row = core().rowsByKey.get(key); return !row || disabled(row) } }
}
