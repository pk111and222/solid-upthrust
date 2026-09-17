# Button 回归

状态：已验证（源码工作区与当前 Chrome；不代表发布验收完成）。

## 契约与必要性

Button 是公开的基础操作入口，承担操作触发、原生表单提交/重置、链接跳转和图标操作。
保留公共 Button / ButtonProps，补导出 ButtonIns、ButtonType、ButtonShape、ButtonVariant、ButtonColor。
默认 button / middle / default shape / outlined-default；显式 variant 优先于 type，danger 优先于 color。
ConfigProvider 默认值与显式覆盖继续有效。内部实现不加入公开文档。

- 非空 href 直接输出 a，否则 button，杜绝嵌套交互节点与递归点击。
- disabled 和 loading 阻止回调及默认行为；链接移除 href，禁用退出 Tab 顺序。
- loading 布尔值受控；对象形式保留原有“点击后立即加载 delay 毫秒”行为。没有改成延迟显示；不自动等待 Promise。
- htmlType 默认 button，可选 submit/reset；原生属性、class/style、ARIA、data-* 和原生事件透传。
- onClick 每次有效激活一次，原始 MouseEvent 可 preventDefault；ref 提供当前根元素与 click()。
- href 切换时移除旧节点监听；销毁清理加载/波纹计时器和实例引用。
- children=0 显示字符 0；加载图标替换 icon，装饰图标/波纹不参与可访问名称。
- 不承诺其他组件库完整 API 兼容；不支持自动汉字间距、自定义加载图标。

## 文件与覆盖映射

源代码统一为 `packages/components/lib/Button/{index.tsx,styles.ts}`、
`packages/competence/src/button.ts`；公开导出在对应 lib/src index。
开发演示 `example/src/pages/Button.tsx` 复用下列独立示例。
公开文档 `docs/src/pages/components/general/button.tsx` 与 `button-api.json`，
示例 `docs/src/examples/button/<名称>.tsx`，各自独立 Demo + 同源 ?raw 代码区。

测试路径以下均相对 packages/testing；测试标题含能力 ID，每条用例上方有中文备注。

| 能力 ID | 示例 | L1 | L2 | L3 | L4 |
| --- | --- | --- | --- | --- | --- |
| button.exports.types / button.mount.provider | basic、size | 无独立状态 | smoke/Button/exports.test.ts；mount.test.tsx | render/Button/props.test.tsx | browser/Button/interactions.spec.ts |
| button.type / button.variant.color / button.precedence | basic、variants、ghost、block | 外观无独立状态 | 同上基础挂载 | props.test.tsx：5 种 type、18 种 variant×color、danger/ghost/block/disabled | interactions.spec.ts：真实宽度 |
| button.size.shape / button.icon / button.empty.native | size、icon、loading、native | 展示分支无需 L1 | mount.test.tsx | props.test.tsx：9 种尺寸形状、前后图标、loading 替换、零值及空内容 | interactions.spec.ts：24/32/40px、圆形比例、mask 绘制、移动端溢出 |
| button.controlled.activation / button.loading.duration / button.loading.zero / button.lifecycle.cleanup | loading、duration、disabled | headless/Button/button.test.ts | mount.test.tsx | activation.test.tsx、props.test.tsx | interactions.spec.ts：键盘加载与复位 |
| button.link.root / button.link.blocked / button.ref.dynamic | link、disabled、native | button.test.ts：激活与清理 | mount.test.tsx | activation.test.tsx、props.test.tsx：阻止导航、动态根节点与旧监听 | interactions.spec.ts：Enter 跳转、实例单次调用 |
| button.native / button.wave | form、native、basic | button.test.ts：波纹重启清理 | exports.test.ts | props.test.tsx：原生类型/事件、6 种波纹分支 | interactions.spec.ts：真实提交/重置、Enter/Space |
| button.browser.docs | 全部 12 个示例 | 站点既有路由校验 | 无独立组件挂载需求 | 站点既有 islands 测试 | interactions.spec.ts：独立代码区/API；browser/docs：SSR、双 base、菜单导航、复制 |

## 修复证据

修改源代码前运行 render/Button/activation.test.tsx，2 条用例均失败：
链接包含 button；卸载后残留 1 个 loading 计时器。修复后通过。
补组合测试时发现 children=0 不显示，修复后前后图标两种分支通过。

## 验证记录

| 命令 | 结果 |
| --- | --- |
| pnpm test | 92 文件 / 1116 条通过（Button 57 条） |
| pnpm run typecheck | 0 错误；包含公共类型契约 |
| pnpm run typecheck:docs | 通过 |
| pnpm --dir packages/testing run typecheck:browser | 通过 |
| pnpm run build | preset / competence / components / example 通过，声明由构建生成 |
| pnpm run check:docs | 10 个静态文档页面，根路径通过 |
| DOCS_CHROMIUM_PATH=本地Chrome pnpm run test:docs:browser | 根路径 12 + /solid-upthrust/ 12 通过 |
| DOCS_CHROMIUM_PATH=本地Chrome pnpm --dir packages/testing exec playwright test --config playwright.button.config.ts | docs 3 + example 2 通过 |
| DOCS_BASE=/solid-upthrust/ 加上述 Button 专项命令 | docs 3 + example 2 通过 |
| DOCS_BASE=/solid-upthrust/ + playwright.c01.config.ts | C01 联动回归 5 条通过 |
| git diff --check | 通过 |

浏览器截图在忽略目录 `packages/testing/test-results/button/`，已检查桌面页面；
移动端检查 390px 页面无横向溢出。专项配置支持 DOCS_BASE，使用前需构建对应 base 的 docs 产物。

## 边界

- 浏览器验证使用当前机器 Chrome，尚未验证 Firefox/WebKit、屏幕阅读器或完整视觉基准对比。
- 源码入口类型与构建声明已验证，未做发布包的全新消费者安装/tree shaking 验收。
- 原有 example 大 chunk（>500KB）警告仍存在；没有升级框架、修改依赖或发布部署。

## 后续修复：开发模式虚线边框消失

用户反馈虚线看起来不是虚线。生产产物的 dashed/1px 检查通过，但开发模式复现为
`border-style: dashed; border-width: 0px`。CSS 原文中 `.border` 与 ColorPicker 的
`::-moz-range-thumb`、`::-webkit-slider-thumb` 被 UnoCSS 合并成一个选择器列表；
Chrome 不支持 Firefox 伪元素，导致整个规则无效。底部阴影造成看起来像实线的错觉。

- docs、example、components 的 UnoCSS 配置设置 `mergeSelectors: false`，保留独立规则。
- Button 本身的 border/dashed 类无需更改；README 和 docs README 说明配置原因。
- 新增 `browser/docs/dev.spec.ts` 的 `button.dev.dashed`：修复前 0px 失败，修复后 1px/dashed 通过。
- 新增 `browser/Button/interactions.spec.ts` 的 `button.browser.dashed`：检查 type、三种颜色、hover 和四边样式。
- 当前本地 5657 页面已直接验证为 1px dashed，截图 `test-results/button/dashed-dev-fixed.png`。

后续修复验证：根级类型检查、全量 1116 条测试、生产构建通过；
文档双路径各 13 条通过；Button 浏览器专项 docs/example 共 7 条通过；
`git diff --check` 通过。构建仍只有既有大 chunk 警告。
