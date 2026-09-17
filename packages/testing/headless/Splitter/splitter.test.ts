import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createSplitter } from '../../../competence/src/splitter'

const registerPanels = (splitter: ReturnType<typeof createSplitter>, panels: Parameters<typeof splitter.register>[0][]) =>
  panels.map((panel) => splitter.register(panel))

describe('createSplitter', () => {
  it('normalizes mixed px / percent defaultSize against the container', () => {
    createRoot((dispose) => {
      const splitter = createSplitter({})
      registerPanels(splitter, [{ defaultSize: 200 }, { defaultSize: '50%' }, {}])
      expect(splitter.sizes()).toEqual([])

      splitter.setContainerSize(1000)
      flush()
      // 200 fixed + 500 (50%) -> remaining 300 for the flex panel.
      expect(splitter.sizes()).toEqual([200, 500, 300])
      dispose()
    })
  })

  it('splits evenly when no defaultSize is given', () => {
    createRoot((dispose) => {
      const splitter = createSplitter({})
      registerPanels(splitter, [{}, {}])
      splitter.setContainerSize(800)
      flush()
      expect(splitter.sizes()).toEqual([400, 400])
      dispose()
    })
  })

  it('keeps the pair sum strictly constant while dragging (500 random deltas)', () => {
    createRoot((dispose) => {
      const splitter = createSplitter({})
      registerPanels(splitter, [{ min: 50 }, { max: '80%' }])
      splitter.setContainerSize(1000)
      flush()

      let seed = 42
      const random = () => {
        seed = (seed * 1103515245 + 12345) % 2147483648
        return seed / 2147483648
      }
      let lastSum = splitter.sizes().reduce((s, v) => s + v, 0)
      for (let i = 0; i < 500; i++) {
        splitter.resizeBy(0, (random() - 0.5) * 400)
        flush()
        const sum = splitter.sizes().reduce((s, v) => s + v, 0)
        expect(Math.abs(sum - lastSum)).toBeLessThan(1e-6)
        lastSum = sum
      }
      dispose()
    })
  })

  it('clamps to min and max constraints and compensates the neighbor', () => {
    createRoot((dispose) => {
      const splitter = createSplitter({})
      registerPanels(splitter, [{ min: 200 }, { min: 100 }])
      splitter.setContainerSize(1000)
      flush()

      // Dragging far left hits panel 0's min; panel 1 absorbs the rest.
      expect(splitter.resizeBy(0, -1000)).toBe(true)
      flush()
      expect(splitter.sizes()).toEqual([200, 800])

      // Dragging far right hits panel 1's min; panel 0 stops at 900.
      expect(splitter.resizeBy(0, 1000)).toBe(true)
      flush()
      expect(splitter.sizes()).toEqual([900, 100])
      dispose()
    })
  })

  it('never violates min/max, even under extreme deltas', () => {
    createRoot((dispose) => {
      const splitter = createSplitter({})
      registerPanels(splitter, [{ min: 100, max: 400 }, { min: 100 }])
      splitter.setContainerSize(1000)
      flush()

      for (let delta = -2000; delta <= 2000; delta += 97) {
        splitter.resizeBy(0, delta)
        flush()
        const [a, b] = splitter.sizes()
        expect(a).toBeGreaterThanOrEqual(100)
        expect(a).toBeLessThanOrEqual(400)
        expect(b).toBeGreaterThanOrEqual(100)
        expect(a + b).toBeCloseTo(1000, 6)
      }
      dispose()
    })
  })

  it('reports bars disabled when a neighbor panel is non-resizable', () => {
    createRoot((dispose) => {
      const splitter = createSplitter({})
      registerPanels(splitter, [{}, { resizable: false }, {}])
      splitter.setContainerSize(900)
      flush()

      expect(splitter.isBarDisabled(0)).toBe(true)
      expect(splitter.isBarDisabled(1)).toBe(true)
      dispose()
    })
  })

  it('steps with the keyboard and jumps to min/max with Home/End', () => {
    createRoot((dispose) => {
      const splitter = createSplitter({ keyboardStep: 16 })
      registerPanels(splitter, [{ min: 100 }, {}])
      splitter.setContainerSize(1000)
      flush()

      expect(splitter.keyboardResize(0, 'ArrowRight')).toBe(true)
      flush()
      expect(splitter.sizes()[0]).toBe(516)

      expect(splitter.keyboardResize(0, 'ArrowLeft')).toBe(true)
      flush()
      expect(splitter.sizes()[0]).toBe(500)

      expect(splitter.keyboardResize(0, 'Home')).toBe(true)
      flush()
      expect(splitter.sizes()[0]).toBe(100)

      expect(splitter.keyboardResize(0, 'End')).toBe(true)
      flush()
      expect(splitter.sizes()[0]).toBe(1000)
      expect(splitter.sizes()[1]).toBe(0)

      expect(splitter.keyboardResize(0, 'Enter')).toBe(false)
      dispose()
    })
  })

  it('fires onResize during dragging and onResizeEnd on release', () => {
    createRoot((dispose) => {
      const onResize = vi.fn()
      const onResizeEnd = vi.fn()
      const splitter = createSplitter({ onResize, onResizeEnd })
      registerPanels(splitter, [{}, {}])
      splitter.setContainerSize(600)
      flush()

      splitter.resizeBy(0, 50)
      flush()
      expect(onResize).toHaveBeenCalledWith([350, 250])

      splitter.endResize()
      expect(onResizeEnd).toHaveBeenCalledWith([350, 250])
      dispose()
    })
  })

  it('unregisters panels and re-normalizes the remaining set', () => {
    createRoot((dispose) => {
      const splitter = createSplitter({})
      const handles = registerPanels(splitter, [{ defaultSize: 200 }, {}, {}])
      splitter.setContainerSize(900)
      flush()
      expect(splitter.sizes()).toHaveLength(3)

      handles[0].dispose()
      flush()
      expect(splitter.sizes()).toEqual([450, 450])
      expect(handles[0].index()).toBe(-1)
      dispose()
    })
  })

  it('rescales proportionally when the container resizes', () => {
    createRoot((dispose) => {
      const splitter = createSplitter({})
      registerPanels(splitter, [{}, {}])
      splitter.setContainerSize(1000)
      flush()
      splitter.resizeBy(0, 200) // 700/300
      flush()

      splitter.setContainerSize(500)
      flush()
      expect(splitter.sizes()).toEqual([350, 150])
      dispose()
    })
  })

  it('reports aria values for a bar', () => {
    createRoot((dispose) => {
      const splitter = createSplitter({})
      registerPanels(splitter, [{ min: 100, max: '60%' }, {}])
      splitter.setContainerSize(1000)
      flush()

      expect(splitter.aria(0)).toEqual({ valueNow: 500, valueMin: 100, valueMax: 600 })
      dispose()
    })
  })
})
