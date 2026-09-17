import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Button, { type ButtonProps, type ButtonIns, type ButtonVariant, type ButtonColor } from '../../../components/lib/Button'
import { mount } from '../../utils/mount'
let cleanup = () => {}
afterEach(() => { cleanup(); vi.useRealTimers() })
function setup(props: ButtonProps) { const view = mount(() => <Button {...props} />); cleanup = view.dispose; return view.host }
// 五种简写类型分别映射外观，且不改变原生 button 的默认类型。
it.each([['default','border-outline'],['primary','bg-primary'],['dashed','border-dashed'],['text','bg-transparent'],['link','bg-transparent']] as const)('[button.type] %s', (type, token) => {
  const button = setup({type,children:'按钮'}).querySelector('button')!
  expect(button.classList.contains(token)).toBe(true); expect(button.type).toBe('button')
})
// 六种外观与三种颜色的所有组合均保留文本和有效外观类。
it.each((['outlined','solid','filled','text','link','dashed'] as ButtonVariant[]).flatMap(variant => (['default','primary','danger'] as ButtonColor[]).map(color => ({variant,color}))))('[button.variant.color] $variant / $color', props => {
  const button = setup({...props,children:'操作'}).querySelector('button')!
  expect(button.textContent).toBe('操作')
  expect(button.className).toContain(props.color === 'danger' ? 'error' : props.color === 'primary' ? 'primary' : 'surface')
  expect(button.classList.contains('border-dashed')).toBe(props.variant === 'dashed')
})
// 显式 variant 覆盖 type，danger 覆盖显式 color；组合属性共同生效。
it('[button.precedence] combines overrides, ghost and block', () => {
  const button = setup({type:'primary',variant:'dashed',color:'primary',danger:true,ghost:true,block:true,disabled:true}).querySelector('button')!
  for (const token of ['border-dashed','text-error','!bg-transparent','w-full','cursor-not-allowed']) expect(button.classList.contains(token)).toBe(true)
  expect(button.disabled).toBe(true)
})
// 尺寸和形状全组合，圆形按钮仍保留可访问名称。
it.each((['small','middle','large'] as const).flatMap(size => (['default','round','circle'] as const).map(shape => ({size,shape}))))('[button.size.shape] $size / $shape', props => {
  const button = setup({...props,'aria-label':'搜索',icon:<i>图标</i>}).querySelector('button')!
  expect(button.getAttribute('aria-label')).toBe('搜索')
  expect(button.classList.contains({small:'h-control-sm',middle:'h-control',large:'h-control-lg'}[props.size])).toBe(true)
  expect(button.classList.contains('aspect-square')).toBe(props.shape === 'circle')
})
// 图标前后位置、加载替换图标和数值零内容均按 DOM 顺序呈现。
it.each(['start','end'] as const)('[button.icon] %s and loading replacement', iconPlacement => {
  const [loading,setLoading] = createSignal(false,{ownedWrite:true})
  const host = setup({iconPlacement,icon:<i>原图标</i>,children:0,get loading(){return loading()}})
  expect(host.textContent).toBe(iconPlacement === 'start' ? '原图标0' : '0原图标')
  setLoading(true); flush()
  expect(host.querySelector('i')).toBeNull(); expect(host.querySelector('.i-mdi-loading')).not.toBeNull()
  expect(host.querySelector('button')!.getAttribute('aria-busy')).toBe('true')
  setLoading(false); flush(); expect(host.querySelector('i')!.textContent).toBe('原图标')
})
// 原生属性、样式、事件和三种表单类型正确传入根节点。
it.each(['button','submit','reset'] as const)('[button.native] %s', htmlType => {
  const focus = vi.fn()
  const button = setup({htmlType,id:'save',name:'action',value:'save',title:'提示',class:'custom',style:{color:'red'},'aria-label':'保存',onFocus:focus}).querySelector('button')!
  expect(button.type).toBe(htmlType); expect(button.id).toBe('save'); expect(button.name).toBe('action'); expect(button.value).toBe('save')
  expect(button.title).toBe('提示'); expect(button.classList.contains('custom')).toBe(true); expect(button.style.color).toBe('red')
  button.focus(); expect(focus).toHaveBeenCalledOnce()
})
// 动态 href 在 button 与 a 间切换，实例只激活当前节点，旧节点不再触发回调。
it('[button.ref.dynamic] switches native root and detaches stale listener', () => {
  const [href,setHref] = createSignal<string | undefined>(undefined,{ownedWrite:true})
  let ref!: ButtonIns
  const click = vi.fn((e: MouseEvent) => e.preventDefault())
  const host = setup({get href(){return href()},ref:value => ref=value,onClick:click,children:'切换',target:'_blank',rel:'noopener'})
  const old = host.querySelector('button')!; expect(ref.buttonEle()).toBe(old)
  setHref('#next'); flush()
  const link = host.querySelector('a')!; expect(ref.anchorEle()).toBe(link); expect(ref.buttonEle()).toBeUndefined()
  expect(link.target).toBe('_blank'); expect(link.rel).toBe('noopener')
  old.click(); expect(click).not.toHaveBeenCalled(); ref.click(); expect(click).toHaveBeenCalledOnce()
  setHref(''); flush(); expect(host.querySelector('a')).toBeNull(); expect(ref.anchorEle()).toBeUndefined()
  ref.click(); expect(click).toHaveBeenCalledTimes(2)
  cleanup(); cleanup=()=>{}; expect(ref.buttonEle()).toBeUndefined(); expect(ref.anchorEle()).toBeUndefined()
})
// 禁用和加载组合都禁止链接导航及回调，解除状态后可以正常激活。
it.each([{disabled:true,loading:false},{disabled:false,loading:true},{disabled:true,loading:true}])('[button.link.blocked] $disabled / $loading', state => {
  const [blocked,setBlocked] = createSignal(true,{ownedWrite:true}); const click=vi.fn()
  const host=setup({href:'#next',get disabled(){return blocked() && state.disabled},get loading(){return blocked() && state.loading},onClick:click})
  const link=host.querySelector('a')!; expect(link.hasAttribute('href')).toBe(false); expect(link.getAttribute('aria-disabled')).toBe('true')
  const event=new MouseEvent('click',{bubbles:true,cancelable:true}); link.dispatchEvent(event)
  expect(event.defaultPrevented).toBe(true); expect(click).not.toHaveBeenCalled()
  setBlocked(false); flush(); expect(link.getAttribute('href')).toBe('#next'); link.click(); expect(click).toHaveBeenCalledOnce()
})
// 只有非 text/link 外观出现点击波纹，400ms 后移除。
it.each(['outlined','solid','filled','dashed','text','link'] as const)('[button.wave] %s', variant => {
  vi.useFakeTimers(); const host=setup({variant,children:'点击'}); host.querySelector('button')!.click(); flush()
  expect(!!host.querySelector('.animate-wave')).toBe(variant !== 'text' && variant !== 'link')
  vi.advanceTimersByTime(400); flush(); expect(host.querySelector('.animate-wave')).toBeNull()
})
// 无文本时不生成多余内容节点，data 属性和动态名称仍保留在根节点。
it('[button.empty.native] supports empty content and reactive attributes', () => {
  const [label,setLabel]=createSignal('新增',{ownedWrite:true})
  const view=mount(() => <Button data-action="create" aria-label={label()} />); cleanup=view.dispose
  const button=view.host.querySelector('button')!; expect(button.children.length).toBe(0)
  expect(button.dataset.action).toBe('create'); expect(button.getAttribute('aria-label')).toBe('新增')
  setLabel('添加'); flush(); expect(button.getAttribute('aria-label')).toBe('添加')
})
