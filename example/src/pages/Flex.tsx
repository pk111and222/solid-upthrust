import Basic from '../../../docs/src/examples/flex/basic'
import Align from '../../../docs/src/examples/flex/align'
import Gap from '../../../docs/src/examples/flex/gap'
import Wrap from '../../../docs/src/examples/flex/wrap'
import Combination from '../../../docs/src/examples/flex/combination'
import FlexItem from '../../../docs/src/examples/flex/flex-item'
import Element from '../../../docs/src/examples/flex/element'
import InlineEmpty from '../../../docs/src/examples/flex/inline-empty'

// 与文档站共用同一批示例文件，避免演示与文档代码漂移。
export default function FlexPage() {
  return <div class="p-6 max-w-4xl space-y-8">
    <h2 class="text-2xl font-bold">Flex 弹性布局</h2>
    <section data-flex-demo="basic"><h3 class="mb-3">基本布局</h3><Basic /></section>
    <section data-flex-demo="align"><h3 class="mb-3">对齐方式</h3><Align /></section>
    <section data-flex-demo="gap"><h3 class="mb-3">设置间隙</h3><Gap /></section>
    <section data-flex-demo="wrap"><h3 class="mb-3">自动换行</h3><Wrap /></section>
    <section data-flex-demo="combination"><h3 class="mb-3">组合使用</h3><Combination /></section>
    <section data-flex-demo="flex-item"><h3 class="mb-3">flex 属性</h3><FlexItem /></section>
    <section data-flex-demo="element"><h3 class="mb-3">语义元素与原生属性</h3><Element /></section>
    <section data-flex-demo="inline-empty"><h3 class="mb-3">行内与空容器</h3><InlineEmpty /></section>
  </div>
}
