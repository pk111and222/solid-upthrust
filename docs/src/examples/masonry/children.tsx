import Masonry from 'upthrust-ui/source/Masonry'

const card = 'flex items-center justify-center rounded-lg border border-outline-variant text-on-surface'

export default function Children() {
  // 不传 items 时，每个子节点就是一项（key 为下标）；false / null 会被忽略。
  return <Masonry columns={3} gutter="small" data-masonry-children>
    <div class={card} style={{ height: '80px' }}>A</div>
    <div class={card} style={{ height: '140px' }}>B</div>
    <div class={card} style={{ height: '60px' }}>C</div>
    <div class={card} style={{ height: '100px' }}>D</div>
    <div class={card} style={{ height: '70px' }}>E</div>
  </Masonry>
}
