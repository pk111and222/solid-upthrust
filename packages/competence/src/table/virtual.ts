import { createMemo, createSignal, untrack } from 'solid-js'
import type { TableCell, TableConfig, TableKey, TableRow } from './types'
import { clamp } from './utils'

export interface TableVirtualRow<T> { row: TableRow<T>; index: number; start: number; size: number; end: number }
export function createTableVirtualizer<T>(rows: () => readonly TableRow<T>[], cells: () => readonly TableCell<T>[][], config: TableConfig<T>) {
  const [viewport, setViewportSignal] = createSignal(0, { ownedWrite: true })
  const [scrollTop, setScrollSignal] = createSignal(0, { ownedWrite: true })
  const [revision, setRevision] = createSignal(0, { ownedWrite: true })
  const measurements = new Map<string, number>()
  const geometry = createMemo(() => {
    revision()
    const estimate = config.virtual?.estimateRowHeight
    const defaultHeight = estimate && Number.isFinite(estimate) && estimate > 0 ? estimate : 40
    let offset = 0
    return rows().map((row, index) => {
      const size = measurements.get(row.id) ?? defaultHeight
      const result = { row, index, start: offset, size, end: offset + size }; offset += size; return result
    })
  })
  const totalHeight = () => geometry().at(-1)?.end ?? 0
  const effectiveTop = () => clamp(scrollTop(), 0, Math.max(0, totalHeight() - viewport()))
  const visibleRange = createMemo((): [number, number] => {
    const entries = geometry()
    if (!config.virtual) return [0, entries.length]
    if (!entries.length || viewport() <= 0) return [0, 0]
    const top = effectiveTop(), bottom = top + viewport()
    let lo = 0, hi = entries.length
    while (lo < hi) { const mid = (lo + hi) >>> 1; if (entries[mid].end <= top) lo = mid + 1; else hi = mid }
    const overscan = Math.max(0, Math.floor(config.virtual.overscan ?? 3))
    let start = Math.max(0, lo - overscan), end = lo
    while (end < entries.length && entries[end].start < bottom) end++
    end = Math.min(entries.length, end + overscan)
    // A rowspan owner above the viewport must remain rendered. Expand the
    // interval transitively so chained spans cannot drop covered content.
    let changed = true
    const matrix = cells()
    while (changed) {
      changed = false
      for (let ri = 0; ri < end; ri++) for (const cell of matrix[ri] ?? []) {
        if (cell.hidden || cell.rowSpan <= 1 || ri + cell.rowSpan <= start) continue
        if (ri < start) { start = ri; changed = true }
        if (ri + cell.rowSpan > end) { end = Math.min(entries.length, ri + cell.rowSpan); changed = true }
      }
    }
    return [start, end]
  })
  const virtualRows = () => { const [start, end] = visibleRange(); return geometry().slice(start, end) }
  const spacerPadding = (): [number, number] => {
    const [start, end] = visibleRange()
    return [geometry()[start]?.start ?? 0, totalHeight() - (geometry()[end - 1]?.end ?? 0)]
  }
  const measureRow = (key: TableKey, height: number) => untrack(() => {
    if (!Number.isFinite(height) || height <= 0) return false
    const row = rows().find(row => row.key === key)
    if (!row || measurements.get(row.id) === height) return false
    measurements.set(row.id, height); setRevision(n => n + 1); return true
  })
  const resolveScrollTo = (target: { key?: TableKey; index?: number; top?: number; align?: 'start' | 'center' | 'end' | 'nearest'; offset?: number }): number | undefined => untrack(() => {
    if (target.top !== undefined) return Number.isFinite(target.top) ? clamp(target.top, 0, Math.max(0, totalHeight() - viewport())) : undefined
    const entry = target.key !== undefined ? geometry().find(item => item.row.key === target.key) : geometry()[target.index ?? 0]
    if (!entry) return undefined
    const align = target.align ?? 'nearest'
    let top = entry.start
    if (align === 'center') top = entry.start - (viewport() - entry.size) / 2
    if (align === 'end') top = entry.end - viewport()
    if (align === 'nearest') top = entry.start < effectiveTop() ? entry.start : entry.end > effectiveTop() + viewport() ? entry.end - viewport() : effectiveTop()
    return clamp(top + (target.offset ?? 0), 0, Math.max(0, totalHeight() - viewport()))
  })
  return { virtualRows, visibleRange, totalHeight, spacerPadding, viewport, scrollTop: effectiveTop, measureRow, resolveScrollTo,
    setViewport: (height: number) => { if (Number.isFinite(height)) setViewportSignal(Math.max(0, height)) },
    setScrollTop: (top: number) => { if (Number.isFinite(top)) setScrollSignal(Math.max(0, top)) },
    clearMeasurements: () => { measurements.clear(); setRevision(n => n + 1) } }
}
