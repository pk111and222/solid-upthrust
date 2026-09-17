import { render } from '@solidjs/web'
import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Tabs, { type TabsItem } from '../../../components/lib/Tabs/index'
let dispose:(()=>void)|undefined
const mount=(view:Parameters<typeof render>[0])=>{const host=document.createElement('div');document.body.append(host);dispose=render(view,host);flush();return host}
afterEach(()=>{dispose?.();flush();document.body.innerHTML=''})
it('renders editable add/remove controls and updates through the parent',()=>{
 const [items,setItems]=createSignal<TabsItem[]>([{key:'a',label:'A',closable:false},{key:'b',label:'B'}],{ownedWrite:true})
 const host=mount(()=><Tabs type="editable-card" items={items()} onEdit={(key,action)=>{if(action==='add')setItems(list=>[...list,{key:'c',label:'C'}]);else setItems(list=>list.filter(item=>item.key!==key))}} />)
 expect(host.querySelector('[aria-label="关闭 A"]')).toBeNull()
 ;(host.querySelector('[aria-label="新增页签"]') as HTMLButtonElement).click();flush();expect(host.querySelectorAll('[role="tab"]')).toHaveLength(3)
 ;(host.querySelector('[aria-label="关闭 B"]') as HTMLButtonElement).click();flush();expect(host.querySelectorAll('[role="tab"]')).toHaveLength(2)
})
it('reorders through native drag/drop and retains active content',()=>{
 const onReorder=vi.fn()
 const host=mount(()=><Tabs draggable items={[{key:'a',label:'A',children:'Panel A'},{key:'b',label:'B',children:'Panel B'}]} onReorder={onReorder} />)
 const tabs=host.querySelectorAll('[role="tab"]')
 tabs[0].dispatchEvent(new DragEvent('dragstart',{bubbles:true}));flush();tabs[1].dispatchEvent(new DragEvent('drop',{bubbles:true}));flush()
 expect([...host.querySelectorAll('[role="tab"]')].map(node=>node.textContent)).toEqual(['B','A'])
 expect(host.querySelector('[aria-selected="true"]')?.textContent).toBe('A');expect(onReorder).toHaveBeenCalledOnce()
})
