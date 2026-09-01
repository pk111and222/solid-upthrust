import { type Component, createSignal, Show } from 'solid-js'
import { Card, CardGrid, CardMeta, Avatar, Button, Divider } from 'upthrust-ui'

const CardPage: Component = () => {
  const [activeTab, setActiveTab] = createSignal('tab1')
  const [loading, setLoading] = createSignal(true)

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Card 卡片</h2>
      <p class="text-on-surface-variant mb-6">
        通用卡片容器。纯展示物料（无 headless 对应）——所有区块都是无状态布局。
      </p>

      <h3 class="text-lg font-semibold mb-3">基本使用</h3>
      <div class="flex items-start gap-[16px]">
        <Card
          class="flex-1"
          title="默认卡片"
          extra={<a href="#" class="text-primary text-[14px] hover:text-primary/70">更多</a>}
        >
          <p class="text-[14px] text-on-surface">Card 的最简形态：title + extra + body。outline 变体带 1px 边线，无阴影。</p>
          <p class="text-[14px] text-on-surface mt-2">title 前的 3px 主色竖条是头部的视觉锚点。</p>
        </Card>
        <Card class="flex-1" title="无 border 卡片" variant="borderless">
          <p class="text-[14px] text-on-surface">borderless 变体：无边线，改用轻阴影（boxShadowTertiary）。</p>
        </Card>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">尺寸与内嵌卡片</h3>
      <div class="flex items-start gap-[16px]">
        <Card class="flex-1" title="small 卡片" size="small">
          <p class="text-[14px] text-on-surface">size=small：头高 38px、body padding 12px。</p>
        </Card>
        <Card class="flex-1" title="内嵌卡片">
          <div class="text-[14px] text-on-surface mb-3">外层卡片</div>
          <Card type="inner" title="内层卡片" extra={<a href="#" class="text-primary text-[14px]">操作</a>}>
            <p class="text-[14px] text-on-surface">type=inner：灰色头带 + 更紧凑的 body 内边距，用于嵌套。</p>
          </Card>
        </Card>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">封面图 + 操作列表</h3>
      <div class="flex items-start gap-[16px]">
        <Card
          class="w-[300px]"
          hoverable
          cover={
            <img
              alt="cover"
              class="block"
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150'%3E%3Crect width='300' height='150' fill='%231677ff' fill-opacity='0.12'/%3E%3Ctext x='150' y='82' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%231677ff'%3ECover 300×150%3C/text%3E%3C/svg%3E"
            />
          }
          actions={[
            <span class="i-mdi-star-outline text-[16px]" />,
            <span class="i-mdi-heart-outline text-[16px]" />,
            <span class="i-mdi-share-variant-outline text-[16px]" />,
          ]}
        >
          <CardMeta
            avatar={<Avatar>U</Avatar>}
            title="封面卡片标题"
            description="这是描述文字：cover 满幅铺在 body 上方并裁切顶部圆角，actions 等分底部一行。"
          />
        </Card>
        <Card
          class="w-[300px]"
          hoverable
          title="hoverable"
          cover={
            <div class="h-[150px] w-full bg-gradient-to-br from-primary/15 via-primary/8 to-primary/20 flex items-center justify-center text-primary text-[18px] font-medium">
              渐变 cover
            </div>
          }
          actions={[
            <span class="i-mdi-pencil-outline text-[16px]" />,
            <span class="i-mdi-delete-outline text-[16px]" />,
          ]}
        >
          <p class="text-[14px] text-on-surface">
            hover 悬浮：卡片上浮 2px + 标准阴影渐显，cover 图片同步轻微放大（1.03，纯 transform）。
          </p>
        </Card>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">加载中</h3>
      <div class="flex items-start gap-[16px]">
        <Card
          class="w-[300px]"
          title="加载中"
          loading={loading()}
          extra={<Button size="small" variant="text" onClick={() => setLoading(!loading())}>
            {loading() ? '显示内容' : '切回加载'}
          </Button>}
        >
          <p class="text-[14px] text-on-surface">真实内容。loading=true 时 body 被 Skeleton（active、4 行、无标题）替换。</p>
        </Card>
        <Card class="w-[300px]" loading>
          <p class="text-[14px] text-on-surface">loading 固定形态（无 title）。</p>
        </Card>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">内部页签</h3>
      <Card
        title="带 tabList 的卡片"
        tabList={[
          { key: 'tab1', label: '页签一' },
          { key: 'tab2', label: '页签二' },
          { key: 'tab3', label: '页签三' },
        ]}
        activeTabKey={activeTab()}
        onTabChange={setActiveTab}
        extra={<Button size="small" variant="text" onClick={() => setActiveTab('tab1')}>重置</Button>}
      >
        <Show when={activeTab() === 'tab1'} fallback={
          <Show when={activeTab() === 'tab2'} fallback={
            <p class="text-[14px] text-on-surface">标签页三的内容：activeTabKey 缺省时走 defaultActiveTabKey 非受控。</p>
          }>
            <p class="text-[14px] text-on-surface">标签页二的内容：受控 activeTabKey + onTabChange 驱动切换。</p>
          </Show>
        }>
          <p class="text-[14px] text-on-surface">标签页一的内容：Card 的 tabList 直接复用 Tabs 物料，head 的下边线由 tab 栏自身接管。</p>
        </Show>
      </Card>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">网格型内嵌卡片</h3>
      <Card title="Card.Grid 网格">
        <CardGrid class="text-[14px]">内容一</CardGrid>
        <CardGrid class="text-[14px]">内容二</CardGrid>
        <CardGrid class="text-[14px]">内容三</CardGrid>
        <CardGrid class="text-[14px]">内容四</CardGrid>
        <CardGrid class="text-[14px]" hoverable={false}>内容五（不悬浮）</CardGrid>
        <CardGrid class="text-[14px]">内容六</CardGrid>
      </Card>
      <p class="mt-2 text-sm text-on-surface-variant">
        网格单元格占 1/3 宽；边线用 box-shadow 描出（antd 同款技巧），hover 单元浮起。
      </p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">纯 body（无头卡片）</h3>
      <div class="flex items-start gap-[16px]">
        <Card class="flex-1">
          <p class="text-[14px] text-on-surface">没有 title/extra 时 head 整体不渲染，body 直接作为顶部圆角帽。</p>
        </Card>
        <Card class="flex-1" title="对齐：body 首块圆角">
          <p class="text-[14px] text-on-surface">有 head 时 body 只保留下圆角；两者顶帽规则自动切换。</p>
        </Card>
      </div>
    </div>
  )
}

export default CardPage
