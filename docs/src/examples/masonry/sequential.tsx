import Masonry from 'upthrust-ui/source/Masonry'

const heights = [60, 100, 40, 80, 120, 50, 70, 90, 60, 110, 40, 80]
const items = heights.map((height, index) => ({ key: index, data: height }))
const card = (props: { data?: number; index: number }) => (
  <div class="flex items-center justify-center rounded bg-tertiary-container text-on-tertiary-container" style={{ height: `${props.data}px` }}>
    {props.index + 1}
  </div>
)

export default function Sequential() {
  return <div class="grid gap-lg md:grid-cols-2" data-masonry-sequential>
    <div class="min-w-0">
      <p class="m-0 mb-xs text-on-surface-variant">默认：放入当前最短的列</p>
      <Masonry columns={5} gutter={8} items={items} itemRender={card} />
    </div>
    <div class="min-w-0">
      {/* sequential（本库扩展）：按阅读顺序均衡分列（12 项 5 列 → 3、3、2、2、2），不看高度。 */}
      <p class="m-0 mb-xs text-on-surface-variant">sequential：按顺序均衡分列</p>
      <Masonry columns={5} gutter={8} sequential items={items} itemRender={card} />
    </div>
  </div>
}
