import type { TableAggregation, TableColumn, TableRow, TableRowModel } from './types'
import { createTableRowModel } from './rows'

export function aggregateTableValues(values: readonly unknown[], aggregate: TableAggregation): unknown {
  if (typeof aggregate === 'function') return aggregate(values)
  if (aggregate === 'count') return values.length
  if (aggregate === 'uniqueCount') return new Set(values).size
  const numbers = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  if (aggregate === 'sum') return numbers.reduce((sum, value) => sum + value, 0)
  if (!numbers.length) return undefined
  if (aggregate === 'mean') return numbers.reduce((sum, value) => sum + value, 0) / numbers.length
  return numbers.reduce((result, value) => aggregate === 'min' ? Math.min(result, value) : Math.max(result, value))
}
const groupToken = (value: unknown): string => {
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  if (value instanceof Date) return `date:${value.toISOString()}`
  if (['string', 'number', 'boolean', 'bigint'].includes(typeof value)) return `${typeof value}:${String(value)}`
  throw new Error('Table grouping values must be primitive values or Dates')
}
export function groupTableRows<T>(model: TableRowModel<T>, columns: readonly TableColumn<T>[], grouping: readonly string[]) {
  const columnMap = new Map(columns.map(c => [c.id, c]))
  const keys = [...new Set(grouping)].filter(id => columnMap.has(id))
  if (!keys.length) return model
  const reparent = (row: TableRow<T>, depth: number, parentId: string): TableRow<T> => ({ ...row, depth, parentId, subRows: row.subRows.map(child => reparent(child, depth + 1, row.id)) })
  const visit = (rows: readonly TableRow<T>[], depth: number, path: string[] = []): TableRow<T>[] => {
    const columnId = keys[depth]
    const buckets = new Map<string, { value: unknown; rows: TableRow<T>[] }>()
    for (const row of rows) {
      const value = row.getValue(columnId), token = groupToken(value)
      const bucket = buckets.get(token) ?? { value, rows: [] }
      bucket.rows.push(row); buckets.set(token, bucket)
    }
    return [...buckets].map(([token, bucket], index) => {
      const nextPath = [...path, columnId, token], id = `g:${JSON.stringify(nextPath)}`
      // Public group keys are reserved and checked against real record keys.
      if (model.rowsByKey.has(id)) throw new Error(`Table group key collides with a record: ${id}`)
      const values = new Map<string, unknown>([[columnId, bucket.value]])
      return {
        id, key: id, original: undefined, depth, index, parentId: path.length ? `g:${JSON.stringify(path)}` : undefined,
        grouping: { columnId, value: bucket.value },
        subRows: depth + 1 < keys.length ? visit(bucket.rows, depth + 1, nextPath) : bucket.rows.map(row => reparent(row, depth + 1, id)),
        getValue: requested => {
          if (!values.has(requested)) {
            const agg = columnMap.get(requested)?.definition.aggregation
            values.set(requested, agg ? aggregateTableValues(bucket.rows.map(row => row.getValue(requested)), agg) : undefined)
          }
          return values.get(requested)
        },
      }
    })
  }
  return createTableRowModel(visit(model.rows, 0))
}
