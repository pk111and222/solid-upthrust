import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createTransfer, type TransferKey } from '../../../competence/src/transfer'
const data = [{ key: 0, title: 'Alpha' }, { key: 1, title: 'Beta', disabled: true }, { key: 2, title: 'Gamma' }, { key: 3, title: 'Delta' }]
const step = (fn: () => void) => { fn(); flush() }
const withRoot = (run: () => void) => {
  let dispose = () => {}
  try { createRoot(cleanup => { dispose = cleanup; run() }) } finally { dispose() }
}

describe('Transfer', () => {
  // 移入移回只处理可移动项，并保留未知目标键及未移动的临时勾选。
  it('moves selected enabled items once, preserves unknown target keys and clears only moved selection', () => withRoot(() => {
    const change = vi.fn(), selection = vi.fn()
    const transfer = createTransfer({ dataSource: data, defaultTargetKeys: [3, 99], defaultSelectedKeys: [0, 1, 3], onChange: change, onSelectChange: selection })
    step(() => transfer.move('right'))
    expect(transfer.targetKeys()).toEqual([3, 99, 0])
    expect(transfer.selectedKeys()).toEqual([1, 3])
    expect(change).toHaveBeenCalledWith([3, 99, 0], 'right', [0])
    expect(selection).toHaveBeenCalledWith([1], [3])
    step(() => transfer.move('left'))
    expect(transfer.targetKeys()).toEqual([99, 0])
    expect(transfer.items('right').map(item => item.key)).toEqual([0])
  }))
  // 受控目标和勾选列表只报告变更意图，未写回时状态保持原值。
  it('keeps target membership and selection authoritative in controlled mode', () => withRoot(() => {
    const change = vi.fn(), selection = vi.fn()
    const transfer = createTransfer({ dataSource: data, targetKeys: [], selectedKeys: [0], onChange: change, onSelectChange: selection })
    step(() => transfer.move('right'))
    expect(transfer.targetKeys()).toEqual([]); expect(transfer.selectedKeys()).toEqual([0])
    expect(change).toHaveBeenCalledWith([0], 'right', [0]); expect(selection).toHaveBeenCalledWith([], [])
  }))
  // 父层分别写回目标键与勾选键后，双向受控状态应同步。
  it('round-trips controlled values through both callbacks', () => withRoot(() => {
    const [target, setTarget] = createSignal<TransferKey[]>([], { ownedWrite: true })
    const [selected, setSelected] = createSignal<TransferKey[]>([], { ownedWrite: true })
    const transfer = createTransfer({ dataSource: data, get targetKeys() { return target() }, get selectedKeys() { return selected() }, onChange: setTarget, onSelectChange: (left, right) => setSelected([...left, ...right]) })
    step(() => transfer.toggleSelect(0)); step(() => transfer.move('right'))
    expect(target()).toEqual([0]); expect(selected()).toEqual([])
  }))
  // 全选只处理筛选命中的可用项，保留隐藏选择并计算半选状态。
  it('selects only search matches, keeps hidden selections, and excludes disabled rows from all/partial state', () => withRoot(() => {
    const transfer = createTransfer({ dataSource: data, defaultSelectedKeys: [2] })
    expect(transfer.selectionState('left').indeterminate).toBe(true)
    step(() => transfer.setSearch('left', 'alp'))
    step(() => transfer.selectAll('left', true))
    expect(transfer.selectedKeys()).toEqual([2, 0]); expect(transfer.selectionState('left').checked).toBe(true)
    step(() => transfer.selectAll('left', false)); expect(transfer.selectedKeys()).toEqual([2])
    step(() => transfer.setSearch('left', ''))
    step(() => transfer.selectAll('left', true)); expect(transfer.selectedKeys().sort()).toEqual([0, 2, 3])
    expect(transfer.selectionState('left')).toEqual({ checked: true, indeterminate: false, disabled: false })
  }))
  // 整体禁用、缺失键与空移动不得改变状态或触发移动回调。
  it('disables all mutation paths, ignores missing keys and emits no empty moves', () => withRoot(() => {
    const change = vi.fn()
    const transfer = createTransfer({ dataSource: data, disabled: true, defaultTargetKeys: [3], defaultSelectedKeys: [0, 3], onChange: change })
    step(() => { transfer.toggleSelect(0); transfer.selectAll('left', true); transfer.move('right'); transfer.remove(3) })
    expect(transfer.targetKeys()).toEqual([3]); expect(transfer.selectedKeys()).toEqual([0, 3]); expect(change).not.toHaveBeenCalled()
    const empty = createTransfer({ dataSource: data, onChange: change })
    step(() => { empty.toggleSelect(999); empty.toggleSelect(1); empty.move('right') })
    expect(empty.selectedKeys()).toEqual([]); expect(change).not.toHaveBeenCalled()
  }))
  // 单向模式阻断批量移回，同时允许右侧逐项移除。
  it('oneWay suppresses reverse bulk moves but allows individual removal', () => withRoot(() => {
    const transfer = createTransfer({ dataSource: data, oneWay: true, defaultTargetKeys: [1, 3], defaultSelectedKeys: [3] })
    step(() => transfer.move('left')); expect(transfer.targetKeys()).toEqual([1, 3])
    step(() => transfer.remove(1)); expect(transfer.targetKeys()).toEqual([1, 3])
    step(() => transfer.remove(3)); expect(transfer.targetKeys()).toEqual([1])
  }))
  // 数据源变化需重算可见行，数字零键不会被当作空值。
  it('recomputes lists when data changes and supports numeric zero keys', () => withRoot(() => {
    const [source, setSource] = createSignal(data, { ownedWrite: true })
    const transfer = createTransfer({ get dataSource() { return source() }, defaultTargetKeys: [0] })
    expect(transfer.items('right')[0].title).toBe('Alpha')
    step(() => setSource(data.filter(item => item.key !== 0)))
    expect(transfer.items('right')).toEqual([])
    expect(transfer.targetKeys()).toEqual([0])
  }))
  // 左右搜索互不影响，自定义过滤器及回调应收到原始查询。
  it('keeps searches independent and supports a custom matcher', () => withRoot(() => {
    const onSearch = vi.fn()
    const transfer = createTransfer({ dataSource: data, defaultTargetKeys: [3], filterOption: (query, item) => String(item.key) === query, onSearch })
    step(() => transfer.setSearch('left', '0'))
    expect(transfer.filteredItems('left').map(item => item.key)).toEqual([0])
    expect(transfer.filteredItems('right').map(item => item.key)).toEqual([3])
    expect(onSearch).toHaveBeenCalledWith('left', '0')
  }))
})
