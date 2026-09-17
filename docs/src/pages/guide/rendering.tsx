import type { PageMeta } from '../../routing'
import { Demo, Section } from '../../components/Content'
import buttonSource from '../../examples/system/button.tsx?raw'
export const meta: PageMeta = { title: '文档与示例渲染', description: '用真实 Button 验证服务端文档与客户端交互隔离。这是站点基础设施演示，不是 Button 的完整能力文档。', group: '开始使用', order: 15 }
export default function Rendering() {
  return <>
    <Section id="ssr" title="正文与源码由 SSR 提供">
      <p>禁用 JavaScript 或直接请求此页面的 HTML，仍能读到本段文字和下面的完整示例代码。站点不会在浏览器执行正文组件或 hydrate；菜单切换会取回下一页服务端 HTML，更新正文并重新挂载对应示例。</p>
    </Section>
    <Demo id="system/button" title="客户端 Button 示例" source={buttonSource} />
    <Section id="hosting" title="静态托管与刷新">
      <p>每个页面生成独立的目录与 index.html，内部链接和资源带有统一部署前缀。GitHub Pages 与 Vercel 静态托管均不需要 SPA 重写或常驻 SSR 服务。</p>
    </Section>
  </>
}
