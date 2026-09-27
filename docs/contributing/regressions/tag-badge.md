# C09 Tag / Badge

状态：已验收（2026-09-27；下述支持范围与 Chromium 环境）。范围为 Tag / CheckableTag / CheckableTagGroup、Badge / BadgeRibbon 及必要依赖路径。

## 契约与修复

对照 [Ant Design Tag](https://ant.design/components/tag-cn/) 与 [Badge](https://ant.design/components/badge-cn/) 页面和 antd 6.6.5 源码（`components/tag/{index,CheckableTag,CheckableTagGroup}.tsx`、`tag/hooks/useColor.ts`、`badge/{Badge,Ribbon,ScrollNumber}.tsx` 与样式 token）逐项核对；不宣称全 API 兼容。

- **Tag**：原生属性、事件与 ref 透传（关闭 D12）；新增 `variant`（filled 默认 / solid / outlined）、13 个预设色板与 `-inverse` 旧写法、状态色三变体；自定义色按 antd 取 HSL 亮度 0.95 浅底 + 原色字（outlined 原色边，solid 原色底白字；与 FastColor 同一浮点路径，`#f50 → #ffeee5`）。旧实现自定义色一律实心白字、状态色只有一套、`bordered` 为唯一变体。
- **Tag 关闭**：按 antd useClosable 判定 `closable` / `closeIcon`（true、节点、false/null、对象 `{ closeIcon, aria-label }`）；禁用时不拦截冒泡、不关闭；href 标签关闭时阻止跳转。关闭按钮保留原生 button（Tab / Enter / Space）。
- **Tag 其余**：`href/target/rel` 渲染 `<a>`（`_blank` 默认安全 rel，禁用移除 href 并标 aria-disabled）；`onClick` 禁用时不触发；`icon` + content 语义节点与 7px 间距；`classNames/styles`（root / icon / content / close）；禁用态不应用任何颜色（antd `:not(-disabled)`）；嵌套链接继承标签文字色。旧实现 disabled 仅 `opacity-45`。
- **CheckableTag**：改为 antd 的 `role="checkbox"` 语义：点击或 Space 切换（repeat 不切换，Enter 不切换），onChange 先于 onClick，onKeyDown 可 preventDefault 拦截；禁用 aria-disabled + tabindex=-1。保留本库 `defaultChecked` 非受控扩展，并加同步镜像防同批次连续切换读旧值。
- **CheckableTagGroup（新增）**：`createCheckableTagGroup` headless；单选再次点击为 null、多选数组、value !== undefined 即受控（含 null）、禁用、原始值/对象选项、root/item 语义节点。具名导出并挂在 `Tag.CheckableTagGroup`。
- **Badge 显示逻辑**按 antd 源码修正：`isStatusBadge` 公式（旧实现只要有 status/color 就画状态点，`color + count=0` 会多出一个点）；`text` 为 0/'0' 计入 isZero（旧测试断言“count 5 + text '0' 仍显示”与源码相反，已改为源码行为并在用例注明）；数字字符串封顶；null 的 status/color 不算设置；数字徽标忽略 status 颜色、点与状态点使用 status。
- **Badge 渲染**：`offset` 改为 `right: -x`（parseFloat）+ `margin-top`（数字补 px；旧实现输出 `margin-top: 20` 无单位失效）；`style` 按 antd 在状态模式作用于根节点、文本继承其 color；自定义节点不再套红色圆底（antd -custom-component）；自定义色保留 1px 描边；small 字号 12px、单字符无内边距（旧实现 11px 且 px-4 撑破 14px 最小宽度）；独立使用为 relative 以便 offset 生效；13 个预设色板；`size="medium"` 别名；`style.borderColor` 以内嵌阴影模拟描边；原生属性与 ref。
- **Badge 动效**：包裹模式下三种徽标节点常驻，显隐只切属性，缩放淡出真实播放，离场期间保留最后内容（antd countRef / isDotRef）；隐藏节点 aria-hidden、无 title；独立使用隐藏即移除不占位。旧实现数字节点用 Show 直接卸载，无离场动画。
- **JSX 属性单次实例化**：children / count / text / icon / closeIcon / closable 统一经 `children()` 解析一次；旧 Badge 对 `count` 节点在多个 memo 中重复读取，会重复创建组件实例。
- **BadgeRibbon**：自定义色同时写 `color`，折角（border-current）与缎带同色（旧实现折角取继承文字色）；`style` 旧实现完全被忽略；`class/style` 与 antd 一致作用于缎带节点（**行为变化**：旧 class 在包裹层，改用 `classNames.root`）；13 个预设色板，默认主题主色。
- **Solid 2 RC 缺陷**：唯一动态子节点首次插入数字 `0` 时不渲染（`<span>{signal()}</span>` 中 0 被丢弃）。浏览器复现 `showZero` 的 0 为空白，新增 `common/renderable.ts` 的 `numberToText` 在 Badge 数字/文本、Tag 与 CheckableTag 子元素处转字符串，附回归用例。
- **行为变化**：Tag 默认 filled 无描边，`bordered` 废弃且不再产生描边；`color="blue"` 等从“自定义实心色”变为预设色板；Badge `blue/red/green` 改用 antd 色板第 6 级（旧为主题 primary/error/success），ribbon 默认仍为主题主色。
- 保留差异（文档已写明）：classNames/styles 不支持函数形式；未接入 ConfigProvider 组件级禁用/全局配置；无 Tag 添加动画与拖拽排序示例、无 Badge 逐位滚动数字；独立小红点不带 antd 的半尺寸位移；RTL 未处理。

## 能力映射

源码：`packages/components/lib/{Tag,Badge}/{index.tsx,styles.ts}`、`packages/components/common/renderable.ts`；逻辑：`packages/competence/src/{tag,badge,presetColors}.ts`（新增 presetColors 并入 competence barrel）；公开入口补 `CheckableTagGroup` 及 Tag/Badge 相关类型（`packages/components/lib/index.ts`）。

| 能力 ID / 覆盖 | example / docs 示例 | L1 | L2 | L3 | L4 |
| --- | --- | --- | --- | --- | --- |
| tag.variant / color：三变体 × 预设 13 + 状态 5 + 自定义 + inverse + bordered | tag/colorful, status | headless/Tag/color | smoke/Tag/exports | render/Tag/contracts：variant、preset、custom、dynamic | browser/Tag：colors、status、paint |
| tag.closable：closable/closeIcon/对象/false/null、onClose 取消、冒泡、禁用、href 阻止跳转 | tag/basic, customize, disabled | color：closable；tag：propagation | 同上 | contracts：closable、close.flow、href | close（键盘 Enter/Space）、disabled |
| tag.attrs / href / onClick / icon / semantic / zero | tag/basic, icon, semantic | 纯 UI | 同上 | contracts：attrs、href、onClick、icon、single-instance、zero、close.semantic | paint（嵌套链接色、rel）、dev |
| tag.checkable：checkbox 语义、Space/Enter/repeat、onKeyDown、禁用、受控/非受控、批次 | tag/checkable, icon, disabled | tag：interactions、batch | 同上 | checkable：CheckableTag 五条 | checkable（点击、Space、焦点轮廓） |
| tag.group：单/多选、受控 null、禁用、选项归一、语义节点、动态选项、0 值 | tag/checkable, semantic | tag：CheckableTagGroup state | 同上 | checkable：Group 七条 | checkable |
| tag.control：动态增删改 | tag/control | 示例层逻辑 | — | — | control |
| badge.display：封顶/字符串/负数、零值与 text 零、dot、status 选择、custom、text 可见 | badge/basic, overflow, dot, title | headless/Badge：resolveBadgeDisplay | smoke/Badge/exports | render/Badge：count、dot、status、zero-color、zero.render | overflow、anchor |
| badge.color：数字/点/状态点优先级、预设、自定义、gray | badge/colorful, no-wrapper | resolveBadgeColorKey | 同上 | color.dom、status | status、no-wrapper |
| badge.layout：锚点、独立使用、offset、size、style 路由、borderColor、属性/ref | badge/offset, size, no-wrapper, link, semantic | badgeOffsetStyle | 同上 | standalone、style.routing、size、attrs、custom.node | anchor、offset、no-wrapper |
| badge.motion：常驻节点、缓存内容、aria-hidden、模式切换 | badge/change | createBadge | 同上 | hidden.wrapped、dot、dynamic.mode | change（真实 opacity 过渡） |
| badge.ribbon：方位、预设/自定义色、折角同色、class/style/语义节点 | badge/ribbon, semantic | 复用 resolveBadgeColorKey | 同上 | ribbon.color、ribbon.semantic | ribbon（外伸 8px、折角色、窄屏） |
| SSR 页面与独立 API | data-display/tag、badge；各 Demo 同文件 ?raw | 不改路由逻辑 | — | — | 两物料 ssr / dev 用例 |

完整测试路径以 `packages/testing/<层>/<Material>/` 为前缀。浏览器颜色断言经 `utils/color-browser.ts` 的 canvas 归一（wind4 任意色值编译为 `color-mix(in oklab, …)`，计算值序列化为 `oklab(...)`）。所有新增用例附中文说明。

## 验证记录

环境：Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0（未升级）。当前工作区已有大量前序修改，均保留。日志目录：`output/c09-tag-badge/`。

| 命令 / 证据 | 结果 |
| --- | --- |
| 原有基线 `headless/Tag headless/Badge` | 2 文件 19 条通过（baseline.log） |
| 修复前复现 | offset `margin-top: 20`、text '0'、color+count 0 与源码不符（改写旧断言）；render 首跑独立 `showZero` 的 0 为空（Solid RC 0 缺陷），浏览器首跑暴露 Input/Switch 不透传 aria-label（示例改用 label for / 定位调整） |
| `pnpm --dir packages/testing run test headless/Tag headless/Badge render/Tag render/Badge smoke/Tag smoke/Badge` | 8 文件 83 条通过（target.log） |
| `pnpm run typecheck` / `typecheck:docs` / `packages/testing typecheck:browser` | 均通过 |
| `pnpm run build`（含 competence 重建） | 通过；保留 example 超 500kB chunk 提示 |
| `pnpm run build:docs` | 通过，47 个静态页面，base=/ |
| `pnpm --dir packages/testing exec playwright test --config playwright.tag-badge.config.ts` | 32 条通过（docs 18 + example 14，含 dev 2、SSR 2）（browser.log） |
| `pnpm test --maxWorkers=2` | 234 文件、2550 条通过（full.log） |
| `git diff --check` 及新增文件尾随空白检查 | 通过 |

截图已实际查看（`packages/testing/test-results/tag-badge/*-docs/`）：Tag 多彩三变体、状态三变体、基本关闭图标、可选标签；Badge 基本锚点、独立使用、状态点、封顶、缎带五种颜色/方位。

## 范围边界与发现

- 只验收当前工作区源码和 Chromium；跨浏览器、npm 全新消费者、正式发布仍留原台账。docs 未部署；本轮仅新增两个组件页和首页入口，无路由/base/SSR 框架变更，未重跑双 base 通用套件。
- 发现但不在本轮范围：Input 与 Switch 不透传 `aria-label` 等原生属性（示例改用 `<label for>`，建议在各自复查或 D 阶段处理）；Tag/Badge 未接入 ConfigProvider（共享文件，未改）。
- 未提交、推送或发布；类型声明由构建产生，未手改 dist/types。
