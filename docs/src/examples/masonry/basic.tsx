import Masonry from 'upthrust-ui/source/Masonry'

const heights = [150, 50, 90, 70, 110, 150, 130, 80, 50, 90, 100, 150, 60, 50, 80]
const items = heights.map((height, index) => ({ key: `item-${index}`, data: height }))

export default function Basic() {
  return <Masonry
    columns={4}
    gutter={16}
    items={items}
    itemRender={({ data, index }) => (
      <div
        class="flex items-center justify-center rounded-lg border border-outline-variant bg-surface-variant/40 text-on-surface"
        style={{ height: `${data}px` }}
      >
        {index + 1}
      </div>
    )}
    data-masonry-basic
  />
}
