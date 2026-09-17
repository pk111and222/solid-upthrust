import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import {
  createTimePicker,
  formatTime,
  fromSeconds,
  parseTime,
  toSeconds,
  unitOptions,
} from '../../../competence/src/timePicker'

const step = (fn: () => void) => { fn(); flush() }

describe('pure time helpers', () => {
  it('parseTime parses HH:mm and HH:mm:ss', () => {
    expect(parseTime('08:30')).toEqual({ hour: 8, minute: 30, second: 0 })
    expect(parseTime('08:30:45')).toEqual({ hour: 8, minute: 30, second: 45 })
    expect(parseTime('8:5')).toEqual({ hour: 8, minute: 5, second: 0 })
  })

  it('parseTime rejects invalid input', () => {
    expect(parseTime('')).toBeNull()
    expect(parseTime(null)).toBeNull()
    expect(parseTime('24:00')).toBeNull()
    expect(parseTime('12:60')).toBeNull()
    expect(parseTime('12:00:60')).toBeNull()
    expect(parseTime('abc')).toBeNull()
  })

  it('formatTime zero-pads', () => {
    expect(formatTime({ hour: 8, minute: 5, second: 3 })).toBe('08:05')
    expect(formatTime({ hour: 8, minute: 5, second: 3 }, 'HH:mm:ss')).toBe('08:05:03')
  })

  it('toSeconds/fromSeconds round-trip', () => {
    const p = { hour: 8, minute: 30, second: 45 }
    expect(fromSeconds(toSeconds(p))).toEqual(p)
    expect(toSeconds({ hour: 0, minute: 0, second: 0 })).toBe(0)
    expect(toSeconds({ hour: 23, minute: 59, second: 59 })).toBe(86399)
  })

  it('unitOptions builds the lattice per step (off-step flagged disabled)', () => {
    const hours = unitOptions('hour', 1)
    expect(hours).toHaveLength(24)
    expect(hours.every(o => !o.disabled)).toBe(true)
    const stepped = unitOptions('hour', 5)
    expect(stepped.find(o => o.value === 0)?.disabled).toBe(false)
    expect(stepped.find(o => o.value === 5)?.disabled).toBe(false)
    expect(stepped.find(o => o.value === 3)?.disabled).toBe(true)
    const minutes = unitOptions('minute', 1)
    expect(minutes).toHaveLength(60)
  })
})

describe('createTimePicker — value state', () => {
  it('starts empty (or from defaultValue)', () => {
    createRoot(() => {
      expect(createTimePicker().value()).toBeNull()
      expect(createTimePicker({ defaultValue: '08:30' }).value()).toBe('08:30')
    })
  })

  it('HH:mm:ss format keeps seconds', () => {
    createRoot(() => {
      const ins = createTimePicker({ defaultValue: '08:30:45', format: 'HH:mm:ss' })
      expect(ins.value()).toBe('08:30:45')
    })
  })

  it('typing a parseable time commits immediately (normalized + padded)', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createTimePicker({ onChange })
      step(() => ins.setInputText('8:5'))
      expect(ins.value()).toBe('08:05')
      expect(onChange).toHaveBeenCalledWith('08:05')
    })
  })

  it('half-typed input stays buffer-only until commit', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createTimePicker({ onChange })
      step(() => ins.setInputText('08:'))
      expect(ins.value()).toBeNull()
      expect(ins.textValue()).toBe('08:')
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  it('unparseable buffer reverts to the last valid value on commit', () => {
    createRoot(() => {
      const ins = createTimePicker({ defaultValue: '08:30' })
      step(() => ins.setInputText('abc'))
      step(() => ins.commit())
      expect(ins.textValue()).toBe('08:30')
      expect(ins.value()).toBe('08:30')
    })
  })

  it('blur commit snaps out-of-range into [min, max]', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createTimePicker({ min: '09:00', max: '18:00', onChange })
      step(() => ins.setInputText('07:30'))
      step(() => ins.commit())
      expect(ins.value()).toBe('09:00')
      expect(onChange).toHaveBeenLastCalledWith('09:00')
    })
  })

  it('controlled value wins; typing still reports', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createTimePicker({ value: '10:00', onChange })
      step(() => ins.setInputText('11:30'))
      expect(ins.value()).toBe('10:00')
      expect(onChange).toHaveBeenCalledWith('11:30')
    })
  })

  it('clear empties the value', () => {
    createRoot(() => {
      const onClearChange = vi.fn()
      const ins = createTimePicker({ defaultValue: '08:30', onChange: onClearChange })
      step(() => ins.clear())
      expect(ins.value()).toBeNull()
      expect(onClearChange).toHaveBeenCalledWith(null)
    })
  })

  it('empty input stays empty through blur (not zeroed)', () => {
    createRoot(() => {
      const ins = createTimePicker()
      step(() => ins.setInputText(''))
      step(() => ins.commit())
      expect(ins.value()).toBeNull()
    })
  })
})

describe('createTimePicker — stepping (input steppers)', () => {
  it('steps the selected unit by its step, wrapping within range', () => {
    createRoot(() => {
      const ins = createTimePicker({ defaultValue: '08:30' })
      step(() => ins.stepSelected(1, 'minute'))
      expect(ins.value()).toBe('08:31')
      step(() => ins.stepSelected(-1, 'minute'))
      expect(ins.value()).toBe('08:30')
      // wrap: minute 59 + 1 → 0
      step(() => ins.stepSelected(29, 'minute')) // 30 + 29 = 59
      expect(ins.value()).toBe('08:59')
      step(() => ins.stepSelected(1, 'minute'))
      expect(ins.value()).toBe('08:00')
    })
  })

  it('hourStep scales the increment and snaps the lattice', () => {
    createRoot(() => {
      const ins = createTimePicker({ defaultValue: '08:30', hourStep: 3 })
      step(() => ins.stepSelected(1, 'hour'))
      expect(ins.value()).toBe('11:30')
      // off-lattice defaultValue snaps on the next write
      const ins2 = createTimePicker({ defaultValue: '08:30', hourStep: 3 })
      step(() => ins2.stepSelected(1, 'minute'))
      expect(ins2.value()).toBe('08:31') // minute steps normally; the stepper does not re-snap the hour
    })
  })

  it('stepping from empty starts at 00:00', () => {
    createRoot(() => {
      const ins = createTimePicker()
      step(() => ins.stepSelected(1))
      expect(ins.value()).toBe('01:00')
    })
  })

  it('stepSelected clamps into [min, max]', () => {
    createRoot(() => {
      const ins = createTimePicker({ defaultValue: '17:50', max: '18:00' })
      step(() => ins.stepSelected(1)) // 18:50 → clamp 18:00
      expect(ins.value()).toBe('18:00')
    })
  })

  it('disabled blocks stepping', () => {
    createRoot(() => {
      const ins = createTimePicker({ defaultValue: '08:30', disabled: true })
      step(() => ins.stepSelected(1))
      expect(ins.value()).toBe('08:30')
    })
  })
})

describe('createTimePicker — panel', () => {
  it('units reflect the format', () => {
    createRoot(() => {
      expect(createTimePicker().units()).toEqual(['hour', 'minute'])
      expect(createTimePicker({ format: 'HH:mm:ss' }).units()).toEqual(['hour', 'minute', 'second'])
    })
  })

  it('active anchors at the current value (or 0 when empty)', () => {
    createRoot(() => {
      const ins = createTimePicker({ defaultValue: '08:30' })
      expect(ins.activeValue('hour')).toBe(8)
      expect(ins.activeValue('minute')).toBe(30)
      const empty = createTimePicker()
      expect(empty.activeValue('hour')).toBe(0)
    })
  })

  it('moveActive walks the lattice skipping disabled (off-step) options', () => {
    createRoot(() => {
      const ins = createTimePicker({ hourStep: 5 })
      step(() => ins.moveActive('hour', 1))
      expect(ins.activeValue('hour')).toBe(5)
      step(() => ins.moveActive('hour', 1))
      expect(ins.activeValue('hour')).toBe(10)
      step(() => ins.moveActive('hour', -1))
      expect(ins.activeValue('hour')).toBe(5)
    })
  })

  it('pickUnit sets one unit and keeps the others', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createTimePicker({ defaultValue: '08:30', onChange })
      step(() => ins.pickUnit('hour', 14))
      expect(ins.value()).toBe('14:30')
      expect(onChange).toHaveBeenCalledWith('14:30')
      step(() => ins.pickUnit('minute', 59))
      expect(ins.value()).toBe('14:59')
    })
  })

  it('pickUnit snaps an off-lattice defaultValue onto the step lattice', () => {
    createRoot(() => {
      const ins = createTimePicker({ defaultValue: '08:37', minuteStep: 15 })
      step(() => ins.pickUnit('hour', 9))
      expect(ins.value()).toBe('09:30') // 37 floors to 30 on the 15-lattice
    })
  })

  it('off-step options are flagged disabled', () => {
    createRoot(() => {
      const ins = createTimePicker({ hourStep: 5 })
      expect(ins.isOptionDisabled('hour', 3)).toBe(true)
      expect(ins.isOptionDisabled('hour', 5)).toBe(false)
    })
  })

  it('options outside [min, max] are disabled (contextual)', () => {
    createRoot(() => {
      const ins = createTimePicker({ defaultValue: '10:00', min: '09:00', max: '12:00' })
      // 8 o'clock with the rest at 10:00 → 08:00 < 09:00 → disabled
      expect(ins.isOptionDisabled('hour', 8)).toBe(true)
      expect(ins.isOptionDisabled('hour', 11)).toBe(false)
    })
  })

  it('pickUnit on a disabled option is a no-op', () => {
    createRoot(() => {
      const ins = createTimePicker({ defaultValue: '08:30', hourStep: 5 })
      step(() => ins.pickUnit('hour', 3)) // off-lattice
      expect(ins.value()).toBe('08:30')
    })
  })

  it('open state mirrors for the UI trigger', () => {
    createRoot(() => {
      const ins = createTimePicker()
      step(() => ins.setOpen(true))
      expect(ins.isOpen()).toBe(true)
      step(() => ins.setOpen(false))
      expect(ins.isOpen()).toBe(false)
    })
  })

  it('seconds column works in HH:mm:ss', () => {
    createRoot(() => {
      const ins = createTimePicker({ defaultValue: '08:30:15', format: 'HH:mm:ss' })
      step(() => ins.pickUnit('second', 42))
      expect(ins.value()).toBe('08:30:42')
    })
  })
})

describe('createTimePicker — IME-ish and focus', () => {
  it('focus/blur notifications track', () => {
    createRoot(() => {
      const onFocus = vi.fn()
      const onBlur = vi.fn()
      const ins = createTimePicker({ onFocus, onBlur })
      step(() => ins.notifyFocus())
      expect(ins.isFocused()).toBe(true)
      expect(onFocus).toHaveBeenCalledTimes(1)
      step(() => ins.notifyBlur())
      expect(ins.isFocused()).toBe(false)
      expect(onBlur).toHaveBeenCalledTimes(1)
    })
  })

  it('setValue validates and snaps (programmatic API)', () => {
    createRoot(() => {
      const ins = createTimePicker({ hourStep: 2 })
      step(() => ins.setValue('09:30')) // 9 floors to 8
      expect(ins.value()).toBe('08:30')
      step(() => ins.setValue('invalid'))
      expect(ins.value()).toBe('08:30')
      step(() => ins.setValue(null))
      expect(ins.value()).toBeNull()
    })
  })
})
