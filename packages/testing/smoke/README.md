# L2：组件基础冒烟测试

预留导入、必要属性、合法配置组合、Provider 上下文、挂载/更新/卸载以及
公开 ref 的基础可用性用例。测试必须断言组件实际挂载，不能只判断不抛异常。

统一按 `<物料名>/<能力模块>.test.tsx` 建目录，例如 `Button/imports.test.tsx`、
`Button/configuration.test.tsx`、`Table/lifecycle.test.tsx`。物料目录与另外三层同名，
不嵌套 components；首个真实用例加入时再创建相应目录。

当前尚无用例，不添加空通过测试。由本包 Vitest 配置递归收集物料下的模块文件。
`test:smoke` 暂时允许空集合；补充首批测试后应移除该例外。
