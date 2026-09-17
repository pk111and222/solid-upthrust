import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createRate } from '../../../competence/src/rate'

const step = (fn: () => void) => { fn(); flush() }

describe('createRate — value state', () => {
  it('defaults to 0 (unrated)', () => {
    createRoot(() => {
      const ins = createRate()
      expect(ins.value()).toBe(0)
      expect(ins.displayValue()).toBe(0)
    })
  })

  it('seeds from defaultValue', () => {
    createRoot(() => {
      const ins = createRate({ defaultValue: 3 })
      expect(ins.value()).toBe(3)
    })
  })

  it('controlled value wins', () => {
    createRoot(() => {
      const ins = createRate({ value: 2 })
      step(() => ins.clickAt(5))
      expect(ins.value()).toBe(2)
    })
  })

  it('count defaults to 5', () => {
    createRoot(() => {
      expect(createRate().count()).toBe(5)
      expect(createRate({ count: 10 }).count()).toBe(10)
    })
  })
})

describe('createRate — clicking', () => {
  it('clickAt commits the value and fires onChange', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createRate({ onChange })
      step(() => ins.clickAt(4))
      expect(ins.value()).toBe(4)
      expect(onChange).toHaveBeenCalledWith(4)
    })
  })

  it('re-clicking the current value is a no-op without allowClear', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createRate({ defaultValue: 3, onChange })
      step(() => ins.clickAt(3))
      expect(ins.value()).toBe(3)
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  it('allowClear: re-clicking the current value resets to 0', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createRate({ defaultValue: 3, allowClear: true, onChange })
      step(() => ins.clickAt(3))
      expect(ins.value()).toBe(0)
      expect(onChange).toHaveBeenCalledWith(0)
    })
  })

  it('allowHalf: fractional positions snap to halves', () => {
    createRoot(() => {
      const ins = createRate({ allowHalf: true })
      step(() => ins.clickAt(2.4)) // left half of star 3 → 2.5
      expect(ins.value()).toBe(2.5)
      step(() => ins.clickAt(2.8)) // right half → 3
      expect(ins.value()).toBe(3)
    })
  })

  it('whole mode snaps fractions to whole stars', () => {
    createRoot(() => {
      const ins = createRate()
      step(() => ins.clickAt(2.4))
      expect(ins.value()).toBe(2)
      step(() => ins.clickAt(2.6))
      expect(ins.value()).toBe(3)
    })
  })

  it('disabled blocks clicking', () => {
    createRoot(() => {
      const ins = createRate({ disabled: true })
      step(() => ins.clickAt(4))
      expect(ins.value()).toBe(0)
      expect(ins.isDisabled()).toBe(true)
    })
  })

  it('values clamp into 0..count', () => {
    createRoot(() => {
      const ins = createRate({ count: 5 })
      step(() => ins.clickAt(9))
      expect(ins.value()).toBe(5)
    })
  })
})

describe('createRate — hover preview', () => {
  it('hoverAt previews without committing', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createRate({ defaultValue: 1, onChange })
      step(() => ins.hoverAt(4))
      expect(ins.displayValue()).toBe(4)
      expect(ins.value()).toBe(1) // NOT committed
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  it('onHoverChange fires on enter and restores on leave', () => {
    createRoot(() => {
      const onHoverChange = vi.fn()
      const ins = createRate({ defaultValue: 2, onHoverChange })
      step(() => ins.hoverAt(4))
      expect(onHoverChange).toHaveBeenLastCalledWith(4)
      step(() => ins.leaveHover())
      expect(onHoverChange).toHaveBeenLastCalledWith(2)
      expect(ins.displayValue()).toBe(2)
      expect(ins.isHovering()).toBe(false)
    })
  })

  it('click commits while hovering — displayValue follows', () => {
    createRoot(() => {
      const ins = createRate()
      step(() => ins.hoverAt(3))
      step(() => ins.clickAt(3))
      expect(ins.value()).toBe(3)
      expect(ins.displayValue()).toBe(3)
      step(() => ins.leaveHover())
      expect(ins.displayValue()).toBe(3)
    })
  })

  it('half mode snaps the hover preview too', () => {
    createRoot(() => {
      const ins = createRate({ allowHalf: true })
      step(() => ins.hoverAt(2.3))
      expect(ins.displayValue()).toBe(2.5)
    })
  })

  it('disabled ignores hover', () => {
    createRoot(() => {
      const ins = createRate({ disabled: true })
      step(() => ins.hoverAt(4))
      expect(ins.displayValue()).toBe(0)
    })
  })
})

describe('createRate — keyboard', () => {
  it('stepBy moves by one star (halves by half)', () => {
    createRoot(() => {
      const whole = createRate({ defaultValue: 2 })
      step(() => whole.stepBy(1))
      expect(whole.value()).toBe(3)

      const half = createRate({ defaultValue: 2, allowHalf: true })
      step(() => half.stepBy(1))
      expect(half.value()).toBe(2.5)
    })
  })

  it('reset clears to 0', () => {
    createRoot(() => {
      const ins = createRate({ defaultValue: 4 })
      step(() => ins.reset())
      expect(ins.value()).toBe(0)
    })
  })

  it('focus/blur track the focused flag', () => {
    createRoot(() => {
      const onFocus = vi.fn()
      const onBlur = vi.fn()
      const ins = createRate({ onFocus, onBlur })
      step(() => ins.notifyFocus())
      expect(ins.isFocused()).toBe(true)
      expect(onFocus).toHaveBeenCalledTimes(1)
      step(() => ins.notifyBlur())
      expect(ins.isFocused()).toBe(false)
      expect(onBlur).toHaveBeenCalledTimes(1)
    })
  })
})
