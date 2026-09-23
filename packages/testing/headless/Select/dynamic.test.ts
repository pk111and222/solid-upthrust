import { createRoot, createSignal, flush } from 'solid-js'
import { expect, it, vi } from 'vitest'
import { createSelect, type SelectOption } from '../../../competence/src/select'

const options: SelectOption[] = [
  { label: '苹果', value: 'apple' }, { label: '香蕉', value: 'banana' },
]

// 运行中切换单选和多选后，选择上限与点击当前项的语义同步切换。
it('[select.mode.dynamic] mode changes update selection cardinality', () => {
  let dispose = () => {}
  try {
    createRoot(cleanup => {
      dispose = cleanup
      const [mode, setMode] = createSignal<'single' | 'multiple'>('single', { ownedWrite: true })
      const onChange = vi.fn()
      const select = createSelect({ get mode() { return mode() }, options, onChange })
      select.selectOption('apple'); flush()
      setMode('multiple'); flush()
      select.selectOption('banana'); flush()
      expect(select.value()).toEqual(['apple', 'banana'])
      select.selectOption('apple'); flush()
      expect(select.value()).toEqual(['banana'])
      setMode('single'); flush()
      select.selectOption('apple'); flush()
      expect(select.value()).toEqual(['apple'])
    })
  } finally { dispose() }
})

// 筛选和候选数组变化后，Enter 不得提交已不在可见菜单里的旧 activeKey。
it('[select.active.stale] stale active option cannot commit after filtering', () => {
  let dispose = () => {}
  try {
    createRoot(cleanup => {
      dispose = cleanup
      const select = createSelect({ options })
      select.setOpen(true); flush()
      select.setSearchValue('香蕉'); flush()
      expect(select.activeKey()).toBe('banana')
      select.setActiveKey('apple'); flush()
      select.commitActive(); flush()
      expect(select.value()).toEqual([])
    })
  } finally { dispose() }
})

// 标签模式输入已选中的标签名称后提交，不得把该标签切换为未选中。
it('[select.tags.existing] existing selected label remains selected', () => {
  let dispose = () => {}
  try {
    createRoot(cleanup => {
      dispose = cleanup
      const onChange = vi.fn()
      const select = createSelect({ mode: 'tags', options, defaultValue: ['apple'], onChange })
      select.setSearchValue('苹果'); flush()
      select.commitSearchAsTag(); flush()
      expect(select.value()).toEqual(['apple'])
      expect(onChange).not.toHaveBeenCalled()
    })
  } finally { dispose() }
})

// 未选中的键或禁用键不能发出 onDeselect，也不能制造空变更。
it('[select.deselect.invalid] absent and disabled keys are ignored', () => {
  let dispose = () => {}
  try {
    createRoot(cleanup => {
      dispose = cleanup
      const onChange = vi.fn(), onDeselect = vi.fn()
      const select = createSelect({ mode: 'multiple', options: [...options, { label: '禁用', value: 'disabled', disabled: true }], defaultValue: ['apple', 'disabled'], onChange, onDeselect })
      select.deselectOption('banana'); flush()
      select.deselectOption('disabled'); flush()
      expect(select.value()).toEqual(['apple', 'disabled'])
      expect(onChange).not.toHaveBeenCalled()
      expect(onDeselect).not.toHaveBeenCalled()
    })
  } finally { dispose() }
})
