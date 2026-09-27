# C09 Result / QRCode

状态：已验收（2026-09-27；下述支持范围与 Chromium 环境）。范围为 Result、QRCode 及必要依赖路径。

## 契约与修复

对照 [Ant Design Result](https://ant.design/components/result-cn/) 与 [QRCode](https://ant.design/components/qr-code-cn/) 页面，逐项核对了三类来源，不宣称全 API 兼容：

- 全部公开示例（curl 获取 `components/{result,qr-code}/demo/*`）。
- antd 6.6.5 源码：`result/{index,noFound,serverError,unauthorized}` 与样式、`qr-code/{index,QrcodeStatus,interface}` 与样式、`@rc-component/qrcode` 的 `libs/qrcodegen`、`utils`、`hooks/useQRCode`、`QRCode{Canvas,SVG}`。
- 实测 DOM。

- **Result 结构重写**：旧实现不是 antd 结构。它用 72px 着色圆和文字「404」代替插画，还自带中文默认标题，也没有语义化。现在改为 root > icon / title / subTitle / extra / body，尺寸均为实测值：
  - 根节点 48px 32px。
  - 图标区 mb 24px、居中，图标 72px。
  - 标题 24/32，上下 8px。
  - 副标题 14/22，用次要色。
  - extra 上边距 24px，子项间距 8px，末项 0。
  - body 上边距 24px，内边距 24px 40px，浅色底，左对齐。
- **Result 图标与插画**：
  - 状态图标用 @ant-design/icons-svg 同源路径（新增 `common/antIcons.tsx`：CheckCircleFilled / CloseCircleFilled / ExclamationCircleFilled / WarningFilled / ReloadOutlined）。颜色：成功 #52c41a、警告 #faad14、错误 #ff4d4f，信息跟随主色。
  - 403 / 404 / 500（字符串或数字）渲染 antd 插画，逐字移植到 `images.tsx`，React 驼峰属性改为 SVG 原生属性名。插画放在 250×295 的居中块里，没有默认标题。
  - `icon={null | false}` 隐藏图标，异常状态除外。只有 undefined / null / false / '' 视为空，0 照常渲染。
  - 提供 `Result.PRESENTED_IMAGE_403/404/500` 静态属性。
- **Result 图标高度（浏览器回归发现）**：内置图标外层是 inline-flex，行高为 0，但没有写 vertical-align。内部的 svg 在基线上对齐，把图标区撑到 78px。补上 antd `.anticon` 的 `vertical-align: -0.125em` 和 `svg { display: inline-block }` 后，高度恰为 72px。
- **QRCode 编码器替换**：
  - 旧实现依赖 qrcode-generator。它默认的 stringToBytes 会把每个字符截成 `& 0xff`，中文等非 ASCII 内容因此编码错误。它也不支持 boostLevel、分段和 marginSize。
  - 现在 competence 引入同源的 Nayuki qrcodegen（`qrcodegen.ts`，从 @rc-component/qrcode 照搬，只在 strict 模式下补了一处类型断言），并新增 `qrcode.ts` 纯函数：generateQRCodePath / excavateQRCodeModules / getQRCodeImageSettings / getQRCodeMarginSize / encodeQRCode / createQRCodeMatrix。
  - 结果：同一输入生成的矩阵和 SVG 路径与 antd 实测逐字一致（"https://ant.design/"、M 级：25 模块）。
- **QRCode 渲染**：
  - 新增 `type`，默认 'canvas'。canvas 按 devicePixelRatio 绘制；有图标时，隐藏的 `img alt="QR-Code"` 加载完成后才挖空并绘制图标。svg 输出背景路径、前景路径和居中的 `<image>`，都带 crispEdges。
  - 根节点：flex 居中、padding 12px、分割线色边框、8px 圆角、border-box，宽高等于 size。背景色默认 transparent，前景色默认 rgba(0,0,0,0.88)。`bordered=false` 时边框透明、padding 0、圆角 0。value 为空（包括空数组）时不渲染。
- **QRCode 本体尺寸（浏览器回归发现）**：本体的内联 width / height 只来自 `style.width/height`，未设置时不写。antd 就是传入 undefined 来覆盖 rc 的 size 内联尺寸的，这样 canvas 靠 flex 拉伸到内容盒，为 134×134。svg 的宽被 flex 压到 134、高保持 160，与 antd 实测一致，超出部分被根节点 overflow 裁掉。
- **QRCode 状态**：
  - 遮罩绝对铺满，z-10，背景为 96% 不透明的底色。
  - 各状态的默认内容：loading 为 Spin；expired 为「二维码过期」，只有传了 onRefresh 时才显示链接按钮「点击刷新」（带 reload 图标）；scanned 为「已扫描」。
  - `statusRender(info)` 收到 status / locale / onRefresh。
  - `locale` 可覆盖文案，这是本库扩展，antd 走语言包。
- **语义化**：Result 支持 root / icon / title / subTitle / extra / body，QRCode 支持 root / cover，classNames / styles 都支持对象和函数形式，并透传原生属性。
- **行为变化**：
  - QRCode 默认改为 canvas，默认 bgColor 由 #fff 改为 transparent，默认 iconSize 由 36 改为 40。
  - QRCode 删除 `loadingContent`（改用 statusRender），`onRefresh` 不再接收事件参数，编码失败不再显示遮罩。
  - Result 删除 404 / 403 / 500 的默认中文标题。
- **依赖**：components 已不再引用 qrcode-generator。后续（Watermark / Alert 回归时）已从 `packages/components/package.json`、vite external 与 `pnpm-lock.yaml` 移除 `qrcode-generator` / `@types/qrcode-generator`；锁文件为手动删除对应条目，需联网执行一次 `pnpm install` 同步 node_modules。
- 保留差异（文档已写明）：未接入 ConfigProvider；RTL 未处理；Result 的 component-token 示例未移植；示例里的 Logo 内联为 data URI，便于离线运行，也让同源 canvas 可以导出。

## 能力映射

源码：`packages/components/lib/{Result,QRCode}/{index.tsx,styles.ts}`、`lib/Result/images.tsx`、新增 `packages/components/common/antIcons.tsx`。逻辑：competence 新增 `qrcodegen.ts`、`qrcode.ts`。公开入口补全了两个组件的语义化与枚举类型（`packages/components/lib/index.ts`）。

| 能力 ID / 覆盖 | example / docs 示例 | L1 | L2 | L3 | L4 |
| --- | --- | --- | --- | --- | --- |
| result.status：四态颜色与图标、异常插画（字符串 / 数字）、icon 隐藏 / 自定义 / 空值回落 | result/success, info, warning, 403, 404, 500, custom-icon | theme：全状态无死类 | smoke/Result/exports | render/Result：default、status、exception、icon | success、status、exception、custom |
| result.layout：区域顺序、间距字号、extra 间距、body、空值跳过 | result/success, error | 同上 | 同上 | parts、empty | success、body |
| result.semantic：classNames / styles 对象 / 函数、属性透传 | result/style-class | — | 同上 | semantic | custom |
| qrcode.matrix：antd 路径逐字一致、分段与 UTF-8、boostLevel、marginSize、行程编码、图标挖空 | qr-code/base, type, errorlevel | headless/QRCode/qrcode：6 条 | smoke/QRCode/exports | svg、icon | base、type、icon |
| qrcode.render：canvas / svg、尺寸、边框、颜色、style 宽高、空值 | qr-code/base, type, custom-size, custom-color, download | theme | 同上 | default、layout | base、size、color、errorlevel-download |
| qrcode.status：默认遮罩、刷新回调、statusRender、locale | qr-code/status, custom-status-render | — | 同上 | status、status-render | status、status-render |
| qrcode.semantic / 组合：root / cover、Popover 内无边框 | qr-code/style-class, popover | — | 同上 | semantic | popover-semantic |
| SSR 页面与 API | feedback/result、data-display/qr-code | 不改路由逻辑 | — | — | 两物料 ssr / dev 用例 |

完整测试路径以 `packages/testing/<层>/<Material>/` 为前缀。两物料的主题死类检查合并在 `headless/Result/theme.test.ts`。antd 实测路径存为 `headless/QRCode/antd-path.txt`，render 层和浏览器层共用。所有新增用例都附中文说明。

## 验证记录

环境：Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0（未升级）。当前工作区已有大量前序修改，均保留。日志目录：`output/result-qrcode/`。

| 命令 / 证据 | 结果 |
| --- | --- |
| 修复前复现 | 旧 QRCode 对中文按 `& 0xff` 截断；旧 Result 与 antd 结构不符（无插画、自带标题）；浏览器首轮：Result 图标区 78px、QRCode canvas 160×160 溢出内容盒 |
| `pnpm --dir packages/testing exec vitest run headless/QRCode headless/Result smoke/Result smoke/QRCode render/Result render/QRCode` | 6 个文件 23 条通过（target.log） |
| `pnpm run typecheck` / `typecheck:docs` / `packages/testing typecheck:browser` | 均通过（typecheck.log） |
| `pnpm run build`（含 competence 重建） | 通过（build.log） |
| `pnpm run build:docs` | 通过，53 个静态页面，base=/（build-docs.log） |
| `pnpm --dir packages/testing exec playwright test --config playwright.result-qrcode.config.ts` | 32 条通过（docs 18 + example 14，其中 dev 2 条、SSR 2 条）（playwright.log） |
| `pnpm test --maxWorkers=2` | 252 个文件、2647 条通过（vitest.log） |
| `git diff --check` | 通过 |

截图已实际查看：Result 四态图标与操作区、403 / 404 / 500 插画、Error 补充区、笑脸自定义图标、语义化虚线框与绿色函数样式；QRCode 基本、Logo 挖空、三种状态遮罩、自定义状态渲染、canvas / svg 对比、自定义颜色、下载、纠错等级、语义化双边框。
