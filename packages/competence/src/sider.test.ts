import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createSider } from './sider'
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

const mdQuery = `(max-width: ${BREAKPOINTS.md - 0.02}px)`

describe('createSider', () => {
  it('defaults to expanded and honors defaultCollapsed', () => {
    createRoot((dispose) => {
      expect(createSider({}).collapsed()).toBe(false)
      expect(createSider({ defaultCollapsed: true }).collapsed()).toBe(true)
      dispose()
    })
  })

  it('prefers the controlled collapsed prop and reports clickTrigger toggles', () => {
    createRoot((dispose) => {
      const onCollapse = vi.fn()
      const sider = createSider({ collapsed: true, onCollapse })

      expect(sider.collapsed()).toBe(true)
      sider.toggle()
      flush()
      expect(sider.collapsed()).toBe(true) // controlled value wins
      expect(onCollapse).toHaveBeenCalledWith(false, 'clickTrigger')
      dispose()
    })
  })

  it('toggles internal state and fires onCollapse', () => {
    createRoot((dispose) => {
      const onCollapse = vi.fn()
      const sider = createSider({ onCollapse })

      sider.toggle()
      flush()
      expect(sider.collapsed()).toBe(true)
      sider.toggle()
      flush()
      expect(sider.collapsed()).toBe(false)
      expect(onCollapse).toHaveBeenNthCalledWith(1, true, 'clickTrigger')
      expect(onCollapse).toHaveBeenNthCalledWith(2, false, 'clickTrigger')
      dispose()
    })
  })

  it('collapses and restores from breakpoint media query changes', () => {
    createRoot((dispose) => {
      const mm = createFakeMatchMedia({ [mdQuery]: false })
      const onCollapse = vi.fn()
      const onBreakpoint = vi.fn()
      const sider = createSider({ breakpoint: 'md', onCollapse, onBreakpoint, matchMedia: mm.matchMedia })
      flush()

      expect(sider.broken()).toBe(false)
      expect(sider.collapsed()).toBe(false)

      mm.setMatch(mdQuery, true)
      flush()
      expect(sider.broken()).toBe(true)
      expect(sider.collapsed()).toBe(true)
      expect(onBreakpoint).toHaveBeenCalledWith(true)
      expect(onCollapse).toHaveBeenCalledWith(true, 'breakpoint')

      mm.setMatch(mdQuery, false)
      flush()
      expect(sider.broken()).toBe(false)
      expect(sider.collapsed()).toBe(false)
      expect(onCollapse).toHaveBeenLastCalledWith(false, 'breakpoint')
      dispose()
    })
  })

  it('applies the initial broken state synchronously', () => {
    createRoot((dispose) => {
      const mm = createFakeMatchMedia({ [mdQuery]: true })
      const sider = createSider({ breakpoint: 'md', matchMedia: mm.matchMedia })
      flush()

      expect(sider.broken()).toBe(true)
      expect(sider.collapsed()).toBe(true)
      dispose()
    })
  })
})
