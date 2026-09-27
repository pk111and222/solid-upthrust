import { For, createSignal } from 'solid-js'
import Masonry, { type MasonryLayoutItem } from 'upthrust-ui/source/Masonry'

const heights = [90, 40, 130, 60, 80, 50, 110]
const items = heights.map((height, index) => ({ key: String.fromCharCode(65 + index), data: height }))

export default function LayoutChange() {
  const [layout, setLayout] = createSignal<MasonryLayoutItem<number>[]>([])
  /** 按列汇总 onLayoutChange 上报的结果。 */
  const columns = () => [0, 1, 2].map(column => layout().filter(item => item.column === column).map(item => item.key).join(' '))
  return <div class="flex flex-col gap-md" data-masonry-layout-change>
    {/* onLayoutChange：全部项定位后、且列分配变化时才触发，可用于同步外部状态或统计。 */}
    <Masonry
      columns={3}
      gutter={8}
      items={items}
      onLayoutChange={setLayout}
      itemRender={({ key, data }) => (
        <div class="flex items-center justify-center rounded bg-secondary-container text-on-secondary-container" style={{ height: `${data}px` }}>
          {key}
        </div>
      )}
    />
    <ul class="m-0 pl-lg font-mono text-sm text-on-surface-variant" data-layout>
      <For each={columns()}>{(keys, column) => <li>第 {column() + 1} 列：{keys}</li>}</For>
    </ul>
  </div>
}
