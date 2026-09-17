# Skeleton 详细回归

状态：已实现并验证；范围为源码工作区、docs/example 与当前机器 Chrome。

## 必要性与公开契约

Skeleton 用于首次加载的结构占位。主组件组合标题、段落、头像并切换真实内容；
SkeletonButton / SkeletonAvatar / SkeletonInput / SkeletonNode 用于自定义布局。
四个子组件均为公开能力，同时提供 Skeleton.Button/Avatar/Input/Node；并非内部物料。

公开入口保持上述值与 Props 导出，补齐 SkeletonIns、SkeletonElementProps 类型导出。
没有把内部样式函数或其他内部组件加入文档。

- loading 默认 true；false 直接输出 children，没有额外占位容器；class/style 只影响加载分支。
- 默认全宽标题 + 三行全宽段落，不自动缩短末行。title/paragraph=false 分别关闭。
- width 数字为像素，字符串为 CSS 长度；paragraph 单宽度作用于所有行，数组逐行匹配，缺项全宽，多余项忽略，零宽度保留。
- rows 默认 3；向下取整，负数和非有限数归零。未承诺超大行数的性能。
- 主头像默认不显示，启用后为 32px/circle；对象支持数字或 CSS 字符串尺寸与 square。
- 子组件 small/middle/large 为 24/32/40px；数字为 px。Node 不传 size 默认 100px，显式 middle=32px。
- Button 默认宽为高的 2.5 倍；circle 宽高相同；block 宽 100% 优先于 circle。Input 默认 160px，block 为 100%。style 可以覆盖计算尺寸。
- active 默认 false；主题 outlineVariant 驱动静态背景和渐变；prefers-reduced-motion=reduce 时停止动画。
- 所有占位 aria-hidden，业务容器自行提供 aria-busy/状态信息。Node.children 仅为装饰内容，不放可聚焦元素。
- 子组件没有 loading/disabled/点击行为；主组件 ref 只提供 loading()。
- Skeleton 不读取 ConfigProvider 默认尺寸/禁用/组件配置，只继承主题 CSS 变量。
- 不宣称与其他组件库 API 完全兼容。

## 修复与失败证据

修改前新增 render/Skeleton/contracts.test.tsx，三条失败：CSS 字符串头像尺寸被丢弃，
Node middle 得到 100px，主占位未 aria-hidden。修复后通过。

headless/Skeleton/theme.test.ts 修改前失败，动画使用硬编码浅色而非主题变量；
现改为主题渐变并补减少动态效果支持。浏览器验证主题切换实际改变 background-image。

统一 createSkeleton 与 skeletonBlocks 的派生实现；规整 rows，避免 Infinity 导致循环不结束。
修正旧注释中的末行自动缩短、头像始终圆形等不符合实现的描述。

## 文件与能力覆盖映射

源码：`packages/components/lib/Skeleton/{index.tsx,parts.tsx,styles.ts}`、
`packages/competence/src/skeleton.ts`，类型入口 `packages/components/lib/index.ts`。

文档：`docs/src/pages/components/feedback/skeleton.tsx`、主组件与四个子组件各自独立的 API JSON；
独立示例 `docs/src/examples/skeleton/*.tsx`。开发页 `example/src/pages/Skeleton.tsx`
复用这些示例，不再把整个开发页面塞进单个代码区，也不自动反复切换干扰阅读。

下表测试路径相对 `packages/testing/`。每条用例前均有中文备注，参数化用例覆盖有意义的组合。

| 能力 ID | 独立示例 | L1 | L2 | L3 | L4 |
| --- | --- | --- | --- | --- | --- |
| skeleton.exports / skeleton.mount | basic、四个子组件 | 无额外逻辑 | smoke/Skeleton/mount.test.tsx：公开类型/具名与静态别名、更新和卸载 | render/Skeleton/Skeleton.test.tsx | browser/Skeleton/rendering.spec.ts |
| skeleton.blocks.default / composition / width / width-array / rows | basic、composition、width | headless/Skeleton/skeleton.test.ts：布尔组合、单值/数组/0、行数边界 | mount.test.tsx | composition.test.tsx：title×paragraph×avatar 八种组合、宽度与首行间距 | geometry：实际行高、8/16px 间距与宽度 |
| skeleton.controlled / dom.loading / dom.fallback / dom.child-interaction | loading | skeleton.test.ts：getter 与配置更新 | mount.test.tsx | composition.test.tsx：重复切换、空/0/文本、恢复交互 | loading：Enter/Space、aria-busy、ref |
| skeleton.avatar.css-size / dom.dynamic / dom.motion-round | avatar、active | 无独立状态机 | 基础挂载复用 | contracts.test.tsx、composition.test.tsx：CSS 长度、动态头像/段落、active×round | geometry：32px/3rem、圆角与头像间距 |
| skeleton.node.middle / parts.size / button / avatar / input-block / overrides | button、avatar-part、input、node、style | 展示子组件无需 headless | 导出别名校验 | parts.test.tsx：全部命名尺寸/数值/0、shape×block、动画与 class/style、children | geometry：子组件真实尺寸、移动端无溢出 |
| skeleton.theme.wave / browser.theme-motion | active、theme | headless/Skeleton/theme.test.ts：真实 UnoCSS 输出 | 无额外挂载需求 | composition/parts：动画开关 | theme-motion：主题切换、1.6s 动画与 reduced motion |
| skeleton.a11y.decorative | loading、node | 无独立状态 | 最小挂载 | contracts/parts：aria-hidden | loading：真实内容角色与占位无伪按钮 |
| skeleton.browser.docs-dev | 全部 12 个独立代码区 | 既有站点路由用例 | 不适用：站点能力 | 既有 islands 契约 | docs-dev：开发 CSS、独立源码展开、五张自举 API 表格；文档站双 base 回归 |

## 验证记录

- Skeleton L1–L3：60 条用例（7 个文件），覆盖主组件与四个子组件。
- 全量 L1–L3、类型、构建与浏览器最终结果见本节后续追加记录。
- 已运行 `pnpm run build`：三个生产包、生成声明、example 通过；保留已有 >500KB chunk 提示。
- 已运行 `pnpm run check:docs`：类型检查、11 个静态页面通过。
- 已运行 `playwright.skeleton.config.ts`：根路径 docs/example 7 条通过，包含 docs 开发模式。
- 桌面与 390px 手机截图已检查，位于忽略目录 `packages/testing/test-results/skeleton/`。

运行专项浏览器前构建 docs/example，DOCS_BASE 必须匹配 docs 产物；本机通过
`DOCS_CHROMIUM_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` 使用 Chrome。

## 边界

未验证 Firefox/WebKit、完整屏幕阅读器体验、发布包全新消费者安装或视觉截图基准差异。
CSS/DOM/Chrome 验收不等于全部浏览器无障碍认证。未发布、部署或升级框架依赖。

### 最终验证

| 命令 | 结果 |
| --- | --- |
| pnpm test | 97 个文件、1170 条通过；其中 Skeleton 60 条 |
| pnpm run typecheck | 0 错误 |
| pnpm run typecheck:docs | 通过 |
| pnpm --dir packages/testing run typecheck:browser | 通过 |
| pnpm run build | 三个包、生成声明、example 通过 |
| pnpm run check:docs | 11 个静态页面通过 |
| pnpm run test:docs:browser（指定本机 Chrome） | 根路径 13 + /solid-upthrust/ 13 通过 |
| playwright.skeleton.config.ts（指定本机 Chrome） | 根路径 7 + /solid-upthrust/ 7 通过；每轮 docs 4、example 3 |
| git diff --check | 通过 |

### 子组件文档拆分

根据阅读反馈，将 Button、Avatar、Input、Node 分成四个独立章节，
每章包含用途、默认尺寸、尺寸优先级、具名导入、自己的示例/源码和完整 API 表格。
共用的 active/size/class/style 在各自表格中列全，不再使用混合属性名称。
主组件样式示例只演示主组件，避免再混入四个子组件。

拆分验证：`pnpm run check:docs` 通过（11 个静态页面）；浏览器用例类型检查与
`git diff --check` 通过；Skeleton docs 浏览器 4 条通过，包含四个独立章节各自的示例和 API 表格断言。
