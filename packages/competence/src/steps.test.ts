import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createSteps } from './steps'

describe('createSteps status derivation', () => {
  it('derives finish/process/wait from current', () => {
    createRoot((dispose) => {
      const s = createSteps({ current: 1, items: [{ title: 'a' }, { title: 'b' }, { title: 'c' }] })
      expect(s.getStepStatus(0)).toBe('finish')
      expect(s.getStepStatus(1)).toBe('process')
      expect(s.getStepStatus(2)).toBe('wait')
      expect(s.isFinish(0)).toBe(true)
      expect(s.isProcess(1)).toBe(true)
      expect(s.isError(1)).toBe(false)
      dispose()
    })
  })

  it('per-item status overrides derivation', () => {
    createRoot((dispose) => {
      const s = createSteps({
        current: 1,
        items: [
          { title: 'a', status: 'error' },
          { title: 'b' },
        ],
      })
      expect(s.getStepStatus(0)).toBe('error')
      expect(s.getStepStatus(1)).toBe('process')
      dispose()
    })
  })

  it('config.status overrides the current step status', () => {
    createRoot((dispose) => {
      const s = createSteps({ current: 1, status: 'error', items: [{ title: 'a' }, { title: 'b' }] })
      expect(s.getStepStatus(1)).toBe('error')
      dispose()
    })
  })
})

describe('createSteps navigation', () => {
  it('next/prev move within bounds and fire onChange', () => {
    createRoot((dispose) => {
      const onChange = vi.fn()
      const s = createSteps({ items: [{ title: 'a' }, { title: 'b' }, { title: 'c' }], onChange })
      s.next()
      flush()
      expect(s.current()).toBe(1)
      expect(onChange).toHaveBeenCalledWith(1)
      s.prev()
      flush()
      expect(s.current()).toBe(0)
      s.prev() // below zero — guard blocks, no callback
      flush()
      expect(s.current()).toBe(0)
      expect(onChange).toHaveBeenCalledTimes(2)
      dispose()
    })
  })

  it('controlled current wins over internal state', () => {
    createRoot((dispose) => {
      const s = createSteps({ current: 2, items: [{ title: 'a' }, { title: 'b' }, { title: 'c' }] })
      s.next()
      flush()
      expect(s.current()).toBe(2)
      dispose()
    })
  })

  it('uncontrolled mode starts at 0 and navigates internally', () => {
    createRoot((dispose) => {
      const s = createSteps({ items: [{ title: 'a' }, { title: 'b' }] })
      expect(s.current()).toBe(0)
      s.next()
      flush()
      expect(s.current()).toBe(1)
      dispose()
    })
  })

  it('goTo skips nothing but blocks disabled steps', () => {
    createRoot((dispose) => {
      const s = createSteps({
        items: [{ title: 'a' }, { title: 'b', disabled: true }, { title: 'c' }],
      })
      s.goTo(1)
      flush()
      expect(s.current()).toBe(0) // disabled blocked
      s.goTo(2)
      flush()
      expect(s.current()).toBe(2) // goTo itself allows free jump
      dispose()
    })
  })

  it('navigateTo honors the click guard: no forward jumps over unfinished steps', () => {
    createRoot((dispose) => {
      const s = createSteps({ items: [{ title: 'a' }, { title: 'b' }, { title: 'c' }] })
      expect(s.canGoTo(2)).toBe(false) // two ahead — blocked
      expect(s.canGoTo(1)).toBe(true)  // one ahead — natural next
      expect(s.canGoTo(0)).toBe(true)  // current — ok
      s.navigateTo(2) // blocked by guard
      flush()
      expect(s.current()).toBe(0)
      s.navigateTo(1) // allowed
      flush()
      expect(s.current()).toBe(1)
      // now at 1: back to 0 allowed, jumping to 2 allowed (cur+1)
      expect(s.canGoTo(0)).toBe(true)
      expect(s.canGoTo(2)).toBe(true)
      expect(s.canGoTo(3)).toBe(false) // out of range
      dispose()
    })
  })

  it('clickNavigable=false allows free navigation', () => {
    createRoot((dispose) => {
      const s = createSteps({ clickNavigable: false, items: [{ title: 'a' }, { title: 'b' }, { title: 'c' }] })
      expect(s.canGoTo(2)).toBe(true)
      s.navigateTo(2)
      flush()
      expect(s.current()).toBe(2)
      dispose()
    })
  })

  it('reset returns to the first step', () => {
    createRoot((dispose) => {
      const onChange = vi.fn()
      const s = createSteps({ items: [{ title: 'a' }, { title: 'b' }, { title: 'c' }], onChange })
      s.goTo(2)
      flush()
      expect(s.current()).toBe(2)
      s.reset()
      flush()
      expect(s.current()).toBe(0)
      expect(onChange).toHaveBeenCalledWith(0)
      dispose()
    })
  })

  it('next skips disabled steps via the guard path', () => {
    createRoot((dispose) => {
      const s = createSteps({
        items: [{ title: 'a' }, { title: 'b', disabled: true }, { title: 'c' }],
      })
      s.next() // cur+1 is disabled → canGoTo false → stays
      flush()
      expect(s.current()).toBe(0)
      dispose()
    })
  })
})

describe('createSteps percent', () => {
  it('blends current step percent into overall progress', () => {
    createRoot((dispose) => {
      const s = createSteps({ current: 1, percent: 50, items: [{ title: 'a' }, { title: 'b' }, { title: 'c' }, { title: 'd' }] })
      // (1 + 0.5) / 4 = 37.5 → 38
      expect(s.percentOf()).toBe(38)
      dispose()
    })
  })

  it('without percent the current step contributes 0', () => {
    createRoot((dispose) => {
      const s = createSteps({ current: 2, items: [{ title: 'a' }, { title: 'b' }, { title: 'c' }] })
      // 2/3 = 66.67 → 67
      expect(s.percentOf()).toBe(67)
      dispose()
    })
  })

  it('clamps out-of-range percent', () => {
    createRoot((dispose) => {
      const s = createSteps({ current: 0, percent: 200, items: [{ title: 'a' }, { title: 'b' }] })
      // (0 + 1) / 2 = 50
      expect(s.percentOf()).toBe(50)
      dispose()
    })
  })

  it('empty items yield 0', () => {
    createRoot((dispose) => {
      const s = createSteps({ items: [] })
      expect(s.percentOf()).toBe(0)
      expect(s.total()).toBe(0)
      dispose()
    })
  })
})
