# Checkbox 回归

状态：已验收（2026-09-20，源码工作区，含 CheckboxGroup）。接手工作树干净；Node 22.22.0、pnpm 11.16.0、Solid / @solidjs/web 2.0.0-rc.0、vite-plugin-solid 3.0.0-next.27，未改依赖或锁文件。

## 契约与修复

- Checkbox checked 与 CheckboxGroup value 分别支持受控、非受控、Form.Item 注入；defaultChecked/defaultValue 仅初始化一次。移除 UI 中包裹状态机的 createMemo，并用 untrack 读取初值，避免更新默认值重新创建状态机。
- 原生激活后同步 checked/indeterminate，修复父层拒绝受控更新时 DOM 漂移；补齐原生 indeterminate 属性。半选仅展示，不改变 checked 运算。
- 重复状态和禁用事件不报告回调；组禁用与单项禁用叠加，不能通过子项 disabled=false 绕过。headless checkAll/clearAll 在整组禁用时不操作；单项禁用时保留其选中状态。
- 组 name 传给参与选择的 input，子项显式 name 优先；值为 0 有效，数字与字符串严格区分。skipGroup / 无 value 的子项独立工作。子项事件与组事件各报告一次。
- Form 字段 ID 放在组容器，不重复注入到每个组内 input。共享 useFormItem / useComponentProps 未改；B02 只验证本控件用到的值、回调、禁用、ID 与显式覆盖，不代表完整 Form 验收。
- input 放到可视方框之前，使 peer 焦点/悬停选择器生效；移除与半选冲突的 peer-checked 填充。勾选图标显式 block；禁用勾选使用禁用颜色；透明原生输入覆盖标签区域，保留键盘和点击行为。
- ref 调用明确 untrack，修复该路径开发环境裸读警告。Checkbox/CheckboxGroup 公开命名导出和类型已齐全，不增加静态 Checkbox.Group。
- 修正旧 example 全选判断包含禁用项、基础与全选共用状态的问题，改为复用 6 个独立客户端示例。

## 能力映射

源码：`packages/competence/src/checkbox.ts`、`packages/components/lib/Checkbox/{index.tsx,styles.ts}`；类型文件由生产构建生成，无手改产物。文档：`docs/src/pages/components/data-entry/checkbox.tsx`、两份 API JSON；示例：`docs/src/examples/checkbox/*.tsx`，SSR 仅引用同文件 `?raw`，example 页面复用示例。

| 能力 ID / 公开属性 | 示例 | 验证位置（packages/testing 下） |
| --- | --- | --- |
| checkbox.controlled / uncontrolled / dynamic：checked/defaultChecked/onChange、同值与禁用门禁 | basic、controlled、confirmation | L1 headless/Checkbox/checkbox.test.ts 状态/切换/dynamic；L3 render/Checkbox/contracts.test.tsx controlled、uncontrolled；L4 browser/Checkbox/interactions.spec.ts controlled |
| checkbox.native：indeterminate、id/name/value、ref、children、class/style | basic、controlled | L3 native；L4 paint、controlled、dev（焦点、16px 方框、1px 边框、真实图标遮罩） |
| checkbox.group.disabled / config：组和选项 disabled、动态切换、全局默认与显式 false | group、context | L1 group disabled / bulk-disabled；L3 group.disabled、group.config、form；L4 group、form |
| checkbox.group.children / membership：value=0、skipGroup、无 value、子项事件、动态退出 | children | L3 group.children、group.membership；L4 children |
| checkbox.group.dynamic / controlled-dynamic：value/defaultValue/options/name、动态选项与默认值、class/style | group、children | L1 controlled-dynamic；L3 group.dynamic、group.children；L4 group |
| checkbox.group.bulk：checkAll/clearAll、isChecked/isDisabled、isAllChecked/isIndeterminate/options | group（UI 由受控数组实现全选，未开放实例方法） | L1 checkAll / clearAll / bulk / bulk-disabled / controlled-dynamic |
| checkbox.form：字段值/回调/id/disabled 注入与显式覆盖 | context | L3 form；L4 form（真实 Form 写入并提交布尔和数组） |
| checkbox.exports.mount：命名导出、Props/Option 类型、挂载/ref/卸载 | 全部 | L2 smoke/Checkbox/exports.test.tsx；根类型检查、生产 example 挂载 |

L1 验证状态契约，无 CSS；L2 仅最小挂载与公开类型；L3 不代替真实绘制；L4 检查集成、焦点和布局，不重复全部逻辑排列。组件没有异步请求、计时器或全局监听，竞态与这些资源清理不适用；mount/root 均显式销毁。没有承诺与外部库某版本完全兼容。

## 实际验证

| 命令 / 阶段 | 结果 |
| --- | --- |
| `pnpm --dir packages/testing run test headless/Checkbox` 初始基线 | 1 文件、17 条通过 |
| 新回归用例修复前运行 | 8 条失败，见 repro.log；包含受控、默认值、半选、组禁用/回调、Form 集成及批量禁用 |
| `pnpm --dir packages/testing run test headless/Checkbox smoke/Checkbox render/Checkbox` | 3 文件、31 条通过 |
| `pnpm test` 最终全量 | 141 文件、1409 条通过 |
| `pnpm run typecheck` | 通过 |
| `pnpm --dir packages/testing run typecheck:browser` | 通过 |
| `pnpm run check:docs` | 文档类型与根路径静态构建通过，共 19 页 |
| `pnpm run build` | preset / competence / components / example 通过；已有 example 大 chunk 提示保留 |
| `pnpm --dir packages/testing exec playwright test --config playwright.checkbox.config.ts` | 最终 12 条通过：docs 7（含开发绘制和原始 SSR），example 5；Chromium |
| `git diff --check` | 通过 |

临时日志保留在本机 `/tmp/checkbox-regression/`：baseline、repro、fixed、target、full、types、browser-types、docs、build、browser 的 `.log`。截图在 `packages/testing/test-results/checkbox/Checkbox-interactions--che-c780d-keyboard-and-state-painting-{docs,example}/states.png`，两张均实际查看：选中勾、半选方块、禁用颜色和焦点环正常。浏览器 runner 已退出并清理自身服务。

## 边界与交接

本轮未改站点路由/base/SSR/公共框架，不重复双 base 通用套件；新增页面由根路径构建、原始 HTML 与专项浏览器验证。未做 Firefox/WebKit、独立安装消费者、完整 SSR、部署或发布，仍归 A/B/D。

开发页保留一条来自 Form 的 STRICT_READ_UNTRACKED 提示，日志明确标记 `<Form>`；Checkbox 自身提示已消除。Form 交互和提交通过，此提示留给 C07/B01 审计，不扩展修复无关 Form 源码。

仅完成 Checkbox 与 CheckboxGroup，不自动开始 Radio。TODO 中 C04 批次与完整 B02 保持未完成。

## 用户反馈补验：确认和聚焦示例

用户指出旧“等待确认”点击没有可见反馈，“聚焦同意”用途不明确。原示例固定 checked=false，仅累计请求，没有确认入口；属于示例交互缺口。

- controlled 示例保留正常受控切换与 ref，按钮改名“聚焦复选框”，说明只移动焦点、之后按空格切换；显示中文勾选状态。
- 新增独立 confirmation 示例：请求反馈（aria-live）、确认变更、取消变更；确认前保持原 checked，确认后父层更新，取消不改变状态。
- L4 增加确认/取消/反向取消勾选流程，并验证点击标签、Tab 到聚焦按钮、空格移焦、再次空格勾选的完整顺序。
- 补验 `check:docs`、example build、根 typecheck、browser typecheck、diff check 均通过。生产源码未再修改，复用此前 1409 条全量与生产包构建证据。
- 更新后的 14 个浏览器场景：首轮 12 通过，2 条在点击文本 span 时被其上方透明 input 拦截（测试定位问题）；改为点击包含该 input 的 label，未使用 force 或弱化断言，`--last-failed` 的 docs/example 两条均通过。最终 14 个场景均有通过证据。
- 补验日志：`/tmp/checkbox-regression/{docs-followup,example-followup,types-followup,browser-types-followup,browser-followup,browser-followup-retry}.log`。
