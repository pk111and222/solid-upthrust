import Basic from '../../../docs/src/examples/splitter/basic'
import Control from '../../../docs/src/examples/splitter/control'
import Vertical from '../../../docs/src/examples/splitter/vertical'
import Collapsible from '../../../docs/src/examples/splitter/collapsible'
import CollapsibleIcon from '../../../docs/src/examples/splitter/collapsible-icon'
import Multiple from '../../../docs/src/examples/splitter/multiple'
import Nested from '../../../docs/src/examples/splitter/nested'
import Lazy from '../../../docs/src/examples/splitter/lazy'
import Customize from '../../../docs/src/examples/splitter/customize'
import DoubleClick from '../../../docs/src/examples/splitter/double-click'
import DestroyOnHidden from '../../../docs/src/examples/splitter/destroy-on-hidden'

// 与文档站共用同一批示例文件，避免演示与文档代码漂移。
export default function SplitterPage() {
  return <div class="p-6 max-w-4xl space-y-8">
    <h2 class="text-2xl font-bold">Splitter 分隔面板</h2>
    <section data-splitter-demo="basic"><h3 class="mb-3">基本用法</h3><Basic /></section>
    <section data-splitter-demo="control"><h3 class="mb-3">受控模式</h3><Control /></section>
    <section data-splitter-demo="vertical"><h3 class="mb-3">垂直方向</h3><Vertical /></section>
    <section data-splitter-demo="collapsible"><h3 class="mb-3">可折叠</h3><Collapsible /></section>
    <section data-splitter-demo="collapsible-icon"><h3 class="mb-3">自定义折叠图标</h3><CollapsibleIcon /></section>
    <section data-splitter-demo="multiple"><h3 class="mb-3">多面板</h3><Multiple /></section>
    <section data-splitter-demo="nested"><h3 class="mb-3">复杂组合</h3><Nested /></section>
    <section data-splitter-demo="lazy"><h3 class="mb-3">延迟渲染</h3><Lazy /></section>
    <section data-splitter-demo="customize"><h3 class="mb-3">自定义样式</h3><Customize /></section>
    <section data-splitter-demo="double-click"><h3 class="mb-3">双击重置</h3><DoubleClick /></section>
    <section data-splitter-demo="destroy-on-hidden"><h3 class="mb-3">隐藏时销毁</h3><DestroyOnHidden /></section>
  </div>
}
