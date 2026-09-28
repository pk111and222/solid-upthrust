import Layout from 'upthrust-ui/source/Layout'
import Menu from 'upthrust-ui/source/Menu'

const { Header, Footer, Sider, Content } = Layout

const nav = [
  { key: 'dashboard', icon: 'i-mdi-view-dashboard-outline', label: '仪表盘' },
  { key: 'user', icon: 'i-mdi-account-outline', label: '用户' },
  { key: 'order', icon: 'i-mdi-file-document-outline', label: '订单' },
  { key: 'setting', icon: 'i-mdi-cog-outline', label: '设置', children: [
    { key: 'profile', label: '个人资料' },
    { key: 'security', label: '安全' },
  ] },
]

export default function Side() {
  return <Layout class="min-h-[360px] rounded-lg overflow-hidden" data-layout-side>
    {/* Sider 通过 SiderContext 把收起状态传给 Menu：收起后自动切成图标模式并显示悬浮提示。 */}
    <Sider collapsible>
      <div class="h-[32px] m-md rounded bg-inverse-on-surface/15" />
      <Menu theme="dark" mode="inline" defaultSelectedKeys={['dashboard']} items={nav} />
    </Sider>
    <Layout>
      <Header>用户管理</Header>
      <Content class="m-md p-lg rounded-lg bg-surface">
        点击左下角的触发器收起侧边栏：宽度在 200px 与 80px 之间过渡，菜单随之切换为图标模式。
      </Content>
      <Footer class="text-center">Upthrust UI ©2026</Footer>
    </Layout>
  </Layout>
}
