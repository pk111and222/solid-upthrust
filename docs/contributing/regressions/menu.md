# C10 Menu（含 D13）

状态：已验收（2026-09-28；下述支持范围与 Chromium 环境）。范围为 Menu，以及必要的依赖路径 Layout SiderContext（D13）。

## 契约与修复

对照 [Ant Design Menu](https://ant.design/components/menu-cn/) 页面，逐项核对了以下来源，不宣称全 API 兼容：

- 全部公开示例：horizontal、horizontal-dark、inline、inline-collapsed、tooltip、sider-current、vertical、theme、submenu-theme、switch-mode、style-class、custom-popup-render、extra-style。
- antd 6.6.5 源码：`menu/{index,menu,MenuItem,SubMenu,MenuContext}` 与样式。
- @rc-component/menu 1.5 源码：`Menu`、`SubMenu`、`MenuItemGroup`、`useAccessibility`、`useKeyRecords`。
- 实测 DOM。

- **competence/menu 重写**：
  - key 路径注册表：分组不进入路径，分割线跳过；无 key 的分组 / 分割线获得稳定的位置 key。
  - 选中：selectable / multiple。onClick 先于 onSelect / onDeselect；点击信息含 keyPath（叶子在前）、item 与 itemData。单选、非 inline 时点击会关闭所有弹层，无论是否 selectable。
  - 展开：先移除再追加；非 inline 关闭父级时连带关闭子路径，列表未变化时不回调。
  - 模式派生：inline / vertical 加 inlineCollapsed 派生为收起的 vertical。挂载后切出 inline 会清空展开项，切回 inline 恢复缓存（rc inlineCacheOpenKeys）。
  - 键盘：移植 rc useAccessibility，通过 `data-menu-owner` / `data-menu-key` / `data-menu-list` DOM 标记驱动，Portal 出去的弹层也参与导航。
  - 同一批次的连续操作经同步镜像读取，不丢写。
- **UI 重写**：
  - 根节点：`ul role=menu tabindex=0`。
  - 子菜单：`li role=none` 下挂 `div role=menuitem`，带 aria-expanded / haspopup / controls。
  - 分组：`li role=presentation`，其中 `ul role=group`。分割线：`li role=separator`。
  - inline 缩进为 层级 × inlineIndent（默认 24）。子列表用 grid-rows 过渡高度，关闭时 inert。
  - 非 inline 子菜单使用 createTrigger：hover 支持 subMenuOpenDelay / subMenuCloseDelay，click 时 trigger 设为 manual、由标题自行切换。水平一级弹层从下方弹出，其余从右侧弹出，朝向触发器一侧留 8px padding，保证 hover 连续。水平一级弹层的最小宽度取 max(160px, 标题宽)。嵌套弹层渲染在父弹层内，不被裁剪，外部点击判定也连续。
  - 其余能力：popupOffset、popupClassName、子菜单 theme、popupRender（子菜单优先）、expandIcon（null / false / 函数 / 节点）、forceSubMenuRender。
- **收起**：
  - 根宽 80px，一级项 padding 为 calc(50% - 12px)，使图标居中。文字宽度归零并淡出。无图标的一级字符串标签只显示首字符（子菜单标题同理）。
  - 一级菜单项悬浮时显示右侧提示（createTooltip）：tooltip 为 false 时关闭，也可配置 placement / title。提示为受控状态，收起状态变化时复位（antd #56528）。
- **主题**：
  - 浅色：hover 为 on-surface/6，选中为 primary/10 底加 primary 文字。
  - 深色：与 Sider 一致使用 inverse-surface，文字 65%，选中为 bg-primary 加白字，危险项选中为 bg-error。深色水平菜单无底边框、无下划线，选中项为整块 primary 底色。
  - 水平菜单在 hover / 选中 / 展开时显示 2px 底部指示条。
- **语义化**：classNames / styles 支持对象与函数形式（函数参数为 `{ props }`）。节点包括 root / itemTitle / list / item / itemIcon / itemContent / popup / subMenu；一级节点取顶层值，子菜单内的节点取 subMenu.*，与 antd 一致。
- **D13 SiderContext**：
  - `Layout/context.ts` 独立导出 SiderContext / SiderContextProps，Menu 不需要引入整个 Layout，barrel 已补导出。
  - Menu 未传 inlineCollapsed 时跟随 `siderCollapsed`，显式传值优先。
  - 深色 Sider 内使用 `<Menu theme="dark">` 保证可读，Layout 的“侧边布局”示例已改用 Menu。
- **保留的本库扩展**：`renderLabel`（docs 导航依赖，对分组标题同样生效）；`icon` 可为图标类名字符串；`MenuItem` 作为 `MenuItemType` 的兼容别名。
- **行为变化**：
  - 旧 Menu 的根节点是 div，现在是 ul。
  - 子菜单改为 hover 弹出，旧版为 click。旧版水平子菜单用 click，现在默认 hover，可用 `triggerSubMenuAction="click"` 恢复。
  - onSelect 的参数扩展为完整的 MenuSelectInfo。
  - `MenuItem.key` 变为可选（分组 / 分割线可省略），docs 的 Document.tsx 已适配。
- **保留差异**（文档“暂不支持”已写明）：水平菜单溢出折叠（overflowedIndicator）、RTL、ConfigProvider menu 全局配置、Menu.Item 等 JSX 子组件写法。

## 能力映射

源码：
- 组件：`packages/components/lib/Menu/{index.tsx,styles.ts}`。
- Layout：`packages/components/lib/Layout/{context.ts,index.tsx}`。
- 逻辑：`packages/competence/src/menu.ts`。

| 能力 / 覆盖 | example / docs 示例 | L1 headless | L2 smoke | L3 render | L4 browser |
| --- | --- | --- | --- | --- | --- |
| 路径注册、点击顺序、keyPath / itemData | menu/inline | menu：paths、click | exports | click | inline |
| 多选、取消选中、单选关闭弹层 | menu/multiple | multiple | — | click | multiple |
| 展开级联关闭、批处理同步镜像 | menu/sider-current | open | — | click | vertical |
| 模式派生、inline 展开项缓存 | menu/switch-mode、inline-collapsed | collapse | — | sider | switchMode、collapsed |
| 键盘导航（inline / vertical / horizontal） | menu/vertical | keyOffset | — | keyboard | vertical |
| aria 结构、禁用、分组 / 分割线 | menu/extra | — | — | aria | horizontal |
| inline 缩进 | menu/inline | — | — | indent | inline |
| 弹层定位、嵌套、最小宽度、点击触发 | menu/horizontal、vertical、multiple | — | — | — | horizontal、vertical、multiple |
| 收起提示与 placement | menu/inline-collapsed、tooltip | — | — | — | collapsed、tooltip |
| 主题 / 子菜单主题 / 深色水平 | menu/theme、submenu-theme、horizontal-dark | theme：全变体无死类 | exports | sider | theme、horizontalDark |
| 语义化 classNames / styles | menu/style-class | — | — | semantic | — |
| popupRender、extra、danger | menu/custom-popup-render、extra | — | — | — | popupRender |
| renderLabel 原生链接 | menu/render-label、docs 导航 | — | — | label（既有） | docs design |
| D13 SiderContext | layout/side | — | exports | sider | layout.collapse |

完整测试路径以 `packages/testing/<层>/Menu/` 为前缀，所有新增用例都附中文说明。浏览器配置为 `playwright.menu.config.ts`，docs 与 example 两个 project。

## 回归中发现的问题

- **示例图标缺失**：共享数据文件 `examples/menu/data.ts` 是 .ts 文件，UnoCSS 不提取其中的类名，部分图标因此没有生成 CSS。已加 `// @unocss-include`。
- **测试写法**：headless 用例若用 `{ ...config }` 展开传入 getter，展开时会求值一次，响应性随之丢失，所以响应式 config 必须直接构造。浏览器取色有颜色过渡，须轮询到稳定值。

## 验证记录

环境：Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0（未升级）。日志目录：`output/menu/`。

| 命令 / 证据 | 结果 |
| --- | --- |
| 修复前 | 旧 Menu 引用的样式名在 styles 重写后不存在，无法构建；原本也缺少 inline 收起、tooltip、语义化、popupRender、键盘导航和深色主题，放进深色 Sider 时文字不可读 |
| `vitest run headless/Menu render/Menu smoke/Menu` | 4 个文件 16 条通过 |
| `pnpm test --maxWorkers=2` | 261 个文件、2680 条通过（test.log） |
| `pnpm run typecheck` / `typecheck:docs` / `packages/testing typecheck:browser` | 均通过（typecheck*.log） |
| `pnpm run build` / `pnpm run build:docs` | 通过（build.log、build-docs.log） |
| `playwright test -c playwright.menu.config.ts` | 20 条通过（docs 10 + example 10），连续多轮稳定（playwright-final.log） |
| `playwright test -c playwright.layout.config.ts` | 25 条通过（side 示例改用 Menu 后回归） |
| `playwright test -c playwright.docs.config.ts design.spec.ts` | 4 条通过（docs 导航 Menu） |
| `git diff --check` | 通过 |

截图已查看（`output/menu/screenshots/`）：
- inline 缩进与展开；
- 深色 inline 选中；
- 收起后图标居中，并显示右侧提示与右侧弹层；
- 水平菜单弹层、深色水平菜单；
- extra 右对齐与危险项。
