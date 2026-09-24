# 全仓库回归 TODO（临时执行台账）

> 所有参与回归的 agent 先读本文件。按用户最新要求：**先执行组件回归 C，再执行工程 A、共享能力完整验收 B，最后组合与发布 D**。
> C 的具体依赖仍须在使用前验证；不能因调整阶段顺序跳过必要的 A/B 前置检查。
> 本文件保留到全部事项验收完成；最终将证据归档后删除本文件及 AGENTS.md 中的临时入口。没有做完不得提前删除。

## 0. 接手入口与当前状态

先读：

1. [AGENTS.md](AGENTS.md)（规范入口）与 [AI 工作流](docs/contributing/ai-workflow.md)。
2. [测试规范](docs/contributing/testing.md)、[测试工作区](packages/testing/README.md)。
3. [交付清单](docs/contributing/feature-checklist.md)、[能力映射模板](docs/contributing/templates/feature.md)。
4. 涉及文档必读 [docs/README.md](docs/README.md)。
5. 查看 `git status --short`、目标源码、公开入口、package.json、锁文件和相关历史记录；保护现有修改，不清理他人文件，不手改生成的 dist/types。

### 已有证据（不是本次重新执行的结果）

- C01：ConfigProvider、Icon、内部 `_VirtualList` 已做源码工作区回归，见 [c01.md](docs/contributing/regressions/c01.md)。内部组件不进入公开文档。
- C02：Button 已完成本轮回归，见 [button.md](docs/contributing/regressions/button.md)。Skeleton 主组件及四个子组件已完成，见 [skeleton.md](docs/contributing/regressions/skeleton.md)；四个子组件文档已拆成独立章节和 API 表。
- 原 95 条类型错误已处理，见 [typecheck.md](docs/contributing/regressions/typecheck.md)。文档全屏、自举与导航调整见 [docs-design.md](docs/contributing/regressions/docs-design.md)。
- Dropdown 收尾验证（2026-09-17）：111 文件、1255 条 L1–L3 通过；类型与构建通过；Dropdown 根路径 43 条、子路径 docs 22 条，站点双 base 各 13 条通过。
- 此前全量记录：97 个测试文件、1170 条 L1–L3 通过；根级类型零错误；生产构建通过，仍有 example 大 chunk 提示。文档双 base 各 13 条通过；Skeleton 专项根路径与子路径各 7 条通过。后续子组件文档拆分另有 docs 专项 4 条通过。
- 历史验证环境：Node 22.22.0、pnpm 11.16.0、solid-js/@solidjs/web 2.0.0-rc.0；当前版本必须重新读锁文件确认，禁止静默升级。
- 上述“已完成”只代表记录中的支持范围与环境，**不代表 A05 消费者安装、跨浏览器、发布验收完成**。A/B/D 不因已有局部用例而整项勾选。
- Tooltip 收尾验证（2026-09-17）：46 文件（新增用例）、116 文件全量、1286 条 L1–L3 通过；类型与构建通过；Tooltip 专项 Playwright 47 条（docs+example 两项目）通过，重复两次稳定；docs 双 base 各 13 条通过。
- Popover 收尾验证（2026-09-17）：5 文件（新增用例）、121 文件全量、1311 条 L1–L3 通过；类型与构建通过；Popover 专项 Playwright 43 条（docs+example 两项目）通过，重复两次稳定；docs 双 base 各 13 条通过；另有 Playwright MCP 交互验证。
- Tabs 收尾验证（2026-09-17）：8 文件（新增用例）、127 文件全量、1337 条 L1–L3 通过；类型与构建通过；Tabs 专项 Playwright 15 条（docs+example 两项目）通过，重复两次稳定；docs 双 base 各 13 条通过（新增导航页触发路由/菜单套件）；另有 Playwright MCP 交互验证。C02 批次全部完成。
- Input 收尾验证（2026-09-20）：5 文件、35 条 Input 用例通过；全量 133 文件、1373 条通过；专项浏览器 17 条、文档双 base 各 13 条通过；类型与构建通过，见 [input.md](docs/contributing/regressions/input.md)。
- 默认下一事项：C06 的 TimePicker、DatePicker、ColorPicker、Upload 均已完成；后续按台账处理 C07 Form。

### 状态规则

- `[ ]` 未完成；`[x]` 仅在本项验收和证据记录齐全时填写。
- 执行台账状态使用：待领取 / 进行中 / 待验证 / 受阻 / 已验收。
- “不适用”必须给具体原因；未实现、未接入、没运行都不能写成“不适用”或“通过”。
- 发现已验收能力的新缺陷，重新打开受影响项或记录关联修复任务，不能保留误导性的全绿状态。

## 1. 每个物料必须怎样回归（精简执行）

每次只处理指定物料及必要依赖；沿用已有规范、工具和证据，不重复审查无关组件。目标是降低缺陷风险，不能承诺绝对无 bug。

### 1.1 确认能力与核心代码

- 核对公开导出、用途、props 默认值、子组件和方法；读目标 UI、对应 competence/样式及直接依赖。只补当前使用路径的共享能力缺口。
- 跑已有目标用例建立局部基线，复现缺陷后最小修复；保持分层、兼容性和 Solid 2 响应式约定。
- 在 `docs/contributing/regressions/<material>.md` 维护一份简短能力映射和结果，不重复写计划、矩阵、总结副本。

### 1.2 补齐示例与文档

- 检查 example 展示和交互；docs 每个示例独立文件、展示和代码区，同文件 `?raw` 展示源码，SSR 不执行 CSR 示例。
- 补全公开 API、默认值、事件、限制；每个公开子组件独立章节、示例和 API 表。内部组件不进公开文档。
- 沿用全屏和本库组件自举的框架；普通物料回归不重做菜单、复制按钮等站点通用功能验收。

### 1.3 补齐有意义的测试

- 每个公开 prop 都有可追溯验证，产生不同 DOM/行为的条件分支逐一覆盖；独立属性按等价类，相关属性按实际分支组合，不穷举无关笛卡尔积。
- 按适用能力覆盖受控/非受控、动态更新、禁用、事件、键盘焦点、异步竞态和卸载清理。已知多属性共同触发的分支不能用成对覆盖替代。
- L1 测逻辑、L2 测公开入口/最小挂载、L3 测 DOM/事件、L4 测真实布局/绘制/交互；同一契约在合适层充分证明，其他层只补集成风险，不复制全套矩阵。
- 测试放 `packages/testing/<层>/<Material>/`，共享逻辑归 `headless/shared/`；复用现有 helper/runner。**每条用例前加中文备注**，不删失败用例或弱化断言制造全绿。

### 1.4 按影响验证，完成后交接

- 迭代只跑失败用例和目标测试；收尾执行一次全量 L1–L3、根类型检查和 `git diff --check`。
- UI/样式验证目标真实浏览器场景，开发模式检查代表性挂载/绘制，生产模式覆盖目标交互；截图若作为证据须实际查看。
- 修改 docs/示例执行相关类型、静态构建和目标页面检查；站点双 base 通用套件用于路由、SSR、base 或公共框架变更。修改生产源码/导出/样式执行受影响构建，边界不明确时用根 build。
- 共享逻辑修改补共享专项和受影响消费者代表性集成，不重新回归所有下游 props。
- 已通过检查仅在新修改使证据失效、实际失败或明确未决风险时重跑；复用有效构建，纯记录修改不重跑组件测试。日志保留文件，默认只读汇总和失败片段。
- 适用检查通过、能力/示例/API 齐全后更新台账并交接；未运行或失败如实记录，不勾选完成，不自动继续下一个物料。

## 2. 多 agent 分工与交接

用户可为多个任务分配不同物料；本文件不自动创建 agent，也不等于授权提交、推送或发布。

1. **先领取再改代码**：在下表填实际任务名/负责人、范围、分支或目录、状态、依赖和证据路径。建议单个任务负责一个物料或一个有界共享能力。
2. 优先隔离 worktree；当前仓库有大量未提交内容，新 worktree 必须基于正确的工作状态，不能只从旧 HEAD 开始导致遗漏前序成果。不要擅自提交整个脏工作区作为快照。
3. 同一目录并行时，领取记录由协调者串行更新；普通 Markdown 不提供原子锁，不能凭“我先写了一行”认定不会冲突。工作范围重叠时先协调，不覆盖他人改动。
4. 共享文件指定单一合并负责人：barrel exports、ConfigProvider、preset、锁文件、根 scripts、测试配置、文档框架与本 TODO。物料 agent 记录所需修改，协调合并后复验。
5. 没有依赖的 C08/C09 等可并行；依赖未验收时可先盘点和写测试，但不得假设已稳定并宣告最终完成。
6. 同一 checkout 的构建、声明生成、双 base docs build 和浏览器服务器串行执行。它们会覆盖相同 dist/types，使用 4173/4174/5658 等固定端口；不能同时运行互相污染结果。不同 worktree 也需分配端口。
7. 不停止其他任务的服务、不清空别人的截图/日志、不重置或格式化无关文件。停止自己启动的临时服务；保留用户正在查看的服务。
8. 交接包含：改动文件、契约变化、失败复现、实际执行命令/结果、截图/trace、未决项、共享文件需求、下游影响。协调者合并后再做集成验收，局部分支通过不等于集成通过。
9. 完成后更新组件勾选与独立回归记录；阶段整批勾选必须所有物料和必要依赖通过。

### 领取台账（追加实际任务，禁止编造负责人）

| 项目 | 负责人/任务 | 分支或工作目录 | 修改范围/共享文件需求 | 状态 | 阻塞/依赖 | 证据 |
| --- | --- | --- | --- | --- | --- | --- |
| C02 Dropdown | 当前会话：Dropdown 组件回归 | 当前工作区（main） | Dropdown UI、Trigger 依赖证据、example/docs、四层测试与回归记录；共享 barrel 补 DropdownPlacement/DropdownTrigger 类型，不改锁文件 | 已验收 | 依赖 B04 Trigger 的现有局部证据，完整 B04 不在本任务范围 | [执行记录](docs/contributing/regressions/dropdown.md) |
| C02 Tooltip | 当前会话：Tooltip 组件回归 | 当前工作区（main） | Tooltip UI 修复（title=false/getContainer/aria-hidden/ref 裸读）、example/docs 新建、四层测试与回归记录、专项 Playwright 配置；共享 barrel 补 TooltipIns 类型，未改 trigger.ts | 已验收 | 依赖 B04 Trigger 的现有局部证据；发现的 STRICT_READ_UNTRACKED 噪音记为 B04 完整回归待查项，不在本任务范围修复 | [执行记录](docs/contributing/regressions/tooltip.md) |
| C02 Popover | 当前会话：Popover 组件回归 | 当前工作区（main） | Popover UI 修复（空 title/content 仍打开、getContainer 未接线、aria-hidden 缺失）、example/docs 新建、四层测试与回归记录、专项 Playwright 配置；未改 trigger.ts、未改 barrel | 已验收 | 依赖 B04 Trigger 的现有局部证据；同一 STRICT_READ_UNTRACKED 噪音沿用 Tooltip 记录的待查结论 | [执行记录](docs/contributing/regressions/popover.md) |
| C02 Tabs | 当前会话：Tabs 组件回归 | 当前工作区（main） | Tabs UI 修复（方向键切换后焦点不跟随、tablist 容器多余 tabindex=0、缺失 ref/TabsIns 接线）、example/docs 新建（导航分类）、四层测试与回归记录、专项 Playwright 配置；未改 competence/src/tabs.ts，仅补 UI 层集成 | 已验收 | 不依赖 B04（Tabs 无浮层）；STRICT_READ_UNTRACKED 噪音记为 B01 完整回归待查项，来源与 Trigger 无关（Tabs 自身 createEffect） | [执行记录](docs/contributing/regressions/tabs.md) |

| C03 Input | 当前会话：Input 回归 | 当前工作区 | Input/Password/TextArea/Search、必要共享输入逻辑、示例/API、四层测试 | 已验收 | Button 已验收；仅验证 Form 注入协议，不扩展完整 Form | [执行记录](docs/contributing/regressions/input.md) |
| C03 Pagination | 当前会话：Pagination 回归 | 当前工作区 | Pagination UI/headless、示例/API、四层测试；不改共享逻辑和锁文件 | 已验收 | Dropdown 已有验收证据；本轮集成通过 | [执行记录](docs/contributing/regressions/pagination.md) |
| C03 Tree | 当前会话：Tree 回归 | 当前工作区 | Tree/headless/拖拽、示例/API、四层测试；必要 TreeSelect 渲染集成 | 已验收 | 勾选/半选图标补验通过；沿用 C01 与 TreeSelect 集成证据 | [执行记录](docs/contributing/regressions/tree.md) |

| C04 Checkbox | 当前会话：Checkbox 回归 | 当前工作区 | Checkbox/CheckboxGroup、B02 注入路径、示例/API、四层测试及证据 | 已验收 | B02 使用路径及用户反馈的确认/聚焦示例补验通过；完整 Form 留待 C07 | [执行记录](docs/contributing/regressions/checkbox.md) |

| C04 Radio | 当前会话：Radio 回归 | 当前工作区 | Radio/RadioGroup/RadioButton、必要 Selection 与 B02 路径、示例/API、四层测试及证据；保留 Checkbox 改动 | 已验收 | Selection 受控路径及 Select/Cascader/Segmented 局部集成通过；完整 B02/B06 留待后续 | [执行记录](docs/contributing/regressions/radio.md) |

| C04 Switch | 当前会话：Switch 回归 | 当前工作区 | Switch UI/headless、B02 接入、示例/API、四层测试；保留前序修改 | 已验收 | 字段布尔值与显式优先级通过；完整 B02 留待后续 | [执行记录](docs/contributing/regressions/switch.md) |

| C04 InputNumber | 当前会话：InputNumber 回归 | 当前工作区 | 数字输入状态/步进、B02 接入、示例/API、四层测试；保留前序修改 | 已验收 | 受控草稿/重置、精度与字段数字/null 通过；完整 B02 留待后续 | [执行记录](docs/contributing/regressions/input-number.md) |

| C04 Slider | 当前会话：Slider 回归 | 当前工作区 | Slider 单值/区间、拖拽/键盘、B02 字段、示例/API、四层测试；保留前序修改 | 已验收 | 2 workers 全量通过；默认并行的 Select 虚拟列表超时留 B09/D06，详见记录 | [执行记录](docs/contributing/regressions/slider.md) |
| C04 Rate | 当前会话：Rate 回归 | 当前工作区（main） | Rate/headless、半星与 hover/clear、B02 路径、示例/API、四层测试及证据；不改锁文件 | 已验收 | 依赖前序 C04 表单控件与共享数值/Selection 局部证据；完整 B02 留待后续 | [执行记录](docs/contributing/regressions/rate.md) |
| C04 Segmented | 当前会话：Segmented 回归 | 当前工作区（main） | Segmented/headless、Selection 集成、滑动 thumb/键盘、B02 路径、示例/API、四层测试及证据；不改锁文件 | 已验收 | 依赖前序 C04 表单控件与共享 Selection 局部证据；完整 B02/B06 留待后续 | [执行记录](docs/contributing/regressions/segmented.md) |

| C04 Rate / Segmented 二次修复 | 当前任务：二次修复与补验 | 当前工作区（main） | Rate/Segmented 实现、定向回归、docs/example、几何与清理验收 | 已验收 | 4 项缺陷关闭；定向 57、全量 1508、浏览器 22 条通过；类型/构建通过 | [Rate](docs/contributing/regressions/rate.md)、[Segmented](docs/contributing/regressions/segmented.md) |
| C05 Select | 当前会话：Select 回归 | 当前工作区（main） | Select UI/headless、虚拟列表与表单使用路径、example/docs、分层测试与回归记录 | 已验收 | 清空后箭头延迟补验：浏览器 39 条通过、3 条原有跳过；依赖 C01 _VirtualList、C03 Input 与 B02/B06 使用路径，完整共享回归仍在后续批次 | [执行记录](docs/contributing/regressions/select.md) |

| C05 AutoComplete | 当前会话：AutoComplete 回归 | 当前工作区（main） | AutoComplete UI/headless、Form 注入、示例/API、四层测试及证据；保留 Select 修改 | 已验收 | 三项 L3 失败已修复；全量 1561、专项浏览器 14 条通过，见二次修复记录 | [执行记录](docs/contributing/regressions/auto-complete.md) |
| C05 AutoComplete 三项修复 | 当前会话：AutoComplete 三项失败修复与 Mentions 关联核查 | 当前工作区（main） | AutoComplete UI、必要 Form/Trigger 使用路径、三项 L3 失败、专项浏览器、全量复验与证据；保留其他未提交修改 | 已验收 | ARIA 两项、Form 即时写回一项；浏览器另修滚动时鼠标悬停覆盖键盘高亮；与 Mentions 无共同运行时根因 | [执行记录](docs/contributing/regressions/auto-complete.md) |
| C05 Cascader | 当前会话：Cascader 回归 | 当前工作区（main） | Cascader UI/headless、树路径/搜索/多选联动、示例/docs、四层测试与回归记录；不改锁文件 | 已验收 | 多选勾号绘制与箭头延迟补验：浏览器 8 条通过；完整共享回归留后续 | [执行记录](docs/contributing/regressions/cascader.md) |
| C05 Mentions | 当前会话：Mentions 回归 | 当前工作区（main） | Mentions UI/headless、输入与候选交互、example/docs、分层测试与回归记录；不改锁文件 | 已验收 | 选中后光标位置二次修复；专项 38、浏览器 12、全量 1561、构建/类型/双 base 通过 | [执行记录](docs/contributing/regressions/mentions.md) |
| C05 TreeSelect | 当前会话：TreeSelect 回归 | 当前工作区（main） | TreeSelect UI/headless、Tree/Trigger/Form/虚拟面板必要使用路径、example/docs；追加 Select/Cascader/TreeSelect 清除与弹层宽度统一；保护其他未提交修改 | 已验收 | 宽度策略和图标切换浏览器补验 22 条通过；全量 L1–L3 1585 条通过，类型与构建通过 | [执行记录](docs/contributing/regressions/tree-select.md) |
| C05 Transfer | 当前任务：Transfer 完整回归 | 当前工作区（main） | Transfer UI/headless、Form 使用路径、example/docs、四层测试与回归记录；保护其他物料未提交改动 | 已验收 | 全量 1595、专项浏览器 16、docs 双 base 各 13 条通过；完整 B02/B06 后续单独验收 | [执行记录](docs/contributing/regressions/transfer.md) |
| C06 TimePicker | 当前会话：TimePicker 物料回归 | 当前工作区（main） | TimePicker / RangePicker、示例/API、分层测试、专项浏览器与回归记录；不改共享能力与锁文件 | 已验收 | 全量 L1–L3 1606 条、类型/生产与 docs 构建、TimePicker 浏览器 7 条、docs 双 base 各 13 条通过；Form.Item 提交/resetFields 集成通过 | [执行记录](docs/contributing/regressions/time-picker.md) |
| C06 DatePicker | 当前会话：DatePicker 物料回归 | 当前工作区（main） | DatePicker / RangePicker、示例/API、分层测试、专项浏览器与回归记录；保留 TimePicker 未提交修改 | 已验收 | 全量 L1–L3 1610 条、类型/构建、专项浏览器 12 条、docs 双 base 各 13 条通过；Form 回写与重复焦点事件已修复 | [执行记录](docs/contributing/regressions/date-picker.md) |
| C06 ColorPicker | 当前会话：ColorPicker 物料回归 | 当前工作区（main） | 颜色转换/headless、Popover 使用路径、example/docs、分层测试及专项浏览器；保留 TimePicker/DatePicker 未提交修改 | 已验收 | 全量 L1–L3 1612 条、专项浏览器 10 条通过/4 条按范围跳过、类型/构建、docs 双 base 各 13 条通过；未发现生产逻辑缺陷 | [执行记录](docs/contributing/regressions/color-picker.md) |
| C06 Upload | 当前会话：Upload 物料回归 | 当前工作区（main） | Upload/Dragger 异步队列、Form.Item、示例/docs、分层测试与专项浏览器；保留其他物料未提交修改 | 已验收 | 修复 Upload/Dragger Form.Item 字段回写；全量 L1–L3 1615 条、专项浏览器 7 条通过/5 条按范围跳过、类型/构建、docs 双 base 各 13 条通过 | [执行记录](docs/contributing/regressions/upload.md) |

## 3. 第一阶段：全部组件回归 C（用户指定优先）

编号沿用原计划，方便追踪。按实际引用验证前置能力；C01 历史已完成但不因此把 B08 全部勾选。

| 批次 | 排序依据与重点 |
| --- | --- |
| C01 | 配置、图标、虚拟列表；ConfigProvider 使用的颜色解析须先核验 B08 相应部分 |
| C02 | 高频组合依赖；状态、浮层、切换、销毁；浮层先验 B04 |
| C03 | Input.Search 依赖 Button；Pagination 依赖 Dropdown；Tree 依赖虚拟列表 |
| C04 | 基础表单控件；先验 B02，覆盖受控/非受控、禁用和键盘 |
| C05 | 虚拟列表、树、输入样式组合及复杂选项状态 |
| C06 | 日期/时间边界、范围、颜色转换、上传异步；ColorPicker 依赖 Popover |
| C07 | 共享协议和实际控件就绪后验证完整 Form；Form.Item 依赖 Tooltip |
| C08 | 布局、断点、尺寸、嵌套、拖拽；无依赖冲突时可并行 |
| C09 | 基础展示；文本溢出、计时、绘制、动态更新；无依赖冲突时可并行 |
| C10 | 导航状态、滚动与定位；Breadcrumb 依赖 Dropdown |
| C11 | 多弹层、焦点、命令式接口和清理；先验 B03–B05 相应能力 |
| C12 | 组合展示；Card 依赖 Skeleton/Tabs，Calendar 依赖 Dropdown；Carousel headless 先于 Image.PreviewGroup |
| C13 | Table 依赖 Pagination，按内部模块顺序验收，最后验证综合业务 |

### C01

- [x] ConfigProvider — [本轮验收记录](docs/contributing/regressions/c01.md)
- [x] Icon — [本轮验收记录](docs/contributing/regressions/c01.md)
- [x] _VirtualList — [本轮验收记录](docs/contributing/regressions/c01.md)

### C02

- [x] Button — [本轮验收记录](docs/contributing/regressions/button.md)
- [x] Skeleton — [本轮验收记录](docs/contributing/regressions/skeleton.md)
- [x] Dropdown — 源码工作区本轮通过；含定位、受控生命周期、动态触发、焦点和监听清理，见 [执行记录](docs/contributing/regressions/dropdown.md) 与 [定位复查](docs/contributing/regressions/dropdown-position.md)
- [x] Tooltip — 源码工作区本轮通过；修复 title=false 空气泡、getContainer 未接线、ref 组件体裸读、关闭态缺 aria-hidden/inert、barrel 缺 TooltipIns 五项缺陷，见 [执行记录](docs/contributing/regressions/tooltip.md)
- [x] Popover — 源码工作区本轮通过；修复空 title/content 仍打开空卡片、getContainer 未接线、关闭态缺 aria-hidden/inert 三项缺陷，见 [执行记录](docs/contributing/regressions/popover.md)
- [x] Tabs — 源码工作区本轮通过；修复方向键切换焦点不跟随、tablist 容器多余 Tab 停靠点、缺失 ref/TabsIns 接线三项缺陷，见 [执行记录](docs/contributing/regressions/tabs.md)

### C03

- [x] Input — 含 InputPassword / InputTextArea / InputSearch，见 [本轮验收记录](docs/contributing/regressions/input.md)
- [x] Pagination — 页码边界、表单安全、禁用容量菜单、四层回归及文档，见 [本轮验收记录](docs/contributing/regressions/pagination.md)
- [x] Tree — 含复选语义、受控搜索、内嵌控件焦点、拖拽生命周期与真实焦点绘制，见 [本轮验收记录](docs/contributing/regressions/tree.md)

### C04

- [x] Checkbox — 含 CheckboxGroup、确认与聚焦示例补验，见 [本轮验收记录](docs/contributing/regressions/checkbox.md)
- [x] Radio — 含 RadioGroup / RadioButton，见 [本轮验收记录](docs/contributing/regressions/radio.md)
- [x] Switch — 见 [本轮验收记录](docs/contributing/regressions/switch.md)
- [x] InputNumber — 见 [本轮验收记录](docs/contributing/regressions/input-number.md)
- [x] Slider — 见 [本轮验收记录](docs/contributing/regressions/slider.md)；默认并行虚拟列表超时另行跟踪，2 workers 全量通过
- [x] Rate — 二次缺陷修复与补验完成，含 slider 半星语义、默认值稳定、hover 清零、动态模式与 Form，见 [执行记录](docs/contributing/regressions/rate.md)
- [x] Segmented — 二次修复与补验完成，含候选失效、测量清理、真实几何/等宽/resize、docs/example Form 与完整基础文档，见 [执行记录](docs/contributing/regressions/segmented.md)

### C05

- [x] Select — 含下拉、加载与清除右侧图标尺寸及清空后箭头延迟补验，见 [执行记录](docs/contributing/regressions/select.md)
- [x] AutoComplete — 三项 L3 缺陷与长列表鼠标悬停干扰已修复，专项浏览器 14 条、全量 1561 条通过，见 [执行记录](docs/contributing/regressions/auto-complete.md)
- [x] Cascader — 树路径、搜索、多选 checkable、勾号真实绘制与清空后箭头延迟，见 [执行记录](docs/contributing/regressions/cascader.md)
- [x] Mentions — 选中后光标位置、目标专项与浏览器验证通过，AutoComplete 修复后全量 1561 条通过，见 [执行记录](docs/contributing/regressions/mentions.md)
- [x] TreeSelect — 三组件清除按钮与宽度策略统一、虚拟列表单滚动；后续浏览器 22 条、全量 L1–L3 1585 条通过，详见 [执行记录](docs/contributing/regressions/tree-select.md)
- [x] Transfer — 全量 L1–L3 1595 条、专项浏览器 16 条、docs 双 base 各 13 条通过，见 [执行记录](docs/contributing/regressions/transfer.md)

### C06

- [x] TimePicker — 范围默认值/非受控状态、反向端点交换、focus/blur 与 Form.Item 集成已回归，见 [执行记录](docs/contributing/regressions/time-picker.md)
- [x] DatePicker — 单值/范围 Form.Item 回写与 focus/blur 修复，四层回归、文档和示例通过，见 [执行记录](docs/contributing/regressions/date-picker.md)
- [x] ColorPicker — 颜色转换、公开导出、Form.Item、示例/文档与专项浏览器通过，详见 [执行记录](docs/contributing/regressions/color-picker.md)
- [x] Upload — 异步队列、拖拽、Form.Item 提交/重置与文档浏览器回归通过，详见 [执行记录](docs/contributing/regressions/upload.md)

### C07

- [ ] Form

### C08

- [ ] Flex
- [ ] Grid
- [ ] Space
- [ ] Divider
- [ ] Layout
- [ ] Splitter
- [ ] Masonry

### C09

- [ ] Typography
- [ ] Avatar
- [ ] Badge
- [ ] Tag
- [ ] Empty
- [ ] Statistic
- [ ] Timeline
- [ ] Progress
- [ ] Result
- [ ] QRCode
- [ ] Watermark
- [ ] Alert

### C10

- [ ] Menu
- [ ] Breadcrumb
- [ ] Steps
- [ ] Anchor
- [ ] Affix

### C11

- [ ] Modal
- [ ] Drawer
- [ ] Popconfirm
- [ ] Message
- [ ] Notification
- [ ] Spin
- [ ] FloatButton
- [ ] Tour

### C12

- [ ] Card
- [ ] Descriptions
- [ ] Calendar
- [ ] Carousel
- [ ] Image
- [ ] Collapse
- [ ] List

### C13

- [ ] Table

### 必须保留的依赖链

箭头表示左侧被依赖能力应先验收，不代表右侧所有逻辑都来自左侧。

```text
Dropdown → Pagination → Table
Dropdown → Breadcrumb / Calendar
Button → Input.Search / Modal / Drawer / Popconfirm
_VirtualList → Select / Cascader / Tree → TreeSelect
Tooltip → Form.Item / FloatButton
Popover → ColorPicker
Skeleton + Tabs → Card
Carousel headless → Image.PreviewGroup
```

ConfigProvider 读取 `Input/context`、`Form/context`，不等于依赖完整 Input/Form UI。
先验共享协议即可，不需要把完整 Form 提到最前；不能把目录交叉引用直接认定为循环组件依赖。
参考 [上下文实现](packages/components/lib/ConfigProvider/context.ts)。

### 子组件与复杂模块清单（跟随所属物料验收）

- [x] Input 家族：InputPassword / InputTextArea / InputSearch（当前为独立命名导出，无静态属性）。
- [x] CheckboxGroup（独立命名导出，当前不提供 Checkbox.Group 静态属性）。
- [x] RadioGroup / RadioButton（独立命名导出，当前不提供 Radio.Group / Radio.Button 静态属性）。
- [ ] DatePicker.RangePicker、TimePicker.RangePicker及独立命名导出。
- [ ] Form.Item / Form.List、实例方法、字段依赖、异步校验、重置、动态增删。
- [ ] Grid.Row / Col、Layout 各区域、Space.Compact、Splitter.Panel。
- [ ] Typography.Text / Title / Paragraph / Link、Statistic.Countdown。
- [x] Skeleton.Button / Avatar / Input / Node：具名与静态导出、独立文档、API 和示例已回归。
- [ ] Badge.Ribbon、Tag.CheckableTag、Card.Grid / Meta、Image.PreviewGroup。
- [ ] Upload.Dragger、FloatButton.Group / BackTop。
- [ ] Modal 静态方法、Message / Notification Provider 和命令式接口。
- [ ] 每个物料额外扫描源码中的公开子组件/类型/方法，不以本清单为封闭全集。

Table 内部验收顺序：

1. [ ] 状态与数据模型。
2. [ ] 列与表头。
3. [ ] 排序、筛选、分页。
4. [ ] 选择、展开、树形、分组。
5. [ ] 单元格合并、固定列。
6. [ ] 编辑与异步提交。
7. [ ] 虚拟滚动。
8. [ ] 综合业务场景。

源码未实现或尚未承诺支持的条目记录为差异，不用测试计划冒充已有功能；
若决定不支持，须在范围决议和公开文档中说明后再关闭该计划项。

## 4. 第二阶段：基础工程、样式、安装与构建 A

C 阶段可按需提前执行相关项，最终仍须完整验收本阶段。尤其 A05 不应等到发布前才发现。

| 完成 | 编号 | 项目 | 验收内容 |
| --- | --- | --- | --- |
| [ ] | A01 | 环境与基线 | 锁定 Node、pnpm、Solid RC、编译工具组合；记录类型、测试、构建基线，区分新增/已有错误 |
| [ ] | A02 | 样式 token | 颜色、字号、间距、尺寸、圆角、边框、阴影；默认、自定义、非法配置边界 |
| [ ] | A03 | UnoCSS 生成 | shortcuts、rules、safelist、图标提取、自定义前缀；开发和生产都不丢类，验证实际 CSS |
| [ ] | A04 | 样式隔离与覆盖 | CSS 变量完整性、明暗主题、class/style 优先级、reset 冲突、外部样式污染 |
| [ ] | A05 | 独立安装 | 三个生产包 pack 成 tarball，在仓库外干净消费者安装；禁止 workspace 链接、源码别名或工作区隐式依赖 |
| [ ] | A06 | 导入与类型入口 | 根入口、/es、组件子路径、源码与样式入口；命名导出、声明、泛型、子组件访问 |
| [ ] | A07 | 构建产物 | 承诺支持的 ESM/CJS 等产物；external、文件完整性、相对路径、source map |
| [ ] | A08 | 按需使用 | 单组件导入、tree shaking、样式加载策略、未使用组件副作用；建立体积基线 |
| [ ] | A09 | 服务端边界 | Node 导入和顶层浏览器 API；逐物料明确可服务端导入、可 SSR、仅客户端使用的区别 |

### 优先核验风险与已知教训

- UI 将 `upthrust-competence` external，但依赖声明曾位于 devDependencies。查看当前
  [包声明](packages/components/package.json) 与 [构建配置](packages/components/vite.config.ts)，
  必须由 A05 实测是否导致干净消费者缺依赖，不能以工作区能跑作结论。若修依赖声明，同步包内容、锁文件和消费者复验。
- A05 记录 tarball 列表、消费者 package.json/安装日志、类型与构建/运行结果；不要借用 monorepo node_modules，检查 workspace 协议是否正确替换及运行时依赖闭包。
- UnoCSS 将普通 `.border` 与不支持的浏览器伪元素合并曾使整个规则失效。当前 docs/example/components 配置为 `mergeSelectors: false`。维护时查原因，不能为缩小体积直接删除。
- class 存在不等于绘制正确；Skeleton 的主题渐变、Button 的边框宽度都要在真实浏览器检查。
- 根级零类型错误与声明生成已改善，但不足以直接关闭 A01/A06/A07；完整范围仍须验证。

## 5. 第三阶段：共享框架与测试基础能力 B

组件使用某共享能力前先核验相关部分，这里负责补齐全范围和跨物料一致性。

- [ ] **B01 Solid 上下文与生命周期**：创建、响应式配置、owner、flush、清理、重复挂载、卸载后异步完成。
- [ ] **B02 表单共享协议**：FormContext / FormItemContext、控件独立使用、字段注入、显式 props 与上下文默认值优先级。
- [ ] **B03 全局配置与 Portal**：嵌套、关闭继承、动态更新、弹层主题作用域、自定义容器；ConfigProvider wrapper=false 的 DOM/主题边界。
- [ ] **B04 Trigger**：触发方式、开关、定位、边界调整、滚动/缩放重定位、外部点击、Escape、监听清理。
- [ ] **B05 Dialog 与弹层栈**：多层 Modal/Drawer、最高层 Escape、遮罩、滚动锁、焦点恢复、销毁栈清理。
- [ ] **B06 Selection / Drag**：选中、禁用项、键盘切换、拖拽开始/取消/结束、事件与监听清理。
- [ ] **B07 虚拟列表与断点**：可见范围、索引/key、数据更新、滚动定位、尺寸变化、响应式边界。
- [ ] **B08 基础工具**：颜色解析、日期计算、字段路径/校验、样式合并；分别放对应物料或 shared 测试目录。
- [ ] **B09 测试执行基础**：组件专用浏览器页/运行入口、统一 mount/cleanup、可控时钟/网络、截图环境、失败 trace。Slider 轮次发现默认并行下 `virtual-list.selector.2` 两次超时，单独与 2 workers 全量通过；跟踪并发稳定性及性能根因，见 [记录](docs/contributing/regressions/slider.md)。

已有 C01、Button、Skeleton 覆盖了部分 B 项；引用其证据并补缺口，不能盲目重做，也不能把局部通过当成整项验收。

## 6. 第四阶段：组合场景、文档与发布 D

- [ ] **D01 表单业务链路**：Form + 输入控件 + 异步校验 + 提交/重置 + Modal/Drawer。
- [ ] **D02 数据管理链路**：查询条件 + Table + Pagination + 行选择 + 编辑 + 上传。
- [ ] **D03 多弹层**：Modal 内 Select/DatePicker、嵌套 Drawer、Tooltip/Tour；层级、焦点、Escape、主题。
- [ ] **D04 全局切换**：主题、尺寸、禁用、响应式宽度动态变化；重点 Portal 与虚拟列表。
- [ ] **D05 真实浏览器与无障碍**：明确支持矩阵，验证键盘、焦点、ARIA、滚动、布局与视觉基线；当前 Chrome 通过不能宣称 Firefox/WebKit 通过。
- [ ] **D06 性能与稳定性**：大数据、重复打开关闭、路由切换、监听/计时器泄漏、异步乱序；先建基线，再定阈值。
- [ ] **D07 文档与示例总验收**：每项同步文档贯穿全程；最终审计所有 API/默认值/限制/独立 CSR 示例/SSR 源码、子组件独立文档、根路径与子路径部署。
- [ ] **D08 持续集成**：PR 跑相关回归与基础检查；定期全量浏览器、视觉、消费者安装和生产构建；不把仅有配置文件当作 CI 已成功运行。
- [ ] **D09 发布准备**：Solid 2 正式版发布后独立升级适配与完整复验；版本、许可证、变更日志、产物检查。正式版发布本身不是可发布证明，未到条件保持待办，不猜日期。

## 7. 最终收尾与删除条件

- [ ] C/A/B/D 所有事项逐项验收，或经用户明确确认范围调整；所有未支持差异有记录。
- [ ] 多 agent 结果已合并，最终完整工作树的测试/类型/构建/浏览器/消费者安装通过，而不只是各分支通过。
- [ ] 高风险缺陷关闭，无隐藏的 skip、类型排除或仅占位文档；遗留限制清晰公开。
- [ ] 把最终环境、命令、结果、支持矩阵、未支持能力与回归记录索引归档至 `docs/contributing/regressions/`，保留长期证据。
- [ ] 最终交接说明实际完成范围与发布状态；本计划不自动授权远端提交、发布或部署。
- [ ] 上述全部完成后，删除根目录 `TODO.md` 并移除 `AGENTS.md` 的临时回归入口；避免留下失效链接。

在此之前，即使单个 agent 的任务完成，也只更新台账与证据，不删除整个 TODO。
