# C10 Anchor / Affix

状态：已验收（2026-09-28；下述支持范围与 Chromium 环境）。本文件同时承载 C10 Breadcrumb / Steps / Anchor / Affix 这一轮的统一验证记录。

## 契约与修复

对照 [Ant Design Anchor](https://ant.design/components/anchor-cn/) / [Affix](https://ant.design/components/affix-cn/) 公开示例与 antd 6 源码 `anchor/{Anchor,AnchorLink}`、`affix/{index,utils}`，不宣称全 API 兼容。

### Anchor

- **competence/anchor**：
  - 默认滚动容器改为 window（修复前监听 documentElement，页面滚动事件永远不触发，scroll-spy 失效）。
  - 点击滚动期间抑制 scroll-spy，直到滚动静默 `ANCHOR_SCROLL_SETTLE`（120ms）才恢复；修复前只抑制一帧，平滑滚动途经的区块会闪烁高亮。
  - 新增 `anchorTargetId`（href → id，支持 `#` 前缀与完整 URL）、`setTimeout` / `clearTimeout` 注入（测试用）。
  - `getCurrentAnchor(activeLink)` 接收 scroll-spy 计算出的当前值。
- **UI**：
  - 结构改为嵌套 div，子链接在父链接内缩进 16px；修复前嵌套层级错乱。
  - 左侧 2px 轨道 + 2px ink，ink 与激活标题同高；修复前链接自带左边框，与 ink 形成双重指示条。
  - 点击写入地址栏 hash：默认 `pushState`，`replace` 时 `replaceState`；`onClick` 中 `preventDefault` 则不写。
- **新增 API**：`affix`（默认 true，内部使用 Affix）、`offsetTop`、`getContainer`（`getScrollContainer` 保留为别名）、`onClick(e, { title, href })`、`replace`、`showInkInFixed`、`ref`；链接支持 JSX title 与单项 `replace`。
- **破坏性改动**：`onChange` 参数改为 href；`getCurrentAnchor` 以 href 工作（仍接受 key）；`affix` 默认开启；vertical 在 `affix={false}` 且未开 `showInkInFixed` 时隐藏 ink；点击链接会改变 hash；`anchorLinkClass` 签名改为 `{ layout }`，移除 `AnchorLinkVariants`。
- **保留差异**：classNames / styles、rootClassName、RTL、ConfigProvider、`Anchor.Link` JSX 写法。

### Affix

- **修复**：同时设置 `offsetTop` 与 `offsetBottom` 时 offsetBottom 被忽略；现在先判断顶部再判断底部，与 antd `getFixedTop` / `getFixedBottom` 一致。
- `target` 返回空值时回退到 window；指定容器时固定内容在占位块内 absolute 定位，随容器一起被裁剪。
- README 与 docs 同步 `affixClass`、`updatePosition`、`calculateAffix`。

## 能力映射

源码：`packages/components/lib/{Anchor,Affix}/`，逻辑 `packages/competence/src/{anchor,affix}.ts`（`types/*.d.ts` 手工同步）。

| 能力 / 覆盖 | example / docs 示例 | L1 headless | L2 smoke | L3 render | L4 browser |
| --- | --- | --- | --- | --- | --- |
| window 默认容器、scroll-spy、onChange(href) | anchor/basic、on-change | anchor | exports | contracts | window（仅 docs） |
| 内部容器、点击抑制与恢复 | anchor/container | anchor：settle | — | contracts | container |
| 轨道 / ink / 缩进 / 静态隐藏 ink | anchor/container、static | theme | — | contracts | visual、static |
| onClick / replace / hash 写入 | anchor/on-click、replace | — | — | contracts | onClick、replace |
| getCurrentAnchor | anchor/custom-highlight | anchor | — | contracts | customHighlight |
| 横向 ink | anchor/horizontal | — | — | — | horizontal（仅 docs） |
| Affix 顶部 / 底部 / 优先级 | affix/basic、bottom | affix | exports | Affix | window、bottom（仅 docs） |
| Affix 容器、禁用、尺寸变化、onChange | affix/target、on-change | affix | — | Affix | target、controls |

测试路径前缀 `packages/testing/<层>/{Anchor,Affix}/`：headless anchor 14 + theme 2 + affix 6、render 9 + 4、smoke 各 1、browser 9 + 5。

## 踩坑

- competence 的 `types/*.d.ts` 是手工维护的，改 src 后必须同步，否则 components 类型检查仍用旧签名。
- example 应用的滚动发生在 `[data-appid=content]` 而非 window，以窗口为容器的浏览器用例只在文档站执行。
- example 使用 @solidjs/router，路由会给同源 `a[href]` 自动加 `aria-current="page"` / `data-active`；hash 链接因此在 example 里拿到 `aria-current="page"`。本组件只在激活时写 `location`，未激活时交还给路由，测试以文档站与激活态断言为准。
- Demo 卡片的 `overflow-hidden` 会阻断横向 sticky；Affix target 示例的 `<output>` 与固钉内容都带 `data-affixed`，定位器须限定 `div[data-affixed]`。
- scroll-spy 与 antd 一致：区块顶边越过 `targetOffset + bounds` 才激活；有内边距的容器滚回 `0` 时第一个区块尚未越线，不会被激活。

## 验证记录

环境：Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0。日志目录：`output/c10-nav/`。范围：Breadcrumb、Steps、Anchor、Affix。

| 命令 / 证据 | 结果 |
| --- | --- |
| 修复前 | Anchor 页面滚动 scroll-spy 不工作、点击滚动途中高亮闪烁、双重指示条；Affix 同设上下偏移时底部失效；Breadcrumb 无列表语义、最后一项链接丢失；Steps 无 filled 外观 / percent 圆环 / 语义化，点击被 UI 守卫限制 |
| 定向 `vitest run headless/render/smoke × 4 物料` | 15 个文件 84 条通过（targeted.log） |
| `pnpm test --maxWorkers=2` | 271 个文件、2730 条通过（test.log） |
| `pnpm run typecheck` / `typecheck:docs` / `packages/testing typecheck:browser` | 均通过（typecheck*.log） |
| `pnpm run build` / `pnpm run build:docs` | 通过（build.log、build-docs.log） |
| `playwright test -c playwright.c10-nav.config.ts` | 首轮 9 条失败（全部为用例定位器 / 滚动距离问题，组件无需改动）；修正后连续两轮 47 通过、5 跳过（仅 docs 用例在 example 跳过）（playwright-2.log、playwright-3.log） |
| `git diff --check` | 通过 |

截图已查看：Steps 基本（filled、rail、倒计时副标题）、Affix 容器内固定、Anchor 窗口固定 80px 与 scroll-spy 高亮。
