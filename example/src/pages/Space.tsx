import Base from '../../../docs/src/examples/space/base'
import Vertical from '../../../docs/src/examples/space/vertical'
import Size from '../../../docs/src/examples/space/size'
import Align from '../../../docs/src/examples/space/align'
import Wrap from '../../../docs/src/examples/space/wrap'
import Separator from '../../../docs/src/examples/space/separator'
import CompactDemo from '../../../docs/src/examples/space/compact'
import CompactButtons from '../../../docs/src/examples/space/compact-buttons'
import CompactVertical from '../../../docs/src/examples/space/compact-vertical'
import AddonDemo from '../../../docs/src/examples/space/addon'
import Semantic from '../../../docs/src/examples/space/semantic'
import Block from '../../../docs/src/examples/space/block'

// 与文档站共用同一批示例文件，避免演示与文档代码漂移。
export default function SpacePage() {
  return <div class="p-6 max-w-4xl space-y-8">
    <h2 class="text-2xl font-bold">Space 间距</h2>
    <section data-space-demo="base"><h3 class="mb-3">基本用法</h3><Base /></section>
    <section data-space-demo="vertical"><h3 class="mb-3">垂直间距</h3><Vertical /></section>
    <section data-space-demo="size"><h3 class="mb-3">间距大小</h3><Size /></section>
    <section data-space-demo="align"><h3 class="mb-3">对齐</h3><Align /></section>
    <section data-space-demo="wrap"><h3 class="mb-3">自动换行</h3><Wrap /></section>
    <section data-space-demo="separator"><h3 class="mb-3">分隔符</h3><Separator /></section>
    <section data-space-demo="compact"><h3 class="mb-3">紧凑布局组合</h3><CompactDemo /></section>
    <section data-space-demo="compact-buttons"><h3 class="mb-3">按钮组合</h3><CompactButtons /></section>
    <section data-space-demo="compact-vertical"><h3 class="mb-3">垂直方向紧凑布局</h3><CompactVertical /></section>
    <section data-space-demo="addon"><h3 class="mb-3">组合文本单元</h3><AddonDemo /></section>
    <section data-space-demo="semantic"><h3 class="mb-3">语义化定制</h3><Semantic /></section>
    <section data-space-demo="block"><h3 class="mb-3">撑满宽度</h3><Block /></section>
  </div>
}
