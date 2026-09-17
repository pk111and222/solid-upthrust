# AI 协作工作流

所有后续 AI 会话先读根目录 `AGENTS.md`。它是唯一规范入口；`CLAUDE.md`、`CODEX.md` 和 Copilot 指引应链接它，不独立定义一套相互冲突的版本、目录和测试规则。

## 1. 进入任务：先定位，再修改

1. 读 `AGENTS.md`、本文；涉及测试再读 `testing.md`，涉及功能交付读 `feature-checklist.md`，涉及站点读 `../README.md`。
2. 查看 `git status --short`、相关 package.json、锁文件和目标源码。不要覆盖已有修改、清理未跟踪文件或手改 `dist/`、`types/`。
3. 定位对应 `competence/src`、`components/lib`、`preset/src`、`example/src/pages`、`packages/testing`、`docs/src/pages` 和 `docs/src/examples`。阅读现有公开类型、导出及最接近的用例，而非只看旧组件清单。
4. 说明当前目标、支持范围和需要验证的结果。如果用户只问分析或诊断，不直接改实现；如果目标明确要求实现，则完成后验证再交接。

## 2. 项目必须保持的关键点

- `competence` 管状态/事件/无障碍行为，`components` 管 JSX/样式/props，`preset` 管主题。UI → competence，不能反向引用；不需要交互逻辑的纯展示组件不强行新建 headless 模块。
- 目前使用 Solid 2 RC。先看锁定的 `solid-js`、`@solidjs/web` 和编译插件，不照搬 Solid 1 或 React API。JSX import source 为 `@solidjs/web`；文档服务端入口使用 Node 条件，单元测试需要浏览器条件，不能混用。
- 当前 Solid 2 context 直接写 `<Context value={...}>`，不是 `<Context.Provider>`；使用现有 `merge`/`omit` 约定，不凭旧文档引入 `mergeProps`/`splitProps`。对不熟悉的 API 查当前已安装类型/官方资料。
- 样式用 UnoCSS，变体使用 CVA，动态值用 style；不新增第三方 UI 依赖。用 `ut-*` 与主题语义 token，验证样式能被静态扫描。
- 四层测试全部集中在 `packages/testing`，统一为 `<层>/<物料名>/<能力模块>`，同一物料四层同名；综合用例后续按能力拆文件，测试不相互导入。公共生产逻辑放 `headless/shared/<模块名>`，测试 helper 放 `utils/`；`docs` 是私有文档工作区，`example` 仍是必需的开发演示。
- 正式发布等待 Solid 2 正式版和项目质量检查完成，不能猜发布日期、偷偷升级 RC 或把文档构建成功当成可发布。

## 3. 按公开能力驱动实现

1. 列出本次能力 ID，如 `button.disabled.activation`，写清输入、默认值、受控/非受控、回调、输出和错误/销毁边界。参考开源库时记录确认过的版本及差异，不默认所有细节兼容。
2. 区分“已支持”“暂不支持”“实现但未验证”。对每个支持能力选择 L1–L4 中适用层；不适用写理由，未接入/未运行必须标记待验证。
3. 修 bug 时先写可复现原问题的失败测试；新增功能先固定可观察契约。不要通过快照接受现有错误，也不为凑覆盖率添加空断言。
4. 最小范围修改源码与类型/导出，同步 `example` 演示、文档页面和 CSR 示例。源码展示引用同一示例文件，避免演示与文档代码漂移。
5. 检查键盘、焦点、disabled、表单接入、受控更新、异步竞态、销毁后事件等高风险路径；按风险覆盖组合，不全量排列每个 props 的笛卡尔积。

## 4. 验证顺序

```bash
# 先跑目标测试，再跑全量
pnpm --dir packages/testing run test headless/Button/button.test.ts
pnpm test
pnpm run typecheck

# 改文档或 SSR/客户端边界时
pnpm run typecheck:docs
pnpm run test:docs
pnpm run test:docs:browser
pnpm run build:docs

# 影响生产构建、导出、样式时
pnpm run build
git diff --check
```

仓库可能有已有类型或构建失败：修改前留基线，修改后比较诊断；不能删除用例、放宽断言、滥用 `skip`、`any` 或排除源码来制造全绿。确有无关失败时交接原因、路径、命令与新增/原有的区分。`test:smoke` 暂时允许空集合，不表示 L2 已通过。

L4 当前只接入文档静态部署/客户端示例；组件全量的真实浏览器与截图回归仍需逐项补充。不要把 `pnpm test`（L1–L3）报告称为端到端全覆盖。

## 5. 完成与交接

按 `feature-checklist.md` 检查。交接必须包括：实际交付、关键文件、执行过的命令与结果、未验证的边界/已有失败、下一步需要的人工配置。不提交“全部完成”但仍有核心行为未实现的描述；没有真实部署就不报告上线成功。

文档站可静态部署，不需要在未经用户同意的情况下创建 Vercel 项目、修改 GitHub 设置、推送代码或触发发布。
