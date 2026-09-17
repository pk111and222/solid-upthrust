import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createCheckbox, createCheckboxGroup } from '../../../competence/src/checkbox'

const step = (fn: () => void) => { fn(); flush() }

describe('createCheckbox — value state', () => {
  it('defaults to unchecked', () => {
    createRoot(() => {
      const ins = createCheckbox()
      expect(ins.checked()).toBe(false)
    })
  })

  it('seeds from defaultChecked', () => {
    createRoot(() => {
      const ins = createCheckbox({ defaultChecked: true })
      expect(ins.checked()).toBe(true)
    })
  })

  it('controlled checked wins over the internal state', () => {
    createRoot(() => {
      const ins = createCheckbox({ checked: true })
      step(() => ins.toggle())
      expect(ins.checked()).toBe(true)
    })
  })
})

describe('createCheckbox — toggling', () => {
  it('toggle flips and fires onChange with the NEXT value', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createCheckbox({ onChange })
      step(() => ins.toggle())
      expect(ins.checked()).toBe(true)
      expect(onChange).toHaveBeenCalledWith(true, undefined)
    })
  })

  it('disabled blocks toggling', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createCheckbox({ disabled: true, onChange })
      step(() => ins.toggle())
      expect(ins.checked()).toBe(false)
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  it('setChecked is a no-op on same value', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createCheckbox({ defaultChecked: true, onChange })
      step(() => ins.setChecked(true))
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  it('indeterminate is reported but never part of the arithmetic', () => {
    createRoot(() => {
      const ins = createCheckbox({ indeterminate: true, defaultChecked: false })
      expect(ins.indeterminate()).toBe(true)
      step(() => ins.toggle())
      expect(ins.indeterminate()).toBe(true) // unchanged by toggling
      expect(ins.checked()).toBe(true)
    })
  })
})

describe('createCheckboxGroup — value state', () => {
  it('defaults to an empty selection', () => {
    createRoot(() => {
      const group = createCheckboxGroup()
      expect(group.value()).toEqual([])
    })
  })

  it('seeds from defaultValue', () => {
    createRoot(() => {
      const group = createCheckboxGroup({ defaultValue: ['a'] })
      expect(group.value()).toEqual(['a'])
      expect(group.isChecked('a')).toBe(true)
    })
  })

  it('controlled value wins', () => {
    createRoot(() => {
      const group = createCheckboxGroup({ value: ['a'] })
      step(() => group.toggleValue('b'))
      expect(group.value()).toEqual(['a'])
    })
  })
})

describe('createCheckboxGroup — toggling', () => {
  it('toggleValue adds/removes membership and fires onChange', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const group = createCheckboxGroup({ onChange })
      step(() => group.toggleValue('a'))
      expect(group.value()).toEqual(['a'])
      expect(onChange).toHaveBeenLastCalledWith(['a'])
      step(() => group.toggleValue('b'))
      expect(group.value()).toEqual(['a', 'b'])
      step(() => group.toggleValue('a'))
      expect(group.value()).toEqual(['b'])
    })
  })

  it('group disabled blocks all options', () => {
    createRoot(() => {
      const group = createCheckboxGroup({ disabled: true })
      step(() => group.toggleValue('a'))
      expect(group.value()).toEqual([])
      expect(group.isDisabled('a')).toBe(true)
    })
  })

  it('option-level disabled blocks only that option', () => {
    createRoot(() => {
      const group = createCheckboxGroup({
        options: [
          { label: 'A', value: 'a', disabled: true },
          { label: 'B', value: 'b' },
        ],
      })
      step(() => group.toggleValue('a'))
      expect(group.value()).toEqual([])
      step(() => group.toggleValue('b'))
      expect(group.value()).toEqual(['b'])
    })
  })
})

describe('createCheckboxGroup — checkAll / clearAll', () => {
  const options = [
    { label: 'A', value: 'a' },
    { label: 'B', value: 'b' },
    { label: 'C', value: 'c', disabled: true },
  ]

  it('checkAll selects every enabled option (disabled options untouched)', () => {
    createRoot(() => {
      const group = createCheckboxGroup({ options })
      step(() => group.checkAll())
      expect(group.value()).toEqual(['a', 'b'])
      expect(group.isAllChecked()).toBe(true)
      expect(group.isIndeterminate()).toBe(false)
    })
  })

  it('clearAll keeps individually disabled options checked', () => {
    createRoot(() => {
      const group = createCheckboxGroup({ options, defaultValue: ['c'] })
      step(() => group.clearAll())
      expect(group.value()).toEqual(['c'])
    })
  })

  it('partial selection reports indeterminate', () => {
    createRoot(() => {
      const group = createCheckboxGroup({ options, defaultValue: ['a'] })
      expect(group.isAllChecked()).toBe(false)
      expect(group.isIndeterminate()).toBe(true)
      expect(group.isDisabled('c')).toBe(true)
    })
  })

  it('empty selection is neither all-checked nor indeterminate', () => {
    createRoot(() => {
      const group = createCheckboxGroup({ options })
      expect(group.isAllChecked()).toBe(false)
      expect(group.isIndeterminate()).toBe(false)
    })
  })
})
