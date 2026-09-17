# L3：组件渲染契约测试

`<物料名>/<能力模块>.test.tsx` 保存结构、文本、DOM 属性/property、ARIA、
条件渲染、属性更新和事件回调契约。与其他三层使用相同物料目录名，不再嵌套 components。

例如 `Table/Table.test.tsx` 是迁入的综合用例；后续可在 `Table/` 中增加
`selection.test.tsx`、`editing.test.tsx` 等能力文件。文档站保留 `docs/` 分组。
已有测试仅调整路径，不拆改断言。测试 helper 放 `../utils/`，禁止测试文件互相导入。

当前使用 happy-dom，不声称覆盖真实 CSS 布局、绘制或原生浏览器交互。

```bash
pnpm --dir packages/testing run test:render
pnpm --dir packages/testing run test render/Table
```
