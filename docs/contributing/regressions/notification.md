# C11 Notification

状态：已验收（2026-09-29；下述支持范围与 Chromium 环境）。

## 契约与修复

对照 [Ant Design Notification](https://ant.design/components/notification-cn/) 公开示例与 antd 6.3.7 源码 `notification/`（index、useNotification、style），以及 `@rc-component/notification` 1.2.0 的 NoticeList / Notice / useStack，不宣称全 API 兼容。队列仍是页面级单例 `createNotificationManager`；倒计时、动画、堆叠测量与挂载都由渲染层负责。

- **headless 修复**：
  - 六个方位共用一条扁平队列，`items(placement)` 按方位过滤；`maxCount` 作用于整条队列（rc 的 `slice(-max)`），跨方位裁掉最旧的通知，默认不限数量。
  - 同 key 再次 open 时整体替换配置；换 placement 会把通知移到新的角落。`update` 只合并已给出的字段，支持废弃别名。
  - `close(key)` 触发一次 onClose；`close()` 全部关闭时不触发（rc destroy 语义）。
  - `configure` 忽略 undefined 字段，`duration: false` 归一为 0。
  - 新增 `notificationStackLayout`：纯函数计算堆叠几何，折叠时每层露出 8px，展开时间距 16px。
- **视觉**：
  - notice 宽 384px（最大 100vw − 48px），内边距 20px × 24px，8px 圆角，有阴影；list 的 z-index 为 2050，距角落 24px。
  - 类型图标为 24px 的 antd 实心图标；有图标时标题 / 描述左让 36px。标题 16px / 1.5，可关闭时右侧留 24px。
  - 关闭按钮 22px 方块，位于右上 20 / 24，aria-label 为 Close，支持 Enter 键。
  - 进度条 2px，两侧各缩进 8px，展示剩余比例（100 − percent）。
  - 进场从锚边滑入；非 stack 模式离场时通过 max-height / margin 收起。
- **stack**：
  - 默认 `{ threshold: 3 }`，超过阈值时折叠。第 2、3 张卡露边、横向收窄、内容透明，更旧的卡隐藏。
  - 悬停展开，并挂 16px 的 hover 桥。悬停任意一条会暂停整个角落的计时（rc forcedHovering）。
  - `stack: false` 时按文档流排列。
- **API 对齐**：
  - `title` / `actions`（`message` / `btn` 仍可用，标记为废弃）、`closable`（布尔或对象，对象可带 closeIcon、onClose 和 aria-*）、`closeIcon`、`role`、`props`。
  - 语义化 `classNames` / `styles`：root / title / description / actions / icon，对象或函数形式。
  - `notification.config`：placement、top、bottom、duration、showProgress、pauseOnHover、maxCount、stack、getContainer、closeIcon、closable、classNames、styles。
  - 其余：`destroy(key?)`、`useNotification` → `[api, holder]`。
- **无 Provider 兜底**：首次命令式调用时在 host 上挂 `data-notification-holder`，与 Message 相同。

### 破坏性改动

- onClose 时机：`destroy()` 全部关闭时不再触发 onClose；`closable.onClose` 先于 `onClose` 触发。
- `open` 不再默认 `type: 'info'`，不传 type 时不显示图标。
- `maxCount` 由每个方位默认 3 改为整条队列计数，默认不限。
- `message` / `btn` 更名为 `title` / `actions`（旧名作为废弃别名保留）。
- 图标由 mdi 换成 antd 图标；样式导出重命名；`twMerge` 换成 `mergeClass`。

### 保留差异

- 队列为页面单例，`useNotification` 的 options 会全局生效。
- open 返回 `NotificationResult { key, update, close }`，这是本库扩展。
- 未实现 RTL、prefixCls / rootClassName、PurePanel。

## 能力映射

源码：`packages/components/lib/Notification/`，逻辑 `packages/competence/src/notification.ts`。

| 能力 / 覆盖 | example / docs 示例 | L1 headless | L2 smoke | L3 render | L4 browser |
| --- | --- | --- | --- | --- | --- |
| 结构 / 几何 / 类型图标 | basic、types / basic、with-icon、custom-icon | defaults、theme | exports | default、types | geometry |
| duration 秒 / 进度条 / 悬停暂停 | progress / duration、show-progress | never、configure | — | duration、pause、stack-pause、progress | progress |
| 关闭 / closable / closeIcon | actions / custom-actions | close、close-all | exports | close、closable、destroy | placement |
| 同 key 更新 / update | update / update | same-key、move、update | exports | update | update |
| 六个方位 / 偏移 / maxCount | placement / placement | placement、max-count | — | placement | placement |
| stack 折叠 / 展开 | stack / stack | stack-expanded、stack-collapsed | — | stack | stack |
| 语义化 / holder / useNotification | semantic / style-class、hooks | singleton | exports | semantic、holder、hooks | semantic |

测试路径：headless `Notification/notification`（16）+ `theme`（1），render `Notification/contracts`（15），smoke `Notification/exports`（1），browser `Notification/notification`（6 条 × 2 项目）。

## 踩坑

- wind4 下 `start-lg` / `end-lg` / `left-lg` / `right-lg` 都不生成 CSS（spacing token 不作用于 inset），改用 `left-[24px]` / `right-[24px]`。
- keyed `<For>` 回调收到的是原始值，不是 accessor；对 `placement()` / `key()` 调用会直接抛错。
- components 的类型读取 competence 的 dist：改完 competence 后，要先重建 competence，再跑 typecheck。
- 更新时，如果 patch 里用了废弃别名（`update({ message })`），open 时给出的规范字段（title）仍会优先生效，因此要显式清空规范字段。
- 堆叠测量依赖入场 rAF：render 测试断言最新一张卡片之前，要先推进约 50ms，让入场状态翻到 visible。

## 验证记录

环境：Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0。日志目录：`output/c11-notification/`。

| 命令 / 证据 | 结果 |
| --- | --- |
| 修复前 | 每方位独立队列且 maxCount 默认 3、open 默认 info、destroy() 触发 onClose、无 stack 折叠 / hover 桥、mdi 图标、无 closable 对象 / role / props / 语义化 / config.stack / useNotification、无 Provider 时静默失效 |
| `pnpm test --maxWorkers=2` | 287 个文件、2818 条通过（vitest.log） |
| `pnpm run typecheck` / `typecheck:docs` / `packages/testing typecheck` / `typecheck:browser` | 均通过（typecheck*.log） |
| `pnpm run build` / `pnpm run build:docs` | 通过（build.log、build-docs.log） |
| `playwright test -c playwright.c11-notification.config.ts` | 连续两轮 12 条通过（browser-1.log、browser-2.log） |
| `git diff --check` | 通过 |

截图已查看：单条 success 的几何；四条通知折叠为卡片堆（露边 8px、收窄）；悬停展开（间距 16px）；函数形式语义样式（红底红字）。
