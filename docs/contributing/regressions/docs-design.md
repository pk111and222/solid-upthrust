# 文档全屏布局与独立示例（2026-09-16）

## 契约与交付

- `docs.public.routes`：内部 `_VirtualList` 文档页与 docs 示例移除；保留 example 独立开发页和测试。旧地址为 404。
- `docs.design.ssr`：全宽 Layout、Header、Content、Footer；Menu 渲染带 base 的原生链接；API 使用真实 Table，正文、导航、表格与源码全部 SSR。
- `docs.design.responsive`：桌面双列演示与独立代码区、手机单列和折叠目录，无页面级横向溢出；API 宽表在自身容器内滚动。
- `docs.demo.independent`：Icon 拆成 basic/size/color/spin/rotate/action 六个文件；ConfigProvider 拆成 basic/size/disabled/theme/nested/form/portal/style 九个文件（新增 fragment）。每段示例使用相同文件的 ?raw 源码，独立折叠和复制。
- `menu.label.render`：新增 UI 层可选 renderLabel，参数为 MenuItem，返回 JSX.Element；不传时维持字符串。源码 packages/components/lib/Menu/index.tsx，演示 example/src/pages/Menu.tsx，文档 docs/README.md，L3 render/Menu/label.test.tsx。
- `trigger.ssr.initialize`：触发器仅在浏览器注册 document/window 监听；Node 初始化回归在 headless/shared/Trigger/ssr.test.ts。自举时暴露的 lodash CommonJS 命名导入改为具体模块默认导入，确保 Vite 开发 SSR 和生产构建一致。

## 视觉方案

白底、轻边框、蓝色强调；顶栏 64px、桌面侧栏 248px，内容填满余下空间。
布局参考 Ant Design 6 的“用途 → 独立代码演示 → API”组织：
https://ant.design/components/button-cn/ （核对时版本 6.6.4）。未引入 Ant Design 依赖。

## 验证映射

- L1：headless/shared/Trigger/ssr.test.ts；既有文档路由测试。
- L2：既有物料冒烟；站点 SSR 入口由实际静态构建验证。
- L3：render/Menu/label.test.tsx；既有 islands 挂载测试。
- L4：browser/docs/design.spec.ts 验证内部路由、SSR 自举、全屏宽度、代码面板、复制、移动布局；browser/Icon、ConfigProvider 验证拆分后实际交互。_VirtualList 的 L4 仅在 example 项目运行。
- 保留双 base、无 JS、资源、404、chunk 失败与开发路由热更新测试。

没有部署；构建产物、截图与 trace 不提交。此次站点自举不等于 Menu/Table 所有能力已完成逐物料回归。

## 后续问题修复

- `config-provider.wrapper.fragment/body/portal/types`：新增显式 `wrapper={false}` 分支，无额外 DOM；保留配置继承和更新，弹层使用最近外层容器或 body。主题、class/style 与无容器分支在类型层互斥。源码 ConfigProvider 的 index/context/types；example 原页面新增片段演示；docs 新增 fragment 独立示例和 API 行。
- `docs.navigation.persist`：同源文档导航保留页面壳，fetch SSR 正文并挂载新示例；销毁旧 root/portal，处理取消请求、history 前后退，异常退回普通导航。导航不依赖服务端运行 Node，静态托管仍适用。
- 线条处理：新正文焦点容器不显示浏览器默认 outline；菜单保持 inline 样式，链接保留键盘可见焦点。
- Copy 使用真实 Button，由外层 data 标记和事件委托增强，避免给 Button 传入尚未支持的原生透传属性。

## 最终验证

- `pnpm run typecheck`、`pnpm run typecheck:docs`：通过，未新增类型错误。
- `pnpm test`：88 个文件、1062 条全部通过。
- `pnpm run build` 与 `pnpm run check:docs`：通过；9 个公开文档页面。example 保留原有大 chunk 提示。
- `pnpm run test:docs:browser`：根路径与 `/solid-upthrust/` 各 12 条通过，包含无刷新菜单、前进后退、复制、无 JS、自举表格和移动端溢出验证。
- `playwright.c01.config.ts`：5 条通过（Icon/ConfigProvider 各 docs + example；内部列表仅 example）。
- 桌面与移动截图已人工查看：`packages/testing/test-results/docs/config-provider-desktop.png`、`icon-mobile.png`。
- `git diff --check`：通过。
