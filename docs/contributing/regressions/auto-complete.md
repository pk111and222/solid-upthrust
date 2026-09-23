# AutoComplete 回归

状态：2026-09-23 三项 L3 回归失败修复并复验，源码工作区范围已验收；完整 B02/B04、跨浏览器与消费者安装仍留后续批次。

## 三项失败的二次修复（2026-09-23）

Mentions 收尾的全量测试发现 `render/AutoComplete/contracts.test.tsx` 三项失败；单独运行同样 3 失败、2 通过。`autocomplete.keyboard.commit` 和 `autocomplete.open.controlled` 的原因是 AutoComplete 输入框缺少 `aria-controls`、`aria-activedescendant`，已有的 listbox/option ID 没有关联到 combobox。现在仅在展开且有高亮候选时设置对应 ID；关闭或禁用时移除引用。

`autocomplete.form.field` 的原因是 AutoComplete 将字段值暂存到失焦才调用 Form.Item 的 `onChange`，输入后 `getFieldValue` 仍返回旧值。现在 headless 机器从 `form.value()` 读取受控字段值，在输入和选项提交时立即调用 Form.Item；`defaultValue` 仅作初始化。真实浏览器表单用例确认连续输入后焦点保持、提交和重置正确。

新增 ARIA 后，长列表真实浏览器用例发现滚动时停留在列表上的鼠标会触发候选行的 `mouseenter`，覆盖键盘高亮。改为在 `mousemove` 时更新鼠标高亮；浏览器用例逐次核对 18 次方向键、末项滚动可见和鼠标实际移动后的高亮。

三项失败均落在 AutoComplete UI 的 ARIA 和 Form 接入代码；Mentions 仅与其共用 Form.Item/Trigger 的既有能力。本轮没有修改共享 Form/Trigger 运行时，Mentions 的 `manual` TriggerAction 只扩展类型联合，不会导致这三项失败。复验 Mentions 后，未发现本次修复造成的关联回归。

二次修复结果：定向 L1/L2/L3 加 Mentions L3 共 39 条通过；`pnpm test --maxWorkers=2` 177 文件、1561 条通过；AutoComplete 专项浏览器 docs/example 14 条通过，鼠标高亮补断言单独两项目 2 条通过；Mentions 专项浏览器 12 条通过。`pnpm run typecheck`、浏览器类型检查、`pnpm run build`、`pnpm run check:docs`、`git diff --check` 均通过。构建仍有既有的大 chunk 提示，开发控制台仍有 `STRICT_READ_UNTRACKED` 警告；本轮没有修改路由、SSR 或 base 框架，沿用前次双 base 站点验收证据。

## 契约与修复

AutoComplete 是自由文本输入。选中建议回填 `label ?? value`，`onSelect` 返回原始 value/option；输入触发 onChange + onSearch，选中只触发 onChange + onSelect。默认按 value/label 忽略大小写子串匹配；false 关闭过滤。value/open 受控，defaultValue/defaultOpen 只初始化。value 唯一，label 为字符串，未支持 JSX、分组、虚拟列表、allowClear 或 loading；没有公开子组件。

基线 15 条 L1 通过，新增复现套件 9 条失败后修复：

- 候选原先仅在输入时手工刷新；改为跟随 options/value/filterOption 派生，远程结果和父层更新立即生效，受控拒绝输入不改变候选。
- 默认打开没有初始高亮，旧候选被移除后仍可能残留 active；高亮只引用当前可用候选，禁用状态阻止编辑、组合输入及导航。
- Form.Item 注入回调未接通；现在输入和选值都同步字段，显式回调仍优先。
- onFocus/onBlur 原先各调用两次且一次传 undefined；改为只传一次真实事件。
- Enter 选值未关闭浮层、关闭后继续输入不展开；现已接通。选项 mousedown 保持输入焦点，避免 click 前失焦关闭。
- IME 期间方向键/Enter 可误选，尾随 input 可重复提交；组合期间屏蔽选值，结束提交一次并去重尾随 input。
- 补齐 combobox/listbox/option 的 ID、展开、高亮与隐藏语义；新增 aria-label/aria-labelledby。关闭层 inert，键盘高亮超出列表视口时滚入可视范围。

仅改 AutoComplete 自身，未修改共享 Trigger/Form；保留接手时 Select、selection 与公开 barrel 的未提交成果。声明文件由构建生成，没有手改。未升级依赖。

## 能力映射

源码：`packages/competence/src/autoComplete.ts`、`packages/components/lib/AutoComplete/index.tsx`；沿用原 styles.ts。公开 AutoComplete/AutoCompleteProps/AutoCompleteOption 导出已存在。

文档：`docs/src/pages/components/data-entry/auto-complete.tsx` 与两个 API JSON；六个 `docs/src/examples/auto-complete/*.tsx` 独立示例，正文使用同文件 `?raw`。example 入口为 `example/src/pages/AutoComplete.tsx`，演示位于同级 `auto-complete-demos/`，通过已构建公共包导入。

下表测试路径均相对于 `packages/testing`；L2 统一由 `smoke/AutoComplete/mount.test.tsx` 验证公开类型、挂载、ref 与释放，不重复行为矩阵。

| 能力 ID / 属性 | example/docs 示例 | L1 | L3 | L4 |
| --- | --- | --- | --- | --- |
| `autocomplete.dynamic.suggestions`、`controlled.filter`：value/defaultValue/options/filterOption、动态过滤及选项禁用 | basic/filter/remote | headless/AutoComplete/autoComplete.test.ts、dynamic.test.ts | render/AutoComplete/presentation.test.tsx remote.render | browser/AutoComplete/interaction.spec.ts pointer/remote |
| `autocomplete.dynamic.active`、`disabled.commands`：open/defaultOpen/onOpenChange、disabled、动态移除/禁用 | keyboard/variants | dynamic.test.ts 与原 open 用例 | contracts.test.tsx open.controlled、keyboard.commit | keyboard/scroll |
| `autocomplete.ime.events`：组合输入、onChange/onSearch/onSelect、标签回填 | basic/remote | autoComplete.test.ts IME/selection | contracts.test.tsx ime.events、presentation.test.tsx pointer.selection | pointer/keyboard 验证集成；IME 确定性事件序列在 L3 |
| `autocomplete.events.focus`：onFocus/onBlur/ref、焦点与门户释放 | keyboard | 原通知接口用于 UI，真实事件归 L3 | contracts.test.tsx events.focus、presentation.test.tsx remote.render；L2 ref | pointer/scroll |
| `autocomplete.form.field`、`context.precedence`：Form 注入、显式优先级与 ConfigProvider 默认值 | context | Form 共享逻辑不在本次扩展 | contracts.test.tsx form.field、presentation.test.tsx context.precedence | form |
| `autocomplete.props.presentation`：size/status/placeholder/id/name/class/style、aria-label/aria-labelledby | variants/context/basic | 不适用：UI 展示属性 | presentation.test.tsx props.presentation | variants/dev（真实尺寸、边框与定位） |
| `autocomplete.keyboard.commit`：Enter/Escape/方向键、ARIA、禁用跳过、长列表滚动 | keyboard/basic | autoComplete.test.ts navigation、dynamic.test.ts | contracts.test.tsx keyboard.commit/open.controlled | pointer/keyboard/scroll |
| 文档静态正文、API 与同文件示例源码 | 全部 | 沿用 docs 工具测试 | 无新框架逻辑 | ssr 原始 HTTP 响应 |

所有新增/接手用例前有中文备注；L1 owner 与 L2/L3 挂载在清理钩子/finally 释放。

## 实际验证

Node 22.22.0、pnpm 11.16.0、solid-js/@solidjs/web 2.0.0-rc.0（锁文件未变）。

| 命令 | 结果 |
| --- | --- |
| `pnpm --dir packages/testing run test headless/AutoComplete`（修复前） | 1 文件 / 15 条通过 |
| `pnpm --dir packages/testing run test headless/AutoComplete render/AutoComplete`（新增复现、修复前） | 9 失败 / 15 通过，见 red.log |
| `pnpm --dir packages/testing run test headless/AutoComplete render/AutoComplete smoke/AutoComplete` | 5 文件 / 29 条通过 |
| `pnpm test --maxWorkers=2` | 172 文件 / 1539 条通过 |
| `pnpm run typecheck` | 通过 |
| `pnpm --dir packages/testing run typecheck:browser` | 通过 |
| `pnpm run build` | preset/competence/components/example 全部通过；保留 example 大 chunk 提示 |
| `pnpm run check:docs` | 类型及静态构建通过，27 页，根路径 base |
| `pnpm --dir packages/testing exec playwright test -c playwright.auto-complete.config.ts --workers=2` | 最终 14 条通过：docs 8、example 6，无 skip |
| `git diff --check` | 通过 |

首轮浏览器 13 条通过、1 条定位断言失败：用例只接受向下定位。CLI 实测输入 y=586.5/h=32、列表 y=481.5/h=101，向上间距恰为 4px；这是 Trigger 正常避碰翻转。断言改为允许向上/向下、仍严格验证 4px 间距，复跑 14 条通过。截图已实际查看，输入边框、候选与禁用外观正常。

本地证据保留在 `output/playwright/auto-complete/`：`development.png`、CLI 快照/控制台、`logs/` 中 baseline/red/target/full/typecheck-final/build/docs-build/browser-final/browser-types-final/diff-check 日志。测试失败 trace 位于 runner 的 test-results（后续运行可覆盖）。CLI 浏览器及本次 5660 临时服务器已关闭，未停止其他服务。

## 边界与共享待查

- 开发控制台仍有 `STRICT_READ_UNTRACKED`（AutoComplete 初始化与 effect callback 标签），与前序组件记录同类；Trigger 初始化存在 getter 裸读路径，完整 B01/B04 仍需定位并统一处理。本轮动态 options/value/open 与禁用用例通过，不据此宣称警告已消除。另有 favicon 404，不影响物料交互。
- 未改变路由/SSR/base/公共框架，本轮只验证新增页面的根路径静态产物与开发页，未重跑双 base 通用站点套件。
- 真实浏览器为 Chromium；原生系统 IME、多浏览器、全量共享协议、消费者安装与发布不在本次验收范围。未部署、提交或推送。
