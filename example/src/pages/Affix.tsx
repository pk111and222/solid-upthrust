import type { Component } from 'solid-js'
import Basic from '../../../docs/src/examples/affix/basic'
import Bottom from '../../../docs/src/examples/affix/bottom'
import OnChange from '../../../docs/src/examples/affix/on-change'
import Target from '../../../docs/src/examples/affix/target'

// 示例与文档站共用 docs/src/examples/affix。本应用滚动发生在 [data-appid=content] 内（窗口本身不滚动），
// 以窗口为目标的示例依赖捕获阶段的祖先滚动监听重测位置。
const AffixPage: Component = () => (
  <div class="p-6 max-w-5xl flex flex-col gap-8">
    <div>
      <h2 class="text-2xl font-bold mb-2">Affix 固钉</h2>
      <p class="text-on-surface-variant">将页面元素钉在可视范围。</p>
    </div>
    <section data-affix-demo="target"><h3 class="text-lg font-semibold mb-3">滚动容器</h3><Target /></section>
    <section data-affix-demo="basic"><h3 class="text-lg font-semibold mb-3">基本</h3><Basic /></section>
    <section data-affix-demo="on-change"><h3 class="text-lg font-semibold mb-3">固定状态改变的回调</h3><OnChange /></section>
    <section data-affix-demo="bottom"><h3 class="text-lg font-semibold mb-3">固定在底部</h3><Bottom /></section>
    <div class="h-[800px]" aria-hidden="true" />
  </div>
)

export default AffixPage
