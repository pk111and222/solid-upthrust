import { createSignal, flush, Show } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Radio, { RadioButton, RadioGroup, RadioGroupContext } from '../../../components/lib/Radio'
import { mount } from '../../utils/mount'
let dispose=()=>{}
afterEach(()=>{dispose();dispose=()=>{}})
// 按钮子项独立命名导出，样式/位置和回调有效；重复选择不重复通知。
it('[radio.button.standalone] props and one-way selection',()=>{
 const cb=vi.fn(), view=mount(()=><RadioButton value={0} position="single" class="custom" style={{margin:'4px'}} onChange={cb}>按钮</RadioButton>);dispose=view.dispose
 const input=view.host.querySelector('input')!;input.click();flush();expect(input.checked).toBe(true);expect(input.getAttribute('aria-checked')).toBe('true');expect(input.value).toBe('0')
 input.click();flush();expect(cb).toHaveBeenCalledTimes(1);expect(cb).toHaveBeenCalledWith(true,expect.any(Event));expect(view.host.querySelector('label')?.style.margin).toBe('4px');expect(view.host.querySelector('label')?.classList.contains('custom')).toBe(true)
})
// 自定义按钮受组禁用约束，组回调先于子项回调；销毁子项不会污染后续恢复。
it('[radio.button.group] callbacks disabled and child cleanup',()=>{
 const [disabled,setDisabled]=createSignal(true,{ownedWrite:true}), [shown,setShown]=createSignal(true,{ownedWrite:true}), events:string[]=[]
 const view=mount(()=><RadioGroup value="a" disabled={disabled()} onChange={v=>events.push(String(v))}><RadioButton value="a" position="first">A</RadioButton><Show when={shown()}><RadioButton value="b" disabled={false} position="last" onChange={()=>events.push('child')}>B</RadioButton></Show><Radio value="c">C</Radio></RadioGroup>);dispose=view.dispose
 let inputs=view.host.querySelectorAll('input');expect(inputs[1].disabled).toBe(true);setDisabled(false);flush();inputs[1].click();flush();expect(events).toEqual(['b','child']);expect(inputs[0].checked).toBe(true);expect(inputs[1].checked).toBe(false)
 const removed=inputs[1];setShown(false);flush();expect(removed.isConnected).toBe(false);inputs=view.host.querySelectorAll('input');inputs[1].click();flush();expect(inputs[0].checked).toBe(true);expect(inputs[1].checked).toBe(false)
})

// ref 回调可能在 owner 外执行，清理必须注册在组件 owner，卸载两种输入均注销。
it('[radio.inputs.cleanup] unregisters mounted native inputs',()=>{
 const cleanup=vi.fn(), registerInput=vi.fn(()=>cleanup), [shown,setShown]=createSignal(true,{ownedWrite:true})
 const view=mount(()=><RadioGroupContext value={{isSelected:()=>false,isDisabled:()=>false,select:()=>{},registerInput}}><Show when={shown()}><Radio value="a"/><RadioButton value="b"/></Show></RadioGroupContext>);dispose=view.dispose
 expect(registerInput).toHaveBeenCalledTimes(2);setShown(false);flush();expect(cleanup).toHaveBeenCalledTimes(2)
})
