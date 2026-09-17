import type { PageMeta } from '../../routing'
import { CodeBlock, Section } from '../../components/Content'
export const meta: PageMeta = { title: '架构与目录', description: '源码、演示、测试和文档分别维护，避免将交互逻辑耦合进站点。', group: '研发指南', order: 20 }
export default function Architecture() {
  return <>
    <CodeBlock language="text" code={'packages/competence/src/  # headless 行为与状态\npackages/components/lib/  # JSX、公共 props、样式\npackages/preset/src/      # UnoCSS token 与规则\npackages/testing/        # headless / smoke / render / browser / utils\nexample/src/pages/       # 开发演示\ndocs/src/pages/          # 文件路由、SSR 文档\ndocs/src/examples/       # 仅客户端执行的示例\ndocs/contributing/       # AI 工作流、测试规范、完成清单'} />
    <Section id="boundaries" title="依赖边界">
      <p>UI 消费 competence 的 createXxx 行为；competence 不得反向导入 UI。主题由 preset 负责，样式仍使用 UnoCSS。</p>
      <p>SSR 文档页面通过示例 ID 与原始源码引用示例，不执行组件示例模块。示例复用真实组件与同一套主题，避免另写一份展示实现。</p>
    </Section>
  </>
}
