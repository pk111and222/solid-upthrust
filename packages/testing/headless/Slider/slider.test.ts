import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createSlider } from '../../../competence/src/slider'

const step = (fn: () => void) => { fn(); flush() }

describe('createSlider — value state', () => {
  it('defaults to min when no value given', () => {
    createRoot(() => {
      const ins = createSlider({ min: 0, max: 100 })
      expect(ins.value()).toBe(0)
    })
  })

  it('seeds from defaultValue', () => {
    createRoot(() => {
      const ins = createSlider({ defaultValue: 30 })
      expect(ins.value()).toBe(30)
    })
  })

  it('controlled value wins', () => {
    createRoot(() => {
      const ins = createSlider({ value: 30 })
      step(() => ins.setValue(70))
      expect(ins.value()).toBe(30)
    })
  })

  it('setValue clamps and fires onChange', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createSlider({ min: 0, max: 100, onChange })
      step(() => ins.setValue(120))
      expect(ins.value()).toBe(100)
      expect(onChange).toHaveBeenCalledWith(100)
    })
  })
})

describe('createSlider — percent/value mapping', () => {
  it('maps value → percent on a 0..100 scale', () => {
    createRoot(() => {
      const ins = createSlider({ min: 0, max: 100, defaultValue: 30 })
      expect(ins.percentOf(30)).toBe(30)
      expect(ins.percentOf(0)).toBe(0)
      expect(ins.percentOf(100)).toBe(100)
    })
  })

  it('scales on non-zero mins', () => {
    createRoot(() => {
      const ins = createSlider({ min: 10, max: 110, defaultValue: 60 })
      expect(ins.percentOf(60)).toBe(50)
    })
  })

  it('reverse flips the axis', () => {
    createRoot(() => {
      const ins = createSlider({ min: 0, max: 100, reverse: true, defaultValue: 30 })
      expect(ins.percentOf(30)).toBe(70)
      expect(ins.valueAt(70)).toBe(30)
    })
  })

  it('valueAt snaps to the step lattice', () => {
    createRoot(() => {
      const ins = createSlider({ min: 0, max: 100, step: 10 })
      expect(ins.valueAt(37)).toBe(40)
      expect(ins.valueAt(34)).toBe(30)
    })
  })

  it('free mode (step: null) does not snap', () => {
    createRoot(() => {
      const ins = createSlider({ min: 0, max: 100, step: null })
      expect(ins.valueAt(37.3)).toBeCloseTo(37.3, 10)
    })
  })

  it('marksOnly snaps to the closest mark', () => {
    createRoot(() => {
      const ins = createSlider({
        min: 0, max: 100, marksOnly: true,
        marks: [{ value: 0 }, { value: 25 }, { value: 60 }, { value: 100 }],
      })
      expect(ins.valueAt(30)).toBe(25)
      // 80% of 100 = 80 → equidistant is NOT the case: |80-60|=20 < |80-100|=20
      // is a tie; closest-mark picks the FIRST best (60). 81% is unambiguous.
      expect(ins.valueAt(81)).toBe(100)
      expect(ins.valueAt(50)).toBe(60)
    })
  })
})

describe('createSlider — dragging', () => {
  it('beginDrag on the track moves the nearest handle and tracks moves 1:1', () => {
    createRoot(() => {
      const ins = createSlider({ min: 0, max: 100, defaultValue: 0 })
      step(() => ins.beginDrag(40))
      expect(ins.isDragging()).toBe(true)
      expect(ins.value()).toBe(40)
      step(() => ins.dragTo(62))
      expect(ins.value()).toBe(62)
    })
  })

  it('endDrag fires onAfterChange with the snapped value', () => {
    createRoot(() => {
      const onAfterChange = vi.fn()
      const ins = createSlider({ min: 0, max: 100, step: 10, onAfterChange })
      step(() => ins.beginDrag(37))
      step(() => ins.endDrag())
      expect(ins.value()).toBe(40)
      expect(onAfterChange).toHaveBeenCalledWith(40)
      expect(ins.isDragging()).toBe(false)
    })
  })

  it('disabled blocks dragging entirely', () => {
    createRoot(() => {
      const ins = createSlider({ min: 0, max: 100, defaultValue: 0, disabled: true })
      step(() => ins.beginDrag(50))
      expect(ins.isDragging()).toBe(false)
      expect(ins.value()).toBe(0)
    })
  })
})

describe('createSlider — range mode', () => {
  it('seeds from defaultRangeValue and reports the pair', () => {
    createRoot(() => {
      const ins = createSlider({ min: 0, max: 100, defaultRangeValue: [20, 60] })
      expect(ins.isRange()).toBe(true)
      expect(ins.rangeValue()).toEqual([20, 60])
    })
  })

  it('dragging picks the NEAREST handle', () => {
    createRoot(() => {
      const ins = createSlider({ min: 0, max: 100, defaultRangeValue: [20, 80] })
      // 25 is much closer to the start handle (20) than the end (80).
      step(() => ins.beginDrag(25))
      expect(ins.draggingHandle()).toBe(0)
      step(() => ins.dragTo(30))
      expect(ins.rangeValue()).toEqual([30, 80])
      step(() => ins.endDrag())

      // 70 is closer to the end handle.
      step(() => ins.beginDrag(70))
      expect(ins.draggingHandle()).toBe(1)
      step(() => ins.dragTo(65))
      expect(ins.rangeValue()).toEqual([30, 65])
    })
  })

  it('the pair invariant start ≤ end holds while dragging', () => {
    createRoot(() => {
      const ins = createSlider({ min: 0, max: 100, defaultRangeValue: [20, 80] })
      step(() => ins.beginDrag(85)) // near the end handle
      step(() => ins.dragTo(10)) // drag it past the start
      expect(ins.rangeValue()[0]).toBeLessThanOrEqual(ins.rangeValue()[1])
    })
  })

  it('onRangeChange reports the pair', () => {
    createRoot(() => {
      const onRangeChange = vi.fn()
      const ins = createSlider({ min: 0, max: 100, defaultRangeValue: [20, 80], onRangeChange })
      step(() => ins.beginDrag(30))
      step(() => ins.dragTo(40))
      expect(onRangeChange).toHaveBeenCalledWith([40, 80])
    })
  })

  it('controlled rangeValue wins', () => {
    createRoot(() => {
      const ins = createSlider({ min: 0, max: 100, rangeValue: [20, 60] })
      step(() => ins.beginDrag(50))
      step(() => ins.dragTo(80))
      expect(ins.rangeValue()).toEqual([20, 60]) // still controlled
    })
  })
})

describe('createSlider — keyboard', () => {
  it('arrows step by step (shift ×10)', () => {
    createRoot(() => {
      const ins = createSlider({ min: 0, max: 100, step: 5, defaultValue: 20 })
      step(() => ins.stepHandle(0, 1))
      expect(ins.value()).toBe(25)
      step(() => ins.stepHandle(0, 10))
      expect(ins.value()).toBe(75)
      step(() => ins.stepHandle(0, -1))
      expect(ins.value()).toBe(70)
    })
  })

  it('Home/End snap to min/max', () => {
    createRoot(() => {
      const ins = createSlider({ min: 0, max: 100, defaultValue: 50 })
      step(() => ins.snapToMax(0))
      expect(ins.value()).toBe(100)
      step(() => ins.snapToMin(0))
      expect(ins.value()).toBe(0)
    })
  })

  it('stepping clamps into range', () => {
    createRoot(() => {
      const ins = createSlider({ min: 0, max: 10, step: 2, defaultValue: 8 })
      step(() => ins.stepHandle(0, 1))
      expect(ins.value()).toBe(10)
      step(() => ins.stepHandle(0, 1)) // no-op at max
      expect(ins.value()).toBe(10)
    })
  })
})

describe('createSlider — marks', () => {
  it('marks are returned sorted by value', () => {
    createRoot(() => {
      const ins = createSlider({
        marks: [{ value: 60, label: 'B' }, { value: 10, label: 'A' }, { value: 30, label: 'C' }],
      })
      expect(ins.marks().map(m => m.value)).toEqual([10, 30, 60])
    })
  })

  it('isMarkAt tests membership', () => {
    createRoot(() => {
      const ins = createSlider({ marks: [{ value: 10 }, { value: 50 }] })
      expect(ins.isMarkAt(50)).toBe(true)
      expect(ins.isMarkAt(51)).toBe(false)
    })
  })
})
