import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { createList, type ListScrollToConfig } from './list'

const makeItems = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: i, name: `item-${i}` }))

const setup = (items: { id: number; name: string }[], opts?: Parameters<typeof createList>[0]) =>
  createList({
    items: () => items,
    rowKey: (item) => item.id,
    ...opts,
  })

describe('createList — row tree', () => {
  it('expands plain items to item rows', () => {
    createRoot((dispose) => {
      const list = setup(makeItems(3))
      const rows = list.rows()
      expect(rows).toHaveLength(3)
      expect(rows.map((r) => r.kind)).toEqual(['item', 'item', 'item'])
      expect(rows[2]).toMatchObject({ row: 2, index: 2, item: { id: 2 } })
      dispose()
    })
  })

  it('expands grouped items with a header before each group run', () => {
    createRoot((dispose) => {
      const [items] = createSignal([
        { id: 1, g: 'a' },
        { id: 2, g: 'a' },
        { id: 3, g: 'b' },
      ])
      const list = createList({
        items: () => items(),
        rowKey: (i: { id: number }) => i.id,
        group: () => ({ key: (i: { g: string }) => i.g }),
      })
      const rows = list.rows()
      // header(a) item item header(b) item
      expect(rows.map((r) => r.kind)).toEqual(['groupHeader', 'item', 'item', 'groupHeader', 'item'])
      expect(rows[0].groupItems).toHaveLength(2)
      expect(rows[3].groupItems).toHaveLength(1)
      // source-array indices skip headers
      expect(rows[1].index).toBe(0)
      expect(rows[2].index).toBe(1)
      expect(rows[4].index).toBe(2)
      dispose()
    })
  })

  it('creates separate groups for scattered same-key runs', () => {
    createRoot((dispose) => {
      const list = createList({
        items: () => [
          { id: 1, g: 'a' },
          { id: 2, g: 'b' },
          { id: 3, g: 'a' },
        ],
        group: () => ({ key: (i: { g: string }) => i.g }),
      })
      expect(list.rows().filter((r) => r.kind === 'groupHeader')).toHaveLength(3)
      dispose()
    })
  })
})

describe('createList — heights & prefix sums', () => {
  it('estimates uniform item heights (default 44)', () => {
    createRoot((dispose) => {
      const list = setup(makeItems(10))
      flush()
      expect(list.totalHeight()).toBe(440)
      expect(list.rowTop(3)).toBe(132)
      dispose()
    })
  })

  it('estimates group headers at their own height', () => {
    createRoot((dispose) => {
      const list = createList({
        items: () => [
          { id: 1, g: 'a' },
          { id: 2, g: 'a' },
          { id: 3, g: 'b' },
        ],
        group: () => ({ key: (i: { g: string }) => i.g }),
        estimateGroupHeaderHeight: 30,
        estimateRowHeight: 40,
      })
      flush()
      // header 30 + item 40 + item 40 + header 30 + item 40
      expect(list.totalHeight()).toBe(180)
      expect(list.rowTop(3)).toBe(110)
      dispose()
    })
  })

  it('corrects estimates with measured heights and resums lazily', () => {
    createRoot((dispose) => {
      const list = setup(makeItems(5))
      flush()
      expect(list.totalHeight()).toBe(220)
      expect(list.setRowHeight(0, 100)).toBe(true)
      flush()
      expect(list.totalHeight()).toBe(100 + 4 * 44)
      expect(list.rowTop(1)).toBe(100)
      dispose()
    })
  })

  it('ignores epsilon-level measurement noise', () => {
    createRoot((dispose) => {
      const list = setup(makeItems(5))
      flush()
      expect(list.setRowHeight(0, 44.3)).toBe(false)
      expect(list.totalHeight()).toBe(220)
      dispose()
    })
  })

  it('keeps measured heights through append-only growth (infinite loading)', () => {
    // The append must happen while the root is ALIVE (the identity effect
    // compares old/new rows); Solid 2 forbids plain signal writes inside
    // createRoot, so the mutation rides a microtask that runs after the
    // synchronous root body but before dispose.
    createRoot(() => {
      const [items, setItems] = createSignal(makeItems(3))
      const list = createList({ items: () => items(), rowKey: (i: { id: number }) => i.id })
      flush()
      list.setRowHeight(0, 100)
      flush()
      expect(list.totalHeight()).toBe(100 + 2 * 44)
      queueMicrotask(() => {
        setItems([...items(), ...makeItems(2).map((i) => ({ ...i, id: i.id + 100 }))])
        flush()
        // prior measured height survives the append-only growth
        expect(list.rowHeight(0)).toBe(100)
        expect(list.totalHeight()).toBe(100 + 4 * 44)
        expect(list.rows()).toHaveLength(5)
      })
    })
    return new Promise((r) => setTimeout(r, 0))
  })

  it('drops measured heights on wholesale items swap', () => {
    // The swap happens while the root is ALIVE (real usage: items signal
    // flips from an event handler, the list keeps rendering). Disposing the
    // root first would tear down the identity effect and the cache check
    // would trivially pass for the wrong reason.
    createRoot(() => {
      const [items, setItems] = createSignal(makeItems(3))
      const list = createList({ items: () => items(), rowKey: (i: { id: number }) => i.id })
      flush()
      list.setRowHeight(0, 100)
      flush()
      expect(list.totalHeight()).toBe(100 + 2 * 44)
      // Same length, brand-new objects → wholesale swap, not append.
      // Solid 2: the signal write must happen outside the owned root.
      queueMicrotask(() => {
        setItems(makeItems(3))
        flush()
        expect(list.totalHeight()).toBe(3 * 44)
        expect(list.rowHeight(0)).toBe(44)
      })
    })
    return new Promise((r) => setTimeout(r, 0))
  })
})

describe('createList — visible window', () => {
  it('renders the head before the viewport is measured', () => {
    createRoot((dispose) => {
      const list = setup(makeItems(100))
      flush()
      expect(list.visibleRange()).toEqual([0, 6]) // overscan 5 + 1
      dispose()
    })
  })

  it('derives the window from scrollTop + viewport with overscan', () => {
    createRoot((dispose) => {
      const list = setup(makeItems(100))
      flush()
      list.setViewport(200) // ~4.5 rows of 44px
      list.setScrollTop(440) // row 10 exactly
      flush()
      const [start, end] = list.visibleRange()
      // first row fully past 440 is row 10; rows 10..14 cover the viewport
      expect(start).toBe(5) // 10 - 5 overscan
      expect(end).toBe(20) // 15 + 5
      dispose()
    })
  })

  it('clamps the window at both list ends', () => {
    createRoot((dispose) => {
      const list = setup(makeItems(10))
      flush()
      list.setViewport(200)
      list.setScrollTop(10000) // beyond the end
      flush()
      expect(list.visibleRange()).toEqual([0, 10])
      dispose()
    })
  })

  it('handles binary search with variable measured heights', () => {
    createRoot((dispose) => {
      const list = setup(makeItems(10))
      flush()
      // row0=10, row1=20, rest 44
      list.setRowHeight(0, 10)
      list.setRowHeight(1, 20)
      flush()
      list.setViewport(100)
      list.setScrollTop(30) // row2 (offsets: 0,10,30,74,...)
      flush()
      const [start, end] = list.visibleRange()
      expect(start).toBeLessThanOrEqual(2)
      expect(end).toBeGreaterThan(2)
      // rowTop honours the corrected prefix sums
      expect(list.rowTop(2)).toBe(30)
      dispose()
    })
  })
})

describe('createList — key lookups & scrollTo', () => {
  it('finds a row by item key (skipping group headers)', () => {
    createRoot((dispose) => {
      const list = createList({
        items: () => [
          { id: 1, g: 'a' },
          { id: 2, g: 'a' },
          { id: 3, g: 'b' },
        ],
        rowKey: (i: { id: number }) => i.id,
        group: () => ({ key: (i: { g: string }) => i.g }),
      })
      flush()
      expect(list.rowIndexOfKey(2)).toBe(2) // header, item1, item2
      expect(list.rowIndexOfKey(999)).toBe(-1)
      expect(list.rowIndexOfGroupKey('b')).toBe(3)
      dispose()
    })
  })

  it('scrollTo(number) returns the clamped pixel offset', () => {
    createRoot((dispose) => {
      const list = setup(makeItems(10))
      flush()
      expect(list.resolveScrollTo(500)).toBe(500)
      expect(list.resolveScrollTo(-3)).toBe(0)
      dispose()
    })
  })

  it('scrollTo({key, align}) math against measured heights', () => {
    createRoot((dispose) => {
      const list = setup(makeItems(20))
      flush()
      list.setViewport(100)
      // rows 0..4 measured at 100 each, rest estimated
      for (let i = 0; i < 5; i++) list.setRowHeight(i, 100)
      flush()
      // After 5 measurements the learned estimate (100) also applies to
      // unmeasured rows — every row is now 100 tall.
      // key 6 → row 6, top = 6*100 = 600
      expect(list.resolveScrollTo({ key: 6, align: 'top' })).toBe(600)
      // align bottom: bottom edge at viewport bottom → 600 + 100 - 100 = 600
      expect(list.resolveScrollTo({ key: 6, align: 'bottom' })).toBe(600)
      // offset applied after alignment
      expect(list.resolveScrollTo({ key: 6, align: 'top', offset: 10 })).toBe(610)
      dispose()
    })
  })

  it('scrollTo auto: no-op when in view, nearest edge when out', () => {
    createRoot((dispose) => {
      const list = setup(makeItems(20))
      flush()
      list.setViewport(200)
      for (let i = 0; i < 5; i++) list.setRowHeight(i, 100)
      flush()
      list.setScrollTop(100) // rows 1..~3 in view
      flush()
      // Learned estimate: all rows 100. row 2 (top 200, bottom 300) is
      // within [100, 300]
      expect(list.resolveScrollTo({ key: 2, align: 'auto' })).toBeNaN()
      // row 0 is above: align its top to the viewport top
      expect(list.resolveScrollTo({ key: 0, align: 'auto' })).toBe(0)
      // row 8 (top 800) is below: align its bottom edge to the viewport bottom
      expect(list.resolveScrollTo({ key: 8, align: 'auto' })).toBe(800 + 100 - 200)
      dispose()
    })
  })

  it('scrollTo groupKey resolves the header row', () => {
    createRoot((dispose) => {
      const list = createList({
        items: () => [
          { id: 1, g: 'a' },
          { id: 2, g: 'a' },
          { id: 3, g: 'b' },
          { id: 4, g: 'b' },
        ],
        rowKey: (i: { id: number }) => i.id,
        group: () => ({ key: (i: { g: string }) => i.g }),
        estimateRowHeight: 50,
        estimateGroupHeaderHeight: 30,
      })
      flush()
      // header(b) top = 30 + 50 + 50 = 130
      expect(list.resolveScrollTo({ groupKey: 'b', align: 'top' })).toBe(130)
      expect(list.resolveScrollTo({ groupKey: 'zzz', align: 'top' })).toBeNaN()
      dispose()
    })
  })

  it('scrollTo {top,left} shape returns top', () => {
    createRoot((dispose) => {
      const list = setup(makeItems(5))
      flush()
      const cfg: ListScrollToConfig = { top: 77 }
      expect(list.resolveScrollTo(cfg)).toBe(77)
      dispose()
    })
  })
})

describe('createList — spacer paddings', () => {
  it('pads above and below the visible slice to fill total height', () => {
    createRoot((dispose) => {
      const list = setup(makeItems(100))
      flush()
      list.setViewport(176) // 4 rows
      list.setScrollTop(44 * 10) // row 10
      flush()
      const [start, end] = list.visibleRange()
      const [padTop, padBottom] = list.spacerPadding()
      expect(padTop).toBe(44 * start)
      expect(padBottom).toBe(44 * 100 - 44 * end)
      dispose()
    })
  })
})

describe('createList — 10k smoke', () => {
  it('binary-searches 10k rows instantly with stable windows', () => {
    createRoot((dispose) => {
      const items = makeItems(10000)
      const list = setup(items)
      flush()
      list.setViewport(600)
      for (const top of [0, 100_000, 220_000, 440_000 - 1]) {
        list.setScrollTop(top)
        flush()
        const [start, end] = list.visibleRange()
        expect(end - start).toBeLessThanOrEqual(600 / 44 + 2 + 10)
        expect(start).toBeGreaterThanOrEqual(0)
        expect(end).toBeLessThanOrEqual(10000)
        expect(list.rowTop(start)).toBeLessThanOrEqual(top + 44)
      }
      expect(list.totalHeight()).toBe(440_000)
      dispose()
    })
  })
})
