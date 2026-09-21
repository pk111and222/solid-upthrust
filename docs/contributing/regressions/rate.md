# Rate 评分回归记录

状态：已验收（2026-09-21 二次修复与补验完成；原检查发现保留作历史证据）

## 契约

- `rate.value.controlled`：`value` 受控时父层决定是否接受点击/键盘提议；`defaultValue` 只初始化非受控值，默认 `count=5`。
- `rate.click.clear`：`allowClear` 开启后重复点击当前非零评分清零且只触发一次 `onChange`；关闭时重复点击不产生事件。
- `rate.hover.half`：`allowHalf` 将指针左半侧吸附为半星；hover 只改变 `displayValue`，点击才提交，离开恢复提交值。
- `rate.keyboard.focus`：评分容器使用 `slider`，通过 aria-valuenow/aria-valuetext 表达半星；方向键按星/半星步进，Home/数字 `0` 清零，End 选满，支持 `autoFocus`、focus/blur 回调和禁用门控。
- `rate.form.field`：Rate 接收 Form.Item 的数字值、`id`、`disabled` 与 `onChange`；显式 `value/onChange/disabled/id` 优先于字段上下文。
- `rate.visual.a11y`：列表使用 `list-none` 清除浏览器默认间距，支持 `aria-label`/`aria-labelledby`、字符数量、自定义字符与半星裁剪。

## 文件与覆盖映射

| 能力 ID | 源码与公开类型 | example 演示 | docs 页面 / 示例 | L1 | L2 | L3 | L4 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `rate.value.controlled` | `packages/components/lib/Rate/index.tsx`、`packages/competence/src/rate.ts`、`RateProps` | `example/src/pages/Rate.tsx` basic | `data-entry/rate.tsx`、`rate/basic.tsx`、`rate/controlled.tsx` | `headless/Rate/rate.test.ts` controlled value | `smoke/Rate/exports.test.tsx` | `render/Rate/contracts.test.tsx` controlled | `browser/Rate/interactions.spec.ts` basic |
| `rate.click.clear` | `packages/competence/src/rate.ts` | Rate states | rate/states | headless click cases | 同上 exports | render disabled/interaction gate | browser states |
| `rate.hover.half` | Rate UI pointer geometry + `createRate` lattice | Rate half | rate/half | headless hover/click cases | 同上 exports | render half preview/commit | browser half |
| `rate.keyboard.focus` | Rate UI keyboard/focus wiring | Rate basic/states | rate/basic、rate/states | headless keyboard/focus | 同上 exports | render keyboard/disabled | browser basic |
| `rate.form.field` | `useFormItem` integration in Rate | Rate context | rate/context | —（Form store 属 UI 集成） | smoke mount | render Form.Item real store | browser form |
| `rate.visual.a11y` | Rate styles, ARIA and public props | Rate states | rate page/API | —（DOM/绘制不适用） | smoke mount | render structure | browser states/dev/SSR |

L2 当前按仓库约定验证公开导出、真实挂载、ref 和卸载；没有复制 L3 的完整行为矩阵。

## 本轮修复

- `allowClear` 改为只通过共享数值机发出一次清零回调，消除重复 `onChange`。
- Rate 的 headless `onChange` 改接 `form.onChange`，使真实 Form.Item 能写回数字字段；显式回调仍由 `useFormItem` 优先处理。
- UI 接通 `id`、`aria-label`、`aria-labelledby`、`autoFocus`、focus/blur 回调，并用 `untrack` 调用 ref，避免 Solid 2 严格读追踪噪音。
- 使用现有 `rateListClass` 清除 `ul` 默认 margin/padding，保证生产 CSS 下星形列表几何稳定。

## 验证记录

| 命令 | 结果 | 未通过 / 未运行原因 |
| --- | --- | --- |
| `pnpm --dir packages/testing run test headless/Rate smoke/Rate render/Rate` | 28/28 通过，3 文件 | — |
| `pnpm test` | 1490 条中 1489 条通过，157 文件中 1 文件失败 | 既有 `render/_VirtualList/Selectors.test.tsx` 的 `[virtual-list.selector.2]` 超时；与 Rate 无关，TODO 已记录为 Select 虚拟列表/B09/D06 遗留 |
| `pnpm run typecheck` | 通过 | — |
| `pnpm run build` | 通过 | example 后续补充 context 演示后另行执行了 `pnpm --dir example run build` |
| `pnpm --dir example run build` | 通过 | 仅有仓库既有大 chunk warning |
| `pnpm run check:docs` | 通过，类型检查并预渲染 24 页 | — |
| Rate 专项 Playwright | 10/10 通过，docs + example | 配置：`packages/testing/playwright.rate.config.ts` |
| `git diff --check` | 通过 | — |

## 未决项

- Rate 本身未发现未决缺陷；L4 已覆盖 docs 与 example 生产静态产物、开发 CSS、SSR 原始 HTML、键盘、半星、禁用、清空和 Form 提交。
- 完整 L1–L3 的 Select 虚拟列表既有超时仍需按原台账由 B09/D06 处理；本记录不把它归因于 Rate，也不勾选无关阶段。
- 完整 Form 回归仍留在 C07；本轮只验证 Rate 的实际 Form.Item 注入路径。

## 2026-09-21 二次快速检查

范围：参考任务 `01a0c2ec-7ea9-79b3-ab69-04b449d7af21`，复核当前脏工作区源码、前序 diff、API、示例与目标用例。只检查，不修改生产实现；先前“本身未发现未决缺陷”的结论被本节更新。

### 已复现问题（均 P2）

- `rate.default.initial-only`：`Rate/index.tsx:66` 在 memo 内创建状态机，`rate.ts` 同步读取 `config.defaultValue`，导致响应式 defaultValue 变化重建机器。初始 2 → 用户点 4 → 父层 defaultValue 改 1，评分被覆盖为 1，违反文档“只初始化一次”。应稳定机器生命周期，初始化值非追踪读取。
- `rate.keyboard.reset-hover`：hover 第 4 星时按数字 0，onChange 正确发出 0，但 `rate.ts:139` 的 reset 没有清除 hover，填充仍显示 4 星；与 stepBy 清除预览的行为不一致。
- `rate.a11y.single-choice`：`Rate/index.tsx:164` 用 `value >= n` 设置 aria-checked。value=3 时三个 radio 同时选中，value=2.5 也无法准确传达半星。现有 render 测试反而断言多个 radio 选中，固化了错误。应将填充与选择语义分开，并明确半星的可访问值表达。依据：[WAI-ARIA Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)（组内至多一个选中）。

### 文档与覆盖缺口

- `rate-api.json:6` allowClear 默认列写 true，但实现和同一行描述均为 false；onChange 描述“重复点击不触发”还需注明 allowClear 例外。
- 基础评分、受控、半星、禁用、清空、自定义字符/count、Form 均已有独立示例；autoFocus/ref/focus/blur 虽有 API 和部分测试，尚缺使用示例。
- 上述三种失败场景均未被原 28 条测试捕获。动态 count/allowHalf/disabled、Form reset 的实际行为仍缺定向覆盖，不把未验证记为通过。

### 本次实际验证

- 当前安装及锁定的 solid-js / @solidjs/web 均为 2.0.0-rc.0。
- `pnpm --dir packages/testing run test headless/Rate smoke/Rate render/Rate headless/Segmented smoke/Segmented render/Segmented`：6 文件、49 条全部通过。日志：`/tmp/rate-segmented-review-baseline.log`。
- 4 个临时 DOM 探针：Rate 上述 3 项 + Segmented 移除候选项，4/4 按预期暴露缺陷。探针源码保存在 `/tmp/rate-segmented-review-probes.test.tsx`，日志 `/tmp/rate-segmented-review-probes.log`；临时测试文件已移出仓库，原测试未删除或修改。重现时将源码放到 `packages/testing/render/Rate/second-review.tmp.test.tsx` 并定向运行即可。
- `pnpm run typecheck`：通过。按用户“快速而非全量”要求，没有重跑全量、构建或浏览器套件；本节没有新增真实绘制验收结论。

## 2026-09-21 二次修复与补验完成

上节发现均已关闭：

- `rate.default.initial-only`：UI 在组件生命周期内只创建一次机器，headless 非追踪读取 defaultValue；后续默认值变化不覆盖用户评分。
- `rate.keyboard.reset-hover`：reset 与 allowClear 清零同时清除 hover；动态 count/allowHalf/disabled 更新取消过期预览。动态 count 限制显示范围，步进从有效显示值开始并吸附到当前整星/半星步长。
- `rate.a11y.value`：改用单个 slider 表达 0..count 与小数评分，星形为隐藏的展示节点；补 Home/End。现有测试由错误的多个 radio 选中断言改为精确 aria-valuenow 及真实填充断言。保留 ul ref 和原指针交互。
- 修正文档 allowClear 默认 false、清空事件例外；补 focus/blur、ref、动态 autoFocus 示例并同步 example；文档明确外部受控值不会被自动改写。

### 新增/补强能力映射

| 能力 | 验收文件 | 文档 / 示例 |
| --- | --- | --- |
| 默认值初始化、hover 清零、准确半星 ARIA、动态 count/allowHalf/disabled | `render/Rate/dynamic.test.tsx` | rate API、usage/limits、既有半星与状态示例 |
| Form submit/reset 与焦点生命周期 | `render/Rate/contracts.test.tsx`、`browser/Rate/interactions.spec.ts` | `rate/context.tsx`、新增 `rate/focus.tsx`、example Rate |
| 真实清零绘制、slider 键盘、半星提交、Form 双端 | `browser/Rate/interactions.spec.ts` | docs + example |

### 最终执行结果（当前工作区）

- 修复前正式失败用例：`render/Rate/dynamic` 与 `render/Segmented/dynamic`，4 条失败；日志 `/tmp/rate-segmented-fix-before.log`。原临时探针已转为正式回归，没有删除失败契约。
- 两组件定向 L1–L3：9 文件、57 条通过；日志 `/tmp/rate-segmented-fix-target.log`。最后的步长吸附补强另跑 `headless/Rate render/Rate`，31 条通过，日志 `/tmp/rate-segmented-fix-rate-final.log`。
- 最终全量 `pnpm --dir packages/testing run test --maxWorkers=2`：163 文件、1508 条全部通过；日志 `/tmp/rate-segmented-fix-full.log`。
- 根 `typecheck`、docs `typecheck`、testing `typecheck:browser` 均通过；对应 `/tmp/rate-segmented-fix-{typecheck,doc-types,browser-types}.log`。
- `pnpm run build`、`pnpm run build:docs` 通过，25 页静态输出；对应 `/tmp/rate-segmented-fix-{build,doc-build}.log`。保留既有打包 external/global-name 与大 chunk 警告。
- Rate 专项 Playwright：10/10 通过，无跳过；日志 `/tmp/rate-segmented-fix-rate-browser.log`。含 docs/example 生产交互及 docs 开发挂载、原始 SSR。
- Segmented 专项结果见其记录；两套最终浏览器日志未出现 STRICT_READ_UNTRACKED / NO_OWNER_CLEANUP。
- `git diff --check` 通过。无站点路由/SSR/base/公共框架改动，按 TODO 不重复双 base 通用验收。

本轮发现的 Rate 缺陷与列出的缺口已验收关闭；不扩展为跨浏览器、辅助技术实机或 npm 消费者发布验收。未改共享 selection.ts、锁文件；类型声明通过构建生成。未提交或推送。
