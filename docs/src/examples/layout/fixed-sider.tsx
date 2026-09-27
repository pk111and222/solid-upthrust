import { For } from 'solid-js'
import Layout from 'upthrust-ui/source/Layout'

const { Header, Footer, Sider, Content } = Layout

const nav = Array.from({ length: 16 }, (_, index) => `导航 ${index + 1}`)
const rows = Array.from({ length: 30 }, (_, index) => index + 1)

export default function FixedSider() {
  // 整个布局定高：Sider 与右侧内容各自滚动。菜单比 Sider 高时，底部触发器始终可见，且不会盖住最后一项。
  return <Layout class="h-[360px] rounded-lg overflow-hidden" data-layout-fixed-sider>
    <Sider collapsible>
      <ul class="m-0 p-xs list-none">
        <For each={nav}>{item => <li class="h-[40px] px-md flex items-center rounded whitespace-nowrap hover:bg-inverse-on-surface/10">{item}</li>}</For>
      </ul>
    </Sider>
    <Layout>
      <Header>固定侧边栏</Header>
      <Content class="overflow-y-auto p-lg" data-scroll>
        <For each={rows}>{row => <p class="my-xs">第 {row} 行内容</p>}</For>
      </Content>
      <Footer class="text-center py-sm">Upthrust UI ©2026</Footer>
    </Layout>
  </Layout>
}
