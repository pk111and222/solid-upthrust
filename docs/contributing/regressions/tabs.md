# Tabs 组件回归（C02）

状态：2026-09-17 本轮验收通过。范围为源码工作区、docs/example 与当前机器 Chrome；不代表发布包或 B04 全范围验收。

## 契约与必要性

Tabs 用 headless `createTabs`（无浮层，不依赖共享 `createTrigger`）管理选中态、拖拽排序与可编辑增删；UI 层负责视觉（滑动指示条、卡片边框结构）。保留 `Tabs`、`TabsProps`、`TabsItem`、`TabsIns`。

- 默认 `type="line"`、`size="middle"`、`tabPosition="top"`、`centered=false`、`destroyInactiveTabPane=false`。
- `activeKey` 存在时为受控模式，`onChange(activeKey)` 只报告切换请求；`defaultActiveKey` 只影响非受控实例的首次挂载值（缺省取第一个非禁用项）。切换到禁用项、不存在的 key 或当前已激活的 key 都是 no-op，不触发回调。
- `type="editable-card"` 隐式开启 `editable`（除非显式传入 `editable` 覆盖）；渲染关闭按钮（`closable !== false` 的项）与新增按钮（`!hideAdd`）。`onEdit(target, action)`：新增时 `target` 是原始 `MouseEvent`，删除时 `target` 是被关闭项的 key。items 归调用者所有，组件不直接修改传入数组。
- `draggable` 开启原生 HTML5 拖拽排序，或 `Alt+ArrowLeft`/`Alt+ArrowRight` 键盘排序；禁用项不可作为拖拽源或目标（`closable:false` 不受此限，仍可拖拽，只是不可关闭）。`onReorder(items, info)` 携带重排后的完整数组。
- `role="tablist"`/`role="tab"`/`role="tabpanel"`；`destroyInactiveTabPane=false`（默认）时非激活面板仍挂载，用 `display:none` 隐藏；为 `true` 时未激活面板整个不挂载。
- line 类型渲染滑动指示条（ink bar），随激活标签变化重新测量位置；card/editable-card 无指示条，激活卡片擦除朝向内容区一侧的边框以视觉融合。
- `ref` 暴露 `{ activeKey, setActiveKey, nextTab, prevTab }`；`nextTab`/`prevTab` 只在可用（非禁用）标签间移动。

## 基线与已复现问题

环境：Node 22.22.0、pnpm 11.16.0；锁文件 solid-js/@solidjs/web 2.0.0-rc.0、Vite 8.2.1、vite-plugin-solid 3.0.0-next.27、Vitest 4.1.10、Playwright 1.63.0。未升级依赖。

- 修改前：`headless/Tabs`、`render/Tabs` 共 2 文件 / 5 条通过；根类型检查通过。Tabs 此前完全没有 docs、example 复用模式（原 example 页面直接内联全部 demo，未拆分独立 CSR 示例文件）、专项浏览器配置。
- **[缺陷 1] 方向键切换后 DOM 焦点不跟随**：`createTabs.tabListRef` 的 `keydown` 处理器只调用 `nextTab()`/`prevTab()` 切换 `activeKey`，从未把 DOM 焦点移动到新激活的标签。这违反 WAI-ARIA APG 的 tabs 模式（roving tabindex 要求焦点跟随选中项移动）：键盘用户按方向键切到新标签后，紧接着按 Tab 键会因为焦点还停留在旧标签上而产生错误的 Tab 顺序观感。修复：在 UI 层 `index.tsx` 现有的"激活标签变化"`createEffect`（已经负责测量 ink bar）里追加逻辑——仅当焦点已经在标签栏容器内时（区分"键盘导航中"与"受控 activeKey 从页面其他地方更新"两种触发源，避免后者意外抢焦点），调用 `tabNodeRefs.get(key)?.focus()`。`render/Tabs/keyboard.test.tsx` 的 `[tabs.keyboard.focus-follows-active]` 用例修复前失败（`document.activeElement` 停留在旧标签），修复后通过；`browser/Tabs/interactions.spec.ts` 的 `[tabs.browser.keyboard-focus-follows]` 在真实浏览器复核。
- **[缺陷 2] tablist 容器本身占用独立 Tab 停靠点**：容器 `role="tablist"` 写死 `tabindex={0}`，与内部激活标签的 `tabindex={0}` 同时存在，产生两个可 Tab 到的停靠点——违反 WAI-ARIA APG "整个 tablist 只有一个 Tab 停靠点（当前激活标签）"的规范。修复：容器改为 `tabindex={-1}`。`render/Tabs/keyboard.test.tsx` 的 `[tabs.keyboard.single-tab-stop]` 用例修复前失败（读到 `'0'`），修复后通过；`browser/Tabs/interactions.spec.ts` 同一用例内联复核容器与两侧标签的 tabindex 组合。
- **[缺口 3] 没有 `ref`/`TabsIns` 命令式接口**：`packages/competence/src/tabs.ts` 早就导出了 `TabsIns` 类型和 `refs` 对象（`{activeKey, setActiveKey, nextTab, prevTab}`），但 UI 层 `TabsProps` 从未声明 `ref` prop，也从未调用 `props.ref?.(tabs.refs)`——这个能力在 headless 层完整存在却在 UI 层完全不可达，属于集成缺口而非设计遗漏。与 Button/Skeleton/Tooltip 回归时发现的同类"headless 有能力、UI 层忘记接线"问题一致。修复：`TabsProps` 增加 `ref?: (val: TabsIns) => void`，组件体 `untrack(() => props.ref?.(tabs.refs))`；`export type { TabsIns } from 'upthrust-competence'`；根 `lib/index.ts` 补充导出。`smoke/Tabs/exports.test.ts`、`render/Tabs/lifecycle.test.tsx` 的 `[tabs.lifecycle.ref]` 验证；`browser/Tabs/interactions.spec.ts` 的 `[tabs.browser.ref]` 在真实浏览器复核。

以上 3 项修复前均有对应失败用例复现（headless 逻辑本身无缺陷，问题都在 UI 层集成），修复后全部转绿；未使用 skip/any/放宽断言掩盖。

### 用户回归验收时发现的第 4 项缺陷（2026-09-17 补充）

用户人工检查"可编辑页签与拖拽排序"demo 时报告：看不到新增按钮的"+"图标，但点击该位置仍能触发新增。这条在本轮四层测试和首次 Playwright MCP 交互验证中都未捕获——happy-dom 不做真实布局计算，L3 render 测试只能断言 DOM 结构/属性存在，看不出图标视觉塌缩；首次交互验证用 `browser_snapshot`/`browser_find`（可访问性树）核对，这类工具不反映真实几何渲染。

- **[缺陷 4] 新增按钮图标不可见但可点击**：新增按钮的 class 是 `"shrink-0 p-2 border-0 bg-transparent ..."`，缺少 `inline-flex`；对照关闭按钮的 class `"ml-2 p-0 inline-flex border-0 ..."` 有这个类。图标 `<span class="i-mdi-plus" />` 因此停留在浏览器默认的 `display: inline`——CSS 规范里 `display: inline` 的盒子**忽略** `width`/`height` 属性，即使 UnoCSS 生成的图标规则里写了 `width: 1em; height: 1em`（用 `getComputedStyle` 能读到这两个值），最终渲染盒子仍然是 0×0，完全不可见；而按钮元素本身的 `<button>` 盒子尺寸不受影响（`padding` 撑出了可点击区域），所以点击仍然命中。关闭按钮因为父级是 `inline-flex` 容器，其图标子元素被 CSS Flexbox 的 "blockification" 规则强制变成 `display: block`，`width`/`height` 因此生效、正常可见——这也是两个视觉上几乎一样的图标按钮，一个正常一个隐形的根本原因。用 `browser_evaluate` 直接读取 `getBoundingClientRect()` 与 `getComputedStyle().display` 确认（`inline` + `{w:0,h:0}` vs `block` + `{w:14,h:14}`），并逐条比对两者的 UnoCSS 生成规则文本排除了图标规则本身的差异（两条规则结构完全一致，问题只在父容器的 flex 布局）。修复：新增按钮补上 `inline-flex`。新增 `browser/Tabs/interactions.spec.ts` 里 `[tabs.browser.editable]` 用例开头的图标包围盒断言（`boundingBox().width/height > 0`），这是一个只有真实浏览器布局才能验证的契约，L1–L3 均不适用；已用 Playwright MCP 截图复核视觉效果，"+" 清晰可见。

**方法论教训（已用于本文档结构，供后续参考）**：真实浏览器交互验证如果只用可访问性树类工具（`browser_snapshot`/`browser_find`），会漏掉"元素存在、可点击，但视觉不可见"这类缺陷——因为这类缺陷不改变可访问性树结构，只影响像素渲染。此类回归的正确核实手段是 `browser_evaluate` 直接读取 `getBoundingClientRect()`/`getComputedStyle()`，必要时用 `browser_take_screenshot` 肉眼确认；这条已经补充到 Playwright MCP 交互验证的标准做法里，后续物料回归的"看起来正常"结论不能只靠快照工具。

### Playwright MCP 交互验证中的一次误判（记录以警示后续复核方式）

用 Playwright MCP 的 `browser_find` 工具核对"可编辑页签"demo 状态时，一度看到输出里混入了"新页签 3"/"新页签 4"等本次操作从未产生过的标签，怀疑是页面状态污染或未清理的多实例。经排查：`browser_find` 返回的是对可访问性树的模糊文本匹配片段，同一次调用可能拼接展示多个不同时间点/不同上下文的匹配结果，容易造成"当前只有一份 DOM 却像是看到了历史快照叠加"的错觉。改用 `about:blank` 强制导航后再访问目标页（确保客户端路由不复用旧组件状态）+ `browser_evaluate` 直接查询真实 DOM（而非依赖 `browser_find`/`browser_snapshot` 的可访问性树渲染）复核，确认是干净的初始状态，新增/关闭/键盘排序/固定页签保护全部行为正确，不是缺陷。教训：真实浏览器交互验证若结果反直觉，优先用 `browser_evaluate` 查询确定性的 DOM 事实，不要仅凭一次 `browser_find`/`browser_snapshot` 的渲染结果下结论。

另外，用合成 `dispatchEvent(new KeyboardEvent(...))` 触发 `Alt+ArrowRight` 键盘排序一度"看起来没反应"，改用 Playwright 的 `page.keyboard.press('Alt+ArrowRight')`（真实、受信任的键盘事件）后立即生效——合成事件在这类场景下不可靠，后续人工诊断浏览器键盘交互应优先用 `page.keyboard.press` 而非手工构造 `KeyboardEvent`。

### 已知、非本轮引入的共享噪音

Tabs 页面同样打印 `[STRICT_READ_UNTRACKED] Reactive value read directly in <Tabs>` / `in an effect callback` 警告。与 Dropdown/Tooltip/Popover 记录中分析的共享 Trigger 噪音不同源——Tabs 不使用 `createTrigger`，这里的来源是 Tabs 自身两个 `createEffect` 的效果体内部对 `tabs.activeKey()`/`items()` 等信号的裸读（例如 ink bar 测量回调）。实测未发现对应可观察行为缺陷；记为后续 B01 Solid 上下文与生命周期完整回归的待查项，不在本轮范围内修复。

## 能力与文件映射

源码：`packages/components/lib/Tabs/{index.tsx,styles.ts}`、`packages/competence/src/tabs.ts`（未改动，仅补 UI 层集成）。
公共 UI 导出：`packages/components/lib/index.ts`（新增 `TabsIns`）。

| 能力 ID | L1 | L2 | L3 | L4 |
| --- | --- | --- | --- | --- |
| tabs.editable.* / tabs.reorder（既有） | headless/Tabs/tabs.test.ts | — | render/Tabs/Tabs.test.tsx（既有综合文件，未拆分） | — |
| tabs.keyboard.focus-follows-active / single-tab-stop | — | — | render/Tabs/keyboard.test.tsx | browser/Tabs/interactions.spec.ts |
| tabs.switching.click / disabled / controlled / icon | — | — | render/Tabs/switching.test.tsx | browser/Tabs/interactions.spec.ts |
| tabs.appearance.ink-bar / editable-add-button / hide-add / position / centered / size / ink-bar-measures | — | — | render/Tabs/appearance.test.tsx | browser/Tabs/interactions.spec.ts（ink-bar、card-no-ink-bar） |
| tabs.lifecycle.destroy-inactive / ref / unmount-cleanup | — | — | render/Tabs/lifecycle.test.tsx | browser/Tabs/interactions.spec.ts（ref） |
| tabs.mount.basic / dynamic | — | smoke/Tabs/mount.test.tsx | — | — |
| tabs.exports.types | — | smoke/Tabs/exports.test.ts | — | — |
| tabs.browser.editable（新增/关闭/固定页签保护/键盘排序）/ dev | — | — | — | browser/Tabs/interactions.spec.ts |

既有 `render/Tabs/Tabs.test.tsx` 综合文件（可编辑新增删除、原生 drag/drop 重排）保留，未按本次拆分规则重写；后续回归到这两条能力时再拆分。

## 验证记录（执行后更新）

| 命令 | 结果 |
| --- | --- |
| `pnpm --dir packages/testing run test headless/Tabs render/Tabs`（修改前，缺陷复现） | 2 条失败（keyboard focus-follows、single-tab-stop） |
| `pnpm --dir packages/testing run test smoke/Tabs render/Tabs headless/Tabs`（修复后新增用例） | 8 文件 / 31 条通过 |
| 最终全量 `pnpm test` | 127 文件、1337 条通过 |
| `pnpm run typecheck` / `pnpm --dir packages/testing run typecheck:browser` | 均通过 |
| `pnpm run build`（三个生产包 + example） | 通过；example 保留既有大 chunk 提示 |
| `pnpm run check:docs`（typecheck:docs + build:docs） | 通过；15 页面预渲染（新增 Tabs 导航页） |
| `pnpm run test:docs:browser`（双 base，路由/菜单新增触发） | 13 条通过（根路径 + `/solid-upthrust/`） |
| Playwright MCP 交互验证（`http://127.0.0.1:4173/components/navigation/tabs/`） | 方向键焦点跟随、单一 Tab 停靠点、禁用跳过、受控 activeKey、编辑新增/关闭/固定页签保护/键盘排序全流程——均通过（含上述误判排查记录） |
| `pnpm --dir packages/testing exec playwright test --config playwright.tabs.config.ts`（docs + example 双项目，含缺陷 4 修复后回归） | 15 条通过，重复跑两次均稳定 |
| `git diff --check` | 通过（无输出） |
| 缺陷 4 修复后全量 `pnpm --dir packages/testing run test` | 127 文件、1337 条通过；另有 1 条 `render/_VirtualList/Selectors.test.tsx` 用例在满载并行下超时抖动（单独运行稳定通过），与 Tabs 改动无关，不在本次范围内处理，如实记录不掩盖 |

## 添加图标对齐修复（2026-09-17）

- 可编辑/拖拽示例中添加按钮被页签栏拉高，inline-flex 未指定对齐，图标垂直中心偏上 8px。
- 仅给添加按钮补 `items-center justify-center`；既有 editable 示例直接覆盖修复，无 API 变化。
- `tabs.browser.dev.add-icon-center` 修复前失败（偏差 8px）；修复后通过。生产 docs/example 的 editable 流程也补充双轴中心偏差不超过 1px 的几何断言。
- 最终 Tabs Playwright 16 条通过，包含开发页面及生产 docs/example；全量 127 文件、1337 条通过；根类型与浏览器类型通过。
- components、example、docs 构建通过；`git diff --check` 通过。未重复站点双 base 或其他物料全量浏览器验收。

## 未决边界

完整 B01（含 STRICT_READ_UNTRACKED 噪音溯源）、完整 B06 Selection/Drag（Tabs 的拖拽排序是既有 B06 待办范围的一部分消费方）、Firefox/WebKit、屏幕阅读器认证、发布包全新消费者安装、tree shaking、Tabs 与 Skeleton 组合验证（依赖链 `Skeleton + Tabs → Card`，属于后续 C12 范围）仍不在本次完成声明内。当前不支持标签溢出滚动/更多菜单、拖拽排序的触摸设备回退、关闭确认对话框；这些是既有范围决议，不是本轮遗漏。若任何适用验收未运行，TODO 保持未勾选；不据用例存在宣称通过。
