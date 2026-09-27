import { For, createSignal } from 'solid-js'
import Layout from 'upthrust-ui/source/Layout'

const { Header, Footer, Sider, Content } = Layout

const nav = [
  { icon: 'i-mdi-view-dashboard-outline', label: '仪表盘' },
  { icon: 'i-mdi-account-outline', label: '用户' },
  { icon: 'i-mdi-file-document-outline', label: '订单' },
  { icon: 'i-mdi-cog-outline', label: '设置' },
]

export default function Side() {
  const [collapsed, setCollapsed] = createSignal(false)
  return <Layout class="min-h-[360px] rounded-lg overflow-hidden" data-layout-side>
    {/* collapsible 渲染底部触发器；onCollapse 同步出状态，用来隐藏菜单文字。 */}
    <Sider collapsible onCollapse={value => setCollapsed(value)}>
      <div class="h-[32px] m-md rounded bg-inverse-on-surface/15" />
      <ul class="m-0 px-xs list-none">
        <For each={nav}>{(item, index) =>
          <li
            title={item.label}
            class={`h-[40px] my-xxs px-md flex items-center gap-sm rounded cursor-pointer ${index() === 0 ? 'bg-primary text-on-primary' : 'hover:bg-inverse-on-surface/10'}`}
          >
            <span class={`${item.icon} text-lg flex-none`} aria-hidden="true" />
            <span class="whitespace-nowrap" hidden={collapsed()}>{item.label}</span>
          </li>
        }</For>
      </ul>
    </Sider>
    <Layout>
      <Header>用户管理</Header>
      <Content class="m-md p-lg rounded-lg bg-surface">
        点击左下角的触发器收起侧边栏：宽度在 200px 与 80px 之间过渡，内容区随之伸缩。
      </Content>
      <Footer class="text-center">Upthrust UI ©2026</Footer>
    </Layout>
  </Layout>
}
