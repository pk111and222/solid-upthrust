# Cascader 回归记录

## 范围与能力映射

本轮覆盖 Cascader 的树索引和路径列、单选/多选、受控与默认值、`changeOnSelect`、禁用节点、搜索与自定义过滤、`checkable` 父子联动、清空、虚拟列表、键盘/ARIA 入口及 Form 注入路径。修复 UI 层单选叶节点提交后浮层不关闭的问题，并补充 `aria-label` / `aria-labelledby` 公共属性。2026-09-23 追加与 Select/TreeSelect 一致的 `allowClear` 替代箭头展示和浮层宽度策略（默认内容优先、显式 `style.width` 优先）；详见 TreeSelect 回归记录。后续浏览器补验见文末。无公开子组件。

示例页面为 [example/src/pages/Cascader.tsx](/Users/zhangchen327/code/github/pk111and222/solid-upthrust/example/src/pages/Cascader.tsx)，文档页面为 [docs/src/pages/components/data-entry/cascader.tsx](/Users/zhangchen327/code/github/pk111and222/solid-upthrust/docs/src/pages/components/data-entry/cascader.tsx)，源码为 [packages/components/lib/Cascader/index.tsx](/Users/zhangchen327/code/github/pk111and222/solid-upthrust/packages/components/lib/Cascader/index.tsx) 与 [packages/competence/src/cascader.ts](/Users/zhangchen327/code/github/pk111and222/solid-upthrust/packages/competence/src/cascader.ts)。

## 测试与结果

- L1：`headless/Cascader/cascader.test.ts`，27 条通过；覆盖树模型、路径提交、受控镜像、搜索、清空、禁用和 `onSelect`。
- L2：`smoke/Cascader/exports.test.tsx`，1 条通过；覆盖公开 barrel 类型、ref、挂载和卸载。
- L3：`render/Cascader/contracts.test.tsx` 与既有 `render/Cascader/selection-integration.test.tsx`、`render/_VirtualList/Selectors.test.tsx`，9 条通过；覆盖列展开、叶节点关闭、搜索、禁用、多选及受控更新。
- L4：`playwright.cascader.config.ts` 双项目（docs 与 example）6 条通过；覆盖单选路径、搜索过滤和禁用阻断。命令：`pnpm --dir packages/testing exec playwright test --config playwright.cascader.config.ts`。
- 工程检查：`pnpm run typecheck`、`pnpm run check:docs`、`pnpm run build`、`git diff --check` 均通过。构建仍输出 example 大 chunk 与 Rollup 外部全局名提示，属于既有构建提示。

## 边界与后续

本轮沿用 C01 `_VirtualList`、Selection 和 Trigger 的局部证据；完整共享能力回归、打包消费者安装和非 Chromium 浏览器不在本物料范围。异步子节点由调用方更新 `options`，组件没有自带请求协议。

## 2026-09-23 多选显示修复

- 截图中的已勾选方框只有蓝底：真实浏览器计算出 `i-mdi-check` 为 `inline`，图标实际矩形为 0×0。将勾号与半选横线设为 `inline-block`，复查勾号实际为 10×10，截图可见白色勾号。
- 清空值后箭头延迟 120ms 出现，与 Select、TreeSelect 一致。L3 验证清空后箭头不会立刻与清除图标重叠。
- Chromium docs/example 专项 8 条通过，包含新增勾号绘制断言；原 docs 禁用用例因新增 allowClear 示例导致索引变化，已同步修正定位。全量 L1–L3 1585 条、根及 docs 类型检查、根及 docs 构建通过。日志：`/tmp/solid-upthrust-cascader-browser-full-20260923.log`。
