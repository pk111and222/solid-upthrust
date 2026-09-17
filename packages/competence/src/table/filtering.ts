import type { TableColumn, TableConfig, TableFiltersState, TableRow, TableRowModel } from './types'
import { createTableRowModel } from './rows'

export function filterTableRows<T>(model: TableRowModel<T>, columns: readonly TableColumn<T>[], filters: TableFiltersState, globalFilter: string, config: TableConfig<T>) {
  if (config.manualFiltering) return model
  const active = columns.filter(c => (filters[c.id]?.length ?? 0) > 0 && c.definition.onFilter)
  const query = globalFilter.trim().toLowerCase()
  if (!active.length && !query) return model
  const matches = (row: TableRow<T>) => {
    if (row.original === undefined) return true
    if (!active.every(c => filters[c.id]!.some(value => c.definition.onFilter!(value, row.original!)))) return false
    return !query || (config.globalFilterFn ? config.globalFilterFn(globalFilter, row.original, row)
      : columns.some(c => c.definition.enableGlobalFilter !== false && String(row.getValue(c.id) ?? '').toLowerCase().includes(query)))
  }
  const visit = (rows: readonly TableRow<T>[]): TableRow<T>[] => rows.flatMap(row => {
    const match = matches(row)
    if (!match && !config.filterFromLeafRows) return []
    const subRows = visit(row.subRows)
    return match || subRows.length ? [{ ...row, subRows }] : []
  })
  return createTableRowModel(visit(model.rows))
}
/** Faceting applies every other filter, but excludes the column's own filter. */
export function getTableFacetedValues<T>(model: TableRowModel<T>, columns: readonly TableColumn<T>[], filters: TableFiltersState, globalFilter: string, config: TableConfig<T>, columnId: string) {
  const otherFilters = { ...filters, [columnId]: null }
  const rows = filterTableRows(model, columns, otherFilters, globalFilter, config).flatRows
  const values = new Map<unknown, number>()
  rows.forEach(row => { const value = row.getValue(columnId); values.set(value, (values.get(value) ?? 0) + 1) })
  return values
}
