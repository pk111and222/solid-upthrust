# Transfer 回归

状态：已验收（2026-09-23）。范围为 Transfer 物料及其 Form.Item 使用路径；C05 至此完成。

## 契约与修复

- `Transfer` 与 `TransferProps`、`TransferItem`、`TransferKey`、`TransferDirection` 从公开入口导出。`targetKeys` 管理右侧成员，`selectedKeys` 管理临时勾选；受控值由调用方在回调中写回，默认值仅初始化一次。
- 搜索与全选只处理当前侧可见且可选的行，并保留另一侧和隐藏行的选择。空搜索结果、重复全选与重复清空不再发出无变化的 `onSelectChange`。新增 L1 用例先复现了重复回调，再修复 `selectAll`。
- 默认键初始化使用 `untrack`，避免开发模式下读取响应式默认值产生 Transfer 的 `STRICT_READ_UNTRACKED` 警告。
- 面板保留 220px 最小可用宽度；窄屏通过组件的水平滚动访问右侧。真实浏览器截图检查中发现面板曾被压到约 147px，调整 `shrink-0` 后重新检查绘制与交互。
- `Form.Item` 路径验证了初值、写回、外部赋值、重置、禁用与校验状态；完整 Form 与共享 Selection 能力仍按 B02/B06 分别验收。

## 文件与覆盖映射

| 能力 ID | 源码与公开类型 | example | docs | L1 | L2 | L3 | L4 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `transfer.keys.selection` | `competence/src/transfer.ts`、`components/lib/Transfer/index.tsx` | `Transfer.tsx` 受控分配 | `basic.tsx`、API | `headless/Transfer/transfer.test.ts`、`selection.test.ts` | `smoke/Transfer/exports.test.tsx` | `render/Transfer/contracts.test.tsx`：分区、双向、受控 | `browser/Transfer/interactions.spec.ts`：双向与窄屏键盘 |
| `transfer.search.bulk` | 同上 | 搜索与禁用 | `search.tsx`、API | `headless/Transfer/transfer.test.ts`、`selection.test.ts` | 公开入口同上 | `render/Transfer/contracts.test.tsx`：搜索、全选 | `browser/Transfer/interactions.spec.ts`：搜索与全选 |
| `transfer.one-way.custom` | `Transfer/index.tsx`、`styles.ts` | 单向、自定义内容、底部 | `one-way.tsx`、API | `headless/Transfer/transfer.test.ts` | 公开入口同上 | `render/Transfer/contracts.test.tsx`：单向、`render`、`footer`、`operations` | `browser/Transfer/interactions.spec.ts`：逐行移除 |
| `transfer.dynamic.variants` | 同上 | 动态数据、空态与状态 | `dynamic.tsx`、`variants.tsx`、API | `headless/Transfer/transfer.test.ts` | 公开入口同上 | `render/Transfer/contracts.test.tsx`：外观、禁用、空态 | `browser/Transfer/interactions.spec.ts`：数据变化、真实尺寸与禁用绘制 |
| `transfer.form.field` | `Transfer/index.tsx`、`Form/Item.tsx` 使用路径 | Form 校验与提交 | `form.tsx`、API | 不适用：字段注入属于组件集成 | 公开入口同上 | `render/Transfer/form.test.tsx`：初值、写回、重置、注入 | `browser/Transfer/interactions.spec.ts`：提交与重置 |
| `transfer.docs.route` | `docs/src/pages/components/data-entry/transfer.tsx` | 不适用：文档路由非 example 功能 | 六个独立 CSR 示例、两个 API 表、`?raw` 源码 | 不适用：路由无 headless 状态 | 不适用：docs 单独构建 | `test:docs` 路由契约 | Transfer L4 静态页与开发页；`test:docs:browser` 双 base |

源码表中 `competence/` 和 `components/` 分别位于 `packages/`；各测试路径位于 `packages/testing/`，docs 示例位于 `docs/src/examples/transfer/`。Transfer 没有公开子组件。原生复选框和按钮提供键盘交互；列表没有虚拟滚动、分页、拖拽或异步请求协议。

## 验证记录

| 命令 / 检查 | 结果 |
| --- | --- |
| 基线 `headless/Transfer` | 原有 8 条通过；新增失败用例先复现重复全选回调 |
| `pnpm test` | 184 文件、1595 条 L1–L3 通过；Transfer 合计 18 条 |
| `pnpm run typecheck`、`pnpm run typecheck:docs`、`pnpm --dir packages/testing run typecheck:browser` | 通过 |
| `pnpm run test:docs` | 2 文件、28 条通过 |
| `pnpm run build`、`pnpm run build:docs` | 生产包、example 与 docs 静态构建通过；docs 31 页 |
| `pnpm --dir packages/testing exec playwright test --config playwright.transfer.config.ts --workers=2` | Chromium docs/example 16 条通过（docs 9、example 7） |
| `pnpm run test:docs:browser` | 根路径 13 条、仓库 base 13 条通过 |
| Playwright CLI 截图与查看 | `.playwright-cli/element-2026-09-23T11-34-34-186Z.png`：两侧面板完整可见，输出位于组件下方 |
| `git diff --check` | 通过 |

原始日志位于 `/tmp/transfer-full-test.log`、`/tmp/transfer-typecheck-final.log`、`/tmp/transfer-docs-typecheck-final.log`、`/tmp/transfer-browser-typecheck-final.log`、`/tmp/transfer-docs-test-final.log`、`/tmp/transfer-build-final.log`、`/tmp/transfer-build-docs-final.log`、`/tmp/transfer-browser-final.log`、`/tmp/transfer-docs-browser-final.log`。

## 边界

- 浏览器专项使用本机 Chromium；未执行跨浏览器、消费者安装、部署或发布验收。
- 开发页仍出现共享 `<Form>` 的 `STRICT_READ_UNTRACKED` 警告；专项监听未发现 `<Transfer>` 的同类警告。共享 Form 追踪留在后续 B02/C07 范围。
- 保留工作区中其他物料的未提交修改；没有升级依赖、手改生成声明或提交发布。
