# Upload 回归记录

日期：2026-09-23。环境：Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0。范围：Upload、Dragger 文件队列与异步请求、Form.Item、示例/文档和 Chromium 交互；不包含真实服务端、完整 Form/Trigger 回归、跨浏览器或发布链路。

## 能力映射

| 能力 ID 与契约 | 源码 / 示例 / 文档 | 自动化证据 |
| --- | --- | --- |
| `upload.queue`：选择、beforeUpload 同步/异步拦截与 Blob 替换、maxCount、手动上传 | `packages/competence/src/upload.ts`；`docs/src/examples/upload/basic.tsx`、`constraints.tsx`、`manual.tsx` | `headless/Upload/upload.test.ts`；`browser/Upload/interactions.spec.ts` |
| `upload.transport`：进度、成功/失败、abort、迟到回调忽略、retry | `packages/competence/src/upload.ts`、`packages/components/lib/Upload/index.tsx`；`constraints.tsx` | `headless/Upload/upload.test.ts`；L4 文件状态与 itemRender 自定义 retry |
| `upload.list`：列表样式、动作可见性、自定义渲染、预览/下载与移除 | `packages/components/lib/Upload/index.tsx`、`Upload/Dragger.tsx` | `render/Upload/Upload.test.tsx`；`smoke/Upload/exports.test.tsx` |
| `upload.dragger`：键盘激活、拖拽高亮、accept 拒绝通知 | `Upload/Dragger.tsx`；`docs/src/examples/upload/dragger.tsx` | `browser/Upload/interactions.spec.ts` 拖放接受/拒绝与高亮 |
| `upload.form`：Upload/Dragger 将文件列表写入字段、提交与 resetFields | `Upload/index.tsx`、`Upload/Dragger.tsx`；`docs/src/examples/upload/form.tsx` | `render/Upload/form.test.tsx`；L4 Form 提交与重置 |
| `upload.exports-docs`：Upload、Dragger 与 UploadDragger 导出、SSR/API | `packages/components/lib/index.ts`；`docs/src/pages/components/data-entry/upload.tsx`、`upload-api.json` | `smoke/Upload/exports.test.tsx`；生产构建、SSR 页面和 docs 双 base 套件 |

L1 覆盖队列状态机与传输注入；L2 验证公开组件挂载；L3 验证列表 DOM 和 Form 字段合同；L4 验证文件选择、拖拽和生产文档交互。测试使用注入 request，不发送真实网络请求。

## 修复与边界

- Upload 与 Dragger 虽通过 `useFormItem` 获取禁用/样式状态，却未将字段值传给队列，也未通过 `form.onChange` 写回。现在二者以 Form.Item 值作为受控来源，并在队列变更时写回完整 `UploadFile[]`，同时保留显式 `onChange` 通知。验证了提交、字段初值与 `resetFields` 恢复。
- 根因修复位于 `packages/components/lib/Upload/index.tsx` 与 `Dragger.tsx`。单独传 `value` 仍是受控模式；无 Form.Item 时行为保持原有默认值/内部状态合同。
- accept 的原生文件选择器预过滤和 Dragger 拖放验证均被覆盖。拖放不匹配时回调报告拒绝项，符合项仍进入队列；beforeUpload 返回 false 的文件不进入列表。列表重试通过 `itemRender` 暴露的 actions 提供，不声称默认列表内置了重试按钮。
- 浏览器套件的 example 项目只运行通用 Upload 基础文件选择；其余四个 Upload 专属示例及静态 SSR 属于 docs 页面能力，example 项目按范围跳过，共 5 项跳过，不计为通过。

## 验证

- 专项 L1–L3：`pnpm --dir packages/testing exec vitest run smoke/Upload render/Upload headless/Upload`，4 个文件、30 条通过。
- 全量 L1–L3：`pnpm --dir packages/testing exec vitest run --maxWorkers=2`，192 个文件、1615 条通过。
- 类型：`pnpm run typecheck`、`pnpm --dir packages/testing run typecheck:browser` 通过；docs typecheck 包含在 `pnpm run check:docs` 中并通过。
- 构建：`pnpm run build`、`pnpm run check:docs` 通过。已有 external global-name / chunk 提示未作为本物料缺陷处理。
- Upload 浏览器：`pnpm --dir packages/testing exec playwright test -c playwright.upload.config.ts`，7 条通过、5 条按 example 能力范围跳过。
- 文档部署：`pnpm run test:docs:browser` 在 `/` 与 `/solid-upthrust/` 各 13 条通过。
- `git diff --check` 通过。

保留原有 TimePicker、DatePicker、ColorPicker 工作区改动与 `.DS_Store` 变更；未声称站点已部署。
