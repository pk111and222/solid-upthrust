import { For } from 'solid-js'
import Layout from 'upthrust-ui/source/Layout'

const { Header, Footer, Sider, Content } = Layout

const topNav = ['工作台', '订单', '客户', '报表']
const sideNav = ['用户列表', '角色权限', '部门管理', '操作日志']

export default function TopSide() {
  return <Layout class="rounded-lg overflow-hidden border border-solid border-outline-variant" data-layout-top-side>
    <Header class="gap-lg">
      <div class="i-mdi-hexagon-slice-6 text-2xl text-primary flex-none" aria-hidden="true" />
      <nav class="flex gap-md min-w-0 overflow-x-auto">
        <For each={topNav}>{(item, index) =>
          <a href="#" class={`whitespace-nowrap no-underline ${index() === 0 ? 'text-primary font-medium' : 'text-on-surface'}`}>{item}</a>
        }</For>
      </nav>
    </Header>
    <Content class="px-lg">
      <p class="my-md text-on-surface-variant">首页 / 系统设置 / 用户列表</p>
      <Layout class="mb-lg rounded-lg overflow-hidden bg-surface" data-case="inner">
        <Sider theme="light" width={180} class="border-r border-solid border-outline-variant">
          <ul class="m-0 p-xs list-none">
            <For each={sideNav}>{(item, index) =>
              <li class={`h-[40px] px-md flex items-center rounded cursor-pointer ${index() === 0 ? 'bg-primary/10 text-primary' : 'hover:bg-on-surface/6'}`}>{item}</li>
            }</For>
          </ul>
        </Sider>
        <Content class="p-lg min-h-[200px] bg-surface">内容区</Content>
      </Layout>
    </Content>
    <Footer class="text-center">Upthrust UI ©2026</Footer>
  </Layout>
}
