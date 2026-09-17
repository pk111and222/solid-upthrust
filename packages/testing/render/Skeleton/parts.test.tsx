import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it } from 'vitest'
import Skeleton from '../../../components/lib/Skeleton'
import { mount } from '../../utils/mount'
let cleanup=()=>{}
afterEach(()=>cleanup())
// 所有子组件的预设及数字尺寸对应实际宽高，Node 默认 100px，其他默认 32px 高。
it.each([undefined,'small','middle','large',0,56] as const)('[skeleton.parts.size] %s',size=>{
  const v=mount(()=><><Skeleton.Button size={size}/><Skeleton.Avatar size={size}/><Skeleton.Input size={size}/><Skeleton.Node size={size}/></>);cleanup=v.dispose
  const els=Array.from(v.host.children) as HTMLElement[];const dim=typeof size==='number'?size:size==='small'?24:size==='large'?40:32
  expect(els.map(el=>el.style.height)).toEqual([`${dim}px`,`${dim}px`,`${dim}px`,`${size===undefined?100:dim}px`])
  expect(els.map(el=>el.style.width)).toEqual([`${dim*2.5}px`,`${dim}px`,'160px',`${size===undefined?100:dim}px`])
  for(const el of els)expect(el.getAttribute('aria-hidden')).toBe('true')
})
// Button 的形状与 block 全组合：block 宽度优先于圆形宽度。
it.each(['default','round','circle'].flatMap(shape=>[true,false].map(block=>({shape:shape as 'default'|'round'|'circle',block}))))('[skeleton.parts.button] $shape / $block',props=>{
  const v=mount(()=><Skeleton.Button {...props}/>);cleanup=v.dispose;const el=v.host.firstElementChild as HTMLElement
  expect(el.style.width).toBe(props.block?'100%':props.shape==='circle'?'32px':'80px')
  expect(el.classList.contains('rounded-full')).toBe(props.shape!=='default')
})
// Avatar 的两种形状不被通用圆角覆盖。
it.each(['circle','square'] as const)('[skeleton.parts.avatar] %s',shape=>{
  const v=mount(()=><Skeleton.Avatar shape={shape}/>);cleanup=v.dispose
  expect(v.host.firstElementChild!.classList.contains('rounded-full')).toBe(shape==='circle')
})
// 所有子组件支持动画、class 与 style 覆盖；Node 保留装饰内容。
it('[skeleton.parts.overrides] updates animation and custom styles',()=>{
  const [active,setActive]=createSignal(false,{ownedWrite:true})
  const v=mount(()=><><Skeleton.Button active={active()} class="button-custom" style={{width:'90px'}}/><Skeleton.Avatar active={active()} class="avatar-custom" style={{height:'70px'}}/><Skeleton.Input active={active()} block class="input-custom" style={{width:'80%'}}/><Skeleton.Node active={active()} class="node-custom" style={{height:'80px'}}>图表占位</Skeleton.Node></>);cleanup=v.dispose
  const els=Array.from(v.host.children) as HTMLElement[];expect(els.map(el=>el.className)).toEqual([expect.stringContaining('button-custom'),expect.stringContaining('avatar-custom'),expect.stringContaining('input-custom'),expect.stringContaining('node-custom')])
  expect(els[0].style.width).toBe('90px');expect(els[1].style.height).toBe('70px');expect(els[2].style.width).toBe('80%');expect(els[3].style.height).toBe('80px');expect(els[3].textContent).toBe('图表占位')
  setActive(true);flush();for(const el of els)expect(el.classList.contains('animate-skeleton-wave')).toBe(true)
  setActive(false);flush();for(const el of els)expect(el.classList.contains('animate-skeleton-wave')).toBe(false)
})
// Input 的 block 响应式切换改变占位宽度。
it('[skeleton.parts.input-block] switches width',()=>{
  const [block,setBlock]=createSignal(false,{ownedWrite:true});const v=mount(()=><Skeleton.Input block={block()}/>);cleanup=v.dispose
  const el=v.host.firstElementChild as HTMLElement;expect(el.style.width).toBe('160px');setBlock(true);flush();expect(el.style.width).toBe('100%')
})
