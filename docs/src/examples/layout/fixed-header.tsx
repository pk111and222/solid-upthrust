import { For } from 'solid-js'
import Layout from 'upthrust-ui/source/Layout'

const { Header, Footer, Content } = Layout

const rows = Array.from({ length: 30 }, (_, index) => index + 1)

export default function FixedHeader() {
  // 外层容器负责滚动；Header 用 sticky 固定在滚动容器顶部（页面级滚动时同样适用）。
  return <div class="h-[320px] overflow-y-auto rounded-lg border border-solid border-outline-variant" data-layout-fixed-header>
    <Layout>
      <Header class="sticky top-0 z-1 shadow-sm">固定的顶栏</Header>
      <Content class="p-lg">
        <For each={rows}>{row => <p class="my-xs">第 {row} 行内容</p>}</For>
      </Content>
      <Footer class="text-center">Upthrust UI ©2026</Footer>
    </Layout>
  </div>
}
