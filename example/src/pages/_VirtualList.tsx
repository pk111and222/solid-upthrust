import { createSignal } from 'solid-js'
import VirtualList from 'upthrust-ui/source/_VirtualList'
export default function VirtualListExample() {
  const all = Array.from({length:1000}, (_, index) => `项目 ${index}`)
  const [items, setItems] = createSignal(all)
  const [active, setActive] = createSignal(0)
  const [virtual, setVirtual] = createSignal(true)
  return <div>
    <p>固定行高 32px；视口 160px。内部基础组件，不从主入口导出。</p>
    <div class="flex gap-4 my-4">
      <button type="button" onClick={() => setActive(500)}>定位第 501 项</button>
      <button type="button" onClick={() => { setItems(items().length === 2 ? all : all.slice(0,2)); setActive(-1) }}>切换数据量</button>
      <button type="button" onClick={() => setVirtual(!virtual())}>切换虚拟化</button>
    </div>
    <VirtualList items={items()} height={160} itemHeight={32} activeIndex={active()} virtual={virtual()} role="list" class="border border-outline-variant">
      {(item,index) => <div role="listitem" class="h-8 leading-8 px-3" data-index={index()}>{item}</div>}
    </VirtualList>
  </div>
}
