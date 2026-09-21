import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createCheckbox, createCheckboxGroup } from '../../../competence/src/checkbox'

const cleanups: (() => void)[] = []
afterEach(() => { cleanups.splice(0).forEach(fn => fn()) })
const root = (fn: () => void) => createRoot(dispose => { cleanups.push(dispose); fn() })

const step = (fn: () => void) => { fn(); flush() }

describe('createCheckbox — value state', () => {
  // 默认不勾选。
  it('defaults to unchecked', () => {
    root(() => {
      const ins = createCheckbox()
      expect(ins.checked()).toBe(false)
    })
  })

  // defaultChecked 初始化为选中。
  it('seeds from defaultChecked', () => {
    root(() => {
      const ins = createCheckbox({ defaultChecked: true })
      expect(ins.checked()).toBe(true)
    })
  })

  // 受控值不会随内部切换自行漂移。
  it('controlled checked wins over the internal state', () => {
    root(() => {
      const ins = createCheckbox({ checked: true })
      step(() => ins.toggle())
      expect(ins.checked()).toBe(true)
    })
  })
})

describe('createCheckbox — toggling', () => {
  // 切换状态并报告下一值。
  it('toggle flips and fires onChange with the NEXT value', () => {
    root(() => {
      const onChange = vi.fn()
      const ins = createCheckbox({ onChange })
      step(() => ins.toggle())
      expect(ins.checked()).toBe(true)
      expect(onChange).toHaveBeenCalledWith(true, undefined)
    })
  })

  // 禁用阻止切换与回调。
  it('disabled blocks toggling', () => {
    root(() => {
      const onChange = vi.fn()
      const ins = createCheckbox({ disabled: true, onChange })
      step(() => ins.toggle())
      expect(ins.checked()).toBe(false)
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // 相同值不重复回调。
  it('setChecked is a no-op on same value', () => {
    root(() => {
      const onChange = vi.fn()
      const ins = createCheckbox({ defaultChecked: true, onChange })
      step(() => ins.setChecked(true))
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // 半选不参与布尔选择运算。
  it('indeterminate is reported but never part of the arithmetic', () => {
    root(() => {
      const ins = createCheckbox({ indeterminate: true, defaultChecked: false })
      expect(ins.indeterminate()).toBe(true)
      step(() => ins.toggle())
      expect(ins.indeterminate()).toBe(true) // unchanged by toggling
      expect(ins.checked()).toBe(true)
    })
  })
})

describe('createCheckboxGroup — value state', () => {
  // 组默认使用空选择。
  it('defaults to an empty selection', () => {
    root(() => {
      const group = createCheckboxGroup()
      expect(group.value()).toEqual([])
    })
  })

  // 组默认数组初始化选择。
  it('seeds from defaultValue', () => {
    root(() => {
      const group = createCheckboxGroup({ defaultValue: ['a'] })
      expect(group.value()).toEqual(['a'])
      expect(group.isChecked('a')).toBe(true)
    })
  })

  // 受控组不自行更新选择。
  it('controlled value wins', () => {
    root(() => {
      const group = createCheckboxGroup({ value: ['a'] })
      step(() => group.toggleValue('b'))
      expect(group.value()).toEqual(['a'])
    })
  })
})

describe('createCheckboxGroup — toggling', () => {
  // 组增加和移除值，并报告完整数组。
  it('toggleValue adds/removes membership and fires onChange', () => {
    root(() => {
      const onChange = vi.fn()
      const group = createCheckboxGroup({ onChange })
      step(() => group.toggleValue('a'))
      expect(group.value()).toEqual(['a'])
      expect(onChange).toHaveBeenLastCalledWith(['a'])
      step(() => group.toggleValue('b'))
      expect(group.value()).toEqual(['a', 'b'])
      step(() => group.toggleValue('a'))
      expect(group.value()).toEqual(['b'])
    })
  })

  // 整组禁用阻止选项切换。
  it('group disabled blocks all options', () => {
    root(() => {
      const group = createCheckboxGroup({ disabled: true })
      step(() => group.toggleValue('a'))
      expect(group.value()).toEqual([])
      expect(group.isDisabled('a')).toBe(true)
    })
  })

  // 单项禁用不影响其他选项。
  it('option-level disabled blocks only that option', () => {
    root(() => {
      const group = createCheckboxGroup({
        options: [
          { label: 'A', value: 'a', disabled: true },
          { label: 'B', value: 'b' },
        ],
      })
      step(() => group.toggleValue('a'))
      expect(group.value()).toEqual([])
      step(() => group.toggleValue('b'))
      expect(group.value()).toEqual(['b'])
    })
  })
})

describe('createCheckboxGroup — checkAll / clearAll', () => {
  const options = [
    { label: 'A', value: 'a' },
    { label: 'B', value: 'b' },
    { label: 'C', value: 'c', disabled: true },
  ]

  // 全选只选可用项。
  it('checkAll selects every enabled option (disabled options untouched)', () => {
    root(() => {
      const group = createCheckboxGroup({ options })
      step(() => group.checkAll())
      expect(group.value()).toEqual(['a', 'b'])
      expect(group.isAllChecked()).toBe(true)
      expect(group.isIndeterminate()).toBe(false)
    })
  })

  // 清空保留禁用项。
  it('clearAll keeps individually disabled options checked', () => {
    root(() => {
      const group = createCheckboxGroup({ options, defaultValue: ['c'] })
      step(() => group.clearAll())
      expect(group.value()).toEqual(['c'])
    })
  })

  // 部分可用项选中时报告半选。
  it('partial selection reports indeterminate', () => {
    root(() => {
      const group = createCheckboxGroup({ options, defaultValue: ['a'] })
      expect(group.isAllChecked()).toBe(false)
      expect(group.isIndeterminate()).toBe(true)
      expect(group.isDisabled('c')).toBe(true)
    })
  })

  // 空选择既非全选也非半选。
  it('empty selection is neither all-checked nor indeterminate', () => {
    root(() => {
      const group = createCheckboxGroup({ options })
      expect(group.isAllChecked()).toBe(false)
      expect(group.isIndeterminate()).toBe(false)
    })
  })
})

// 组级禁用阻止批量修改及回调。
it('[checkbox.group.bulk-disabled] blocks checkAll and clearAll', () => {
 root(() => {
  const cb = vi.fn(), group = createCheckboxGroup({ disabled: true, defaultValue: ['a'], options: [{label:'A',value:'a'},{label:'B',value:'b'}], onChange: cb })
  step(() => group.checkAll()); expect(group.value()).toEqual(['a']); expect(cb).not.toHaveBeenCalled()
  step(() => group.clearAll()); expect(group.value()).toEqual(['a']); expect(cb).not.toHaveBeenCalled()
 })
})

// 受控组只报告建议值，父层确认后状态更新；动态选项决定全选和半选。
it('[checkbox.group.controlled-dynamic] callbacks and option changes', () => {
 root(() => {
  const [value,setValue]=createSignal<Array<string | number>>([0],{ownedWrite:true})
  const [options,setOptions]=createSignal([{label:'零',value:0},{label:'一',value:1}],{ownedWrite:true})
  const cb=vi.fn(), group=createCheckboxGroup({get value(){return value()},get options(){return options()},onChange:cb})
  expect(group.isIndeterminate()).toBe(true); step(()=>group.toggleValue(1)); expect(group.value()).toEqual([0]); expect(cb).toHaveBeenCalledWith([0,1])
  step(()=>setValue([0,1])); expect(group.isAllChecked()).toBe(true)
  step(()=>setOptions([])); expect(group.isAllChecked()).toBe(false); expect(group.isIndeterminate()).toBe(false); expect(group.value()).toEqual([0,1])
 })
})
// 批量操作保留禁用项，清空可用项后不再半选，全禁用选项不算全选。
it('[checkbox.group.bulk] preserves disabled selections and handles empty enabled set', () => {
 root(() => {
  const group=createCheckboxGroup({defaultValue:['locked'],options:[{label:'锁定',value:'locked',disabled:true},{label:'开放',value:'open'}]})
  step(()=>group.checkAll()); expect(group.value()).toEqual(['locked','open']); expect(group.isAllChecked()).toBe(true)
  step(()=>group.clearAll()); expect(group.value()).toEqual(['locked']); expect(group.isIndeterminate()).toBe(false)
  const locked=createCheckboxGroup({options:[{label:'锁定',value:'locked',disabled:true}],defaultValue:['locked']})
  expect(locked.isAllChecked()).toBe(false); expect(locked.isIndeterminate()).toBe(false)
 })
})
// 独立受控值和禁用可动态变化；回调保留原始事件，不更改展示半选态。
it('[checkbox.dynamic] controlled disabled and event identity', () => {
 root(() => {
  const [checked,setChecked]=createSignal(false,{ownedWrite:true}), [disabled,setDisabled]=createSignal(false,{ownedWrite:true})
  const event=new Event('change'), cb=vi.fn(), checkbox=createCheckbox({get checked(){return checked()},get disabled(){return disabled()},indeterminate:true,onChange:cb})
  step(()=>checkbox.toggle(event)); expect(cb).toHaveBeenCalledWith(true,event); expect(checkbox.checked()).toBe(false)
  step(()=>setChecked(true)); expect(checkbox.checked()).toBe(true); step(()=>setDisabled(true)); step(()=>checkbox.toggle(event)); expect(cb).toHaveBeenCalledTimes(1); expect(checkbox.indeterminate()).toBe(true)
 })
})
