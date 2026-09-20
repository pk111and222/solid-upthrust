import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { createPagination } from '../../../competence/src/pagination'
let dispose = () => {}
afterEach(() => { dispose(); flush() })
// 总数与受控容量动态改变时，有效页码和展示区间不能越界。
it('[pagination.range.dynamic] clamps effective current without emitting', () => {
  createRoot(d => {
    dispose = d
    const [total, setTotal] = createSignal(100, { ownedWrite: true })
    const onChange = vi.fn()
    const p = createPagination({ get total() { return total() }, defaultCurrent: 8, onChange })
    setTotal(12); flush()
    expect(p.current()).toBe(2)
    expect(p.itemRange()).toEqual([11, 12])
    setTotal(0); flush()
    expect(p.current()).toBe(1)
    expect(p.rangeFor()).toEqual([0, 0])
    expect(onChange).not.toHaveBeenCalled()
  })
})
// 非有限数、小数和无效容量不会污染页码或生成无限页码列表。
it('[pagination.numeric.boundaries] sanitizes props and rejects invalid commands', () => {
  createRoot(d => {
    dispose = d
    const p = createPagination({ total: 95, defaultCurrent: -2, defaultPageSize: 0 })
    expect(p.current()).toBe(1); expect(p.pageSize()).toBe(10)
    p.goTo(NaN); p.goTo(2.5); p.changePageSize(0); p.changePageSize(Infinity); flush()
    expect(p.current()).toBe(1); expect(p.pageSize()).toBe(10)
    const empty = createPagination({ total: Infinity })
    expect(empty.pageRange()).toEqual([1])
  })
})
// 双受控回调按容量事件、分页事件顺序发出，父级更新前状态不漂移。
it('[pagination.controlled.size] preserves state and callback order', () => {
  createRoot(d => {
    dispose = d
    const [current, setCurrent] = createSignal(8, { ownedWrite: true })
    const [size, setSize] = createSignal(10, { ownedWrite: true })
    const calls: string[] = []
    const p = createPagination({ total: 100, get current() { return current() }, get pageSize() { return size() },
      onShowSizeChange: (c, s) => calls.push(`size:${c}:${s}`), onChange: (c, s) => calls.push(`page:${c}:${s}`) })
    p.changePageSize(50); flush()
    expect([p.current(), p.pageSize()]).toEqual([8, 10])
    expect(calls).toEqual(['size:2:50', 'page:2:50'])
    setCurrent(2); setSize(50); flush()
    expect(p.itemRange()).toEqual([51, 100])
    p.changePageSize(50); expect(calls).toHaveLength(2)
    p.refs.prev(); flush(); expect(p.current()).toBe(2)
    expect(calls.at(-1)).toBe('page:1:50')
  })
})
