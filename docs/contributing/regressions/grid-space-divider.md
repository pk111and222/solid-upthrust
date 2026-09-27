# Grid / Space / Divider 回归

状态：已验收（2026-09-26，源码工作区）。三个物料复杂度都不高，所以合并回归：一起阅读、一起写文档、一起测试、一起做浏览器验证。保留前序 Form 等全部未提交改动。Node 22.22.0、pnpm 11.16.0、Solid / @solidjs/web 2.0.0-rc.0。未改锁文件、ConfigProvider、preset，也未改 `BREAKPOINTS`。

## 契约与修复

旧实现对照新 L3 用例的基线：126 条中 101 条失败、25 条通过。修复如下。

### Grid（Row / Col / useBreakpoint）

- **Col 不再默认 24 格**：不传 `span` 时宽度由内容决定，与 antd 一致。旧实现把所有 Col 都当作 `span=24`，所以 `flex` 列和纯内容列都被撑成整行。
- **响应式补齐**：
  - Col 的 `xs`…`xxxl` 接受数字（span）或 `ColSize` 断点对象 `{ span, offset, push, pull, order, flex }`。
  - Row 的 `gutter` / `justify` / `align` 接受按断点取值的对象。
  - 新增 `useBreakpoint()`，返回当前命中的断点表，没有 matchMedia（SSR）时为空对象。
  - 列宽由 CSS 变量 + 媒体查询决定，不依赖客户端测量。文档站示例是客户端渲染，所以无 JS 场景没有做浏览器验证。
- **断点语义**：competence 新增 `SCREEN_KEYS` / `SCREEN_MIN_WIDTHS` / `SCREEN_QUERIES`。
  - `xs` 表示“小于 sm”（`max-width: 575.98px`），与 antd 栅格一致。它与 `BREAKPOINTS.xs=480`（Sider/Masonry 的 min-width 阈值）是两套语义，所以没有复用、也没有修改 `BREAKPOINTS`。
  - 新增 `xxxl`（≥1920）。
  - 高断点层叠覆盖低断点：1300px 下 `xl` 覆盖 `sm`/`md`/`lg`。
- **`flex`**：数字 n 解析为 `n n auto`（antd 行为：先按内容宽度，再按比例分剩余空间，所以 2:3 不是严格的 2/5 与 3/5）；长度解析为 `0 0 长度`；其他简写原样输出。`wrap={false}` 的行里 flex 列补 `min-width:0`，长内容不撑破行宽。
- **gutter**：数字按 px，字符串为 CSS 长度，数组为 [水平, 垂直]。垂直间距用 `row-gap`，不再给列加上下内边距。
- **宿主透传**：Row/Col 的原生属性、`aria-*`、`data-*`、事件与 `ref` 全部落到宿主元素。

### Space（Space / Space.Compact / Space.Addon）

- **子项过滤**：与 antd 相同，`null` / `undefined` / 布尔 / 空串不算子项，数字 `0` 保留。
- **`separator`**：antd 6 名称；`split` 作为旧名称保留，两者同时传入时 `separator` 优先。分隔符只出现在子项之间。
- **`orientation`**：新增，优先级为 `orientation` > `vertical` > `direction`。
- **`size`**：默认 `'small'`（8px）。支持 `medium`（`middle` 的别名）、数字（px）、CSS 字符串与 [水平, 垂直] 数组。预设档位走主题类，自定义值写内联 `gap`。
- **新增 `block`**，以及语义化的 `classNames` / `styles`（root / item / separator）。
- **Space.Addon**：新增。它是紧凑组合里的带边框文本单元，随相邻控件等高。
- **Compact**：
  - 支持 `block` 与纵向排列。
  - 悬停或聚焦的子项提升层级，高亮边框不被邻居盖住。
  - 透传原生属性与 `ref`。

### Divider

- **API 对齐 antd 6**：
  - `orientation` 表示方向（horizontal / vertical）。
  - `titlePlacement` 表示标题位置。
  - 旧写法 `orientation="left|right|center"`、`type`、`dashed` 继续兼容。
  - 新增 `variant`（solid / dashed / dotted）和 `size`（small / middle / large）。
  - 新增语义化 `classNames` / `styles`（root / rail / content）。
- **`orientationMargin`**：数字与纯数字字符串按 px；标题贴近的一侧 rail 收为 0 宽。
- **rail 线色继承根节点**：
  - 两段 rail 用 `border-[inherit]`（即 `border-color: inherit`），与 antd 的 `border-block-start-color: inherit` 一致。
  - 给根节点加 `border-primary` 时，带标题分割线的两段 rail 会同步变色；旧实现写死颜色，改不动。
- **标题**：`false` / `null` / 空串不算标题；垂直分割线不渲染标题。
- **宿主透传**：原生属性与 `ref` 落到宿主元素；带 `role="separator"`，垂直时带 `aria-orientation="vertical"`。

### 共性问题

- **twMerge 不认识 preset token**：新增 `packages/components/common/merge.ts` 中的 `mergeClass`（`extendTailwindMerge`），登记间距档位与字号 token。Grid / Space / Divider 已改用它。
  - 默认 twMerge 不把 `my-lg my-0` 视为冲突，用户的 `my-0` 覆盖不了默认外边距。
  - 默认 twMerge 把 `text-body` 当成文字颜色，与 `text-on-surface` 互相吞掉，Divider `plain` 的正文字号因此丢失。
  - 库内其余约 130 个文件仍用裸 twMerge，已记入 TODO 的 D 阶段。

### Space.Compact 与 Input / Select 的圆角缺陷（浏览器回归发现）

- **现象**：Compact 的圆角覆盖只作用于直接子元素。无前后缀的 Input 根节点是不画边框的 `<span>`，边框和 `rounded` 都在内部 `<input>` 上；Select 的边框同样在内部 combobox 上。结果内侧圆角清不掉。截图可见搜索框右侧、Select 右侧仍是 6px 圆角。
- **修复**：
  - Input 非 wrapper 模式的根节点加 `rounded`，`inputClass` 由 `rounded` 改为 `rounded-[inherit]`。
  - Select 根节点加 `rounded`，`selectorClass` 改为 `rounded-[inherit]`。
  - 修复后 Compact 对根节点的 `!rounded-r-none` 会传到真正的边框；用户写在根节点上的 `class="rounded-none"` 等也同样生效。
  - `Space/styles.ts` 的注释写明了这一约定。
- **回归**：L3 `space.compact.input`、`space.compact.select`；L4 `space.browser.compact.inputs` 断言内部 input 与 Select 边框节点的四角，`space.browser.addon` 断言夹在两个 Addon 中间的 input 四角均为 0。Input、Select、Form 的专项浏览器用例复跑全部通过。

## 能力映射

- 源码：
  - `packages/components/lib/{Grid,Space,Divider}/{index.tsx,styles.ts}`。
  - `packages/components/common/merge.ts`。
  - `packages/competence/src/breakpoint.ts`（新增屏幕常量，`BREAKPOINTS` 未改）。
  - 圆角修复附带改动：`packages/components/lib/Input/{index.tsx,styles.ts}` 与 `Select/{index.tsx,styles.ts}`，均只改根节点 class 与一个圆角类，用户原有的未提交改动保留。
- 公开出口（`lib/index.ts`）：
  - `Grid`、`Row`、`Col`、`useBreakpoint`，以及类型 `RowProps`、`ColProps`、`RowJustify`、`RowAlign`、`Gutter`、`GutterValue`、`ColSize`、`ColSpanType`、`ResponsiveValue`、`ScreenMap`。
  - `Space`、`Compact`、`SpaceAddon`，以及类型 `SpaceProps`、`CompactProps`、`SpaceCompactProps`、`SpaceAddonProps`、`SpaceSize`、`SpacePresetSize`、`SpaceAlign`、`SpaceOrientation`、`SpaceSemanticName`。
  - `Divider`，以及类型 `DividerProps`、`DividerOrientation`、`DividerTitlePlacement`、`DividerVariant`、`DividerSize`、`DividerSemanticName`。
- 无 competence 状态模块：三者都是纯布局 / 展示组件，只有 `useBreakpoint` 用到 matchMedia 订阅。

文档：

- 文档页：`docs/src/pages/components/layout/{grid,space,divider}.tsx`。API 表：`grid-api.json`、`space-api.json`、`divider-api.json`。每页都含注意事项、类型出口，以及与 antd 的差异说明。组件总览的“布局”分类已加入口。
- 示例放在 `docs/src/examples/{grid,space,divider}/*.tsx`：Grid 12 个、Space 12 个、Divider 7 个。`example/src/pages/{Grid,Space,Divider}.tsx` 复用同一批文件，每个示例外包一层 `section[data-*-demo]`，供浏览器用例在两个项目中共用选择器。
- useBreakpoint 示例原先给 Tag 传 `data-screen`，但 Tag 不透传原生属性（见“边界”），属性被静默丢弃。已改为在外层 span 上标记，用例改为读取 Tag 文字。

| 能力 ID / props | 示例 | 验证位置（packages/testing 下） |
| --- | --- | --- |
| grid.span / offset / push / pull / order | basic、offset、sort、order | L1 列变量与媒体查询类；L3 render/Grid；L4 span、offset、order（静态 + 420/640/800/1100 响应式） |
| grid.gutter：数字 / 字符串 / 数组 / 响应式 | gutter、playground | L3；L4 gutter（色块间距 16、行距 24、外沿对齐）、gutter.responsive（1280/900/700/420/1100）、playground 键盘驱动 |
| grid.justify / align（含响应式） | flex、align、responsive-more | L1；L3；L4 justify-align 六种主轴与四种交叉轴几何、responsive.more |
| grid.flex / wrap=false | flex-stretch | L3；L4 flex（`2 2 auto` / `3 3 auto`、去掉内容宽度后剩余空间 2:3、`0 0 100px`、nowrap 不溢出） |
| grid.responsive：xs…xxxl、ColSize 对象、span 0 隐藏 | responsive、responsive-more | L1 媒体查询断点值；L3 matchMedia 桩；L4 420/600/800/1000/1300/1700 六档列宽 |
| grid.useBreakpoint | use-breakpoint | L3；L4 1280/700/420/2000 实时命中表 |
| space.size / orientation / align / wrap | base、vertical、size、align、wrap | L1 预设档位真实 CSS；L3 render/Space；L4 实测间距、自定义滑块 40→42、四种对齐、换行行列距 |
| space.separator / split / 子项过滤 | base、separator | L3；L4 separator（只在子项之间、Divider 作分隔符） |
| space.semantic / block | semantic、block | L3；L4 semantic、block（撑满父容器内容区） |
| space.compact：水平 / 纵向 / block / 层级 / 输入类圆角 | compact-buttons、compact、compact-vertical | L1 选择器类生成；L3（含 Input/Select 圆角继承）；L4 -1px 重叠、四角圆角、悬停与聚焦 z-index |
| space.addon | addon | L3；L4 addon 等高相接、中间 input 四角直角 |
| divider.horizontal / titled / orientationMargin | horizontal、with-text、orientation-margin | L1 rail 各档宽度；L3 render/Divider；L4 1px 顶边、24/16px 间距、rail 等长、5% 短线、0/48/20% 标题偏移 |
| divider.variant / size / plain / vertical | horizontal、size、plain、vertical | L1 线型、间距、字号；L4 三种线型、8/16/24px、字重 400/500、行内 0.9em |
| divider.semantic / rail 继承 | semantic | L1 `border-[inherit]` → `border-color:inherit`；L4 根节点主色传到 rail、classNames.rail 覆盖 |
| 出口、挂载 / 卸载 | 全部 | L2 smoke/{Grid,Space,Divider} |
| dev / ssr / mobile | 文档页 | L4 dev（5658 开发服务器）、ssr（原始静态 HTML）、mobile（390px 无横向溢出、Segmented 不越界） |

- **L1**：用 createGenerator(presetWind4 + presetUpthrust) 生成真实 CSS。
- **L2**：出口与挂载。
- **L3**：DOM 合同，响应式用 matchMedia 桩。
- **L4**：Chromium 真实排版几何，docs 与 example 两个项目都跑。

## 实际验证

| 命令 / 阶段 | 结果 |
| --- | --- |
| 旧实现 L3 基线 | 126 条：101 失败 / 25 通过 |
| `vitest run headless/{Grid,Space,Divider} render/… smoke/…`（packages/testing） | 12 文件、302 条通过（Grid 175、Space 63、Divider 64） |
| `pnpm test` | 211 文件、2031 条全部通过 |
| `pnpm run typecheck` | 通过 |
| `pnpm --dir packages/testing run typecheck:browser` | 通过 |
| `pnpm run check:docs` / `pnpm run test:docs` | 通过，共 40 页 / docs 用例 28 条通过 |
| `pnpm run build` + example build + `pnpm run build:docs` | 通过。components dist CSS 已确认包含 `rounded-[inherit]{border-radius:inherit}`。既有 example 大 chunk 提示保留 |
| `pnpm exec playwright test -c playwright.grid-space-divider.config.ts`（packages/testing） | 68 条全部通过：docs 38、example 30（dev / ssr / mobile 仅跑 docs） |
| 相关专项复跑 | Flex 21、Select 39（3 条原有跳过）、Input 17、Form 22（4 条原有跳过）全部通过 |
| `git diff --check` | 通过 |

**L4 首轮 58 通过、10 失败**。其中 1 项是组件缺陷，其余是测试或示例问题：

1. **组件缺陷**：`space.browser.compact.inputs`（两个项目）。即上文 Compact + Input/Select 圆角缺陷，已修复。
2. **示例问题**：`grid.browser.useBreakpoint`（两个项目）。Tag 不透传 `data-screen`，示例改为在外层标记。
3. **断言写错**：`grid.browser.flex`（两个项目）。原断言按严格 2/5 计算，与 antd 的 `n n auto` 语义不符。改为断言计算后的 `flex` 值，以及去掉内容宽度后剩余空间为 2:3。
4. **文档容器影响**：
   - `space.browser.base`：文档示例容器是 `flex-col`，会把 inline-flex 的 Space 块级化并拉伸。文档站只断言类名，example 仍断言收缩到内容宽度。
   - `space.browser.block`：父容器矩形包含 32px 内边距，改为比较父容器内容区宽度；Compact block 的同类断言一并修正。
5. **SSR 断言前提错误**：`{grid,space,divider}.browser.ssr`。文档站示例只在客户端渲染，静态 HTML 只有占位与示例源码。改为只断言页面文字与源码，删除了无 JS 的布局检查。

**截图复核**：实际查看了 `test-results/grid-space-divider/` 下 compact、addon、gutter、divider semantic 等截图。修复前搜索框、Select 的内侧圆角清晰可见；修复后四个紧凑组合全部直角相接。截图和日志是临时产物，不做永久归档，浏览器 runner 已退出。

## 测试踩坑（供后续物料参考）

- **Solid 2 `For` 传原始项**：`For` 回调拿到的是原始数组项，不是访问器，写用例和渲染子项时不要再调用一次。
- **happy-dom 把数字 0 写成空串**：Solid 对纯数字子节点走 `textContent` 赋值，happy-dom 会把 `0` 写成空串。Space 先把数字转成字符串再插入，真实浏览器行为不变。
- **信号写入是批处理的**：用例里改完信号须 `flush()`。matchMedia 桩的 `change` 派发必须放在 `createRoot` 之外，否则会在 owner 内写信号而报错。
- **UnoCSS wind4 的 border 任意值**：`border-[inherit]` 生成 `border-color:inherit`，而 `border-inherit` 生成的是 border-style；`[border-color:inherit]` 这类任意属性类不会被 twMerge 合并。
- **Playwright 取矩形**：`evaluate` 里不能直接返回 DOMRect，它的字段是原型 getter，跨进程序列化后全部丢失。须先拷成普通对象。
- **文档示例容器**：Demo 容器是 `p-7 md:p-8 flex flex-col`，会拉伸 inline 元素。父元素 `getBoundingClientRect` 含内边距，比较宽度时要用内容区宽度。

## 边界与后续

- **其他输入类控件同样的 Compact 圆角问题（未改）**：DatePicker / RangePicker、TimePicker / RangePicker、Cascader、TreeSelect、AutoComplete、Mentions 的根节点都是不画边框的 `relative inline-flex w-full`。它们放进 Space.Compact 时很可能有同样问题，按本次约定修复即可：根节点加 `rounded`，边框节点改为 `rounded-[inherit]`。这些物料不在 C08 范围内，本轮只记录，未做浏览器验证。
- **Tag 不透传原生属性（未改）**：`data-*`、`aria-*` 等会被静默丢弃。属于 Tag 物料的回归范围，已记入 TODO。
- **Input.Search 的冗余覆盖（未改）**：Search 内部为 enterButton 写了 `[&>input]:!rounded-r-none` 兜底。圆角改为继承后，这行已不是必需，但仍然正确，本轮不动。
- **twMerge 迁移**：库内其余约 130 个文件仍用裸 twMerge，建议在 D 阶段统一换成 `mergeClass`。
- **与 antd 6 的差异**：
  - Grid、Space、Divider 不读取 ConfigProvider 的对应配置（本库 ConfigProvider 没有这些项）。
  - Col 的响应式靠 CSS 媒体查询，不像 antd 那样用 JS 计算；useBreakpoint 仍是 JS 订阅。
- Chromium 证据不代表 Firefox/WebKit、独立安装消费者或发布验收。未提交、推送、部署、发布。C08 下一物料 Layout 尚未开始。
