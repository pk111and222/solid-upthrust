import Masonry, { type MasonryItem } from 'upthrust-ui/source/Masonry'

const heights = [100, 60, 140, 80, 120, 70, 90, 110]
const items: MasonryItem<number>[] = heights.map((height, index) => ({
  key: `card-${index}`,
  data: height,
  // column 把某一项固定到指定列（从 0 开始，超出范围取最后一列）。
  column: index === 0 ? 2 : undefined,
}))

export default function ItemRender() {
  return <Masonry
    columns={3}
    gutter={12}
    items={items}
    // column 是响应式的：列变化时只更新读取它的文本，卡片本身不会重建。
    itemRender={item => (
      <div
        class="flex flex-col items-center justify-center gap-xxs rounded-lg bg-surface-variant/60 text-on-surface"
        style={{ height: `${item.data}px` }}
      >
        <span class="font-medium">{item.key}</span>
        <span class="text-xs text-on-surface-variant">第 {item.column + 1} 列{item.index === 0 ? '（固定）' : ''}</span>
      </div>
    )}
    data-masonry-item-render
  />
}
