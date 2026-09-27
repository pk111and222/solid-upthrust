import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import api from './layout-api.json'
import basic from '../../../examples/layout/basic.tsx?raw'
import topSide from '../../../examples/layout/top-side.tsx?raw'
import side from '../../../examples/layout/side.tsx?raw'
import customTrigger from '../../../examples/layout/custom-trigger.tsx?raw'
import responsive from '../../../examples/layout/responsive.tsx?raw'
import fixedHeader from '../../../examples/layout/fixed-header.tsx?raw'
import fixedSider from '../../../examples/layout/fixed-sider.tsx?raw'
import theme from '../../../examples/layout/theme.tsx?raw'
import reverseArrow from '../../../examples/layout/reverse-arrow.tsx?raw'
import overflow from '../../../examples/layout/overflow.tsx?raw'

export const meta: PageMeta = { title: 'Layout 布局', description: '页面整体布局：Header、Sider、Content、Footer 与可收起、响应式的侧边栏。', group: '组件', order: 124 }

const usage = `import Layout from 'upthrust-ui/source/Layout'
// 或从包入口导入：import { Layout, Header, Sider, Content, Footer, type SiderProps } from 'upthrust-ui'

const { Header, Sider, Content, Footer } = Layout

<Layout class="min-h-screen">
  <Sider collapsible breakpoint="lg">…</Sider>
  <Layout>
    <Header>…</Header>
    <Content>…</Content>
    <Footer>…</Footer>
  </Layout>
</Layout>`

export default function Page() {
  return <>
    <Section id="usage" title="使用方式">
      <p>协助进行页面级整体布局。Layout 是布局容器，内部可以嵌套 Header、Sider、Content、Footer 或 Layout 本身，可以放在任何父容器中。</p>
      <ul>
        <li><code>Header</code>：顶部布局，自带默认样式；其下可嵌套任何元素，只能放在 Layout 中。</li>
        <li><code>Sider</code>：侧边栏，自带默认样式及基本功能；其下可嵌套任何元素，只能放在 Layout 中。</li>
        <li><code>Content</code>：内容部分，自带默认样式；其下可嵌套任何元素，只能放在 Layout 中。</li>
        <li><code>Footer</code>：底部布局，自带默认样式；其下可嵌套任何元素，只能放在 Layout 中。</li>
      </ul>
      <p>布局基于 flexbox：Layout 默认纵向排列，内部有 Sider 时自动切为横向。常见的顶部-侧边、侧边-顶部等结构通过嵌套 Layout 组合得到。</p>
      <CodeBlock code={usage} />
    </Section>
    <Section id="examples" title="代码演示">
      <DemoGrid>
        <Demo id="layout/basic" title="基本结构" description="典型的四种页面结构；区域着色仅用于展示结构。Sider 的 width 支持百分比等 CSS 长度。" source={basic} />
        <Demo id="layout/top-side" title="顶部-侧边布局" description="顶部导航 + 内容区内的浅色侧边菜单，常用于二级导航较多的系统。" source={topSide} />
        <Demo id="layout/side" title="侧边布局" description="collapsible 在 Sider 底部渲染触发器，点击在 200px 与 80px 之间切换；onCollapse 可同步出收起状态。" source={side} />
        <Demo id="layout/custom-trigger" title="自定义触发器" description="trigger={null} 隐藏默认触发器，由受控 collapsed 与顶栏按钮驱动；也可以传 JSX 只替换触发器内容。" source={customTrigger} />
        <Demo id="layout/responsive" title="响应式布局" description="breakpoint 触发响应式收起；collapsedWidth={0} 时收起后完全隐藏，出现挂在外沿的零宽触发器。回调记录展示 onBreakpoint 与 onCollapse 的顺序。" source={responsive} />
        <Demo id="layout/fixed-header" title="固定头部" description="Header 加 sticky top-0 即可固定在滚动容器（或页面）顶部。" source={fixedHeader} />
        <Demo id="layout/fixed-sider" title="固定侧边栏" description="定高布局中 Sider 与内容区各自滚动；菜单超出时底部触发器始终可见，且不会遮挡最后一项。" source={fixedSider} />
        <Demo id="layout/theme" title="主题" description="theme 切换 Sider 与触发器的深色 / 浅色配色。" source={theme} />
        <Demo id="layout/reverse-arrow" title="右侧边栏" description="放在右侧的 Sider 用 reverseArrow 翻转箭头；零宽模式下触发器改挂到左侧。" source={reverseArrow} />
        <Demo id="layout/overflow" title="内容溢出" description="横向布局中内容区宽度先归零再撑开，超宽表格只在内容区内部滚动，Sider 宽度不受影响。" source={overflow} />
      </DemoGrid>
    </Section>
    <Section id="api" title="API">
      <h3>Layout</h3>
      <ApiTable rows={api.layout} />
      <h3>Header / Content / Footer</h3>
      <ApiTable rows={api.regions} />
      <h3>Layout.Sider</h3>
      <ApiTable rows={api.sider} />
      <p>类型导出：<code>LayoutProps</code>、<code>HeaderProps</code>、<code>ContentProps</code>、<code>FooterProps</code>、<code>SiderProps</code>、<code>SiderTheme</code>、<code>SiderBreakpoint</code>、<code>SiderCollapseType</code>、<code>SiderSemanticName</code>。Headless 状态机 <code>createSider</code> 及 <code>SIDER_BREAKPOINT_MAX_WIDTHS</code>、<code>siderBreakpointQuery</code> 由 <code>upthrust-competence</code> 导出，可用于自建侧栏。</p>
    </Section>
    <Section id="contracts" title="注意事项">
      <p><strong>标签与标记类：</strong>Layout 渲染 div，Header / Content / Footer / Sider 分别渲染 header / main / footer / aside，并带 upthrust-layout、upthrust-layout-header 等标记类，方便写选择器。一个页面通常只应有一个 main：嵌套多个 Content 时请留意语义。</p>
      <p><strong>hasSider 自动判断：</strong>Sider 挂载时向最近的 Layout 注册，卸载时注销，所以条件渲染的 Sider 也能正确切换方向；注册只影响最近一层 Layout。SSR 首屏 Sider 尚未注册，需要横向时请显式传 hasSider。</p>
      <p><strong>断点：</strong>xs…xxl 的阈值为 BREAKPOINTS − 0.02px（与 antd 一致，例如 lg 为 max-width: 991.98px）；xxxl 取 1919.98px，与本库 Grid 的 xxxl（≥1920）对齐，而 antd Sider 为 1839.98px。设置 breakpoint 后，挂载时的断点结果覆盖 defaultCollapsed（与 antd 一致）；清空 breakpoint 时 broken 复位，但保留当前收起状态。</p>
      <p><strong>触发器：</strong>collapsible 时总是渲染；非 collapsible 时仅在 collapsedWidth 为 0 且低于断点时渲染零宽触发器（与 antd 同条件）。触发器是 role="button" 的可聚焦元素，支持 Enter / 空格切换，aria-expanded 反映展开状态。</p>
      <p><strong>与 antd 的差异：</strong>底部触发器用 sticky 贴底并占据文档流中的 48px，而不是 antd 的 position: fixed——嵌在卡片或弹窗里的布局不会跑出容器，也不会遮挡菜单最后一项。Header 保持浅色（antd 默认 #001529 深色、行高 64px），需要深色顶栏时用 class 覆盖。零宽模式收起后内容设为 inert，键盘无法再聚焦到隐藏的菜单。</p>
      <p><strong>暂不支持：</strong>RTL 方向；向 Menu 注入 inlineCollapsed 的 SiderContext（Menu 尚无 inline 收起模式，收起后请自行隐藏菜单文字，参见“侧边布局”示例）；ConfigProvider 的 layout 全局配置。</p>
    </Section>
  </>
}
