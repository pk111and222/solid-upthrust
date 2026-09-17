import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createMentions, extractMentions, parseTrigger } from '../../../competence/src/mentions'

const step = (fn: () => void) => { fn(); flush() }

const people = [
  { value: 'afc163', label: 'afc163' },
  { value: 'zombiej', label: 'ZombieJ' },
  { value: 'yesmeck', label: 'Yesmeck' },
]

describe('parseTrigger (pure)', () => {
  it('detects the token under the caret', () => {
    const st = parseTrigger('hello @af', 9)
    expect(st.active).toBe(true)
    expect(st.query).toBe('af')
    expect(st.range).toEqual([6, 9])
  })

  it('inactive when the caret is outside any token', () => {
    expect(parseTrigger('hello @af world', 15).active).toBe(false)
    expect(parseTrigger('plain text', 5).active).toBe(false)
  })

  it('right after typing @ the query is empty and active', () => {
    const st = parseTrigger('hello @', 7)
    expect(st.active).toBe(true)
    expect(st.query).toBe('')
  })

  it('requires a boundary char before the prefix', () => {
    // 'a@b' — the @ follows a word char, not a boundary → inactive
    expect(parseTrigger('a@b', 3).active).toBe(false)
  })

  it('picks the token CONTAINING the caret, not an earlier one', () => {
    const st = parseTrigger('@one @tw', 8)
    expect(st.active).toBe(true)
    expect(st.query).toBe('tw')
    expect(st.range).toEqual([5, 8])
  })

  it('a custom prefix works', () => {
    const st = parseTrigger('hi #jo', 6, '#')
    expect(st.active).toBe(true)
    expect(st.query).toBe('jo')
  })

  it('newline terminates a token', () => {
    const st = parseTrigger('hello @jo\nnext', 9)
    expect(st.active).toBe(true)
    expect(st.range).toEqual([6, 9])
  })
})

describe('extractMentions (pure)', () => {
  it('collects every boundary-valid token', () => {
    expect(extractMentions('hi @afc163 and @zombiej')).toEqual(['afc163', 'zombiej'])
  })

  it('ignores prefix after a word char and empty tokens', () => {
    expect(extractMentions('mail@a.com @real')).toEqual(['real'])
    expect(extractMentions('lonely @')).toEqual([])
  })
})

describe('createMentions — text state', () => {
  it('typing updates the value and fires onChange', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createMentions({ onChange })
      step(() => ins.setText('hello @af'))
      expect(ins.value()).toBe('hello @af')
      expect(onChange).toHaveBeenCalledWith('hello @af')
    })
  })

  it('controlled value wins', () => {
    createRoot(() => {
      const ins = createMentions({ value: 'fixed' })
      step(() => ins.setText('other'))
      expect(ins.value()).toBe('fixed')
    })
  })
})

describe('createMentions — trigger & suggestions', () => {
  it('caret inside a token filters the pool by query', () => {
    createRoot(() => {
      const ins = createMentions({ options: people })
      step(() => ins.setText('hello @zo'))
      step(() => ins.setCaret(9))
      expect(ins.trigger().active).toBe(true)
      expect(ins.suggestions().map(o => o.value)).toEqual(['zombiej'])
    })
  })

  it('empty query shows the whole pool', () => {
    createRoot(() => {
      const ins = createMentions({ options: people })
      step(() => ins.setText('hello @'))
      step(() => ins.setCaret(7))
      expect(ins.suggestions()).toHaveLength(3)
    })
  })

  it('moving the caret out of the token deactivates', () => {
    createRoot(() => {
      const ins = createMentions({ options: people })
      step(() => ins.setText('hello @zo'))
      step(() => ins.setCaret(9))
      expect(ins.trigger().active).toBe(true)
      step(() => ins.setCaret(2))
      expect(ins.trigger().active).toBe(false)
      expect(ins.suggestions()).toEqual([])
    })
  })

  it('onSearch fires with the query and prefix', () => {
    createRoot(() => {
      const onSearch = vi.fn()
      const ins = createMentions({ options: people, onSearch })
      step(() => ins.setText('hi @af'))
      step(() => ins.setCaret(6))
      expect(onSearch).toHaveBeenCalledWith('af', '@')
    })
  })
})

describe('createMentions — selection', () => {
  it('selecting an option replaces the token and appends a space', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const onSelect = vi.fn()
      const ins = createMentions({ options: people, onChange, onSelect })
      step(() => ins.setText('hello @af rest'))
      step(() => ins.setCaret(9)) // caret inside '@af'
      step(() => ins.selectOption(people[0]))
      expect(ins.value()).toBe('hello @afc163  rest')
      expect(onSelect).toHaveBeenCalledWith(people[0], '@')
      expect(onChange).toHaveBeenLastCalledWith('hello @afc163  rest')
      // caret lands right after the inserted mention
      expect(ins.caret()).toBe('hello @afc163 '.length)
      // and the trigger is now inactive (caret sits after the space)
      expect(ins.trigger().active).toBe(false)
    })
  })

  it('commitActive picks the keyboard-highlighted row', () => {
    createRoot(() => {
      const ins = createMentions({ options: people })
      step(() => ins.setText('@'))
      step(() => ins.setCaret(1))
      expect(ins.activeValue()).toBe('afc163')
      step(() => ins.moveActive(1))
      expect(ins.activeValue()).toBe('zombiej')
      step(() => ins.commitActive())
      expect(ins.value()).toBe('@zombiej ')
    })
  })

  it('getMentions parses the final text', () => {
    createRoot(() => {
      const ins = createMentions({ options: people })
      step(() => ins.setText('cc @afc163 @zombiej'))
      expect(ins.getMentions()).toEqual(['afc163', 'zombiej'])
    })
  })

  it('a disabled option cannot be selected', () => {
    createRoot(() => {
      const pool = [{ value: 'x', disabled: true }]
      const ins = createMentions({ options: pool })
      step(() => ins.setText('@'))
      step(() => ins.setCaret(1))
      step(() => ins.selectOption(pool[0]))
      expect(ins.value()).toBe('@')
    })
  })
})

describe('createMentions — IME & misc', () => {
  it('composition buffers; compositionEnd commits once', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createMentions({ onChange })
      step(() => ins.notifyCompositionStart())
      step(() => ins.setText('你好'))
      expect(ins.value()).toBe('')
      expect(onChange).not.toHaveBeenCalled()
      step(() => ins.notifyCompositionEnd())
      expect(ins.value()).toBe('你好')
      expect(onChange).toHaveBeenCalledTimes(1)
    })
  })

  it('disabled gates selection and open', () => {
    createRoot(() => {
      const ins = createMentions({ options: people, disabled: true })
      step(() => ins.setOpen(true))
      expect(ins.isOpen()).toBe(false)
      step(() => ins.setText('@'))
      step(() => ins.setCaret(1))
      step(() => ins.selectOption(people[0]))
      expect(ins.value()).toBe('@')
    })
  })
})
