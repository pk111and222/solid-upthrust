import type { PageMeta } from '../../routing'
import { CodeBlock, DocLink, Section } from '../../components/Content'
export const meta: PageMeta = { title: '工程入门', description: '在本仓库运行文档、示例和集中测试。组件正式安装指南将在发布前完善。', group: '开始使用', order: 10 }
export default function Guide() {
  return <>
    <Section id="local" title="本地运行">
      <p>使用 Node 22.12+ 和仓库对应的 pnpm 版本。依赖以锁文件为准，勿在功能开发时顺便升级 Solid RC。</p>
      <CodeBlock language="bash" code={'pnpm install --frozen-lockfile\npnpm run dev:docs\n# 另一个终端\npnpm test'} />
    </Section>
    <Section id="next" title="继续阅读">
      <p><DocLink href="/guide/architecture/">架构与目录</DocLink>、<DocLink href="/guide/testing/">四层测试</DocLink>、<DocLink href="/guide/contributing/">功能交付清单</DocLink>。</p>
    </Section>
  </>
}
