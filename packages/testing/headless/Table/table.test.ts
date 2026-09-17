import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createTable } from '../../../competence/src/table/createTable'
import { columns, people, treePeople, type Person } from '../../utils/fixtures/table'
import type { TableColumnDef, TableState } from '../../../competence/src/table/types'
const step = (fn: () => void) => { fn(); flush() }

describe('Table core and state', () => {
  it('builds stable row/column/cell models with numeric keys and nested accessors', () => createRoot(() => {
    const table = createTable({ dataSource: people, columns: [...columns, { key: 'score', dataIndex: ['profile', 'score'] }] })
    expect(table.getRow(0)?.getValue('score')).toBe(5)
    expect(table.getRow(0)?.id).toBe('n:0')
    expect(table.getHeaderGroups()[0]).toHaveLength(4)
    expect(table.getCellContext(0, 'name')?.getValue()).toBe('Ada')
    expect(table.getRowModel().rows).toHaveLength(5)
    expect(table.getSummary()).toEqual({ age: 160 })
  }))
  it('distinguishes number/string keys and rejects duplicates, missing keys and cycles', () => {
    createRoot(() => {
      const table = createTable({ dataSource: [{ key: 1 }, { key: '1' }], columns: [{ dataIndex: 'key' }] })
      expect(table.getCoreRowModel().rowsByKey.size).toBe(2)
    })
    expect(() => createRoot(() => createTable({ dataSource: [{ key: 1 }, { key: 1 }], columns: [] }))).toThrow(/Duplicate/)
    expect(() => createRoot(() => createTable({ dataSource: [{ name: 'No key' }], columns: [] }))).toThrow(/stable/)
    const cyclic = { key: 'x', children: [] as unknown[] }; cyclic.children.push(cyclic)
    expect(() => createRoot(() => createTable({ dataSource: [cyclic], columns: [] }))).toThrow(/Cyclic/)
    expect(() => createRoot(() => createTable({ dataSource: [], columns: [{ title: 'No ID' }] }))).toThrow(/explicit key/)
  })
  it('supports custom row keys and childrenColumnName', () => createRoot(() => {
    const table = createTable({ dataSource: [{ id: 'r', nodes: [{ id: 'c' }] }], columns: [{ dataIndex: 'id' }], rowKey: 'id', expandable: { childrenColumnName: 'nodes', defaultExpandAllRows: true } })
    expect(table.getRowModel().rows.map(row => row.key)).toEqual(['r', 'c'])
  }))
  it('keeps fully controlled proposals separate from visual state', () => createRoot(() => {
    const onStateChange = vi.fn(), onChange = vi.fn()
    const state: Partial<TableState> = { sorters: [], pagination: { current: 1, pageSize: 2 }, filters: {}, selectedRowKeys: [] }
    const table = createTable({ dataSource: people, columns, state, onStateChange, onChange, rowSelection: {} })
    step(() => table.toggleSorting('age'))
    expect(table.getState().sorters).toEqual([])
    expect(onStateChange.mock.calls[0][0].sorters).toEqual([{ columnKey: 'age', order: 'ascend' }])
    expect(onChange.mock.calls[0][3].currentDataSource.map((row: Person) => row.key)).toEqual(['b', 'd', 0, 'c', 'e'])
    step(() => table.selection.toggleRow(0)); expect(table.selection.selectedKeys()).toEqual([])
    step(() => table.nextPage()); expect(table.getPagination().current).toBe(1)
  }))
  it('accepts reactive data and controlled state round-trips', () => createRoot(() => {
    const [state, setState] = createSignal<Partial<TableState>>({ sorters: [] }, { ownedWrite: true })
    const [data, setData] = createSignal(people, { ownedWrite: true })
    const table = createTable({ get dataSource() { return data() }, columns, get state() { return state() }, onStateChange: setState })
    step(() => table.toggleSorting('age')); expect(table.getRowModel().rows[0].key).toBe('b')
    step(() => setData([{ key: 'new', name: 'New', age: 1, team: 'Z' }]))
    expect(table.getRowModel().rows[0].key).toBe('new')
    expect(table.getRow(0)).toBeUndefined()
  }))
  it('composes sequential uncontrolled updates before flush and resets to initial state', () => createRoot(() => {
    const table = createTable({ dataSource: people, columns, rowSelection: {}, initialState: { globalFilter: 'Ada' } })
    table.setColumnVisibility('name', false); table.setColumnVisibility('age', false)
    table.selection.toggleRow(0); table.selection.toggleRow('b'); flush()
    expect(table.getVisibleColumns().map(c => c.id)).toEqual(['team'])
    expect(table.selection.selectedKeys()).toEqual([0, 'b'])
    step(() => table.reset())
    expect(table.getVisibleColumns()).toHaveLength(3); expect(table.getState().globalFilter).toBe('Ada')
  }))
  it('does not re-run accessors, filters or sorters for selection-only changes', () => createRoot(() => {
    const accessor = vi.fn((record: Person) => record.age), compare = vi.fn((a: Person, b: Person) => a.age - b.age), filter = vi.fn((value: unknown, row: Person) => row.team === value)
    const table = createTable({ dataSource: people, columns: [{ key: 'age', accessor, sorter: compare, defaultSortOrder: 'ascend' }, { key: 'team', onFilter: filter, defaultFilteredValue: ['A'] }], rowSelection: {} })
    table.getCellRows(); const count = [accessor.mock.calls.length, compare.mock.calls.length, filter.mock.calls.length]
    step(() => table.selection.toggleRow(0)); table.getCellRows()
    expect([accessor.mock.calls.length, compare.mock.calls.length, filter.mock.calls.length]).toEqual(count)
  }))
})

describe('Table row pipeline', () => {
  it('filters OR within a column, AND across columns, sorts stably, then paginates', () => createRoot(() => {
    const onChange = vi.fn()
    const table = createTable({ dataSource: people, columns, pagination: { defaultPageSize: 2 }, onChange })
    step(() => table.nextPage()); expect(table.getPagination().current).toBe(2)
    step(() => table.setColumnFilter('team', ['A']))
    expect(table.getPagination().current).toBe(1)
    expect(table.getFilteredRowModel().rows.map(row => row.key)).toEqual([0, 'c', 'e'])
    step(() => table.toggleSorting('age')); step(() => table.toggleSorting('age'))
    expect(table.getRowModel().rows.map(row => row.key)).toEqual(['e', 'c'])
    step(() => table.setColumnFilter('team', ['A', 'B'])); step(() => table.setGlobalFilter('Ben'))
    expect(table.getRowModel().rows.map(row => row.key)).toEqual(['b'])
    expect(onChange.mock.calls.at(-1)?.[3].action).toBe('filter')
  }))
  it('handles multi-sort priority and server-only sorters without accidental local sorting', () => createRoot(() => {
    const defs: TableColumnDef<Person>[] = [
      { dataIndex: 'team', sorter: { multiple: 2, compare: (a, b) => a.team.localeCompare(b.team) } },
      { dataIndex: 'age', sorter: { multiple: 1, compare: (a, b) => a.age - b.age } },
      { dataIndex: 'name', sorter: true },
    ]
    const table = createTable({ dataSource: people, columns: defs })
    step(() => table.toggleSorting('age')); step(() => table.toggleSorting('team'))
    expect(table.getRowModel().rows.map(row => row.key)).toEqual([0, 'c', 'e', 'b', 'd'])
    step(() => table.toggleSorting('name', false))
    expect(table.getRowModel().rows.map(row => row.key)).toEqual(people.map(row => row.key))
    step(() => table.toggleSorting('name')); step(() => table.toggleSorting('name'))
    expect(table.getState().sorters).toEqual([])
  }))
  it('obeys controlled per-column filters and sort orders and supports reset-to-default', () => createRoot(() => {
    const table = createTable({ dataSource: people, columns: [
      { ...columns[1], sortOrder: 'descend' },
      { ...columns[2], filteredValue: ['A'], defaultFilteredValue: ['B'], filterResetToDefaultFilteredValue: true },
    ] })
    step(() => table.toggleSorting('age')); step(() => table.resetColumnFilter('team'))
    expect(table.getState().sorters).toEqual([{ columnKey: 'age', order: 'descend' }])
    expect(table.getState().filters.team).toEqual(['A'])
    expect(table.getRowModel().rows.map(row => row.key)).toEqual(['e', 'c', 0])
  }))
  it('honors manual filtering/sorting/pagination and remote totals', () => createRoot(() => {
    const table = createTable({ dataSource: people.slice(0, 2), columns, manualFiltering: true, manualSorting: true, manualPagination: true,
      pagination: { defaultCurrent: 3, defaultPageSize: 2, total: 30 } })
    step(() => table.setColumnFilter('team', ['missing'])); step(() => table.toggleSorting('age'))
    expect(table.getRowModel().rows.map(row => row.key)).toEqual([0, 'b'])
    expect(table.getPageCount()).toBe(15)
    step(() => table.setPagination({ current: 10, pageSize: 2 })); expect(table.getPagination().current).toBe(10)
    expect(table.getRowModel().rows).toHaveLength(2)
  }))
  it('handles unknown remote totals, empty data, invalid sizes and clamped pages', () => createRoot(() => {
    const remote = createTable({ dataSource: people.slice(0, 2), columns, manualPagination: true, pagination: { defaultPageSize: 2 } })
    expect(remote.getPageCount()).toBe(-1); expect(remote.canNextPage()).toBe(true)
    step(() => remote.nextPage()); expect(remote.getPagination().current).toBe(2)
    const empty = createTable<Person>({ dataSource: [], columns })
    step(() => empty.setPageSize(0)); step(() => empty.setPagination({ current: 999, pageSize: 2 }))
    expect(empty.getPagination()).toEqual({ current: 1, pageSize: 2, total: 0 })
    expect(empty.getHeaderGroups()[0]).toHaveLength(3); expect(empty.canNextPage()).toBe(false)
  }))
  it('supports leaf-first filtering with retained ancestors', () => createRoot(() => {
    const table = createTable({ dataSource: treePeople, columns, filterFromLeafRows: true, expandable: { defaultExpandAllRows: true } })
    step(() => table.setGlobalFilter('Ada'))
    expect(table.getRowModel().rows.map(row => row.key)).toEqual(['p', 'a'])
    const parentFirst = createTable({ dataSource: treePeople, columns })
    step(() => parentFirst.setGlobalFilter('Ada')); expect(parentFirst.getRowModel().rows).toEqual([])
  }))
  it('distinguishes root-row pagination from expanded-row pagination', () => createRoot(() => {
    const rootPage = createTable({ dataSource: treePeople, columns, pagination: { defaultPageSize: 1 }, expandable: { defaultExpandedRowKeys: ['p'] } })
    expect(rootPage.getRowModel().rows.map(row => row.key)).toEqual(['p', 'a', 'b', 'disabled'])
    step(() => rootPage.nextPage()); expect(rootPage.getRowModel().rows.map(row => row.key)).toEqual(['q'])
    const flatPage = createTable({ dataSource: treePeople, columns, paginateExpandedRows: true, pagination: { defaultPageSize: 2 }, expandable: { defaultExpandedRowKeys: ['p'] } })
    expect(flatPage.getRowModel().rows.map(row => row.key)).toEqual(['p', 'a'])
    expect(flatPage.getPageCount()).toBe(3)
  }))
  it('expands detail-only records without manufacturing data rows', () => createRoot(() => {
    const onExpand = vi.fn(), onExpandedRowsChange = vi.fn()
    const table = createTable({ dataSource: people, columns, expandable: { rowExpandable: row => row.key === 0, onExpand, onExpandedRowsChange } })
    step(() => table.toggleExpanded(0)); expect(table.isExpanded(0)).toBe(true)
    expect(table.getRowModel().rows).toHaveLength(5)
    expect(onExpand).toHaveBeenCalledWith(true, people[0])
    step(() => table.toggleExpanded('b')); expect(onExpandedRowsChange).toHaveBeenCalledTimes(1)
  }))
  it('groups, aggregates, sorts groups and exposes unpaginated faceted values', () => createRoot(() => {
    const table = createTable({ dataSource: people, columns, initialState: { grouping: ['team'] } })
    expect(table.getGroupedRowModel().rows.map(row => row.getValue('age'))).toEqual([120, 40])
    step(() => table.toggleAllExpanded(true)); expect(table.getRowModel().rows).toHaveLength(7)
    step(() => table.setColumnFilter('team', ['A']))
    expect([...table.getFacetedValues('team')]).toEqual([['A', 3], ['B', 2]])
    expect(table.getSummary('filtered')).toEqual({ age: 120 })
  }))
  it('runs pure feature transforms at their named stage', () => createRoot(() => {
    const table = createTable({ dataSource: people, columns, features: [{ name: 'adults', stage: 'filtered', transform: model => model.rows.filter(row => Number(row.getValue('age')) >= 30) }] })
    expect(table.getRowModel().rows.map(row => row.key)).toEqual([0, 'c', 'e'])
  }))
})
