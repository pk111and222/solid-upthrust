# upthrust-testing

Solid Upthrust 的集中测试工作区。该包为 `private`，不构建或发布组件产物。

## 四层结构

```text
packages/testing/
├── headless/                # L1：状态、行为与纯逻辑
│   ├── Button/button.test.ts
│   ├── Form/                # 同一物料按模块拆文件
│   │   ├── form.test.ts
│   │   ├── field.test.ts
│   │   ├── list.test.ts
│   │   ├── validate.test.ts
│   │   └── utils.test.ts
│   ├── Table/               # table.test.ts、interactions.test.ts
│   ├── shared/              # 跨物料生产逻辑：Dialog / Drag / Selection / Trigger
│   ├── preset/              # 主题 token、规则与 CSS 生成逻辑
│   └── docs/                # 文档站路由逻辑
├── smoke/                   # L2：<物料名>/<模块>.test.tsx（首批用例待补）
├── render/                  # L3：模拟 DOM 契约
│   ├── Table/Table.test.tsx
│   ├── DatePicker/DatePicker.test.tsx
│   └── docs/                # 文档站挂载契约
├── browser/                 # L4：<物料名>/<模块>.spec.ts（组件用例待补）
│   └── docs/                # 已接入文档站真实浏览器验收
├── utils/                   # 测试辅助函数和夹具，不是被测生产逻辑
│   └── fixtures/table.ts
├── vitest.config.ts         # L1–L3，递归收集物料下的模块文件
├── playwright.docs.config.ts
└── package.json
```

现有 competence 的 60 个测试文件已按物料（或公共逻辑模块）归入 `headless`，
13 个 UI 测试文件归入 `render/<物料名>/`；preset 的 2 个用例文件保持独立分组。
本次只调整目录、文件名和必要的导入路径，保留原有断言与执行行为。
C01 的 ConfigProvider、Icon、_VirtualList 已补独立 L2 用例；
文档基础设施已补充 `headless/docs`、`render/docs` 和 `browser/docs`。
这不代表全部组件的四层回归已经完成。

## 物料与模块命名

四层统一使用 `<层>/<物料名>/<能力模块>.test.ts(x)`，真实浏览器使用 `.spec.ts`。
例如同一物料对应 `headless/Table/`、`smoke/Table/`、`render/Table/`、`browser/Table/`；
不再插入 `competence` 或 `components` 包名层。

- 物料目录使用与源码一致的 PascalCase（`Button`、`Form`、`DatePicker`）；同一物料在四层同名。
  组合子组件跟随主物料，如 `Layout/sider.test.ts`、`Image/preview-group.test.ts`。
- 一个文件聚焦一个独立能力或模块。新增文件推荐 `selection.test.ts`、`validation.test.ts`、
  `keyboard.spec.ts` 等能力名称；更复杂时可用 `Table/editing/async.test.ts` 继续分组。
  不用 `part1`、`part2` 或按行数拆分，不要求每个文件只能有一个 `it`。
- 已有综合文件暂时保留；后续回归到具体能力时再拆断言。本次已将 Form、DatePicker、
  Image、List、Tree 等原来散落的模块归入各自物料目录。
- 跨物料的生产能力放 `shared/<模块名>/`，避免把共享 Dialog/Trigger 强行归给 Modal/Tooltip。
  主题与文档站分别使用保留分组 `preset/`、`docs/`；内部渲染基础组件沿用 `_VirtualList/`。
- 测试夹具、mount/flush 等辅助函数统一放根级 `utils/`，按需要再分物料子目录。
  测试文件不能互相导入；`headless/Form/utils.test.ts` 验证的是生产 `formUtils`，不是测试 helper。
- 尚无用例的物料目录在补充首个真实测试时创建。不批量造空测试或把目录存在当作已覆盖。

## 运行

在仓库根目录：

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm run test:headless
pnpm run test:smoke
pnpm run test:render
pnpm run test:watch
```

只执行该包或单个用例：

```bash
pnpm --filter upthrust-testing test
pnpm --dir packages/testing run test headless/Button/button.test.ts
pnpm --dir packages/testing run test render/Table/Table.test.tsx
# 一个物料的整个层（包含其下所有模块）
pnpm --dir packages/testing run test headless/Form
# 同一物料的多个层；未接入层不会因此获得覆盖
pnpm --dir packages/testing run test headless/Table render/Table
pnpm --dir packages/testing run test:competence
pnpm --dir packages/testing run test:preset
pnpm --dir packages/testing run typecheck
```

`test:smoke` 已有 C01 三个物料的真实挂载用例，不再允许空集合。默认 `test` 不允许空集合，也不会收集 `browser/`。
已为文档站安装 Playwright 并提供独立 `test:docs:browser`，不把文档 L4
冒充全组件 `test:browser`。浏览器首次运行需安装 Chromium。

```bash
pnpm run test:docs
pnpm --dir packages/testing exec playwright install chromium
pnpm run test:docs:browser
```

文档浏览器命令构建实际产物并分别测试根路径与 `/solid-upthrust/`，不是测试 SPA
开发服务。可通过 `DOCS_CHROMIUM_PATH` 指定本地 Chrome；CI 安装 Playwright Chromium。

根目录和原组件包的 Vitest 配置仅作为兼容入口，统一配置在本包。
三个生产包的 `test` 命令委托本包运行相关用例。
`test:competence` 收集 headless 物料及 shared 生产逻辑，排除 docs/preset；
`test:preset`、`test:docs` 保持独立范围。全量回归以根目录
`pnpm test` 为准，不需要通过递归执行生产包的 `test` 重复运行同一批用例。

## 编写与维护

- 新测试只放在本包，不再与生产源码共置。
- L1–L3 使用 Vitest；L2–L3 使用 Solid 转换插件和 happy-dom。
- L1 部分行为依赖 DOM、事件和计时器，因此不能统一改为纯 Node 环境。
- 现有测试通过相对路径访问被测源码；组件内部的 `upthrust-competence`
  导入统一映射到源码，避免依赖过期的逻辑包构建产物。
- `solid-js` 与 `@solidjs/web` 固定为迁移时已验证的 RC 版本。本次不升级
  框架、构建工具或改写用例断言。
- 公共辅助函数和夹具放在 `utils/`。测试文件不互相导入；辅助模块不要
  隐式注册测试或全局钩子。每个用例负责创建和清理自己的上下文。
- L3 的 DOM/模拟事件断言不能替代 L4 的真实布局、绘制和浏览器交互验证。
- L4 使用独立浏览器配置（当前 `playwright.docs.config.ts`），不能被 Vitest 收集。
- 该包测试源码行为，不等同于打包后的消费者安装、公开导出或样式验证。

根级 `typecheck` 继续包含迁移后的测试；迁移不会通过排除测试隐藏已有的
类型错误。`typecheck` 失败与否应对照仓库当前基线判断。

具体断言、Solid 2 owner/flush/清理规则与能力映射见
[测试编写规范](../../docs/contributing/testing.md)。

C01 的专项浏览器配置为 `playwright.c01.config.ts`，验证 docs 和 example 构建产物；完整命令与边界见 [C01 回归记录](../../docs/contributing/regressions/c01.md)。

Button 专项浏览器配置为 `playwright.button.config.ts`，覆盖 docs 与 example。
源码、示例、API 与用例映射见 [Button 回归记录](../../docs/contributing/regressions/button.md)。

Skeleton 专项浏览器配置为 `playwright.skeleton.config.ts`，覆盖主组件、四个子组件、
主题动画、开发 CSS 和 docs/example 产物。见 [Skeleton 回归记录](../../docs/contributing/regressions/skeleton.md)。

Tooltip 专项浏览器配置为 `playwright.tooltip.config.ts`，覆盖触发延迟、受控/ref、
getContainer、样式分离、十二种位置与 docs/example 产物。见 [Tooltip 回归记录](../../docs/contributing/regressions/tooltip.md)。

Popover 专项浏览器配置为 `playwright.popover.config.ts`，覆盖触发方式、卡片内交互元素、
disabled、getContainer、样式分离、十二种位置与 docs/example 产物。见 [Popover 回归记录](../../docs/contributing/regressions/popover.md)。

Tabs 专项浏览器配置为 `playwright.tabs.config.ts`，覆盖键盘焦点跟随、单一 Tab 停靠点、
禁用跳过、受控切换、滑动指示条几何、可编辑新增/关闭/键盘排序、ref 命令式接口与 docs/example
产物。见 [Tabs 回归记录](../../docs/contributing/regressions/tabs.md)。

Rate 专项浏览器配置为 `playwright.rate.config.ts`，覆盖受控/非受控、半星 hover 与提交、
清空、键盘、禁用、Form.Item、生产绘制与 SSR，并同时验证 docs/example 产物。见 [Rate 回归记录](../../docs/contributing/regressions/rate.md)。

Segmented 专项浏览器配置为 `playwright.segmented.config.ts`，覆盖选择与禁用、键盘遍历、
thumb 几何、block、Form.Item、生产开发挂载与 SSR，并同时验证 docs/example 产物。见 [Segmented 回归记录](../../docs/contributing/regressions/segmented.md)。

Select 专项浏览器配置为 `playwright.select.config.ts`，覆盖单选/多选、搜索与标签输入、
清空按钮、受控浮层、虚拟滚动、Form.Item、开发绘制与静态 SSR，并同时验证 docs/example 产物。
见 [Select 回归记录](../../docs/contributing/regressions/select.md)。

AutoComplete 专项配置为 `playwright.auto-complete.config.ts`，验证 docs/example 生产交互、开发绘制、键盘滚动及静态 API。见 [回归记录](../../docs/contributing/regressions/auto-complete.md)。

Mentions 专项配置为 `playwright.mentions.config.ts`，验证 docs/example 的键盘与鼠标提交、候选关闭与定位、异步候选、Form.Item、开发绘制及静态 API。见 [回归记录](../../docs/contributing/regressions/mentions.md)。

Transfer 专项配置为 `playwright.transfer.config.ts`，验证 docs/example 的双向移动、搜索全选、单向移除、动态数据、窄屏键盘、Form.Item、静态页面与开发绘制。见 [回归记录](../../docs/contributing/regressions/transfer.md)。

DatePicker 专项配置为 `playwright.date-picker.config.ts`，验证 docs/example 的日期选择、范围、季度、时间、快捷选择、禁用、键盘及静态 API。见 [回归记录](../../docs/contributing/regressions/date-picker.md)。

Upload 专项配置为 `playwright.upload.config.ts`，验证文件选择、异步处理边界、拖拽 accept 与拒绝回调、手动上传、Form.Item 提交/重置、自定义重试及静态 API。见 [回归记录](../../docs/contributing/regressions/upload.md)。
