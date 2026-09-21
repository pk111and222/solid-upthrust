# InputNumber 回归

状态：已验收（2026-09-21，源码工作区）。保留 Checkbox、Radio、Switch 前序全部未提交改动。Node 22.22.0、pnpm 11.16.0、Solid / @solidjs/web 2.0.0-rc.0、vite-plugin-solid 3.0.0-next.27，未改锁文件。

## 契约与修复

- 将已提交的 number/null 与编辑草稿分开。合法文本即时通知，空文本/单独负号通知 null，无法解析的中间文本保持旧值、失焦才提交 null；尾随小数点保留编辑形式。formatter 不再成为内部数值存储。清空及越界回调的原有用例通过，未将其误记为原实现失败。
- 修复受控步进显示父层未接受的值，以及聚焦期间外部更新后仍显示旧文本。外部值接受草稿后更新其基准，后续重置回初值也能丢弃旧草稿；父层拒绝手动输入时，编辑期间保留文本，失焦回到受控值。
- UI 状态机只创建一次，defaultValue 用 untrack 初始化，更新默认属性不会重建状态或改变焦点。ref 在原生 input 上调用，消除直接读取响应式回调的风险。
- 未指定 precision 时，失焦保留小数，整数步进也保留原有小数；科学计数法步长正确计算精度。显式 precision 在步进/失焦生效，舍入后再限制范围；偏移取操作前数值，onChange 后通知 onStep。
- disabled/readonly 阻止编辑、步进和失焦改值。IME 组合过程中不提交中间文本或执行方向键/Enter，组合结束后解析；程序 setValue 保留不受门控的赋值语义。
- 增减操作改用 type=button，带原生禁用与 aria-disabled，鼠标操作保留输入焦点、不提交表单。控件增加越界/error 的 aria-invalid；图标明确为 block；装饰及按钮分隔线改用逻辑方向样式。
- 示例 label 改为独立 for/id 关联。首轮浏览器发现包裹整个控件的 label 会把 increase/decrease 纳入输入名称，修复示例而非放宽精确名称断言。

## 能力映射

源码：`packages/competence/src/inputNumber.ts`、`packages/components/lib/InputNumber/{index.tsx,styles.ts}`。现有具名 InputNumber / InputNumberProps 出口不变，无公开子组件；parser/formatter 类型保留在组件子路径及 competence。声明由构建生成，未手改产物。未修改共享 Selection、Form 或数值工具。

文档：`docs/src/pages/components/data-entry/input-number.tsx`、`input-number-api.json`，覆盖全部 27 个公开 props。7 个独立 `docs/src/examples/input-number/*.tsx`，SSR 使用同文件 raw 源码，example 页面复用示例。

| 能力 ID / props | 示例 | 测试位置（packages/testing 下） |
| --- | --- | --- |
| input-number.controlled / controlled.reset / default.once：value/defaultValue、草稿、外部更新 | basic、controlled | L1 headless/InputNumber/inputNumber.test.ts、editing.test.ts；L3 render/InputNumber/contracts.test.tsx controlled.dom、default.once；L4 controlled、edit |
| input-number.commit.events / parser：清空、非法中间值、parser/formatter、失焦时序 | basic、format | L1 editing.test.ts commit.events、parser；L3 native；L4 edit、format |
| input-number.precision / step.events / options.dynamic：min/max/step/precision/shiftMultiplier/onStep | precision | L1 两个文件的步进、精度、动态配置用例；L3 native、bounds.dom；L4 step、edit |
| input-number.gates.dom / dynamic：disabled/readonly/controls | states、format | L1 dynamic、options.dynamic；L3 gates.dom；L4 paint、format |
| input-number.composition：输入法组合及键盘门控 | 基础输入 | L3 composition（CompositionEvent 模拟）；真实操作系统输入法未单独验证 |
| input-number.native：id/name/placeholder/ref/class/style/onFocus/onBlur/onPressEnter | native、basic | L3 native；L4 ref、form |
| input-number.form：字段数字/null、回调优先级、全局配置 | context | L3 form；L4 form 真实提交/重置及按钮焦点 |
| input-number.paint：size/status/prefix/suffix、图标、焦点环、RTL | states、format | L3 native、form；L4 paint、format、dev，真实尺寸与 CSS 断言 |
| input-number.exports.mount：组件/类型出口和卸载 | 全部 | L2 smoke/InputNumber/exports.test.tsx |
| input-number.ssr：API 与源码在初始 HTML 中 | 文档页 | L4 ssr 原始 HTTP 响应 |

L1 验证状态、方法和数值边界；L2 验证出口与挂载/卸载；L3 验证 DOM、事件和字段协议；L4 验证真实焦点、键盘、布局绘制及表单提交。没有网络、长按计时器、全局监听或异步请求，相关竞态不适用；新增受控同步 effect 随 owner 清理。B02 仅验证当前控件消费路径，不关闭整个共享能力。

## 实际验证

| 命令 / 阶段 | 结果 |
| --- | --- |
| 原有 L1 基线 | 1 文件、20 条通过 |
| 新 L1 修复前 | 4 条失败、22 条通过：受控步进显示、小数失焦、禁用后提交、无效草稿污染值 |
| 新 L3 修复前 | 5 条失败、1 条通过；其中 1 条为测试未计入共享字段回调的第二个 undefined 参数，已按真实协议修正，其余为实现缺陷 |
| IME / 受控聚焦重置独立复现 | 各 1 条失败，修复后纳入目标全套通过；定向运行排除的其他用例不计验收 |
| `pnpm --dir packages/testing run test headless/InputNumber render/InputNumber smoke/InputNumber` | 4 文件、36 条通过（L1 28、L2 1、L3 7） |
| `pnpm test` | 153 文件、1464 条通过 |
| `pnpm run typecheck` | 最终源码通过 |
| `pnpm --dir packages/testing run typecheck:browser` | 最终用例通过 |
| `pnpm run check:docs` | 最终类型与根路径静态构建通过，共 22 页 |
| `pnpm run build` | 最终 preset / competence / components / example 构建通过；既有 example 大 chunk 提示保留 |
| `pnpm --dir packages/testing exec playwright test --config playwright.input-number.config.ts` | 最终整轮 16 条通过：docs 9（含开发绘制与原始 SSR）、example 7；Chromium |
| `git diff --check` | 通过 |

首轮浏览器 11 通过、5 失败，均发生于包裹 label 带来名称差异，未到达相关尺寸断言；修正示例标签并包含最新受控同步修复后，完整 16 条通过。没有用截图或放宽断言接受错误。

本机临时日志在 `/tmp/input-number-regression/`：baseline、repro、dom-repro、composition-repro、reset-repro、fixed、target-final、types-final、browser-types-final、docs-final、build-final、browser、browser-final、full `.log`。截图在 `packages/testing/test-results/input-number/` 中 docs/example 的 paint 场景 states.png，两张均已实际查看：24/32/40px 尺寸层次、错误/警告边框、只读背景和 RTL 布局正常。截图中的“禁用”项已由测试切换为启用且数值为 7；原始禁用行为在此前断言。焦点环、图标 mask/尺寸和按钮列显现有独立 CSS 断言。日志/截图为临时证据，不是永久归档；runner 已退出并清理其服务。

## 边界

使用 JavaScript Number，不提供 stringMode 或任意精度数值。step 数组只是历史类型兼容，仍按步长 1，不表示离散可选值；无长按连续步进或滚轮步进。空值步进从 min 或 0 开始再应用步长，保持既有行为。不承诺与外部组件库特定版本完全兼容。

受控值本身不因范围 props 更新自动裁剪或通知；输入/失焦才提交意图。原生 name 提交显示文本，需要数值/null 请使用 Form。Enter 保留原生表单默认行为，onPressEnter 可由业务 preventDefault。未承诺动态受控/非受控模式切换保留最近受控值。前序记录中的 Form 生命周期提示仍归 C07/B01，本轮没有修改 Form 实现。

未改路由/base/SSR 公共框架，不重复双 base 通用套件；根路径构建、开发页面与生产 docs/example 均已覆盖。未验证 Firefox/WebKit、真实操作系统输入法、独立安装消费者或发布流程；未提交、推送、部署、发布。下一项 Slider 尚未开始。
