# Switch 回归

状态：已验收（2026-09-20，源码工作区）。保留前序 Checkbox、Radio 全部未提交改动。Node 22.22.0、pnpm 11.16.0、Solid / @solidjs/web 2.0.0-rc.0，未改锁文件。

## 契约与修复

- 状态机只创建一次，默认值通过 untrack 初始化，后续默认属性变化不重置非受控状态。checked / defaultChecked 优先于 value / defaultValue，false 也是有效值。
- 修复 Form 字段回调被始终存在的包装函数遮蔽，字段现在接收布尔值；显式值、回调及禁用配置保持优先级。本轮只修改 Switch 的接入，不改共享 Form 协议。
- 接通 UI onClick，保留 headless 的 onClick(next, event) 在 onChange 前调用的契约。loading 保留焦点并报告点击尝试，但不切换状态或触发 onChange；disabled 使用原生禁用，UI 不触发点击回调。直接调用 headless toggle 时，禁用也会报告 onClick，与原有契约一致。
- 移除手工 Enter 切换，使用原生 type=button 的 Enter / Space 激活，避免一次操作重复触发或提交表单。
- 修复小号滑块开启位置、文字留白和 RTL 逻辑方向；large 映射中号。补可见焦点环、加载图标尺寸及动画，禁用/加载已选状态悬停保持背景色。
- 数字 0 文案正常渲染；显式 style 覆盖默认内边距；ref 返回原生 HTMLButtonElement。loading 标记 aria-busy，滑块装饰对辅助技术隐藏。

## 能力映射

源码：`packages/competence/src/switch.ts`、`packages/components/lib/Switch/{index.tsx,styles.ts}`。公开 Switch / SwitchProps 出口保持现状，无公开子组件。

文档：`docs/src/pages/components/data-entry/switch.tsx`、`switch-api.json`，覆盖全部 17 个 props。6 个独立 `docs/src/examples/switch/*.tsx`；SSR 仅引用同文件 raw 源码，example 页面复用示例。受控示例显示状态和点击计数；ref 示例明确“只移焦，再按空格切换”。

| 能力 ID / props | 示例 | 验证位置（packages/testing 下） |
| --- | --- | --- |
| switch.controlled / uncontrolled / alias-precedence：checked/value/defaultChecked/defaultValue | basic、controlled、aliases-ref | L1 headless/Switch/switch.test.ts；L3 render/Switch/contracts.test.tsx controlled、uncontrolled、aliases |
| switch.dynamic / gates：loading/disabled/onClick/onChange、事件顺序与父层更新 | controlled、states | L1 dynamic、toggle/setChecked 门控；L3 gates；L4 browser/Switch/interactions.spec.ts keyboard、loading |
| switch.form / config.dynamic：布尔字段、显式覆盖、ConfigProvider | context | L3 form、config.dynamic；L4 form 真实提交及 Enter 不提交 |
| switch.native / aliases：id/name/ref/autofocus/class/style、零与 JSX 文案 | basic、aliases-ref | L3 native、aliases；L4 ref、dev |
| switch.geometry：size、两态文字、RTL、焦点及加载绘制 | sizes、states | L4 geometry、keyboard、loading、dev，含真实尺寸和图标样式断言 |
| switch.exports：组件、类型、挂载/卸载 | 全部 | L2 smoke/Switch/exports.test.tsx |
| switch.ssr：正文、API、示例源代码 | 文档页 | L4 ssr 原始静态 HTML |

L1 验证状态和 headless 方法；L2 验证出口与基本挂载；L3 验证 DOM 合同；L4 验证原生键盘、绘制和真实 Form。Switch 没有网络、定时器、全局监听或公开实例方法；异步请求竞态不适用，loading 由调用方管理。

## 实际验证

| 命令 / 阶段 | 结果 |
| --- | --- |
| 原有 L1 基线 | 1 文件、10 条通过 |
| 新 L3 用例修复前 | 6 条失败；别名、事件、Form 等问题可复现，见 repro.log |
| `pnpm --dir packages/testing run test headless/Switch render/Switch smoke/Switch` | 3 文件、20 条通过 |
| `pnpm test` | 150 文件、1448 条通过 |
| `pnpm run typecheck` | 通过 |
| `pnpm --dir packages/testing run typecheck:browser` | 通过 |
| `pnpm run check:docs` | 类型检查与根路径静态构建通过，共 21 页 |
| `pnpm run build` | preset / competence / components / example 通过；既有 example 大 chunk 提示保留 |
| `pnpm --dir packages/testing exec playwright test --config playwright.switch.config.ts` | Chromium 共 12 场景（docs 7、example 5）均有通过证据：最终整轮 11 通过、1 失败，修正坐标点击前滚入视口后 `--last-failed` 1 条通过 |
| docs geometry 单项，独立 switch-visual 输出目录 | 1 条通过，重新生成截图并实际查看 |
| `git diff --check` | 通过 |

浏览器前轮失败为“中号”名称匹配不唯一及 aria-disabled 导致 locator.click 拒绝操作；分别使用精确名称和真实鼠标坐标点击验证 loading 点击尝试。坐标点击需先滚入视口。未放宽状态、事件计数或几何断言。happy-dom 未提供 autofocus 对应属性，改验原生布尔 attribute；浏览器亦验证挂载后的 attribute，不将自动获得焦点作为保证。

临时日志在本机 `/tmp/switch-regression/`：baseline、repro、fixed、target、full、types、browser-types、docs、build、browser、browser-final、browser-retry、visual `.log`。实际查看 `packages/testing/test-results/switch/` 的 docs states.png，以及 `switch-visual/` 的 docs sizes.png：禁用两态可区分，小中号/large/RTL 滑块与文字间距正常。states 截图在结束加载后拍摄，加载图标由此前浏览器尺寸、mask 和动画断言验证。临时日志和截图不是永久归档，浏览器 runner 已退出。

## 边界

B02 仅验 Switch 消费路径，不关闭完整共享表单验收。开发页既有 `<Form>` 的 STRICT_READ_UNTRACKED 提示留给 C07/B01。name 作用于 type=button，不会自动把布尔值写入原生 FormData；使用 Form 字段协议取值。autofocus 受原生浏览器策略约束，自定义过小 style 可造成内容裁切。

未改路由/base/SSR 框架，不重复双 base 通用套件；本轮覆盖根路径构建、原始 HTML、开发页及生产预览。Chromium 证据不代表 Firefox/WebKit、独立安装消费者或发布验收；未推送、部署、发布。下一物料 InputNumber 尚未开始。
