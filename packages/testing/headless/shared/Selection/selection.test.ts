import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createNumericValue, createSelection } from '../../../../competence/src/selection'

const step = (fn: () => void) => { fn(); flush() }

// ---------------------------------------------------------------------------
// createNumericValue — the shared core under InputNumber / Slider / Rate
// ---------------------------------------------------------------------------

describe('createNumericValue — value state', () => {
  it('starts null by default', () => {
    createRoot(() => {
      const ins = createNumericValue()
      expect(ins.value()).toBe(null)
    })
  })

  it('seeds from defaultValue', () => {
    createRoot(() => {
      const ins = createNumericValue({ defaultValue: 5 })
      expect(ins.value()).toBe(5)
    })
  })

  it('controlled value wins over the internal state', () => {
    createRoot(() => {
      const ins = createNumericValue({ value: 10 })
      step(() => ins.setValue(42))
      expect(ins.value()).toBe(10)
    })
  })

  it('uncontrolled setValue writes and fires onChange', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createNumericValue({ onChange })
      step(() => ins.setValue(7))
      expect(ins.value()).toBe(7)
      expect(onChange).toHaveBeenCalledWith(7)
    })
  })

  it('setValue is a no-op on the same value', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createNumericValue({ defaultValue: 3, onChange })
      step(() => ins.setValue(3))
      expect(onChange).not.toHaveBeenCalled()
    })
  })
})

describe('createNumericValue — clamping & precision', () => {
  it('clamps live writes into [min, max]', () => {
    createRoot(() => {
      const ins = createNumericValue({ min: 0, max: 10 })
      step(() => ins.setValue(55))
      expect(ins.value()).toBe(10)
      step(() => ins.setValue(-3))
      expect(ins.value()).toBe(0)
    })
  })

  it('live writes keep raw decimals (drag 1:1 tracking)', () => {
    createRoot(() => {
      const ins = createNumericValue({ min: 0, max: 10, step: 1 })
      step(() => ins.setValue(3.7))
      expect(ins.value()).toBe(3.7)
    })
  })

  it('commitValue rounds to the derived step precision', () => {
    createRoot(() => {
      const ins = createNumericValue({ min: 0, step: 0.1 })
      step(() => ins.commitValue(0.30000000000000004))
      expect(ins.value()).toBe(0.3)
    })
  })

  it('commitValue snaps out-of-range writes into range', () => {
    createRoot(() => {
      const ins = createNumericValue({ min: 0, max: 1 })
      step(() => ins.commitValue(5))
      expect(ins.value()).toBe(1)
    })
  })

  it('commit rounds the CURRENT value in place', () => {
    createRoot(() => {
      const ins = createNumericValue({ min: 0, step: 0.01 })
      step(() => ins.setValue(3.456789)) // raw drag position
      step(() => ins.commit())
      expect(ins.value()).toBe(3.46)
    })
  })

  it('null clears the value and reports the change', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createNumericValue({ defaultValue: 5, onChange })
      step(() => ins.setValue(null))
      expect(ins.value()).toBe(null)
      expect(onChange).toHaveBeenCalledWith(null)
    })
  })
})

describe('createNumericValue — stepping', () => {
  it('steps by step from the current value', () => {
    createRoot(() => {
      const ins = createNumericValue({ defaultValue: 2, step: 5 })
      step(() => ins.stepBy(1))
      expect(ins.value()).toBe(7)
      step(() => ins.stepBy(-1))
      expect(ins.value()).toBe(2)
    })
  })

  it('stepping from empty starts at min (or 0)', () => {
    createRoot(() => {
      const a = createNumericValue({ min: 5 })
      step(() => a.stepBy(1))
      expect(a.value()).toBe(6)

      const b = createNumericValue()
      step(() => b.stepBy(1))
      expect(b.value()).toBe(1)
    })
  })

  it('stepping clamps and reports isAtMin/isAtMax', () => {
    createRoot(() => {
      const ins = createNumericValue({ defaultValue: 9, min: 0, max: 10 })
      step(() => ins.stepBy(1))
      expect(ins.value()).toBe(10)
      expect(ins.isAtMax()).toBe(true)
      step(() => ins.stepBy(1)) // no-op at max
      expect(ins.value()).toBe(10)
      expect(ins.isAtMin()).toBe(false)
    })
  })

  it('disabled and readonly gate every write', () => {
    createRoot(() => {
      const a = createNumericValue({ defaultValue: 1, disabled: true })
      step(() => a.stepBy(1))
      expect(a.value()).toBe(1)

      const b = createNumericValue({ defaultValue: 1, readonly: true })
      step(() => b.setValue(9))
      expect(b.value()).toBe(1)
    })
  })
})

describe('createNumericValue — index mapping', () => {
  it('maps values to tick indexes and back (Rate\'s lattice)', () => {
    createRoot(() => {
      const ins = createNumericValue({ min: 0, max: 5, step: 1 })
      expect(ins.index(3)).toBe(3)
      expect(ins.stepToIndex(4)).toBe(4)
      // Out-of-lattice values round to the nearest tick.
      expect(ins.index(2.6)).toBe(3)
    })
  })

  it('half-step lattices map through halves', () => {
    createRoot(() => {
      const ins = createNumericValue({ min: 0, max: 5, step: 0.5 })
      expect(ins.index(2.5)).toBe(5)
      expect(ins.stepToIndex(5)).toBe(2.5)
    })
  })

  it('clamps stepToIndex into range', () => {
    createRoot(() => {
      const ins = createNumericValue({ min: 0, max: 5, step: 1 })
      expect(ins.stepToIndex(99)).toBe(5)
      expect(ins.stepToIndex(-3)).toBe(0)
    })
  })
})

// ---------------------------------------------------------------------------
// createSelection — the shared option store under Radio.Group /
// Checkbox.Group / (future) Select
// ---------------------------------------------------------------------------

describe('createSelection — radio semantics (maxSelect: 1)', () => {
  const radioish = (over = {}) => createSelection({
    options: [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
      { label: 'C', value: 'c' },
    ],
    maxSelect: 1,
    allowDeselect: false,
    ...over,
  })

  it('starts empty (or from defaultValue)', () => {
    createRoot(() => {
      expect(radioish().value()).toEqual([])
      expect(radioish({ defaultValue: ['b'] }).value()).toEqual(['b'])
    })
  })

  it('selecting a new key REPLACES the old one', () => {
    createRoot(() => {
      const ins = radioish({ defaultValue: ['a'] })
      step(() => ins.select('b'))
      expect(ins.value()).toEqual(['b'])
    })
  })

  it('re-clicking the selected key is a no-op without allowDeselect', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = radioish({ defaultValue: ['a'], onChange })
      step(() => ins.select('a'))
      expect(ins.value()).toEqual(['a'])
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  it('with allowDeselect, re-clicking clears the pick', () => {
    createRoot(() => {
      const ins = radioish({ defaultValue: ['a'], allowDeselect: true })
      step(() => ins.select('a'))
      expect(ins.value()).toEqual([])
    })
  })

  it('disabled keys are ignored', () => {
    createRoot(() => {
      const ins = createSelection({
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b', disabled: true },
        ],
        maxSelect: 1,
      })
      step(() => ins.select('b'))
      expect(ins.value()).toEqual([])
      expect(ins.isDisabled('b')).toBe(true)
    })
  })

  it('getter-controlled value re-asserts after a rejected select; onChange still reports', () => {
    createRoot(() => {
      const onChange = vi.fn()
      // Mirror semantics: the controlled getter is mirrored into the store
      // via an effect. A select writes optimistically + fires onChange; a
      // parent that keeps its value re-asserts it on the next flush.
      const [controlled, setControlled] = createSignal<Array<string | number>>(['a'], { ownedWrite: true } as any)
      const ins = radioish({ value: () => controlled(), onChange })
      expect(ins.value()).toEqual(['a'])
      step(() => ins.select('c'))
      expect(onChange).toHaveBeenCalledWith(['c'])
      // Parent ignores the change → mirror re-asserts ['a'].
      flush()
      expect(ins.value()).toEqual(['a'])
      // Parent accepts → store follows.
      setControlled(['c'])
      flush()
      expect(ins.value()).toEqual(['c'])
    })
  })
})

describe('createSelection — checkbox semantics (unlimited)', () => {
  const checkboxish = (over = {}) => createSelection({
    options: [
      { label: 'Apple', value: 'apple' },
      { label: 'Banana', value: 'banana' },
      { label: 'Cherry', value: 'cherry', disabled: true },
    ],
    ...over,
  })

  it('toggles membership', () => {
    createRoot(() => {
      const ins = checkboxish()
      step(() => ins.select('apple'))
      step(() => ins.select('banana'))
      expect(ins.value()).toEqual(['apple', 'banana'])
      step(() => ins.select('apple'))
      expect(ins.value()).toEqual(['banana'])
    })
  })

  it('respects a maxSelect cap (future Select.multiple limits)', () => {
    createRoot(() => {
      const ins = checkboxish({ maxSelect: 2 })
      step(() => ins.select('apple'))
      step(() => ins.select('banana'))
      step(() => ins.select('cherry')) // disabled AND at cap — no-op
      expect(ins.value()).toEqual(['apple', 'banana'])
    })
  })

  it('clear keeps disabled options\' membership', () => {
    createRoot(() => {
      const ins = checkboxish({ defaultValue: ['apple', 'cherry'] })
      step(() => ins.clear())
      expect(ins.value()).toEqual(['cherry']) // cherry is disabled — kept
    })
  })

  it('reports all-selected / indeterminate for group headers', () => {
    createRoot(() => {
      const ins = checkboxish({ defaultValue: ['apple'] })
      expect(ins.isAllSelected()).toBe(false)
      expect(ins.isIndeterminate()).toBe(true)
      step(() => ins.select('banana'))
      // cherry is disabled — "all" means all ENABLED options.
      expect(ins.isAllSelected()).toBe(true)
      expect(ins.isIndeterminate()).toBe(false)
    })
  })
})
