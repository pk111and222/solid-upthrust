import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createMentions, extractMentions, parseTrigger } from '../../../competence/src/mentions'

const step = (fn: () => void) => { fn(); flush() }
const inRoot = (run: () => void) => {
  let dispose = () => {}
  try { createRoot(cleanup => { dispose = cleanup; run() }) } finally { dispose() }
}

const people = [
  { value: 'afc163', label: 'afc163' },
  { value: 'zombiej', label: 'ZombieJ' },
  { value: 'yesmeck', label: 'Yesmeck' },
]

describe('parseTrigger (pure)', () => {
  // 光标位于词内时识别当前提及。
  it('detects the token under the caret', () => {
    const st = parseTrigger('hello @af', 9)
    expect(st.active).toBe(true)
    expect(st.query).toBe('af')
    expect(st.range).toEqual([6, 9])
  })

  // 光标在提及词外或普通文本中保持关闭。
  it('inactive when the caret is outside any token', () => {
    expect(parseTrigger('hello @af world', 15).active).toBe(false)
    expect(parseTrigger('plain text', 5).active).toBe(false)
  })

  // 仅输入前缀时允许空查询。
  it('right after typing @ the query is empty and active', () => {
    const st = parseTrigger('hello @', 7)
    expect(st.active).toBe(true)
    expect(st.query).toBe('')
  })

  // 词内邮箱符号不会误触发。
  it('requires a boundary char before the prefix', () => {
    // 'a@b' — the @ follows a word char, not a boundary → inactive
    expect(parseTrigger('a@b', 3).active).toBe(false)
  })

  // 多个提及时选择光标所在词。
  it('picks the token CONTAINING the caret, not an earlier one', () => {
    const st = parseTrigger('@one @tw', 8)
    expect(st.active).toBe(true)
    expect(st.query).toBe('tw')
    expect(st.range).toEqual([5, 8])
  })

  // 自定义前缀参与识别。
  it('a custom prefix works', () => {
    const st = parseTrigger('hi #jo', 6, '#')
    expect(st.active).toBe(true)
    expect(st.query).toBe('jo')
  })

  // 换行符结束当前提及词。
  it('newline terminates a token', () => {
    const st = parseTrigger('hello @jo\nnext', 9)
    expect(st.active).toBe(true)
    expect(st.range).toEqual([6, 9])
  })
})

describe('extractMentions (pure)', () => {
  // 提取所有位于边界后的提及。
  it('collects every boundary-valid token', () => {
    expect(extractMentions('hi @afc163 and @zombiej')).toEqual(['afc163', 'zombiej'])
  })

  // 忽略邮箱内的前缀和空提及。
  it('ignores prefix after a word char and empty tokens', () => {
    expect(extractMentions('mail@a.com @real')).toEqual(['real'])
    expect(extractMentions('lonely @')).toEqual([])
  })
})

describe('createMentions — text state', () => {
  // 非受控输入更新文本并发出变更。
  it('typing updates the value and fires onChange', () => {
    inRoot(() => {
      const onChange = vi.fn()
      const ins = createMentions({ onChange })
      step(() => ins.setText('hello @af'))
      expect(ins.value()).toBe('hello @af')
      expect(onChange).toHaveBeenCalledWith('hello @af')
    })
  })

  // 受控文本始终由外部值决定。
  it('controlled value wins', () => {
    inRoot(() => {
      const ins = createMentions({ value: 'fixed' })
      step(() => ins.setText('other'))
      expect(ins.value()).toBe('fixed')
    })
  })
})

describe('createMentions — trigger & suggestions', () => {
  // 光标所在词过滤候选。
  it('caret inside a token filters the pool by query', () => {
    inRoot(() => {
      const ins = createMentions({ options: people })
      step(() => ins.setText('hello @zo'))
      step(() => ins.setCaret(9))
      expect(ins.trigger().active).toBe(true)
      expect(ins.suggestions().map(o => o.value)).toEqual(['zombiej'])
    })
  })

  // 空查询展示全部候选。
  it('empty query shows the whole pool', () => {
    inRoot(() => {
      const ins = createMentions({ options: people })
      step(() => ins.setText('hello @'))
      step(() => ins.setCaret(7))
      expect(ins.suggestions()).toHaveLength(3)
    })
  })

  // 光标移出词后清空建议。
  it('moving the caret out of the token deactivates', () => {
    inRoot(() => {
      const ins = createMentions({ options: people })
      step(() => ins.setText('hello @zo'))
      step(() => ins.setCaret(9))
      expect(ins.trigger().active).toBe(true)
      step(() => ins.setCaret(2))
      expect(ins.trigger().active).toBe(false)
      expect(ins.suggestions()).toEqual([])
    })
  })

  // 查询变化回传文本与前缀。
  it('onSearch fires with the query and prefix', () => {
    inRoot(() => {
      const onSearch = vi.fn()
      const ins = createMentions({ options: people, onSearch })
      step(() => ins.setText('hi @af'))
      step(() => ins.setCaret(6))
      expect(onSearch).toHaveBeenCalledWith('af', '@')
    })
  })
})

describe('createMentions — selection', () => {
  // 选中候选替换当前词并移动光标。
  it('selecting an option replaces the token and appends a space', () => {
    inRoot(() => {
      const onChange = vi.fn()
      const onSelect = vi.fn()
      const ins = createMentions({ options: people, onChange, onSelect })
      step(() => ins.setText('hello @af rest'))
      step(() => ins.setCaret(9)) // caret inside '@af'
      step(() => ins.selectOption(people[0]))
      expect(ins.value()).toBe('hello @afc163 rest')
      expect(onSelect).toHaveBeenCalledWith(people[0], '@')
      expect(onChange).toHaveBeenLastCalledWith('hello @afc163 rest')
      // caret lands right after the inserted mention
      expect(ins.caret()).toBe('hello @afc163 '.length)
      // and the trigger is now inactive (caret sits after the space)
      expect(ins.trigger().active).toBe(false)
    })
  })

  // Enter 提交键盘高亮候选。
  it('commitActive picks the keyboard-highlighted row', () => {
    inRoot(() => {
      const ins = createMentions({ options: people })
      step(() => ins.setText('@'))
      step(() => ins.setCaret(1))
      expect(ins.activeValue()).toBe('afc163')
      step(() => ins.moveActive(1))
      expect(ins.activeValue()).toBe('zombiej')
      let targetCaret: number | undefined
      step(() => { targetCaret = ins.commitActive() })
      expect(ins.value()).toBe('@zombiej ')
      expect(targetCaret).toBe('@zombiej '.length)
    })
  })

  // 解析最终文本中的提及。
  it('getMentions parses the final text', () => {
    inRoot(() => {
      const ins = createMentions({ options: people })
      step(() => ins.setText('cc @afc163 @zombiej'))
      expect(ins.getMentions()).toEqual(['afc163', 'zombiej'])
    })
  })

  // 禁用候选不能提交。
  it('a disabled option cannot be selected', () => {
    inRoot(() => {
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
  // 输入法组合期间不发变更，结束后只提交一次。
  it('composition buffers; compositionEnd commits once', () => {
    inRoot(() => {
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

  // 禁用状态阻止选择和手动打开。
  it('disabled gates selection and open', () => {
    inRoot(() => {
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
