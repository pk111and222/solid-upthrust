import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Layout from 'upthrust-ui/source/Layout'

const { Header, Sider, Content } = Layout

export default function CustomTrigger() {
  const [collapsed, setCollapsed] = createSignal(false)
  return <div class="flex flex-col gap-md" data-layout-custom-trigger>
    <Layout class="min-h-[240px] rounded-lg overflow-hidden" data-case="header-button">
      {/* trigger={null} 隐藏默认触发器，由受控 collapsed 与顶栏按钮驱动。 */}
      <Sider trigger={null} collapsible collapsed={collapsed()}>
        <div class="p-md whitespace-nowrap overflow-hidden">{collapsed() ? '菜单' : '侧边导航菜单'}</div>
      </Sider>
      <Layout>
        <Header class="px-md gap-sm">
          <Button
            type="text" aria-label={collapsed() ? '展开侧边栏' : '收起侧边栏'} data-toggle
            onClick={() => setCollapsed(!collapsed())}
          >
            <span class={`${collapsed() ? 'i-mdi-menu-open rotate-180' : 'i-mdi-menu-open'} text-xl`} aria-hidden="true" />
          </Button>
          <span>控制台</span>
        </Header>
        <Content class="m-md p-lg rounded-lg bg-surface">当前状态：{collapsed() ? '已收起' : '已展开'}</Content>
      </Layout>
    </Layout>

    <Layout class="min-h-[200px] rounded-lg overflow-hidden" data-case="custom-content">
      {/* 传入 JSX 替换触发器内容，点击与键盘切换仍由 Sider 负责。 */}
      <Sider collapsible theme="light" trigger={<span class="text-sm">收起 / 展开</span>} class="border-r border-solid border-outline-variant">
        <div class="p-md whitespace-nowrap overflow-hidden">浅色侧边栏</div>
      </Sider>
      <Content class="p-lg">自定义触发器内容</Content>
    </Layout>
  </div>
}
