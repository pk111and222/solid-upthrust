# Tooltip 组件回归（C02）

状态：2026-09-17 本轮验收通过。范围为源码工作区、docs/example 与当前机器 Chrome；不代表发布包或 B04 全范围验收。

## 契约与必要性

Tooltip 是共享 createTrigger 的最薄封装，给单个元素补充简短文字说明。保留 `Tooltip`、`TooltipProps`、`TooltipIns`、`TooltipPlacement`、`TooltipTrigger`。

- 默认 `trigger="hover"`、`placement="top"`、`mouseEnterDelay=100`、`mouseLeaveDelay=100`（antd 对齐，区别于裸 `createTrigger` 默认的 0ms 打开延迟）；固定启用箭头，间距 = offset(4) + arrowPadding(8) = 12px。
- `title` 为 `undefined`/`null`/`''`/**`false`** 时视为空标题，等效禁用（永不打开）；数字 `0` 是合法标题。`false` 分支是本轮修的真实缺陷（见下）。
- `open` 存在时由父组件决定可见状态，`onOpenChange(boolean)` 仅请求更新；`defaultOpen` 仅初始化一次；`disabled` 与"空标题"共同决定内部 disabled，但都不覆盖显式受控 `open`。
- 若浮层已打开后 `disabled`（含标题变空）才变为真，浮层不会被强制关闭（继承共享 Trigger 语义：只冻结开关请求），但**渲染层**在 `visible = open() && hasTitle()` 上额外把它判定为不可见并加 `aria-hidden`/`inert`，不留一个只剩 padding 的空气泡；条件解除后无需用户重新触发即可恢复可见。
- `getContainer` 决定浮层实际 Portal 落点，不传时使用最近 `ConfigPortal` 主题作用域。
- `ref` 暴露 `{ open, setOpen }`，可在非受控模式下命令式控制显隐。
- 关闭后浮层保留 DOM（懒销毁宽限期），标 `aria-hidden="true"` + `inert`；不新增 arrow 关闭开关、多行富文本编辑、表单承载或异步确认协议——这些留给 Popover/Popconfirm。

## 基线与已复现问题

环境：Node 22.22.0、pnpm 11.16.0；锁文件 solid-js/@solidjs/web 2.0.0-rc.0、Vite 8.2.1、vite-plugin-solid 3.0.0-next.27、Vitest 4.1.10、Playwright 1.63.0。未升级依赖。

- 修改前：`headless/Tooltip`、`headless/shared/Trigger` 共 5 文件 / 58 条通过；根类型检查通过。
- **[缺陷 1] `title={false}` 弹出空气泡**：`hasTitle` 只排除 `undefined/null/''`，未排除 `false`；而 `title={cond && 'text'}` 是常见写法，`cond` 为假时 `title` 恰好是 `false`。修复：`hasTitle` 增加 `!== false` 分支；`render/Tooltip/content.test.tsx` 的 `[tooltip.content.false]` 用例修复前失败（浮层挂载且可见），修复后通过。
- **[缺陷 2] `props.ref` 组件体裸读**：`props.ref?.(tooltip.refs)` 未 `untrack`，触发 `STRICT_READ_UNTRACKED` 且属于本仓库已知的"组件体裸读 props 触发 Solid 2 严格模式"模式（Button/Skeleton 回归时修过同类问题）。修复：包一层 `untrack(() => ...)`。
- **[缺陷 3] `getContainer` 从未生效**：prop 类型、headless getter 全程传导，但 UI 的 `<Portal>` 从未把它接到 `mount`；Dropdown 回归把 `createTrigger` 改成基于 `offsetParent` 定位后，`getContainer` 在共享 Trigger 内部也已不再被读取。修复：`<Portal mount={props.getContainer?.()}>`；不改 `createTrigger`（Dropdown 不暴露 `getContainer` 给用户，改动范围只在 Tooltip UI 层）。`render/Tooltip/controlled.test.tsx` 的 `[tooltip.controlled.get-container]` 验证。
- **[缺陷 4] 关闭后浮层缺 `aria-hidden`/`inert`**：与 Dropdown 已修的同类无障碍缺口一致，Tooltip 首次实现时未跟上。修复：新增 `visible = open() && hasTitle()` 派生量，驱动 class 可见性与 `aria-hidden`/`inert` 一致。`render/Tooltip/content.test.tsx` 的 `[tooltip.content.closed-aria]` 验证。
- **[缺口 5] barrel 未导出 `TooltipIns`**：Button/Skeleton 回归都补了各自 `*Ins` 类型的根导出，Tooltip 漏了。修复：`Tooltip/index.tsx` 重导出 + 根 `lib/index.ts` 补充。`smoke/Tooltip/exports.test.ts` 验证。

以上 5 项修复前均有对应失败用例复现（见 headless/render/smoke 三层新增文件），修复后全部转绿；未使用 skip/any/放宽断言掩盖。

### 示例设计缺陷（非组件缺陷，记录在案）

- `docs/src/examples/tooltip/ref.tsx` 最初用 `let ins` 闭包变量 + `{ins?.open() ? A : B}` 三元表达式演示 ref 命令式控制，外部有一个独立的"打开/关闭"按钮读 `ins.open()` 计算下一个状态。该按钮位于 Tooltip 触发器与浮层之外，点击会先触发共享 Trigger 的 `document` 级 `pointerdown` 外部关闭监听（`handleOutsidePointer`），把已打开的浮层关闭，随后该按钮自己的 `click` 处理器才基于"刚被关闭"的最新状态取反，导致净效果永远变成"重新打开"——第二次点击起再也回不到"关闭"文案。用真实浏览器点击复现（`browser/Tooltip/interactions.spec.ts` 的 `[tooltip.browser.ref]`），标准 fix 是在该外部按钮加 `onPointerDown={e => e.stopPropagation()}`，阻止其 pointerdown 冒泡到 `document`；不是组件缺陷，是"外部控制按钮需要与浮层触发区分开"的常见交互模式，Dropdown 自己的受控 demo 通过改用独立 `createSignal` + `onOpenChange` 镜像巧妙避开了同一坑，未暴露这条通用规则。

### 共享 Trigger 的 STRICT_READ_UNTRACKED 噪音（已知、非本轮引入，未在本次范围修复）

Tooltip 页面加载即打印大量 `[STRICT_READ_UNTRACKED] Reactive value read directly in <Tooltip>` /`in an effect callback` 警告；同一警告在 Dropdown 页面也存在（136 vs 25 条，大致与页面内实例数成比例），说明来源是共享 `createTrigger`（`packages/competence/src/trigger.ts`）里 `createEffect` 双函数的效果体（第二个函数）内部对 `open()` 的防御性裸读（例如 `reveal = () => { if (!open() || !_layerEl) return; ... }`），而不是 Tooltip 新引入。该读取不需要建立新订阅（外层已经通过依赖收集函数订阅了 `open`），实测未发现对应的可观察行为缺陷（四层测试与真实浏览器交互均未复现异常）。Dropdown 早前已带着同样的噪音通过验收，本次不在 Tooltip 范围内改动共享文件；建议记为 B04 Trigger 完整回归的待查项。

## 能力与文件映射

源码：`packages/components/lib/Tooltip/{index.tsx,styles.ts}`、共享 `packages/competence/src/trigger.ts`（未改动，仅复用）、`packages/competence/src/tooltip.ts`。
公共 UI 导出：`packages/components/lib/index.ts`；headless 导出：`packages/competence/src/index.ts`（沿用既有 `export * from './tooltip'`）。

L1 共享生产行为继续归 `headless/shared/Trigger/`，不在 Tooltip 测试重复定义 createTrigger。以下路径相对 `packages/testing`；每条新增测试前有中文备注。

| 能力 ID | L1 | L2 | L3 | L4 |
| --- | --- | --- | --- | --- |
| tooltip.exports.types | — | smoke/Tooltip/exports.test.ts | — | — |
| tooltip.content.text/jsx/zero/empty/false/role/arrow/style/overlay-style-priority/closed-aria | — | — | render/Tooltip/content.test.tsx | browser/Tooltip/interactions.spec.ts、position.spec.ts |
| tooltip.trigger.hover-default-delay/click/focus/custom-delay/layer-hover/disabled | 部分见 headless/Tooltip/tooltip.test.ts | — | render/Tooltip/trigger.test.tsx | browser/Tooltip/interactions.spec.ts |
| tooltip.controlled.open/default-open/ref/get-container/unmount-cleanup | — | — | render/Tooltip/controlled.test.tsx | browser/Tooltip/interactions.spec.ts（ref、container） |
| tooltip.mount.basic/provider-defaults/title-becomes-empty | — | smoke/Tooltip/mount.test.tsx | — | — |
| tooltip.headless.default-hover-delay/custom-delay/arrow-enabled/disabled-forwards | headless/Tooltip/tooltip.test.ts | — | — | — |
| tooltip.position.all（12 placement）/scroll | shared/Trigger 既有 12 placement/翻转/clamp | — | — | browser/Tooltip/position.spec.ts |
| tooltip.browser.dev | — | — | — | browser/Tooltip/interactions.spec.ts |

## 验证记录（执行后更新）

| 命令 | 结果 |
| --- | --- |
| `pnpm --dir packages/testing run test headless/Tooltip headless/shared/Trigger`（修改前） | 5 文件 / 58 条通过 |
| `pnpm run typecheck`（修改前） | 通过 |
| `pnpm --dir packages/testing run test headless/Tooltip smoke/Tooltip render/Tooltip`（新增用例） | 6 文件 / 46 条通过 |
| 最终全量 `pnpm test` | 116 文件、1286 条通过 |
| `pnpm run typecheck` / `pnpm --dir packages/testing run typecheck:browser` | 均通过 |
| `pnpm run build`（三个生产包 + example） | 通过；example 保留既有大 chunk 提示 |
| `pnpm run check:docs`（typecheck:docs + build:docs） | 通过；13 页面预渲染 |
| `pnpm run test:docs:browser`（双 base） | 13 条通过（根路径 + `/solid-upthrust/`） |
| `pnpm --dir packages/testing exec playwright test --config playwright.tooltip.config.ts`（docs + example 双项目） | 47 条通过，重复跑两次均稳定 |
| `git diff --check` | 通过（无输出） |

## 未决边界

完整 B04（含上面记录的 STRICT_READ_UNTRACKED 噪音溯源）、Firefox/WebKit、屏幕阅读器认证、发布包全新消费者安装、tree shaking、Tooltip 与 Form.Item 的组合验证（依赖链 `Tooltip → Form.Item / FloatButton`，属于后续 C07/C11 范围）仍不在本次完成声明内。当前不提供 `aria-describedby` 自动关联触发元素与浮层文本；需要更强无障碍关联时由消费者自行补充。若任何适用验收未运行，TODO 保持未勾选；不据用例存在宣称通过。
