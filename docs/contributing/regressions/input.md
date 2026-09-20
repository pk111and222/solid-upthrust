# Input 回归（C03）

状态：本轮验收通过（2026-09-20 收尾）。范围为当前源码工作区与本机 Chrome，不代表打包消费者或跨浏览器验收。

## 公开契约

- 保留 `Input`、`InputPassword`、`InputTextArea`、`InputSearch` 及各自 Props 类型。`source/Input` 补齐同名家族导出，便于独立示例使用；不提供 `Input.Password/TextArea/Search` 静态属性。
- 显式 value/onChange 优先于 FormItemContext，未注入值时使用 defaultValue 初始化内部状态。受控拒绝修改时原生 DOM 恢复；defaultValue 后续修改不重置用户输入。
- 输入法组合期间显示草稿，结束时通知一次并去重紧随其后的同值 input。onPressEnter 在 keydown 触发，忽略 composing/229 确认按键；这是从原 keyup 时机的修正。
- disabled/readonly 阻止编辑与清空；清空支持指针与 Enter/Space，完成后回焦。readonly 不阻止查看密码或搜索当前值。
- showCount 使用 UTF-16 字符串长度；maxLength 使用原生约束，不截断父层传入的受控值。
- Password 的 visible 独立于输入 value；hover 进入显示、离开恢复，受控可见性只发请求。
- Search 的 Enter/按钮报告 source=input，清空同时通知 onChange 与 source=clear；disabled/loading 不搜索，loading 仍允许编辑。onSearch 不自动管理 Promise/loading。
- TextArea autoSize 测量内容与宽度，限制行数后可滚动；关闭 autoSize 或卸载移除镜像，卸载断开 ResizeObserver。onResize 是自动测量通知；style 可覆盖自动高度。
- class/style、支持的原生属性见独立 API 表；未承诺任意原生属性透传。错误状态补 aria-invalid；清空、密码开关与搜索按钮支持键盘。

## 实现与修复证据

源码：`packages/components/lib/Input/{index,Password,Search,TextArea}.tsx`；共享输入/IME、密码可见性逻辑抽至 `packages/competence/src/input.ts`（createInput/InputConfig、createPassword/PasswordConfig），UI 继续负责 DOM、焦点与尺寸测量。

1. 首批 `render/Input/regression.test.tsx` 7 条修改前全部失败：自定义清空图标绕过空值/禁用/只读、输入法结束回调与去重、Search 注册 onChange 后漏 clear 搜索、TextArea 镜像未销毁、受控拒绝后 DOM 值漂移。修复后全部通过。
2. 修复可选 onFocus/onBlur 的调用包装，避免未提供回调时注册无效监听；Search 保留 class/suffix/ref 与组合事件透传，图标搜索改为有名称的原生 button。
3. TextArea 镜像 tabindex 拼写、测量信号写入、溢出滚动和宽度观察清理一并验证。计数移至编辑区下方，清空放右上角并预留文字空间；修改前浏览器几何断言证实计数位于编辑区内，修改后通过并查看截图。
4. 必要共享依赖修复：`competence/src/form.ts` 初始化时读取配置，解决仅响应式读取字段时 initialValues 未应用的问题。`headless/Form/initial-reactive.test.ts` 修改前失败、修改后通过，现有 Form 逻辑联测通过；不扩展完整 Form 回归。

## 能力映射

下列测试路径相对 `packages/testing/`。同一行为在最合适层证明，不复制四套矩阵。新增用例均有中文备注。

| 属性 / 能力 | 示例（docs/src/examples/input） | 验证位置 |
| --- | --- | --- |
| value/defaultValue/onChange、受控拒绝、空字符串、动态更新 | basic、controlled | headless/Input/input.test.ts；render/Input/regression.test.tsx、contracts.test.tsx |
| disabled/readonly、显式 props > Form/配置、字段 id/size/status | size-status、context | headless/Input/input.test.ts；render/Input/contracts.test.tsx；browser/Input/interactions.spec.ts（form） |
| prefix/suffix、allowClear 布尔/自定义、动态 DOM/焦点 | affix、controlled | render/Input/regression.test.tsx、contracts.test.tsx；browser/Input/interactions.spec.ts（controlled/layout） |
| size 三档、status 两档、class/style | size-status、affix | render/Input/contracts.test.tsx；browser/Input/interactions.spec.ts（layout/dev） |
| showCount 布尔/formatter、maxLength | controlled、events、textarea | render/Input/contracts.test.tsx；browser/Input/interactions.spec.ts（controlled/textarea） |
| id/name/type/placeholder/ref、onFocus/onBlur/onPressEnter | basic、events | render/Input/contracts.test.tsx；smoke/Input/exports.test.tsx；browser/Input/interactions.spec.ts |
| onCompositionStart/onCompositionEnd、IME/Enter 去重 | events、search | headless/Input/input.test.ts；render/Input/regression.test.tsx；browser/Input/interactions.spec.ts（ime） |
| Password visibilityToggle/action/visible/onVisibleChange 与继承输入能力 | password、password-controlled | render/Input/contracts.test.tsx；browser/Input/interactions.spec.ts（password） |
| TextArea rows/autoSize/onResize、计数/清空、镜像与 Observer 清理 | textarea、autosize | render/Input/regression.test.tsx、contracts.test.tsx；browser/Input/interactions.spec.ts（autosize/textarea） |
| Search onSearch/enterButton/loading、动态按钮布局、Form 值/回调 | search、search-loading、context | render/Input/regression.test.tsx、contracts.test.tsx；browser/Input/interactions.spec.ts（search/form/ime/dev） |
| 根导出/类型、四组件独立挂载与卸载 | 全部 | smoke/Input/exports.test.tsx |
| headless Node 无 DOM 初始化 | 无客户端示例（不适用） | headless/Input/ssr.test.ts |
| Form 初始值响应式读取 | context | headless/Form/initial-reactive.test.ts；browser/Input/interactions.spec.ts（form） |

文档：`docs/src/pages/components/data-entry/input.tsx` 与四份 `input*-api.json`。12 个独立示例由 `example/src/pages/Input.tsx` 复用；四个组件各有章节与完整 API 表。

## 实际验证

| 检查 | 结果 |
| --- | --- |
| Input L1–L3 | 5 文件、35 条通过；另加 Form 必要依赖用例 1 条 |
| 全量 pnpm test | 133 文件、1373 条通过 |
| 根类型 / 浏览器类型 | 通过 |
| competence / components / example 构建、check:docs | 通过，16 页；保留既有 example 大 chunk 提示 |
| playwright.input.config.ts | 17 条通过（docs 9、example 8，含开发模式） |
| 文档站双 base | 根路径与 /solid-upthrust/ 各 13 条通过 |
| git diff --check | 通过 |
| 截图检查 | 已查看 docs affix、autosize、textarea；最终计数位于编辑区外，清空不遮挡文本 |

截图保存在 `packages/testing/test-results/input/` 各用例输出目录；失败 trace 由 runner 保留，重跑可能替换输出。`/tmp/input-before.log`、`/tmp/input-form-before.log`、`/tmp/input-count-before.log` 为本机失败复现日志；不把临时日志视为永久归档。

## 边界

输入法浏览器测试为合成标准事件序列，不冒充真实 OS 输入法验收。完整 Form/B01/B02、跨浏览器、消费者安装、完整 SSR、所有原生属性、字符簇计数、发布检查仍按 TODO 后续执行。现有其他物料 STRICT_READ_UNTRACKED 提示不扩大为本轮完整框架审计。

## Search 图标按钮显示修复（2026-09-20）

用户截图发现 enterButton=true 的蓝色按钮缺失放大镜。原图标作为 children 进入 Button 的普通文字 span，空行内图标无法形成有效宽度；改为通过 Button.icon 渲染，加载态由 Button 自身替换图标。

在既有浏览器 search/dev 用例补充图标可见性、遮罩非空、尺寸至少 14px 与中心偏差不超过 1px 的断言。修改前开发模式失败；修复后 docs/example/开发专项共 17 条通过，已查看 search-icons.png 确认显示。全量 133 文件、1373 条通过，根/浏览器类型、components/example/docs 构建与 diff 检查通过。没有重复站点双 base 套件。
