import type { PageMeta } from '../../routing'
import { Section } from '../../components/Content'
export const meta: PageMeta = { title: '功能交付清单', description: '每次新增、修复或补全功能，都同步交付行为契约、示例、适用测试与文档。', group: '研发指南', order: 40 }
export default function Contributing() {
  return <Section id="done" title="何时可以称为完成">
    <ul class="list-disc space-y-3 pl-6">
      <li>定义能力 ID、支持范围、默认值、受控语义、事件时序和边界条件。</li>
      <li>实现源码、公共类型与导出；UI 和 headless 保持单向依赖。</li>
      <li>更新 example 的演示，并在 docs 提供说明、客户端示例和直接引用的源码。</li>
      <li>补充适用的四层回归；不适用的层写明原因，未验证的层不得标记完成。</li>
      <li>运行针对性测试、全量回归及相关构建；交接时列明遗留失败、风险和执行命令。</li>
    </ul>
    <p>AI 会话先读取根目录 AGENTS.md，再按 docs/contributing/ai-workflow.md 执行。详细清单和模板也维护在 docs/contributing/ 中。</p>
  </Section>
}
