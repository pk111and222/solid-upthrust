import Layout from 'upthrust-ui/source/Layout'

const { Sider, Content } = Layout

const columns = Array.from({ length: 12 }, (_, index) => `字段 ${index + 1}`)

export default function Overflow() {
  // 横向布局里，直接子级的 Content / Layout 宽度先归零再由 flex 撑开：
  // 超宽表格只会在内容区内部滚动，不会把 Sider 挤窄或撑破外层容器。
  return <Layout class="rounded-lg overflow-hidden border border-solid border-outline-variant" data-layout-overflow>
    <Sider theme="light" width={160} class="border-r border-solid border-outline-variant">
      <div class="p-md">160px 侧边栏</div>
    </Sider>
    <Content class="p-md bg-surface">
      <div class="overflow-x-auto" data-scroll>
        <table class="border-collapse text-sm">
          <thead><tr>{columns.map(name => <th class="px-md py-xs whitespace-nowrap text-left border-b border-solid border-outline-variant">{name}</th>)}</tr></thead>
          <tbody><tr>{columns.map(name => <td class="px-md py-xs whitespace-nowrap">{name} 的一段较长的内容</td>)}</tr></tbody>
        </table>
      </div>
    </Content>
  </Layout>
}
