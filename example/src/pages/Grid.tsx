import Basic from '../../../docs/src/examples/grid/basic'
import Gutter from '../../../docs/src/examples/grid/gutter'
import Offset from '../../../docs/src/examples/grid/offset'
import Sort from '../../../docs/src/examples/grid/sort'
import FlexDemo from '../../../docs/src/examples/grid/flex'
import Align from '../../../docs/src/examples/grid/align'
import Order from '../../../docs/src/examples/grid/order'
import FlexStretch from '../../../docs/src/examples/grid/flex-stretch'
import Responsive from '../../../docs/src/examples/grid/responsive'
import ResponsiveMore from '../../../docs/src/examples/grid/responsive-more'
import UseBreakpoint from '../../../docs/src/examples/grid/use-breakpoint'
import Playground from '../../../docs/src/examples/grid/playground'

// 与文档站共用同一批示例文件，避免演示与文档代码漂移。
export default function GridPage() {
  return <div class="p-6 max-w-4xl space-y-8">
    <h2 class="text-2xl font-bold">Grid 栅格</h2>
    <section data-grid-demo="basic"><h3 class="mb-3">基础栅格</h3><Basic /></section>
    <section data-grid-demo="gutter"><h3 class="mb-3">区块间隔</h3><Gutter /></section>
    <section data-grid-demo="offset"><h3 class="mb-3">左右偏移</h3><Offset /></section>
    <section data-grid-demo="sort"><h3 class="mb-3">栅格排序</h3><Sort /></section>
    <section data-grid-demo="flex"><h3 class="mb-3">排版</h3><FlexDemo /></section>
    <section data-grid-demo="align"><h3 class="mb-3">对齐</h3><Align /></section>
    <section data-grid-demo="order"><h3 class="mb-3">排序</h3><Order /></section>
    <section data-grid-demo="flex-stretch"><h3 class="mb-3">Flex 填充</h3><FlexStretch /></section>
    <section data-grid-demo="responsive"><h3 class="mb-3">响应式布局</h3><Responsive /></section>
    <section data-grid-demo="responsive-more"><h3 class="mb-3">其他属性的响应式</h3><ResponsiveMore /></section>
    <section data-grid-demo="use-breakpoint"><h3 class="mb-3">useBreakpoint</h3><UseBreakpoint /></section>
    <section data-grid-demo="playground"><h3 class="mb-3">栅格配置器</h3><Playground /></section>
  </div>
}
