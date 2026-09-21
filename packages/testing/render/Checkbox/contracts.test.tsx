import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Checkbox, { CheckboxGroup } from '../../../components/lib/Checkbox'
import ConfigProvider from '../../../components/lib/ConfigProvider'
import { FormItemContext, type FormItemControl } from '../../../components/lib/Input/context'
import { mount } from '../../utils/mount'
let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })
function setup(view: Parameters<typeof mount>[0]) { const result = mount(view); dispose = result.dispose; return result.host }
function change(el: HTMLInputElement, checked: boolean) { el.checked = checked; el.dispatchEvent(new Event('change', { bubbles: true })); flush() }
// 受控拒绝更新后恢复原生状态，父层更新仍可生效。
it('[checkbox.controlled] rejected and accepted updates', () => {
 const [checked, set] = createSignal(false, { ownedWrite: true }); const cb = vi.fn()
 const host = setup(() => <Checkbox checked={checked()} onChange={cb}>同意</Checkbox>), input = host.querySelector('input')!
 change(input, true); expect(cb).toHaveBeenCalledWith(true, expect.any(Event)); expect(input.checked).toBe(false)
 set(true); flush(); expect(input.checked).toBe(true)
})
// 默认值只初始化一次，重复状态和禁用事件不触发回调。
it('[checkbox.uncontrolled] default update and disabled guard', () => {
 const [seed, setSeed] = createSignal(false, { ownedWrite: true }); const [disabled, setDisabled] = createSignal(false, { ownedWrite: true }); const cb = vi.fn()
 const host = setup(() => <Checkbox defaultChecked={seed()} disabled={disabled()} onChange={cb} />), input = host.querySelector('input')!
 change(input, true); change(input, true); expect(cb).toHaveBeenCalledTimes(1)
 setSeed(true); flush(); setSeed(false); flush(); expect(input.checked).toBe(true)
 setDisabled(true); flush(); change(input, false); expect(input.checked).toBe(true); expect(cb).toHaveBeenCalledTimes(1)
})
// 半选原生属性和 ARIA 同步，id/name/value/ref 与外层样式各就各位。
it('[checkbox.native] mixed semantics and native attributes', () => {
 const [mixed, set] = createSignal(true, { ownedWrite: true }); let ref: HTMLInputElement | undefined
 const host = setup(() => <Checkbox id="agree" name="terms" value={0} indeterminate={mixed()} class="custom" style={{ margin: '3px' }} ref={el => { ref = el }}>协议</Checkbox>)
 const input = host.querySelector('input')!
 expect(ref).toBe(input); expect(input.id).toBe('agree'); expect(input.name).toBe('terms'); expect(input.value).toBe('0')
 expect(input.indeterminate).toBe(true); expect(input.getAttribute('aria-checked')).toBe('mixed')
 expect(host.querySelector('label')?.classList.contains('custom')).toBe(true); expect(host.querySelector('label')?.style.margin).toBe('3px')
 set(false); flush(); expect(input.indeterminate).toBe(false); expect(input.getAttribute('aria-checked')).toBe('false')
})
// 组禁用必须约束显式 false 的选项与子项；组 name 传入原生输入。
it('[checkbox.group.disabled] group gate and names', () => {
 const cb = vi.fn(); const host = setup(() => <CheckboxGroup disabled name="fruit" options={[{ label: 'A', value: 'a', disabled: false }]} onChange={cb}><Checkbox value="b" disabled={false}>B</Checkbox><Checkbox skipGroup name="solo">独立</Checkbox></CheckboxGroup>)
 const inputs = host.querySelectorAll('input'); expect(inputs[0].disabled).toBe(true); expect(inputs[1].disabled).toBe(true); expect(inputs[2].disabled).toBe(false)
 expect(inputs[0].name).toBe('fruit'); expect(inputs[1].name).toBe('fruit'); expect(inputs[2].name).toBe('solo')
 change(inputs[1], true); expect(cb).not.toHaveBeenCalled(); expect(inputs[1].checked).toBe(false)
})
// 自定义子项本地事件与组事件各一次；无 value 或 skipGroup 独立切换。
it('[checkbox.group.children] child callbacks opt out and controlled rejection', () => {
 const group = vi.fn(), child = vi.fn(); const host = setup(() => <CheckboxGroup value={[]} onChange={group}><Checkbox value={0} onChange={child}>零</Checkbox><Checkbox>无值</Checkbox><Checkbox value="s" skipGroup>跳过</Checkbox></CheckboxGroup>)
 const inputs = host.querySelectorAll('input'); change(inputs[0], true)
 expect(group).toHaveBeenCalledWith([0]); expect(child).toHaveBeenCalledWith(true, expect.any(Event)); expect(inputs[0].checked).toBe(false)
 change(inputs[1], true); change(inputs[2], true); expect(inputs[1].checked).toBe(true); expect(inputs[2].checked).toBe(true); expect(group).toHaveBeenCalledTimes(1)
})
// 动态选项、默认值与 name 不重建非受控选择；字符串和数字是不同值。
it('[checkbox.group.dynamic] defaults options and values', () => {
 const [seed, setSeed] = createSignal<Array<string | number>>([], { ownedWrite: true }); const [options, setOptions] = createSignal([{label:'零',value:0}], { ownedWrite: true }); const [name,setName] = createSignal('first',{ownedWrite:true})
 const host = setup(() => <CheckboxGroup defaultValue={seed()} options={options()} name={name()} class="group-custom" style={{ margin: '2px' }}><Checkbox value="0" name="own">字符串零</Checkbox></CheckboxGroup>)
 change(host.querySelector('input')!, true); setSeed(['0']); setName('second'); setOptions([{label:'更新零',value:0},{label:'一',value:1}]); flush()
 const inputs=host.querySelectorAll('input'); expect(inputs[0].checked).toBe(true); expect(inputs[1].checked).toBe(false); expect(inputs[2].checked).toBe(false)
 expect(inputs[0].name).toBe('second'); expect(inputs[2].name).toBe('own'); expect(host.textContent).toContain('更新零')
 expect(host.querySelector('[role="group"]')?.classList.contains('group-custom')).toBe(true); expect((host.querySelector('[role="group"]') as HTMLElement).style.margin).toBe('2px')
})
// Form 注入和显式覆盖使用真实共享协议；组中子项不把数组误当布尔字段。
it('[checkbox.form] field injection precedence and group isolation', () => {
 const [value,setValue]=createSignal<unknown>(false,{ownedWrite:true}); const [disabled,setDisabled]=createSignal(true,{ownedWrite:true}); const cb=vi.fn()
 const ctx: FormItemControl={value,onChange:cb,disabled,id:()=> 'field',size:()=>undefined,validateStatus:()=>undefined}
 const host=setup(()=><ConfigProvider componentDisabled><FormItemContext value={ctx}><Checkbox /><Checkbox disabled={false} checked={false} onChange={()=>{}} id="explicit" /><CheckboxGroup value={Array.isArray(value()) ? value() as Array<string | number> : []} options={[{label:'A',value:'a'}]} /></FormItemContext></ConfigProvider>)
 const inputs=host.querySelectorAll('input'); expect(inputs[0].disabled).toBe(true); expect(inputs[1].disabled).toBe(false); expect(inputs[0].id).toBe('field'); expect(inputs[1].id).toBe('explicit')
 setDisabled(false); flush(); change(inputs[0],true); expect(cb).toHaveBeenCalledWith(true,expect.any(Event)); expect(inputs[0].checked).toBe(false)
 setValue(['a']); flush(); expect(inputs[2].checked).toBe(true); expect(inputs[2].id).not.toBe('field')
})
// 组显式启用优先于全局默认；子项显式禁用与 options 禁用仍然生效。
it('[checkbox.group.config] explicit group false overrides global default', () => {
 const host = setup(() => <ConfigProvider componentDisabled><CheckboxGroup disabled={false} options={[{label:'A',value:'a'},{label:'B',value:'b',disabled:true}]}><Checkbox value="c" disabled>C</Checkbox></CheckboxGroup></ConfigProvider>)
 const inputs=host.querySelectorAll('input'); expect(inputs[0].disabled).toBe(false); expect(inputs[1].disabled).toBe(true); expect(inputs[2].disabled).toBe(true)
})
// 动态 skipGroup 在组受控值与独立状态之间切换，动态禁用不丢弃选择。
it('[checkbox.group.membership] dynamic opt out and disabled option', () => {
 const [skip,setSkip]=createSignal(false,{ownedWrite:true}), [disabled,setDisabled]=createSignal(false,{ownedWrite:true})
 const host=setup(()=><CheckboxGroup value={['a']}><Checkbox value="a" skipGroup={skip()} disabled={disabled()}>A</Checkbox></CheckboxGroup>)
 const input=host.querySelector('input')!; expect(input.checked).toBe(true); setSkip(true); flush(); expect(input.checked).toBe(false)
 change(input,true); setDisabled(true); flush(); expect(input.disabled).toBe(true); expect(input.checked).toBe(true)
 setSkip(false); flush(); expect(input.checked).toBe(true)
})
