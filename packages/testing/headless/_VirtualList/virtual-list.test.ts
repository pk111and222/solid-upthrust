import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it } from 'vitest'
import { createVirtualList } from '../../../competence/src/virtualList'
const disposers: (() => void)[] = []
afterEach(() => disposers.splice(0).forEach(dispose => dispose()))
describe('virtual lists', () => {
  // 万条数据仅渲染视口及缓冲区域。
  it('[virtual-list.window] renders a bounded window for ten thousand records', () => createRoot(dispose => {
    disposers.push(dispose)
    const list = createVirtualList({ items: Array.from({length:10000}, (_,i) => i), height: 256, itemHeight: 32 })
    expect(list.items()).toHaveLength(11); expect(list.totalHeight()).toBe(320000)
    list.setScrollTop(32000); flush(); expect(list.start()).toBe(997); expect(list.items()).toHaveLength(14)
  }))
  // 定位不可见活跃项并支持返回首行。
  it('[virtual-list.active] brings an offscreen active item into view', () => createRoot(dispose => {
    disposers.push(dispose)
    const list = createVirtualList({ items: Array.from({length:1000}, (_,i) => i), height: 256 })
    list.scrollToIndex(100); flush(); expect(list.items()).toContain(100)
    list.scrollToIndex(0); flush(); expect(list.start()).toBe(0)
  }))
  // 过滤缩减后限制滚动并允许关闭虚拟化。
  it('[virtual-list.shrink] clamps scroll when filtered results shrink and supports opting out', () => createRoot(dispose => {
    disposers.push(dispose)
    const [items, setItems] = createSignal(Array.from({length:1000}, (_,i) => i), {ownedWrite:true})
    const list = createVirtualList({ get items() { return items() } })
    list.setScrollTop(30000); flush(); setItems([0,1]); flush()
    expect(list.items()).toEqual([0,1]); expect(list.scrollTop()).toBe(0)
    expect(createVirtualList({ items: Array.from({length:1000}), virtual:false }).items()).toHaveLength(1000)
  }))
})
// 视口比内容高、零尺寸和边界索引不得产生负滚动位置。
it('[virtual-list.boundary.math] 尺寸及索引边界', () => createRoot(dispose => {
  disposers.push(dispose)
  const list = createVirtualList({items:[0,1],height:100,itemHeight:20,overscan:0})
  expect(list.scrollToIndex(0)).toBe(0); flush()
  expect(list.scrollTop()).toBe(0)
  expect(list.scrollToIndex(-1)).toBe(0); expect(list.scrollToIndex(2)).toBe(0)
  list.setScrollTop(-20); flush(); expect(list.scrollTop()).toBe(0)
  const zero = createVirtualList({items:[1,2],height:0,itemHeight:0,overscan:0})
  expect(zero.height()).toBe(1); expect(zero.itemHeight()).toBe(1); expect(zero.items()).toEqual([1])
}))
// overscan 为零只保留可见行，超大滚动钳制到末尾；定位返回值不等待 flush。
it('[virtual-list.overscan.math] 缓冲范围和同步定位返回值', () => createRoot(dispose => {
  disposers.push(dispose)
  const list = createVirtualList({items:Array.from({length:100},(_,i)=>i),height:40,itemHeight:20,overscan:0})
  expect(list.items()).toEqual([0,1]); expect(list.scrollToIndex(50)).toBe(980); flush()
  expect(list.items()).toEqual([49,50]); expect(list.scrollToIndex(49)).toBe(980)
  list.setScrollTop(100000); flush(); expect(list.scrollTop()).toBe(1960); expect(list.items()).toEqual([98,99])
}))
