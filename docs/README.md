# Solid Upthrust 文档站

一个基于当前 Solid 2 RC 与 Vite 的小型文档站，不依赖 SolidStart、服务端路由框架或第三方 UI 库。参考 Ant Design 的“指南 / 分类目录 / 正文 / 示例 / 源码”组织方式，不复制其文档内容，也不宣称 API 已完全对齐。

## 渲染与路由

```text
src/pages/**/*.tsx ──文件发现──> Solid SSR ──构建──> dist/<route>/index.html
        │                         │
        └── ?raw 示例源码 ────────┘（正文、导航、源码、样式链接都在 HTML 内）
src/examples/**/*.tsx ──按需分块──> 浏览器 render() ──> data-demo 挂载点
```

- 本地开发按请求 SSR；发布采用构建时 SSR（SSG）。GitHub Pages 只需提供静态文件，不运行 Node 服务。
- 文档正文不在客户端执行组件渲染或 hydrate；仅交互示例 CSR。客户端导航可替换服务端生成的正文 DOM。示例与组件库使用同一个 Solid RC、真实组件源码及 UnoCSS preset。
- 页面保留普通链接，各自生成 HTML。客户端增强同源文档导航：保留顶栏和侧栏，取回下一页 SSR HTML 后替换正文并重新挂载示例；前进后退由 history 管理。禁用 JS 时仍执行普通整页导航，深链接刷新无需 SPA fallback，404 保持真实状态。
- 文件系统决定路由：`src/pages/index.tsx` → `/`；`src/pages/guide/index.tsx` → `/guide/`；`src/pages/components/general/button.tsx` → `/components/general/button/`。
- “动态路由”指自动发现文件，不是 `[id]` 参数路由。所有地址都在构建时可枚举；文件名限小写 kebab-case，重复路由或不合法的 metadata 会使构建失败。
- 目前用 TSX 编写静态文档，未接入 Markdown/MDX 或搜索索引；源码采用轻量 TSX token 着色。代码以转义文本 SSR 输出，不能使用 `innerHTML` 注入源码。

## 目录

```text
docs/
├── contributing/           # AI 工作流、测试规范、功能完成清单和模板
├── src/
│   ├── pages/              # SSR 文档；导出 meta 和默认页面组件
│   │   ├── guide/          # 入门、架构、测试、交付和渲染说明
│   │   └── components/     # 分类总览；具体物料在回归时加入
│   ├── examples/           # CSR 示例；文件相对路径就是示例 ID
│   ├── components/         # 文档外壳、章节、代码块、示例占位
│   ├── routing.ts          # 文件路由与部署 base 校验
│   ├── entry-server.tsx    # renderToString，禁止执行 CSR 示例
│   ├── entry-client.ts     # 只加载当前页引用的示例
│   └── islands.ts          # 独立挂载、失败提示、销毁
├── plugins/ssr.ts          # 开发环境 HTTP 适配
├── scripts/build.mjs       # 双端构建 + 逐页 HTML + 404 + 可选 sitemap
├── scripts/preview.mjs     # 无 SPA fallback 的静态预览服务
├── unocss.config.mjs       # 直接使用 preset 源码，避免过期 dist
└── vite.config.ts
```

`docs` 是私有 workspace，不发布到 npm。`dist/`、`.ssr/` 是构建产物，不提交、不手改。新测试仍放在 `packages/testing`，不要在 docs 新建测试目录。

## 本地命令

环境以锁文件为准，目前验证的组合为 Node 22.22、pnpm 11.16；Vite 8 要求的 Node 版本不能沿用旧 README 中的 Node 14/18。

```bash
pnpm install --frozen-lockfile
pnpm run dev:docs          # http://127.0.0.1:5657/
pnpm run typecheck:docs
pnpm run build:docs
pnpm run preview:docs      # http://127.0.0.1:4173/，按产物内记录的 base 提供服务
pnpm run test:docs         # 文件路由 / 客户端挂载单元契约

# 一次安装浏览器，再做真实静态部署验证
pnpm --dir packages/testing exec playwright install chromium
pnpm run test:docs:browser # 顺序构建并验证 / 与 /solid-upthrust/ 两种部署
```

本地已安装 Chrome 时可通过 `DOCS_CHROMIUM_PATH` 指定可执行文件，避免下载；CI 使用 Playwright Chromium。浏览器测试会重建文档产物，结束时最后一个产物的 base 为 `/solid-upthrust/`；需要根路径产物时重新执行 `pnpm run build:docs`。

`test:docs:browser` 先检查浏览器用例类型，再执行双路径验收；还会单独启动开发服务，回归页面新增/编辑/删除时的路由缓存刷新，以及带 base 的示例加载。

`typecheck:docs` 检查站点 TS/TSX、路由和开发适配器；UnoCSS 配置是构建加载的 JS 配置。preset 源码及组件库自身继续由根级 `pnpm run typecheck` 检查，不能用 docs 类型检查代替全库质量检查。

## 编写页面与示例

页面同时导出 `meta: PageMeta`（标题、描述、分组、排序）和默认组件。菜单根据已发现页面自动生成，不必另改路由注册表。

```tsx
// src/pages/components/general/button.tsx
import type { PageMeta } from '../../../routing'
import { Demo, Section } from '../../../components/Content'
import source from '../../../examples/button/basic.tsx?raw'

export const meta: PageMeta = {
  title: 'Button 按钮', description: '只说明已经实现并核实的能力。',
  group: '组件', order: 110,
}
export default function ButtonPage() {
  return <>
    <Section id="usage" title="使用方式"><p>这里补充约定和边界。</p></Section>
    <Demo id="button/basic" title="基本使用" source={source} />
  </>
}
```

对应实现放在 `src/examples/button/basic.tsx`，默认导出 Solid 组件，导入真实组件（如 `upthrust-ui/source/Button`）。`Demo` 的 ID 不带 `.tsx`；构建会校验引用是否存在。源码展示从同一示例文件 `?raw` 读取，不维护第二份字符串代码。

SSR 页面不能直接 import 并执行示例，不能在模块顶层访问 `window`、`document` 或浏览器 API。SSR 文档 helper 使用 `DocLink` 生成带部署前缀的内部链接。当前不支持来自用户输入的可执行文档；所有页面均是仓库中受审查的源码。

## GitHub Pages：首选静态部署

```bash
DOCS_BASE=/solid-upthrust/ \
DOCS_SITE_URL=https://YOUR-ORG.github.io \
pnpm run build:docs
pnpm run preview:docs
```

- `DOCS_BASE` 仅填路径并以 `/` 结尾；仓库站点通常为 `/<repo>/`，组织首页或自定义域名为 `/`。构建时确定，不能部署后只改配置而不重建。
- `DOCS_SITE_URL` 可选，仅填 origin；设置后生成 canonical 与 `sitemap.xml`。不设置就不编造线上域名，也不生成假的站点地图。
- 上传 `docs/dist` 整个目录（包含 `.nojekyll`、`404.html` 与 assets），不是上传 `.ssr`。
- 仓库已提供 `.github/workflows/docs-pages.yml`：在 Settings → Pages 选择 GitHub Actions 后手动运行。工作流会先检查文档、运行静态站点浏览器测试，再根据 Pages 返回的真实 base 重建并部署。
- 本次仅添加工作流文件，没有修改远端仓库设置、触发部署或创建站点。

## Vercel：可使用同一份静态产物

无需因部署平台更换渲染架构。在 Vercel 配置：Root Directory 选仓库根；Framework Preset 选 Other；Build Command 为 `pnpm run build:docs`；Output Directory 为 `docs/dist`；Node 22；环境变量 `DOCS_BASE=/`，按绑定域名设置 `DOCS_SITE_URL`。

可参考 `docs/vercel.example.json`，确认项目设置后再复制为根目录 `vercel.json`。不要添加全站 SPA rewrite；深层页面已经有自己的 HTML。如果未来需要登录态、实时数据或按请求生成的文档，再单独设计 Vercel SSR 适配器，这不是当前静态站点的能力。

## 当前边界

当前有首页、开发指南、架构、测试、交付清单、渲染验证和组件分类总览。公开组件页包含 ConfigProvider、Icon、Button 与 Skeleton 的独立示例；Button 已补全 12 个独立演示、API 和四层回归。system/button 计数示例继续用于验证 SSR/CSR 基础设施。组件 API、主题说明、完整示例和视觉快照将随每项功能回归补充。

## 页面设计与组件自举

文档采用全宽 Layout/Header/Content/Footer 框架。左侧使用库内 Menu；标签通过
`MenuProps.renderLabel?: (item: MenuItem) => JSX.Element` 渲染原生链接，因此禁用 JS
时仍能导航。选中状态由路由决定。API 使用真实 Table，关闭分页和交互功能，
表格数据与正文一同 SSR；客户端不二次挂载整页。

- 桌面固定顶栏与侧栏，宽屏显示页内目录；手机将菜单收进可展开目录。
- 每个演示独立存放于 `src/examples/<component>/<capability>.tsx`，使用单独 `Demo`
  引用和 `?raw` 源码。一个文件只讲一种用法，不把整个组件演示页塞进代码区。
- `DemoGrid` 在桌面使用双列，手机单列。每个 Demo 有自己的标题、说明、展开代码
  与复制按钮。源码在初始 HTML 中，使用转义的 TSX 文本 token 着色。
- API 数据交给 `ApiTable`（底层 Table）显示，不另手写不同风格的表格。
- `_VirtualList` 等内部组件只保留在 `example` 和测试中，不生成公开文档路由、菜单
  或 docs 示例 chunk；原内部文档地址返回 404。

Menu 的 `renderLabel` 只影响 UI 标签，不改变 headless 字符串 label 的数据契约；
分组、子菜单与普通项均可使用。不传时仍显示原 label。文档中静态表格和导航会执行
SSR 安全的库组件，交互示例仍禁止在服务端执行。

ConfigProvider 的 `wrapper={false}` 可在只配置默认属性时移除额外 div。该分支不接受
`theme/class/style`，弹层沿用外层作用域，没有外层时使用 body。主题仍需已有 DOM
承载 CSS 变量；需要局部主题时保留默认 wrapper，或把变量放在已有祖先元素上。
不要运行中切换 wrapper，否则会重建子树。

### UnoCSS 选择器合并

docs、example 与组件构建均设置 `mergeSelectors: false`。扫描全部组件源码时，
ColorPicker 的 `::-moz-range-thumb` / `::-webkit-slider-thumb` 规则可能与普通
`.border` 等工具类合并；不支持其中某个伪元素的浏览器会丢弃整个选择器列表，
造成开发模式下按钮边框为 0px。保持独立规则可以避免这个问题。
