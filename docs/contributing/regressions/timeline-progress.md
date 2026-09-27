# C09 Timeline / Progress

状态：已验收（2026-09-27；下述支持范围与 Chromium 环境）。范围为 Timeline（含 Timeline.Item 兼容桩）、Progress（line / steps / circle / dashboard）及必要依赖路径。

## 契约与修复

对照 [Ant Design Timeline](https://ant.design/components/timeline-cn/) 与 [Progress](https://ant.design/components/progress-cn/) 页面、全部公开示例（curl 获取 `components/{timeline,progress}/demo/*`）、antd 6 源码（`timeline/{Timeline,useItems}` 与基于 Steps dot 的样式、`progress/{Progress,Line,Steps,Circle,utils}` 与样式、rc-progress `Circle/{index,PtgCircle,util}`）和实测 DOM 逐项核对；不宣称全 API 兼容。

- **Timeline 结构重写**：旧实现不是 antd 6 结构，也不支持横向、title、titleSpan、variant、语义化。现在改为 `ol > li`，每项 wrapper > icon + section > header（title、rail）+ content，与 antd 6 的 Steps dot 结构一一对应。尺寸按实测：圆点 10×10、mt 7px、边框 2px；导轨 2px，top 17 / bottom -7；纵向 li 最小高 48px、pb 12px；wrapper 间距 16px。
- **Timeline 布局**：新增 competence `timeline.ts` 纯函数。
  - 旧字段回落（label / children / dot / position、mode left / right）。
  - alternate 模式按奇偶分配 placement，显式 placement 优先。
  - pending 在 reverse 之前追加；无 pendingDot 时显示加载图标。
  - 导轨状态默认跟随下一项，reverse 时跟随自身（railFollowPrevStatus）。
  - 进入交替布局的条件：mode=alternate，或纵向且任一项有 title。
  - 标题占比写入 CSS 变量 `--ut-tl-span`：数字按 24 栅格份数计，字符串为 CSS 长度，alternate 模式下忽略。
  - 横向提供 start / end / alternate 三种布局，alternate 的标题与内容上下错开 56px。
- **Timeline 颜色**：预设 blue / red / green / gray 走 cva 字面量类（outlined / filled / custom 共 12 个配色方案）。任意 CSS 颜色写内联 border-color / background-color / color。自定义图标去掉边框、字号 12px、居中。
- **自定义图标被压缩（浏览器回归发现）**：图标盒是 10px 的 flex 容器，子元素默认 `flex-shrink: 1`，16px / 20px 的时钟图标被压成 10px。给子元素补 `[&>*]:shrink-0`，浏览器用例断言图标实际为 16 / 20px 且居中于导轨。
- **自定义图标隐形（用户反馈）**：custom 示例把 `bg-surface` 写在 `i-mdi-*` mask 图标元素上，覆盖了 `background-color: currentColor`，图标被涂成底色。底色改放外层包裹 span；新增 `[timeline.browser.icon-visible]` 扫描全部示例：图标不得带 `bg-*` 类，实际绘制色须等于文字色。
- **Progress 数学移入 competence**：`progress.ts` 按 antd utils 重写。
  - 基础函数：validProgress、getSuccessPercent（只认 `success.percent`）、getPercentage、getStrokeColor（成功色默认 #52c41a），以及 getSize 的全部分支（line / step / circle，small / medium / 数字 / 数组 / 对象，'middle' / 'default' 归一）。
  - 渐变：sortGradient 与 handleGradient。
  - 亮色判定 isBrightStrokeColor：内部数值在亮色进度条上用深色文字。
  - 步骤点亮格数支持 rounding。
  - 旧的 createProgress / clampPercent / circlePath 已删除（旧圆形用自绘 path，不是 antd 的 circle + dasharray）。
- **Progress 圆形几何**：移植 rc-progress getCircleStyle。
  - 半径 = 50 - strokeWidth / 2；dasharray / dashoffset / rotate 与 antd 实测一致：75% 圆为 295.31px 与 76.8274；dashboard gap 75 为 233.787px、127.5deg；8 格步骤仪表盘为 198.968px、176.097，依次 127.5 / 163.125 / 198.75deg。
  - 端点：圆头端点额外偏移半个线宽，极小值保留 0.01。
  - 路径：成功段为 0 时路径透明，不移除。
  - 渐变圆：mask + foreignObject 内的 conic-gradient，并强制使用 butt。
  - 步骤圆：不渲染导轨，未点亮的格用 railColor。
  - 小尺寸：直径 ≤ 20 时数值改由 Tooltip 展示，线宽默认补到 3px 视觉宽度。
- **Progress 线形**：导轨高度随尺寸变化（默认 8px，small 6px）；数值在导轨右侧 8px 处。active 状态用 `::after` 扫光动画，preset 新增 `ut-progress-active` keyframes 与 `animate-progress-active` 规则。percentPosition 支持 inner（start / center / end）和 outer（start / end / center 底部）。strokeLinecap 为 butt / square 时是直角。支持成功段叠加。状态图标：线形用 check-circle / close-circle，圆形用 check / close。
- **语义化**：两个组件都支持 classNames / styles 的对象和函数形式（新增 `common/semantic.ts` 的 resolveSemantic）。Timeline 另有节点级 classNames / styles / class / style。原生属性透传。
- **Solid 细节**：
  - `<foreignObject mask>` 不在 JSX 类型里，改为类型断言展开。
  - 同一页面上多个渐变圆的 mask id 用 createUniqueId 生成，避免冲突。
  - format 返回数字 0 时经 numberToText 渲染。
  - pending / pendingDot 用 `children()` 解析一次。
- **行为变化**：
  - Timeline 根节点改为 `ol`，节点改用 items 渲染；Timeline.Item 子元素写法不再渲染（Solid 无法读取子元素 props，仅保留类型兼容）。
  - Progress 删除 createProgress 系列导出，size 默认改为 'medium'，圆形 DOM 从 path 改为 circle。
- 保留差异（文档已写明）：
  - 进行中节点之后的导轨，antd 样式写的是 dotted，实测渲染为实线，这里保持实线。
  - 仪表盘传了缺口角度却没给缺口位置时，按 bottom 处理（antd 算出 NaN）。
  - 未接入 ConfigProvider；RTL 未处理。

## 能力映射

源码：`packages/components/lib/{Timeline,Progress}/{index.tsx,styles.ts}`、新增 `packages/components/common/semantic.ts`。逻辑：新增 `packages/competence/src/timeline.ts`，重写 `progress.ts`。preset 新增进度扫光动画。公开入口补全两组件的语义化与枚举类型（`packages/components/lib/index.ts`）。

| 能力 ID / 覆盖 | example / docs 示例 | L1 | L2 | L3 | L4 |
| --- | --- | --- | --- | --- | --- |
| timeline.items：旧字段、mode 归一、奇偶 placement、loading、pending / pendingDot、reverse、rail 状态 | timeline/basic, pending, pending-legacy | headless/Timeline/timeline：7 条 | smoke/Timeline/exports | render/Timeline：default、legacy、pending、reverse、empty | basic、pending |
| timeline.layout：交替、另一侧、标题、titleSpan、横向三模式 | timeline/alternate, end, title, title-span, horizontal | theme：全布局 × 配色无死类 | 同上 | alternate、horizontal | alternate、end-title、title-span、horizontal |
| timeline.style：variant、预设 / 自定义色、自定义图标、语义化对象 / 函数 | timeline/variant, custom, semantic, style-class | 同上 | 同上 | colors、semantic、attrs | colors、semantic |
| progress.line：钳制、状态、图标、尺寸、成功段、渐变、linecap、percentPosition、format | progress/line, line-mini, dynamic, segment, linecap, gradient-line, info-position, size | headless/Progress/progress：math 7 条；theme：全变体无死类 | smoke/Progress/exports | render/Progress：line 6 条 | line、line-mini、dynamic、info-position、semantic |
| progress.steps：点亮格数、尺寸、数组色、rounding | progress/steps, size | math.steps、math.size | 同上 | steps | steps、size |
| progress.circle：几何、dashboard 缺口、状态、渐变 mask、步骤圆、micro Tooltip | progress/circle, circle-mini, circle-micro, format, dashboard, gradient-line, circle-steps | circle 6 条（实测数值） | 同上 | circle 6 条 | circle、circle-micro、dashboard、gradient、steps |
| 语义化 classNames / styles | timeline/style-class、progress/style-class | — | 同上 | semantic | semantic |
| SSR 页面与 API | data-display/timeline、feedback/progress | 不改路由逻辑 | — | — | 两物料 ssr / dev 用例 |

完整测试路径以 `packages/testing/<层>/<Material>/` 为前缀；Progress 的主题死类检查与 Timeline 合并在 `headless/Timeline/theme.test.ts`。所有新增用例附中文说明。

## 验证记录

环境：Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0（未升级）。当前工作区已有大量前序修改，均保留。日志目录：`output/c09-timeline-progress/`。

| 命令 / 证据 | 结果 |
| --- | --- |
| 修复前复现 | 旧 headless 测试依赖已删除的 createProgress / circlePath；浏览器截图：alternate / custom 示例的 16 / 20px 图标被 flex 压成 10px |
| `pnpm --dir packages/testing run test headless/Timeline headless/Progress smoke/Timeline smoke/Progress render/Timeline render/Progress` | 7 文件 48 条通过（target.log） |
| `pnpm run typecheck` / `typecheck:docs` / `packages/testing typecheck:browser` | 均通过（typecheck.log） |
| `pnpm run build`（含 preset / competence 重建） | 通过（build.log） |
| `pnpm run build:docs` | 通过，51 个静态页面，base=/（build-docs.log） |
| `pnpm --dir packages/testing exec playwright test --config playwright.timeline-progress.config.ts` | 44 条通过（docs 23 + example 21，含 dev 2、SSR 2、icon-visible 2）（playwright.log） |
| `pnpm test --maxWorkers=2` | 246 文件、2624 条通过（vitest.log） |
| `git diff --check` | 通过 |

截图已实际查看：Timeline 的基本、交替（彩色圆点与 16px 时钟）、标题三模式、titleSpan 三种、横向三模式、自定义图标、另一侧、等待中、语义化紫框；Progress 的线形五态、圆形三态、仪表盘缺口切换、分段、渐变线与 conic 圆、步骤条、步骤圆（滑块联动）、尺寸矩阵、数值位置九种、函数 styles 色相渐变、micro 圆。
