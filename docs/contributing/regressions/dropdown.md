# Dropdown 组件回归（C02）

状态：2026-09-17 本轮验收通过。范围为源码工作区、docs/example 与当前机器 Chrome；不代表发布包或 B04 全范围验收。

## 契约与必要性

Dropdown 提供与触发元素对齐的操作菜单。保留 `Dropdown`、`DropdownProps`、`DropdownMenuProps`、`DropdownMenuItem`，补齐根 barrel 的 `DropdownPlacement`、`DropdownTrigger` 类型导出，无静态子组件和实例 ref。

- 默认 `trigger="hover"`、`placement="bottomLeft"`、关闭、非禁用；三种触发方式与十二种位置。
- `open` 存在时由父组件决定可见状态，`onOpenChange(boolean)` 仅请求更新；`defaultOpen` 仅初始化一次。`disabled` 阻止用户开关和选项操作，不覆盖显式受控 `open`。
- 菜单项 `key` 唯一，`label` 支持文本/JSX/0，`icon` 是可被 UnoCSS 扫描的图标类，`danger` 只改变外观；divider、disabled 项不可激活。
- 有效选择依次调用 `item.onClick()`、`menu.onClick(key)`、请求关闭；不等待 Promise，不增加自动 loading。
- click/contextMenu 打开延迟聚焦首个可用项；空/全禁用菜单聚焦 menu。hover 打开不抢焦点；触发器上下箭头可显式进入菜单，hover/contextMenu 的 Enter/Space 提供键盘入口。
- 上下箭头循环，Enter/Space 激活，Tab/Shift+Tab 正反循环；Escape 请求关闭。仅实际关闭且焦点仍在浮层（或退到 body）时归还原焦点，避免覆盖用户新选择的外部输入框。
- 保留延迟销毁与快速重开复用；关闭的保留 DOM 标记 aria-hidden/inert。快速关闭与卸载取消晚到聚焦。
- root class/style 与 overlayClass/overlayStyle 分开作用，overlayStyle 保留最终覆盖优先级；手动覆盖 top/left/transform/position 需自行负责定位。
- ConfigPortal 继承最近 Provider 的 DOM 主题作用域；Dropdown 不读取组件默认 size/disabled/default props。
- contextMenu 锚定触发元素而非鼠标坐标。不新增 submenu、分组、复选/单选菜单、href、arrow、getContainer、focus trigger、可配置延迟等 API，不宣称与其他库全面兼容。

## 基线与已复现问题

环境：Node 22.22.0、pnpm 11.16.0；锁文件 solid-js/@solidjs/web 2.0.0-rc.0、Vite 8.2.1、vite-plugin-solid 3.0.0-next.27、Vitest 4.1.10、TypeScript 7.0.2。未升级依赖。

- 修改生产源码前：共享 Trigger 2 文件 / 40 条通过；根类型检查通过。
- 新增 Dropdown 用例之外的存量测试：97 文件 / 1170 条通过。此命令是在初步受控 mounted 修复之后运行的存量对照，不冒充完全未修改源码的历史基线。
- 初步 L3 暴露：父层直接 `open=false→true` 时 menu 根本不挂载；一行 mounted 临时补丁能打开但关闭立刻销毁，无法保留退出动画；父层拒绝打开请求会产生幽灵挂载；动态 click→hover 仍使用旧 click 监听。
- `render/Dropdown/lifecycle.test.tsx` 合法输入运行时 7/9 失败：快关后 160ms 聚焦已隐藏菜单、受控关闭不归还焦点、同对象重排后键盘指向旧节点、三种无可用项分支不聚焦、保留关闭 DOM 没有 aria-hidden/inert。修复后这些 9 条通过（最终联测通过）。
- 测试编写阶段的 matcher/fake-timer/错误 selector/参数化数组错误已纠正，不将测试自身错误列作组件缺陷。

### 旧 createDropdown 兼容边界

`upthrust-competence` 仍导出旧的 `createDropdown`，但 UI 使用 `createTrigger`，两者不是同一个契约。保留旧 API 的六种上下 placement、就地 absolute/100% 样式、默认 hover、open/setOpen/toggle/refs/triggerRef/overlayRef/overlayStyle/dropdownSplits；标注弃用但不删除。

独立 L1 复现三个兼容缺陷：ref 前 memo 缓存导致六个 placement 都缺失定位；hover 离开后卸载仍回调；Node 无 document 初始化抛错。仅补 ref 就绪信号、SSR guard、计时器清理与必要 ownedWrite/untrack，不替换成新 Trigger，也不改变旧百分比定位为 Portal。12 条兼容/SSR/样式测试现已通过。旧 API 不获得现代 UI 的键盘、翻转或懒挂载能力。

## 能力与文件映射

源码：`packages/components/lib/Dropdown/{index.tsx,styles.ts}`、共享 `packages/competence/src/trigger.ts`；兼容源码 `packages/competence/src/dropdown.ts`。
公共 UI 导出：`packages/components/lib/index.ts`；旧 headless 导出：`packages/competence/src/index.ts`。

L1 共享生产行为继续归 `headless/shared/Trigger/`，不在 Dropdown 测试重复定义 createTrigger。以下路径相对 `packages/testing`；每条新增测试前有中文备注。

| 能力 ID | L1 | L2 | L3 | L4 |
| --- | --- | --- | --- | --- |
| dropdown.exports.types / mount.provider | 兼容 API 见 legacy.test.ts | smoke/Dropdown/exports.test.ts、mount.test.tsx | 菜单/Provider 契约 | browser/Dropdown/interactions.spec.ts |
| dropdown.menu.items / divider / content / disabled-danger / callbacks | 展示无单独状态机 | mount.test.tsx | render/Dropdown/menu.test.tsx | browser/Dropdown/interactions.spec.ts |
| dropdown.controlled.open / default / external / rejected | shared/Trigger 状态用例 | mount.test.tsx | controlled.test.tsx、keyboard.test.tsx | browser/Dropdown/interactions.spec.ts |
| dropdown.trigger.hover / click / context-menu / dynamic / disabled | shared/Trigger/events.test.ts | 最小挂载 | menu.test.tsx、controlled.test.tsx | browser/Dropdown/interactions.spec.ts |
| dropdown.keyboard.navigation / activation / reorder / empty | DOM 焦点不以 L1 替代 | 真实挂载复用 | keyboard.test.tsx、lifecycle.test.tsx | browser/Dropdown/interactions.spec.ts |
| dropdown.dismiss.outside-escape / lifecycle.cleanup / focus-cancel / closed-aria | shared/Trigger/events.test.ts（含卸载/换节点） | 卸载检查 | lifecycle.test.tsx、controlled.test.tsx | browser/Dropdown/interactions.spec.ts |
| dropdown.placement.portal / style.overrides | shared/Trigger 既有 12 placement/翻转/clamp；headless/Dropdown/style.test.ts 原文扫描 | Provider | menu.test.tsx | browser/Dropdown/position.spec.ts |
| dropdown.legacy.* | headless/Dropdown/legacy.test.ts、ssr.test.ts | UI 不调用旧模块 | 无 UI | 不承诺旧模块现代浮层行为 |
| dropdown.browser.docs | 站点既有路由校验 | 站点既有挂载 | docs islands 用例 | browser/Dropdown 两套页面与开发/生产；docs 双 base |

## 验证记录（执行后更新）

| 命令 | 结果 |
| --- | --- |
| `pnpm --dir packages/testing run test headless/shared/Trigger`（修改前） | 2 文件 / 40 条通过 |
| `pnpm run typecheck`（修改前） | 通过 |
| `pnpm --dir packages/testing run test --exclude 'smoke/Dropdown/**' --exclude 'render/Dropdown/**'`（存量对照） | 97 文件 / 1170 条通过 |
| `pnpm --dir packages/testing run test headless/Dropdown` | 3 文件 / 12 条通过 |
| 最终全量 L1–L3 / 类型 | 111 文件、1255 条通过；根类型及浏览器类型通过 |
| 生产包与 example 构建 / docs check | 通过；example 保留大 chunk 提示 |
| docs 双 base / Dropdown Playwright / 开发 CSS / 截图 | 站点双 base 各 13 条；Dropdown 根路径 43 条、子路径 docs 22 条；开发页面坐标通过，截图证据见定位复查 |
| 最终 `git diff --check` | 通过 |

## 失败收尾

共享坐标转换、受控生命周期、动态动作、禁用右键、换节点监听与异步清理已修复，具体根因和测试自身问题见 [定位与失败复查](./dropdown-position.md)。显式 open=false 优先于 defaultOpen=true，初始化不会创建隐藏菜单。

## 未决边界

完整 B04、Firefox/WebKit、屏幕阅读器认证、发布包全新消费者安装、tree shaking、嵌套多浮层统一 Escape 栈仍不在本次完成声明内。若任何适用验收未运行，TODO 保持未勾选；不据用例存在宣称通过。
