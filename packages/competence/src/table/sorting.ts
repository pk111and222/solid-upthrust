import type { TableColumn, TableRow, TableRowModel, TableSortState } from './types'
import { createTableRowModel } from './rows'

export const compareTableValues = (a: unknown, b: unknown): number => {
  if (Object.is(a, b)) return 0
  if (a === null || a === undefined) return 1
  if (b === null || b === undefined) return -1
  if (typeof a === 'number' && typeof b === 'number') return (Number.isNaN(a) ? Infinity : a) - (Number.isNaN(b) ? Infinity : b)
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  return String(a).localeCompare(String(b), undefined, { numeric: true })
}
export function sortTableRows<T>(model: TableRowModel<T>, columns: readonly TableColumn<T>[], sorters: readonly TableSortState[], manual = false) {
  if (manual || !sorters.length) return model
  const byId = new Map(columns.map(c => [c.id, c]))
  const active = sorters.flatMap(sort => {
    const column = byId.get(sort.columnKey), sorter = column?.definition.sorter
    if (!column || !sorter || sorter === true) return []
    return [{ sort, column, sorter }]
  }).sort((a, b) => (typeof b.sorter === 'object' ? b.sorter.multiple ?? 0 : 0) - (typeof a.sorter === 'object' ? a.sorter.multiple ?? 0 : 0))
  if (!active.length) return model
  const compare = (a: TableRow<T>, b: TableRow<T>) => {
    for (const { sort, column, sorter } of active) {
      const compareFn = typeof sorter === 'function' ? sorter : typeof sorter === 'object' ? sorter.compare : undefined
      const value = compareFn && a.original !== undefined && b.original !== undefined
        ? compareFn(a.original, b.original, sort.order)
        : sorter === 'auto' || a.grouping || b.grouping ? compareTableValues(a.getValue(column.id), b.getValue(column.id)) : 0
      if (value && !Number.isNaN(value)) return sort.order === 'descend' ? -value : value
    }
    return 0 // ECMAScript stable sort preserves sibling order for ties.
  }
  const visit = (rows: readonly TableRow<T>[]): TableRow<T>[] => [...rows].sort(compare).map(row => row.subRows.length ? { ...row, subRows: visit(row.subRows) } : row)
  return createTableRowModel(visit(model.rows))
}
