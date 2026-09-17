import { render } from '@solidjs/web'
import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Select from '../../../components/lib/Select'
import TreeSelect from '../../../components/lib/TreeSelect'
import Cascader from '../../../components/lib/Cascader'
let dispose: (() => void) | undefined
const hosts: HTMLElement[] = []
const mount = (view: Parameters<typeof render>[0]) => { const host = document.createElement('div'); document.body.append(host); hosts.push(host); dispose = render(view, host); flush(); return host }
afterEach(() => { dispose?.(); flush(); hosts.splice(0).forEach(host => host.remove()) })
const options = Array.from({length:10000},(_,value)=>({value,label:`Option ${value}`}))
describe('selector virtual rendering', () => {
  // Select 滚动远端项后选择回调正确。
  it('[virtual-list.selector.1] bounds Select DOM, scrolls to distant records and selects them', () => {
    const onChange = vi.fn()
    mount(() => <Select open options={options} onChange={onChange} listHeight={160} />)
    expect(document.querySelectorAll('[role="option"]').length).toBeLessThan(15)
    const scroll = document.querySelector('[data-virtual-list]') as HTMLDivElement
    scroll.scrollTop = 32000; scroll.dispatchEvent(new Event('scroll')); flush()
    const item = [...document.querySelectorAll('[role="option"]')].find(el=>el.textContent?.includes('Option 1000')) as HTMLElement
    expect(item).toBeDefined(); item.click(); flush(); expect(onChange).toHaveBeenCalledWith(1000)
  })
  // 键盘定位保持活跃项挂载并允许关闭虚拟化。
  it('[virtual-list.selector.2] keeps keyboard active options mounted and allows opting out', () => {
    const host = mount(() => <Select open options={options} listHeight={96} />)
    const selector = host.querySelector('[role="combobox"]')!
    for (let index=0; index<30; index++) { selector.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true})); flush() }
    expect(document.querySelector('[data-virtual-list]')!.scrollTop).toBeGreaterThan(0)
    dispose?.(); flush(); hosts.splice(0).forEach(host => host.remove())
    mount(() => <Select open options={options.slice(0,100)} virtual={false} />)
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(100)
  })
  // 过滤后恢复合法滚动位置。
  it('[virtual-list.selector.3] clamps after filtering shrinks a scrolled list', () => {
    const [data,setData] = createSignal(options, {ownedWrite:true})
    mount(() => <Select open options={data()} />)
    const viewport = document.querySelector('[data-virtual-list]')!
    viewport.scrollTop=300000; viewport.dispatchEvent(new Event('scroll')); flush()
    setData(options.slice(0,2)); flush()
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(2)
    expect(viewport.scrollTop).toBe(0)
  })
  // TreeSelect 虚拟节点保留选择行为。
  it('[virtual-list.selector.4] virtualizes visible TreeSelect nodes and preserves selection', () => {
    const onChange=vi.fn()
    mount(() => <TreeSelect open treeData={options} onChange={onChange} />)
    expect(document.querySelectorAll('[role="treeitem"]').length).toBeLessThan(20)
    const first=document.querySelector('[role="treeitem"] > div') as HTMLElement
    first.click(); flush(); expect(onChange).toHaveBeenCalledWith(0, options[0])
  })
  // Cascader 各列独立虚拟化。
  it('[virtual-list.selector.5] virtualizes each Cascader column', () => {
    const host = mount(() => <Cascader options={options.map(item=>({...item,children:[{value:'child',label:'Child'}]}))} />)
    ;(host.querySelector('[role="combobox"]') as HTMLElement).click(); flush()
    expect(document.querySelectorAll('[role="option"]').length).toBeLessThan(20)
    expect(document.querySelector('[data-virtual-list]')).not.toBeNull()
  })
})
