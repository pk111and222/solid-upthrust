import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSwitch } from '../../../competence/src/switch'

const cleanups: (() => void)[] = []
afterEach(() => cleanups.splice(0).forEach(fn => fn()))
const root = (fn: () => void) => createRoot(dispose => { cleanups.push(dispose); fn() })
const step = (fn: () => void) => { fn(); flush() }

describe('createSwitch — value state', () => {
  // 默认关闭。
  it('defaults to unchecked', () => {
    root(() => {
      const ins = createSwitch()
      expect(ins.checked()).toBe(false)
    })
  })

  // defaultChecked 初始化。
  it('seeds from defaultChecked', () => {
    root(() => {
      const ins = createSwitch({ defaultChecked: true })
      expect(ins.checked()).toBe(true)
    })
  })

  // value 别名可控制状态。
  it('value is an alias of checked', () => {
    root(() => {
      const ins = createSwitch({ value: true })
      expect(ins.checked()).toBe(true)
    })
  })

  // 受控 checked 保持权威。
  it('controlled checked wins over the internal state', () => {
    root(() => {
      const ins = createSwitch({ checked: true })
      step(() => ins.toggle())
      expect(ins.checked()).toBe(true) // still the controlled prop
    })
  })
})

describe('createSwitch — toggling', () => {
  // 切换报告下一值。
  it('toggle flips and fires onChange with the NEXT value', () => {
    root(() => {
      const onChange = vi.fn()
      const ins = createSwitch({ onChange })
      step(() => ins.toggle())
      expect(ins.checked()).toBe(true)
      expect(onChange).toHaveBeenCalledWith(true, undefined)
      step(() => ins.toggle())
      expect(ins.checked()).toBe(false)
      expect(onChange).toHaveBeenLastCalledWith(false, undefined)
    })
  })

  // 禁用阻止切换。
  it('disabled blocks toggling', () => {
    root(() => {
      const onChange = vi.fn()
      const ins = createSwitch({ disabled: true, onChange })
      step(() => ins.toggle())
      expect(ins.checked()).toBe(false)
      expect(onChange).not.toHaveBeenCalled()
      expect(ins.isBlocked()).toBe(true)
    })
  })

  // loading 独立于 disabled 并阻止切换。
  it('loading blocks toggling but is reported separately from disabled', () => {
    root(() => {
      const ins = createSwitch({ loading: true })
      step(() => ins.toggle())
      expect(ins.checked()).toBe(false)
      expect(ins.isLoading()).toBe(true)
      expect(ins.isDisabled()).toBe(false)
    })
  })

  // headless 保留受阻点击报告契约。
  it('onClick fires even when blocked (the click still happened)', () => {
    root(() => {
      const onClick = vi.fn()
      const ins = createSwitch({ disabled: true, onClick })
      step(() => ins.toggle())
      expect(onClick).toHaveBeenCalledWith(true, undefined)
    })
  })

  // 同值 setChecked 无操作。
  it('setChecked is a no-op when the value does not change', () => {
    root(() => {
      const onChange = vi.fn()
      const ins = createSwitch({ defaultChecked: true, onChange })
      step(() => ins.setChecked(true))
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // setChecked 遵循禁用门禁。
  it('setChecked respects the gates', () => {
    root(() => {
      const ins = createSwitch({ disabled: true })
      step(() => ins.setChecked(true))
      expect(ins.checked()).toBe(false)
    })
  })
})

// 主属性优先于别名，默认值读取后不随 props 更新而重置。
it('[switch.alias-precedence] primary props and defaults',()=>{
 root(()=>{
  expect(createSwitch({checked:false,value:true}).checked()).toBe(false)
  expect(createSwitch({defaultChecked:false,defaultValue:true}).checked()).toBe(false)
  expect(createSwitch({defaultValue:true}).checked()).toBe(true)
 })
})
// 动态受控与门禁更新保持事件顺序和原始事件身份，props 更新不发 change。
it('[switch.dynamic] controlled gates and event order',()=>{
 root(()=>{
  const [checked,setChecked]=createSignal(false,{ownedWrite:true}),[loading,setLoading]=createSignal(true,{ownedWrite:true}),events:string[]=[],event=new Event('click'),change=vi.fn()
  const ins=createSwitch({get checked(){return checked()},get loading(){return loading()},onClick:()=>events.push('click'),onChange:(v,e)=>{events.push('change');change(v,e)}})
  step(()=>ins.toggle(event));expect(events).toEqual(['click']);expect(ins.checked()).toBe(false)
  step(()=>setLoading(false));step(()=>ins.toggle(event));expect(events).toEqual(['click','click','change']);expect(change).toHaveBeenCalledWith(true,event);expect(ins.checked()).toBe(false)
  step(()=>setChecked(true));expect(ins.checked()).toBe(true);expect(change).toHaveBeenCalledTimes(1)
 })
})
