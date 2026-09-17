# Popover 组件回归（C02）

状态：2026-09-17 本轮验收通过。范围为源码工作区、docs/example 与当前机器 Chrome；不代表发布包或 B04 全范围验收。

## 契约与必要性

Popover 是共享 createTrigger 的薄封装，展示可承载标题与任意内容（包括按钮等交互控件）的卡片。没有独立 headless 模块（与 Dropdown 一致，直接在组件内用 `createTrigger`），保留 `Popover`、`PopoverProps`、`PopoverPlacement`、`PopoverTrigger`。

- 默认 `trigger="hover"`、`placement="top"`；固定启用箭头，间距 = offset(4) + arrowPadding(8) = 12px（与 Tooltip 相同）。
- **没有** `mouseEnterDelay`/`mouseLeaveDelay`：hover 打开走 `createTrigger` 裸默认值即时展开（0ms），关闭沿用 100ms 默认防抖。这与 Tooltip 显式对齐 antd 100ms 打开延迟不同，是既有的范围差异，不是本次要补的缺陷——Popover 的 props 从未声明这两个选项。
- `title`/`content` 两者都为 `undefined`/`null`/`''`/`false` 时视为空内容，等效禁用（永不打开）；任一非空即可打开。
- `open` 存在时由父组件决定可见状态，`onOpenChange(boolean)` 仅请求更新；`defaultOpen` 仅初始化一次；`disabled` 与"空内容"共同决定内部 disabled，都不覆盖显式受控 `open`。
- 若浮层已打开后 `disabled`（含内容变空）才变为真，浮层不会被强制关闭（共享 Trigger 语义只冻结开关请求），但渲染层的 `visible = open() && hasAnyContent()` 会让它立即隐藏并加 `aria-hidden`/`inert`，不留一张空卡片；条件解除后无需用户重新触发即可恢复可见。
- `getContainer` 决定浮层实际 Portal 落点，不传时使用最近 `ConfigPortal` 主题作用域。
- `role="dialog"`（不是 `role="tooltip"`）：因为内容允许承载交互元素，ARIA tooltip 语义禁止这样做。不做焦点管理/键盘方向导航——内容任意，交由使用者决定内部 Tab 顺序，这与 Dropdown 固定菜单列表的方向键循环不同。
- 没有 `ref`/命令式实例（props 从未声明），没有静态子组件、异步确认协议；不新增这些能力，也不对标其他库全面兼容。

## 基线与已复现问题

环境：Node 22.22.0、pnpm 11.16.0；锁文件 solid-js/@solidjs/web 2.0.0-rc.0、Vite 8.2.1、vite-plugin-solid 3.0.0-next.27、Vitest 4.1.10、Playwright 1.63.0。未升级依赖。

- 修改前：全量 116 文件 / 1286 条通过（延续 Tooltip 收尾状态）；根类型检查通过。Popover 此前完全没有测试、docs、专项浏览器配置。
- **[缺陷 1] title/content 都为空仍会打开空卡片**：`hasTitle`/`hasContent` 只用于决定渲染哪个内部 `<div>`，从未反馈到 `trigger` 的 `disabled`；悬停/点击一个完全没有标题和内容的 Popover 会展示一个只有圆角阴影、什么都没有的卡片。与本轮为 Tooltip 修的 `title={false}` 缺陷同一类问题，且更基础（Popover 原本连"标题为空"都没处理，不只是漏了 `false` 分支）。修复：新增 `hasAnyContent = hasTitle() || hasContent()`，喂给 `disabled` getter；`render/Popover/content.test.tsx` 的 `[popover.content.empty]` 系列用例修复前失败（浮层挂载且可见），修复后通过。
- **[缺陷 2] `getContainer` 从未生效**：prop 类型、getter 全程传导到 `createTrigger` 配置，但 `<Portal>` 从未接收 `mount={props.getContainer?.()}`——与本轮 Tooltip 回归发现的同一类缺陷（Dropdown 把 `createTrigger` 改成 `offsetParent` 定位后，`getContainer` 在共享 Trigger 内部也不再被读取，容器完全由 UI 层的 `<Portal mount>` 决定）。修复：`<Portal mount={props.getContainer?.()}>`。`render/Popover/controlled.test.tsx` 的 `[popover.controlled.get-container]` 验证；真实浏览器另有 Playwright MCP 交互验证（见下）。
- **[缺陷 3] 关闭后浮层缺 `aria-hidden`/`inert`**：与 Tooltip/Dropdown 已修的同类无障碍缺口一致，Popover 首次实现时未跟上。修复：新增 `visible = trigger.open() && hasAnyContent()`，驱动 class 可见性与 `aria-hidden`/`inert` 一致。`render/Popover/content.test.tsx` 的 `[popover.content.closed-aria]` 验证。

以上 3 项修复前均有对应失败用例复现（render 层新增文件），修复后全部转绿；未使用 skip/any/放宽断言掩盖。

### 已知、非本轮引入的共享噪音

Popover 页面同样打印大量 `[STRICT_READ_UNTRACKED] Reactive value read directly in <Popover>` / `in an effect callback` 警告，来源与 Tooltip 回归记录中分析的一致——共享 `createTrigger`（`packages/competence/src/trigger.ts`）的 `createEffect` 效果体内部对 `open()` 的防御性裸读，不是 Popover 新引入。实测未发现对应可观察行为缺陷；已在 Tooltip 回归记录标注为 B04 完整回归待查项，此处不重复整改共享文件。

## 能力与文件映射

源码：`packages/components/lib/Popover/{index.tsx,styles.ts}`、共享 `packages/competence/src/trigger.ts`（未改动，仅复用）。
公共 UI 导出：`packages/components/lib/index.ts`（本轮未新增导出，`PopoverProps`/`PopoverPlacement`/`PopoverTrigger` 已存在）。

L1 共享生产行为继续归 `headless/shared/Trigger/`，Popover 无独立 headless 模块。以下路径相对 `packages/testing`；每条新增测试前有中文备注。

| 能力 ID | L1 | L2 | L3 | L4 |
| --- | --- | --- | --- | --- |
| popover.exports.types | — | smoke/Popover/exports.test.ts | — | — |
| popover.content.title-and-content/content-only/jsx-content/empty/role/arrow/style/closed-aria | — | — | render/Popover/content.test.tsx | browser/Popover/interactions.spec.ts、position.spec.ts |
| popover.trigger.hover-instant-open/hover-close-delay/click/focus/layer-hover/disabled | — | — | render/Popover/trigger.test.tsx | browser/Popover/interactions.spec.ts |
| popover.controlled.open/default-open/get-container/unmount-cleanup/content-becomes-empty | — | — | render/Popover/controlled.test.tsx | browser/Popover/interactions.spec.ts（container） |
| popover.mount.basic/provider-defaults | — | smoke/Popover/mount.test.tsx | — | — |
| popover.position.all（12 placement）/scroll | shared/Trigger 既有 12 placement/翻转/clamp | — | — | browser/Popover/position.spec.ts |
| popover.browser.interactive-content/disabled-dynamic/dev | — | — | — | browser/Popover/interactions.spec.ts |

## 验证记录（执行后更新）

| 命令 | 结果 |
| --- | --- |
| `pnpm --dir packages/testing run test render/Popover`（修改前，缺陷复现） | 5 条失败（title/content 空内容打开、closed-aria） |
| `pnpm --dir packages/testing run test render/Popover smoke/Popover`（修复后新增用例） | 5 文件 / 25 条通过 |
| 最终全量 `pnpm test` | 121 文件、1311 条通过 |
| `pnpm run typecheck` / `pnpm --dir packages/testing run typecheck:browser` | 均通过 |
| `pnpm run build`（三个生产包 + example） | 通过；example 保留既有大 chunk 提示 |
| `pnpm run check:docs`（typecheck:docs + build:docs） | 通过；14 页面预渲染 |
| `pnpm run test:docs:browser`（双 base） | 13 条通过（根路径 + `/solid-upthrust/`） |
| Playwright MCP 交互验证（`http://127.0.0.1:4173/components/data-display/popover/`） | 悬停打开标题+内容、卡片内按钮可点击、空内容不打开、disabled 动态阻止/恢复、getContainer 挂到 body 且脱离局部主题作用域——均通过 |
| `pnpm --dir packages/testing exec playwright test --config playwright.popover.config.ts`（docs + example 双项目） | 43 条通过，重复跑两次均稳定 |
| `git diff --check` | 通过（无输出） |

## 未决边界

完整 B04（含 STRICT_READ_UNTRACKED 噪音溯源，已在 Tooltip 记录标注）、Firefox/WebKit、屏幕阅读器认证、发布包全新消费者安装、tree shaking、Popover 与 ColorPicker 的组合验证（依赖链 `Popover → ColorPicker`，属于后续 C06 范围）仍不在本次完成声明内。当前不提供任何键盘方向导航或焦点自动管理——内容任意，交由使用者自行决定内部控件 Tab 顺序。若任何适用验收未运行，TODO 保持未勾选；不据用例存在宣称通过。
