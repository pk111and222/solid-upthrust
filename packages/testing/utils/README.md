# 共享测试辅助代码

集中存放 Solid 响应式上下文、DOM 挂载/清理、异步调度、模拟接口等基础
辅助函数，以及跨用例的固定测试数据。

当前已迁入 `fixtures/table.ts`（原 `packages/competence/test/tableFixtures.ts`）。
为保持迁移前后行为一致，本次不改写各用例已有的局部 mount、flush 或清理
函数；后续在有明确复用需求时逐步抽取，并通过现有回归验证。

辅助模块不要隐式注册测试或全局钩子，不要被生产包导入。

多个能力文件共用的夹具可按物料继续分组（如 `utils/Form/`），但用例文件应位于
四层的同名物料目录。不要将生产共享逻辑的测试移到 utils；它们属于
`headless/shared/<模块名>/`。例如 `headless/Form/utils.test.ts` 测的是生产 formUtils。
