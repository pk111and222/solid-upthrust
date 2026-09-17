import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createTable } from '../../../competence/src/table/createTable'
import { columns, people, treePeople } from '../../utils/fixtures/table'
const step = (fn: () => void) => { fn(); flush() }

describe('Table selection', () => {
  it('composes same-batch selections and skips disabled rows in ranges and inversion', () => createRoot(() => {
    const onChange = vi.fn()
    const table = createTable({ dataSource: people, columns, rowSelection: { onChange, getCheckboxProps: r => ({ disabled: r.disabled }) } })
    step(() => { table.selection.toggleRow(0); table.selection.toggleRow('b') })
    expect(table.selection.selectedKeys()).toEqual([0, 'b'])
    expect(table.selection.getSelectAllState().indeterminate).toBe(true)
    step(() => table.selection.selectRange('c', 'e'))
    expect(table.selection.selectedKeys()).toEqual([0, 'b', 'c', 'e'])
    expect(table.selection.getSelectAllState().checked).toBe(true)
    step(() => table.selection.invertSelection()); expect(table.selection.selectedKeys()).toEqual([])
    step(() => table.selection.toggleRow('d')); expect(table.selection.selectedKeys()).toEqual([])
    expect(onChange.mock.calls.at(-1)?.[2]).toEqual({ type: 'invert' })
  }))
  it('selects the page while retaining selections on other pages', () => createRoot(() => {
    const t = createTable({ dataSource: people, columns, pagination: { defaultPageSize: 2 }, rowSelection: {} })
    step(() => t.selection.selectAll()); step(() => t.nextPage()); step(() => t.selection.selectAll())
    expect(t.selection.selectedKeys()).toEqual([0, 'b', 'c', 'd'])
    step(() => t.selection.selectAll(false)); expect(t.selection.selectedKeys()).toEqual([0, 'b'])
    step(() => t.selection.clearSelection()); expect(t.selection.selectedKeys()).toEqual([])
  }))
  it('conducts parent/child checks across enabled branches only', () => createRoot(() => {
    const t = createTable({ dataSource: treePeople, columns, rowSelection: { checkStrictly: false, getCheckboxProps: r => ({ disabled: r.disabled }) } })
    step(() => t.selection.toggleRow('a')); expect(t.selection.getCheckState('p')).toBe('mixed')
    step(() => t.selection.toggleRow('b')); expect(t.selection.getCheckState('p')).toBe('checked')
    expect(t.selection.selectedKeys()).not.toContain('locked')
    step(() => t.selection.toggleRow('p', false)); expect(t.selection.selectedKeys()).toEqual([])
    step(() => t.selection.toggleRow('p')); expect(new Set(t.selection.selectedKeys())).toEqual(new Set(['p', 'a', 'b']))
  }))
  it('supports radio and controlled rejected selection', () => createRoot(() => {
    const t = createTable({ dataSource: people, columns, rowSelection: { type: 'radio' } })
    step(() => { t.selection.toggleRow(0); t.selection.toggleRow('b') }); expect(t.selection.selectedKeys()).toEqual(['b'])
    step(() => t.selection.toggleRow('b', false)); expect(t.selection.selectedKeys()).toEqual(['b'])
    step(() => t.selection.selectAll()); expect(t.selection.selectedKeys()).toEqual(['b'])
    const onChange = vi.fn()
    const controlled = createTable({ dataSource: people, columns, rowSelection: { selectedRowKeys: [0], onChange } })
    step(() => controlled.selection.toggleRow('b')); expect(controlled.selection.selectedKeys()).toEqual([0])
    expect(onChange.mock.calls[0][0]).toEqual([0, 'b'])
  }))
  it('preserves records across remote pages and releases cleared records', () => createRoot(() => {
    const [data, setData] = createSignal(people.slice(0, 2), { ownedWrite: true })
    const t = createTable({ get dataSource() { return data() }, columns, manualPagination: true, rowSelection: { preserveSelectedRowKeys: true } })
    step(() => t.selection.toggleRow(0)); step(() => setData(people.slice(2)))
    expect(t.selection.getSelectedRecords()).toEqual([people[0]])
    step(() => t.selection.toggleRow('c')); expect(t.selection.selectedKeys()).toEqual([0, 'c'])
    step(() => t.selection.clearSelection()); expect(t.selection.getSelectedRecords()).toEqual([])
  }))
  it('prunes removed rows without preserveSelectedRowKeys', () => createRoot(() => {
    const [data, setData] = createSignal(people, { ownedWrite: true })
    const t = createTable({ get dataSource() { return data() }, columns, rowSelection: {} })
    step(() => t.selection.toggleRow(0)); step(() => setData(people.slice(1)))
    expect(t.selection.selectedKeys()).toEqual([])
  }))
})

describe('Table column layout and virtual rows', () => {
  it('inherits grouped fixed positions, deduplicates pins and calculates offsets', () => createRoot(() => {
    const t = createTable({ dataSource: people, columns: [{ key: 'group', fixed: 'start', children: columns.slice(0, 2) }, columns[2]] })
    expect(t.getColumnLayout().map(c => [c.region, c.offset])).toEqual([['start', 0], ['start', 150], ['center', undefined]])
    step(() => t.setState({ columnPinning: { start: ['name', 'name'], end: ['name', 'team', 'team'] } }))
    expect(t.getVisibleColumns().map(c => c.id)).toEqual(['name', 'age', 'team'])
    expect(t.getColumnLayout().at(-1)?.offset).toBe(0)
  }))
  it('splits noncontiguous nested headers around shallow columns', () => createRoot(() => {
    const t = createTable({ dataSource: people, columns: [{ key: 'outer', children: [{ key: 'inner', children: columns.slice(0, 2) }] }, columns[2]] })
    step(() => t.setColumnOrder(['name', 'team', 'age']))
    expect(t.getHeaderGroups()[1].map(h => h.colSpan)).toEqual([1, 1])
    expect(t.getHeaderGroups()[0].map(h => h.colSpan)).toEqual([1, 1, 1])
  }))
  it('hides responsive/group columns and resizes with limits, RTL and cancellation', () => createRoot(() => {
    const t = createTable({ dataSource: people, columns: [...columns, { key: 'mobile', dataIndex: 'name', responsive: ['xs'] }], breakpoints: { md: true } })
    expect(t.getVisibleColumns()).toHaveLength(3)
    step(() => { t.beginColumnResize('age', 100); t.updateColumnResize(500); t.endColumnResize() })
    expect(t.getColumnLayout()[1].width).toBe(240)
    step(() => { t.beginColumnResize('age', 100); t.updateColumnResize(200, 'rtl'); t.endColumnResize() })
    expect(t.getColumnLayout()[1].width).toBe(140)
    step(() => { t.beginColumnResize('age', 100); t.updateColumnResize(0); t.endColumnResize(false) })
    expect(t.getColumnLayout()[1].width).toBe(140)
    step(() => t.setColumnVisibility('age', false)); expect(t.getVisibleColumns().map(c => c.id)).toEqual(['name', 'team'])
  }))
  it('clips spans at page and pin boundaries and marks covered cells', () => createRoot(() => {
    const t = createTable({ dataSource: people, columns: [{ ...columns[0], fixed: 'start', onCell: () => ({ colSpan: 3 }) }, { ...columns[1], onCell: (_, i) => i === 0 ? { rowSpan: 99, colSpan: 2 } : {} }, columns[2]], pagination: { defaultPageSize: 2 } })
    const matrix = t.getCellRows()
    expect(matrix[0][0].colSpan).toBe(1)
    expect(matrix[0][1]).toMatchObject({ rowSpan: 2, colSpan: 2, hidden: false })
    expect(matrix[0][2].hidden).toBe(true)
    expect(matrix[1][1].hidden).toBe(true)
  }))
  it('calculates measured geometry, scrolling and spacer padding without DOM', () => createRoot(() => {
    const t = createTable({ dataSource: people, columns, virtual: { estimateRowHeight: 20, overscan: 0 } })
    step(() => { t.virtual.setViewport(40); t.virtual.setScrollTop(40) })
    expect(t.virtual.virtualRows().map(r => r.row.key)).toEqual(['c', 'd'])
    expect(t.virtual.spacerPadding()).toEqual([40, 20])
    step(() => t.virtual.measureRow(0, 40)); expect(t.virtual.totalHeight()).toBe(120)
    expect(t.virtual.resolveScrollTo({ key: 'e', align: 'end' })).toBe(80)
    expect(t.virtual.resolveScrollTo({ key: 'missing' })).toBeUndefined()
    expect(t.virtual.measureRow(0, -1)).toBe(false)
    step(() => t.virtual.clearMeasurements()); expect(t.virtual.totalHeight()).toBe(100)
  }))
  it('retains offscreen rowspan owners in the virtual range', () => createRoot(() => {
    const t = createTable({ dataSource: people, columns: [{ ...columns[0], onCell: (_, i) => ({ rowSpan: i === 0 ? 3 : 1 }) }], virtual: { estimateRowHeight: 20, overscan: 0 } })
    step(() => { t.virtual.setViewport(20); t.virtual.setScrollTop(40) })
    expect(t.virtual.visibleRange()).toEqual([0, 3])
    expect(t.virtual.spacerPadding()).toEqual([0, 40])
  }))
  it('expands initial groups and sorts infinite numeric values', () => createRoot(() => {
    const t = createTable({ dataSource: people, columns, initialState: { grouping: ['team'] }, expandable: { defaultExpandAllRows: true } })
    expect(t.getRowModel().rows).toHaveLength(7)
    const numeric = createTable({ dataSource: [{ key: 1, value: Infinity }, { key: 2, value: 0 }, { key: 3, value: -Infinity }], columns: [{ dataIndex: 'value', sorter: 'auto', defaultSortOrder: 'ascend' }] })
    expect(numeric.getRowModel().rows.map(r => r.key)).toEqual([3, 2, 1])
  }))
})

describe('Table editing', () => {
  it('edits nested values immutably and saves through the owner', async () => {
    const t = createRoot(() => createTable({ dataSource: people, columns: [...columns, { key: 'score', dataIndex: ['profile', 'score'] }], editing: { onSave: vi.fn() } }))
    expect(t.editing.begin(0)).toBe(true)
    step(() => t.editing.setValue(0, 'score', 99))
    expect(t.editing.getDraft(0)?.record.profile?.score).toBe(99)
    expect(people[0].profile?.score).toBe(5)
    expect(await t.editing.commit(0)).toBe(true); flush()
    expect(t.editing.getDraft(0)).toBeUndefined()
  })
  it('keeps validation errors and recovers from save rejection', async () => {
    const save = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined)
    const t = createRoot(() => createTable({ dataSource: people, columns, editing: { validate: r => r.name ? undefined : { name: 'required' }, onSave: save } }))
    t.editing.begin(0); t.editing.setValue(0, 'name', '')
    expect(await t.editing.commit(0)).toBe(false); flush()
    expect(t.editing.getDraft(0)?.errors).toEqual({ name: 'required' }); expect(save).not.toHaveBeenCalled()
    t.editing.setValue(0, 'name', 'New')
    expect(await t.editing.commit(0)).toBe(false); flush()
    expect(t.editing.getDraft(0)?.errors).toEqual({ _row: 'offline' })
    expect(await t.editing.commit(0)).toBe(true)
  })
  it('ignores stale asynchronous validation after edits or cancellation', async () => {
    let resolve!: () => void
    const save = vi.fn()
    const t = createRoot(() => createTable({ dataSource: people, columns, editing: { validate: () => new Promise<void>(r => { resolve = r }), onSave: save } }))
    t.editing.begin(0); const pending = t.editing.commit(0)
    t.editing.setValue(0, 'name', 'New'); resolve()
    expect(await pending).toBe(false); expect(save).not.toHaveBeenCalled()
    const again = t.editing.commit(0); t.editing.cancel(0); resolve()
    expect(await again).toBe(false); expect(save).not.toHaveBeenCalled()
  })
  it('rejects concurrent save/cancel and detects changed original records', async () => {
    let finish!: () => void
    const [data, setData] = createSignal(people, { ownedWrite: true })
    const t = createRoot(() => createTable({ get dataSource() { return data() }, columns, editing: { onSave: () => new Promise<void>(r => { finish = r }) } }))
    t.editing.begin(0); step(() => setData(people.map(r => r.key === 0 ? { ...r, name: 'External' } : r)))
    expect(await t.editing.commit(0)).toBe(false); flush()
    expect(t.editing.getDraft(0)?.errors._row).toMatch(/changed/)
    t.editing.cancel(0); t.editing.begin(0); const pending = t.editing.commit(0); await Promise.resolve()
    expect(t.editing.cancel(0)).toBe(false); expect(await t.editing.commit(0)).toBe(false)
    expect(t.editing.setValue(0, 'name', 'Blocked')).toBe(false)
    finish(); expect(await pending).toBe(true)
  })
  it('does not save after disposal during validation', async () => {
    let dispose!: () => void, resolve!: () => void
    const save = vi.fn()
    const t = createRoot(d => { dispose = d; return createTable({ dataSource: people, columns, editing: { validate: () => new Promise<void>(r => { resolve = r }), onSave: save } }) })
    t.editing.begin(0); const pending = t.editing.commit(0); dispose(); resolve()
    expect(await pending).toBe(false); expect(save).not.toHaveBeenCalled()
  })
})


describe('Table regression boundaries', () => {
  it('clips later spans instead of overlapping a prior rectangle', () => createRoot(() => {
    const t = createTable({ dataSource: people, columns: [
      { ...columns[0], onCell: (_, i) => ({ colSpan: i === 1 ? 3 : 1 }) },
      { ...columns[1], onCell: (_, i) => ({ rowSpan: i === 0 ? 3 : 1 }) }, columns[2],
    ] })
    expect(t.getCellRows()[1][0].colSpan).toBe(1)
    expect(t.getCellRows()[1][1].hidden).toBe(true)
    expect(t.getCellRows()[1][2].hidden).toBe(false)
  }))
  it('reports unknown remote totals without inventing a count', () => createRoot(() => {
    const onChange = vi.fn()
    const t = createTable({ dataSource: people, columns, manualPagination: true, onChange })
    step(() => t.toggleSorting('age'))
    expect(onChange.mock.calls[0][0].total).toBeUndefined()
  }))
  it('does not invalidate controlled local filters for selection changes', () => createRoot(() => {
    const onFilter = vi.fn((value, record: { team: string }) => value === record.team)
    const t = createTable({ dataSource: people, columns: [{ ...columns[2], filteredValue: ['A'], onFilter }], rowSelection: {} })
    t.getFilteredRowModel(); const calls = onFilter.mock.calls.length
    step(() => t.selection.toggleRow(0)); t.getFilteredRowModel()
    expect(onFilter.mock.calls).toHaveLength(calls)
  }))
})
