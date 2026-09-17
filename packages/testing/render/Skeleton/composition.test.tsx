import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it } from 'vitest'
import Skeleton, {type SkeletonProps,type SkeletonIns} from '../../../components/lib/Skeleton'
import { mount } from '../../utils/mount'
let cleanup=()=>{}
afterEach(()=>cleanup())
const setup=(props:SkeletonProps)=>{const v=mount(()=><Skeleton {...props}/>);cleanup=v.dispose;return v.host}
// 标题、段落、头像的所有布尔组合分别改变占位节点，不互相覆盖。
it.each([true,false].flatMap(title=>[true,false].flatMap(paragraph=>[true,false].map(avatar=>({title,paragraph,avatar})))))('[skeleton.dom.composition] $title / $paragraph / $avatar',props=>{
  const host=setup(props);const root=host.firstElementChild!
  expect(root.querySelectorAll('span')).toHaveLength(props.avatar?1:0)
  expect(root.lastElementChild!.children.length).toBe((props.title?1:0)+(props.paragraph?3:0))
  expect(root.getAttribute('aria-hidden')).toBe('true')
})
// 标题宽度、逐行宽度以及缺项全宽按内联样式映射；行间距分支正确。
it('[skeleton.dom.widths] maps widths and first-row spacing',()=>{
  const host=setup({title:{width:0},paragraph:{rows:3,width:[120,'60%']}})
  const rows=Array.from(host.firstElementChild!.lastElementChild!.children) as HTMLElement[]
  expect(rows.map(row=>row.style.width)).toEqual(['0px','120px','60%',''])
  expect(rows[0].classList.contains('mb-[8px]')).toBe(true)
  expect(rows[1].classList.contains('mt-0')).toBe(true);expect(rows[2].classList.contains('mt-[16px]')).toBe(true)
})
// active 与 round 四种组合仅影响对应展示，头像自己的形状保持独立。
it.each([true,false].flatMap(active=>[true,false].map(round=>({active,round}))))('[skeleton.dom.motion-round] $active / $round',props=>{
  const host=setup({...props,avatar:{shape:'square',size:48}});const root=host.firstElementChild!
  const avatar=root.querySelector('span')!;expect(avatar.style.width).toBe('48px');expect(avatar.classList.contains('rounded-full')).toBe(false)
  for(const line of Array.from(root.lastElementChild!.children)){
    expect(line.classList.contains('rounded-full')).toBe(props.round)
    expect(line.classList.contains('animate-skeleton-wave')).toBe(props.active)
  }
  expect(avatar.classList.contains('animate-skeleton-wave')).toBe(props.active)
})
// class/style 只作用于占位根节点，loading=false 时直接输出真实内容，无额外 div。
it('[skeleton.dom.loading] switches repeatedly and exposes ref',()=>{
  const [loading,setLoading]=createSignal(true,{ownedWrite:true});let ref!:SkeletonIns
  const host=setup({get loading(){return loading()},class:'custom',style:{width:'200px'},ref:value=>ref=value,children:<article>真实内容</article>})
  expect(host.firstElementChild!.classList.contains('custom')).toBe(true);expect((host.firstElementChild as HTMLElement).style.width).toBe('200px');expect(ref.loading()).toBe(true)
  setLoading(false);flush();expect(host.children.length).toBe(1);expect(host.firstElementChild!.tagName).toBe('ARTICLE');expect(host.textContent).toBe('真实内容');expect(ref.loading()).toBe(false)
  setLoading(true);flush();expect(host.querySelector('article')).toBeNull();expect(host.querySelector('[aria-hidden="true"]')).not.toBeNull()
  setLoading(false);flush();expect(host.textContent).toBe('真实内容')
})
// 不加载且无 children 时输出空内容，数字零必须作为真实内容保留。
it.each([undefined,0,'文本'])('[skeleton.dom.fallback] %s',children=>{
  const host=setup({loading:false,children});expect(host.textContent).toBe(children===undefined?'':String(children));expect(host.querySelector('div')).toBeNull()
})
// 运行中更换头像和段落配置会重新生成对应 DOM，不保留旧宽高和节点。
it('[skeleton.dom.dynamic] updates avatar and paragraph configuration',()=>{
  const [custom,setCustom]=createSignal(false,{ownedWrite:true})
  const host=setup({get avatar(){return custom()?{size:'2em',shape:'square' as const}:false},get title(){return !custom()},get paragraph(){return custom()?{rows:1,width:'75%'}:{rows:3}}})
  expect(host.querySelector('span')).toBeNull();setCustom(true);flush();expect(host.querySelector('span')!.style.width).toBe('2em')
  expect(host.firstElementChild!.lastElementChild!.children.length).toBe(1)
  expect((host.firstElementChild!.lastElementChild!.firstElementChild as HTMLElement).style.width).toBe('75%')
})
// 加载分支必须移除真实内容节点，切换后内容事件仍能工作。
it('[skeleton.dom.child-interaction] restores interactive content',()=>{
  const [loading,setLoading]=createSignal(false,{ownedWrite:true})
  const [count,setCount]=createSignal(0,{ownedWrite:true})
  const view=mount(()=><Skeleton loading={loading()}><button onClick={()=>setCount(count()+1)}>计数 {count()}</button></Skeleton>);cleanup=view.dispose
  view.host.querySelector('button')!.click();flush();expect(view.host.textContent).toBe('计数 1')
  setLoading(true);flush();expect(view.host.querySelector('button')).toBeNull()
  setLoading(false);flush();view.host.querySelector('button')!.click();flush();expect(view.host.textContent).toBe('计数 2')
})
