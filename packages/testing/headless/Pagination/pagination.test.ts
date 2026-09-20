import { createRoot, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPagination } from '../../../competence/src/pagination'

let disposeRoot = () => {}
afterEach(() => { disposeRoot(); flush() })

describe('createPagination', () => {
  // 总页数向上取整，零总数保留一页。
  it('derives totalPages from total and pageSize', () => {
    createRoot((dispose) => {
      disposeRoot = dispose
      const p = createPagination({ total: 95, pageSize: 10 })
      expect(p.totalPages()).toBe(10)
      const p2 = createPagination({ total: 91, pageSize: 10 })
      expect(p2.totalPages()).toBe(10)
      const p3 = createPagination({ total: 0 })
      expect(p3.totalPages()).toBe(1)
      dispose()
    })
  })

  // 越界跳页夹紧，相同页码不重复发事件。
  it('goTo clamps out-of-range pages and fires onChange only on change', () => {
    createRoot((dispose) => {
      disposeRoot = dispose
      const onChange = vi.fn()
      const p = createPagination({ total: 50, onChange })
      p.goTo(0)
      flush()
      expect(p.current()).toBe(1)
      expect(onChange).not.toHaveBeenCalled()

      p.goTo(99)
      flush()
      expect(p.current()).toBe(5)
      expect(onChange).toHaveBeenCalledWith(5, 10)

      p.goTo(5) // same page → no callback
      flush()
      expect(onChange).toHaveBeenCalledTimes(1)
      dispose()
    })
  })

  // 受控页码优先，内部请求不改变显示值。
  it('controlled current wins over internal state', () => {
    createRoot((dispose) => {
      disposeRoot = dispose
      const p = createPagination({ total: 100, current: 3 })
      p.goTo(4)
      flush()
      expect(p.current()).toBe(3) // controlled value wins
      dispose()
    })
  })

  // 上一页与下一页在两端停止。
  it('prev/next respect boundaries', () => {
    createRoot((dispose) => {
      disposeRoot = dispose
      const p = createPagination({ total: 30 }) // 3 pages
      expect(p.hasPrev()).toBe(false)
      p.next()
      flush()
      expect(p.current()).toBe(2)
      p.next()
      flush()
      expect(p.current()).toBe(3)
      expect(p.hasNext()).toBe(false)
      p.next()
      flush()
      expect(p.current()).toBe(3) // stays
      p.prev()
      flush()
      expect(p.current()).toBe(2)
      dispose()
    })
  })

  // 切换容量收敛页码并触发两个事件。
  it('changePageSize shrinks current into the new page count and notifies', () => {
    createRoot((dispose) => {
      disposeRoot = dispose
      const onShowSizeChange = vi.fn()
      const onChange = vi.fn()
      const p = createPagination({ total: 100, defaultCurrent: 8, defaultPageSize: 10, onShowSizeChange, onChange })
      expect(p.current()).toBe(8)
      p.changePageSize(50)
      flush()
      // 100/50 = 2 pages → current clamps from 8 to 2
      expect(p.pageSize()).toBe(50)
      expect(p.current()).toBe(2)
      expect(onShowSizeChange).toHaveBeenCalledWith(2, 50)
      expect(onChange).toHaveBeenCalledWith(2, 50)
      dispose()
    })
  })

  // 禁用阻止跳页与容量修改。
  it('disabled blocks all mutations', () => {
    createRoot((dispose) => {
      disposeRoot = dispose
      const onChange = vi.fn()
      const p = createPagination({ total: 100, disabled: true, onChange })
      p.next()
      p.goTo(5)
      p.changePageSize(20)
      flush()
      expect(p.current()).toBe(1)
      expect(p.pageSize()).toBe(10)
      expect(onChange).not.toHaveBeenCalled()
      dispose()
    })
  })
})

describe('createPagination pageRange', () => {
  // 七页以内全部展示。
  it('renders all pages when total <= 7', () => {
    createRoot((dispose) => {
      disposeRoot = dispose
      const p = createPagination({ total: 70 }) // 7 pages
      expect(p.pageRange()).toEqual([1, 2, 3, 4, 5, 6, 7])
      dispose()
    })
  })

  // 首页仅右侧显示省略号。
  it('first page: ellipsis only on the right', () => {
    createRoot((dispose) => {
      disposeRoot = dispose
      const p = createPagination({ total: 500, defaultCurrent: 1 })
      expect(p.pageRange()).toEqual([1, 2, 3, 4, 5, 'next-ellipsis', 50])
      dispose()
    })
  })

  // 中间页左右均有省略号。
  it('middle page: ellipses on both sides', () => {
    createRoot((dispose) => {
      disposeRoot = dispose
      const p = createPagination({ total: 500, defaultCurrent: 25 })
      expect(p.pageRange()).toEqual([1, 'prev-ellipsis', 24, 25, 26, 'next-ellipsis', 50])
      dispose()
    })
  })

  // 末页仅左侧显示省略号。
  it('last page: ellipsis only on the left', () => {
    createRoot((dispose) => {
      disposeRoot = dispose
      const p = createPagination({ total: 500, defaultCurrent: 50 })
      expect(p.pageRange()).toEqual([1, 'prev-ellipsis', 46, 47, 48, 49, 50])
      dispose()
    })
  })

  // 靠近首页扩大连续页码窗口。
  it('near-first page keeps 2 adjacent (no left ellipsis)', () => {
    createRoot((dispose) => {
      disposeRoot = dispose
      const p = createPagination({ total: 500, defaultCurrent: 3 })
      expect(p.pageRange()).toEqual([1, 2, 3, 4, 5, 'next-ellipsis', 50])
      dispose()
    })
  })

  // 靠近末页扩大连续页码窗口。
  it('near-last page keeps 2 adjacent (no right ellipsis)', () => {
    createRoot((dispose) => {
      disposeRoot = dispose
      const p = createPagination({ total: 500, defaultCurrent: 48 })
      expect(p.pageRange()).toEqual([1, 'prev-ellipsis', 46, 47, 48, 49, 50])
      dispose()
    })
  })
})

describe('createPagination slice API (Table-ready)', () => {
  const items = Array.from({ length: 95 }, (_, i) => i)

  // 数据切片和零基、一基区间相互一致。
  it('slice returns the rows for the current page', () => {
    createRoot((dispose) => {
      disposeRoot = dispose
      const p = createPagination({ total: items.length, defaultCurrent: 3, defaultPageSize: 10 })
      expect(p.slice(items)).toEqual(items.slice(20, 30))
      expect(p.offset()).toBe(20)
      expect(p.rangeFor()).toEqual([20, 30])
      expect(p.itemRange()).toEqual([21, 30])
      dispose()
    })
  })

  // 末页剩余数据不足一页时保持安全范围。
  it('last page slice is length-safe', () => {
    createRoot((dispose) => {
      disposeRoot = dispose
      const p = createPagination({ total: 95, defaultCurrent: 10, defaultPageSize: 10 })
      expect(p.slice(items)).toEqual(items.slice(90, 95))
      expect(p.itemRange()).toEqual([91, 95])
      dispose()
    })
  })

  // 空总数返回空切片与零区间。
  it('empty total yields empty range without negative indices', () => {
    createRoot((dispose) => {
      disposeRoot = dispose
      const p = createPagination({ total: 0 })
      expect(p.rangeFor()).toEqual([0, 0])
      expect(p.itemRange()).toEqual([0, 0])
      expect(p.slice(items)).toEqual([])
      dispose()
    })
  })

  // 非受控跳页同步更新数据切片。
  it('slice tracks goTo reactively', () => {
    createRoot((dispose) => {
      disposeRoot = dispose
      const p = createPagination({ total: 50, defaultCurrent: 1 })
      expect(p.slice(items)).toEqual(items.slice(0, 10))
      p.goTo(3)
      flush()
      expect(p.slice(items)).toEqual(items.slice(20, 30))
      dispose()
    })
  })

  // 数据数组短于声明总数时不会越界读取。
  it('slice clamps when total exceeds the items array (stale data guard)', () => {
    createRoot((dispose) => {
      disposeRoot = dispose
      const p = createPagination({ total: 200, defaultCurrent: 5 }) // claims 200
      const short = Array.from({ length: 30 }, (_, i) => i) // only 30 rows
      // start = 40 > short.length → empty slice, never throws
      expect(p.slice(short)).toEqual([])
      dispose()
    })
  })
})
