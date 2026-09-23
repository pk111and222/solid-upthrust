import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { createTreeSelect, type TreeSelectNode } from '../../../competence/src/tree'

const nodes: TreeSelectNode[] = [
  { value: 'parent', label: '父节点', children: [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }] },
]
let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })

// 非复选多选应允许逐行选择与取消，并报告键数组和对应节点。
it('[tree-select.multiple.rows] non-checkable mode toggles rows', () => {
  createRoot(cleanup => {
    dispose = cleanup
    const change = vi.fn(), select = vi.fn(), deselect = vi.fn()
    const picker = createTreeSelect({ treeData: nodes, mode: 'multiple', treeCheckable: false, onChange: change, onSelect: select, onDeselect: deselect })
    picker.pickNode('parent'); flush()
    expect(picker.value()).toEqual(['parent'])
    expect(change).toHaveBeenLastCalledWith(['parent'], [nodes[0]])
    expect(select).toHaveBeenCalledWith('parent', nodes[0])
    picker.pickNode('parent'); flush()
    expect(picker.value()).toEqual([])
    expect(deselect).toHaveBeenCalledWith('parent', nodes[0])
  })
})

// 受控单选和复选多选应在父层拒绝变更时保持原值，接受更新后才改变。
it('[tree-select.controlled.selection] parent owns accepted value', () => {
  createRoot(cleanup => {
    dispose = cleanup
    const [single, setSingle] = createSignal<string | undefined>('a', { ownedWrite: true })
    const [multiple, setMultiple] = createSignal<Array<string | number>>(['a'], { ownedWrite: true })
    const singleChange = vi.fn(), multipleChange = vi.fn()
    const one = createTreeSelect({ treeData: nodes, get value() { return single() }, onChange: singleChange })
    const many = createTreeSelect({ treeData: nodes, mode: 'multiple', get value() { return multiple() }, onChange: multipleChange })
    one.pickNode('b'); many.toggleCheck('b'); flush()
    expect(singleChange).toHaveBeenCalledWith('b', nodes[0].children?.[1])
    expect(multipleChange).toHaveBeenCalled()
    expect(one.singleValue()).toBe('a')
    expect(many.value()).toEqual(['a'])
    setSingle('b'); setMultiple(['parent']); flush()
    expect(one.singleValue()).toBe('b')
    expect(many.value()).toEqual(['parent'])
    setSingle(undefined); setMultiple([]); flush()
    expect(one.singleValue()).toBeUndefined()
    expect(many.value()).toEqual([])
  })
})

// 初始空值后异步进入受控模式，后续写回 undefined 也必须清空。
it('[tree-select.controlled.late] accepts a late controlled value and clear', () => {
  createRoot(cleanup => {
    dispose = cleanup
    const [value, setValue] = createSignal<string | undefined>(undefined, { ownedWrite: true })
    const picker = createTreeSelect({ treeData: nodes, get value() { return value() } })
    expect(picker.singleValue()).toBeUndefined()
    setValue('a'); flush()
    expect(picker.singleValue()).toBe('a')
    picker.pickNode('b'); flush()
    expect(picker.singleValue()).toBe('a')
    setValue(undefined); flush()
    expect(picker.singleValue()).toBeUndefined()
  })
})
