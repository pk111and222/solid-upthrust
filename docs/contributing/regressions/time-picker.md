# TimePicker 回归记录

日期：2026-09-23。环境：Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0。

## 能力映射

| 能力 | 实现 / 验证 | 结果 |
| --- | --- | --- |
| 单值时间、秒精度、输入编辑、步进、范围和选项格点 | `packages/competence/src/timePicker.ts`；`packages/testing/headless/TimePicker/timePicker.test.ts` | L1 31 条通过 |
| 公开默认导出、`RangePicker` 静态与具名导出 | `packages/components/lib/TimePicker/index.tsx`、`packages/components/lib/index.ts`；`packages/testing/smoke/TimePicker/exports.test.tsx` | L2 1 条通过 |
| 受控/非受控更新、禁用、清空、焦点事件、范围区间和范围清空 | `packages/components/lib/TimePicker/index.tsx`、`packages/components/lib/TimePicker/RangePicker.tsx`；`packages/testing/render/TimePicker/contracts.test.tsx` | L3 10 条通过（含下方 Form.Item 集成） |
| Form.Item 单值/范围回写、提交及 resetFields | `packages/components/lib/TimePicker/index.tsx`、`packages/components/lib/TimePicker/RangePicker.tsx`；`packages/testing/render/TimePicker/contracts.test.tsx` | L3 新增 1 条集成用例通过 |
| 面板开关、选项数量、范围顺序、生产示例及 SSR 文档 | `packages/testing/browser/TimePicker/interactions.spec.ts` | Playwright 7 条通过，example 的静态 SSR 请求按项目设计跳过 |
| 文档/API/客户端示例 | `docs/src/pages/components/data-entry/time-picker.tsx`、`time-picker-api.json`、`time-range-picker-api.json`、`docs/src/examples/time-picker/*.tsx` | docs 类型与生产静态构建通过；双 base 套件各 13 条通过 |
| example 交互演示 | `example/src/pages/TimePicker.tsx` | example 生产构建通过；与 docs 同跑的浏览器交互覆盖基础、秒、范围 |

## 修复

- `TimePicker.RangePicker` 原先不采用 `defaultValue`，并且非受控交互没有保存新范围；现在维护非受控区间，受控值仍由父级优先。
- 范围反向选择原先会把端点压成相同时间；现在交换两端并保持递增。
- 单值与范围机器和原生输入曾分别通知 focus/blur，且 headless 回调伪造了空 `FocusEvent`；现在只由原生输入转发一次真实事件。
- 单值和范围控件原先没有把更新回写到 `Form.Item`；现在显式 `onChange` 优先，否则写回字段 store，提交值和 `resetFields` 均有集成验证。
- example 页面初始范围为空，不利于直观看到范围编辑；改为展示 `09:00–17:30`。

## 验证

- 基线：`pnpm --dir packages/testing exec vitest run headless/TimePicker/timePicker.test.ts`，31 条通过。
- 专项 L1–L3：`pnpm --dir packages/testing exec vitest run headless/TimePicker smoke/TimePicker render/TimePicker`，3 文件、42 条通过。
- 全量 L1–L3：`pnpm --dir packages/testing exec vitest run --maxWorkers=2`，186 文件、1606 条通过。首次默认并行 `pnpm test` 有既有 `_VirtualList` selector 超时；受限 workers 复跑全绿，按 C05 历史记录的并发噪音处理，未改该组件。
- 类型与差异：`pnpm run typecheck`、`pnpm run typecheck:docs`、`git diff --check` 通过。
- 构建：`pnpm run build`、`pnpm run check:docs` 通过。生产包构建有既有 external global-name 与 example 大 chunk 警告，不影响构建成功。
- 专项浏览器：`pnpm --dir packages/testing exec playwright test -c playwright.time-picker.config.ts`，docs/example 共 7 条通过，另 1 条 example SSR 请求按配置跳过；Form 专项修改后重跑通过。
- 文档部署：`pnpm --dir packages/testing run test:docs:browser` 首次并发运行时 file-route SSR 热更新测试超时；先后在 `/` 与 `/solid-upthrust/` 下以 `--workers=1` 重跑完整文档套件，各 13 条通过，包含 TimePicker 深链与资源路由检查。

## 适用性与遗留范围

- L1、L2、L3、L4 均适用，本次均有执行证据。
- L2 仅验证公开导出形态，DOM 行为集中于 L3 与 L4，避免复制交互矩阵。
- 范围两端共享相同 `min` / `max` / 步长，不能分别配置；该限制已写入公开文档。
- 此记录不代表完整 Form、Trigger 共享能力、跨浏览器、消费者安装或发布阶段验收完成。
