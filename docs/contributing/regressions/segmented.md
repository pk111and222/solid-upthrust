# Segmented 回归记录

日期：2026-09-21。范围：C04 Segmented；沿用当前工作区 `main`，不改锁文件。

状态：已验收（2026-09-21 二次修复与补验完成；原检查发现保留作历史证据）。

## 能力映射

- `packages/competence/src/segmented.ts`：单值互斥选择、受控/非受控、禁用过滤、键盘循环与 Home/End、thumb 测量盒、focus 候选和卸载清理。
- `packages/components/lib/Segmented/`：裸值/对象选项归一、radiogroup/radio ARIA、尺寸、block、status、id、ref、hover thumb 和 Form.Item 注入。
- 修复：UI 改为使用 `form.value` 与 `form.onChange`，使 Form.Item 初始值和字段回写生效；`defaultValue` 初始读取在 headless 边界 `untrack`；受控值晚到时清除过期 focus；补充可访问名称和错误状态。
- 示例与文档：`example/src/pages/Segmented.tsx`、`docs/src/pages/components/data-entry/segmented.tsx`、对应 API JSON 和 5 个独立示例。
- 测试：L1 `headless/Segmented`、L2 `smoke/Segmented`、L3 `render/Segmented`、L4 `browser/Segmented`；每条新增用例前均有中文说明。

## 验证证据

- `pnpm --dir packages/testing run test headless/Segmented smoke/Segmented render/Segmented`：3 个文件、21 条通过。
- `pnpm --dir packages/testing exec playwright test --config=playwright.segmented.config.ts`：docs/example 共 9 条通过、1 条跳过；跳过项是 example 没有独立 Form 示例。覆盖静态 SSR、开发服务器绘制、真实 thumb 几何、block、键盘和 Form 提交。
- `pnpm run typecheck`：通过。
- `pnpm run check:docs`：通过，静态站点预渲染 25 页。
- `pnpm run build`：通过；保留仓库既有 external global-name 与大 chunk 警告。
- `pnpm test`：160 个文件、1500 条用例全部通过。
- `git diff --check`：通过。

浏览器开发服务器日志仍会输出 Form 自身已有的 `STRICT_READ_UNTRACKED` 提示；本次 Segmented 专属提示已清零，L4 专项断言通过。

## 2026-09-21 二次快速检查

范围与命令结果同 [Rate 二次检查](rate.md#2026-09-21-二次快速检查)。本次只审查，不修改生产实现。

### 已复现问题（P2）

- `segmented.options.removed-candidate`：options 为 a/b/c、当前 a，按右键使候选为 b；父层将 options 更新为 a/c，随后 Enter 仍触发 onChange(b)，选中一个已不存在的值。`segmented.ts:166` 直接提交候选，候选清理 effect 只观察 value，不观察 options；共享 Selection 对不存在的键也不拒绝。建议在 Segmented 的选项更新与提交边界验证候选有效性，避免扩大共享行为修改范围。

### 回归与文档缺口

- 原 21 条用例没有覆盖动态选项移除、候选动态禁用、resize 后 thumb 对齐和卸载后微任务/几何注册清理。当前 UI 保留 itemRefs 与 rects，选项删除时没有逐项注销；这是需继续验证的生命周期风险，不作为本轮已复现泄漏。
- `browser/Segmented/interactions.spec.ts:39` 仅断言 thumb 有 left/width 字符串与 opacity、block 含 w-full 类，没有对比 thumb 与目标项 bounding box，也没有验证项目等宽。因此原“真实 thumb 几何、block”证据应缩小为样式存在性检查，不能据此宣告布局验收。
- 文档已有基础选择、受控更新、键盘、禁用、block、Form；缺独立的三种 size、icon 和 error/warning 示例，缺 SegmentedOption 的字段类型说明。example 有尺寸和图标，但图标初始值 daily 不在选项中，尺寸初始值 list 与中文裸选项不匹配，初始展示没有选中态。
- example 缺 Form 演示，上轮浏览器对此明确跳过；属于已知未覆盖，不是验证通过。公开 ref 只列举“等底层接口”，没有完整成员/调用示例。

复核结论：前序 Form 接线、untrack 初始化与 ref、ARIA 命名、status 接线方向合理，但不足以支持当前无未决问题的验收状态。TODO 已重新打开受影响项。原测试仍 49/49（两个组件合计）通过，新增临时探针证明遗漏场景存在真实缺陷；本轮没有重跑浏览器或全量测试。

## 2026-09-21 二次修复与补验完成

上节缺陷和验证缺口已关闭：

- `segmented.options.removed-candidate`：选项更新、候选禁用或整组禁用会清除失效候选；select 提交前检查选项存在性，不改共享 Selection 行为。读取放入 Solid 2 effect 的追踪函数，避免新引入的严格读取提示。
- 清理：移除选项时删除旧测量盒，UI 清除已删除的 DOM 引用；卸载时断开 ResizeObserver、清空引用与测量盒，alive 门控阻止排队微任务及迟到回调再测量。
- 文档补尺寸、图标、error/warning、动态选项/ref 独立示例，补完整 SegmentedOption 与 SegmentedIns API 表。说明已选项被移除不会自动触发 onChange，父层负责业务重置。
- example 修复图标/尺寸/block 初始值不匹配，并新增 Form 提交/重置、error/warning 与 ref 调用演示；取消原 example Form 用例的 skip。

| 能力 | 新增或补强用例 | 实际结果 |
| --- | --- | --- |
| 候选移除、动态禁用与重新启用不恢复旧候选 | `render/Segmented/dynamic.test.tsx` | 通过 |
| 卸载 observer/微任务清理 | 同上 lifecycle.cleanup | 通过 |
| 删除后重加同键不复用旧矩形 | `headless/Segmented/dynamic.test.ts` | 通过 |
| Form 字段重置 | `render/Segmented/contracts.test.tsx`、browser form | 通过 |
| thumb 实际几何与 block 等宽 | `browser/Segmented/interactions.spec.ts` thumb | docs/example 均通过；目标与 thumb 的 x/width 误差 ≤1px，容器 360px/510px resize 后重验，三项宽差 ≤1px |
| 三种尺寸、图标、错误/警告真实绘制 | 同上 variants | docs/example 均通过；项目高度 24/32/40px、图标 mask、非透明状态边框及初始选择 |

最终 Segmented 专项 Playwright：12/12 通过、0 跳过；`/tmp/rate-segmented-fix-segmented-browser.log`。最终日志没有 STRICT_READ_UNTRACKED / NO_OWNER_CLEANUP。两组件定向 57 条、全量 1508 条、根/docs/browser 类型检查、生产及文档构建全部通过；命令和日志见 [Rate 最终记录](rate.md#2026-09-21-二次修复与补验完成)。

本轮待办均关闭；完整 Form/B06、跨浏览器与发布检查仍归原阶段，不在此勾选。未改公共文档框架，因此不重复站点双 base 通用套件。未提交或推送。
