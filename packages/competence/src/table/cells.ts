import type { TableCell, TableColumn, TableRow } from './types'

/** Resolves spans against the rendered page, clipping across pin boundaries. */
export const buildTableCells = <T>(rows: readonly TableRow<T>[], columns: readonly TableColumn<T>[], region: (id: string) => string): readonly TableCell<T>[][] => {
  const occupied = new Set<string>()
  return rows.map((row, ri) => columns.map((column, ci) => {
    const props = row.original === undefined ? {} : column.definition.onCell?.(row.original, ri) ?? {}
    const span = (value: number | undefined, remaining: number) => value === 0 ? 0
      : Math.min(remaining, value !== undefined && Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1)
    let rowSpan = span(props.rowSpan, rows.length - ri)
    let colSpan = span(props.colSpan, columns.length - ci)
    for (let offset = 1; offset < colSpan; offset++) {
      if (region(columns[ci + offset].id) !== region(column.id)) { colSpan = offset; break }
    }
    const hidden = occupied.has(`${ri}:${ci}`) || rowSpan === 0 || colSpan === 0
    if (!hidden) {
      // Earlier cells own occupied slots. Shrink later rectangles rather than
      // emitting invalid overlapping HTML table spans.
      for (let r = ri; r < ri + rowSpan; r++) for (let c = ci; c < ci + colSpan; c++) {
        if (!occupied.has(`${r}:${c}`)) continue
        if (c === ci) { rowSpan = r - ri; break }
        colSpan = c - ci
      }
    }
    if (!hidden) for (let r = ri; r < ri + rowSpan; r++) for (let c = ci; c < ci + colSpan; c++) if (r !== ri || c !== ci) occupied.add(`${r}:${c}`)
    return { id: `${row.id}/${column.id}`, row, column, value: row.getValue(column.id), rowSpan, colSpan, hidden, props }
  }))
}
