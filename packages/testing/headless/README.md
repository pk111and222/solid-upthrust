# L1：Headless 与纯逻辑测试

按 `<物料名>/<能力模块>.test.ts` 组织，如 `Button/button.test.ts`、
`Form/field.test.ts`、`Form/validate.test.ts`、`Table/interactions.test.ts`。
子组件跟随主物料：`Layout/sider.test.ts`、`Image/preview-group.test.ts`。
同一物料在 smoke、render、browser 中使用相同目录名。

- `shared/<模块名>/`：跨物料的生产逻辑（Dialog、Drag、Selection、Trigger）。
- `preset/`：主题与 CSS 生成逻辑。
- `docs/`：文档站纯逻辑。
- 测试辅助函数放 `../utils/`；这里的 `Form/utils.test.ts` 验证生产 formUtils。

已有测试保留原有 Solid 上下文、flush 和清理方式。后续按能力逐步拆分综合文件，
不要按行数切分或从另一个测试文件导入 helper。

```bash
pnpm --dir packages/testing run test:headless
pnpm --dir packages/testing run test headless/Form
pnpm --dir packages/testing run test headless/Table/interactions.test.ts
```

`test:competence` 只跑物料及 shared 生产逻辑，不含 preset/docs。
