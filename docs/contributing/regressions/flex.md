# Flex 回归

状态：已验收（2026-09-26，源码工作区）。保留前序 Form 等全部未提交改动。Node 22.22.0、pnpm 11.16.0、Solid / @solidjs/web 2.0.0-rc.0，未改锁文件、ConfigProvider、preset。

## 契约与修复

旧实现对照新 L3 用例的基线：57 条中 26 条失败、31 条通过。修复如下：

- **宿主透传**：原生属性、`aria-*`、`data-*`、`tabindex`、事件与 `ref` 以前会被丢掉，现在全部落到宿主元素。布局专用 props 不会以 attribute 形式泄漏到 DOM。
- **`component`**：接受任意 `ValidComponent`。原来只接受字符串标签，自定义组件拿不到计算后的 class 和 style。
- **`flex`**：数字按 CSS 原样输出，`flex={1}` 即 `flex: 1`（1 1 0%）。原来会映射成 `n n auto`，与 antd 不一致；字符串照样透传。
- **`wrap`**：新增布尔值，`true` 为 `wrap`，`false` 为 `nowrap`；`wrap-reverse` 也可用。
- **`orientation`**：新增，优先级高于 `vertical`。无效值回退到 `vertical`。
- **对齐关键字补全**：`justify` 支持 12 个值，`align` 支持 10 个值。
  - preset-wind4 不会为 `start`/`end`/`normal`/`left`/`right`/`self-*` 等关键字生成 CSS，这些改用任意属性类（如 `[justify-content:start]`）。
  - 全部写在 CVA `variants` 字面量里，UnoCSS 能静态扫描到。
- **`gap`**：
  - 新增 `medium`，作为 `middle` 的别名。
  - 预设档位判断改为 `ReadonlySet`，旧的普通对象查找会命中 `constructor` 等原型键。
  - 数字按 px 输出，字符串原样输出，`0` 也生效。
- **默认 class 收敛**：不再无条件输出 `flex-nowrap`、`justify-start` 等默认类，避免用户 class 与默认值互相覆盖时依赖顺序。
- **`empty:hidden`**：新增，与 antd 一致，空容器不占位。
- **样式合并**：`class` 经 twMerge 合并，`style` 与 gap/flex 内联值合并；两者都随信号响应式更新。

## 能力映射

- 源码：`packages/components/lib/Flex/{index.tsx,styles.ts}`。
- 公开出口：`Flex`，以及 `FlexProps`、`FlexOrientation`、`FlexWrap`、`FlexJustify`、`FlexAlign`、`FlexGap` 这些类型（`lib/index.ts`）。
- 无 competence 对应模块（纯布局组件）。

文档：

- 文档页 `docs/src/pages/components/layout/flex.tsx`，对应 API 表 `flex-api.json`（14 行，含 ref 与原生属性）。页面包含与 Space 的区别、类型出口和注意事项。
- 组件总览新增“布局”分类入口。
- 8 个独立示例放在 `docs/src/examples/flex/*.tsx`。`example/src/pages/Flex.tsx` 复用同一批文件，避免演示与文档漂移。

| 能力 ID / props | 示例 | 验证位置（packages/testing 下） |
| --- | --- | --- |
| flex.direction：vertical / orientation 优先级 | basic | L3 render/Flex/layout.test.tsx；L4 browser/Flex/layout.spec.ts direction |
| flex.align：12 个 justify、10 个 align | align | L1 headless/Flex/styles.test.ts 逐类断言真实 CSS 声明；L3 layout；L4 align 几何、keywords 全部关键字 |
| flex.gap：small/middle/medium/large、数字、字符串、0 | gap | L1 预设 `--spacing-*` 像素值、isPresetGap 原型键；L3 layout；L4 gap 实测间距与 Slider 自定义 |
| flex.wrap：布尔、wrap / nowrap / wrap-reverse | wrap | L3 layout；L4 wrap 行数、行距与反向 |
| flex.item：数字与字符串 flex | flex-item | L3 layout（与规范化探针元素对比）；L4 flex-item |
| flex.element：component、原生属性、事件、ref、自定义组件 | element | L3 render/Flex/element.test.tsx；L4 element |
| flex.inline / empty | inline-empty | L1 默认类列表；L3 element；L4 inline-empty 同行判定与空容器隐藏 |
| flex.combination / 响应式 | combination | L4 combination（宽窄两种布局分支）、mobile 390px 无横向溢出且 Segmented 不越界 |
| flex.exports：组件、类型、挂载/卸载 | 全部 | L2 smoke/Flex/exports.test.tsx |
| flex.dev / ssr | 文档页 | L4 dev（5658 开发服务器）、ssr（原始静态 HTML） |

- **L1**：用 createGenerator(presetWind4 + presetUpthrust) 生成真实 CSS。
- **L2**：出口与挂载。
- **L3**：DOM 合同。
- **L4**：Chromium 真实排版几何，docs 与 example 两个项目都跑。

Flex 没有状态机、定时器、全局监听或实例方法，异步竞态不适用。

## 实际验证

| 命令 / 阶段 | 结果 |
| --- | --- |
| 旧实现 L3 基线 | 57 条：26 失败 / 31 通过 |
| `pnpm --dir packages/testing run test headless/Flex smoke/Flex render/Flex` | 4 文件、94 条通过（L1 36 条） |
| `pnpm test` | Flex 验收时 198 文件、1725 条中 1721 通过、4 条失败（均与 Flex 无关）；按下文修复后 198 文件、1725 条全部通过 |
| `pnpm run typecheck` | 通过 |
| `pnpm --dir packages/testing run typecheck:browser` | 通过 |
| `pnpm run check:docs` | 类型检查与根路径静态构建通过，共 37 页 |
| `pnpm run build` | preset / competence / components / example 通过。components dist CSS 已确认包含 `[justify-content:*]`、`[align-items:*]`、`empty:hidden`、`gap-xs/md/lg`、`flex-wrap-reverse`。既有 example 大 chunk 提示保留 |
| `pnpm exec playwright test --config playwright.flex.config.ts`（packages/testing） | 21 条全部通过：docs 12、example 9（dev / ssr / mobile 仅跑 docs）。末次改动后连续 2 轮整轮通过 |
| `git diff --check` | 通过 |

**全量失败修复（2026-09-26，Flex 验收后追加）**：

- **Tooltip/Popover 箭头 3 条**（`tooltip.headless.arrow-enabled`、`tooltip.content.arrow`、`popover.content.arrow`）：在 HEAD 干净 worktree 中同样失败。原因是 ea98660 给共享 Trigger 加了零尺寸守卫：触发器和浮层都有真实尺寸后才测量并产出箭头数据，而 happy-dom 的 `getBoundingClientRect` 恒为 0。组件行为正确，用例前提过时。修法是给触发器与浮层打真实几何桩（headless 按元素 stub，render 按原型 stub 后 `vi.waitFor` 等待 reveal），断言不变。
- **`virtual-list.selector.2`**：不是单纯的负载抖动，而是 Select 真实的性能缺陷。10,000 个选项时每次方向键约 95ms，打开约 332ms，30 次按键在全量并发下超过 5s。根因是 `createSelect` 的 `moveActive` / `resetActiveWith` 对每个选项调用 `store.isDisabled`，而后者每次都扫描全部选项，复杂度 O(n²)。修复：
  - 每次调用只收集一次禁用键 Set。刻意不跨调用缓存：store 驱动的 options 可以原地翻转 `disabled` 而数组引用不变。
  - UI 层 `activeIndex` 把 `activeKey` 读取提到 findIndex 外。
  - 修复后按键约 0.2ms、打开约 23ms。用例与超时均未改动。
- 复验：
  - 全量 198 文件、1725 条全部通过。
  - typecheck、browser typecheck、build、`git diff --check` 通过。
  - Select 浏览器专项 39 条通过、3 条原有跳过。
- **仍存在的既有问题**：Tooltip/Popover 浏览器专项中，`tooltip.browser.hover-default-delay`（偶发还有 `custom-delay`）和 `popover.browser.hover-instant-open` 在默认并行 worker 下会间歇失败，单 worker 重复 5 次全部通过。HEAD 干净 worktree 连跑两轮同样失败，属于既有问题，本轮未修改。推测原因是 `page.clock.install()` 后虚拟时间仍随真实时间流逝，高负载下超过 100ms 的延迟窗口。
- **潜在问题（未改）**：Trigger 的 reveal 重试 60 次后，如果盒子仍为零尺寸（例如触发器本身 0×0），浮层会一直保持 `visibility:hidden`，建议并入 B04 Trigger 完整回归。

**L4 首轮 5 条失败，均为测试断言问题，组件没有缺陷**：

1. `layout()` 的内容盒高度没有扣掉边框，交叉轴居中差了正好 1px。已修正几何计算，未放宽容差。
2. inline-empty 用段落高度近似“同一行”过于脆弱，改为 Range 取前导文字矩形，判定它与 inline 容器垂直重叠、且容器位于文字之后。
3. combination 在文档双栏网格下卡片较窄，按设计会换行成上下结构。断言改为按卡片宽度分支，两种布局都验证按钮贴右下内边距。

**截图复核**：实际查看了 `test-results/flex/` 下 direction、gap、wrap、align、flex-item、element、inline-empty、combination、mobile 的截图，暴露两处示例问题，已修复：

- basic、wrap 的 Segmented 被外层纵向 Flex 拉伸成整行。
- 390px 下 gap、align 的 Segmented 越出示例内容区。

四个 Segmented 统一包在 `max-w-full overflow-x-auto` 容器中，mobile 用例补了 5 组 radiogroup 不越界的断言。align 截图中滑块位置偏移是拍摄时过渡动画未完成，等待 800ms 后复拍正常。

截图和日志是临时产物，不做永久归档，浏览器 runner 已退出。

## 边界

- 与 antd 6 不同，Flex 不读取 ConfigProvider 的 `flex` 配置（本库 ConfigProvider 没有该项），也不给子元素重置 margin/padding。
- 预设 gap 走主题 class（`gap-xs` 等），twMerge 无法与用户 class 里的 `gap-4` 去重。文档已说明应使用 `gap` prop 覆盖间距。
- 任意 CSS 值不做白名单校验，无效值由浏览器忽略。
- 文档站面包屑与目录目前只对 `/components/general/` 做了特殊处理，布局分类页沿用通用渲染，功能不受影响。本轮未改文档框架。
- Chromium 证据不代表 Firefox/WebKit、独立安装消费者或发布验收。未提交、推送、部署、发布。C08 下一物料 Grid 尚未开始。
