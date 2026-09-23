# Mentions 回归记录

状态：2026-09-23 专项与全量 L1–L3 复验通过，源码工作区范围已验收。

## 范围与能力映射

| 能力 ID | 源码 / 演示 / 文档 | 验证 |
| --- | --- | --- |
| `mentions.text.controlled`、`mentions.form.field` | `competence/src/mentions.ts`、`components/lib/Mentions/index.tsx`；example 的受控输入；docs `basic`、`form` | L1 受控值与动态更新；L3 受控拒绝、Form.Item 输入/选择/重置；L4 表单提交与重置 |
| `mentions.trigger.caret`、`mentions.filter.options` | 同上；docs `prefix`、`remote` | L1 长词、空前缀、空白/自定义分隔符、动态 options 与自定义过滤；L3 前缀、禁用选项；L4 异步候选与词中插入 |
| `mentions.keyboard.commit`、`mentions.open.dismiss` | UI、Trigger 的 `manual` 动作；docs/example 基础示例 | L1 高亮/提交；L3 ARIA、Escape、受控开态、禁用；L4 docs/example 的键盘、鼠标、外部点击、浮层尺寸与开发绘制 |
| `mentions.caret.after-select` | headless 返回本次计算的目标光标位置，UI 在 DOM 更新后恢复；docs/example 的前缀与词中插入示例 | L1 同步返回目标位置；L3 键盘提交后光标；L4 docs/example 键盘、鼠标词中插入与自定义前缀的 `selectionStart` |
| `mentions.ime.caret`、`mentions.events.focus` | UI 与 headless | L1/L3 组合输入只提交一次、真实焦点事件只回调一次；L4 键盘焦点保持 |

修复：候选和受控文本随外部更新；输入法提交使用最终光标；Form.Item 写回；Escape/外部点击与候选提交后正常关闭；程序化恢复光标不会重新开层；已有分隔符前不再插入双空格；受控父层拒绝编辑时恢复 DOM 文本。补充 textarea/listbox ARIA、宽度与高亮滚动。公开 `MentionOption`、`MentionsProps`、headless 导出均已核对；没有公开子组件。

二次修复（2026-09-23）：真实浏览器复现选中后文本为 `Hi @afc163 `、`selectionStart=4`（停在 `@` 后）。原因是 Solid 2 同一事件批次中 `_setCaret(nextCaret)` 后立即读取 `caret()` 仍得到旧位置。`selectOption`/`commitActive` 现在直接返回计算出的目标位置，UI 用返回值恢复 DOM 光标；鼠标、Enter 和 `#` 自定义前缀均补光标位置断言。

## 验证结果

- `pnpm --dir packages/testing run test headless/Mentions smoke/Mentions render/Mentions`：4 文件、38 条通过（L1 27、L2 1、L3 10）。新增测试均有中文用例说明，owner/DOM 清理已纳入用例。
- `pnpm --dir packages/testing exec playwright test --config playwright.mentions.config.ts`：docs/example 12 条通过；生产站点、开发模式、静态 SSR 均覆盖，包含三种提交路径的实际光标位置。
- `pnpm run typecheck`、`pnpm --dir packages/testing run typecheck:browser`、`pnpm run build`、`pnpm run check:docs`、`git diff --check`：通过。构建保留既有 example 大 chunk 提示。
- `pnpm run test:docs`：28 条通过；`pnpm run test:docs:browser`：根路径与 `/solid-upthrust/` 各 13 条通过。
- `pnpm test`（二次修复后）：177 文件中 176 通过；1561 条中 1558 通过、3 失败。失败全部位于 `render/AutoComplete/contracts.test.tsx` 的 keyboard、form、controlled open 用例；单独执行该文件仍为 3 失败、2 通过。AutoComplete 在接手时已有未提交改动，本轮仅在共享 Trigger 的 `TriggerAction` 联合类型中加入 `manual`，未修改其运行时分支或 AutoComplete 源码。按 TODO 状态规则重新打开 AutoComplete，Mentions 暂不勾选最终验收。
- AutoComplete 三项修复后再次执行 `pnpm test --maxWorkers=2`：177 文件、1561 条全部通过；Mentions 专项浏览器 docs/example 12 条再次通过。三项失败根因均在 AutoComplete 自身的 ARIA 和 Form.Item 接入，不涉及 Mentions 的光标逻辑或共享 Trigger 运行时。详见 [AutoComplete 二次修复](auto-complete.md)。

## 边界

本轮沿用 C03 Input 与 Trigger 的目标使用路径证据；共享模块完整回归、非 Chromium 浏览器、打包消费者安装和正式发布属于后续批次。当前建议层锚定在 textarea 下沿，不提供光标像素定位或自定义候选渲染。
