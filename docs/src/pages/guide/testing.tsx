import type { PageMeta } from '../../routing'
import { CodeBlock, Section } from '../../components/Content'
export const meta: PageMeta = { title: '四层测试', description: '测试集中在 packages/testing；每项能力按风险选择适用层，而不是机械复制四份断言。', group: '研发指南', order: 30 }
export default function Testing() {
  return <>
    <Section id="layers" title="测试边界">
      <ol class="list-decimal space-y-3 pl-6">
        <li>L1 headless：建立 Solid owner，验证状态迁移、受控回调、异步与销毁。</li>
        <li>L2 smoke：验证公开导入、合法配置、挂载、更新、实例引用和卸载。</li>
        <li>L3 render：在模拟 DOM 中断言文本、属性、ARIA、条件节点和回调；不比较 JSX 对象。</li>
        <li>L4 browser：在真实浏览器确认布局、样式、焦点、滚动及指针/键盘交互。</li>
      </ol>
    </Section>
    <Section id="organization" title="按物料与模块组织">
      <p>四层统一使用“层 / 物料名 / 能力模块”：例如 headless/Form/field.test.ts、render/Form/validation.test.tsx（后者为命名示意，不代表已有覆盖）。同一物料在各层保持同名，后续按能力拆分复杂用例。</p>
      <p>跨物料的生产逻辑位于 headless/shared，主题与文档站分别独立分组；测试辅助函数和夹具统一放 utils，测试文件不相互导入。</p>
    </Section>
    <Section id="commands" title="现有检查">
      <CodeBlock language="bash" code={'pnpm test\npnpm run test:headless\npnpm run test:render\npnpm run typecheck:docs\npnpm run build:docs'} />
      <p>测试文件存在不代表能力验证完成；空集合、跳过、未执行和基线失败必须明确记录。完整编写规则见仓库 docs/contributing/testing.md。</p>
    </Section>
  </>
}
