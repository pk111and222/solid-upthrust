import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createDateRangePicker, parseDate, formatDate, todayParts } from '../../../competence/src/datePicker'
import type { MonthCell } from '../../../competence/src/datePicker'

const step = (fn: () => void) => { fn(); flush() }

const cellOf = (ins: ReturnType<typeof createDateRangePicker>, iso: string, panel?: 'left' | 'right'): MonthCell => {
  const panels: Array<'left' | 'right'> = panel ? [panel] : ['left', 'right']
  for (const p of panels) {
    const found = ins.monthMatrix(p).flat().find(c => c.iso === iso)
    if (found) return found
  }
  throw new Error(`cell ${iso} not in either panel view`)
}

describe('createDateRangePicker — value model', () => {
  it('starts empty (or from a defaultValue pair)', () => {
    createRoot(() => {
      expect(createDateRangePicker().value()).toBeNull()
      const seeded = createDateRangePicker({ defaultValue: ['2026-09-01', '2026-09-10'] })
      expect(seeded.value()).toEqual(['2026-09-01', '2026-09-10'])
      expect(seeded.startValue()).toBe('2026-09-01')
      expect(seeded.endValue()).toBe('2026-09-10')
    })
  })

  it('a defaultValue pair is normalized (ordered, zero-padded)', () => {
    createRoot(() => {
      const ins = createDateRangePicker({ defaultValue: ['2026-9-10', '2026-9-1'] })
      expect(ins.value()).toEqual(['2026-09-01', '2026-09-10'])
    })
  })

  it('controlled value wins', () => {
    createRoot(() => {
      const ins = createDateRangePicker({ value: ['2026-09-01', '2026-09-30'] })
      step(() => ins.pickDay(cellOf(ins, '2026-09-15')))
      expect(ins.value()).toEqual(['2026-09-01', '2026-09-30'])
    })
  })

  it('setValue orders an inverted pair', () => {
    createRoot(() => {
      const ins = createDateRangePicker()
      step(() => ins.setValue(['2026-09-20', '2026-09-01']))
      expect(ins.value()).toEqual(['2026-09-01', '2026-09-20'])
    })
  })

  it('clear empties the pair and resets the active end', () => {
    createRoot(() => {
      const ins = createDateRangePicker({ defaultValue: ['2026-09-01', '2026-09-10'] })
      step(() => ins.clear())
      expect(ins.value()).toBeNull()
      expect(ins.activeEnd()).toBe('start')
    })
  })
})

describe('createDateRangePicker — pick flow', () => {
  it('first pick seeds [iso, iso] and flips active to end', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createDateRangePicker({ onChange })
      step(() => ins.setOpen(true))
      step(() => ins.pickDay(cellOf(ins, '2026-09-05')))
      expect(ins.value()).toEqual(['2026-09-05', '2026-09-05'])
      expect(ins.activeEnd()).toBe('end')
      expect(ins.isComplete()).toBe(true)
      expect(onChange).toHaveBeenCalledWith(['2026-09-05', '2026-09-05'])
    })
  })

  it('second pick on a later date completes the range', () => {
    createRoot(() => {
      const ins = createDateRangePicker()
      step(() => ins.setOpen(true))
      step(() => ins.pickDay(cellOf(ins, '2026-09-05')))
      step(() => ins.pickDay(cellOf(ins, '2026-09-20')))
      expect(ins.value()).toEqual(['2026-09-05', '2026-09-20'])
    })
  })

  it('second pick BEFORE the start restarts the range', () => {
    createRoot(() => {
      const ins = createDateRangePicker()
      step(() => ins.setOpen(true))
      step(() => ins.pickDay(cellOf(ins, '2026-09-05')))
      step(() => ins.pickDay(cellOf(ins, '2026-09-02')))
      // Restart: the new date becomes the new [start, start] seed.
      expect(ins.value()).toEqual(['2026-09-02', '2026-09-02'])
    })
  })

  it('re-opening a complete pair resets the active end to start', () => {
    createRoot(() => {
      const ins = createDateRangePicker()
      step(() => ins.setOpen(true))
      step(() => ins.pickDay(cellOf(ins, '2026-09-05')))
      step(() => ins.pickDay(cellOf(ins, '2026-09-20')))
      step(() => ins.setOpen(false))
      step(() => ins.setOpen(true))
      expect(ins.activeEnd()).toBe('start')
    })
  })

  it('typing into the start end rewrites that end live', () => {
    createRoot(() => {
      const ins = createDateRangePicker({ defaultValue: ['2026-09-01', '2026-09-10'] })
      step(() => ins.setInputText('start', '2026-08-15'))
      expect(ins.value()).toEqual(['2026-08-15', '2026-09-10'])
      expect(ins.textValue('start')).toBe('2026-08-15')
    })
  })

  it('typing an inverted pair swaps to keep start<=end', () => {
    createRoot(() => {
      const ins = createDateRangePicker({ defaultValue: ['2026-09-01', '2026-09-10'] })
      step(() => ins.setInputText('start', '2026-12-25'))
      expect(ins.value()).toEqual(['2026-12-25', '2026-12-25'])
    })
  })

  it('unparseable typing reverts on commit', () => {
    createRoot(() => {
      const ins = createDateRangePicker({ defaultValue: ['2026-09-01', '2026-09-10'] })
      step(() => ins.setInputText('start', 'not-a-date'))
      step(() => ins.commit('start'))
      expect(ins.value()).toEqual(['2026-09-01', '2026-09-10'])
    })
  })

  it('blur commit clamps into [min, max]', () => {
    createRoot(() => {
      const ins = createDateRangePicker({ min: '2026-09-01', max: '2026-09-30' })
      step(() => ins.setOpen(true))
      step(() => ins.setInputText('start', '2026-12-25'))
      step(() => ins.notifyBlur('start'))
      expect(ins.startValue()).toBe('2026-09-30')
    })
  })
})

describe('createDateRangePicker — panels', () => {
  it('left anchors at the start month; right shows the NEXT month', () => {
    createRoot(() => {
      const ins = createDateRangePicker({ defaultValue: ['2026-09-01', '2026-09-10'] })
      step(() => ins.setOpen(true))
      expect(ins.leftView()).toEqual({ year: 2026, month: 9 })
      expect(ins.rightView()).toEqual({ year: 2026, month: 10 })
      expect(ins.leftMatrix().flat().some(c => c.iso === '2026-09-15')).toBe(true)
      expect(ins.rightMatrix().flat().some(c => c.iso === '2026-10-15')).toBe(true)
    })
  })

  it('left anchors at TODAY when empty', () => {
    createRoot(() => {
      const ins = createDateRangePicker()
      step(() => ins.setOpen(true))
      const t = todayParts()
      expect(ins.leftView()).toEqual({ year: t.year, month: t.month })
    })
  })

  it('setLeftView drives the right panel (left+1)', () => {
    createRoot(() => {
      const ins = createDateRangePicker()
      step(() => ins.setOpen(true))
      step(() => ins.setLeftView(2026, 12))
      expect(ins.rightView()).toEqual({ year: 2027, month: 1 })
    })
  })
})

describe('createDateRangePicker — rangeCellState', () => {
  it('marks endpoints + in-range cells (no half-open highlight on equal pair)', () => {
    createRoot(() => {
      const ins = createDateRangePicker({ defaultValue: ['2026-09-05', '2026-09-10'] })
      step(() => ins.setOpen(true))
      expect(ins.rangeCellState(cellOf(ins, '2026-09-05'))['range-start']).toBe(true)
      expect(ins.rangeCellState(cellOf(ins, '2026-09-05')).selected).toBe(true)
      expect(ins.rangeCellState(cellOf(ins, '2026-09-10'))['range-end']).toBe(true)
      expect(ins.rangeCellState(cellOf(ins, '2026-09-07')).inRange).toBe(true)
      expect(ins.rangeCellState(cellOf(ins, '2026-09-07')).selected).toBe(false)
      expect(ins.rangeCellState(cellOf(ins, '2026-09-04')).inRange).toBe(false)
    })
  })

  it('an equal pair [iso, iso] highlights no in-range cells', () => {
    createRoot(() => {
      const ins = createDateRangePicker({ defaultValue: ['2026-09-05', '2026-09-05'] })
      step(() => ins.setOpen(true))
      expect(ins.rangeCellState(cellOf(ins, '2026-09-06')).inRange).toBe(false)
      expect(ins.rangeCellState(cellOf(ins, '2026-09-05')).selected).toBe(true)
    })
  })

  it('hover preview paints the pending range while the end is open', () => {
    createRoot(() => {
      const ins = createDateRangePicker()
      step(() => ins.setOpen(true))
      step(() => ins.pickDay(cellOf(ins, '2026-09-05')))
      step(() => ins.hoverReport('2026-09-09'))
      expect(ins.rangeCellState(cellOf(ins, '2026-09-07')).hoverInRange).toBe(true)
      expect(ins.rangeCellState(cellOf(ins, '2026-09-09')).hoverEndpoint).toBe(true)
      expect(ins.rangeCellState(cellOf(ins, '2026-09-09')).hoverInRange).toBe(false)
      // hover BEFORE the pending start still previews (bidirectional).
      step(() => ins.hoverReport('2026-09-01'))
      expect(ins.rangeCellState(cellOf(ins, '2026-09-03')).hoverInRange).toBe(true)
    })
  })

  it('cells before the start are disabled for the end pick (once the pair diverges)', () => {
    createRoot(() => {
      const ins = createDateRangePicker({ defaultValue: ['2026-09-05', '2026-09-05'] })
      step(() => ins.setOpen(true))
      // Re-open with a pending [seed, seed] pair keeps every direction
      // pickable (restart semantics); after the pair DIVERGES (a real span),
      // the earlier dates become disabled for the end pick.
      expect(ins.rangeCellState(cellOf(ins, '2026-09-03')).disabled).toBe(false)
      step(() => ins.setValue(['2026-09-05', '2026-09-08']))
      step(() => ins.focusEnd('end'))
      expect(ins.rangeCellState(cellOf(ins, '2026-09-03')).disabled).toBe(true)
      expect(ins.rangeCellState(cellOf(ins, '2026-09-10')).disabled).toBe(false)
    })
  })

  it('min/max and disabledDate disable cells in BOTH panels', () => {
    createRoot(() => {
      const ins = createDateRangePicker({ min: '2026-09-01', max: '2026-10-31' })
      step(() => ins.setOpen(true))
      expect(ins.rangeCellState(cellOf(ins, '2026-08-31')).disabled).toBe(true)
      // October's late days are fine; November is out of view but blocked by canNext.
      expect(ins.rangeCellState(cellOf(ins, '2026-10-15')).disabled).toBe(false)
      expect(ins.canNext()).toBe(false)

      const dis = createDateRangePicker({ disabledDate: iso => iso === '2026-09-10' })
      step(() => dis.setOpen(true))
      expect(dis.rangeCellState(cellOf(dis, '2026-09-10')).disabled).toBe(true)
    })
  })
})

describe('createDateRangePicker — keyboard active', () => {
  it('active anchors at the start (else today); arrows walk and re-anchor the left view', () => {
    createRoot(() => {
      const ins = createDateRangePicker({ defaultValue: ['2026-09-05', '2026-09-10'] })
      step(() => ins.setOpen(true))
      expect(ins.activeIso()).toBe('2026-09-05')
      step(() => ins.moveActive(1, 0))
      expect(ins.activeIso()).toBe('2026-09-06')
      // Walking off the left view month drags the view along.
      step(() => ins.moveActive(-10, 0))
      expect(parseDate(ins.activeIso())!.month).toBe(8)
      expect(ins.leftView().month).toBe(8)
    })
  })

  it('PageUp/PageDown move a month keeping the day clamped', () => {
    createRoot(() => {
      const ins = createDateRangePicker({ defaultValue: ['2026-01-31', '2026-02-05'] })
      step(() => ins.setOpen(true))
      step(() => ins.moveActiveMonth(1))
      expect(ins.activeIso()).toBe('2026-02-28')
    })
  })

  it('commitActive picks into the ACTIVE end', () => {
    createRoot(() => {
      const ins = createDateRangePicker()
      step(() => ins.setOpen(true))
      step(() => ins.moveActive(3, 0))
      const iso = ins.activeIso()
      step(() => ins.commitActive())
      expect(ins.value()).toEqual([iso, iso])
    })
  })
})

describe('createDateRangePicker — open/disabled', () => {
  it('open resets the view + active + hover', () => {
    createRoot(() => {
      const ins = createDateRangePicker({ defaultValue: ['2026-09-05', '2026-09-10'] })
      step(() => ins.setOpen(true))
      step(() => ins.setLeftView(2020, 1))
      step(() => ins.setOpen(false))
      step(() => ins.setOpen(true))
      expect(ins.leftView()).toEqual({ year: 2026, month: 9 })
    })
  })

  it('disabled gates everything', () => {
    createRoot(() => {
      const ins = createDateRangePicker({ disabled: true })
      step(() => ins.setOpen(true))
      expect(ins.isOpen()).toBe(false)
      step(() => ins.setValue(['2026-09-01', '2026-09-02']))
      expect(ins.value()).toBeNull()
    })
  })

  it('focusEnd switches the pick target', () => {
    createRoot(() => {
      const ins = createDateRangePicker({ defaultValue: ['2026-09-05', '2026-09-10'] })
      step(() => ins.focusEnd('end'))
      expect(ins.activeEnd()).toBe('end')
      step(() => ins.notifyFocus('end'))
      expect(ins.activeEnd()).toBe('end')
    })
  })
})

void formatDate
