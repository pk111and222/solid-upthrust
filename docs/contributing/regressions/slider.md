# Slider 回归

状态：已验收（2026-09-21，源码工作区；全量套件采用 2 workers 通过，默认并行超时见下文）。保留 Checkbox、Radio、Switch、InputNumber 前序修改及接手时已有的 `.DS_Store` 改动。Node 22.22.0、pnpm 11.16.0、Solid / @solidjs/web 2.0.0-rc.0，未修改锁文件。

## 契约与修复

- 修复单值轨道宽度始终为零：单值从 min 填充到当前值，范围填充两端之间；水平、垂直、反向均按同一百分比换算。
- 整理 Slider 对共享数值机的调用，避免内部 core 和 Slider 重复通知；单值回调不再与无关 end 值排序。位置未变不发 change，结束拖动不再重复发 change；受控拒绝保持原值，onAfterChange 报告实际接受值。
- 范围 Home/End 与普通拖拽保持滑块身份并受另一端约束；两端重叠时可显式指定拖拽端，键盘/Tab 仍能展开。受控与初值按范围、边界、步长归一，不因外部 props 更新主动发事件。
- marksOnly 键盘改为沿相邻刻度移动，过滤无效/越界/重复刻度，等距选择较低刻度；step=null 保持连续模式。修复小数尾差、步长不能整除上限时越界、动态步长的中点舍入误差；无有效刻度和非法步长分别按文档回退。
- 默认值仅初始化一次，UI 不再在 memo 内重建状态机。单值 Form 字段接入数字回调，二元数组字段自动启用范围并回写数组；显式对应回调保留优先级。
- 拖拽跟踪开启会话的 pointerId，忽略其他指针；直接操作滑块时保留端点身份并聚焦。pointercancel、丢失捕获、窗口失焦、禁用和卸载取消会话，解除监听/捕获，不发完成事件。取消不回滚之前已接受的值。
- 键盘抬键/失焦补完成回调，连续 keydown 不重复报告完成；reverse 同时翻转方向键，Home/End 始终表示数值上下限。新增 headless cancelDrag/finishInteraction，以及 beginDrag 的可选端点参数，声明通过构建生成。
- id 接入外框、ref 在 untrack 中调用；新增 aria-label/aria-labelledby，范围默认区分起点/终点；ARIA 边界反映另一端约束，补方向信息。零刻度用字符串渲染，刻度点有真实 4px 尺寸。
- 浏览器发现焦点 ring-offset 缺少颜色，组合 box-shadow 变成 none；补主题 surface 色后验证焦点态阴影既非 none，也不同于未聚焦态，并实际查看截图。

## 能力映射

源码：`packages/competence/src/slider.ts`、`packages/components/lib/Slider/{index.tsx,styles.ts}`。继续使用共享 createNumericValue 的存储/门控路径，未修改 `selection.ts` 或其他消费者；该文件已有 Radio 轮次的改动完整保留。Slider/SliderProps/SliderMark 出口保持现状，无公开子组件。

文档：`docs/src/pages/components/data-entry/slider.tsx`、`slider-api.json`，覆盖 22 个公开 props（含两个可访问名称属性）。7 个 `docs/src/examples/slider/*.tsx` 独立示例，SSR 仅引用同文件 raw 源码，example 页面复用示例。

| 能力 ID / props | 示例 | 测试位置（packages/testing 下） |
| --- | --- | --- |
| slider.single / controlled / defaults.controlled：value/defaultValue、父层接受/拒绝与更新 | basic、controlled | L1 headless/Slider/slider.test.ts、interactions.test.ts；L3 render/Slider/contracts.test.tsx defaults.controlled；L4 controlled、drag |
| slider.range.bounds / drag.explicit：rangeValue/defaultRangeValue、相交约束、重叠端点 | range | L1 range.bounds、drag.explicit；L3 form.range；L4 range |
| slider.events / keyboard.finish：onChange/onRangeChange/onAfterChange、次数与结束时序 | basic、controlled、range | L1 events、single、controlled；L3 keyboard.finish；L4 drag、controlled |
| slider.numeric / numeric.fallback / dynamic：min/max/step/precision、自由模式、动态配置 | marks | L1 numeric、numeric.fallback；L3 dynamic；L4 marks |
| slider.marks.keyboard：marks/marksOnly、零标签、排序去重、邻近刻度 | marks | L1 marks 与 marks.keyboard；L3 dynamic；L4 marks 的标签/4px 圆点/指针和键盘 |
| slider.track.single / geometry：vertical/reverse、单值/区间轨道及滑块几何 | directions、range、basic | L1 percent/value 换算；L3 track.single、keyboard.finish；L4 geometry、range、drag |
| slider.gates / pointer.cancel / drag.cleanup：disabled、取消、指针隔离和卸载 | native、context | L1 gates（含 headless readonly）；L3 pointer.cancel、drag.cleanup（断言监听函数逐一解除）；L4 lifecycle 实际拖拽期间卸载 |
| slider.form.single / form.range：字段注入与显式回调优先 | context | L3 form.single、form.range；L4 form 提交数字/数组并重置 |
| slider.native / exports：id/class/style/ref、aria-label/aria-labelledby | native、basic、range | L2 smoke/Slider/exports.test.tsx；L3 track.single、form.range；L4 lifecycle、controlled 焦点环 |
| slider.dev / ssr：开发绘制、owner、SSR API 与源代码 | 文档全部示例 | L4 dev、ssr 原始 HTTP 响应 |
| shared numeric 使用路径 | Slider 内部依赖 | headless/shared/Selection/selection.test.ts 既有 28 条专项补验；完整共享能力仍留 B06/B08 |

L1 验证状态和方法；L2 验证出口/真实挂载/卸载；L3 验证 DOM、事件、字段和监听清理；L4 验证实际指针捕获、键盘、焦点和绘制。无网络或异步请求，不适用请求乱序测试；全局监听和响应式 effect 有 owner 清理。Form 只验本控件消费路径，不关闭完整 B02。

## 实际验证

| 命令 / 阶段 | 结果 |
| --- | --- |
| 原有 L1 基线 | 1 文件、23 条通过 |
| 首批新用例修复前 | 10 失败、24 通过，涵盖事件重复、单值回调、范围端点、刻度键盘、数值精度、受控/只读门控、轨道、Form 与默认值重建 |
| 零刻度和动态小数中点独立复现 | 各 1 条失败，修复后纳入目标全套通过 |
| `pnpm --dir packages/testing run test headless/Slider render/Slider smoke/Slider headless/shared/Selection/selection.test.ts` | 最终 5 文件、69 条通过；Slider 4 文件 41 条（L1 32、L2 1、L3 8），共享专项 28 条 |
| `pnpm test` 默认并行，两次 | 均为 155 文件通过、1 文件失败；1481 条通过、1 条超时，详见下文，不记为通过 |
| `pnpm --dir packages/testing run test render/_VirtualList/Selectors.test.tsx` | 该文件 5 条单独全部通过，测试执行约 2.24 秒 |
| `pnpm --dir packages/testing run test --maxWorkers=2` | 完整 L1–L3：156 文件、1482 条通过，28.72 秒；未过滤文件、修改断言或放宽 5 秒超时 |
| `pnpm run typecheck` | 最终源码和测试通过；首次读到旧生成声明的 3 个错误经正式构建后消除 |
| `pnpm --dir packages/testing run typecheck:browser` | 通过 |
| `pnpm run check:docs`，最终样式后 `pnpm run build:docs` | 类型与根路径静态构建通过，共 23 页；最新样式产物已重建 |
| `pnpm run build` | 最终 preset / competence / components / example 通过；既有 example 大 chunk 提示保留 |
| `pnpm --dir packages/testing exec playwright test --config playwright.slider.config.ts` | 最终整轮 16 条通过：docs 9（含开发与原始 SSR）、example 7；Chromium |
| `git diff --check` | 通过 |

**默认并行的已知失败：** `render/_VirtualList/Selectors.test.tsx` 的 `virtual-list.selector.2` 两次超过 5000ms，伴随 Select 既有的未追踪读取警告。Slider 及共享数值机专项均通过；单独运行该文件以及仅降低并行度的完整套件均通过，支持并发负载相关的判断，但未在本轮确认其内部性能根因。未修改 Select、虚拟列表源码、测试或 runner 设置。默认并行的稳定性仍归 `_VirtualList` / B09 / D06 后续跟踪，不能把本轮受限并行成功写成默认 `pnpm test` 已通过。

浏览器首轮 14 通过、2 失败；焦点样式持续断言重查后仍失败，确认 CSS 缺失而非取值时机。补 ring-offset 颜色后最终 16 条全过。开发检查明确排除 Slider 的 NO_OWNER_CLEANUP / STRICT_READ_UNTRACKED 提示；不代表其他控件无提示。

临时日志在本机 `/tmp/slider-regression/`：baseline、repro、zero-repro、dynamic-repro、fixed、target-final、types-final、browser-types-final、docs-final、docs-style、build-final、browser、focus-recheck、browser-final、full、full-recheck、virtual-list-recheck、full-bounded `.log`。截图在 `packages/testing/test-results/slider/`：已实际查看 docs/focus.png、docs/directions.png、example/marks.png，确认焦点环、填充方向、垂直几何及零刻度显示。日志与截图是临时证据，不是永久归档；浏览器 runner 已退出并清理自身服务。

## 边界

Slider 不提供 tooltip、整段范围拖动、超过两个滑块、原生 name/FormData 或 readonly UI prop。禁用用 disabled；headless readonly 保留全部写入门控。取消会话保留此前接受的值。垂直/反向由 props 明确控制，不自动从 dir=rtl 推断反向。

JavaScript Number 不保证任意精度；受控值也按边界/网格归一展示。core() 是底层数字机，不承诺直接调用能满足 Slider 的范围、刻度及完成事件协议；常规组合使用 Slider 方法。未承诺动态受控/非受控模式切换保留最后受控状态。

未改站点路由/base/SSR 框架，不重复双 base 通用套件；根路径静态正文、开发和生产示例均已验证。未验证 Firefox/WebKit、真实触屏设备、完整组件 SSR、独立安装消费者或发布流程；未提交、推送、部署或发布。下一项 Rate 尚未开始。
