import type { PageMeta } from '../../routing'
import { DocLink, Section } from '../../components/Content'
export const meta: PageMeta = { title:'组件总览', description:'选择一个组件，查看使用方式、独立演示与 API。', group:'组件', order:100 }
export default function Components() {
  return <><Section id="general" title="通用">
    <div class="divide-y divide-slate-100">
<div class="py-5"><DocLink href="/components/general/button/">Button 按钮 →</DocLink><p>触发操作、提交表单或访问链接。</p></div>
      <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/general/config-provider/">ConfigProvider 全局配置 →</DocLink></div><p class="m-0 text-slate-500">统一控件默认属性，管理局部主题。</p></div>
      <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/general/icon/">Icon 图标 →</DocLink></div><p class="m-0 text-slate-500">使用预设尺寸、语义颜色与动画展示图标。</p></div>
    </div>
  </Section>
  <Section id="navigation" title="导航">
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/navigation/dropdown/">Dropdown 下拉菜单 →</DocLink></div><p class="m-0 text-slate-500">悬停、点击或右键触发的操作菜单。</p></div>
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/navigation/tabs/">Tabs 标签页 →</DocLink></div><p class="m-0 text-slate-500">线条式带滑动指示条，卡片式造型，支持可编辑与拖拽排序。</p></div>
  </Section>
  <Section id="feedback" title="反馈"><DocLink href="/components/feedback/skeleton/">Skeleton 骨架屏 →</DocLink><p>结构占位、加载切换与独立子组件。</p></Section>
  <Section id="data-display" title="数据展示">
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/data-display/tooltip/">Tooltip 文字提示 →</DocLink></div><p class="m-0 text-slate-500">简单的文字提示气泡，默认悬停触发。</p></div>
    <div class="py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12"><div class="w-64 font-medium"><DocLink href="/components/data-display/popover/">Popover 气泡卡片 →</DocLink></div><p class="m-0 text-slate-500">可承载标题与任意内容（含交互控件）的浮出卡片。</p></div>
  </Section></>
}
