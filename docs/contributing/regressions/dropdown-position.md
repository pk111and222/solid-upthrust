# Dropdown 定位复查（2026-09-17）

范围：用户反馈的文档浮层错位、共享定位路径确认及现有 Dropdown 测试复跑。
状态：定位及后续未通过项已修复；最终验证见下文及 dropdown.md。

## 实现路径

Dropdown UI 使用 `packages/competence/src/trigger.ts` 的 createTrigger，提供触发、测量、翻转、位置与关闭行为。
Tooltip 经 createTooltip、Popconfirm 经 createPopconfirm 复用该能力；Popover 直接使用。
Select、AutoComplete、Cascader、Mentions、TreeSelect、DatePicker/RangePicker、TimePicker/RangePicker、Menu 弹出层也有 createTrigger 调用。
ConfigPortal 负责挂载及主题继承，不负责定位。旧 createDropdown 是保留的兼容模块，当前 UI 不调用。
不能据此声称全部浮层（如 Modal/Drawer/Tour）统一使用此 hook，也不代表所有消费者已独立验收。

## 根因与修复

测量返回 getBoundingClientRect 的视口坐标，layerStyle 却使用 absolute。
此前默认 body 分支没加页面滚动量；局部 ConfigPortal 又可能进入 relative 主题容器，
但 Trigger 不知道实际定位祖先，仅用可选 getContainer 判断，造成容器原点再次叠加。

现在以浮层实际 offsetParent 转换坐标：

- 初始包含块：视口坐标 + scrollX/scrollY。
- 定位祖先：视口坐标 - 祖先矩形原点 - clientLeft/clientTop + scrollLeft/scrollTop。
- 碰撞/翻转和箭头仍在视口坐标中计算，最后统一转换，不改变 Dropdown 的公开 props。

未承诺缩放/旋转变换祖先的完整坐标变换，本次没有声称覆盖完整 B04。

## 证据

- 新增 browser/Dropdown/position.spec.ts：修改前普通滚动菜单、主题 Portal、开发主题页面 3 条全部失败。
- 修复后定位专项 29 条通过：docs 15、example 14，包括两种容器和十二方向；没有用“类名存在”代替 DOMRect 对齐。
- 新增 headless/shared/Trigger/coordinates.test.ts：页面横纵滚动、定位容器边框与内部滚动；与原 trigger/SSR 合计 42 条通过。
- 本地 5657 主题菜单：真实间距 4px、左侧偏移 0px；已打开检查截图 test-results/dropdown/theme-position-fixed.png。
- 根类型检查、浏览器测试类型检查、生产构建、check:docs 通过（12 个静态页面）。仍有原 example 大 chunk 提示。

## 后续失败修复（2026-09-17）

上一轮 9 条 L1–L3、6 条浏览器失败均已处理，没有跳过或删除失败用例。

- Trigger 的挂载/保留/延迟销毁改由实际 open 状态驱动，支持外部受控更新，拒绝请求不创建幽灵 DOM。
- 事件处理读取当前 action；禁用右键保留浏览器默认行为。替换 trigger/layer 节点会解除旧监听，卸载取消 hover、测量和销毁任务。
- 位置 signal 使用 Solid 2 ownedWrite；首次打开同步测量已有 ref，并在 DOM 就绪后补测，默认打开可以正常聚焦。
- 修正测试生命周期：定位测试原 helper 在操作前就 dispose owner；现保留 owner 到 afterEach。动态 action 测试为主动写入声明 ownedWrite，清理追加 DOM。
- Playwright 分别验证原生 disabled=false 与祖先 aria-disabled=true，再强制发送真实指针事件检验禁用拦截，不再错误要求 ARIA 禁用元素为 enabled。
- 新增卸载取消待执行任务、替换 layer 移除旧监听两项测试，均有中文说明。

最终全量 `pnpm test`：111 文件、1255 条通过；根类型与浏览器类型检查通过。
Dropdown 根路径专项 43 条通过（docs 22、example 21，含开发页面）；子路径 docs 专项 22 条通过；文档站双 base 各 13 条通过。
生产包、example、check:docs 构建通过；仍保留 example 大 chunk 提示。

专项入口：`packages/testing/playwright.dropdown.config.ts`。指定 DOCS_CHROMIUM_PATH 为本机 Chrome，DOCS_BASE 与已构建文档产物保持一致。
