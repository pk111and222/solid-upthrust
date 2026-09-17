import type { TableColumn, TableColumnDef, TableConfig, TableHeader, TableColumnLayout, TableState } from './types'
import { clamp, readPath } from './utils'

export function buildTableColumns<T>(definitions: readonly TableColumnDef<T>[], defaults: Partial<TableColumnDef<T>> = {}) {
  const byId = new Map<string, TableColumn<T>>()
  const leaves: TableColumn<T>[] = []
  const visit = (defs: readonly TableColumnDef<T>[], depth: number, parentId?: string): TableColumn<T>[] => defs.map(def => {
    const definition = { ...defaults, ...(parentId ? { fixed: byId.get(parentId)?.definition.fixed } : {}), ...def }
    const path = definition.dataIndex === undefined ? [] : Array.isArray(definition.dataIndex) ? definition.dataIndex : [definition.dataIndex as string | number]
    const id = definition.key ?? (path.length === 1 ? String(path[0]) : path.length ? JSON.stringify(path) : undefined)
    if (!id) throw new Error('Table columns with no dataIndex require an explicit key')
    if (byId.has(id)) throw new Error(`Duplicate table column key: ${id}`)
    const column: TableColumn<T> = {
      id, definition, depth, parentId, children: [],
      getValue: (record, index) => definition.accessor ? definition.accessor(record, index) : readPath(record, path),
    }
    byId.set(id, column)
    column.children = definition.children?.length ? visit(definition.children, depth + 1, id) : []
    if (!column.children.length) leaves.push(column)
    return column
  })
  const roots = visit(definitions, 0)
  return { roots, leaves, byId }
}
export type TableColumnsModel<T> = ReturnType<typeof buildTableColumns<T>>

export const getTableVisibleColumns = <T>(model: TableColumnsModel<T>, state: Pick<TableState, 'columnVisibility' | 'columnOrder' | 'columnPinning'>, config: TableConfig<T>) => {
  const visible = (column: TableColumn<T>): boolean => {
    const def = column.definition
    if (state.columnVisibility[column.id] === false || def.hidden) return false
    if (def.responsive?.length && config.breakpoints && !def.responsive.some(bp => config.breakpoints?.[bp])) return false
    return !column.parentId || visible(model.byId.get(column.parentId)!)
  }
  const rank = new Map(state.columnOrder.map((id, index) => [id, index]))
  const leaves = model.leaves.filter(visible).sort((a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity))
  const lookup = new Map(leaves.map(column => [column.id, column]))
  const pinnedStart = [...new Set(state.columnPinning.start)].flatMap(id => lookup.has(id) ? [lookup.get(id)!] : [])
  const startSet = new Set(pinnedStart.map(c => c.id))
  const pinnedEnd = [...new Set(state.columnPinning.end)].flatMap(id => lookup.has(id) && !startSet.has(id) ? [lookup.get(id)!] : [])
  const pinned = new Set([...pinnedStart, ...pinnedEnd].map(c => c.id))
  return [...pinnedStart, ...leaves.filter(c => !pinned.has(c.id)), ...pinnedEnd]
}
export const getTableColumnWidth = <T>(column: TableColumn<T>, state: Pick<TableState, 'columnSizing'>) => {
  const min = Math.max(1, column.definition.minWidth ?? 40)
  const max = Math.max(min, column.definition.maxWidth ?? Number.MAX_SAFE_INTEGER)
  const width = state.columnSizing[column.id] ?? column.definition.width ?? 150
  return clamp(Number.isFinite(width) ? width : 150, min, max)
}
export const buildTableColumnLayout = <T>(columns: readonly TableColumn<T>[], state: Pick<TableState, 'columnSizing' | 'columnPinning'>): TableColumnLayout<T>[] => {
  const start = new Set(state.columnPinning.start), end = new Set(state.columnPinning.end)
  const entries = columns.map(column => ({ column, width: getTableColumnWidth(column, state), region: start.has(column.id) ? 'start' as const : end.has(column.id) ? 'end' as const : 'center' as const }))
  let left = 0, right = entries.filter(e => e.region === 'end').reduce((sum, entry) => sum + entry.width, 0)
  return entries.map((entry, index) => {
    let offset: number | undefined
    if (entry.region === 'start') { offset = left; left += entry.width }
    if (entry.region === 'end') { right -= entry.width; offset = right }
    return { ...entry, offset, first: entries[index - 1]?.region !== entry.region, last: entries[index + 1]?.region !== entry.region }
  })
}
/** Group headers follow the actual visible order, splitting disjoint/pinned groups. */
export const buildTableHeaders = <T>(model: TableColumnsModel<T>, layout: readonly TableColumnLayout<T>[]): readonly TableHeader<T>[][] => {
  if (!layout.length) return []
  const maxDepth = Math.max(...layout.map(item => item.column.depth))
  const headers: TableHeader<T>[][] = Array.from({ length: maxDepth + 1 }, () => [])
  const lastLeaf = new Map<TableHeader<T>, number>()
  for (const [leafIndex, item] of layout.entries()) {
    const path: TableColumn<T>[] = []
    let column: TableColumn<T> | undefined = item.column
    while (column) { path.unshift(column); column = column.parentId ? model.byId.get(column.parentId) : undefined }
    path.forEach((part, depth) => {
      const row = headers[depth], previous = row[row.length - 1]
      if (part.children.length && previous?.column.id === part.id && previous.region === item.region && lastLeaf.get(previous) === leafIndex - 1) previous.colSpan++
      else row.push({ columnIndex: leafIndex, id: `${part.id}:${depth}:${row.length}:${item.region}`, column: part, depth, region: item.region, colSpan: 1, rowSpan: part.children.length ? 1 : maxDepth - depth + 1 })
      lastLeaf.set(row[row.length - 1], leafIndex)
    })
  }
  return headers
}
