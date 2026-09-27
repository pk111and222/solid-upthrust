import type { PageMeta } from '../../routing'
import { DocLink, Section } from '../../components/Content'
export const meta: PageMeta = { title:'组件总览', description:'选择一个组件，查看使用方式、独立演示与 API。', group:'组件', order:100 }
export default function Components() {
  return <><Section id="general" title="通用">
    <div class="divide-y divide-slate-100">
      <div class="py-5"><DocLink href="/components/general/typography/">Typography 排版 →</DocLink><p>标题、文本、段落、链接和文本操作。</p></div>
<div class="py-5"><DocLink href="/components/general/button/">Button 按钮 →</DocLink><p>触发操作、提交表单或访问链接。</p></div>
      <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/general/config-provider/">ConfigProvider 全局配置 →</DocLink></div><p class="m-0 text-slate-500">统一控件默认属性，管理局部主题。</p></div>
      <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/general/icon/">Icon 图标 →</DocLink></div><p class="m-0 text-slate-500">使用预设尺寸、语义颜色与动画展示图标。</p></div>
    </div>
  </Section>
  <Section id="layout" title="布局">
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/layout/flex/">Flex 弹性布局 →</DocLink></div><p class="m-0 text-slate-500">设置子元素的排列方向、对齐方式、换行与间距。</p></div>
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/layout/grid/">Grid 栅格 →</DocLink></div><p class="m-0 text-slate-500">24 栅格分栏，支持间距、偏移、排序与 7 档响应式断点。</p></div>
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/layout/space/">Space 间距 →</DocLink></div><p class="m-0 text-slate-500">为行内组件设置统一间距、分隔符与紧凑组合。</p></div>
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/layout/divider/">Divider 分割线 →</DocLink></div><p class="m-0 text-slate-500">区隔段落或行内内容，支持标题、线型与垂直方向。</p></div>
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/layout/layout/">Layout 布局 →</DocLink></div><p class="m-0 text-slate-500">页面整体布局，含可收起、响应式的侧边栏。</p></div>
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/layout/splitter/">Splitter 分隔面板 →</DocLink></div><p class="m-0 text-slate-500">拖拽、键盘或一键折叠调整相邻面板尺寸。</p></div>
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/layout/masonry/">Masonry 瀑布流 →</DocLink></div><p class="m-0 text-slate-500">不等高内容放入最短列，列数与间距可响应式。</p></div>
  </Section>
  <Section id="navigation" title="导航">
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/navigation/dropdown/">Dropdown 下拉菜单 →</DocLink></div><p class="m-0 text-slate-500">悬停、点击或右键触发的操作菜单。</p></div>
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/navigation/tabs/">Tabs 标签页 →</DocLink></div><p class="m-0 text-slate-500">线条式带滑动指示条，卡片式造型，支持可编辑与拖拽排序。</p></div>
  </Section>
  <Section id="feedback" title="反馈"><DocLink href="/components/feedback/skeleton/">Skeleton 骨架屏 →</DocLink><p>结构占位、加载切换与独立子组件。</p><DocLink href="/components/feedback/progress/">Progress 进度条 →</DocLink><p>线形、圆形、仪表盘、步骤与分段进度，渐变色与数值位置。</p><DocLink href="/components/feedback/result/">Result 结果 →</DocLink><p>成功 / 信息 / 警告 / 错误与 403 / 404 / 500 异常插画，操作区与补充内容。</p><DocLink href="/components/feedback/alert/">Alert 警告提示 →</DocLink><p>四种类型、辅助描述、顶部公告、可关闭与平滑卸载、ErrorBoundary。</p><DocLink href="/components/feedback/watermark/">Watermark 水印 →</DocLink><p>文字 / 多行 / 图片水印、防篡改恢复、弹层传导。</p></Section>
  <Section id="data-display" title="数据展示">
    <div class="py-5"><DocLink href="/components/data-display/avatar/">Avatar 头像 →</DocLink><p>图片、图标、字符与头像组。</p></div>
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/data-display/badge/">Badge 徽标数 →</DocLink></div><p class="m-0 text-slate-500">数字、小红点、状态点与缎带。</p></div>
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/data-display/tag/">Tag 标签 →</DocLink></div><p class="m-0 text-slate-500">预设色板、三种变体、可关闭与可选择标签组。</p></div>
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/data-display/empty/">Empty 空状态 →</DocLink></div><p class="m-0 text-slate-500">默认与简洁插画、自定义图片、描述与底部操作。</p></div>
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/data-display/statistic/">Statistic 统计数值 →</DocLink></div><p class="m-0 text-slate-500">千分位与精度格式化、前后缀、骨架屏与倒计时 / 正计时。</p></div>
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/data-display/timeline/">Timeline 时间轴 →</DocLink></div><p class="m-0 text-slate-500">纵向 / 横向、交替与另一侧布局、标题占比与加载节点。</p></div>
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/data-display/qr-code/">QRCode 二维码 →</DocLink></div><p class="m-0 text-slate-500">canvas / svg 渲染、Logo 挖空、状态遮罩与自定义状态渲染。</p></div>
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/data-display/tooltip/">Tooltip 文字提示 →</DocLink></div><p class="m-0 text-slate-500">简单的文字提示气泡，默认悬停触发。</p></div>
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/data-display/popover/">Popover 气泡卡片 →</DocLink></div><p class="m-0 text-slate-500">可承载标题与任意内容（含交互控件）的浮出卡片。</p></div>
  </Section></>
}
