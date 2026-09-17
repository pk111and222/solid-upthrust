import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createSegmented } from '../../../competence/src/segmented'

const step = (fn: () => void) => { fn(); flush() }

const days = [
  { label: '周一', value: 'mon' },
  { label: '周二', value: 'tue' },
  { label: '周三', value: 'wed', disabled: true },
  { label: '周四', value: 'thu' },
]

describe('createSegmented — value semantics', () => {
  it('picks replace; clicking the selected item keeps it (radio)', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createSegmented({ options: days, onChange })
      expect(ins.value()).toBeUndefined()
      step(() => ins.select('mon'))
      expect(ins.value()).toBe('mon')
      step(() => ins.select('tue'))
      expect(ins.value()).toBe('tue')
      // Re-click: no change event.
      step(() => ins.select('tue'))
      expect(onChange).toHaveBeenCalledTimes(2)
    })
  })

  it('disabled options are unselectable; the group disable kills everything', () => {
    createRoot(() => {
      const ins = createSegmented({ options: days })
      step(() => ins.select('wed'))
      expect(ins.value()).toBeUndefined()
      expect(ins.isDisabled('wed')).toBe(true)

      const all = createSegmented({ options: days, disabled: true })
      expect(all.isDisabledAll()).toBe(true)
      step(() => all.select('mon'))
      expect(all.value()).toBeUndefined()
    })
  })

  it('controlled value wins; onChange still reports picks', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createSegmented({ options: days, value: 'mon', onChange })
      expect(ins.value()).toBe('mon')
      step(() => ins.select('thu'))
      // Parent never wrote back — controlled stays authoritative.
      expect(ins.value()).toBe('mon')
      expect(onChange).toHaveBeenCalledWith('thu')
    })
  })

  it('controlled round-trip: value = onChange payload', () => {
    createRoot(() => {
      let value: string | number | undefined
      const ins = createSegmented({
        options: days,
        get value() { return value },
        onChange: v => { value = v },
      })
      step(() => ins.select('tue'))
      expect(value).toBe('tue')
      expect(ins.value()).toBe('tue')
    })
  })

  it('defaultValue seeds the uncontrolled store', () => {
    createRoot(() => {
      const ins = createSegmented({ options: days, defaultValue: 'tue' })
      expect(ins.value()).toBe('tue')
      expect(ins.isSelected('tue')).toBe(true)
    })
  })
})

describe('createSegmented — thumb geometry', () => {
  it('thumb follows the selected item once measured', () => {
    createRoot(() => {
      const ins = createSegmented({ options: days, defaultValue: 'mon' })
      expect(ins.thumbRect()).toBeUndefined()
      step(() => ins.setItemRect('mon', { left: 0, width: 64 }))
      expect(ins.thumbRect()).toEqual({ left: 0, width: 64 })
      // Slide to another item.
      step(() => ins.setItemRect('tue', { left: 64, width: 64 }))
      step(() => ins.select('tue'))
      expect(ins.thumbRect()).toEqual({ left: 64, width: 64 })
    })
  })

  it('thumb follows keyboard focus ahead of the commit', () => {
    createRoot(() => {
      const ins = createSegmented({ options: days, defaultValue: 'mon' })
      step(() => ins.setItemRect('mon', { left: 0, width: 64 }))
      step(() => ins.setItemRect('tue', { left: 64, width: 64 }))
      // Focus moves the thumb even though the value stays.
      step(() => ins.setFocusValue('tue'))
      expect(ins.thumbValue()).toBe('tue')
      expect(ins.thumbRect()).toEqual({ left: 64, width: 64 })
      expect(ins.value()).toBe('mon')
      // Commit clears focus; the thumb lands on the value.
      step(() => ins.select('tue'))
      expect(ins.focusValue()).toBeUndefined()
      expect(ins.thumbValue()).toBe('tue')
    })
  })

  it('clearItemRects empties the registry (re-measure sweep)', () => {
    createRoot(() => {
      const ins = createSegmented({ options: days, defaultValue: 'mon' })
      step(() => ins.setItemRect('mon', { left: 0, width: 64 }))
      expect(ins.thumbRect()).toBeDefined()
      step(() => ins.clearItemRects())
      expect(ins.thumbRect()).toBeUndefined()
    })
  })
})

describe('createSegmented — keyboard traversal', () => {
  it('moveFocus skips disabled options and wraps', () => {
    createRoot(() => {
      const ins = createSegmented({ options: days, defaultValue: 'mon' })
      step(() => ins.moveFocus(1))
      expect(ins.focusValue()).toBe('tue')
      // wed is disabled — the next hop lands on thu.
      step(() => ins.moveFocus(1))
      expect(ins.focusValue()).toBe('thu')
      // Wrap: after thu comes mon.
      step(() => ins.moveFocus(1))
      expect(ins.focusValue()).toBe('mon')
      // Backward wraps too.
      step(() => ins.moveFocus(-1))
      expect(ins.focusValue()).toBe('thu')
    })
  })

  it('focusEdge jumps to the first/last enabled item', () => {
    createRoot(() => {
      const ins = createSegmented({ options: days })
      step(() => ins.focusEdge('last'))
      expect(ins.focusValue()).toBe('thu')
      step(() => ins.focusEdge('first'))
      expect(ins.focusValue()).toBe('mon')
    })
  })

  it('a disabled group blocks traversal entirely', () => {
    createRoot(() => {
      const ins = createSegmented({ options: days, disabled: true })
      step(() => ins.moveFocus(1))
      expect(ins.focusValue()).toBeUndefined()
      step(() => ins.focusEdge('first'))
      expect(ins.focusValue()).toBeUndefined()
    })
  })

  it('select clears focus back onto the committed value', () => {
    createRoot(() => {
      const ins = createSegmented({ options: days })
      step(() => ins.setFocusValue('tue'))
      step(() => ins.select('tue'))
      expect(ins.focusValue()).toBeUndefined()
      expect(ins.value()).toBe('tue')
    })
  })
})
