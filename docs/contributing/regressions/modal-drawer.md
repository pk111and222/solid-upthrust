# C11 Modal / Drawer

状态：已验收（2026-09-29；下述支持范围与 Chromium 环境）。

## 契约与修复

对照 [Ant Design Modal](https://ant.design/components/modal-cn/) / [Drawer](https://ant.design/components/drawer-cn/) 公开示例与 antd 6 源码 `modal/`、`drawer/`、`@rc-component/dialog`、`@rc-component/drawer`，不宣称全 API 兼容。Modal 与 Drawer 共用一套 headless：`createDialog`（开关状态机）+ `_dialogLayer`（栈注册、焦点、滚动锁、入场相位）+ `_dialogStack`（单一 Escape 监听、push）。

### 共享层

- **competence/dialog**：
  - 异步关闭闸门 reject 时保持打开（修复前 reject 也关闭）；显式 `false` 否决。
  - 移除 memo 内写信号（受控 `open` 翻转改由双函数 effect 同步）。
  - 新增 `mounted`：首开前不建 DOM；关闭后默认保活隐藏，`destroyOnHidden` 离场后卸载，`forceRender` 预渲染。移除 `destroyDelay` / `requestOpen`。
  - 受控模式 `requestClose` 只通知不改状态。
- **_dialogLayer（新）**：约 100 行 Modal / Drawer 重复逻辑下沉；焦点陷阱（仅最上层生效）+ 关闭后回焦触发元素；滚动锁计数（`body[data-ut-dialog-lock]`），首层保存原 overflow / padding-right 并补滚动条宽度，末层恢复原值（修复前关闭后直接清空）。
- **_dialogStack**：按 id 去重；push 只由上层 **Drawer** 触发（antd 行为，Modal 在上不推）；Escape 只关闭最上层。

### Modal

- **视觉**：容器 20px 24px、8px 圆角；标题 16px / 600；× 32px 距角 12px；footer 右对齐 8px 间距；距顶 100px；窄屏左右 8px；缩放 0.2 → 1 入场。
- **新增 API**：`footer(originNode, { OkBtn, CancelBtn })`、`okType`、`mask`（`{ enabled, blur, closable }`）、`closable` 对象（closeIcon / disabled / onClose / afterClose）、`closeIcon`（null 隐藏）、响应式 `width`（移动优先级联）、`loading`、`forceRender`、`focusable`、`modalRender`、`scrollLock`、`getContainer={false}`、`rootClass` / `rootStyle` / `wrapClass`、`classNames` / `styles`（对象或函数）。
- **静态方法**：默认宽 416，图标 22px + 标题 16px；confirm 带取消，其余只有「知道了」。
- **废弃**：`okVariant`（用 okType）、`maskClosable`（用 mask.closable）。

### Drawer

- **视觉**：默认 378px / large 736px，无圆角、方向阴影；头部 16px 24px + 底边线；× 24px（默认在标题前，`closable.placement='end'` 在 extra 后）；主体 24px；footer 8px 16px。
- **新增 API**：`size`（预设 / 数字 / CSS 长度，替代 width / height）、`resizable` + `maxSize`、`push`（boolean / number / `{ distance }`，默认 180）、`extra`、`loading`、`drawerRender`、`forceRender`、`focusable`、`mask` 对象、`getContainer={false}`（容器内 absolute）、语义化 `classNames` / `styles`。
- **行为**：`onClose(e)` 返回 false 或 reject 保持打开；无遮罩时不设 aria-modal、不锁滚动、不陷焦点。

### 破坏性改动

- Drawer 无默认 footer，移除 okText / cancelText / okButtonProps；`class` / `style` 落在 section；panelClass 废弃；去掉圆角。
- 上层是 Modal 时下层 Drawer 不再被推。
- × 的 aria-label 统一为 `Close`。
- 保活改为隐藏 DOM 而非延迟卸载；dialog 移除 `destroyDelay` / `requestOpen`。
- 静态方法默认宽 416，非 confirm 的确定按钮文案为「知道了」。

### 保留差异

draggable Modal（仅 modalRender 示例层面）、RTL、ConfigProvider 全局 modal/drawer 配置、`Modal.useModal` hook、`afterOpenChange` 之外的 motion 自定义。

## 能力映射

源码：`packages/components/lib/{Modal,Drawer}/`、`lib/_dialogLayer.ts`、`lib/_dialogStack.ts`，逻辑 `packages/competence/src/dialog.ts`（`types/dialog.d.ts` 手工同步）。

| 能力 / 覆盖 | example / docs 示例 | L1 headless | L2 smoke | L3 render | L4 browser |
| --- | --- | --- | --- | --- | --- |
| 开关 / 受控 / 异步闸门 / reject 保持 | modal/basic、async | dialog | exports | modal.intents、async、drawer.close | modal.async |
| 保活 / forceRender / destroyOnHidden | — | dialog：mounted | — | modal.lifecycle | — |
| Modal 几何 / × / footer | modal/basic、footer、footer-render | theme | — | modal.default、footer、closable | modal.basic、mobile |
| mask / width / semantic / modalRender | modal/mask、width、style-class、modal-render | theme | exports | mask、width、semantic | — |
| 静态方法 | modal/static | — | exports | Modal.test | modal.static |
| Drawer 方向 / size / 头部 / extra | drawer/placement、size、extra、closable-placement | theme | — | drawer.default、size、header | drawer.basic、placement |
| resizable / inline / loading | drawer/resizable、render-in-current、loading | — | — | resize、inline、semantic | drawer.resize（仅 docs） |
| push / 栈 Escape / 焦点 / 滚动锁 | drawer/multi-level | — | — | push、stack、modal.container | drawer.push、dialog.stack（仅 example） |

测试路径：headless `shared/Dialog/dialog`（17）+ `Modal/theme`（2）、render `Modal/contracts`（10）+ `Drawer/contracts`（9）、smoke `Modal/exports`（1）、browser `Modal` / `Drawer` / `Dialog`（每项目 9 条，4 条按项目跳过）。

## 踩坑

- smoke 不能在运行时导入 `components/lib` 桶文件（`uno.css` 副作用无法解析），导入目录模块并 `typeof Public.X` 断言签名一致。
- Skeleton 段落行是 div 不是 li，断言路径 `[aria-hidden="true"] .flex-1 > div`。
- 同 zIndex 的 Drawer 后挂载者视为上层，会推开先挂载者；多层示例须显式区分 zIndex。
- 响应式 width 须移动优先级联（xs 为底，命中的更宽断点逐级覆盖）；取「最宽命中」与 antd 媒体查询不一致。
- example 类型检查读 workspace dist，组件改签名后须先 `pnpm run build`。
- JSX 文本里的 `size={600}` 会被解析为表达式，须写成字符串字面量。

## 验证记录

环境：Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0。日志目录：`output/c11-dialog/`。

| 命令 / 证据 | 结果 |
| --- | --- |
| 修复前 | 异步 reject 仍关闭、memo 内写信号、滚动锁关闭后清空原 overflow、无焦点陷阱、Modal 在上推开 Drawer、Drawer 自带 footer / 圆角、Modal 缺 footer 函数 / 响应式 width / loading / 语义化 |
| `pnpm test --maxWorkers=2` | 275 个文件、2755 条通过（vitest.log） |
| `pnpm run typecheck` / `typecheck:docs` / `packages/testing typecheck` / `typecheck:browser` | 均通过（首轮 example 因 dist 旧签名与 JSX 文本花括号失败，重建并修正后通过）（typecheck*.log） |
| `pnpm run build` / `pnpm run build:docs` | 通过（build.log、build-docs.log） |
| `playwright test -c playwright.c11-dialog.config.ts` | 首轮 1 条失败（resize 用例抓点偏移 2px，组件无需改动）；修正后连续两轮 14 通过、4 跳过（playwright-1.log、playwright-2.log） |
| `git diff --check` | 通过 |

截图已查看：Modal 基本（520px / 距顶 100px / × 32px）、confirm（416px、图标 + 标题）、Drawer 多层 push 180px。
