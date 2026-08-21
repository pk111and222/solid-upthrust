import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createPagination } from './pagination'

describe('createPagination', () => {
  it('derives totalPages from total and pageSize', () => {
    createRoot((dispose) => {
      const p = createPagination({ total: 95, pageSize: 10 })
      expect(p.totalPages()).toBe(10)
      const p2 = createPagination({ total: 91, pageSize: 10 })
      expect(p2.totalPages()).toBe(10)
      const p3 = createPagination({ total: 0 })
      expect(p3.totalPages()).toBe(1)
      dispose()
    })
  })

  it('goTo clamps out-of-range pages and fires onChange only on change', () => {
    createRoot((dispose) => {
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

  it('controlled current wins over internal state', () => {
    createRoot((dispose) => {
      const p = createPagination({ total: 100, current: 3 })
      p.goTo(4)
      flush()
      expect(p.current()).toBe(3) // controlled value wins
      dispose()
    })
  })

  it('prev/next respect boundaries', () => {
    createRoot((dispose) => {
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

  it('changePageSize shrinks current into the new page count and notifies', () => {
    createRoot((dispose) => {
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

  it('disabled blocks all mutations', () => {
    createRoot((dispose) => {
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
  it('renders all pages when total <= 7', () => {
    createRoot((dispose) => {
      const p = createPagination({ total: 70 }) // 7 pages
      expect(p.pageRange()).toEqual([1, 2, 3, 4, 5, 6, 7])
      dispose()
    })
  })

  it('first page: ellipsis only on the right', () => {
    createRoot((dispose) => {
      const p = createPagination({ total: 500, defaultCurrent: 1 })
      expect(p.pageRange()).toEqual([1, 2, 3, 4, 5, 'next-ellipsis', 50])
      dispose()
    })
  })

  it('middle page: ellipses on both sides', () => {
    createRoot((dispose) => {
      const p = createPagination({ total: 500, defaultCurrent: 25 })
      expect(p.pageRange()).toEqual([1, 'prev-ellipsis', 24, 25, 26, 'next-ellipsis', 50])
      dispose()
    })
  })

  it('last page: ellipsis only on the left', () => {
    createRoot((dispose) => {
      const p = createPagination({ total: 500, defaultCurrent: 50 })
      expect(p.pageRange()).toEqual([1, 'prev-ellipsis', 46, 47, 48, 49, 50])
      dispose()
    })
  })

  it('near-first page keeps 2 adjacent (no left ellipsis)', () => {
    createRoot((dispose) => {
      const p = createPagination({ total: 500, defaultCurrent: 3 })
      expect(p.pageRange()).toEqual([1, 2, 3, 4, 5, 'next-ellipsis', 50])
      dispose()
    })
  })

  it('near-last page keeps 2 adjacent (no right ellipsis)', () => {
    createRoot((dispose) => {
      const p = createPagination({ total: 500, defaultCurrent: 48 })
      expect(p.pageRange()).toEqual([1, 'prev-ellipsis', 46, 47, 48, 49, 50])
      dispose()
    })
  })
})

describe('createPagination slice API (Table-ready)', () => {
  const items = Array.from({ length: 95 }, (_, i) => i)

  it('slice returns the rows for the current page', () => {
    createRoot((dispose) => {
      const p = createPagination({ total: items.length, defaultCurrent: 3, defaultPageSize: 10 })
      expect(p.slice(items)).toEqual(items.slice(20, 30))
      expect(p.offset()).toBe(20)
      expect(p.rangeFor()).toEqual([20, 30])
      expect(p.itemRange()).toEqual([21, 30])
      dispose()
    })
  })

  it('last page slice is length-safe', () => {
    createRoot((dispose) => {
      const p = createPagination({ total: 95, defaultCurrent: 10, defaultPageSize: 10 })
      expect(p.slice(items)).toEqual(items.slice(90, 95))
      expect(p.itemRange()).toEqual([91, 95])
      dispose()
    })
  })

  it('empty total yields empty range without negative indices', () => {
    createRoot((dispose) => {
      const p = createPagination({ total: 0 })
      expect(p.rangeFor()).toEqual([0, 0])
      expect(p.itemRange()).toEqual([0, 0])
      expect(p.slice(items)).toEqual([])
      dispose()
    })
  })

  it('slice tracks goTo reactively', () => {
    createRoot((dispose) => {
      const p = createPagination({ total: 50, defaultCurrent: 1 })
      expect(p.slice(items)).toEqual(items.slice(0, 10))
      p.goTo(3)
      flush()
      expect(p.slice(items)).toEqual(items.slice(20, 30))
      dispose()
    })
  })

  it('slice clamps when total exceeds the items array (stale data guard)', () => {
    createRoot((dispose) => {
      const p = createPagination({ total: 200, defaultCurrent: 5 }) // claims 200
      const short = Array.from({ length: 30 }, (_, i) => i) // only 30 rows
      // start = 40 > short.length → empty slice, never throws
      expect(p.slice(short)).toEqual([])
      dispose()
    })
  })
})
