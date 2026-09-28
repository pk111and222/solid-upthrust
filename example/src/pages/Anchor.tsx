import type { Component } from 'solid-js'
import Basic from '../../../docs/src/examples/anchor/basic'
import Horizontal from '../../../docs/src/examples/anchor/horizontal'
import Static from '../../../docs/src/examples/anchor/static'
import OnClick from '../../../docs/src/examples/anchor/on-click'
import CustomHighlight from '../../../docs/src/examples/anchor/custom-highlight'
import OnChange from '../../../docs/src/examples/anchor/on-change'
import TargetOffset from '../../../docs/src/examples/anchor/target-offset'
import Replace from '../../../docs/src/examples/anchor/replace'
import Container from '../../../docs/src/examples/anchor/container'

// 示例与文档站共用 docs/src/examples/anchor。注意：本应用的滚动容器是 [data-appid=content] 而非窗口，
// 以窗口为容器的示例（basic / horizontal 等）在这里只展示结构；scroll-spy 行为以「自定义滚动容器」为准。
const AnchorPage: Component = () => (
  <div class="p-6 max-w-5xl flex flex-col gap-8">
    <div>
      <h2 class="text-2xl font-bold mb-2">Anchor 锚点</h2>
      <p class="text-on-surface-variant">用于跳转到页面指定位置，并随滚动高亮当前区块。</p>
    </div>
    <section data-anchor-demo="container"><h3 class="text-lg font-semibold mb-3">自定义滚动容器</h3><Container /></section>
    <section data-anchor-demo="static"><h3 class="text-lg font-semibold mb-3">静态位置</h3><Static /></section>
    <section data-anchor-demo="on-click"><h3 class="text-lg font-semibold mb-3">自定义 onClick</h3><OnClick /></section>
    <section data-anchor-demo="custom-highlight"><h3 class="text-lg font-semibold mb-3">自定义锚点高亮</h3><CustomHighlight /></section>
    <section data-anchor-demo="on-change"><h3 class="text-lg font-semibold mb-3">监听锚点链接改变</h3><OnChange /></section>
    <section data-anchor-demo="target-offset"><h3 class="text-lg font-semibold mb-3">设置锚点滚动偏移量</h3><TargetOffset /></section>
    <section data-anchor-demo="replace"><h3 class="text-lg font-semibold mb-3">替换历史中的 href</h3><Replace /></section>
    <section data-anchor-demo="horizontal"><h3 class="text-lg font-semibold mb-3">横向锚点</h3><Horizontal /></section>
    <section data-anchor-demo="basic"><h3 class="text-lg font-semibold mb-3">基本使用</h3><Basic /></section>
  </div>
)

export default AnchorPage
