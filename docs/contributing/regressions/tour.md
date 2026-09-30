# C11 Tour

状态：已验收（2026-09-29；下述支持范围与 Chromium 环境）。

## 契约与修复

对照 [Ant Design Tour](https://ant.design/components/tour-cn/) 公开示例与 antd 6.3.7 `tour/`（index、panelRender、style）及 @rc-component/tour 2.3.0（Tour、Mask、useTarget、useClosable），不宣称全 API 兼容。headless 在 `competence/src/tour/`：`createTour`（开合 / 步骤 / 异步守卫）、`createTourPosition`（目标追踪 / 高亮区 / 定位）、纯函数 `placeTour` / `tourGap` / `tourClosable`；渲染层负责遮罩、面板、键盘、焦点与滚动锁定。

- **headless 修复**：
  - 非受控 current 从关闭重新打开时回到第 0 步（rc-tour）。
  - 结束时先 `onClose(current, 'finish')` 再 `onFinish`（rc handleClose → onFinish）。
  - 目标只在不在视口内时才滚动，默认 `{ block: 'center', inline: 'center' }`；`scrollIntoViewOptions: false` 不滚动。
  - `placeTour` 支持 12 方位 + center：首选方向溢出更多时翻到对侧（保持对齐方式），夹在视口 8px 边距内；输出箭头坐标（跟随目标中心、距圆角 12px）；`arrow.pointAtCenter` 平移对齐方位。
  - 步骤级字段覆盖 Tour 级默认时过滤 undefined。
- **视觉**：
  - 面板宽 520（max-width fit-content），section 8px 圆角（primary 6px）+ boxShadowTertiary。
  - 关闭按钮 22×22，距右上 16px；cover 上 46 / 左右 16；header 16 / 16 / 8、标题 600；description 左右 16；footer 8 / 16 / 16。
  - 指示点 6×6、间距 6（colorFill / 主色，primary 下白 15% / 白），只在 steps > 1 时渲染。
  - 按钮 small、间距 8：“下一步”为 primary（primary 类型下白底主色字），“上一步”为 default（primary 下白边）。
  - 8px 旋转方块箭头；面板距高亮区 12px。
  - 遮罩为 SVG mask 镂空（默认 gap 6、圆角 2、填充 rgba(0,0,0,0.5)，镂空随步骤平滑过渡），四块透明覆盖矩形拦截点击；未禁用交互时容器 pointer-events none，高亮区可操作。
- **行为**：
  - 打开时锁 body 滚动（与 Modal / Drawer 共用计数）。
  - Escape 经共享对话栈只关最上层，closable 为 null 时不关。
  - ←/→ 切换步骤（输入框内不响应）。
  - 模态时约束焦点，关闭后还原。
- **API 对齐**：
  - `placement` 13 值、`arrow`、`mask`（`{ style, color }`）、`gap`（`{ offset: number | [x, y], radius }`）、`scrollIntoViewOptions`、`disabledInteraction`、`closable`（对象可带 closeIcon / aria-*）/ `closeIcon`、`keyboard`、`zIndex`（默认 1001）。
  - `indicatorsRender`、`actionsRender(originNode, { current, total })`。
  - 步骤 `nextButtonProps` / `prevButtonProps` / `type` / `class` / `style` / `classNames` / `styles`。
  - 语义槽 root / cover / mask / section / header / title / description / footer / actions / indicators / indicator（Tour 级对象或函数，与步骤级合并）。

### 破坏性改动

- 默认 gap 由 8 改为 `{ offset: 6, radius: 2 }`；删除主色描边高亮框。
- 默认宽 360 → 520，z-index 1100 → 1001。
- 文案：完成 → 结束导览，关闭按钮 aria-label 关闭引导 → 关闭；“1 / 2”文本 → 指示点。
- `showSkip` 默认关闭（原默认显示）。
- `footerRender`、`finishText`、步骤 `nextText` / `previousText`、`radius`、`scrollIntoView` 废弃（仍可用）。
- pending 时主按钮改为 loading（不再显示“请稍候…”）。
- 目标在视口内不再滚动；`TourCloseReason` 新增 `'finish'`。

### 保留差异

- 定位由纯函数实现，不支持 builtinPlacements / getPopupContainer / animated / rootClassName；未实现 RTL；按钮文案不跟随 locale。
- 保留扩展：`beforeChange` / `onError` 异步守卫、`maskClosable`、`showSkip` / `skipText`、`showIndicators`、`width`。

## 能力映射

源码：`packages/components/lib/Tour/`，逻辑 `packages/competence/src/tour/`。

| 能力 / 覆盖 | example / docs 示例 | L1 headless | L2 smoke | L3 render | L4 browser |
| --- | --- | --- | --- | --- | --- |
| 结构 / 几何 / 箭头 | basic / basic | place.* | exports | default | geometry |
| 遮罩镂空 / 点击穿透 / 配置 | mask / mask、gap | gap、position.gap | exports | mask、mask-config、interactive | geometry、hit |
| 导航 / 结束 / 重开 | basic / basic | state.* | — | navigate、reopen | finish |
| 键盘 / Escape / 焦点 / 锁滚动 | basic / basic | — | — | keyboard、scroll-lock | keyboard |
| primary / 非模态 | primary / non-modal | — | — | primary | primary |
| 位置 / 翻转 / 居中 | placement / placement | place.*、position.defaults | — | mask | placement |
| 按钮 props / actionsRender / indicatorsRender | custom / actions-render、indicator | — | exports | actions | — |
| closable / 语义化 | — / style-class | closable | exports | closable、semantic | — |
| 异步守卫 / 扩展 | custom / async | state.guard 等 | — | extensions | — |
| 目标追踪 / 滚动 | — | position.* | — | — | — |
| 主题死类 | — | theme | — | — | — |

测试路径：headless `Tour/tour`（17）+ `position`（6）+ `theme`（1），render `Tour/Tour`（13），smoke `Tour/exports`（1），browser `Tour/tour`（6 条 × 2 项目）。

## 踩坑

- wind4 的 `top-md` / `right-md` 不生成（与 `left-lg` 同类），用 `top-[16px]`，theme 测试已拦截。
- ←/→ 触发的 `next()` 是 async（先 await 守卫），render 测试按键后需要 `await` 微任务再断言。
- 面板 `max-width: fit-content`：内容没有固有宽度时面板收缩到内容宽，例如 div 封面，与 antd 一致；示例封面用带固有宽度的图片。
- SVG 镂空 rect 带 `transition-all`：属性值立即更新，渲染值在过渡中渐变；浏览器断言用 `getBBox()` 轮询。
- docs 与 example 读构建产物：改 Tour 页 / 组件后须重新 `pnpm run build` 与 `build:docs`，否则页面 404 或渲染旧版。

## 验证记录

环境：Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0。日志目录：`output/c11-tour/`。

| 命令 / 证据 | 结果 |
| --- | --- |
| 修复前 | 主色描边高亮 + path 遮罩（无点击穿透）、4 方位、无箭头、“1 / 2”文本、非 antd 尺寸与按钮、无 gap 对象 / mask 配置 / closable 对象 / actionsRender / 按钮 props / 语义化 / ←→ 键盘 / 锁滚动、重开不归零、目标在视口内也滚动 |
| `pnpm test --maxWorkers=2` | 292 个文件、2855 条通过（vitest.log） |
| `pnpm run typecheck` / `typecheck:docs` / `packages/testing typecheck` / `typecheck:browser` | 均通过（typecheck*.log） |
| `pnpm run build` / `pnpm run build:docs` | 通过（build.log、build-docs.log） |
| `playwright test -c playwright.c11-tour.config.ts` | 连续三轮 12 条通过（browser-1..3.log） |
| `git diff --check` | 通过 |

截图已查看：基本步骤（封面、镂空、箭头指向“上传”）；第 2 步镂空移到“保存”、出现“上一步”；primary 非模态（主色面板、白底下一步）；右边缘目标 right 翻转为 left。
