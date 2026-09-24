# DatePicker 回归记录

日期：2026-09-23。环境：Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0。范围：DatePicker 与 DatePicker.RangePicker（含具名 RangePicker），不包含整个 Form、Trigger 或发布链路。

## 能力映射

| 能力 ID 与契约 | 源码 / 示例 / 文档 | 自动化证据 |
| --- | --- | --- |
| `date-picker.calendar`：有效日期、闰年、六周月历与星期起始日 | `packages/competence/src/datePicker.ts`；`example/src/pages/DatePicker.tsx`；`docs/src/examples/date-picker/basic.tsx` | `headless/DatePicker/datePicker.test.ts`；`browser/DatePicker/interactions.spec.ts` 基础选择 |
| `date-picker.value`：单值受控/非受控、文本提交、边界、禁用与清空 | `packages/competence/src/datePickerAdvanced.ts`、`packages/components/lib/DatePicker/index.tsx`；`docs/src/examples/date-picker/constraints.tsx` | `headless/DatePicker/datePicker.test.ts`、`advanced.test.ts`；`render/DatePicker/contracts.test.tsx`；浏览器边界与键盘用例 |
| `date-picker.period-time`：周/月/季度/年起始日、日期时间与点击时求值的快捷项 | `datePickerAdvanced.ts`、`DatePicker/index.tsx`；`docs/src/examples/date-picker/modes.tsx`、`time-presets.tsx` | `headless/DatePicker/advanced.test.ts`；`render/DatePicker/DatePicker.test.tsx`；浏览器季度、时间、快捷项用例 |
| `date-picker.range`：双面板区间、编辑端点、清空、时间范围 | `packages/competence/src/datePicker.ts`、`datePickerAdvanced.ts`、`packages/components/lib/DatePicker/RangePicker.tsx`；`docs/src/examples/date-picker/range.tsx` | `headless/DatePicker/range.test.ts`、`advanced.test.ts`；`render/DatePicker/contracts.test.tsx`；浏览器范围用例 |
| `date-picker.form-events`：Form.Item 字段提交/重置、显式回调优先、每次焦点事件只通知一次 | `DatePicker/index.tsx`、`DatePicker/RangePicker.tsx`；`example/src/pages/DatePicker.tsx`、`docs/src/examples/date-picker/form.tsx` | `render/DatePicker/contracts.test.tsx`；`browser/DatePicker/interactions.spec.ts` docs/example Form 用例 |
| `date-picker.exports-docs`：静态/具名范围导出，SSR 文档与独立 API | `packages/components/lib/index.ts`；`docs/src/pages/components/data-entry/date-picker.tsx` 与两份 API JSON | `smoke/DatePicker/exports.test.tsx`、生产构建、浏览器静态 HTML 与 docs 双 base 套件 |

`date-picker.form-events` 的 L1 不适用（Form 上下文与原生事件属于 UI 集成）；L2 只验证两个公开控件可挂载，L3 验证字段提交与事件，L4 验证真实浏览器表单。其他能力的 L1–L4 按上表取相关契约，不将 happy-dom 断言当成绘制或浏览器验收。

## 修复与边界

- 单值和范围选择器原先读取 Form.Item 字段值，却没有把变更写入字段 store；现显式 `onChange` 优先，未传时回写 Form.Item。新增提交、resetFields、受控值与显式回调优先的回归用例。
- 两者原先在 headless 与原生输入层重复通知 focus/blur，且 headless 层传伪造事件；现在只转发一次真实原生 FocusEvent。
- value/defaultValue 使用日期字符串，不是 Date 对象；范围两端共用约束，不支持各端独立禁用规则或半区间。日期时间格式按已实现的秒级字符串输出；完整 Form、Trigger、多弹层、消费者安装、跨浏览器与发布验收仍归后续事项。

## 验证

- 基线：`pnpm --dir packages/testing exec vitest run headless/DatePicker render/DatePicker`，4 文件、80 条通过；新增测试先复现了 Form 未回写与重复 focus/blur 两项失败。
- 专项：`pnpm --dir packages/testing exec vitest run headless/DatePicker smoke/DatePicker render/DatePicker`，6 文件、84 条通过。
- 全量：`pnpm --dir packages/testing exec vitest run --maxWorkers=2`，188 文件、1610 条通过。
- 类型：`pnpm run typecheck`、`pnpm run typecheck:docs`、`pnpm --dir packages/testing run typecheck:browser` 通过；`git diff --check` 通过。
- 构建：`pnpm run build`、`pnpm run check:docs` 通过；现有大 chunk / external global-name 提示未作为本物料缺陷改动。
- 浏览器：`pnpm --dir packages/testing exec playwright test -c playwright.date-picker.config.ts`，docs/example 共 12 条通过、6 条因 example 不提供对应独立文档入口或静态 SSR 而跳过。Chromium 覆盖选择、范围、周期、时间、快捷项、禁用、键盘与 Form。
- 文档部署：`pnpm run test:docs:browser` 在 `/` 与 `/solid-upthrust/` 各 13 条通过，含新路由与资源路径。

未触及先前 TimePicker 未提交改动及已有 `.DS_Store` 变更；不声称已部署站点。
