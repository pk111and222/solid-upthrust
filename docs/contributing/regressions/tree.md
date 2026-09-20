# Tree 回归

状态：已验收（2026-09-20，当前源码工作区）。Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0，未升级依赖。保护接手时 Input/Pagination 等已有未提交内容。

## 修复与契约

- checkedKeys/defaultCheckedKeys 隐式开启复选时，补齐容器 aria-multiselectable；显式 checkable=false 仍优先。
- 自定义标题中的输入框、按钮等交互内容保留自身点击与键盘行为，修复行点击抢焦点、树键盘处理拦截输入；组合输入不触发树操作。
- 受控搜索被父层拒绝时恢复原生输入值，避免输入文本与实际过滤结果不同步。
- 禁用节点的复选框不再抢走启用节点的焦点。
- 内部 TreeInPanel 虚拟路径补统一空态；TreeSelect 自身已有外层空态，此项不宣称此前 TreeSelect 空态缺失。
- 重复 startDrag 会先结束旧拖拽，清除目标和悬停定时器，避免旧任务展开新拖拽的目标。
- 浏览器发现焦点样式生成到不接收焦点的内部 div：改为 treeitem 的 :focus-visible 控制直接子行，补 solid 线型并向内绘制，避免轮廓被展开动画容器裁剪。
- 未增加独立 Tree 的虚拟化、异步加载、触屏拖拽或键盘排序能力。局部 disabled 节点仍允许鼠标展开查看，整体 disabled 阻止展开；该既有差异已明确写入文档。

## 能力与文件映射

实现：`packages/components/lib/Tree/index.tsx`、`packages/competence/src/tree.ts`、`treeDrag.ts`；公开 UI 导出 Tree/TreeProps/TreeNode、moveTreeNode 与拖拽元数据类型完整，无 barrel 改动。tree.ts 本轮未改行为；TreeSelect 共用渲染器的改动通过代表性集成验收。

文档为 `docs/src/pages/components/data-entry/tree.tsx`、`tree-api.json`、`tree-node-api.json`；10 个独立 `docs/src/examples/tree/*.tsx`，共享节点数据 `data.ts` 也以 ?raw 展示。`example/src/pages/Tree.tsx` 复用相同示例。SSR 页面不执行客户端示例。无公开子组件；TreeInPanel 为内部共用实现，不建公开子组件章节。

| 能力 ID / props 或方法 | 示例 | 测试（packages/testing/ 下） |
| --- | --- | --- |
| tree.state：treeData、expandedKeys/defaultExpandedKeys/defaultExpandAll、selectedKeys/defaultSelectedKeys、onExpand/onSelect、selectable/multiple | basic、controlled、strict | L1 headless/Tree/tree.test.ts 展开/选择/更新组；L3 render/Tree/contracts.test.tsx controlled.states/keyboard.navigation；L4 browser/Tree/interactions.spec.ts keyboard/controlled/check |
| tree.check：checkable/checkStrictly、checkedKeys/defaultCheckedKeys、onCheck、节点 disabled/checkable/selectable | check、strict、controlled、disabled | L1 tree.test.ts 联动/禁用/独立勾选/TreeSelect 策略；L3 contracts.test.tsx check.implicit/controlled.states/disabled.focus；L4 check/disabled |
| tree.search：showSearch/searchValue/onSearch/searchPlaceholder/notFoundContent、动态数据 | search、empty | L1 tree.test.ts 搜索/更新组；L3 contracts.test.tsx search.controlled/presentation.search/panel.empty；L4 search |
| tree.presentation：showLine/showIcon/indent/titleRender/icon、aria-label/class/style/ref | appearance、editable | L3 contracts.test.tsx presentation.search/keyboard.embedded；L4 paint/embedded/dev（真实行高、缩进、线条、图标、焦点） |
| tree.drag：draggable/allowDrop、onDragStart/Enter/Over/Leave/End/onDrop、moveTreeNode | drag | L1 headless/Tree/drag.test.ts（防环、禁用、allowDrop、三种重排）、lifecycle.test.ts（restart/hover.cleanup/dynamic）；L3 render/Tree/Tree.test.tsx 原生事件元数据；L4 drag（实际 HTML5 拖动更新数据） |
| tree.commands：visibleKeys/activeKey/navigate、索引 helpers、search/clear、setExpandedKeys/setCheckedKeys | basic、search；命令由 headless 用例直接覆盖 | L1 tree.test.ts/helpers/navigation 与 lifecycle.test.ts commands.boundaries；L3 keyboard.navigation；L4 keyboard/panel |
| tree.exports.provider：公开类型/函数、全局禁用和显式覆盖、卸载 | 所有 Tree 示例 | L2 smoke/Tree/exports.test.tsx；根类型检查、生产 example 导入挂载 |
| tree.panel：内部虚拟列表路径与必要 TreeSelect 集成 | 既有 example TreeSelect 万条数据示例 | L3 contracts.test.tsx panel.empty；L4 panel，End 定位节点 9999、真实焦点与 Enter 选择；沿用 C01 _VirtualList 基础证据 |

层次按风险分配，不重复全套矩阵。纯视觉无 L1；L2 仅覆盖入口/配置/挂载/卸载；L3 不验证真实绘制。无网络或异步加载接口，请求竞态不适用；拖拽 500ms 延迟、离开/结束/重新开始/卸载清理有 fake timers 实测。TreeConfig/TreeIns 的低层 setter 不发回调且仅写非受控状态；clear 只清空搜索，保留选择。

## 实际验证

| 命令 / 检查 | 结果 |
| --- | --- |
| `pnpm --dir packages/testing run test headless/Tree render/Tree` 基线 | 3 文件、47 条通过，包含既有 createTreeSelect 共用逻辑用例 |
| 失败复现 | DOM 新用例 5 条失败；另复现重启拖拽旧目标残留、内嵌输入点击抢焦点；浏览器复现焦点线型/选择器错误及截图裁剪 |
| `pnpm --dir packages/testing run test headless/Tree render/Tree smoke/Tree` | 6 文件、60 条通过；修复后专项复验同样通过 |
| `pnpm test` | 139 文件、1395 条通过；收尾一次全量，之后仅修焦点 CSS/精简重复空态并执行相关专项 |
| `pnpm run typecheck`、`pnpm --dir packages/testing run typecheck:browser` | 通过 |
| `pnpm run build` | preset、competence、components、example 全部通过；保留既有 example 大 chunk 提示 |
| `pnpm run check:docs` | 类型/静态 SSR 构建通过，18 页，base=/ |
| 焦点样式修复后 components/example/docs 构建 | 通过；只重建受影响产物，未重复 competence/preset |
| `playwright test --config playwright.tree.config.ts` | 18 场景首轮 15 通过；paint 的 docs/example 失败为真实样式问题，panel 为定位错误。最终 paint/panel/dev 定向 4/4 通过；向内轮廓修复后 paint/dev 定向 3/3 通过，截图复验通过 |
| `git diff --check` | 通过 |

浏览器命令在 `pnpm --dir packages/testing exec` 下执行，环境 `DOCS_CHROMIUM_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'`。最终范围为 docs 9、example 9；开发 CSS 与生产交互都覆盖。失败重跑仅跑失败或受影响场景，没有用跳过或放宽断言消除失败。

日志位于本机 `/tmp/tree-regression/`：baseline、reproduce、drag-before、embedded-before、target、final-target、full、typecheck、final-typecheck、browser-typecheck、build、docs-build、browser、browser-retry、browser-final、focus-*。临时日志不是永久归档。截图在 `packages/testing/test-results/tree/` 的 paint 输出目录，已实际查看最终 docs/tree.png，完整焦点框、图标、连接线与禁用样式正常。截图审查发现并修正了轮廓上沿裁剪。浏览器 runner 已停止自己启动的服务。

## 限制与交接

- 不自动开始 C04。_VirtualList 源码未修改，不把本轮必要集成测试称为完整 TreeSelect/B07 验收。
- 未改路由/base/SSR 架构或站点公共框架，不重复站点双 base 通用套件；新页以根路径静态构建与目标页面浏览器验证。
- 独立 Tree 全量渲染，虚拟化仅供 TreeSelect 内部使用。节点 value 必须全树唯一，响应式数据用新数组更新；保留业务保存的已移除节点键，不自动清理调用方状态。
- 仅验证当前本机 Chrome；跨浏览器、独立消费者安装、发布/部署和完整 A/B/D 仍待后续任务。开发模式既有 STRICT_READ_UNTRACKED 提示仍列入 B01 框架审计范围，本轮未宣称消除。
- 无提交、推送或发布。构建产物只由构建生成，未手工修改。

## 用户截图补验：勾选图标（2026-09-20）

用户发现勾选框仅有蓝底，没有白色对勾。原测试只检查 aria-checked，未检查勾选图标的实际绘制。图标遮罩资源已生成，但空行内 span 不形成有效宽度。将 Tree 的 mark 包装层设为 inline-flex，使对勾/半选短横线作为 flex 子项获得 10×10px 的实际尺寸；状态逻辑未变。

在既有 browser check/dev 场景增加：图标可见、遮罩非空、尺寸至少 10px、背景非透明，以及通过 canvas 归一化 CSS 色彩空间后验证对勾为白色。修复前 docs/example 两条均失败；修复后 docs/example/开发模式共 3 条通过，已实际查看 checked.png，白色对勾正常。测试调整了直接行定位，避免选中后同时匹配后代图标；白色可能以 oklab 返回，不能仅比较 rgb 字符串。

重新执行专项 60 条、全量 1395 条，根/浏览器类型检查、components/example/docs 构建与 diff 检查均通过。复用已有其他交互证据，不重复双 base 套件。日志为 `/tmp/tree-regression/checkmark-*.log`；截图为 `packages/testing/test-results/tree/` 下 check 场景的 checked.png。
