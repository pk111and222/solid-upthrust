import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { createMasonry } from './masonry'
import { BREAKPOINTS } from './breakpoint'

type ChangeListener = (event: { matches: boolean }) => void

function createFakeMatchMedia(initial: Record<string, boolean>) {
  const state = { ...initial }
  const listeners = new Map<string, Set<ChangeListener>>()
  return {
    matchMedia: (query: string): MediaQueryList => ({
      get matches() {
        return state[query] ?? false
      },
      addEventListener: (_type: string, listener: ChangeListener) => {
        if (!listeners.has(query)) listeners.set(query, new Set())
        listeners.get(query)!.add(listener)
      },
      removeEventListener: (_type: string, listener: ChangeListener) => {
        listeners.get(query)?.delete(listener)
      },
    }),
    setMatch(query: string, matches: boolean) {
      state[query] = matches
      listeners.get(query)?.forEach((listener) => listener({ matches }))
    },
  }
}

const minWidth = (bp: keyof typeof BREAKPOINTS) => `(min-width: ${BREAKPOINTS[bp]}px)`

describe('createMasonry', () => {
  it('returns a numeric column count directly', () => {
    createRoot((dispose) => {
      const masonry = createMasonry({ columns: 3 })
      expect(masonry.columnCount()).toBe(3)
      expect(masonry.distribute([1, 2, 3, 4]).map((col) => col.length)).toEqual([2, 1, 1])
      dispose()
    })
  })

  it('resolves named breakpoints from initial media state without a flash', () => {
    createRoot((dispose) => {
      const mm = createFakeMatchMedia({ [minWidth('md')]: true, [minWidth('xl')]: false })
      const masonry = createMasonry({ columns: { xs: 1, md: 2, xl: 4 }, matchMedia: mm.matchMedia })
      flush()

      expect(masonry.columnCount()).toBe(2)
      dispose()
    })
  })

  it('follows media query changes across breakpoints', () => {
    createRoot((dispose) => {
      const mm = createFakeMatchMedia({ [minWidth('xs')]: true })
      const masonry = createMasonry({ columns: { xs: 1, md: 2, xl: 4 }, matchMedia: mm.matchMedia })
      flush()

      expect(masonry.columnCount()).toBe(1)

      mm.setMatch(minWidth('xl'), true)
      flush()
      expect(masonry.columnCount()).toBe(4)

      mm.setMatch(minWidth('xl'), false)
      flush()
      mm.setMatch(minWidth('md'), true)
      flush()
      expect(masonry.columnCount()).toBe(2)
      dispose()
    })
  })

  it('re-subscribes when the columns object is replaced with a different key set', () => {
    createRoot((dispose) => {
      const mm = createFakeMatchMedia({ [minWidth('lg')]: true })
      const [columns, setColumns] = createSignal<{ lg?: number; xl?: number }>({ lg: 3 }, { ownedWrite: true })
      const masonry = createMasonry({ get columns() { return columns() }, matchMedia: mm.matchMedia })
      flush()

      expect(masonry.columnCount()).toBe(3)

      // New object identity with a different key set — the old bug kept the stale subscription.
      setColumns({ xl: 6 })
      flush()
      mm.setMatch(minWidth('xl'), true)
      flush()
      expect(masonry.columnCount()).toBe(6)
      dispose()
    })
  })

  it('falls back to the smallest defined breakpoint below all of them', () => {
    createRoot((dispose) => {
      const mm = createFakeMatchMedia({})
      const masonry = createMasonry({ columns: { sm: 2, lg: 5 }, matchMedia: mm.matchMedia })
      flush()

      expect(masonry.columnCount()).toBe(2)
      dispose()
    })
  })

  it('distributes sequentially without leaving trailing columns empty', () => {
    createRoot((dispose) => {
      const masonry = createMasonry({ columns: 5, sequential: true })
      const items = Array.from({ length: 12 }, (_, i) => i)
      const cols = masonry.distribute(items)

      expect(cols.map((col) => col.length)).toEqual([3, 3, 2, 2, 2])
      expect(cols.flat()).toEqual(items)
      dispose()
    })
  })

  it('keeps round-robin distribution for the default mode', () => {
    createRoot((dispose) => {
      const masonry = createMasonry({ columns: 3 })
      const cols = masonry.distribute(['a', 'b', 'c', 'd'])

      expect(cols).toEqual([['a', 'd'], ['b'], ['c']])
      dispose()
    })
  })
})
