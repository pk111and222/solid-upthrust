# 跨物料的生产逻辑回归

这里测试共享生产能力，不是存放测试辅助代码：

- `Dialog/`：Modal、Drawer 等浮层复用的 dialog 行为。
- `Drag/`：跨物料拖拽能力。
- `Selection/`：选择/数值状态基础能力。
- `Trigger/`：浮层触发、定位和生命周期。

每个模块独立目录，可继续按能力拆文件。物料专属行为仍放对应物料目录；
例如 List/Tree 拖拽归各自的 `drag.test.ts`，不因依赖 createDrag 就全部移到这里。
测试 helper 和夹具统一放测试包根级 `utils/`。
