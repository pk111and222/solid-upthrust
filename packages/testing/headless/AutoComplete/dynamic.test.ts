import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { createAutoComplete, type AutoCompleteOption } from '../../../competence/src/autoComplete'
let dispose = () => {}
afterEach(() => { dispose(); flush() })
const root = (run: () => void) => createRoot(d => { dispose = d; run() })

// 远程候选、受控值与过滤函数更新都必须立即重算列表，不能等待再次输入。
it('[autocomplete.dynamic.suggestions] tracks all external inputs', () => root(() => {
  const [options, setOptions] = createSignal<AutoCompleteOption[]>([{ value: 'a' }], { ownedWrite: true })
  const [value, setValue] = createSignal('a', { ownedWrite: true })
  const [filter, setFilter] = createSignal<false | undefined>(undefined, { ownedWrite: true })
  const m = createAutoComplete({ get options() { return options() }, get value() { return value() }, get filterOption() { return filter() } })
  setOptions([{ value: 'a2' }, { value: 'b' }]); flush()
  expect(m.suggestions().map(o => o.value)).toEqual(['a2'])
  setValue('b'); flush()
  expect(m.suggestions().map(o => o.value)).toEqual(['b'])
  setFilter(false); flush()
  expect(m.suggestions()).toHaveLength(2)
}))

// 父层拒绝受控输入时，候选应继续对应实际 value，而不是被拒绝的文本。
it('[autocomplete.controlled.filter] rejected edits do not drift suggestions', () => root(() => {
  const m = createAutoComplete({ value: 'a', options: [{ value: 'a' }, { value: 'b' }] })
  m.setInputText('b'); flush()
  expect(m.value()).toBe('a')
  expect(m.suggestions().map(o => o.value)).toEqual(['a'])
}))

// 候选被移除或禁用后，不能由旧 active 值提交；默认打开也应有有效高亮。
it('[autocomplete.dynamic.active] stale active cannot be committed', () => root(() => {
  const [options, setOptions] = createSignal<AutoCompleteOption[]>([{ value: 'a' }, { value: 'b' }], { ownedWrite: true })
  const selected = vi.fn()
  const m = createAutoComplete({ defaultOpen: true, get options() { return options() }, onSelect: selected })
  flush(); expect(m.activeValue()).toBe('a')
  m.setActiveValue('b'); flush()
  setOptions([{ value: 'a', disabled: true }]); flush()
  expect(m.activeValue()).toBeUndefined()
  m.commitActive(); flush(); expect(selected).not.toHaveBeenCalled()
}))

// 禁用必须覆盖文本输入、组合输入与导航等命令式入口。
it('[autocomplete.disabled.commands] blocks editing and composition', () => root(() => {
  const changed = vi.fn()
  const m = createAutoComplete({ disabled: true, options: [{ value: 'a' }], onChange: changed })
  m.setInputText('a'); m.notifyCompositionStart(); m.moveActive(1); flush()
  expect(m.value()).toBe(''); expect(m.isComposing()).toBe(false)
  expect(m.activeValue()).toBeUndefined(); expect(changed).not.toHaveBeenCalled()
}))
