import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createSwitch } from '../../../competence/src/switch'

const step = (fn: () => void) => { fn(); flush() }

describe('createSwitch — value state', () => {
  it('defaults to unchecked', () => {
    createRoot(() => {
      const ins = createSwitch()
      expect(ins.checked()).toBe(false)
    })
  })

  it('seeds from defaultChecked', () => {
    createRoot(() => {
      const ins = createSwitch({ defaultChecked: true })
      expect(ins.checked()).toBe(true)
    })
  })

  it('value is an alias of checked', () => {
    createRoot(() => {
      const ins = createSwitch({ value: true })
      expect(ins.checked()).toBe(true)
    })
  })

  it('controlled checked wins over the internal state', () => {
    createRoot(() => {
      const ins = createSwitch({ checked: true })
      step(() => ins.toggle())
      expect(ins.checked()).toBe(true) // still the controlled prop
    })
  })
})

describe('createSwitch — toggling', () => {
  it('toggle flips and fires onChange with the NEXT value', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createSwitch({ onChange })
      step(() => ins.toggle())
      expect(ins.checked()).toBe(true)
      expect(onChange).toHaveBeenCalledWith(true, undefined)
      step(() => ins.toggle())
      expect(ins.checked()).toBe(false)
      expect(onChange).toHaveBeenLastCalledWith(false, undefined)
    })
  })

  it('disabled blocks toggling', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createSwitch({ disabled: true, onChange })
      step(() => ins.toggle())
      expect(ins.checked()).toBe(false)
      expect(onChange).not.toHaveBeenCalled()
      expect(ins.isBlocked()).toBe(true)
    })
  })

  it('loading blocks toggling but is reported separately from disabled', () => {
    createRoot(() => {
      const ins = createSwitch({ loading: true })
      step(() => ins.toggle())
      expect(ins.checked()).toBe(false)
      expect(ins.isLoading()).toBe(true)
      expect(ins.isDisabled()).toBe(false)
    })
  })

  it('onClick fires even when blocked (the click still happened)', () => {
    createRoot(() => {
      const onClick = vi.fn()
      const ins = createSwitch({ disabled: true, onClick })
      step(() => ins.toggle())
      expect(onClick).toHaveBeenCalledWith(true, undefined)
    })
  })

  it('setChecked is a no-op when the value does not change', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createSwitch({ defaultChecked: true, onChange })
      step(() => ins.setChecked(true))
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  it('setChecked respects the gates', () => {
    createRoot(() => {
      const ins = createSwitch({ disabled: true })
      step(() => ins.setChecked(true))
      expect(ins.checked()).toBe(false)
    })
  })
})
