import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Cascader from '../../../components/lib/Cascader'
import { mount } from '../../utils/mount'
let dispose=()=>{}
afterEach(()=>{dispose();dispose=()=>{}})
// Radio 修复共享 Selection 后，本消费者仍须保持受控显示并接受父层更新。
it('[cascader.selection.integration] controlled rejection and parent update',()=>{
 const [value,set]=createSignal(["a"],{ownedWrite:true}),cb=vi.fn()
 const view=mount(()=><Cascader virtual={false} value={value()} options={[{label:'A',value:'a'},{label:'B',value:'b'}]} onChange={cb}/>);dispose=view.dispose
 const box=view.host.querySelector('[role="combobox"]') as HTMLElement
 expect(box.textContent).toContain('A')
 box.click();flush()
 const option=[...document.querySelectorAll<HTMLElement>('[role="option"]')].find(el=>el.textContent?.trim()==='B')!
 expect(option).toBeDefined();option.click();flush();expect(cb).toHaveBeenCalledTimes(1);expect(box.textContent).toContain('A');expect(box.textContent).not.toContain('B')
 set(["b"]);flush();expect(box.textContent).toContain('B')
})
