import Basic from '../../../docs/src/examples/layout/basic'
import TopSide from '../../../docs/src/examples/layout/top-side'
import Side from '../../../docs/src/examples/layout/side'
import CustomTrigger from '../../../docs/src/examples/layout/custom-trigger'
import Responsive from '../../../docs/src/examples/layout/responsive'
import FixedHeader from '../../../docs/src/examples/layout/fixed-header'
import FixedSider from '../../../docs/src/examples/layout/fixed-sider'
import Theme from '../../../docs/src/examples/layout/theme'
import ReverseArrow from '../../../docs/src/examples/layout/reverse-arrow'
import Overflow from '../../../docs/src/examples/layout/overflow'

// 与文档站共用同一批示例文件，避免演示与文档代码漂移。
export default function LayoutPage() {
  return <div class="p-6 max-w-4xl space-y-8">
    <h2 class="text-2xl font-bold">Layout 布局</h2>
    <section data-layout-demo="basic"><h3 class="mb-3">基本结构</h3><Basic /></section>
    <section data-layout-demo="top-side"><h3 class="mb-3">顶部-侧边布局</h3><TopSide /></section>
    <section data-layout-demo="side"><h3 class="mb-3">侧边布局</h3><Side /></section>
    <section data-layout-demo="custom-trigger"><h3 class="mb-3">自定义触发器</h3><CustomTrigger /></section>
    <section data-layout-demo="responsive"><h3 class="mb-3">响应式布局</h3><Responsive /></section>
    <section data-layout-demo="fixed-header"><h3 class="mb-3">固定头部</h3><FixedHeader /></section>
    <section data-layout-demo="fixed-sider"><h3 class="mb-3">固定侧边栏</h3><FixedSider /></section>
    <section data-layout-demo="theme"><h3 class="mb-3">主题</h3><Theme /></section>
    <section data-layout-demo="reverse-arrow"><h3 class="mb-3">右侧边栏</h3><ReverseArrow /></section>
    <section data-layout-demo="overflow"><h3 class="mb-3">内容溢出</h3><Overflow /></section>
  </div>
}
