# C11 Spin

状态：已验收（2026-09-29；下述支持范围与 Chromium 环境）。

## 契约与修复

对照 [Ant Design Spin](https://ant.design/components/spin-cn/) 公开示例与 antd 6 源码 `spin/`（index、Indicator、Looper、Progress、usePercent、style），不宣称全 API 兼容。Spin 无 headless counterpart，延迟显示与 auto 进度两个计时器内联在组件内（双函数 effect 返回 cleanup）。

- **指示器**：修复前是边框旋转圆环；改为 antd 四点方阵：
  - holder 1em（14 / 20 / 32px），方阵 rotate(45deg) → 405deg，1.2s 转一圈；
  - 点径 (1em − 2px) / 2、scale(0.75)，opacity 0.3 → 1 交替，依次延迟 0.4s；
  - preset 新增 `animate-spin-dot` / `animate-spin-dot-item` 规则和对应 keyframes。
- **布局**：独立模式 root 即 section（inline-flex 纵向、gap 12px、主色）；description 14px、行高 1、surface 色 text-shadow。
- **嵌套**：section 在容器正中（z-1）；加载中容器 opacity 0.5 且 select-none，`::after` 白色蒙层 0.4 并拦截指针；root 改为 relative 块级（修复前是 inline-block）。
- **新增 API**：
  - `fullscreen`：fixed 铺满、45% 黑、z 1000、0.2s 淡入淡出，白色指示器与描述；
  - `percent`：数字或 `'auto'`（200ms 步进 5% / 3% / 1% 递减，永不到 100）；进度 > 0 时点阵收起，换成 100×100 viewBox 圆环（描边 20）并带 progressbar aria；
  - `description`、`indicator`（节点或工厂函数）、`Spin.setDefaultIndicator`；
  - `classNames` / `styles`（root / section / indicator / description / container，对象或函数）、`rootClass`；
  - rest 属性透传，root 带 `aria-live="polite"` 和 `aria-busy`。
- **delay**：初始值为 `spinning && !delay`；显示按 delay 防抖，隐藏立即生效；delay 变化或卸载时清理计时器。
- **ConfigProvider**：默认键加入 `description` / `indicator`。

### 破坏性改动

- 指示器视觉由圆环改为四点方阵。
- `tip` 废弃，改用 `description`；`wrapperClass` 废弃，改用 `classNames.root`。
- 嵌套 root 不再是 inline-block。
- 样式导出重命名：移除 spinIndicatorClass / spinNestedClass / spinWrapperClass / spinBackdropClass / spinTipClass，改为 spinRootClass / spinSectionClass / spinHolderClass 等；`twMerge` 换成 `mergeClass`。

### 保留差异

RTL、`Spin` 在 ConfigProvider 上的全局 classNames / styles、Progress 的 motion 细节（环直接淡入，没有 antd 的 rc-motion）。

## 能力映射

源码：`packages/components/lib/Spin/`、`packages/preset/src/{index.ts,rules/index.ts}`（keyframes 与动画规则）。

| 能力 / 覆盖 | example / docs 示例 | L1 headless | L2 smoke | L3 render | L4 browser |
| --- | --- | --- | --- | --- | --- |
| 指示器 / 尺寸 / 旋转 | spin/basic、size | spin.theme | exports | default、size | spin.size |
| 嵌套蒙层 / description | spin/nested、tip | spin.theme | — | nested | spin.nested |
| delay 防抖 | spin/delay-and-debounce | — | — | delay | — |
| 自定义 / 全局默认指示器 | spin/custom-indicator | — | exports | default-indicator | — |
| percent / auto | spin/percent | spin.auto-percent | — | percent | spin.percent（仅 example） |
| fullscreen | spin/fullscreen | spin.theme | — | fullscreen | spin.fullscreen |
| 语义化 classNames / styles | spin/style-class | — | exports | semantic | — |

测试路径：headless `Spin/theme`（2）、render `Spin/contracts`（8）、smoke `Spin/exports`（1）、browser `Spin/spin`（4 条 × 2 项目，1 条跳过）；QRCode 依赖 Spin，一起回归。

## 踩坑

- 点位于 rotate(45deg) 的方阵内，`getBoundingClientRect` 得到的外接矩形被放大 √2 倍；点径要用 `offsetWidth` 断言。
- wind4 颜色的计算值可能是 oklab（如 `text-white`），浏览器断言要用同类名的探针元素归一后再比较。
- 静态数组的 `For` 回调拿到的是值本身而不是 accessor。
- docs 示例不能导入 `common/antIcons`，自定义指示器示例内联了 svg。
- dasharray 的字符串断言受浮点格式影响，要解析成数字后用 toBeCloseTo。

## 验证记录

环境：Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0。日志目录：`output/c11-spin/`。

| 命令 / 证据 | 结果 |
| --- | --- |
| 修复前 | 边框圆环指示器、无描述间距、嵌套容器未变暗，缺 fullscreen / percent / 语义化 / setDefaultIndicator / aria-busy / rest 属性 |
| `pnpm test --maxWorkers=2` | 278 个文件、2766 条通过（vitest.log） |
| `pnpm run typecheck` / `typecheck:docs` / `packages/testing typecheck:browser` | 均通过（typecheck*.log） |
| `pnpm run build` / `pnpm run build:docs` | 通过（build.log、build-docs.log） |
| `playwright test -c playwright.c11-spin.config.ts`（Spin + QRCode） | 首轮 4 条失败（断言用了外接矩形、oklab 颜色，组件无需改动）；修正后连续两轮 27 通过、1 跳过（playwright-1.log、playwright-2.log） |
| `git diff --check` | 通过 |

截图已查看：嵌套蒙层居中、percent 30 / 60 / 90 / auto 圆环、fullscreen 遮罩（像素 140 = 255 × 0.55，确认 45% 黑）。
