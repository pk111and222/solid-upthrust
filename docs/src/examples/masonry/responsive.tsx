import Masonry from 'upthrust-ui/source/Masonry'

const heights = [120, 55, 85, 160, 95, 140, 75, 60, 110, 65, 130, 90]
const items = heights.map((height, index) => ({ key: index, data: height }))

export default function Responsive() {
  return <Masonry
    // 按视口断点取值：命中多个断点时取最宽的已定义值；都未命中时取 xs，再退回 1。
    columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
    // 间距同样支持断点；数组为 [水平, 垂直]，垂直未命中时沿用水平。
    gutter={[{ xs: 8, sm: 12, md: 16 }, { xs: 8, md: 24 }]}
    items={items}
    itemRender={({ data, index }) => (
      <div
        class="flex items-center justify-center rounded-lg bg-primary-container text-on-primary-container"
        style={{ height: `${data}px` }}
      >
        {index + 1}
      </div>
    )}
    data-masonry-responsive
  />
}
