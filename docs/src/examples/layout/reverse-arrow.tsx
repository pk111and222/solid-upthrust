import Layout from 'upthrust-ui/source/Layout'

const { Header, Sider, Content } = Layout

export default function ReverseArrow() {
  return <div class="flex flex-col gap-md" data-layout-reverse-arrow>
    {/* 放在右侧的 Sider：reverseArrow 让箭头朝向正确（展开时指向右侧收起方向）。 */}
    <Layout class="min-h-[220px] rounded-lg overflow-hidden" data-case="right">
      <Layout>
        <Header>右侧边栏</Header>
        <Content class="p-lg">reverseArrow 翻转触发器箭头。</Content>
      </Layout>
      <Sider collapsible reverseArrow theme="light" class="border-l border-solid border-outline-variant">
        <div class="p-md whitespace-nowrap overflow-hidden">属性面板</div>
      </Sider>
    </Layout>

    {/* 零宽模式下 reverseArrow 让外挂的触发器改到 Sider 左侧。 */}
    <Layout class="min-h-[220px] rounded-lg" data-case="right-zero">
      <Content class="p-lg rounded-l-lg">点击右侧的标签收起 / 展开</Content>
      <Sider collapsible reverseArrow collapsedWidth={0} class="rounded-r-lg">
        <div class="p-md whitespace-nowrap">零宽右侧边栏</div>
      </Sider>
    </Layout>
  </div>
}
