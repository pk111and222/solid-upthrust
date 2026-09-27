# C09 Watermark / Alert

状态：已验收（2026-09-27；下述支持范围与 Chromium 环境）。范围为 Watermark、Alert 及必要依赖路径（Modal / Drawer 水印传导）。

## 契约与修复

对照 [Ant Design Watermark](https://ant.design/components/watermark-cn/) 与 [Alert](https://ant.design/components/alert-cn/) 页面，逐项核对了三类来源，不宣称全 API 兼容：

- 全部公开示例。
- antd 6.6.5 源码：`watermark/{index,useClips,useWatermark,useRafDebounce,utils,context}`、`alert/{Alert,ErrorBoundary}` 与样式。
- 实测 DOM。

- **Watermark 渲染重写**：旧实现用 SVG data-URI 平铺，不带交错与防篡改。现在按 antd useClips 用 canvas 绘制：先绘制内容（文字按 devicePixelRatio 缩放），再旋转，裁出包围盒，最后交错平铺，即一列加右侧上下各错半格的两份。水印节点追加为容器的最后一个子元素，默认 z-index 999、absolute 铺满、`pointer-events: none`，并带 `visibility: visible !important`。
- **Watermark 参数**：
  - 默认值：rotate -22，gap [100, 100]，offset 为 gap / 2。offset 大于 gap / 2 时换算为 left / top 并相应收缩宽高，否则计入 background-position。
  - 图片默认尺寸 120×64，加载失败时回退为文字。
  - 文字尺寸按测量宽度和 ascent + descent 累加，行间 3px。
  - `content` 数组为多行，其中 `{ text, font }` 可单独设置某一行的字体。
- **Watermark 防篡改**：MutationObserver 监听 subtree / childList / style / class。水印节点被删或其属性被改时，同一帧内去重后重绘并重新挂载，节点被删的情况还会触发 `onRemove`。容器的 position / overflow 被外部修改时会恢复。自身写入产生的变更记录用 takeRecords 丢弃。
- **Watermark 弹层传导**：新增 `Watermark/context.ts`，`inherit` 默认 true。Modal / Drawer 在 `animatedOpen` 期间把面板元素登记为水印目标，离场后注销。`inherit={false}` 时不传导。
- **Watermark 响应式读取（render 回归发现）**：effect 回调里读取了 `markStyle` 等 memo，触发 STRICT_READ_UNTRACKED 警告。挂载与 MutationObserver 回调已统一包进 untrack。
- **Alert 结构重写**：
  - DOM 为 root > icon / section（title、description）/ actions / close，均带 data-alert-part。
  - 普通布局：居中，内边距 8px 12px，8px 圆角，1px 实线边框，字号 14 / 行高 22。
  - 有描述时：顶端对齐，内边距 20px 24px，图标 24px 加 12px 间距，标题 16px 加 mb 8px。
  - 状态色为 antd 实测值：成功 #f6ffed / #b7eb8f / #52c41a，警告 #fffbe6 / #ffe58f / #faad14，错误 #fff2f0 / #ffccc7 / #ff4d4f；信息跟随主色。
  - 图标用 @ant-design/icons-svg 同源路径，`common/antIcons` 新增 InfoCircleFilled 和 CloseOutlined。
- **Alert 状态推导（competence/alert）**：
  - 未指定 type 时，banner 为 warning，否则为 info。banner 未设置 showIcon 时默认显示图标。
  - 可关闭的判定依次为：closable 对象、closeText、布尔值、非空 closeIcon（0 和 '' 也算可关闭）。
  - 关闭图标的优先级为 closable.closeIcon > closeText > closeIcon。
  - closable 对象上的 aria-* / data-* 透传到关闭按钮。
  - onClose / afterClose 优先取 closable 对象上的回调，且只触发一次。由于信号写入是批处理的，另用同步镜像变量防止重入。
- **Alert 离场动画**：先锁定当前高度，下一帧收起 max-height、opacity 与上下 padding，margin-bottom 同时变为 0，时长 0.3s，缓动为 cubic-bezier(0.78, 0.14, 0.15, 0.86)。transitionend 或 400ms 兜底计时器触发后卸载并调用 afterClose。
- **Alert 图标垂直位置（浏览器回归发现）**：图标外层原来是 inline 容器，内层 anticon 的 `vertical-align: -0.125em` 把有描述时的图标下推了 6px。外层改为 flex 后，内层成为 flex item，与 antd 一致，图标距顶恰为 21px（1px 边框加 20px 内边距）。
- **Alert.ErrorBoundary**：基于 Solid `Errored` 实现，渲染 error 类型的 Alert，标题默认为错误信息，描述为 `<pre>` 包裹的 error.stack（Solid 没有 componentStack）。
- **语义化**：Alert 支持 root / icon / section / title / description / actions / close，classNames / styles 均支持对象和函数形式；函数形式收到推导后的 type / variant / showIcon / closable。
- **行为变化**：
  - Alert 的 `message` 改名为 `title`（`message` 仍可用，标记为已废弃）。默认 showIcon 由 true 改为 false，example 的 Spin / Form 页已迁移。图标由 mdi 改为 antd 图标。
  - Watermark 删除 `fontColor` / `opacity` 和 `styles.ts`，改用 `font` 对象。gap 不再接受单个数字。默认 zIndex 由 9 改为 999，渲染方式由 SVG 改为 canvas。
- 保留差异（文档已写明）：未接入 ConfigProvider；RTL 未处理；Alert 的 loop-banner（依赖走马灯库）与 component-token 示例未移植；Watermark 只传导到 Modal / Drawer；自定义配置示例在双栏文档中改为上下布局，外链图片改为本地渐变块。

## 能力映射

源码：
- 组件：`packages/components/lib/{Watermark,Alert}/`，其中 Watermark 删除了 `styles.ts`、新增了 `context.ts`。
- Modal / Drawer 接入 `useWatermarkPanel`。
- 逻辑：competence 重写了 `watermark.ts` 与 `alert.ts`。
- 公开入口补全了语义化与内容类型的导出。

| 能力 ID / 覆盖 | example / docs 示例 | L1 | L2 | L3 | L4 |
| --- | --- | --- | --- | --- | --- |
| watermark.draw：字体、多行、尺寸测量、旋转包围盒、偏移换算 | watermark/basic, multi-line, image, custom | headless/Watermark：font、lines、size、rotate、offset、create | smoke/Watermark/exports | default、reactive | basic、image |
| watermark.tamper：删除恢复与 onRemove、样式恢复、容器样式恢复 | watermark/basic | tamper | — | tamper | tamper |
| watermark.inherit：Modal / Drawer 传导、inherit=false | watermark/portal | — | — | inherit | portal |
| alert.state：type / showIcon 默认值、closable 各入口、关闭图标优先级、回调只触发一次 | alert/basic, style, banner, closable | headless/Watermark 内 alert：defaults、closable、close | smoke/Alert/exports | default、banner、legacy-close、close | basic、style、banner、close |
| alert.layout：描述布局、图标尺寸与颜色、action 与关闭按钮间距、filled | alert/description, icon, action, filled, custom-icon | theme：全类型无死类 | 同上 | description、semantic | icon、action |
| alert.motion：离场收起与 afterClose | alert/smooth-closed | — | — | close | smooth、close |
| alert.error-boundary | alert/error-boundary | — | 同上 | error-boundary | error-boundary |
| alert.semantic：对象 / 函数、自定义标题对齐 | alert/style-class, custom-title-alignment | — | 同上 | semantic | 截图 |
| SSR 页面与 API | feedback/alert、feedback/watermark | 不改路由逻辑 | — | — | 两物料 ssr / dev 用例 |

完整测试路径以 `packages/testing/<层>/<Material>/` 为前缀。两物料的 headless 用例合并在 `headless/Watermark/watermark.test.ts`，Alert 的主题死类检查在 `headless/Alert/theme.test.ts`。render 层给 canvas 打了最小 2D 桩（happy-dom 没有 2D 上下文）。所有新增用例都附中文说明。

## 验证记录

环境：Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0（未升级）。当前工作区已有大量前序修改，均保留。日志目录：`output/watermark-alert/`。

| 命令 / 证据 | 结果 |
| --- | --- |
| 修复前复现 | 旧 Watermark 为 SVG 平铺、无防篡改、不传导到弹层；旧 Alert 无 antd 结构和图标，默认显示图标，无 ErrorBoundary / 语义化 / 离场动画；首轮 render：closeIcon=0 不显示、effect 中出现 STRICT_READ_UNTRACKED；首轮浏览器：有描述的图标距顶 27px |
| `pnpm --dir packages/testing exec vitest run headless/Watermark headless/Alert smoke/Alert smoke/Watermark render/Alert render/Watermark` | 6 个文件 24 条通过（target.log） |
| `pnpm run typecheck` / `typecheck:docs` / `packages/testing typecheck:browser` | 均通过 |
| `pnpm run build`（含 competence 重建） | 通过（build.log） |
| `pnpm run build:docs` | 通过（build-docs.log） |
| `pnpm --dir packages/testing exec playwright test --config playwright.watermark-alert.config.ts` | 28 条通过（docs 16 + example 12，其中 dev 2 条、SSR 2 条）（playwright.log） |
| `pnpm test --maxWorkers=2` | 257 个文件、2665 条通过（test.log） |
| `git diff --check` | 通过 |

截图已实际查看：Alert 四种样式、图标（有 / 无描述）、顶部公告、操作区、自定义标题对齐、语义化虚线框；Watermark 基本、多行、图片、自定义配置（上下布局）、Modal 内水印。
