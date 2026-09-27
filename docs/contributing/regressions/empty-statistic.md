# C09 Empty / Statistic

状态：已验收（2026-09-27；下述支持范围与 Chromium 环境）。范围为 Empty（含内置插画）、Statistic、Statistic.Timer、Statistic.Countdown 及必要依赖路径。

## 契约与修复

对照 [Ant Design Empty](https://ant.design/components/empty-cn/) 与 [Statistic](https://ant.design/components/statistic-cn/) 页面、全部公开示例（curl 获取 `components/{empty,statistic}/demo/*`）和 antd 6.6.5 源码（`empty/{index,empty,simple}.tsx` 与样式、`statistic/{Statistic,Number,Timer,Countdown,utils}` 与样式）逐项核对；不宣称全 API 兼容。

- **Empty 插画**：替换为 antd 6 的默认（184×152）与简洁（64×41）插画路径。旧插画不是 antd 图形，且用 `stop-color-*` 类（wind4 不生成，渐变全黑）。颜色按 antd getAsSolidColor 思路，用 `color-mix(on-surface N%, surface)` 混出实色，随明暗主题变化（SVG 属性直接写 CSS 变量会静默失效，只能走工具类）。
- **Empty 布局**：默认图片高 100px、下边距 8px（旧实现把间距放在描述 mt-8px）；简洁插画走 antd `-normal`：根节点纵向 32px、图片 40px、文字描述色；footer 上边距 16px；根节点左右 8px、14px/1.5714、居中。
- **Empty image 判定**：旧实现把默认插画写进 merge 默认值，`imageNode` 只算一次，不响应切换。现在的规则：undefined / null 回落默认插画；字符串渲染 `<img>`，alt 取字符串描述、否则为 'empty'；`PRESENTED_IMAGE_SIMPLE` 组件形式和 `<PRESENTED_IMAGE_SIMPLE />` 节点形式都能识别为简洁样式；自定义节点只解析一次；false 不渲染图片区（本库扩展）。
- **图片居中**：带 preflight 的页面里 img 是 `display: block`，根节点的 text-align 不再生效，自定义图片会贴左（用户验收时发现）。图片区补 `[&_img]:mx-auto`，与 svg 的 `m-auto` 对齐，浏览器用例加了居中断言。
- **Solid 2 RC 缺陷**：`<img draggable={false}>` 按布尔属性处理，false 直接移除属性，图片仍可拖拽。改写字符串 `"false"`，并加回归用例。
- **Empty 其余**：description / footer 按 antd isReactRenderable 判定（只有 undefined / null / false / '' 为空，0 仍渲染），数字经 `numberToText`；新增 classNames / styles（root / image / description / footer）、`Empty.PRESENTED_IMAGE_*` 静态属性、原生属性与事件透传；`imageStyle` 兼容并由 `styles.image` 覆盖。
- **Statistic 数值格式化**移入 competence `statistic.ts` 的纯函数，按 antd 正则 `/^(-?)(\d*)(\.(\d+))?$/` 实现。旧实现与源码不符的地方：`toFixed` 四舍五入（antd 截断补零，1.999 精度 2 为 1.99）；数字字符串不分组；默认值为 ''（antd 为 0）；`formatter` 返回 0 / '' 会被 Show 回落。整数与小数分段渲染（data-statistic-part int / decimal），非法值原样显示。
- **Statistic 结构**：新增 header / title / content / value / prefix / suffix 语义节点和 classNames / styles；`valueStyle` 兼容并由 `styles.content` 覆盖；新增 `valueRender`；`loading` 改用 Skeleton（paragraph=false、active、上边距 16px），替代旧的单个 pulse 条；原生属性、aria / data、onMouseEnter / onMouseLeave 透传；title / prefix / suffix 经 `children()` 各解析一次。
- **Statistic.Timer（新增）**：`type` countdown / countup、`format` 默认 HH:mm:ss、每 1000/60 ms 刷新，`onChange` 收到未钳制的差值。`onFinish` 只在倒计时越过目标时触发一次，随后停止 interval；value / type 变化时重启。interval 由 effect 返回 cleanup 清理。格式化用 antd formatTimeStr：最大单位吸收溢出（2 天在 HH 下显示 48），`[]` 转义。value 接受时间戳、日期字符串、Date 与 dayjs。数值节点不带 title。
- **Timer 目标漂移（Solid 特有的坑）**：Solid 的 props 是 getter，示例里的 `value={Date.now() + x}` 每次读取都会重新求值，每次刷新目标都会后移，倒计时就停在原值。目标时间改用 memo 固定，只在响应式依赖变化时重算，并加 inline-target 用例。
- **Countdown**：已废弃，等同 `<Statistic.Timer type="countdown" />`。旧实现的问题：自写 formatDuration 的 Y / M 语义错误，没有 D 时小时仍按 %24 截断；已过期目标在挂载时立即 onFinish（antd 在首个刷新周期才触发）；解构 props 丢失响应性；没有 onChange；刷新周期 1000/30。
- **行为变化**：Statistic 默认显示 0；精度不再四舍五入；`formatter` 签名改为 `(value) => JSX.Element`（与 antd 一致，去掉第二个 props 参数）；移除内部 `formatNumber` 导出，改由 competence 的 `formatStatisticNumber` 提供；Countdown 小时不再按 24 截断；Empty 描述文字间距归到图片区。
- 保留差异（文档已写明）：classNames / styles 不支持函数形式；未接入 ConfigProvider（Empty 的 renderEmpty 示例未移植）与语言包，默认描述固定为「暂无数据」；Timer 目标无法解析时显示 00:00:00（antd 显示 NaN）；RTL 未处理；animated 示例用 rAF 实现，不依赖 react-countup。

## 能力映射

源码：`packages/components/lib/{Empty,Statistic}/{index.tsx,styles.ts}`；逻辑：新增 `packages/competence/src/statistic.ts`（并入 competence barrel）；公开入口补 `StatisticTimer`、Empty / Statistic 语义类型、`EmptyPresentedImage`、Timer 类型（`packages/components/lib/index.ts`）。

| 能力 ID / 覆盖 | example / docs 示例 | L1 | L2 | L3 | L4 |
| --- | --- | --- | --- | --- | --- |
| empty.image：默认 / 简洁（组件与节点形式）/ 地址 / null / false / 自定义节点单次实例化 / 响应式切换 | empty/basic, simple, customize | headless/Empty/theme：颜色类生成 | smoke/Empty/exports | render/Empty：default、simple、image.src、image.fallback、reactive | default、simple、customize |
| empty.content：描述与 footer 可渲染判定、0、img alt、draggable | empty/description, customize | 纯 UI | 同上 | description.footer、image.src | customize、semantic |
| empty.semantic：classNames / styles / imageStyle / 属性透传 | empty/semantic | theme：布局类无死类 | 同上 | semantic | semantic、mobile |
| statistic.number：分组、截断精度、分隔符、非法值、负数、字符串 | statistic/basic, card, semantic | headless/Statistic/format：number 四条 | smoke/Statistic/exports | render/Statistic：format、reactive、defaults | basic、card |
| statistic.structure：语义节点、prefix / suffix、formatter / valueRender、loading 骨架 | statistic/basic, unit, animated | theme：Statistic 类 | 同上 | structure、formatter.valueRender、loading、semantic | basic、unit、animated、semantic |
| statistic.timer：倒计时 / 正计时、onChange、onFinish 一次并停止、过期目标、重启、清理、日期值、格式、内联目标、透传 | statistic/timer | format：time 三条 + timer 三条 | 同上 | Timer 七条（fake timers） | timer、dev |
| statistic.countdown：废弃别名 | 由 timer 示例覆盖 Timer 语义 | — | 同上 | timer.expired（StatisticCountdown） | — |
| SSR 页面与独立 API | data-display/empty、statistic；各 Demo 同文件 ?raw | 不改路由逻辑 | — | — | 两物料 ssr / dev 用例 |

完整测试路径以 `packages/testing/<层>/<Material>/` 为前缀；旧 `browser/Empty/example.spec.ts` 依赖已删除的旧示例，由 `browser/Empty/contracts.spec.ts` 替代。所有新增用例附中文说明。

## 验证记录

环境：Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0（未升级）。当前工作区已有大量前序修改，均保留。日志目录：`output/c09-empty-statistic/`。

| 命令 / 证据 | 结果 |
| --- | --- |
| 修复前复现 | render 首跑：字符串图片 `draggable` 属性缺失（Solid RC 布尔属性）；Timer 内联目标漂移（倒计时停在原值）；浏览器截图：前缀图标 span 宽度为 0（示例补 inline-block） |
| `pnpm --dir packages/testing run test headless/Statistic headless/Empty render/Empty render/Statistic smoke/Empty smoke/Statistic` | 6 文件 35 条通过（target.log） |
| `pnpm run typecheck` / `typecheck:docs` / `packages/testing typecheck:browser` | 均通过 |
| `pnpm run build`（含 competence 重建） | 通过；保留 example 超 500kB chunk 提示 |
| `pnpm run build:docs` | 通过，49 个静态页面，base=/ |
| `pnpm --dir packages/testing exec playwright test --config playwright.empty-statistic.config.ts` | 26 条通过（docs 15 + example 11，含 dev 2、SSR 2）（browser.log） |
| `pnpm test --maxWorkers=2` | 240 文件、2585 条通过（full.log） |
| `git diff --check` | 通过 |

截图已实际查看：Empty 五个示例（默认 / 简洁插画实色、自定义图片 60px 与按钮、语义化两种底色）；Statistic 基本（含骨架屏）、单位图标、卡片涨跌色、计时器六项（48 小时、毫秒、天级别）、语义化虚线框与负数配色。
