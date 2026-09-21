import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Slider from '../../../components/lib/Slider'
import ConfigProvider from '../../../components/lib/ConfigProvider'
import { FormItemContext, type FormItemControl } from '../../../components/lib/Input/context'
import { mount } from '../../utils/mount'
let dispose=()=>{}
afterEach(()=>{dispose();dispose=()=>{};vi.restoreAllMocks()})
function setup(view:Parameters<typeof mount>[0]) {const result=mount(view);dispose=result.dispose;return result.host}
function key(el:Element,name:string,type='keydown'){el.dispatchEvent(new KeyboardEvent(type,{key:name,bubbles:true,cancelable:true}));flush()}
// 单值填充从 min 到当前值，反向时从右侧填充；id/ref/style 作用于外框。
it('[slider.track.single] fill and native wrapper',()=>{
 let ref:HTMLDivElement|undefined
 const host=setup(()=><Slider id="volume" defaultValue={30} class="custom" style={{width:'300px'}} ref={el=>{ref=el}}/>),wrapper=host.firstElementChild as HTMLElement,track=wrapper.firstElementChild!.children[1] as HTMLElement
 expect(ref).toBe(wrapper);expect(wrapper.id).toBe('volume');expect(wrapper.style.width).toBe('300px');expect(wrapper.classList.contains('custom')).toBe(true);expect(track.style.left).toBe('0%');expect(track.style.width).toBe('30%')
})
// 单值字段键盘写入数字，抬键完成一次；默认值变化不能重置状态。
it('[slider.form.single] field callback and keyboard completion',()=>{
 const [value,set]=createSignal(20,{ownedWrite:true}),change=vi.fn((v:number)=>set(v)),after=vi.fn()
 const ctx:FormItemControl={value,onChange:change,id:()=> 'field',disabled:()=>false,size:()=>undefined,validateStatus:()=>undefined}
 const host=setup(()=><FormItemContext value={ctx}><Slider onAfterChange={after}/></FormItemContext>),handle=host.querySelector('[role=slider]')!
 key(handle,'ArrowRight');expect(value()).toBe(21);key(handle,'ArrowRight','keyup');expect(after).toHaveBeenCalledTimes(1)
})
// 拖拽在卸载时必须移除监听，之后全局事件不能再通知旧组件。
it('[slider.drag.cleanup] no writes after unmount',()=>{
 const add=vi.spyOn(window,'addEventListener'),remove=vi.spyOn(window,'removeEventListener')
 const change=vi.fn(),after=vi.fn(),host=setup(()=><Slider onChange={change} onAfterChange={after}/>),wrapper=host.firstElementChild as HTMLElement,rail=wrapper.firstElementChild as HTMLElement
 vi.spyOn(rail,'getBoundingClientRect').mockReturnValue({left:0,right:100,top:0,bottom:32,width:100,height:32,x:0,y:0,toJSON:()=>({})})
 wrapper.dispatchEvent(new PointerEvent('pointerdown',{pointerId:1,clientX:30,button:0,bubbles:true}));flush();change.mockClear();remove.mockClear();dispose();dispose=()=>{}
 for(const name of ['pointermove','pointerup','pointercancel','blur']) {const listener=add.mock.calls.find(call=>call[0]===name)?.[1];expect(listener).toBeDefined();expect(remove).toHaveBeenCalledWith(name,listener)}
 window.dispatchEvent(new PointerEvent('pointermove',{pointerId:1,clientX:60}));window.dispatchEvent(new PointerEvent('pointerup',{pointerId:1}));flush();expect(change).not.toHaveBeenCalled();expect(after).not.toHaveBeenCalled()
})
// 非受控值在默认属性更新后保留，受控回调拒绝时 ARIA 保持。
it('[slider.defaults.controlled] stable state and rejected intent',()=>{
 const [seed,set]=createSignal(20,{ownedWrite:true}),change=vi.fn(),host=setup(()=><><Slider defaultValue={seed()}/><Slider value={30} onChange={change}/></>),handles=host.querySelectorAll('[role=slider]')
 key(handles[0],'ArrowRight');set(60);flush();expect(handles[0].getAttribute('aria-valuenow')).toBe('21')
 key(handles[1],'ArrowRight');expect(handles[1].getAttribute('aria-valuenow')).toBe('30');expect(change.mock.calls).toEqual([[31,undefined]])
})
// 范围字段注入成对值，显式值/事件优先；控件有方向与可访问名称。
it('[slider.form.range] pair fields and explicit override',()=>{
 const [value,set]=createSignal<[number,number]>([20,60],{ownedWrite:true}),change=vi.fn((v:[number,number])=>set(v)),explicit=vi.fn()
 const ctx:FormItemControl={value,onChange:change,id:()=> 'range',disabled:()=>false,size:()=>undefined,validateStatus:()=>undefined}
 const host=setup(()=><ConfigProvider componentDisabled><FormItemContext value={ctx}><Slider aria-label="预算"/><Slider rangeValue={[10,50]} onRangeChange={explicit} id="explicit" vertical aria-labelledby="label"/></FormItemContext></ConfigProvider>),handles=host.querySelectorAll('[role=slider]')
 expect(handles).toHaveLength(4);expect(handles[0].getAttribute('aria-label')).toBe('预算起点');expect(handles[0].getAttribute('aria-disabled')).toBe('false');key(handles[1],'ArrowRight');expect(value()).toEqual([20,61]);expect(change).toHaveBeenCalledTimes(1)
 key(handles[2],'ArrowRight');expect(explicit).toHaveBeenCalledWith([11,50],undefined);expect(change).toHaveBeenCalledTimes(1);expect(handles[2].getAttribute('aria-valuenow')).toBe('10');expect(handles[2].getAttribute('aria-orientation')).toBe('vertical');expect(handles[2].getAttribute('aria-labelledby')).toBe('label')
})
// pointerId 隔离、取消与动态禁用均结束会话，不再写入或报告完成。
it('[slider.pointer.cancel] filter pointer and release listeners',()=>{
 const [disabled,set]=createSignal(false,{ownedWrite:true}),change=vi.fn(),after=vi.fn(),host=setup(()=><Slider disabled={disabled()} onChange={change} onAfterChange={after}/>),wrapper=host.firstElementChild as HTMLElement,rail=wrapper.firstElementChild as HTMLElement
 vi.spyOn(rail,'getBoundingClientRect').mockReturnValue({left:0,right:100,top:0,bottom:32,width:100,height:32,x:0,y:0,toJSON:()=>({})})
 const fire=(type:string,id:number,x=30)=>{(type==='pointerdown'?wrapper:window).dispatchEvent(new PointerEvent(type,{pointerId:id,clientX:x,button:0,bubbles:true}));flush()}
 fire('pointerdown',1);change.mockClear();fire('pointermove',2,80);fire('pointerup',2);expect(change).not.toHaveBeenCalled();expect(after).not.toHaveBeenCalled()
 fire('pointercancel',1);fire('pointermove',1,80);expect(change).not.toHaveBeenCalled();expect(after).not.toHaveBeenCalled()
 fire('pointerdown',3,40);change.mockClear();set(true);flush();fire('pointermove',3,90);fire('pointerup',3);expect(change).not.toHaveBeenCalled();expect(after).not.toHaveBeenCalled();expect(host.querySelector('[role=slider]')?.getAttribute('tabindex')).toBe('-1')
})
// 键盘连续按下只在抬起或失焦完成一次；反向箭头反转，Home/End 不反转。
it('[slider.keyboard.finish] repeat blur and reverse',()=>{
 const after=vi.fn(),host=setup(()=><Slider defaultValue={50} reverse onAfterChange={after}/>),handle=host.querySelector('[role=slider]')!
 key(handle,'ArrowRight');key(handle,'ArrowRight');expect(after).not.toHaveBeenCalled();key(handle,'ArrowRight','keyup');expect(after.mock.calls).toEqual([[48]])
 key(handle,'End');handle.dispatchEvent(new FocusEvent('blur'));flush();key(handle,'End','keyup');expect(after.mock.calls).toEqual([[48],[100]])
})
// 零刻度可见，动态精度/步长与范围/方向更新不能重建非受控状态。
it('[slider.dynamic] marks zero and live configuration',()=>{
 const [step,setStep]=createSignal(0.1,{ownedWrite:true}),[reverse,setReverse]=createSignal(false,{ownedWrite:true}),[maximum,setMaximum]=createSignal(1,{ownedWrite:true})
 const host=setup(()=><Slider defaultValue={0.2} max={maximum()} step={step()} precision={2} reverse={reverse()} marks={[{value:0},{value:1,label:'满'}]}/>),handle=host.querySelector('[role=slider]')!
 expect(host.textContent).toContain('0');key(handle,'ArrowRight');expect(handle.getAttribute('aria-valuenow')).toBe('0.3');setStep(0.2);setReverse(true);flush();key(handle,'ArrowLeft');expect(handle.getAttribute('aria-valuenow')).toBe('0.6');setMaximum(0.4);flush();expect(handle.getAttribute('aria-valuenow')).toBe('0.4');expect(host.textContent).not.toContain('满')
})
