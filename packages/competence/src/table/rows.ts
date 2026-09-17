import type { TableColumn, TableConfig, TableRow, TableRowModel } from './types'
import { readPath, tableRowId } from './utils'

export const createTableRowModel = <T>(rows: readonly TableRow<T>[]): TableRowModel<T> => {
  const flatRows: TableRow<T>[] = [], rowsById = new Map<string, TableRow<T>>(), rowsByKey = new Map<string | number, TableRow<T>>()
  const visit = (list: readonly TableRow<T>[]) => list.forEach(row => {
    if (rowsById.has(row.id)) throw new Error(`Duplicate table row ID: ${row.id}`)
    if (rowsByKey.has(row.key)) throw new Error(`Duplicate table row key: ${String(row.key)}`)
    flatRows.push(row); rowsById.set(row.id, row); rowsByKey.set(row.key, row)
    visit(row.subRows)
  })
  visit(rows)
  return { rows, flatRows, rowsById, rowsByKey }
}
/** For expanded/page models whose rows are already a flat display sequence. */
export const createFlatTableRowModel = <T>(rows: readonly TableRow<T>[]): TableRowModel<T> => ({
  rows, flatRows: rows, rowsById: new Map(rows.map(row => [row.id, row])), rowsByKey: new Map(rows.map(row => [row.key, row])),
})
export function buildTableCoreRows<T>(config: TableConfig<T>, columns: readonly TableColumn<T>[]) {
  const seen = new Set<string>(), ancestors = new Set<unknown>()
  const columnMap = new Map(columns.map(c => [c.id, c]))
  const visit = (data: readonly T[], depth: number, parentId?: string): TableRow<T>[] => data.map((record, index) => {
    if (ancestors.has(record)) throw new Error('Cyclic Table children are not supported')
    const key = typeof config.rowKey === 'function' ? config.rowKey(record, index) : readPath(record, [config.rowKey ?? 'key'])
    if ((typeof key !== 'string' && typeof key !== 'number') || (typeof key === 'number' && !Number.isFinite(key))) throw new Error('Every Table row requires a stable string/number key; supply rowKey')
    const id = tableRowId(key)
    if (seen.has(id)) throw new Error(`Duplicate Table row key: ${String(key)}`)
    seen.add(id); ancestors.add(record)
    const values = new Map<string, unknown>()
    const row: TableRow<T> = {
      id, key, original: record, index, depth, parentId, subRows: [],
      getValue: columnId => {
        if (!values.has(columnId)) values.set(columnId, columnMap.get(columnId)?.getValue(record, index))
        return values.get(columnId)
      },
    }
    const children = config.getSubRows ? config.getSubRows(record, index) : readPath(record, [config.expandable?.childrenColumnName ?? 'children'])
    if (Array.isArray(children)) row.subRows = visit(children as T[], depth + 1, id)
    ancestors.delete(record)
    return row
  })
  return createTableRowModel(visit(config.dataSource, 0))
}
export const expandTableRows = <T>(rows: readonly TableRow<T>[], expanded: ReadonlySet<string | number>): TableRow<T>[] => {
  const result: TableRow<T>[] = []
  const visit = (list: readonly TableRow<T>[]) => list.forEach(row => { result.push(row); if (expanded.has(row.key)) visit(row.subRows) })
  visit(rows)
  return result
}
