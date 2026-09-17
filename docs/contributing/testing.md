# 四层测试编写规范

测试工作区：`packages/testing`；统一 Vitest 配置：`packages/testing/vitest.config.ts`。浏览器配置独立，不能被 Vitest 收集。测试验证公开契约，不是证明当前实现“能运行一次”。

## 分层、目录与断言

| 层 | 新用例放置位置 | 核心检查 | 不能替代的检查 |
| --- | --- | --- | --- |
| L1 headless | `headless/<物料名>/`；公共生产逻辑在 `headless/shared/<模块名>/`，主题/站点在 `headless/preset/`、`headless/docs/` | Solid owner 内的状态迁移、getter、受控回调、纯逻辑、异步与清理 | 组件 DOM 和真实样式 |
| L2 smoke | `smoke/<物料名>/` | 合法导入/配置，真实挂载标记，更新、ref、Provider 和卸载 | 功能语义；只有“不抛错”不够 |
| L3 render | `render/<物料名>/`；站点挂载契约在 `render/docs/` | 文本、节点数量、DOM 属性/属性值、ARIA、条件分支、受控更新、事件回调 | 几何布局、CSS 绘制、真实焦点/滚动 |
| L4 browser | `browser/<物料名>/`；站点在 `browser/docs/` | 浏览器中的尺寸、遮挡、层级、主题、键盘/指针、焦点、滚动和视觉 | headless 的内部状态覆盖 |

当前组件 L2 尚待补充；组件完整 L4 仍待接入，文档 L4 已有独立 Playwright 流程。纯布局可能不需要 L1；服务端路由工具可能不需要 L3。每项能力在记录中说明适用性，不机械要求四份重复用例。

## 先按物料，再按能力模块

四层都以物料作为第一级子目录，如 `headless/Form/`、`smoke/Form/`、
`render/Form/`、`browser/Form/`，目录名与源码保持一致。不再添加 competence/components
中间层。一个文件覆盖一个独立能力模块，而不是一个 `it` 或任意固定行数。

```text
headless/Form/
├── form.test.ts       # 综合状态契约（已有）
├── field.test.ts      # 字段（已有）
├── list.test.ts       # 动态字段列表（已有）
├── validate.test.ts   # 校验（已有）
└── utils.test.ts      # 生产 formUtils（已有）
```

新模块优先使用能力名，如 `selection.test.ts`、`controlled.test.tsx`、
`keyboard.spec.ts`；较大模块允许继续分子目录，如 `Table/editing/async.test.ts`。
已有综合文件不为迁移而拆断言，后续按具体回归目标拆分。共享 helper/fixture 放
`packages/testing/utils/`（可再按物料分组），测试文件不能相互 import。

组合能力跟随物料，例如 `Image/preview-group.test.ts`、`Layout/sider.test.ts`。
跨物料的生产能力归 `headless/shared/<模块名>/`，与测试 helper 区分；`preset/` 和
`docs/` 保留基础设施分组，内部组件沿用 `_VirtualList/`。

尚无真实用例时不批量创建空测试；物料目录随首个用例创建。执行单物料可用
`pnpm --dir packages/testing run test headless/Form`，会递归收集所有模块；
同一物料多个层可用 `pnpm --dir packages/testing run test headless/Table render/Table`。

## Solid 2 上下文与清理

- headless 在 `createRoot` 中创建实例；DOM 组件通过 `render`（来自 `@solidjs/web`）挂载。配置变更用 getter 或响应式 props，别把 signal 值解构成初始快照。
- 使用当前 RC 的 `flush()` 推进响应式更新；涉及 promise 先完成对应异步再 flush，定时器通过 fake timers 精确推进。不要用固定 sleep 猜测完成时间。
- 为手动触发写入的测试 signal 按实际语义设置 `{ ownedWrite: true }`；不要把它当作生产代码中绕开 ownership 问题的通用开关。
- 用 `afterEach` 或 `try/finally` 释放 root、render disposer、监听、计时器、观察器与 portal；即使断言抛错也必须清理。只删除自己创建的宿主，避免整个 `document.body.innerHTML = ''` 影响其他测试。
- mock 平台边界（尺寸、ResizeObserver、matchMedia 等），不 mock 被测核心行为来“证明”结果。
- 共享数据/helper 放 `utils/`，不得从其他 `.test` 文件导入。helper 不应隐式注册测试或全局钩子；复用生命周期工具时显式返回 disposer。

L1 最小例子（保存至 `headless/Button/` 下测试文件时路径有效）：

```ts
import { createRoot } from 'solid-js'
import { expect, it } from 'vitest'
import { createButton } from '../../../competence/src/button'

it('[button.loading.initial] exposes configured loading state', () => {
  let dispose = () => {}
  try {
    createRoot(cleanup => {
      dispose = cleanup
      const button = createButton({ loading: true })
      expect(button.loading()).toBe(true)
    })
  } finally { dispose() }
})
```

L3 最小例子（`render/Button/disabled.test.tsx`）：

```tsx
import { render } from '@solidjs/web'
import { flush } from 'solid-js'
import { expect, it, vi } from 'vitest'
import Button from '../../../components/lib/Button/index'

it('[button.disabled.activation] renders native disabled semantics', () => {
  const host = document.createElement('div')
  document.body.append(host)
  let dispose = () => {}
  try {
    const onClick = vi.fn()
    dispose = render(() => <Button disabled onClick={onClick}>保存</Button>, host)
    flush()
    const button = host.querySelector('button')
    expect(button).not.toBeNull()
    expect(button?.textContent).toContain('保存')
    expect(button?.disabled).toBe(true)
    button?.click()
    expect(onClick).not.toHaveBeenCalled()
  } finally { dispose(); flush(); host.remove() }
})
```

## 断言策略

- L3 不比较 JSX 返回对象：Solid 编译后的渲染产物不是 React VDOM。断言用户能观察到的 DOM 契约，而非内部 class 顺序、私有 signal 名或整页 innerHTML 快照。
- 检查初始状态 → 操作 → 更新 → 回调次数/参数 → 销毁。受控模式先验证“回调提出变更但值不自行漂移”，再由父层更新 props。
- 覆盖空值/零值、禁用、loading、合法边界、受控/非受控、异步成功/失败/乱序、卸载后完成等适用路径；非法输入只有属于承诺契约时才测试。
- 浏览器优先按 role、accessible name、label 定位。避免依赖 DOM 实现细节和脆弱文本索引。真实样式检查使用 computed style 或 bounding box，必要时补固定 viewport、字体、动画条件下的视觉快照。
- 初始文档 HTML 要通过原始 HTTP 响应或禁用 JS 验证；页面 JS 执行后再取 innerHTML 不证明 SSR 成功。

## 运行与质量边界

```bash
pnpm test
pnpm run test:headless
pnpm run test:render
pnpm run test:docs
pnpm --dir packages/testing exec playwright install chromium
pnpm run test:docs:browser
```

根目录 `test` 只覆盖 L1–L3，L4 单独运行。文档 L4 在根路径与仓库子路径分别构建实际产物，验证原始 HTML、禁用 JS、真实 Button 交互、深链接、CSS/资源、404 和 chunk 失败降级。

类型契约、声明输出、打包消费者安装、公开导出、tree shaking 与许可证检查属于额外工程质量检查，不能用四层运行时测试替代。当前源码别名测试不等于验证 npm 消费者安装成功。

为新能力命名稳定 ID，例如 `select.controlled.value`，在用例标题、功能记录、文档与示例说明中保持对应。不批量改名迁移过来的 991 条旧测试来制造“完成清单”；后续回归到具体组件时再补齐映射。
