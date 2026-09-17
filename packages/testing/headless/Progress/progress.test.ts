import { createRoot, flush } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { createProgress, clampPercent, circlePath } from '../../../competence/src/progress'

describe('clampPercent (pure)', () => {
  it('clamps to 0–100 and defaults 0', () => {
    expect(clampPercent(undefined)).toBe(0)
    expect(clampPercent(-10)).toBe(0)
    expect(clampPercent(150)).toBe(100)
    expect(clampPercent(42)).toBe(42)
  })
})

describe('circlePath (pure)', () => {
  it('draws a closed four-arc circle from the top', () => {
    const p = circlePath(47)
    expect(p).toContain('M 50,3')
    // Four exact quarter arcs (no degenerate cx-0.01 hack).
    expect((p.match(/A 47,47 0 0 1/g) || []).length).toBe(4)
    expect(p.endsWith('Z')).toBe(true)
  })
})

describe('createProgress', () => {
  it('derives success status at 100%', () => {
    createRoot((dispose) => {
      const p = createProgress({ percent: 100 })
      flush()
      expect(p.status()).toBe('success')
      dispose()
    })
  })

  it('keeps normal status below 100%', () => {
    createRoot((dispose) => {
      const p = createProgress({ percent: 60 })
      flush()
      expect(p.status()).toBe('normal')
      dispose()
    })
  })

  it('explicit status wins over derivation', () => {
    createRoot((dispose) => {
      const p = createProgress({ percent: 100, status: 'exception' })
      flush()
      expect(p.status()).toBe('exception')
      dispose()
    })
  })

  it('clamps out-of-range percent', () => {
    createRoot((dispose) => {
      const p = createProgress({ percent: 300 })
      flush()
      expect(p.percent()).toBe(100)
      dispose()
    })
  })

  it('circle geometry: circumference and offset math', () => {
    createRoot((dispose) => {
      const p = createProgress({ percent: 25, strokeWidth: 6 })
      flush()
      const g = p.circleGeometry()
      expect(g.radius).toBe(47)
      // 2π×47 ≈ 295.31
      expect(g.circumference).toBeCloseTo(295.31, 1)
      // 25% shown → 75% of the circumference left as offset
      expect(g.offset).toBeCloseTo(295.31 * 0.75, 0)
      dispose()
    })
  })

  it('steps: maps percent to step index', () => {
    createRoot((dispose) => {
      const p = createProgress({ percent: 50, steps: 5 })
      flush()
      expect(p.stepIndex()).toBe(2)
      const full = createProgress({ percent: 100, steps: 3 })
      flush()
      expect(full.stepIndex()).toBe(3)
      dispose()
    })
  })

  it('success percent is clamped too', () => {
    createRoot((dispose) => {
      const p = createProgress({ percent: 50, success: { percent: 120 } })
      flush()
      expect(p.successPercent()).toBe(100)
      dispose()
    })
  })
})
