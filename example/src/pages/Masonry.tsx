import Basic from '../../../docs/src/examples/masonry/basic'
import Responsive from '../../../docs/src/examples/masonry/responsive'
import Image from '../../../docs/src/examples/masonry/image'
import Dynamic from '../../../docs/src/examples/masonry/dynamic'
import Fresh from '../../../docs/src/examples/masonry/fresh'
import ItemRender from '../../../docs/src/examples/masonry/item-render'
import LayoutChange from '../../../docs/src/examples/masonry/layout-change'
import Sequential from '../../../docs/src/examples/masonry/sequential'
import Children from '../../../docs/src/examples/masonry/children'

// 与文档站共用同一批示例文件，避免演示与文档代码漂移。
export default function MasonryPage() {
  return <div class="p-6 max-w-4xl space-y-8">
    <h2 class="text-2xl font-bold">Masonry 瀑布流</h2>
    <section data-masonry-demo="basic"><h3 class="mb-3">基本用法</h3><Basic /></section>
    <section data-masonry-demo="responsive"><h3 class="mb-3">响应式</h3><Responsive /></section>
    <section data-masonry-demo="image"><h3 class="mb-3">图片</h3><Image /></section>
    <section data-masonry-demo="dynamic"><h3 class="mb-3">动态增删</h3><Dynamic /></section>
    <section data-masonry-demo="fresh"><h3 class="mb-3">内容尺寸变化</h3><Fresh /></section>
    <section data-masonry-demo="item-render"><h3 class="mb-3">所在列与固定列</h3><ItemRender /></section>
    <section data-masonry-demo="layout-change"><h3 class="mb-3">布局回调</h3><LayoutChange /></section>
    <section data-masonry-demo="sequential"><h3 class="mb-3">顺序分列</h3><Sequential /></section>
    <section data-masonry-demo="children"><h3 class="mb-3">子节点写法</h3><Children /></section>
  </div>
}
