import type { PageMeta } from '../routing'
import { DocLink, Section } from '../components/Content'
export const meta: PageMeta = { title:'Solid Upthrust',description:'面向 SolidJS 2 的企业级组件库，提供独立的行为逻辑、界面组件与主题系统。',group:'开始使用',order:0 }
export default function Home() {
  return <>
    <div class="flex flex-wrap gap-4 border-b border-slate-200 pb-10 text-sm font-medium">
      <DocLink href="/components/">浏览组件 →</DocLink><DocLink href="/guide/">快速开始 →</DocLink>
    </div>
    <Section id="start" title="开始构建">
      <p>先完成环境与样式配置，再从组件文档中选择需要的用法。每个示例都提供独立、可复制的源码。</p>
      <p><DocLink href="/guide/">工程入门</DocLink> · <DocLink href="/guide/architecture/">分层架构</DocLink> · <DocLink href="/guide/testing/">测试规范</DocLink></p>
    </Section>
    <Section id="status" title="版本状态"><p>当前基于 Solid 2 RC，组件文档随功能回归逐步补充。正式发布以 Solid 2 正式版及项目质量检查为前提。</p></Section>
  </>
}
