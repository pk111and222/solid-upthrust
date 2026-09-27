import { For, createSignal } from 'solid-js'
import Layout from 'upthrust-ui/source/Layout'

const { Header, Sider, Content } = Layout

export default function Responsive() {
  const [log, setLog] = createSignal<string[]>([])
  const push = (line: string) => setLog(lines => [line, ...lines].slice(0, 4))
  return <Layout class="min-h-[280px] rounded-lg" data-layout-responsive>
    {/*
      breakpoint="lg"：视口窄于 992px 时自动收起，回到 992px 以上自动展开。
      collapsedWidth={0}：收起后完全隐藏，改用挂在右侧外沿的零宽触发器（非 collapsible 时仅在低于断点时出现）。
    */}
    <Sider
      breakpoint="lg"
      collapsedWidth={0}
      class="rounded-l-lg"
      onBreakpoint={broken => push(`onBreakpoint(${broken})`)}
      onCollapse={(collapsed, type) => push(`onCollapse(${collapsed}, '${type}')`)}
    >
      <div class="p-md whitespace-nowrap">响应式侧边栏</div>
    </Sider>
    <Layout>
      <Header class="rounded-tr-lg">缩放浏览器窗口查看效果</Header>
      <Content class="m-md p-md rounded-lg bg-surface">
        <p class="m-0 mb-xs text-on-surface-variant">回调记录（最新在前）：</p>
        <ul class="m-0 pl-lg font-mono text-sm" data-log>
          <For each={log()}>{line => <li>{line}</li>}</For>
        </ul>
      </Content>
    </Layout>
  </Layout>
}
