# C11 Message

状态：已验收（2026-09-29；下述支持范围与 Chromium 环境）。

## 契约与修复

对照 [Ant Design Message](https://ant.design/components/message-cn/) 公开示例与 antd 6 源码 `message/`（index、useMessage、PurePanel、style），不宣称全 API 兼容。队列仍是页面级单例 `createMessageManager`，倒计时、动画和挂载由渲染层负责。

- **headless 修复**：
  - `duration` 改为**秒**（默认 3；0 或 null 表示不自动关闭）。
  - 新增 `top`（8）与 `pauseOnHover`（true）默认值；`maxCount` 默认不限。
  - 同 key 再次 open 时**整体替换**配置（antd 语义），`update` 只合并已给出的字段。
  - `close(key)` 触发 onClose 且只触发一次；`close()` 全部关闭时不触发。
  - `configure` 忽略 undefined 字段。
  - maxCount 改用同步镜像，同一批次内连续打开也能正确裁剪。
- **视觉**：
  - notice 内边距 9px × 12px、8px 圆角、阴影、宽度随内容（w-max，最大 100vw − 48px），列表 z-index 2010，距顶 8px。
  - 图标改为 antd 实心图标，16px；loading 使用 LoadingOutlined 加旋转。颜色：info 和 loading 用主色，success #52c41a，warning #faad14，error 用 error 色。
  - 图标与文字间距 8px；两条 notice 之间 16px。
  - 入场 / 离场为 translateY(∓64px) 加透明度过渡；关闭后行高通过 grid-rows 1fr→0fr 收起，下方 notice 平滑补位。
- **新增 API**：
  - 可调用的 thenable 返回值：调用即关闭，关闭后 `.then` 以 true resolve。
  - 调用签名 `typeOpen(content, duration | onClose, onClose)`，对象参数中显式给出的字段优先。
  - `message.config({ top, duration, maxCount, pauseOnHover, getContainer, classNames, styles })`、`destroy(key?)`、`useMessage` → `[api, holder]`。
  - 单条消息可设 `icon` / `onClick` / `pauseOnHover` / `class` / `style`，以及语义化 `classNames` / `styles`（list / listContent / root / wrapper / icon / title，对象或函数）。
- **无 Provider 兜底**：首次命令式调用时在 body 上挂 `data-message-holder`，与 antd 静态方法一致；该兜底 Provider 把列表 portal 进它自己的 host，host 被移除后下次调用会重建。

### 破坏性改动

- `duration` 单位由毫秒改为秒；`open` 不再默认 `type: 'info'`，不传 type 时不显示图标；loading 不再特殊处理为常驻（默认 3 秒，与 antd 一致）。
- `maxCount` 默认值由 10 改为不限。
- 返回值 `MessageResult` 改为可调用的 thenable（保留 key / promise / update / close）。
- 图标由 mdi 换成 antd 图标；样式导出重命名；`twMerge` 换成 `mergeClass`。

### 保留差异

- `placement`（top / center / bottom）是本库扩展。
- 队列为页面单例，`useMessage` 的 options 会全局生效。
- 未实现 `rtl`、`prefixCls`、`stack`、PurePanel。

## 能力映射

源码：`packages/components/lib/Message/`，逻辑 `packages/competence/src/message.ts`，图标 `common/antIcons.tsx`（LoadingOutlined）。

| 能力 / 覆盖 | example / docs 示例 | L1 headless | L2 smoke | L3 render | L4 browser |
| --- | --- | --- | --- | --- | --- |
| 类型 / 图标 / 几何 / 堆叠 | types、stack / other、info | message、theme | exports | default、types | geometry |
| duration 秒 / 悬停暂停 | duration / duration | defaults | — | duration、pause | duration、pause（仅 example） |
| loading / thenable / 可调用返回值 | loading / loading、thenable | close onClose | — | thenable | loading |
| 同 key 更新 | loading / update | same-key replace、update merge | — | update | update |
| destroy / config / maxCount / holder / useMessage | stack、placement / hooks | maxCount、configure | exports | destroy、config、holder、hooks | — |
| 语义化 classNames / styles | style / style-class | — | — | semantic | semantic |

测试路径：headless `Message/message`（22）+ `theme`（1）、render `Message/contracts`（11）、smoke `Message/exports`（1）、browser `Message/message`（6 条 × 2 项目，1 条跳过）。

## 踩坑

- 兜底 holder 如果只把 render 根挂在 host 上、列表却 portal 到 body，清空 body 时会触发 REACTIVITY_HALTED（removeChild … not a child）。列表必须 portal 进 host 本身，host 被移除后再重建。
- 用 grid-rows 收起行高时，padding 不能写在 grid 子元素上，否则收不到 0；要写在内层 pad 元素上，由 `min-h-0` 加 overflow-hidden 的中间层负责裁剪。
- `toBeVisible` 不检查 opacity：入场动画中的 notice 也会被判为可见，量取样式或截图前要等 opacity 变成 1、transform 变成 none。

## 验证记录

环境：Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0。日志目录：`output/c11-message/`。

| 命令 / 证据 | 结果 |
| --- | --- |
| 修复前 | duration 为毫秒、open 默认 info、同 key 只做合并、close() 也触发 onClose、maxCount 默认 10 且同批次裁剪丢写、mdi 图标、无 thenable / config / useMessage / 语义化、无 Provider 时静默失效 |
| `pnpm test --maxWorkers=2` | 284 个文件、2798 条通过（vitest.log） |
| `pnpm run typecheck` / `typecheck:docs` / `packages/testing typecheck` / `typecheck:browser` | 均通过（typecheck*.log） |
| `pnpm run build` / `pnpm run build:docs` | 通过（build.log、build-docs.log） |
| `playwright test -c playwright.c11-message.config.ts` | 连续两轮 11 通过、1 跳过（playwright-1.log、playwright-2.log）；首轮语义截图抓在入场前，已改为等待动画结束 |
| `git diff --check` | 通过 |

截图已查看：success / error 两条堆叠（间距 16px、图标色正确），函数形式语义样式（红底红字）。
