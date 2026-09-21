import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Radio, { RadioGroup } from '../../../components/lib/Radio'
import { FormItemContext, type FormItemControl } from '../../../components/lib/Input/context'
import ConfigProvider from '../../../components/lib/ConfigProvider'
import { mount } from '../../utils/mount'
let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })
function setup(view: Parameters<typeof mount>[0]) { const result = mount(view); dispose = result.dispose; return result.host }
function change(input: HTMLInputElement, checked = true) { input.checked = checked; input.dispatchEvent(new Event('change', { bubbles: true })); flush() }
// 受控拒绝选择恢复 DOM，父层更新后再同步 checked；同值事件不重复回调。
it('[radio.controlled] reject accept and duplicate guard', () => {
 const [checked,set]=createSignal(false,{ownedWrite:true}), cb=vi.fn()
 const host=setup(()=><Radio checked={checked()} onChange={cb}>同意</Radio>), input=host.querySelector('input')!
 change(input); expect(input.checked).toBe(false); expect(cb).toHaveBeenCalledWith(true,expect.any(Event))
 set(true); flush(); expect(input.checked).toBe(true); change(input); expect(cb).toHaveBeenCalledTimes(1)
})
// 默认值只初始化一次，禁用和原生 false 事件不改变 Radio 状态。
it('[radio.uncontrolled] initialization and event gates', () => {
 const [seed,setSeed]=createSignal(false,{ownedWrite:true}), [disabled,setDisabled]=createSignal(false,{ownedWrite:true}), cb=vi.fn()
 const host=setup(()=><Radio defaultChecked={seed()} disabled={disabled()} onChange={cb}/>), input=host.querySelector('input')!
 change(input,false); expect(cb).not.toHaveBeenCalled(); change(input); expect(input.checked).toBe(true)
 setSeed(true); flush(); setSeed(false); flush(); expect(input.checked).toBe(true)
 setDisabled(true); flush(); change(input,false); expect(input.checked).toBe(true); expect(cb).toHaveBeenCalledTimes(1)
})
// 原生属性/ref 与外层 class/style 保持归属，纯外观属性更新不更换输入节点。
it('[radio.native] attributes ref and presentation', () => {
 let ref: HTMLInputElement | undefined
 const host=setup(()=><Radio id="single" name="native" value={0} defaultChecked class="custom" style={{margin:'3px'}} ref={el=>{ref=el}}>标签</Radio>), input=host.querySelector('input')!
 expect(ref).toBe(input); expect(input.id).toBe('single'); expect(input.name).toBe('native'); expect(input.value).toBe('0'); expect(input.getAttribute('aria-checked')).toBe('true')
 expect(host.querySelector('label')?.classList.contains('custom')).toBe(true); expect(host.querySelector('label')?.style.margin).toBe('3px'); expect(host.textContent).toContain('标签')
})
// 浏览器会先取消旧原生输入：父层拒绝新值时必须同时恢复组内旧选择。
it.each(['default','button'] as const)('[radio.group.controlled] restores all native inputs: %s', optionType => {
 const cb=vi.fn(), host=setup(()=><RadioGroup name="controlled" value="a" optionType={optionType} onChange={cb} options={[{label:'A',value:'a'},{label:'B',value:'b'}]}/>), inputs=host.querySelectorAll('input')
 inputs[0].checked=false; change(inputs[1]); expect(cb).toHaveBeenCalledWith('b'); expect(inputs[0].checked).toBe(true); expect(inputs[1].checked).toBe(false)
})
// 组禁用压过子项 false；无值与 skipGroup 子项既不参与选择也不继承组 name。
it('[radio.group.disabled] gates and independent names', () => {
 const cb=vi.fn(), host=setup(()=><RadioGroup name="group" disabled onChange={cb} options={[{label:'A',value:'a',disabled:false}]}><Radio value="b" disabled={false}>B</Radio><Radio value="solo" skipGroup>独立</Radio><Radio>无值</Radio></RadioGroup>)
 const inputs=host.querySelectorAll('input'); expect(inputs[0].disabled).toBe(true); expect(inputs[1].disabled).toBe(true); expect(inputs[2].disabled).toBe(false); expect(inputs[2].name).toBe(''); expect(inputs[3].name).toBe('')
 change(inputs[1]); expect(cb).not.toHaveBeenCalled(); expect(inputs[1].checked).toBe(false)
})
// 未指定 name 的两组自动隔离，动态 name 生效且不重置默认值初始化后的状态。
it('[radio.group.dynamic] auto name defaults options and appearance', () => {
 const [name,setName]=createSignal<string|undefined>(undefined,{ownedWrite:true}), [seed,setSeed]=createSignal('a',{ownedWrite:true}), [button,setButton]=createSignal(false,{ownedWrite:true})
 const host=setup(()=><><RadioGroup name={name()} defaultValue={seed()} optionType={button()?'button':'default'} options={[{label:'A',value:'a'},{label:'B',value:'b'}]} class="group-custom" style={{margin:'2px'}}/><RadioGroup options={[{label:'X',value:'x'}]}/></>)
 let inputs=host.querySelectorAll('input'); expect(inputs[0].name).not.toBe(''); expect(inputs[0].name).toBe(inputs[1].name); expect(inputs[0].name).not.toBe(inputs[2].name)
 change(inputs[1]); setSeed('b'); flush(); setSeed('a'); setName('changed'); setButton(true); flush(); inputs=host.querySelectorAll('input')
 expect(inputs[1].checked).toBe(true); expect(inputs[0].name).toBe('changed'); expect(inputs[1].name).toBe('changed')
 const group=host.querySelector('[role="radiogroup"]') as HTMLElement; expect(group.classList.contains('group-custom')).toBe(true); expect(group.style.margin).toBe('2px')
})
// 子项覆盖布尔 props 的是组值，且本地和组事件各一次；按钮模式不能丢弃 children。
it.each(['default','button'] as const)('[radio.group.children] callbacks and zero values: %s', optionType => {
 const group=vi.fn(), child=vi.fn(), host=setup(()=><RadioGroup optionType={optionType} defaultValue={0} onChange={group}><Radio value={0} checked={false}>数字零</Radio><Radio value="0" name="explicit" onChange={child}>字符串零</Radio></RadioGroup>)
 const inputs=host.querySelectorAll('input'); expect(inputs).toHaveLength(2); expect(inputs[0].checked).toBe(true); change(inputs[1]); expect(group).toHaveBeenCalledWith('0'); expect(child).toHaveBeenCalledWith(true,expect.any(Event)); expect(inputs[0].checked).toBe(false); expect(inputs[1].name).toBe('explicit')
})
// 真实字段协议接收标量，按钮选项不能把 true 再写入字段；组 ID 不复制到每个 input。
it.each(['default','button'] as const)('[radio.form] field injection and explicit precedence: %s', optionType => {
 const [value,setValue]=createSignal<string|number>('a',{ownedWrite:true}), cb=vi.fn((v:string|number)=>setValue(v))
 const ctx:FormItemControl={value,onChange:cb,id:()=> 'field',disabled:()=>false,size:()=>undefined,validateStatus:()=>undefined}
 const host=setup(()=><ConfigProvider componentDisabled><FormItemContext value={ctx}><RadioGroup optionType={optionType} options={[{label:'A',value:'a'},{label:'B',value:'b'}]}/></FormItemContext></ConfigProvider>)
 const inputs=host.querySelectorAll('input'); expect(inputs[0].disabled).toBe(false); expect(inputs[0].checked).toBe(true); change(inputs[1])
 expect(value()).toBe('b'); expect(cb).toHaveBeenCalledTimes(1); expect(inputs[1].checked).toBe(true); expect(inputs[0].id).not.toBe('field'); expect(host.querySelector('[role="radiogroup"]')?.id).toBe('field')
})
// 独立字段注入 boolean；显式 checked/onChange/id/disabled 覆盖上下文且不重复写字段。
it('[radio.form.standalone] explicit props override field defaults',()=>{
 const field=vi.fn(), explicit=vi.fn(), ctx:FormItemControl={value:()=>false,onChange:field,id:()=> 'injected',disabled:()=>true,size:()=>undefined,validateStatus:()=>undefined}
 const host=setup(()=><FormItemContext value={ctx}><Radio/><Radio checked={false} disabled={false} id="explicit" onChange={explicit}/></FormItemContext>)
 const inputs=host.querySelectorAll('input');expect(inputs[0].id).toBe('injected');expect(inputs[0].disabled).toBe(true);expect(inputs[1].id).toBe('explicit');expect(inputs[1].disabled).toBe(false)
 change(inputs[1]);expect(explicit).toHaveBeenCalledWith(true,expect.any(Event));expect(field).not.toHaveBeenCalled();expect(inputs[1].checked).toBe(false)
})
// 组显式值/事件覆盖字段；动态 skipGroup 后不再继承组值及 name。
it('[radio.form.group-explicit] explicit callback and dynamic opt out',()=>{
 const field=vi.fn(), explicit=vi.fn(),[skip,setSkip]=createSignal(false,{ownedWrite:true}),ctx:FormItemControl={value:()=> 'a',onChange:field,id:()=>undefined,disabled:()=>false,size:()=>undefined,validateStatus:()=>undefined}
 const host=setup(()=><FormItemContext value={ctx}><RadioGroup value="b" onChange={explicit} name="group"><Radio value="b" skipGroup={skip()} checked={false}/><Radio value="c"/></RadioGroup></FormItemContext>)
 const inputs=host.querySelectorAll('input');expect(inputs[0].checked).toBe(true);change(inputs[1]);expect(explicit).toHaveBeenCalledWith('c');expect(field).not.toHaveBeenCalled()
 setSkip(true);flush();expect(inputs[0].checked).toBe(false);expect(inputs[0].name).toBe('')
})
