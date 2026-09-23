# Select 回归记录

日期：2026-09-21、2026-09-22、2026-09-23。范围：C05 Select；当前工作区 `main`，未改锁文件，保留既有 `.DS_Store` 修改。状态：已验收（含用户反馈补验）。2026-09-23 弹层新增默认内容优先且不小于选择器、显式 `style.width` 优先策略；本轮相关三组件 L1–L3 结果见 [TreeSelect 回归记录](tree-select.md)，未重跑浏览器。本记录按当前实现核对，不宣称与其他组件库完全兼容。

## 能力与交付映射

| 能力 ID / 公开属性 | 源码与示例 | 验证层与结果 |
| --- | --- | --- |
| `select.value.selection`：`value/defaultValue/options/mode/labelInValue`、`onChange/onSelect/onDeselect`、受控拒绝与动态模式 | `competence/src/select.ts`、`selection.ts`；`example/src/pages/Select.tsx`；`docs/src/examples/select/basic.tsx`、`multiple.tsx`、`tags.tsx` | L1 `headless/Select/select.test.ts`、`dynamic.test.ts`；L3 `render/Select/selection-integration.test.tsx`、`contracts.test.tsx`；L4 `browser/Select/interactions.spec.ts` |
| `select.search.active`：`showSearch/filterOption/onSearch/notFoundContent`、方向键/Enter/Escape、自由标签 | 同上；docs `search.tsx`、`tags.tsx` | L1 `select.test.ts`、`dynamic.test.ts`；L3 `contracts.test.tsx`；L4 搜索、键盘、tags 场景 |
| `select.popup.lifecycle`：`open/defaultOpen/onOpenChange/dropdownRender`、Portal 隐藏态、焦点计时器清理 | `components/lib/Select/index.tsx`；docs `advanced.tsx` | L1 `select.test.ts`；L3 `contracts.test.tsx`；L4 受控浮层、自定义菜单、单选关闭和 Escape |
| `select.virtual.list`：`virtual/listHeight/listItemHeight` | `_VirtualList` 使用路径；docs `virtual.tsx` | L3 `render/_VirtualList/Selectors.test.tsx`；L4 大列表 DOM 上限、远端滚动与选择 |
| `select.visual.form`：`disabled/size/status/loading/placeholder/maxTagCount/maxTagPlaceholder/allowClear/id/name/class/style/ref/aria-label/aria-labelledby`、Form.Item | `components/lib/Select/{index.tsx,styles.ts}`；docs `context.tsx`、`variants.tsx`、`multiple.tsx`；`select-api.json`、`select-option-api.json` | L2 `smoke/Select/exports.test.tsx`；L3 `contracts.test.tsx`；L4 清空按钮、尺寸/状态绘制、真实 Form 提交重置与开发模式 |
| `select.group.options`：嵌套组选项、平铺 `group`、过滤后的组标题、选择与键盘索引 | `competence/src/select.ts`、`components/lib/Select/index.tsx`；example 分组段；docs `grouped.tsx` | L1 `headless/Select/groups.test.ts`；L2 公开选项类型 `smoke/Select/exports.test.tsx`；L3 `render/Select/groups.test.tsx`；L4 `browser/Select/interactions.spec.ts` 分组场景 |
| `select.popup.width` 与 `select.search.visible`：弹层默认等宽并随尺寸变化、单选搜索文字可见 | `components/lib/Select/{index.tsx,styles.ts}`；docs `basic.tsx`、`search.tsx` | L1 不适用 DOM 几何/绘制；L2 挂载由 `smoke/Select/exports.test.tsx` 覆盖；L3 搜索值由 `render/Select/contracts.test.tsx` 覆盖；L4 浏览器 width/search 场景测量宽度和计算样式 |
| `select.clear.layout`：受控值清空、普通叉替代箭头、多选等距及空 tags 左侧光标 | `components/lib/Select/{index.tsx,styles.ts}`；docs `basic.tsx`、`search.tsx`、`multiple.tsx`、`tags.tsx` | L1 不适用 DOM 几何，headless 清空行为由 `headless/Select/select.test.ts` 覆盖；L2 公开入口沿用 `smoke/Select/exports.test.tsx`；L3 `render/Select/contracts.test.tsx` 受控及 Form 清空；L4 `browser/Select/interactions.spec.ts` basic/search-clear/multiple-clear/spacing/tags-caret 场景 |
| `select.suffix.size`：下拉、加载、清除共用右侧尺寸区域；小/中/大为 20/24/28px | `components/lib/Select/{index.tsx,styles.ts}`；docs/example `variants.tsx` | L1 不适用绘制尺寸；L2 公开入口沿用 `smoke/Select/exports.test.tsx`；L3 happy-dom 不验证真实尺寸；L4 `browser/Select/interactions.spec.ts` suffix-size 场景检查区域与图形的浏览器几何及计算样式 |

Select 无公开子组件。`SelectProps`、`SelectOption`、`SelectOptionEntry`、`SelectOptionGroup`、`SelectLabelInValue`、`SelectChangeValue` 由 UI 根入口导出；headless `SelectConfig` 的 `onChange` 已修正为实际联合类型。L1 不验证 DOM，L2 验证公开入口/挂载，L3 验证属性与事件，L4 验证真实点击、焦点、滚动和绘制；没有复制四层完整排列。所有本轮新增用例与既有 Select L1 用例均有中文备注。

## 修复与契约

- 单选选项提交由 UI 同步关闭 Trigger；headless 机器不再重复发 `onOpenChange`。关闭后的 Portal 列表设置 `aria-hidden`/`inert`，combobox 指向有效 listbox/候选 ID。
- 搜索输入的键盘事件不再向外层重复冒泡；内层清空/标签按钮使用原生按钮并拦截点击，避免 Trigger 的原生监听吞掉事件或误开弹层。列表容器统一处理原生点击，修复 Portal 位于真实 Form.Item 内时选项点击未写回字段。
- Form.Item 的 `onChange` 接入选值，显式回调仍只接收单个值参数；增加 `aria-label/aria-labelledby`、错误状态 `aria-invalid`、`name` 隐藏输入和 loading 图标。`filterOption=false` 在 UI 公开类型中可用。
- 共享 Selection 的选择上限与可取消条件可从 getter 动态读取，支持 Select 运行中切换单选/多选；失效的键盘候选不能提交。自由标签重复输入不会取消已选项；对未选中或禁用键的移除不产生伪变更。
- `example` 补受控浮层、远端搜索式过滤、自定义菜单、Form 提交/重置、状态、事件与选项分组；docs 新增独立 SSR 页面、十二个独立 CSR 示例和完整 Select/Option API 表，源码区均读取示例文件的 `?raw`。

## 2026-09-22 用户反馈补验

- 失败测试先复现三项问题：弹层宽度未对齐、搜索输入有值却因 `opacity-0` 不可见、分组数据没有标题。修复后用 ResizeObserver 更新浮层宽度；单选搜索时显示输入文字；headless 归一化嵌套组，UI 在可见组选项前绘制标题，虚拟列表与活动项索引一起调整。组标题用 `role=separator` 暴露名称；组件卸载时清理观察器。
- 参考 [Ant Design 6 Select 文档](https://ant.design/components/select/) 的基础、分组、联动、异步搜索、labelInValue、虚拟列表及自定义下拉案例。本库新增 docs 分组、联动、模拟异步搜索和对象值示例，原有八例继续保留。当前库不提供公开 Option/OptGroup 子组件、`popupMatchSelectWidth` 开关、`optionRender` 或 `tokenSeparators`，页面已列出这些差异。模拟请求按最新查询更新并在卸载时清理计时器，实际网络接入仍由调用方实现。
- `pnpm test`：168 文件、1524 条通过；`pnpm run typecheck`、`pnpm run test:docs`、`pnpm run build`、`pnpm run check:docs`、`git diff --check` 均通过；Select Chromium 专项 docs/example 共 29 通过、3 个仅用于 docs 的案例在 example 项目按预期跳过。宽度、输入文字和分组测试在 docs 与 example 两侧均通过。

## 2026-09-22 清空与间距补验

- 新浏览器断言先复现：清空按钮实际仅 12px，箭头仍占据右侧；多选左右 padding 为 4px，单选为 11px；空 tags 输入框距离左边约 170px。随后测试进一步暴露受控 `value` 写回 `undefined` 后，headless 退回上一次值，导致 docs 单选清空后 UI 未消失。
- 清空按钮改为 24px 普通叉，有值时替代箭头；单选输入覆盖层之上的后缀区域可点击。显式 `value` 与命名 Form.Item 在值为 `undefined` 时传入空选集，保证父层接受清空后 UI 同步，仍保留父层拒绝变更时的受控契约。多选水平 padding 继承尺寸样式；空 tags 打开时隐藏占位文字，使输入从左侧开始。
- `pnpm test`：168 文件、1525 条通过；`pnpm run typecheck`、`pnpm --dir packages/testing run typecheck:browser`、`pnpm run test:docs`、`pnpm run build`、`pnpm run check:docs`、`git diff --check` 均通过。Select Chromium 专项 docs/example 为 37 通过、3 个 docs 专属案例在 example 项目按预期跳过。目标浏览器用例的失败复现及修复后结果分别保存在 `/tmp/select-feedback-repro.log`、`/tmp/select-caret-repro.log`、`/tmp/select-feedback-target-browser.log`、`/tmp/select-feedback-browser-full.log`；构建日志为 `/tmp/select-feedback-build.log`、`/tmp/select-feedback-docs.log`。

## 2026-09-22 右侧图标尺寸补验

- 浏览器测试先复现小尺寸下拉图标区域只有 10px；改为清除、下拉与加载共享同一后缀区域。尺寸 small/middle/large 分别为 20/24/28px，图形本身分别为 14/16/18px；切换状态时右侧宽度稳定。加载动画的图形尺寸读取计算样式，避免旋转造成的外接矩形波动。
- docs/example 的尺寸演示补可清空的小、大尺寸，example 补中尺寸；文档 API 写明尺寸规则。`pnpm test` 168 文件、1525 条通过；根类型与浏览器类型、docs 测试、根构建、docs 构建通过；Select Chromium 专项 39 通过、3 个 docs 专属案例在 example 项目按预期跳过。失败复现与最终浏览器日志分别为 `/tmp/select-suffix-repro.log`、`/tmp/select-suffix-target-browser.log`、`/tmp/select-suffix-browser-full.log`；构建日志为 `/tmp/select-suffix-build.log`、`/tmp/select-suffix-docs.log`、`/tmp/select-suffix-example.log`。

## 实际验证

| 命令 | 结果 |
| --- | --- |
| 基线 `pnpm --dir packages/testing run test headless/Select render/Select` | 修改前 2 文件、30 条通过；新增失败测试先复现单选不关闭、搜索键盘重复处理、Form 不回写、按钮不可访问、动态模式/候选/标签问题 |
| `pnpm --dir packages/testing run test headless/Select smoke/Select render/Select headless/shared/Selection render/_VirtualList/Selectors.test.tsx` | 9 文件、83 条通过 |
| `pnpm test` | 168 文件、1525 条 L1–L3 通过；默认并行本轮通过 |
| `pnpm run typecheck`、`pnpm --dir packages/testing run typecheck:browser` | 通过 |
| `pnpm run test:docs` | 2 文件、28 条通过 |
| `pnpm run build` | 通过；保留 example 既有 500 kB 大 chunk 提示 |
| `pnpm run check:docs` | 类型与静态构建通过，根路径预渲染 26 页 |
| `pnpm --dir packages/testing exec playwright test --config=playwright.select.config.ts` | docs/example Chromium 专项 39 条通过，3 条 docs 专属案例在 example 项目跳过；根路径生产站点与开发绘制均覆盖 |
| `git diff --check` | 通过 |

首轮日志：`/tmp/select-target.log`、`/tmp/select-full-test-final.log`、`/tmp/select-build-final.log`、`/tmp/select-docs-final.log`、`/tmp/select-docs-test.log`、`/tmp/select-browser-final.log`。二次构建与浏览器日志：`/tmp/select-build-current.log`、`/tmp/select-docs-current.log`、`/tmp/select-browser-current.log`。专项浏览器由 Playwright 启动并关闭临时本地服务，未创建远端部署或提交。

## 边界与后续

- 已选键从 `options` 消失时值仍由调用方管理。`loading` 只显示图标；远端搜索与异步竞态由调用方负责。`name` 的隐藏输入用于原生 FormData，多选生成同名值；禁用时不提交。
- 开发模式仍输出 Select/共享 Trigger 的 `STRICT_READ_UNTRACKED` 提示；既有 Tooltip/Popover 记录将共享来源留给 B04，Select 本轮交互、动态更新与卸载未见对应可观察失败。B01/B04 的完整严格响应式审计仍待办，不能将提示写作已消除。
- A05 干净消费者安装、D03 多弹层组合、D05 Firefox/WebKit 与屏幕阅读器、D06 长期性能/并发基线、完整 B02/B06/B07、正式发布与实际部署均不在本物料结论内，保持原 TODO 待办。docs 通用双 base 套件未重跑：本轮没有修改路由、base、SSR 边界或站点公共框架；目标页面根路径静态/开发浏览器检查已经执行。

## 2026-09-23 清除图标切换补验

- Select 与 Cascader、TreeSelect 共用清空后的 120ms 箭头出现延迟；选中时仍立即显示清除按钮，避免两个图标同时可见。L3 断言清空后箭头先保持隐藏、延迟后出现。
- 全量 L1–L3 180 文件、1585 条通过；Select Chromium docs/example 专项 39 条通过、3 条原有跳过项。根及 docs 类型检查与构建通过。浏览器日志：`/tmp/solid-upthrust-select-browser-full-20260923.log`。
