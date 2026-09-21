import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRadio, createRadioGroup } from '../../../competence/src/radio'

const cleanups: (() => void)[] = []
afterEach(() => cleanups.splice(0).forEach(fn => fn()))
const root = (fn: () => void) => createRoot(dispose => { cleanups.push(dispose); fn() })

const step = (fn: () => void) => { fn(); flush() }

describe('createRadio — standalone', () => {
  // 默认不选中。
  it('defaults to unchecked', () => {
    root(() => {
      const ins = createRadio()
      expect(ins.checked()).toBe(false)
    })
  })

  // 默认 checked 只初始化一次。
  it('seeds from defaultChecked', () => {
    root(() => {
      const ins = createRadio({ defaultChecked: true })
      expect(ins.checked()).toBe(true)
    })
  })

  // 重复选中不重复回调。
  it('check fires onChange(true) once and stays checked', () => {
    root(() => {
      const onChange = vi.fn()
      const ins = createRadio({ onChange })
      step(() => ins.check())
      step(() => ins.check()) // second click: no-op
      expect(ins.checked()).toBe(true)
      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(true, undefined)
    })
  })

  // Radio 不能通过自身操作取消选中。
  it('a radio NEVER unchecks itself — setChecked(false) is a no-op', () => {
    root(() => {
      const ins = createRadio({ defaultChecked: true })
      step(() => ins.setChecked(false))
      expect(ins.checked()).toBe(true)
    })
  })

  // 禁用拦截选中。
  it('disabled blocks checking', () => {
    root(() => {
      const onChange = vi.fn()
      const ins = createRadio({ disabled: true, onChange })
      step(() => ins.check())
      expect(ins.checked()).toBe(false)
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // 受控值优先。
  it('controlled checked wins over the internal state', () => {
    root(() => {
      const ins = createRadio({ checked: false })
      step(() => ins.check())
      expect(ins.checked()).toBe(false)
    })
  })
})

describe('createRadioGroup — value state', () => {
  const options = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
  ]

  // 组默认未选中。
  it('starts undefined (nothing picked)', () => {
    root(() => {
      const group = createRadioGroup({ options })
      expect(group.value()).toBeUndefined()
    })
  })

  // 默认组值映射到标量选择。
  it('seeds from defaultValue (single key API)', () => {
    root(() => {
      const group = createRadioGroup({ options, defaultValue: 'banana' })
      expect(group.value()).toBe('banana')
      expect(group.isSelected('banana')).toBe(true)
      expect(group.isSelected('apple')).toBe(false)
    })
  })

  // 新选项替换旧选项。
  it('select replaces the previous pick', () => {
    root(() => {
      const onChange = vi.fn()
      const group = createRadioGroup({ options, defaultValue: 'apple', onChange })
      step(() => group.select('cherry'))
      expect(group.value()).toBe('cherry')
      expect(group.isSelected('apple')).toBe(false)
      expect(onChange).toHaveBeenCalledWith('cherry')
    })
  })

  // 再次点击已选项不发事件。
  it('re-clicking the selected radio does nothing', () => {
    root(() => {
      const onChange = vi.fn()
      const group = createRadioGroup({ options, defaultValue: 'apple', onChange })
      step(() => group.select('apple'))
      expect(group.value()).toBe('apple')
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // 禁用选项不能被选择。
  it('disabled options are unselectable', () => {
    root(() => {
      const group = createRadioGroup({
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b', disabled: true },
        ],
      })
      step(() => group.select('b'))
      expect(group.value()).toBeUndefined()
      expect(group.isDisabled('b')).toBe(true)
    })
  })

  // 组禁用覆盖所有选项。
  it('group-level disabled wins over per-option', () => {
    root(() => {
      const group = createRadioGroup({ options, disabled: true })
      expect(group.isDisabled('apple')).toBe(true)
      step(() => group.select('apple'))
      expect(group.value()).toBeUndefined()
    })
  })

  // 受控模式报告建议值但保持原值。
  it('controlled value wins; select still reports through onChange', () => {
    root(() => {
      const onChange = vi.fn()
      const group = createRadioGroup({ options, value: 'apple', onChange })
      step(() => group.select('banana'))
      expect(group.value()).toBe('apple') // still the controlled prop
      expect(onChange).toHaveBeenCalledWith('banana')
    })
  })

  // clear 重置可用选择。
  it('clear resets the selection', () => {
    root(() => {
      const group = createRadioGroup({ options, defaultValue: 'apple' })
      step(() => group.clear())
      expect(group.value()).toBeUndefined()
    })
  })

  // 底层 store 与组值保持同一状态。
  it('exposes the underlying selection store for future Select composition', () => {
    root(() => {
      const group = createRadioGroup({ options, defaultValue: 'apple' })
      const store = group.store()
      expect(store.value()).toEqual(['apple'])
      expect(store.isSelected('apple')).toBe(true)
    })
  })
})

// 挂载稳定后父层拒绝不改变组状态；动态值和禁用正常更新。
it('[radio.group.controlled-dynamic] stable controlled requests and release',()=>{
 root(()=>{
  const [value,setValue]=createSignal<string|number|undefined>(0,{ownedWrite:true}),[disabled,setDisabled]=createSignal(false,{ownedWrite:true}),cb=vi.fn(),raw=vi.fn()
  const group=createRadioGroup({get value(){return value()},get disabled(){return disabled()},onChange:cb,onSelectionChange:raw})
  flush();step(()=>group.select('0'));expect(group.value()).toBe(0);expect(cb).toHaveBeenCalledWith('0');expect(raw).toHaveBeenCalledWith(['0'])
  step(()=>setValue('0'));expect(group.isSelected('0')).toBe(true);step(()=>setDisabled(true));step(()=>group.clear());expect(cb).toHaveBeenCalledTimes(1);expect(raw).toHaveBeenCalledTimes(1)
  step(()=>setDisabled(false));step(()=>setValue(undefined));step(()=>group.select('new'));expect(group.value()).toBe('new');step(()=>group.clear());expect(group.value()).toBeUndefined();expect(raw).toHaveBeenLastCalledWith([])
 })
})
// 默认值更新不重建状态；动态 options 更新禁用判断，空组清理不制造虚假选择。
it('[radio.group.options] dynamic options and defaults',()=>{
 root(()=>{
  const [options,setOptions]=createSignal([{label:'零',value:0,disabled:true}],{ownedWrite:true})
  const group=createRadioGroup({get options(){return options()},defaultValue:0})
  expect(group.options()).toHaveLength(1);step(()=>group.clear());expect(group.value()).toBe(0)
  step(()=>setOptions([]));expect(group.isDisabled(0)).toBe(false);step(()=>group.clear());expect(group.value()).toBeUndefined()
 })
})
// 受控独立 Radio 的禁用和 checked 更新，保留原始事件身份。
it('[radio.dynamic] checked disabled and event identity',()=>{
 root(()=>{
  const [checked,setChecked]=createSignal(false,{ownedWrite:true}),[disabled,setDisabled]=createSignal(true,{ownedWrite:true}),cb=vi.fn(),event=new Event('change')
  const radio=createRadio({get checked(){return checked()},get disabled(){return disabled()},onChange:cb})
  step(()=>radio.check(event));expect(cb).not.toHaveBeenCalled();step(()=>setDisabled(false));step(()=>radio.check(event));expect(cb).toHaveBeenCalledWith(true,event);expect(radio.checked()).toBe(false)
  step(()=>setChecked(true));expect(radio.checked()).toBe(true)
 })
})
