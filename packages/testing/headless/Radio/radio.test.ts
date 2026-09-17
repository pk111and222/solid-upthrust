import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createRadio, createRadioGroup } from '../../../competence/src/radio'

const step = (fn: () => void) => { fn(); flush() }

describe('createRadio — standalone', () => {
  it('defaults to unchecked', () => {
    createRoot(() => {
      const ins = createRadio()
      expect(ins.checked()).toBe(false)
    })
  })

  it('seeds from defaultChecked', () => {
    createRoot(() => {
      const ins = createRadio({ defaultChecked: true })
      expect(ins.checked()).toBe(true)
    })
  })

  it('check fires onChange(true) once and stays checked', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createRadio({ onChange })
      step(() => ins.check())
      step(() => ins.check()) // second click: no-op
      expect(ins.checked()).toBe(true)
      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(true, undefined)
    })
  })

  it('a radio NEVER unchecks itself — setChecked(false) is a no-op', () => {
    createRoot(() => {
      const ins = createRadio({ defaultChecked: true })
      step(() => ins.setChecked(false))
      expect(ins.checked()).toBe(true)
    })
  })

  it('disabled blocks checking', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createRadio({ disabled: true, onChange })
      step(() => ins.check())
      expect(ins.checked()).toBe(false)
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  it('controlled checked wins over the internal state', () => {
    createRoot(() => {
      const ins = createRadio({ checked: false })
      step(() => ins.check())
      expect(ins.checked()).toBe(false)
    })
  })
})

describe('createRadioGroup — value state', () => {
  const options = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
  ]

  it('starts undefined (nothing picked)', () => {
    createRoot(() => {
      const group = createRadioGroup({ options })
      expect(group.value()).toBeUndefined()
    })
  })

  it('seeds from defaultValue (single key API)', () => {
    createRoot(() => {
      const group = createRadioGroup({ options, defaultValue: 'banana' })
      expect(group.value()).toBe('banana')
      expect(group.isSelected('banana')).toBe(true)
      expect(group.isSelected('apple')).toBe(false)
    })
  })

  it('select replaces the previous pick', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const group = createRadioGroup({ options, defaultValue: 'apple', onChange })
      step(() => group.select('cherry'))
      expect(group.value()).toBe('cherry')
      expect(group.isSelected('apple')).toBe(false)
      expect(onChange).toHaveBeenCalledWith('cherry')
    })
  })

  it('re-clicking the selected radio does nothing', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const group = createRadioGroup({ options, defaultValue: 'apple', onChange })
      step(() => group.select('apple'))
      expect(group.value()).toBe('apple')
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  it('disabled options are unselectable', () => {
    createRoot(() => {
      const group = createRadioGroup({
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b', disabled: true },
        ],
      })
      step(() => group.select('b'))
      expect(group.value()).toBeUndefined()
      expect(group.isDisabled('b')).toBe(true)
    })
  })

  it('group-level disabled wins over per-option', () => {
    createRoot(() => {
      const group = createRadioGroup({ options, disabled: true })
      expect(group.isDisabled('apple')).toBe(true)
      step(() => group.select('apple'))
      expect(group.value()).toBeUndefined()
    })
  })

  it('controlled value wins; select still reports through onChange', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const group = createRadioGroup({ options, value: 'apple', onChange })
      step(() => group.select('banana'))
      expect(group.value()).toBe('apple') // still the controlled prop
      expect(onChange).toHaveBeenCalledWith('banana')
    })
  })

  it('clear resets the selection', () => {
    createRoot(() => {
      const group = createRadioGroup({ options, defaultValue: 'apple' })
      step(() => group.clear())
      expect(group.value()).toBeUndefined()
    })
  })

  it('exposes the underlying selection store for future Select composition', () => {
    createRoot(() => {
      const group = createRadioGroup({ options, defaultValue: 'apple' })
      const store = group.store()
      expect(store.value()).toEqual(['apple'])
      expect(store.isSelected('apple')).toBe(true)
    })
  })
})
