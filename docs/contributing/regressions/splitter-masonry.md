# Splitter / Masonry 回归

状态：已验收（2026-09-26，源码工作区）。回归范围：Splitter / Panel、Masonry，以及 competence 的 `createSplitter`、`createMasonry`。前序 Form、Input、Select、Grid/Space/Divider、Layout 等全部未提交改动已保留。Node 22.22.0、pnpm 11.16.0、Solid / @solidjs/web 2.0.0-rc.0。未改锁文件、ConfigProvider、preset，也未改 `BREAKPOINTS`。至此 C08 全部物料回归完成。

## 契约与修复

旧实现对照新用例的基线：

- 新用例直接跑在 HEAD 代码上：107 条失败、15 条通过。
- HEAD 上原有的 headless 用例（18 条）在 HEAD 代码上全部通过；跑在新代码上有 4 条失败，逐条说明如下：
  - 2 条是 Masonry 旧用例的桩写法问题：在 `createRoot` 内调用 `setMatch` 写信号，会触发 REACTIVE_WRITE_IN_OWNED_SCOPE。与组件行为无关。
  - 1 条是 Masonry 回退规则变更（见下文）：`{ sm: 2, lg: 5 }` 一个断点都不命中时，旧实现回退到最大断点的值，新实现得到 1。
  - 1 条是 Splitter aria 契约变更（见下文）：aria 值由 px 改为百分比。
- 这 4 条是契约变更，不是回归缺陷。旧用例文件已被新用例整体替换，没有删改断言去迁就实现。

### Splitter

- **尺寸语义**：
  - 数字与纯数字字符串按 px，百分比按容器尺寸。
  - `autoSplitterSizes` 保证面板之和始终等于容器：
    - 未设置尺寸的面板平分剩余空间。
    - 全部面板都设置了尺寸、但之和不等于容器时，按比例缩放。
    - 已设置的尺寸之和已超出容器时也按比例缩放，未设置的面板为 0。
    - 最后按 min / max 修正。
- **容器内容区（本轮浏览器回归发现并修复）**：
  - 旧的测量读 `offsetWidth / offsetHeight`，其中包含边框与内边距。带 1px 边框的外框因此多算 2px。
  - flex-shrink 会把面板悄悄压回容器，所以画面看起来正常；但 `onResize` 上报的尺寸之和、aria 百分比、折叠后的尺寸都会偏大。示例里是 848 vs 846。
  - 现在测量时减去主轴两侧的边框与内边距，新增 render 用例 `contentBox`。
  - antd 同样读 offsetWidth。它的示例用 box-shadow 而不是边框，所以没有暴露这个问题。
- **容器尺寸变化**：与 antd 一致，没拖拽过的 px 默认尺寸在容器变化时保持不变，由其余面板吸收差值；拖拽过之后按比例记录，并等比缩放。容器尺寸为 0（被隐藏）时保留上一次布局。
- **受控 `size`（新增）**：拖拽只通过 `onResize` 通知，外部写回后才生效。`onResizeEnd` 收到最终尺寸。
- **折叠（新增）**：
  - `collapsible`：布尔值或 `{ start, end, showCollapsibleIcon }`。
  - 分隔条的起始侧按钮来自前一面板的 `end`，末尾侧按钮来自后一面板的 `start`。
  - 折叠到 0 时不受 min 限制；再次点击恢复缓存的尺寸。
  - `collapsible.motion` 让 flex-basis 带过渡，拖拽中关闭过渡。
  - `collapsible.icon` 可自定义图标。按钮的 aria-label 为中文“切换起始侧面板 / 切换末尾侧面板”。
  - 按钮显示模式：
    - 悬停模式在无悬停能力的设备（`hover: none`）上常显。
    - `showCollapsibleIcon: true` 为常显，`false` 为不显示。
- **lazy（新增）**：拖拽中只移动预览线（按 min / max 夹取），松开后一次性应用。
- **方向**：`orientation` / `vertical` 为新增写法；`layout` 已废弃，但仍然生效。
- **键盘**：
  - 方向键按 `keyboardStep` 调整（默认 16px）。Home / End 推到两端，受 min / max 限制。
  - `keyboardResize` 的返回值表示按键是否已处理，UI 据此 preventDefault。这两项都是对 antd 的扩展。
- **aria（契约变更）**：`aria-valuenow / min / max` 为前一面板占容器的百分比，符合 WAI-ARIA 窗口分隔条模式；旧实现与 antd 使用 px。
- **拖拽**：
  - 只响应主按钮。
  - 拖拽中出现覆盖整个视口的 fixed 遮罩，锁定调整光标。
  - 两次按下间隔小于 300ms 视为双击，不开始拖拽，并触发 `onDraggerDoubleClick`。
  - 拖拽中卸载组件会移除 window 监听。
- **其他新增**：`destroyOnHidden`，语义化的 `classNames` / `styles`（含 dragger.active），`draggerIcon`。
- **出口**：旧的 `splitterClass`、`splitterBarClass`、`splitterDraggerClass`、`splitterPanelClass` 样式辅助函数已删除（包入口从未导出过）。补齐了全部类型出口。

### Masonry

- **定位方式**：旧实现是 flex 分列，新实现按实测高度绝对定位。测量前是 grid，测量后改为 relative。每项有三种状态：static / placed / pending。placed 带 0.3s 过渡，并遵守 `prefers-reduced-motion`。
- **断点**：使用与 Grid 相同的 `SCREEN_QUERIES`（xs 为 `max-width: 575.98px`，其余为 min-width），不再自拼查询。
- **回退（契约变更）**：`columns` 在所有断点都未命中时取 `xs ?? 1`，旧实现取最大断点的值。
- **默认值（契约变更）**：`columns` 由 4 改为 3，`gutter` 由 `'small'` 改为 0，与 antd 一致。
- **gutter**：
  - 支持 `[水平, 垂直]` 与响应式对象。
  - 垂直值未解析时沿用水平值；gutter 不做 xs 回退。
  - 新增出口 `resolveMasonryGutter`。
- **排列策略**：
  - 默认按最短列优先，高度相同时取靠前的列。
  - `sequential` 按阅读顺序分组，属于本库扩展，保留。
  - `item.column` 可固定某项所在的列。
- **其他新增**：
  - `items` / `itemRender`；`fresh` 在单项尺寸变化时重排。
  - `onLayoutChange` 上报每项所在的列。
  - `MasonryIns.screens` 公开当前命中的断点。

## 能力映射

- 源码：
  - `packages/components/lib/Splitter/{index.tsx,styles.ts}`、`packages/components/lib/Masonry/{index.tsx,styles.ts}`。
  - `packages/competence/src/{splitter.ts,masonry.ts}`。
- 文档页：
  - `docs/src/pages/components/layout/splitter.tsx`（API 表 `splitter-api.json`，含 Splitter 与 Panel）。
  - `docs/src/pages/components/layout/masonry.tsx`（`masonry-api.json`）。
  - 组件总览“布局”分类已加入口。
- 示例：
  - `docs/src/examples/splitter/` 共 11 个：basic、control、vertical、collapsible、collapsible-icon、multiple、nested、lazy、customize、double-click、destroy-on-hidden。
  - `docs/src/examples/masonry/` 共 9 个：basic、responsive、image、dynamic、fresh、item-render、layout-change、sequential、children。
  - `example/src/pages/{Splitter,Masonry}.tsx` 复用同一批文件，每个示例外包 `section[data-splitter-demo]` / `section[data-masonry-demo]`。

| 能力 | 示例 | 验证位置（packages/testing 下） |
| --- | --- | --- |
| splitter 尺寸解析 / 自动补齐 / min·max | basic、multiple | headless splitter 31 条；L3 structure、unmeasured；L4 structure、drag（夹取 70% / 20%）、multiple（min 60、总和等于容器） |
| splitter 容器内容区 / 尺寸变化 | 全部（带边框外框） | L3 contentBox、observe；L4 collapse 日志之和 = 内容区 |
| splitter 拖拽 / 遮罩 / 双击 | basic、double-click | L3 拖拽、卸载清理；L4 drag（全视口 fixed 遮罩、调整光标、z-index）、doubleClick |
| splitter 键盘 / aria | basic、vertical | headless keyboardResize；L3 aria；L4 keyboard（±16、Home / End） |
| splitter 受控 / resizable | control | L3 controlled；L4 control（aria-disabled、tabindex -1、默认光标、重置） |
| splitter 纵向 | vertical、nested | L3 vertical（orientation / vertical / layout）；L4 vertical、nested |
| splitter 折叠 / 图标 / motion / destroyOnHidden | collapsible、collapsible-icon、destroy-on-hidden | headless 折叠；L3 折叠按钮；L4 collapse、collapsibleIcon、destroyOnHidden、mobile（hover:none 常显、点按折叠） |
| splitter lazy | lazy | L4 lazy（横纵各一次，预览线夹取） |
| splitter 语义化样式 / draggerIcon | customize | L1 styles 129 条；L4 customize（默认抓手隐藏、active 样式只在拖拽中） |
| masonry 列数 / 间距 / 断点 | basic、responsive、children | headless masonry 23 条；L3；L4 basic、responsive（1300 / 700 / 420 实时重排）、children |
| masonry 实测定位 | 全部 | L4 在页面内校验宽度、left、每列紧密排布、根高度，以及与“最短列优先”推算一致 |
| masonry 图片 / fresh / 动态增删 | image、fresh、dynamic | L4 image（加载后按比例撑高）、fresh（展开后重排）、dynamic（按 key 复用节点） |
| masonry itemRender / onLayoutChange / sequential | item-render、layout-change、sequential | L3；L4 itemRender（固定列）、layoutChange、sequential |
| 出口 / 挂载 | 全部 | L2 smoke/Splitter、smoke/Masonry 各 3 条 |
| dev / ssr / mobile | 文档页 | L4 dev（5658 开发服务器）、ssr（原始静态 HTML）、mobile（390px） |

## 实际验证

| 命令 / 阶段 | 结果 |
| --- | --- |
| 旧实现基线 | 见上文：新用例 107 失败 / 15 通过；旧 headless 18 条在新代码上 4 条失败，均为契约变更或桩写法问题 |
| `vitest run headless/Splitter headless/Masonry render/Splitter render/Masonry smoke/Splitter smoke/Masonry`（packages/testing） | 8 文件、266 条通过（headless splitter 31 + styles 129、headless masonry 23 + styles 14、render splitter 39、render masonry 24、smoke 3 + 3） |
| `pnpm test` | 221 文件、2405 条全部通过（之后新增的 contentBox 用例单独复跑通过） |
| `pnpm run typecheck` / `typecheck:docs` / `pnpm --dir packages/testing run typecheck:browser` | 通过 |
| `pnpm run check:docs` / `pnpm run test:docs` | 通过，共 43 页 / docs 用例 28 条通过 |
| `pnpm run build`（含 example）+ `pnpm run build:docs` | 通过；既有 example 大 chunk 提示保留 |
| `pnpm exec playwright test -c playwright.splitter-masonry.config.ts`（packages/testing） | 50 条全部通过：docs 28、example 22（dev / ssr / mobile 仅跑 docs）；`--repeat-each=2` 共 100 条通过，无抖动 |
| `pnpm exec playwright test -c playwright.docs.config.ts` | 13 条通过 |
| `git diff --check` | 通过 |

**L4 首轮 30 条通过、20 条失败**。其中 3 个是真实缺陷，已修；其余是用例问题：

1. **组件缺陷：测量包含边框。** 面板之和比内容区多 2px，详见上文“容器内容区”。已修组件，并补了 render 用例。
2. **示例缺陷：collapsible-icon 只显示一个按钮。** 示例只给第一个面板配了 `{ start, end }`，而末尾侧按钮来自后一面板的 `start`。已改为两个面板分别开启 `end` / `start`，并在示例注释里说明这个规则。
3. **示例缺陷：customize 的 active 阴影不生效。** 内联样式写的是 `var(--upthrust-colors-primary)`，但主题色变量是裸 RGB 通道值（`37 99 235`），整条 box-shadow 因此无效。已改为 `rgb(var(...))`。
4. **用例问题：拖拽前没滚动。** `page.mouse` 不会自动滚动，页面下方的示例拖拽落空。`drag` 助手现在先 `scrollIntoViewIfNeeded`。
5. **用例问题：连续拖拽被判为双击。** 连续两次拖拽间隔小于 300ms，被组件当作双击，这是设计行为。`drag` 助手在按下前按真实用户节奏等待 350ms。
6. **用例问题：取整误差。** 文本断言用 clientWidth（整数）推算，与组件的取整差 1px。改为解析文本中的数字，按 1.5px 容差比较。
7. **用例问题：图片示例高度阈值。** 文档站示例区较窄，写死的 300px 阈值不成立。改为断言根高度大于单项宽度（每列 2 张、宽高比都 ≥ 0.6）。

**截图复核**：实际查看了 `test-results/splitter-masonry/` 下的截图：Splitter 的 basic、collapsed、collapsible-icon、customize-active、vertical、nested，Masonry 的 basic、image、dynamic、fresh、responsive-lg。折叠后常显按钮贴在左沿、自定义图标两侧都有、拖拽中的描边、图片按比例排布、删除后紧密重排均符合预期。截图是临时产物，不做永久归档。

## 测试踩坑（供后续物料参考）

- **happy-dom**：
  - `PointerEvent.pageX / pageY` 恒为 0，需要 `Object.defineProperty` 写入。
  - `width` / `left` 里含 `var()` 的 `calc` 会被丢弃，读 `style.width` 得到空串。改用 `CSSStyleDeclaration.prototype.setProperty` 的 spy 捕获写入值。
- **Solid 2**：
  - 非 keyed 的 `For` 回调里 item 是值，不是 accessor。
  - 组件体内写信号（示例里的挂载计数）需要 `createSignal(v, { ownedWrite: true })`。
- **JSX 类型**：`aria-expanded` 等 aria 属性必须传字符串 `'true' / 'false'`，传布尔值会让 docs 类型检查报 TS2322。
- **Playwright**：
  - `page.mouse` 不会自动滚动，locator 动作才会。
  - Masonry 的定位过渡用 `emulateMedia({ reducedMotion: 'reduce' })` 关闭，读到的就是最终位置。
- **测试环境没有 presetIcons**：L1 只断言图标类名存在，图标是否真的渲染交给 L4 的 `mask-image` 检查。

## 边界与后续

- **暂不支持**：
  - RTL：antd 在 RTL 下翻转水平拖拽与折叠方向。
  - ConfigProvider 的 splitter 全局配置（本库 ConfigProvider 没有该项）。
  - Masonry 的离场动画：删除项立即移除，其余项带过渡补位。
  - Masonry 的虚拟滚动。
- **与 antd 6 的差异**：
  - aria 值为百分比。
  - 容器尺寸按内容区计算。
  - 额外提供 `keyboardStep`、Home / End，以及 Masonry `sequential`。
  - 折叠按钮的 aria-label 为中文。
  - 媒体查询不带 `screen and` 前缀。
- **破坏性改动**：
  - Splitter：aria 由 px 改为百分比；删除样式辅助函数出口。
  - Masonry：默认 `columns` 4 → 3、`gutter` `'small'` → 0；断点全未命中时回退到 `xs ?? 1`；由 flex 分列改为绝对定位（依赖旧 DOM 结构 `masonryColumnClass` 的使用方需要调整）。
- Chromium 证据不代表 Firefox/WebKit、独立安装消费者或发布验收。未提交、推送、部署、发布。
