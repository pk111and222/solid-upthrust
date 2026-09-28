# Layout 回归

状态：已验收（2026-09-26，源码工作区）。回归范围：Layout / Header / Content / Footer / Sider，以及 competence 的 `createSider`。前序 Form、Input、Select、Grid/Space/Divider 等全部未提交改动已保留。Node 22.22.0、pnpm 11.16.0、Solid / @solidjs/web 2.0.0-rc.0。未改锁文件、ConfigProvider、preset，也未改 `BREAKPOINTS`。Splitter、Masonry 当时未开始，后续已完成回归，见 [splitter-masonry.md](splitter-masonry.md)。

## 契约与修复

旧实现对照新用例的基线：

- 直接运行：5 个用例文件全部失败。其中 3 个文件（headless sider、styles、render sider）因新出口缺失无法加载；可运行的 14 条中 13 条失败、1 条通过。
- 给旧 `sider.ts` 补上 `SIDER_BREAKPOINT_MAX_WIDTHS` / `siderBreakpointQuery` 垫片后再跑：headless sider 16 条中 9 条失败。render sider 用例在旧实现下直接导致 worker 崩溃（`Worker exited unexpectedly`）。
- 对照完成后源码已恢复，sha 已核对。

### Layout / Header / Content / Footer

- **hasSider 自动判断**：旧实现只认显式 `hasSider`，不传时即使含 Sider 也是纵向排列。现在 Sider 挂载时经 context 向最近一层 Layout 注册，卸载时注销；被包裹或条件渲染的 Sider 都能识别，只影响最近一层。显式布尔值优先，SSR 首屏可显式传 `true`。
- **内容溢出不挤压 Sider**：含 Sider 的横向 Layout 给直接子级 Content / Layout 加 `w-0`（子选择器类，flex 再撑开），与 antd 的 `width: 0` 一致。超宽表格只在内容区内部滚动，Sider 保持设定宽度。
- **宿主透传**：旧实现的 props 只有 class/style/children，原生属性、`aria-*`、`data-*`、事件与 `ref` 全部被丢弃。现在五个组件都透传到宿主元素，class 走 `mergeClass`。
- **标签**：Layout 根节点由 `section` 改为 `div`（与 antd 一致；无标题的 section 在无障碍树里没有意义）。Header / Content / Footer 仍为 header / main / footer，并带 `upthrust-layout*` 标记类。

### Sider

- **收起类型改名（破坏性）**：`onCollapse` 的第二参数 `'breakpoint'` 改为 antd 的 `'responsive'`，点击仍为 `'clickTrigger'`。`SiderCollapseType` 已同步。
- **断点**：
  - xs…xxl 的阈值为 `BREAKPOINTS − 0.02px`（lg 为 `max-width: 991.98px`），与 antd 一致。
  - 新增 `xxxl`（1919.98px），与本库 Grid 的 xxxl（≥1920）对齐；antd Sider 为 1839.98px，已在文档注明。
  - 挂载时断点结果覆盖 `defaultCollapsed`（antd 行为）。状态本就一致时不再多余回调 `onCollapse`，旧实现挂载即回调。
  - 清空 breakpoint 后 broken 复位，旧实现保持 broken。无效断点不再调用 matchMedia，旧实现会拼出 `max-width: NaNpx` 查询。动态切换时移除旧监听（旧实现已有，保留并补了用例）。
- **宽度**：数字与纯数字字符串按 px，其余 CSS 长度原样使用。宽度同时写入 `flex`（`0 0 宽度`）、width、min/max-width。与 antd 一致，`style` 中的宽度声明不生效；旧实现 `style` 会覆盖宽度，收起失效。
- **触发器**：
  - 旧实现是 `absolute bottom-0`，盖住菜单最后 48px，背景半透明，内容透出。现在用 `sticky bottom-0` 占据文档流 48px、背景不透明，不遮挡菜单；Sider 比视口高时仍贴住视口底边。antd 用 `position: fixed`，嵌在卡片或弹窗中会跑出容器，所以这里有意不同。
  - 可访问性保持 `role="button"`、`tabindex=0`、`aria-expanded`，Enter / 空格切换且不滚动页面；`aria-label` 改为中文“切换侧边栏”，箭头图标加 `aria-hidden`。新增 focus-visible 描边，旧实现聚焦时没有可见样式。
  - `reverseArrow` 翻转箭头。`trigger={null}` 不渲染任何触发器；传 JSX 只替换内容。
- **零宽触发器（新增）**：`collapsedWidth=0` 时收起后 Sider 完全隐藏，触发器改为挂在外沿、距顶 64px 的 40×40 标签，`reverseArrow` 时挂左侧。渲染条件与 antd 一致：collapsible 时总是渲染；非 collapsible 时仅在低于断点时渲染。`zeroWidthTriggerStyle` 可调位置。
- **inert**：宽度为 0 时内容容器设为 `inert`，键盘不会聚焦到隐藏的菜单。
- **语义化**：新增 `classNames` / `styles`（root / body），body 为纵向滚动、横向裁剪的内容容器。
- **浅色主题**：底色由 `surface-variant` 改为 `surface`（白色，与 antd light 一致），去掉内置右边框，由使用方按位置决定边框方向（右侧 Sider 需要的是左边框）。

## 能力映射

- 源码：
  - `packages/components/lib/Layout/{index.tsx,styles.ts}`。
  - `packages/competence/src/sider.ts`（`createSider`、`SIDER_BREAKPOINT_MAX_WIDTHS`、`siderBreakpointQuery`；`BREAKPOINTS` 未改）。
- 公开出口（`lib/index.ts`）：`Layout`、`Header`、`Footer`、`Content`、`Sider`，以及类型 `LayoutProps`、`HeaderProps`、`FooterProps`、`ContentProps`、`SiderProps`、`SiderTheme`、`SiderBreakpoint`、`SiderCollapseType`、`SiderSemanticName`。`Layout.Header === Header` 等静态属性同一引用。

文档：

- 文档页：`docs/src/pages/components/layout/layout.tsx`，API 表 `layout-api.json`（Layout / 区域 / Sider 三张）。页面含使用方式、类型出口、注意事项与 antd 差异；组件总览“布局”分类已加入口。
- 10 个示例放在 `docs/src/examples/layout/`：basic、top-side、side、custom-trigger、responsive、fixed-header、fixed-sider、theme、reverse-arrow、overflow。`example/src/pages/Layout.tsx` 复用同一批文件，每个外包 `section[data-layout-demo]`；旧 example 页使用已废弃的 `'breakpoint'` 类型字符串，已整体替换。
- 深色 Sider 示例没有用 Menu：Menu 容器写死 `text-on-surface`，放在深色 Sider 里文字不可读，且 Menu 尚未回归。示例改用小型 `ul/li` 导航。

| 能力 ID / props | 示例 | 验证位置（packages/testing 下） |
| --- | --- | --- |
| layout.hasSider 自动 / 显式 / 动态 / 嵌套隔离 | basic、top-side | L3 render/Layout/layout；L4 structure（自动方向、只影响最近一层）、topSide |
| layout 区域默认样式 / 透传 / class 合并 | basic | L1 每个类生成真实 CSS；L3 passthrough、class-merge；L4 Header 64px |
| layout.overflow（直接子级 w-0） | overflow | L1 `width:calc(var(--spacing)*0)`；L4 overflow（表格内部滚动、Sider 160px、页面无横向溢出）、mobile |
| sider.width / collapsedWidth / style 优先级 | basic（25%）、side | L3 width-format、collapsed-width、style-precedence；L4 百分比按父 Layout 计算、200↔80 |
| sider.collapsible / 点击 / 键盘 / 受控 | side、custom-trigger | L2/L3 click、keyboard、controlled；L4 collapse（箭头、aria-expanded、Enter/空格不滚动页面）、customTrigger |
| sider.trigger null / 自定义 | custom-trigger | L3 trigger-null、trigger-custom；L4 customTrigger |
| sider.trigger 粘底不遮挡 | fixed-sider | L1 sticky / 不透明底色；L4 fixedSider（滚到底最后一项在触发器上方） |
| sider.breakpoint / onBreakpoint / onCollapse('responsive') | responsive | headless 16 条（查询、变更、初始 broken、无多余回调、动态、清理、不支持、全局）；L3 responsive；L4 responsiveWide、responsive（820↔1300 实时缩放与回调顺序） |
| sider.zeroWidth 触发器 / reverseArrow / inert | responsive、reverse-arrow | L1 四种 scheme；L3 zero-trigger*、inert；L4 reverseArrow（左 40px、距顶 64px、收起后仍可点开） |
| sider.theme | theme | L1 两种配色；L3 light；L4 theme（切换后触发器与 Sider 同色） |
| sider.semantic | — | L3 semantic |
| 固定头部 | fixed-header | L4 fixedHeader |
| 出口、挂载 / 卸载 | 全部 | L2 smoke/Layout |
| dev / ssr / mobile | 文档页 | L4 dev（5658 开发服务器）、ssr（原始静态 HTML）、mobile（390px） |

## 实际验证

| 命令 / 阶段 | 结果 |
| --- | --- |
| 旧实现基线 | 见上文：5 个文件全部失败；垫片后 headless 9/16 失败，render sider 崩溃 |
| `vitest run headless/Layout render/Layout smoke/Layout`（packages/testing） | 5 文件、131 条通过（headless sider 16、styles 73、render layout 11、render sider 28、smoke 3） |
| `pnpm test` | 215 文件、2157 条全部通过 |
| `pnpm run typecheck` | 通过 |
| `pnpm --dir packages/testing run typecheck:browser` | 通过 |
| `pnpm run check:docs` / `pnpm run test:docs` | 通过，共 41 页 / docs 用例 28 条通过 |
| `pnpm run build`（含 example）+ `pnpm run build:docs` | 通过；既有 example 大 chunk 提示保留 |
| `pnpm exec playwright test -c playwright.layout.config.ts`（packages/testing） | 25 条全部通过：docs 13、example 12（dev / ssr / mobile 仅跑 docs） |
| `pnpm exec playwright test -c playwright.docs.config.ts` | 13 条通过（文档站外壳用 `Layout hasSider` + 原生 aside，改动后布局正常） |
| `git diff --check` | 通过 |

**L4 首轮 20 通过、5 失败，全部是用例问题，没有发现组件缺陷**：

1. `layout.browser.collapse`（docs）：Playwright 点击前会把元素滚入视口，用例却断言 `scrollY === 0`。改为记录按空格前的 scrollY 并比较。
2. `layout.browser.fixedSider`（两个项目）：`toBeInViewport` 判断的是页面视口，示例在首屏之外。改为断言最后一项完整落在 Sider 内容容器可视范围内、且在触发器之上。
3. `layout.browser.theme`（两个项目）：Sider 过渡 0.2s、触发器 0.1s，切换后立即取色拿到的是过渡中间值。改为轮询到两者同色。

**截图复核**：实际查看了 `test-results/layout/` 下 basic、side-collapsed、responsive-collapsed、reverse-arrow、fixed-sider、theme、top-side、mobile 截图。零宽触发器挂在外沿、触发器贴底且不遮挡菜单、浅色主题与右边框、窄屏表格内部滚动均符合预期。部分截图顶部被文档站 sticky 顶栏遮住、中文字体回退，都是截图环境问题。截图和日志是临时产物，不做永久归档。

## 测试踩坑（供后续物料参考）

- **wind4 的 0 值间距**：`w-0`、`bottom-0`、`min-h-0` 生成的是 `calc(var(--spacing) * 0)`，不是 `0`。L1 断言要按生成结果写（测试工具会去空白，写成 `width:calc(var(--spacing)*0)`）。
- **JSX 类型**：用例里 `import type { JSX }` 须来自 `@solidjs/web`，`solid-js` 不导出（TS2305）。
- **matchMedia 桩**：`createFakeMatchMedia().setMatch(query, bool)` 派发 change 事件；须在 `createRoot` 之外调用并 `flush()`。
- **Playwright**：点击会自动滚动页面，不能假设 scrollY 为 0；`toBeInViewport` 看的是页面视口，不是滚动容器；有颜色过渡的元素取色要轮询到稳定值。
- **响应式浏览器用例**：`page.setViewportSize` 后 matchMedia 的 change 事件在 Chromium 中正常派发，可在同一页面内来回缩放验证。

## 边界与后续

- **SiderContext / Menu inlineCollapsed（已在 Menu 回归中完成，见 menu.md）**：Sider 通过 `Layout/context.ts` 的 SiderContext 暴露 `siderCollapsed`，Menu 未传 inlineCollapsed 时跟随；深色 Sider 内使用 `<Menu theme="dark">`。
- **与 antd 6 的差异**：
  - xxxl 阈值 1919.98px（antd 1839.98px）。
  - 触发器 sticky 而非 fixed。
  - Header 默认浅色（antd 默认 `#001529` 深色）。
  - 媒体查询不带 `screen and` 前缀。
  - 不支持 RTL；不读取 ConfigProvider 的 layout 配置（本库 ConfigProvider 没有该项）。
- **破坏性改动**：`onCollapse` 类型 `'breakpoint'` → `'responsive'`；Layout 根节点 `section` → `div`；浅色 Sider 不再自带右边框。
- Chromium 证据不代表 Firefox/WebKit、独立安装消费者或发布验收。未提交、推送、部署、发布。C08 剩余 Splitter、Masonry（后续已完成，见 [splitter-masonry.md](splitter-masonry.md)）。
