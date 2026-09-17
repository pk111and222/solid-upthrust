import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it } from 'vitest'
import VirtualList, { type VirtualListProps } from '../../../components/lib/_VirtualList'
import { mount } from '../../utils/mount'
let cleanup = () => {}
afterEach(() => cleanup())
const items = Array.from({ length: 1000 }, (_, i) => `项目 ${i}`)
function setup(props: Omit<VirtualListProps<string>, 'children'>) {
  const view = mount(() => <VirtualList {...props}>{(item, index) => <button data-index={index()}>{item}</button>}</VirtualList>)
  cleanup = view.dispose
  return { host:view.host, viewport:view.host.firstElementChild as HTMLDivElement }
}
// 默认值、容器属性与 children 的全局索引必须一致。
it('[virtual-list.defaults.dom] 默认窗口与容器属性', () => {
  const {host, viewport} = setup({ items, class:'list', role:'listbox' })
  expect(viewport.getAttribute('role')).toBe('listbox'); expect(viewport.className).toBe('list')
  expect(viewport.style.maxHeight).toBe('256px'); expect(host.querySelectorAll('button')).toHaveLength(11)
  expect(host.querySelector('button')?.dataset.index).toBe('0')
})
// 自定义行高、视口高度和滚动组合后，索引不能退回窗口局部索引。
it('[virtual-list.scroll.dom] 自定义尺寸下滚动', () => {
  const { host, viewport } = setup({ items, height:100, itemHeight:20 })
  viewport.scrollTop = 1000; viewport.dispatchEvent(new Event('scroll')); flush()
  expect(host.querySelector('button')?.dataset.index).toBe('47')
  expect(host.querySelector('button')?.textContent).toBe('项目 47')
  expect(host.querySelectorAll('button')).toHaveLength(11)
  expect((viewport.firstElementChild?.firstElementChild as HTMLElement).style.transform).toBe('translateY(940px)')
})
// activeIndex、数据缩减、关闭虚拟化及空数据共同覆盖 DOM 结构切换。
it('[virtual-list.reactive.dom] 活跃项定位与数据模式更新', () => {
  const [props, set] = createSignal({ items, height:100, itemHeight:20, activeIndex:50, virtual:true }, {ownedWrite:true})
  const view = mount(() => <VirtualList {...props()}>{(item, index) => <button data-index={index()}>{item}</button>}</VirtualList>); cleanup = view.dispose
  const viewport = view.host.firstElementChild as HTMLDivElement
  expect(viewport.scrollTop).toBe(920); expect(view.host.querySelector('[data-index="50"]')).not.toBeNull()
  set({...props(), items:items.slice(0,2), activeIndex:-1}); flush()
  expect(viewport.scrollTop).toBe(0); expect(view.host.querySelectorAll('button')).toHaveLength(2)
  set({...props(), items:items.slice(0,20), virtual:false}); flush()
  expect(viewport.dataset.virtualList).toBe('false'); expect(view.host.querySelectorAll('button')).toHaveLength(20)
  expect((viewport.firstElementChild as HTMLElement).style.height).toBe('')
  expect((view.host.querySelector('[role="presentation"]') as HTMLElement).style.height).toBe('')
  set({...props(), items:[], virtual:true}); flush(); expect(view.host.querySelectorAll('button')).toHaveLength(0)
})
// 非虚拟模式完整渲染，行高不限制自定义内容高度。
it('[virtual-list.plain.dom] 非虚拟模式与空列表', () => {
  const {host,viewport} = setup({ items:items.slice(0,30), virtual:false, activeIndex:0 })
  expect(host.querySelectorAll('button')).toHaveLength(30)
  expect((viewport.firstElementChild?.firstElementChild as HTMLElement).style.transform).toBe('')
})
