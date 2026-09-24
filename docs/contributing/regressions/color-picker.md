# ColorPicker 回归记录

日期：2026-09-23。环境：Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0。范围：ColorPicker 颜色解析/格式转换、面板交互、Form.Item 与导出文档；不包含 Popover 全量回归或发布链路。

## 能力映射

| 能力 ID 与契约 | 源码 / 示例 / 文档 | 自动化证据 |
| --- | --- | --- |
| `color-picker.convert`：HEX/RGB/HSB 转换、透明度及格式化 | `packages/competence/src/colorPicker.ts`；`docs/src/examples/color-picker/formats.tsx` | `headless/ColorPicker/colorPicker.test.ts` |
| `color-picker.interaction`：面板展开、颜色/透明度选择、预设、禁用与 inline 模式 | `packages/components/lib/ColorPicker/`；`example/src/pages/ColorPicker.tsx`；`docs/src/examples/color-picker/basic.tsx`、`states.tsx`、`inline.tsx` | `render/ColorPicker/ColorPicker.test.tsx`；`browser/ColorPicker/interactions.spec.ts` |
| `color-picker.form`：Form.Item 提交与 resetFields 回写 | `ColorPicker` 组件与 `docs/src/examples/color-picker/form.tsx` | `render/ColorPicker/form.test.tsx`；浏览器 Form 场景 |
| `color-picker.exports-docs`：公开导出、SSR 文档与独立 API | `packages/components/lib/index.ts`；`docs/src/pages/components/data-entry/color-picker.tsx` 与 API JSON | `smoke/ColorPicker/exports.test.tsx`；构建与 docs 双 base 浏览器套件 |

颜色转换属于纯逻辑，不单独建立 competence 模块；Popover 是面板的基础依赖，本轮仅通过 ColorPicker 路径验证其必要使用方式，不扩展为 Popover 回归。L2 验证公开组件可挂载，L3 验证 DOM 与表单合同，L4 验证真实浏览器交互和绘制。

## 结果与边界

- 本轮未发现需要修改 ColorPicker 生产逻辑的缺陷。新增公开导出/挂载、Form.Item 提交与重置、格式转换及面板交互覆盖，并补齐 example、SSR 文档、API 表与 CSR 示例。
- 浏览器测试中有 4 条因 example 页面不提供相应独立文档入口或静态 SSR 场景而按项目范围跳过；docs 场景与可用的 example 场景均执行。未将跳过项计为通过。
- 不包含完整 Popover 行为矩阵、消费者安装验证、跨浏览器覆盖或发布验收。

## 验证

- ColorPicker L1–L3：4 个测试文件、31 条通过。
- 全量 L1–L3：190 个测试文件、1612 条通过。
- 类型：`pnpm run typecheck`、`pnpm run typecheck:docs`、`pnpm --dir packages/testing run typecheck:browser` 通过。
- 构建：`pnpm run build`、`pnpm run check:docs` 通过。已有 external global-name / chunk 提示未作为本物料缺陷处理。
- ColorPicker 浏览器：`pnpm --dir packages/testing exec playwright test -c playwright.color-picker.config.ts`，10 条通过、4 条因 example 项目范围跳过。
- 文档部署：`pnpm run test:docs:browser` 在 `/` 与 `/solid-upthrust/` 各 13 条通过。
- `git diff --check` 通过。

保留原有 TimePicker、DatePicker 未提交修改及已有 `.DS_Store` 变更；未声称站点已部署。
