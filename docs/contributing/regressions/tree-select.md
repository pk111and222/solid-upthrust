# TreeSelect 回归

状态：已验收（2026-09-23）。首轮补齐 Select、Cascader、TreeSelect 的清除按钮与弹层宽度一致性，并修复 TreeSelect 虚拟滚动双滚动条；后续浏览器补验见文末。

## 修复与补充

- 清除按钮改为与 Select 一致的 `allowClear` opt-in：只有启用、存在值且未禁用/搜索时可操作；使用原生 pointer/click 处理，清空不误开浮层。
- 复选模式下点击节点行本体与点击复选框都切换同一个节点；展开箭头仍只负责展开。逐行多选保持行点击选择/取消。
- 浮层最小宽度不再覆盖选择器测量宽度；下拉默认宽度与选择框一致，并跟随触发框尺寸变化。
- 三组件统一以 `allowClear` 控制清除按钮；有值时清除按钮替代箭头，清除/箭头共用 Select 的 20/24/28px 尺寸槽位。
- 默认弹层使用内容宽度并以选择器宽度为最小宽度；显式传入 `style.width` 时弹层固定跟随测量后的选择器宽度，不再由内容撑开。
- TreeSelect 虚拟模式仅由 `_VirtualList` 提供滚动容器；非虚拟模式由面板容器滚动，避免双滚动条。
- TreeSelect 透传树连接线、节点图标、自定义标题及缩进；公开 `treeLine` / `treeIcon`，并兼容 `showLine` / `showIcon`。
- 增加“连接线、自定义图标与标题”文档演示；补齐 `allowClear`、外观与缩进 API 说明，并更新 example 页面。
- Example 的 Form 与 TreeSelect 统一使用源码入口，避免不同包入口造成 FormItem Context 不一致。

## 验证

| 命令 / 检查 | 结果 |
| --- | --- |
| `pnpm --dir packages/testing run test headless/Select headless/Cascader headless/TreeSelect smoke/Select smoke/Cascader smoke/TreeSelect render/Select render/Cascader render/TreeSelect` | 14 个文件、103 条 L1–L3 用例通过；含三组件 allowClear、默认内容优先宽度、显式宽度优先及 TreeSelect 单滚动容器断言 |
| `pnpm --dir packages/testing run test headless/TreeSelect smoke/TreeSelect render/TreeSelect` | 3 文件、16 条通过 |
| `DOCS_CHROMIUM_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' pnpm --dir packages/testing exec playwright test --config playwright.tree-select.config.ts` | 前序 TreeSelect 修复的 docs/example 共 22 条通过；本轮宽度、图标槽位和滚动容器样式未重新执行浏览器测试 |
| `pnpm run typecheck`、`pnpm --dir packages/testing run typecheck:browser` | 通过 |
| `pnpm run check:docs` | docs 类型检查与 30 页静态构建通过 |
| `pnpm run build` | preset、competence、components、example 构建通过；保留既有大 chunk 提示 |
| `git diff --check` | 通过 |

## 边界

- 首轮按用户当时要求只运行目标非浏览器回归；后续修复已重新执行浏览器、类型与构建检查，见下节。
- 组件生成声明仍按仓库规则保留原状，公开源码类型以当前组件源码为准；未改锁文件或依赖版本。
- 前序浏览器实测为本机 Chromium；未覆盖其他浏览器、发布及部署。

## 2026-09-23 后续修复与补验

- 清空后下拉箭头延迟 120ms 出现，等待清除图标的 100ms 退出过渡完成；Select、Cascader、TreeSelect 共用同一逻辑，重新选中会取消待显示的箭头。
- 重建 docs/example 后复查 TreeSelect 浮层：默认至少与选择框等宽，选择框缩窄时树内容可撑宽浮层。此前专项浏览器断言要求始终等宽，与已约定的“内容优先”不符；已修正断言。
- `pnpm test`：180 文件、1585 条 L1–L3 通过；`pnpm run typecheck`、`pnpm run typecheck:docs`、`pnpm run build`、`pnpm run build:docs`、`git diff --check` 通过。
- TreeSelect Chromium 专项 docs/example 22 条通过；Select 39 条通过、3 条原有跳过项；Cascader 8 条通过。对应日志：`/tmp/solid-upthrust-tree-browser-full-20260923.log`、`/tmp/solid-upthrust-select-browser-full-20260923.log`、`/tmp/solid-upthrust-cascader-browser-full-20260923.log`。
