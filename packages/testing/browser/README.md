# L4：真实浏览器验收测试

`docs/` 已接入 Playwright，用真实静态服务验证 SSR HTML、禁用 JS 的阅读效果、
客户端 Button 的点击/键盘操作、源码、深链接、CSS/资源、404 与加载失败提示。
`test:docs:browser` 分别构建根路径和仓库子路径。

```bash
pnpm --dir packages/testing exec playwright install chromium
pnpm run test:docs:browser
```

独立配置是 `../playwright.docs.config.ts`。可用 `DOCS_CHROMIUM_PATH` 指定本机 Chrome。
结果/trace 位于忽略提交的 `test-results/docs`；测试代码仍放在当前目录。

这只是文档基础设施的 L4，不是组件库的完整视觉、焦点、滚动、主题或组合业务回归。
后续组件测试按 `<物料名>/<能力模块>.spec.ts` 添加，例如 `Table/scroll.spec.ts`、
`Select/keyboard.spec.ts`，并配置对应真实测试页面和运行命令。物料目录与另外三层
同名，不嵌套 components；文档站保留 `docs/` 分组。暂无组件用例的目录随首个真实
测试创建，不以空目录或空测试表示已经覆盖。
本目录始终排除于 L1–L3 Vitest 收集范围之外。
