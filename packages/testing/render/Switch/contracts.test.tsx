import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Switch from '../../../components/lib/Switch'
import ConfigProvider from '../../../components/lib/ConfigProvider'
import { FormItemContext, type FormItemControl } from '../../../components/lib/Input/context'
import { mount } from '../../utils/mount'
let dispose=()=>{}
afterEach(()=>{dispose();dispose=()=>{}})
function setup(view:Parameters<typeof mount>[0]){const result=mount(view);dispose=result.dispose;return result.host}
// checked 优先于 value；父层拒绝后 ARIA 与内容保持原值，接受 props 后再更新。
it('[switch.controlled] alias precedence and parent updates',()=>{
 const [checked,set]=createSignal(false,{ownedWrite:true}),cb=vi.fn()
 const host=setup(()=><Switch checked={checked()} value defaultChecked checkedChildren="开" unCheckedChildren="关" onChange={cb}/>), button=host.querySelector('button')!
 expect(button.getAttribute('aria-checked')).toBe('false');button.click();flush();expect(cb).toHaveBeenCalledWith(true,expect.any(Event));expect(button.getAttribute('aria-checked')).toBe('false');expect(button.textContent).toBe('关')
 set(true);flush();expect(button.textContent).toBe('开');expect(cb).toHaveBeenCalledTimes(1)
})
// 默认别名只初始化一次，onClick 在 onChange 前报告下一值和同一个事件。
it('[switch.uncontrolled] default changes and event ordering',()=>{
 const [seed,set]=createSignal(false,{ownedWrite:true}),events:string[]=[],click=vi.fn(),change=vi.fn()
 const host=setup(()=><Switch defaultChecked={seed()} defaultValue onClick={(v,e)=>{events.push('click');click(v,e)}} onChange={(v,e)=>{events.push('change');change(v,e)}}/>),button=host.querySelector('button')!
 expect(button.getAttribute('aria-checked')).toBe('false');button.click();flush();expect(events).toEqual(['click','change']);expect(click.mock.calls[0]).toEqual(change.mock.calls[0])
 set(true);flush();set(false);flush();expect(button.getAttribute('aria-checked')).toBe('true')
})
// loading 保留焦点能力并报告尝试点击但不切换，disabled 阻止 UI 事件。
it('[switch.gates] dynamic loading and disabled',()=>{
 const [loading,setLoading]=createSignal(true,{ownedWrite:true}),[disabled,setDisabled]=createSignal(false,{ownedWrite:true}),click=vi.fn(),change=vi.fn()
 const host=setup(()=><Switch loading={loading()} disabled={disabled()} onClick={click} onChange={change}/>),button=host.querySelector('button')!
 expect(button.getAttribute('aria-busy')).toBe('true');button.click();flush();expect(click).toHaveBeenCalledWith(true,expect.any(Event));expect(change).not.toHaveBeenCalled()
 setLoading(false);flush();button.click();flush();expect(change).toHaveBeenCalledTimes(1);expect(button.getAttribute('aria-checked')).toBe('true')
 setDisabled(true);flush();button.dispatchEvent(new MouseEvent('click',{bubbles:true}));flush();expect(change).toHaveBeenCalledTimes(1);expect(click).toHaveBeenCalledTimes(2)
})
// 表单字段应实际收到布尔值，显式回调覆盖字段回调，false 覆盖全局禁用。
it('[switch.form] injection and explicit override',()=>{
 const [value,set]=createSignal(false,{ownedWrite:true}),field=vi.fn((v:boolean)=>set(v)),explicit=vi.fn()
 const ctx:FormItemControl={value,onChange:field,id:()=> 'field',disabled:()=>false,size:()=> 'small',validateStatus:()=>undefined}
 const host=setup(()=><ConfigProvider componentDisabled><FormItemContext value={ctx}><Switch/><Switch value={false} id="explicit" onChange={explicit}/></FormItemContext></ConfigProvider>)
 const buttons=host.querySelectorAll('button');expect(buttons[0].disabled).toBe(false);expect(buttons[0].id).toBe('field');buttons[0].click();flush();expect(value()).toBe(true);expect(field).toHaveBeenCalledTimes(1)
 buttons[1].click();flush();expect(explicit).toHaveBeenCalledWith(true,expect.any(Event));expect(field).toHaveBeenCalledTimes(1);expect(buttons[1].getAttribute('aria-checked')).toBe('false');expect(buttons[1].id).toBe('explicit')
})
// 原生 ref/name/id/autofocus 与 style 透传；type=button 防止表单提交。
it('[switch.native] attributes ref and style priority',()=>{
 let ref:HTMLButtonElement|undefined
 const host=setup(()=><Switch id="switch" name="enabled" autofocus class="custom" style={{'padding-inline-start':'5px',width:'80px'}} ref={el=>{ref=el}}/>),button=host.querySelector('button')!
 expect(ref).toBe(button);expect(button.type).toBe('button');expect(button.id).toBe('switch');expect(button.name).toBe('enabled');expect(button.hasAttribute('autofocus')).toBe(true);expect(button.classList.contains('custom')).toBe(true);expect(button.style.paddingInlineStart).toBe('5px');expect(button.style.width).toBe('80px')
})
// 单独使用两个别名有效，动态内容可渲染 JSX 与数字零。
it('[switch.aliases] aliases and JSX children',()=>{
 const [value,set]=createSignal(false,{ownedWrite:true}),host=setup(()=><><Switch value={value()} checkedChildren={<b>开启</b>} unCheckedChildren={0}/><Switch defaultValue/></>),buttons=host.querySelectorAll('button')
 expect(buttons[0].textContent).toBe('0');expect(buttons[1].getAttribute('aria-checked')).toBe('true');set(true);flush();expect(buttons[0].querySelector('b')?.textContent).toBe('开启')
})
// 尺寸从配置继承且可动态改变，显式尺寸优先，状态不受外观更新影响。
it('[switch.config.dynamic] inherited size and explicit override',()=>{
 const [size,setSize]=createSignal<'small'|'middle'>('small',{ownedWrite:true})
 const host=setup(()=><ConfigProvider componentSize={size()}><Switch defaultChecked/><Switch size="middle"/></ConfigProvider>),buttons=host.querySelectorAll('button')
 expect(buttons[0].className).toContain('h-[16px]');expect(buttons[1].className).toContain('h-[22px]');setSize('middle');flush();expect(buttons[0].className).toContain('h-[22px]');expect(buttons[0].getAttribute('aria-checked')).toBe('true')
})
