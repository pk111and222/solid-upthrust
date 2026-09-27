import Horizontal from '../../../docs/src/examples/divider/horizontal'
import WithText from '../../../docs/src/examples/divider/with-text'
import OrientationMargin from '../../../docs/src/examples/divider/orientation-margin'
import Size from '../../../docs/src/examples/divider/size'
import Plain from '../../../docs/src/examples/divider/plain'
import Vertical from '../../../docs/src/examples/divider/vertical'
import Semantic from '../../../docs/src/examples/divider/semantic'

// 与文档站共用同一批示例文件，避免演示与文档代码漂移。
export default function DividerPage() {
  return <div class="p-6 max-w-4xl space-y-8">
    <h2 class="text-2xl font-bold">Divider 分割线</h2>
    <section data-divider-demo="horizontal"><h3 class="mb-3">水平分割线</h3><Horizontal /></section>
    <section data-divider-demo="with-text"><h3 class="mb-3">带文字的分割线</h3><WithText /></section>
    <section data-divider-demo="orientation-margin"><h3 class="mb-3">标题边距</h3><OrientationMargin /></section>
    <section data-divider-demo="size"><h3 class="mb-3">设置间距大小</h3><Size /></section>
    <section data-divider-demo="plain"><h3 class="mb-3">正文样式标题</h3><Plain /></section>
    <section data-divider-demo="vertical"><h3 class="mb-3">垂直分割线</h3><Vertical /></section>
    <section data-divider-demo="semantic"><h3 class="mb-3">自定义样式</h3><Semantic /></section>
  </div>
}
