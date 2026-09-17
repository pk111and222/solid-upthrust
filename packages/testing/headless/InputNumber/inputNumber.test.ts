import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createInputNumber } from '../../../competence/src/inputNumber'

const step = (fn: () => void) => { fn(); flush() }

describe('createInputNumber — value state', () => {
  it('starts empty (null value, empty display)', () => {
    createRoot(() => {
      const ins = createInputNumber()
      expect(ins.value()).toBe(null)
      expect(ins.displayValue()).toBe('')
    })
  })

  it('seeds from defaultValue', () => {
    createRoot(() => {
      const ins = createInputNumber({ defaultValue: 3.5 })
      expect(ins.value()).toBe(3.5)
      expect(ins.displayValue()).toBe('3.5')
    })
  })

  it('controlled value wins over the internal buffer', () => {
    createRoot(() => {
      const ins = createInputNumber({ value: 10 })
      step(() => ins.setInputText('42'))
      expect(ins.value()).toBe(10) // still the controlled prop
      expect(ins.textValue()).toBe('42') // buffer tracks the typing
    })
  })

  it('typing a half-number keeps the buffer but reports null-ish commits', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createInputNumber({ onChange })
      step(() => ins.notifyFocus())
      step(() => ins.setInputText('1.'))
      expect(ins.textValue()).toBe('1.')
      expect(ins.displayValue()).toBe('1.') // focused shows the buffer
      expect(onChange).toHaveBeenLastCalledWith(1) // "1." parses to 1
    })
  })

  it('typing empty commits null', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createInputNumber({ defaultValue: 5, onChange })
      step(() => ins.setInputText('7'))
      expect(onChange).toHaveBeenLastCalledWith(7)
      step(() => ins.setInputText(''))
      expect(onChange).toHaveBeenLastCalledWith(null)
      expect(ins.value()).toBe(null)
    })
  })
})

describe('createInputNumber — parser/formatter', () => {
  it('parser strips currency symbols before numeric parsing', () => {
    createRoot(() => {
      const ins = createInputNumber({ parser: t => t.replace(/\$/g, '') })
      step(() => ins.setInputText('$12'))
      expect(ins.value()).toBe(12)
    })
  })

  it('formatter renders the display text when unfocused', () => {
    createRoot(() => {
      const ins = createInputNumber({
        defaultValue: 1000,
        formatter: v => `$${v.toLocaleString()}`,
      })
      expect(ins.displayValue()).toBe('$1,000')
    })
  })
})

describe('createInputNumber — stepping', () => {
  it('steps by 1 by default', () => {
    createRoot(() => {
      const ins = createInputNumber({ defaultValue: 1 })
      step(() => ins.up())
      expect(ins.value()).toBe(2)
      step(() => ins.down())
      expect(ins.value()).toBe(1)
    })
  })

  it('respects a custom step', () => {
    createRoot(() => {
      const ins = createInputNumber({ defaultValue: 0, step: 0.1 })
      step(() => ins.up())
      expect(ins.value()).toBeCloseTo(0.1, 10)
    })
  })

  it('multiplied stepping uses shiftMultiplier (default 10)', () => {
    createRoot(() => {
      const ins = createInputNumber({ defaultValue: 1 })
      step(() => ins.up(true))
      expect(ins.value()).toBe(11)
    })
  })

  it('stepping from empty starts at min (or 0)', () => {
    createRoot(() => {
      const a = createInputNumber({ min: 5 })
      step(() => a.up())
      expect(a.value()).toBe(6)

      const b = createInputNumber()
      step(() => b.up())
      expect(b.value()).toBe(1)
    })
  })

  it('clamps into [min, max] and reports canUp/canDown', () => {
    createRoot(() => {
      const ins = createInputNumber({ defaultValue: 9, min: 0, max: 10 })
      step(() => ins.up())
      expect(ins.value()).toBe(10)
      expect(ins.canUp()).toBe(false)
      expect(ins.canDown()).toBe(true)
      step(() => ins.up()) // no-op at max
      expect(ins.value()).toBe(10)
    })
  })

  it('rounds to the derived step precision (0.1 step → 1 decimal)', () => {
    createRoot(() => {
      const ins = createInputNumber({ defaultValue: 0.1, step: 0.1, min: 0 })
      // 0.1 + 0.1 + 0.1 would be 0.30000000000000004 unrounded
      step(() => ins.up())
      step(() => ins.up())
      expect(ins.value()).toBe(0.3)
    })
  })

  it('explicit precision wins over the derived one', () => {
    createRoot(() => {
      const ins = createInputNumber({ defaultValue: 1, step: 1, precision: 2 })
      step(() => ins.up())
      expect(ins.value()).toBe(2)
      step(() => ins.setValue(3.456))
      expect(ins.value()).toBe(3.456) // value passes through; commit rounds
      step(() => ins.commit())
      expect(ins.value()).toBe(3.46)
    })
  })

  it('reports onStep with offset and direction', () => {
    createRoot(() => {
      const onStep = vi.fn()
      const ins = createInputNumber({ defaultValue: 2, onStep })
      step(() => ins.up())
      expect(onStep).toHaveBeenCalledWith(3, { offset: 1, type: 'up' })
    })
  })

  it('disabled blocks stepping', () => {
    createRoot(() => {
      const ins = createInputNumber({ defaultValue: 1, disabled: true })
      step(() => ins.up())
      expect(ins.value()).toBe(1)
      expect(ins.canUp()).toBe(false)
    })
  })
})

describe('createInputNumber — commit (blur snap)', () => {
  it('clamps an out-of-range buffer on commit', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createInputNumber({ min: 0, max: 10, onChange })
      step(() => ins.notifyFocus())
      step(() => ins.setInputText('55'))
      expect(ins.outOfRange()).toBe(true)
      step(() => ins.commit())
      expect(ins.value()).toBe(10)
      expect(ins.displayValue()).toBe('10')
      expect(onChange).toHaveBeenLastCalledWith(10)
    })
  })

  it('an unparseable buffer commits null', () => {
    createRoot(() => {
      const ins = createInputNumber({ defaultValue: 3 })
      step(() => ins.notifyFocus())
      step(() => ins.setInputText('abc'))
      step(() => ins.commit())
      expect(ins.value()).toBe(null)
      expect(ins.displayValue()).toBe('')
    })
  })

  it('blur notifies onBlur after the snap', () => {
    createRoot(() => {
      const onBlur = vi.fn()
      const ins = createInputNumber({ onBlur })
      step(() => ins.notifyFocus())
      step(() => ins.commit())
      expect(onBlur).toHaveBeenCalledTimes(1)
    })
  })
})

describe('createInputNumber — setValue', () => {
  it('emits change and updates the buffer when uncontrolled', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createInputNumber({ onChange })
      step(() => ins.setValue(7))
      expect(onChange).toHaveBeenCalledWith(7)
      expect(ins.value()).toBe(7)
      expect(ins.displayValue()).toBe('7')
      step(() => ins.setValue(null))
      expect(ins.value()).toBe(null)
    })
  })
})
