# C11 Popconfirm

状态：已验收（2026-09-29；下述支持范围与 Chromium 环境）。

## 契约与修复

对照 [Ant Design Popconfirm](https://ant.design/components/popconfirm-cn/) 公开示例与 antd 6 源码 `popconfirm/`（index、PurePanel、style）、`_util/ActionButton`，不宣称全 API 兼容。逻辑继续放在 `createPopconfirm`（createTrigger 特化），UI 为 Popover 同款浮层皮肤。

- **headless 修复**：
  - 确认改为 antd ActionButton 语义：同步回调立即关闭；返回 Promise 时 loading，resolve 后关闭，**reject 保持打开**（修复前 `finally` 一律关闭）。
  - 进行中重复点击确认被忽略，用同步 `pending` 标志实现，避免批处理下同 tick 连点重复提交。
  - 取消先关闭再回调，onCancel 的返回值不参与闸门。
  - 新增 `arrow` / `mouseEnterDelay` / `mouseLeaveDelay`，默认 100ms，与 antd 一致。
- **视觉**：
  - 容器 12px 内边距、8px 圆角、w-max、z-index 1060。
  - 图标改为 antd ExclamationCircleFilled（修复前是 mdi 问号），14px、警告色，右距 8px，在标题首行内垂直居中。
  - 只有标题时常规字重，有描述时 600 加粗；描述上距 4px；message 下距 8px。
  - 按钮右对齐、small、间距 8px；取消按钮为默认样式（修复前是 outlined）。
  - 去掉修复前的 min-w 180 / max-w 300 限制。
- **新增 API**：`okType`（含 `'danger'`）、`showCancel`、`onPopupClick`、`arrow`、`zIndex`、title / description 函数（RenderFunction）、语义化 `classNames` / `styles`（root / container / arrow / icon / title / content，对象或函数）、ConfigProvider `Popconfirm` 默认值、`icon={null}` 隐藏。
- **可访问性**：关闭但仍挂载时 aria-hidden + inert（与 Tooltip / Popover 一致）；`getContainer` 接到 Portal（修复前未接线）；ref 回调放进 untrack。
- **共享修复（箭头偏 4px）**：`computeArrow` 返回的是箭头**中心**坐标，但 Tooltip / Popover / Popconfirm / Menu 折叠 tooltip 都把它直接当作 8px 方块的 left / top 使用，导致箭头整体偏移半个宽度。四处统一减去 4px。

### 破坏性改动

- 异步 onConfirm reject 不再关闭面板。
- 默认图标改为实心感叹号；取消按钮由 outlined 改为 default。
- `onCancel` 类型不再允许返回 Promise（返回值会被忽略）。
- `overlayClass` / `overlayStyle` 废弃（仍生效），改用 `classNames.root` / `styles.root`；样式导出重命名（移除 popconfirmActionsClass，新增 container / title / buttons 等）；`twMerge` 换成 `mergeClass`。

### 保留差异

箭头恒指向中心（`arrow.pointAtCenter` 只接受不生效）、按钮文案不跟随 locale、RTL、`_InternalPanelDoNotUseOrYouWillBeFired` 调试面板、wireframe 主题。

## 能力映射

源码：`packages/components/lib/Popconfirm/`，逻辑 `packages/competence/src/popconfirm.ts`；箭头修复波及 `lib/{Tooltip,Popover,Menu}/index.tsx`。

| 能力 / 覆盖 | example / docs 示例 | L1 headless | L2 smoke | L3 render | L4 browser |
| --- | --- | --- | --- | --- | --- |
| 结构 / 图标 / 字重 / 按钮 | basic、description / popconfirm/basic、locale | popconfirm.theme | exports | default、content、buttons | geometry、dismiss（仅 example） |
| 确认 / 取消 / popup click / disabled | basic / basic、dynamic-trigger | cancel-order | — | intents | geometry、dismiss |
| 异步 loading / reject / 防重复 | async / promise、async | async-reject、no-double-submit | — | async | async |
| 受控 / arrow / zIndex | 受控模式 / dynamic-trigger | controlled open | — | controlled | — |
| 12 方向 / 翻转 | placement / placement | — | — | — | placement |
| 语义化 classNames / styles | — / style-class | — | exports | semantic | — |

测试路径：headless `Popconfirm/popconfirm`（9）+ `theme`（1）、render `Popconfirm/contracts`（7）、smoke `Popconfirm/exports`（1）、browser `Popconfirm/popconfirm`（4 条 × 2 项目，1 条跳过）；因箭头修复，Tooltip / Popover / Menu 浏览器套件一起回归。

## 踩坑

- `computeArrow` 的坐标是箭头中心，不是方块左上角；浏览器用例要断言箭头中心对准触发器中心。
- 图标 span 直接继承 22px 行高、让 anticon 按基线对齐时会下偏约 4px；要用 flex + h-[22px] 容器在首行内居中。
- example 预览读的是 `example/dist`，只改示例页不改组件时也必须重建 example（根 `pnpm run build` 包含这一步）。
- happy-dom 零矩形时 Trigger 不产出箭头数据，render 用例需要给原型打 getBoundingClientRect 桩并 waitFor。
- docs 示例的 `onChange={setX}` 会把 event 作为第二个参数传给 setter，要包一层函数；箭头函数直接返回 setter 结果会触发 `void | Promise` 类型错误。

## 验证记录

环境：Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0。日志目录：`output/c11-popconfirm/`。

| 命令 / 证据 | 结果 |
| --- | --- |
| 修复前 | reject 仍关闭、同 tick 连点可重复提交、mdi 问号图标、outlined 取消按钮、min/max 宽度限制、getContainer 未接线、关闭态无 aria-hidden、缺 okType / showCancel / 语义化 / onPopupClick；四处箭头偏 4px |
| `pnpm test --maxWorkers=2` | 281 个文件、2778 条通过（vitest.log） |
| `pnpm run typecheck` / `typecheck:docs` / `packages/testing typecheck` / `typecheck:browser` | 均通过（首轮 docs 因 competence dist 旧类型与示例返回值失败，重建并修正后通过）（typecheck*.log） |
| `pnpm run build` / `pnpm run build:docs` | 通过（build.log、build-docs.log） |
| `playwright test -c playwright.c11-popconfirm.config.ts`（Popconfirm + Tooltip + Popover + Menu） | 首轮失败：example dist 未重建、图标下偏 4px、箭头偏 4px，均已修复；之后连续两轮 117 通过、1 跳过（playwright-1.log、playwright-2.log） |
| `git diff --check` | 通过 |

截图已查看：带描述的确认框（图标 / 加粗标题 / 描述 / 右对齐按钮，箭头居中）。
