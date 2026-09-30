# C11 FloatButton

状态：已验收（2026-09-29；下述支持范围与 Chromium 环境）。

## 契约与修复

对照 [Ant Design FloatButton](https://ant.design/components/float-button-cn/) 公开示例与 antd 6.3.7 源码 `float-button/`（FloatButton、FloatButtonGroup、BackTop、style），不宣称全 API 兼容。headless 仍在 `createFloatButton`（可见性 / 回到顶部）与 `createFloatButtonGroup`（菜单开合）；渲染层负责 fixed 定位、Compact 列表、进退场动效与 tooltip 挂载。

- **headless 修复**：
  - BackTop 可见性按 `getScrollContainer` 的 scroll 事件 + rAF 节流判定，`visibilityHeight: 0` 时从一开始就显示，`onVisibleChange` 只在变化时触发；点击按 `duration`（默认 450ms）以 easeInOutCubic 滚回顶部，支持 window / document / 元素。
  - Group 支持受控 / 非受控 `open`，click 模式点组外关闭，hover 模式移入移出开合；`floatButtonGroupPlacement` 把废弃的 `direction` 映射到 `placement`。
  - 初始值读取包在 `untrack` 里，消除组件体内的 STRICT_READ_UNTRACKED 警告。
- **视觉**：
  - 40px 宽、最小 40px 高的纵向按钮，单独使用时 fixed 在右 24 / 下 48、z-index 1000、boxShadowSecondary；icon-only 图标 18px，content 12px。
  - circle 组各按钮独立带阴影、间距 16；square 组为 Space.Compact 列表（整体阴影与 8px 圆角，相邻边框重叠 1px，只圆首尾外角）。
  - 菜单模式列表距触发按钮 16px，四个方向淡入 + 40px 位移动效（300ms 后卸载）；展开时触发按钮换为 CloseOutlined。
  - BackTop 200ms 淡入淡出；徽标数字 translate(50%, -50%)，圆形额外内缩 4.686px，方形 dot 内缩 1.757px。
- **API 对齐**：
  - FloatButton：`type` / `shape` / `icon` / `content`（`description` 废弃别名）/ `tooltip`（节点或 Tooltip 属性）/ `href` + `target` / `badge` / `htmlType` / 语义化 `classNames` / `styles`（root / icon / content，对象或函数）。
  - Group：`trigger` / `open` / `defaultOpen` / `onOpenChange` / `placement` / `icon` / `closeIcon` / `shape`，语义槽 root / list / item / itemIcon / itemContent / trigger / triggerIcon / triggerContent。
  - BackTop：`visibilityHeight` / `target` / `duration` / `onClick`，其余透传 FloatButton。
  - 公开 `FloatButton.BackTop` / `FloatButton.Group` 与具名 `BackTop` / `FloatButtonGroup` 及全部类型。

### 破坏性改动

- 删除 `placement="rt|rb|lt|lb"`、`size`、`visible`、`backTop` 布尔开关与 `ref` 回传 machine；位置改由 `style` / `class` 覆盖 right / bottom。
- Group `direction`（up / down / left / right）废弃，改用 `placement`（top / bottom / left / right）。
- headless 导出 `getScrollTop` 更名 `getFloatScrollTop`（与 Anchor 的同名导出冲突）。
- 图标由 mdi 换成 antd 图标（FileTextOutlined / CloseOutlined / VerticalAlignTopOutlined）。

### 保留差异

- 未实现 RTL、ConfigProvider 的 floatButton 配置；z-index 固定 1000。
- tooltip 的 trigger 直接绑在按钮本身，不额外包裹节点（保证 fixed 与 Compact 首尾圆角）。
- 额外保留 `disabled`、`defaultOpen`、`onVisibleChange`、废弃的 `direction`。

## 能力映射

源码：`packages/components/lib/FloatButton/`，逻辑 `packages/competence/src/floatButton.ts`。

| 能力 / 覆盖 | example / docs 示例 | L1 headless | L2 smoke | L3 render | L4 browser |
| --- | --- | --- | --- | --- | --- |
| 结构 / 几何 / 类型 / 形状 / 内容 | basic / basic、type、shape、content | theme | exports | default、variants、link | geometry |
| 徽标 | badge / badge | — | exports | badge | badge |
| tooltip | basic / tooltip | — | exports | tooltip | tooltip |
| Group circle / square | group / group | — | exports | group-circle、group-square | group |
| 菜单 click / hover / 受控 / 方向 | menu、placement / group-menu、controlled、placement | group-*、placement | — | group-click、group-hover、group-controlled | menu-click、menu-hover |
| BackTop | back-top / back-top | always、threshold、initial、controlled、container-ref、cleanup、back-top、animate、helpers | exports | back-top、back-top-click | back-top |
| 语义化 | semantic / style-class | — | exports | semantic、group-semantic | — |

测试路径：headless `FloatButton/floatButton`（15）+ `theme`（1），render `FloatButton/contracts`（14），smoke `FloatButton/exports`（1），browser `FloatButton/float-button`（7 条 × 2 项目）。

## 踩坑

- 假定时器 render 测试里推进时间前必须先 `flush()`，否则本批 effect 还没挂上 rAF / 定时器；BackTop 滚动检测（rAF 写信号）与入场双帧各需一轮 tick。
- createTrigger 在组件体内读取初始配置：tooltip 配置用普通函数而不是 memo，否则触发 STRICT_READ_UNTRACKED。
- wind4 `rounded-full` 计算值是 `calc(infinity * 1px)`，浏览器断言不能比较 `50%`。
- competence 的桶文件 `export *` 遇到同名导出（Anchor 与 FloatButton 的 `getScrollTop`）会报 TS2308，只在 typecheck 暴露，vitest 不报。
- docs / example 演示框用 `transform: translateZ(0)` 让 fixed 按钮锚在框内。

## 验证记录

环境：Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0。日志目录：`output/c11-float-button/`。

| 命令 / 证据 | 结果 |
| --- | --- |
| 修复前 | placement 只有四角缩写、size 非 antd 规格、Group 无 placement / trigger 语义 / 受控 open / 组外关闭、square 组非 Compact、无 badge / content / href / 语义化、BackTop 无淡入淡出与 duration、mdi 图标 |
| `pnpm test --maxWorkers=2` | 290 个文件、2838 条通过（vitest.log） |
| `pnpm run typecheck` / `typecheck:docs` / `packages/testing typecheck` / `typecheck:browser` | 均通过（typecheck*.log） |
| `pnpm run build` / `pnpm run build:docs` | 通过（build.log、build-docs.log） |
| `playwright test -c playwright.c11-float-button.config.ts` | 连续三轮 14 条通过（browser-1..3.log） |
| `git diff --check` | 通过 |

截图已查看：单按钮几何；circle / square 组；click 菜单展开（关闭图标）；徽标偏移；tooltip 位于按钮上方。
