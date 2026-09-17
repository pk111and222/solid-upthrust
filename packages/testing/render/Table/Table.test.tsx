import { render } from '@solidjs/web'
import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Table from '../../../components/lib/Table/index'
import type { TableRef, TableColumnType } from '../../../components/lib/Table/types'
interface Item { key: string; name: string; age: number; children?: Item[] }
const records: Item[] = [{ key: 'a', name: 'Ada', age: 30 }, { key: 'b', name: 'Ben', age: 20 }]
const columns: TableColumnType<Item>[] = [{ dataIndex: 'name', title: '姓名', editable: true }, { dataIndex: 'age', title: '年龄', sorter: 'auto', editable: true, resizable: true }]
let dispose: (() => void) | undefined
const mount = (view: Parameters<typeof render>[0]) => {
  const host = document.createElement('div'); document.body.append(host); dispose = render(view, host); flush(); return host
}
const button = (host: ParentNode, text: string) => [...host.querySelectorAll('button')].find(el => el.textContent === text)!
const click = (el: HTMLElement) => { el.click(); flush() }
afterEach(() => { dispose?.(); document.body.innerHTML = ''; flush() })

describe('Table material', () => {
  it('reacts to owner data updates and sorts through the headless instance', () => {
    const [data, setData] = createSignal(records, { ownedWrite: true })
    const host = mount(() => <Table dataSource={data()} columns={columns} pagination={false} />)
    click(host.querySelector('[aria-label="排序 年龄"]')!)
    expect(host.querySelector('tbody tr')?.textContent).toBe('Ben20')
    setData([{ key: 'c', name: 'Chen', age: 10 }]); flush()
    expect(host.querySelector('tbody')?.textContent).toBe('Chen10')
  })
  it('restores native checkboxes when controlled selection is rejected', () => {
    const onChange = vi.fn()
    const host = mount(() => <Table dataSource={records} columns={columns} pagination={false} rowSelection={{ selectedRowKeys: [], onChange }} />)
    const checkbox = host.querySelector<HTMLInputElement>('[aria-label="选择行 a"]')!
    click(checkbox); expect(onChange.mock.calls[0][0]).toEqual(['a']); expect(checkbox.checked).toBe(false)
  })
  it('updates selection and header indeterminate state', () => {
    const host = mount(() => <Table dataSource={records} columns={columns} pagination={false} rowSelection={{}} />)
    click(host.querySelector('[aria-label="选择行 a"]')!)
    expect(host.querySelector<HTMLInputElement>('[aria-label="全选当前页"]')?.indeterminate).toBe(true)
    click(host.querySelector('[aria-label="全选当前页"]')!)
    expect([...host.querySelectorAll<HTMLInputElement>('input[type=checkbox]')].every(input => input.checked)).toBe(true)
  })
  it('renders computed merged cells with real rowspan attributes', () => {
    const host = mount(() => <Table dataSource={records} columns={[{ ...columns[0], onCell: () => ({ rowSpan: 2 }) }, columns[1]]} pagination={false} />)
    expect(host.querySelector('tbody td')?.getAttribute('rowspan')).toBe('2')
    expect(host.querySelectorAll('tbody tr')[1].querySelectorAll('td')).toHaveLength(1)
  })
  it('keeps tree expansion separate from detail eligibility', () => {
    const host = mount(() => <Table dataSource={[{ ...records[0], children: [records[1]] }]} columns={columns} pagination={false} expandable={{ defaultExpandAllRows: true, rowExpandable: row => row.key === 'b', expandedRowRender: row => `详情 ${row.name}` }} />)
    expect(host.textContent).toContain('详情 Ben'); expect(host.textContent).not.toContain('详情 Ada')
    click(host.querySelector('[aria-label="收起行 a"]')!)
    expect(host.querySelectorAll('tbody tr')).toHaveLength(1)
  })
  it('opens filters outside the scrolling table, applies and restores focus', () => {
    const host = mount(() => <Table dataSource={records} columns={[{ ...columns[0], filters: [{ text: 'Ada', value: 'Ada' }], onFilter: (value, record) => value === record.name }]} pagination={false} />)
    const trigger = host.querySelector<HTMLButtonElement>('[aria-label="筛选 姓名"]')!
    click(trigger)
    const dialog = document.querySelector('[role=dialog]')!
    expect(host.contains(dialog)).toBe(false)
    click(dialog.querySelector('input[type=checkbox]')!)
    click(button(dialog, '确定'))
    expect(host.querySelectorAll('tbody tr')).toHaveLength(1)
    expect(host.querySelector('tbody')?.textContent).toBe('Ada')
    expect(document.activeElement).toBe(trigger)
  })
  it('keeps editor focus while typing, displays validation and saves', async () => {
    const save = vi.fn()
    const host = mount(() => <Table dataSource={records} columns={columns} pagination={false} editing={{ validate: row => row.name ? undefined : { name: '必填' }, onSave: save }} />)
    click(button(host, '编辑'))
    const input = host.querySelector<HTMLInputElement>('[aria-label="编辑 姓名"]')!
    input.focus(); input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true })); flush()
    click(button(host, '保存')); await Promise.resolve(); flush()
    expect(host.querySelector('[role=alert]')?.textContent).toBe('必填')
    input.focus(); input.value = 'Alice'; input.dispatchEvent(new Event('input', { bubbles: true })); flush()
    expect(document.activeElement).toBe(input)
    click(button(host, '保存')); await Promise.resolve(); await Promise.resolve(); flush()
    expect(save.mock.calls[0][0].name).toBe('Alice')
    expect(host.querySelector('[aria-label="编辑 姓名"]')).toBeNull()
  })
  it('supports keyboard resizing and exposes the instance', () => {
    let ref!: TableRef<Item>
    const host = mount(() => <Table ref={value => { ref = value }} dataSource={records} columns={columns} pagination={false} />)
    host.querySelector('[role=separator]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); flush()
    expect(ref.table.getState().columnSizing.age).toBe(160)
    expect(ref.nativeElement).toBe(host.firstElementChild)
  })
})
