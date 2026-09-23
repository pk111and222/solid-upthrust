import { createRoot, createSignal, flush } from 'solid-js'
import { expect, it, vi } from 'vitest'
import { createMentions, extractMentions, parseTrigger } from '../../../competence/src/mentions'

// 长查询、换行与空前缀不会误判或卡住解析。
it('[mentions.parse.boundaries] accepts whitespace and long tokens safely', () => {
  expect(parseTrigger(`\t@${'a'.repeat(70)}`, 72).query).toBe('a'.repeat(70))
  expect(parseTrigger('@alice', 0).active).toBe(false)
  expect(extractMentions('x\t@alice\ny @bob')).toEqual(['alice', 'bob'])
  expect(extractMentions('hello', '')).toEqual([])
})

// 外部候选异步更新后无需重新输入，当前高亮和提交应使用最新候选。
it('[mentions.options.dynamic] refreshes suggestions and active option', () => {
  let dispose = () => {}
  try {
    createRoot(cleanup => {
      dispose = cleanup
      const [options, setOptions] = createSignal([{ value: 'alice' }], { ownedWrite: true })
      const mentions = createMentions({ get options() { return options() } })
      mentions.setTextAndCaret('@', 1); flush()
      expect(mentions.suggestions().map(option => option.value)).toEqual(['alice'])
      setOptions([{ value: 'bob' }]); flush()
      expect(mentions.suggestions().map(option => option.value)).toEqual(['bob'])
      expect(mentions.activeValue()).toBe('bob')
      mentions.commitActive(); flush()
      expect(mentions.value()).toBe('@bob ')
    })
  } finally { dispose() }
})

// 受控父层改值后，触发词与候选应同步到最终接受的文本。
it('[mentions.value.controlled] follows parent text updates', () => {
  let dispose = () => {}
  try {
    createRoot(cleanup => {
      dispose = cleanup
      const [value, setValue] = createSignal('@a', { ownedWrite: true })
      const mentions = createMentions({ get value() { return value() }, options: [{ value: 'alice' }, { value: 'bob' }] })
      expect(mentions.suggestions().map(option => option.value)).toEqual(['alice'])
      setValue('@b'); flush()
      expect(mentions.suggestions().map(option => option.value)).toEqual(['bob'])
    })
  } finally { dispose() }
})

// 输入法提交按真实光标发一次变更与搜索，不在组合期间选中候选。
it('[mentions.ime.caret] commits composition with the final caret', () => {
  let dispose = () => {}
  try {
    createRoot(cleanup => {
      dispose = cleanup
      const onChange = vi.fn(), onSearch = vi.fn()
      const mentions = createMentions({ options: [{ value: '中文' }], onChange, onSearch })
      mentions.notifyCompositionStart(); flush()
      mentions.setTextAndCaret('@中', 2); flush()
      expect(onChange).not.toHaveBeenCalled()
      mentions.notifyCompositionEnd(2); flush()
      expect(onChange).toHaveBeenCalledExactlyOnceWith('@中')
      expect(onSearch).toHaveBeenCalledExactlyOnceWith('中', '@')
      expect(mentions.caret()).toBe(2)
    })
  } finally { dispose() }
})

// 自定义分隔符避免重复插入，并将光标移至原有分隔符之后。
it('[mentions.split.insert] reuses an existing delimiter', () => {
  let dispose = () => {}
  try {
    createRoot(cleanup => {
      dispose = cleanup
      const option = { value: 'topic' }
      const mentions = createMentions({ prefix: '#', split: ',', options: [option] })
      mentions.setTextAndCaret('a,#to,rest', 5); flush()
      const caret = mentions.selectOption(option)
      expect(caret).toBe('a,#topic,'.length)
      flush()
      expect(mentions.value()).toBe('a,#topic,rest')
      expect(mentions.caret()).toBe('a,#topic,'.length)
      expect(mentions.trigger().active).toBe(false)
    })
  } finally { dispose() }
})

// 自定义过滤器按调用方规则选择候选，而非默认包含匹配。
it('[mentions.filter.custom] uses the supplied predicate', () => {
  let dispose = () => {}
  try {
    createRoot(cleanup => {
      dispose = cleanup
      const mentions = createMentions({
        options: [{ value: 'alice' }, { value: 'alex' }],
        filterOption: (query, option) => option.value.endsWith(query),
      })
      mentions.setTextAndCaret('@ice', 4); flush()
      expect(mentions.suggestions().map(option => option.value)).toEqual(['alice'])
    })
  } finally { dispose() }
})
