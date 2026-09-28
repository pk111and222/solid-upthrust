# C10 Breadcrumb

状态：已验收（2026-09-28；下述支持范围与 Chromium 环境）。依赖 Dropdown（createTrigger），未改动 Dropdown 本体。

## 契约与修复

对照 [Ant Design Breadcrumb](https://ant.design/components/breadcrumb-cn/) 的公开示例（基本、带图标、params、分隔符、独立分隔符、下拉菜单、itemRender、语义化）与 antd 6 源码 `breadcrumb/{Breadcrumb,BreadcrumbItem,useItemRender,useItems}`，不宣称全 API 兼容。

- **结构**：`nav[aria-label=breadcrumb] > ol > li`；分隔符单独成 `li`，带 `aria-hidden`。修复前是平铺的 span，没有列表语义。
- **路径与参数**：
  - item 的 `path` 逐级累积为 `#/a/b`；`:name` 按 `params` 替换。
  - `itemRender(route, params, routes, paths)` 与 antd 签名一致。
  - 最后一项默认渲染为 span（当前页），其余有 href / path 的项渲染为链接。
- **修复的缺陷**：
  - 最后一项即使有 href 也被强制渲染为 span，现在显式 href 保留为链接，只有未传时才是纯文本。
  - 没有 href 的项丢失 onClick。
  - 使用 `javascript:;` 作为占位 href。
  - 下拉图标改为 `i-mdi-chevron-down`，弹出方向改为 bottom。
  - `Breadcrumb.Item` 写法下最后一项颜色不正确。
- **新增 API**：
  - `params`、`itemRender`、`classNames` / `styles`（root / item / separator，对象或函数）。
  - item 字段：`key`、`path`、`dropdownProps`、`class` / `style`、`type: 'separator'`（独立分隔符）。
  - 菜单项：`title` 作为 `label` 的别名；`path` 与 `href` 拼接。
  - `separator` 为 `""` 或 `null` 时不渲染分隔符；title 为空的项跳过。
  - `dropdownRender` 标为 deprecated（改用 `dropdownProps.popupRender`）。
- **破坏性改动**：根节点 div → nav/ol/li；最后一项有 href 时不再强制为 span。
- **保留差异**（文档“暂不支持”已写明）：ConfigProvider 全局配置、RTL、`Breadcrumb.Separator` JSX 子组件、旧版 `routes`、菜单 Menu props 透传。

## 能力映射

源码：`packages/components/lib/Breadcrumb/{index.tsx,styles.ts}`。

| 能力 / 覆盖 | example / docs 示例 | L1 headless | L2 smoke | L3 render | L4 browser |
| --- | --- | --- | --- | --- | --- |
| nav/ol/li 结构、aria-hidden 分隔符 | breadcrumb/basic | — | exports | contracts：structure | spacing |
| 链接与当前项颜色、hover | breadcrumb/basic、with-icon | theme：无死类 | — | contracts | colors |
| path 累积与 params 替换 | breadcrumb/params | — | — | contracts：params | params |
| separator（字符串 / 节点 / 空 / type=separator） | breadcrumb/separator、separator-component | — | — | contracts | spacing |
| 下拉菜单（hover / click、placement bottom） | breadcrumb/overlay | — | — | dropdown | dropdown |
| itemRender | breadcrumb/item-render | — | — | contracts | — |
| 语义化 classNames / styles | breadcrumb/style-class | — | — | contracts | — |
| 窄宽度换行 | breadcrumb/basic | — | — | — | wrap |

测试路径前缀 `packages/testing/<层>/Breadcrumb/`：headless theme 1 条、render contracts 13 条 + dropdown 1 条、smoke 1 条、browser 6 条（docs / example 各跑一遍）。

## 踩坑

- Solid 2 `merge` 的默认值会被显式传入的 `undefined` 覆盖（例如 `separator={props.separator}` 透传），默认分隔符因此消失；改为 getter 回退 `props.separator === undefined ? '/' : props.separator`。
- 根节点上的 `[&_a]` 规则优先级低于使用者传给链接的类，链接颜色须写在链接自身的 class 上。

## 验证记录

见 [anchor-affix.md 的统一验证记录](anchor-affix.md#验证记录)（C10 Breadcrumb / Steps / Anchor / Affix 同一轮执行，日志目录 `output/c10-nav/`）。
