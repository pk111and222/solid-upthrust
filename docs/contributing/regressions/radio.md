# Radio 回归

状态：已验收（2026-09-20，源码工作区，含 RadioGroup / RadioButton）。接手保留前序 Checkbox 全部未提交改动；Node 22.22.0、pnpm 11.16.0、Solid / @solidjs/web 2.0.0-rc.0、vite-plugin-solid 3.0.0-next.27，未改锁文件。

## 契约与修复

- Radio / RadioGroup 的状态机不再包裹在会随初值变化重建的 memo 中；默认属性通过 untrack 读取，只初始化一次。有效选中才发事件，已选项重复操作、禁用事件及 false change 不通知。
- 修复共享 createSelection 在初始同步之后接受父层拒绝的选择意图，以及属性 getter 不追踪后续值的问题。受控值始终优先，内部状态只接收非受控写入；保留已接受 props 的镜像用于释放控制。未修改同文件 createNumericValue。
- 原生 radio 激活会先取消旧项，而且旧项不触发 change。组内注册输入及状态 getter，事件结束后恢复整组原生 checked，避免受控拒绝后旧、新项全部失选。注册在组件 owner 上清理；初次 ref 内 onCleanup 的实现经失败用例复现后修正。
- RadioGroup 回调接入 FormItemContext，普通组和按钮组都写入标量；RadioButton 不再向字段额外写入 true。组 ID 留在容器，子项不重复使用字段 ID。显式值/回调/禁用保持优先级。
- 默认生成唯一 name；显式 name 动态更新。skipGroup 或无 value 的 Radio 不继承组值/name。组禁用叠加单项禁用，子项 false 不能绕过；组事件后通知子项事件，各一次。
- RadioButton 补具名组件导出（此前仅有公开类型）。支持自定义子项、独立非受控选择；按钮模式保留 children；新增 single 位置，自动生成的单选项左右圆角完整。
- 普通 input 放到可视圆点前，使 peer 焦点和悬停选择器生效；透明输入覆盖标签。按钮焦点用 :has(:focus-visible) 作用到自身 label。禁用且选中的按钮使用更深背景，以区分禁用未选项。
- 三个组件都是具名导出，不提供静态 Radio.Group / Radio.Button；不承诺对齐任何外部组件库特定版本。多个互斥选项使用 RadioGroup，不能只靠相同 name 拼接多个各自管理状态的独立 Radio。

## 能力映射

源码：`packages/competence/src/radio.ts`、`packages/components/lib/Radio/{index.tsx,styles.ts}`；必要共享依赖 `competence/src/selection.ts`。组件 barrel 补 RadioButton，声明由构建生成，未手改产物。

文档：`docs/src/pages/components/data-entry/radio.tsx` 和 radio / radio-group / radio-button 三份 API JSON，三个组件均有独立章节和 API 表。7 个 `docs/src/examples/radio/*.tsx`，SSR 只引用同文件 `?raw`；example 页面复用这些示例。受控确认示例具有请求反馈、确认和取消入口；ref 示例说明“只移焦，之后空格选中”。

| 能力 ID / props | 示例 | 验证位置（packages/testing 下） |
| --- | --- | --- |
| radio.controlled / uncontrolled / dynamic：checked/defaultChecked/onChange/disabled | basic、controlled | L1 headless/Radio/radio.test.ts standalone、dynamic；L3 render/Radio/contracts.test.tsx controlled、uncontrolled；L4 browser/Radio/interactions.spec.ts controlled、paint |
| radio.native：id/name/value/ref、children、class/style | basic | L3 native；L4 paint（16px 圆、8px 点、1px 边框、焦点环、ref）、dev |
| radio.group.controlled / dynamic：value/defaultValue/options/name/optionType/class/style | group、dynamic、controlled | L1 group value/options/controlled-dynamic；L3 group.controlled、group.dynamic；L4 keyboard、controlled、dynamic |
| radio.group.disabled / children：子项 checked 覆盖、数字/字符串零、skipGroup、子项事件、无值子项 | dynamic、custom-buttons | L3 group.disabled、group.children、form.group-explicit；L4 dynamic、custom |
| radio.form：独立 boolean 与组标量、事件/禁用/id 注入、显式优先 | context | L3 form、form.standalone、form.group-explicit；L4 form（真实 Form 提交普通与按钮组标量） |
| radio.button：value/disabled/position/class/style/children/onChange；first/middle/last/single | buttons、custom-buttons | L3 render/Radio/button.test.tsx standalone、group；L4 buttons（拼接几何、单项圆角、禁用选中背景）、custom |
| radio.inputs.cleanup / exports.mount：原生 ref、注册销毁、组件与类型出口 | 全部 | L2 smoke/Radio/exports.test.tsx；L3 inputs.cleanup、button.group；L4 dev 禁止 NO_OWNER_CLEANUP |
| radio.group.store：select/clear/value/isSelected/isDisabled/options/store/onSelectionChange | group（UI 通过受控标量实现，不暴露实例方法） | L1 radio.test.ts；clear 保留禁用项，组禁用无操作，清空通过 raw [] 通知 |
| selection.controlled.reject / dynamic：literal、属性 getter、函数 getter、更新/释放控制 | 内部依赖，无独立 UI 页 | L1 headless/shared/Selection/controlled.test.ts；consumers.test.ts 覆盖 Select、Cascader、Segmented 包装层；L3 render/Select/selection-integration.test.tsx、render/Cascader/selection-integration.test.tsx |

L1 验证状态，不测 CSS；L2 仅出口/挂载/卸载；L3 不替代浏览器焦点和绘制；L4 不复制全套状态排列。Radio 无网络、异步请求、定时器、全局监听，相关竞态不适用；owner 与输入注册显式清理。B02 只验本控件消费的字段协议，B06 只修复 Selection 受控路径，不关闭完整共享能力验收。

## 实际验证

| 命令 / 阶段 | 结果 |
| --- | --- |
| `pnpm --dir packages/testing run test headless/Radio headless/shared/Selection` 基线 | 2 文件、43 条通过 |
| 新 UI / Selection 用例修复前 | 13 条失败、2 条通过；见 repro.log |
| 输入注册清理失败复现 | 清理回调 0 次而应为 2；修正后通过，见 cleanup-repro.log |
| 目标与消费者：`test headless/Radio render/Radio smoke/Radio headless/shared/Selection headless/Select render/Select headless/Cascader render/Cascader headless/Segmented` | 12 文件、139 条通过；其中 Radio 四文件 35 条，剩余为共享依赖与消费者 |
| `pnpm test` | 148 文件、1438 条通过 |
| `pnpm run typecheck` | 通过 |
| `pnpm --dir packages/testing run typecheck:browser` | 通过 |
| `pnpm run check:docs` | 类型与根路径静态构建通过，共 20 页 |
| `pnpm run build` | preset / competence / components / example 通过；既有 example 大 chunk 提示保留 |
| `pnpm --dir packages/testing exec playwright test --config playwright.radio.config.ts` | 最终 16 条通过：docs 9（含开发绘制和原始 SSR），example 7；Chromium |
| `git diff --check` | 通过 |

临时日志：本机 `/tmp/radio-regression/` 的 baseline、repro、cleanup-repro、target、consumer-dom、full、types、browser-types、docs、build、browser `.log`。截图：`packages/testing/test-results/radio/` 中 paint 和 buttons 用例的 states.png / buttons.png。临时日志与截图不是永久归档。最终 docs/buttons.png 与 example/states.png 均已实际查看：禁用已选背景比禁用未选更深、普通圆点与焦点环正常；首轮 docs 两类截图也已查看。浏览器 runner 已退出并清理自身服务。

## 边界

未改站点路由/base/SSR/公共框架，不重复双 base 通用套件；新页面由根路径构建、原始 HTML 和目标浏览器覆盖。Chromium 证据不代表 Firefox/WebKit、独立安装消费者、完整 SSR 或发布验收；未推送、部署或发布。

仅完成 Radio 家族及必要 Selection 修复。Select/Cascader/Segmented 的局部消费者补验不代表各物料已验收；Switch 等后续物料不自动开始。Checkbox 前序改动完整保留。

开发页仍有一条标记 `<Form>` 的 STRICT_READ_UNTRACKED 提示，与 Checkbox 记录一致，留给 C07/B01；本轮新增的 Radio 输入清理问题已修复，最终浏览器用例明确断言无 NO_OWNER_CLEANUP。
