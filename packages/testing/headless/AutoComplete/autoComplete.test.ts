import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createAutoComplete } from '../../../competence/src/autoComplete'

let dispose = () => {}
afterEach(() => { dispose(); flush() })
const root = (run: () => void) => createRoot(d => { dispose = d; run() })

const step = (fn: () => void) => { fn(); flush() }

const pool = [
  { value: 'burn', label: 'Burns Bay Bridge' },
  { value: 'sam', label: 'Sam Street' },
  { value: 'sha', label: 'Shanghai Tower' },
  { value: 'zzz', label: 'Zzz', disabled: true },
]

describe('createAutoComplete — text state', () => {
  // 验证当前用例描述的文本、过滤或键盘公开契约。
  it('starts empty (or from defaultValue)', () => {
    root(() => {
      expect(createAutoComplete().value()).toBe('')
      expect(createAutoComplete({ defaultValue: 'abc' }).value()).toBe('abc')
    })
  })

  // 验证当前用例描述的文本、过滤或键盘公开契约。
  it('typing fires onChange + onSearch and updates the value', () => {
    root(() => {
      const onChange = vi.fn()
      const onSearch = vi.fn()
      const ins = createAutoComplete({ onChange, onSearch })
      step(() => ins.setInputText('b'))
      expect(ins.value()).toBe('b')
      expect(onChange).toHaveBeenCalledWith('b')
      expect(onSearch).toHaveBeenCalledWith('b')
    })
  })

  // 验证当前用例描述的文本、过滤或键盘公开契约。
  it('controlled value wins; typing still reports', () => {
    root(() => {
      const onChange = vi.fn()
      const ins = createAutoComplete({ value: 'x', onChange })
      step(() => ins.setInputText('y'))
      expect(ins.value()).toBe('x') // still controlled
      expect(onChange).toHaveBeenCalledWith('y')
    })
  })
})

describe('createAutoComplete — suggestions & filtering', () => {
  // 验证当前用例描述的文本、过滤或键盘公开契约。
  it('default filter matches value or label (case-insensitive substring)', () => {
    root(() => {
      const ins = createAutoComplete({ options: pool })
      step(() => ins.setInputText('sam'))
      expect(ins.suggestions().map(o => o.value)).toEqual(['sam'])
      step(() => ins.setInputText('bridge'))
      expect(ins.suggestions().map(o => o.value)).toEqual(['burn'])
    })
  })

  // 验证当前用例描述的文本、过滤或键盘公开契约。
  it('empty input shows the whole pool', () => {
    root(() => {
      const ins = createAutoComplete({ options: pool })
      step(() => ins.setInputText(''))
      expect(ins.suggestions()).toHaveLength(4) // disabled included until picked
    })
  })

  // 验证当前用例描述的文本、过滤或键盘公开契约。
  it('filterOption: false disables client filtering', () => {
    root(() => {
      const ins = createAutoComplete({ options: pool, filterOption: false })
      step(() => ins.setInputText('zzz-no-match'))
      expect(ins.suggestions()).toHaveLength(4)
    })
  })

  // 验证当前用例描述的文本、过滤或键盘公开契约。
  it('custom filterOption predicate is honored', () => {
    root(() => {
      const ins = createAutoComplete({
        options: pool,
        filterOption: (input, option) => option.value === input,
      })
      step(() => ins.setInputText('sha'))
      expect(ins.suggestions().map(o => o.value)).toEqual(['sha'])
    })
  })
})

describe('createAutoComplete — IME composition', () => {
  // 验证当前用例描述的文本、过滤或键盘公开契约。
  it('composition keystrokes buffer only; compositionEnd commits once', () => {
    root(() => {
      const onChange = vi.fn()
      const ins = createAutoComplete({ onChange })
      step(() => ins.notifyCompositionStart())
      step(() => ins.setInputText('中'))
      expect(ins.value()).toBe('') // not committed mid-IME
      expect(onChange).not.toHaveBeenCalled()
      step(() => ins.setInputText('中国'))
      step(() => ins.notifyCompositionEnd())
      expect(ins.value()).toBe('中国')
      expect(onChange).toHaveBeenCalledTimes(1) // committed ONCE
      expect(onChange).toHaveBeenCalledWith('中国')
    })
  })
})

describe('createAutoComplete — selection', () => {
  // 验证当前用例描述的文本、过滤或键盘公开契约。
  it('selectOption replaces the text with the label and fires onSelect', () => {
    root(() => {
      const onChange = vi.fn()
      const onSelect = vi.fn()
      const ins = createAutoComplete({ options: pool, onChange, onSelect })
      step(() => ins.setInputText('burn'))
      step(() => ins.selectOption(pool[0]))
      expect(ins.value()).toBe('Burns Bay Bridge')
      expect(onSelect).toHaveBeenCalledWith('burn', pool[0])
      expect(onChange).toHaveBeenLastCalledWith('Burns Bay Bridge')
    })
  })

  // 验证当前用例描述的文本、过滤或键盘公开契约。
  it('a disabled option cannot be selected', () => {
    root(() => {
      const ins = createAutoComplete({ options: pool })
      step(() => ins.selectOption(pool[3]))
      expect(ins.value()).toBe('')
    })
  })

  // 验证当前用例描述的文本、过滤或键盘公开契约。
  it('commitActive picks the keyboard-highlighted row (Enter)', () => {
    root(() => {
      const ins = createAutoComplete({ options: pool })
      step(() => ins.setInputText('s'))
      // filtered+enabled order: burn ('Burns'), sam, sha — the active
      // anchors to the first enabled match.
      expect(ins.activeValue()).toBe('burn')
      step(() => ins.moveActive(2))
      expect(ins.activeValue()).toBe('sha')
      step(() => ins.commitActive())
      expect(ins.value()).toBe('Shanghai Tower')
    })
  })

  // 验证当前用例描述的文本、过滤或键盘公开契约。
  it('moveActive wraps and skips disabled', () => {
    root(() => {
      const ins = createAutoComplete({ options: pool })
      step(() => ins.setInputText('')) // all 4 suggestions
      step(() => ins.moveActive(-1)) // wraps to last enabled = sha
      expect(ins.activeValue()).toBe('sha')
      step(() => ins.moveActive(1)) // wraps to first = burn
      expect(ins.activeValue()).toBe('burn')
    })
  })
})

describe('createAutoComplete — open state', () => {
  // 验证当前用例描述的文本、过滤或键盘公开契约。
  it('controlled open wins; setOpen still reports through onOpenChange', () => {
    root(() => {
      const onOpenChange = vi.fn()
      const ins = createAutoComplete({ open: false, onOpenChange })
      step(() => ins.setOpen(true))
      expect(ins.isOpen()).toBe(false)
      expect(onOpenChange).toHaveBeenCalledWith(true)
    })
  })

  // 验证当前用例描述的文本、过滤或键盘公开契约。
  it('open re-anchors the active suggestion against the current value', () => {
    root(() => {
      const ins = createAutoComplete({ options: pool, value: 'sam' })
      step(() => ins.setOpen(true))
      expect(ins.activeValue()).toBe('sam')
    })
  })

  // 验证当前用例描述的文本、过滤或键盘公开契约。
  it('disabled blocks setOpen and selectOption', () => {
    root(() => {
      const ins = createAutoComplete({ options: pool, disabled: true })
      step(() => ins.setOpen(true))
      expect(ins.isOpen()).toBe(false)
      step(() => ins.selectOption(pool[0]))
      expect(ins.value()).toBe('')
      expect(ins.isDisabled()).toBe(true)
    })
  })
})
