# C10 Steps

状态：已验收（2026-09-28；下述支持范围与 Chromium 环境）。competence `createSteps` 未改动，改动集中在 UI 层。

## 契约与修复

对照 [Ant Design Steps](https://ant.design/components/steps-cn/) 公开示例（基本、迷你、带图标、步骤切换、竖直、竖直迷你、错误、点状、自定义点状、标签放置、可点击、进度、variant、起始序号、语义化）与 antd 6 源码 `steps/{index,style}`、@rc-component/steps，不宣称全 API 兼容。

- **视觉**：
  - 默认 `variant="filled"`：等待项浅灰底、进行中 primary 实心、完成项 primary/10 底加对勾、错误项 error/10 底加叉号；`outlined` 为描边风格。
  - 三种布局：inline（标题在图标右侧，rail 挂在标题后由内容区 overflow-hidden 裁到本项末端）、stack（标题在图标下方）、vertical。rail 穿过图标中心线，完成项 rail 为 primary。
  - 点状模式标题在点下方，当前点放大（8 → 10，small 6 → 8）。
  - `percent` 在当前图标外渲染 Progress 圆环（默认 40 / 迷你 32，线宽 4）。
- **交互与可访问性**：
  - 只有传了 `onChange` 时整项才是 `role=button tabindex=0`，Enter / 空格触发；点击当前项不回调。
  - 禁用项 `aria-disabled`，当前项 `aria-current=step`。
  - 修复前 UI 层自带“只能后退或前进一步”的点击守卫，与 antd 自由跳转不符；现在 UI 传 `clickNavigable: false`，守卫只留给 headless 向导场景。
- **新增 API**：
  - `initial`、`orientation`（`direction` 的别名，优先）、`titlePlacement`（`labelPlacement` 别名）、`type: 'dot'`、`progressDot`（布尔或渲染函数）、`variant`。
  - `classNames` / `styles`：root / item / itemIcon / itemTitle / itemSubtitle / itemContent / itemRail，对象或函数。
  - item：`content`（优先于 `description`）、`icon`（图标类名或 JSX）、`class` / `style`、JSX `title` / `subTitle`。
- **破坏性改动**：默认外观变为 filled；点击可自由跳转；点状模式不再渲染 button；导出的 `StepItem` 改为 UI 超集类型。
- **保留差异**（文档“暂不支持”已写明）：`type="navigation" | "inline" | "panel"`、`responsive`、`ellipsis`、ConfigProvider、RTL。

## 能力映射

源码：`packages/components/lib/Steps/{index.tsx,styles.ts}`，逻辑 `packages/competence/src/steps.ts`（未改）。

| 能力 / 覆盖 | example / docs 示例 | L1 headless | L2 smoke | L3 render | L4 browser |
| --- | --- | --- | --- | --- | --- |
| 状态派生、initial 偏移、导航守卫 | steps/basic、initial、headless-wizard | steps（15） | exports | contracts | — |
| filled / outlined 色板、全变体无死类 | steps/basic、variant | theme（2） | — | contracts | icon |
| inline / stack / vertical rail 几何 | steps/basic、title-placement、vertical | — | — | contracts | rail、titlePlacement |
| 点状与自定义点 | steps/progress-dot、custom-dot | — | — | contracts | dot |
| percent 圆环 | steps/progress | — | — | contracts | percent |
| 可点击、键盘、aria | steps/clickable | — | — | contracts | keyboard |
| 语义化 classNames / styles | steps/style-class | — | — | contracts | — |
| 手机宽度无横向溢出 | steps/basic | — | — | — | mobile（仅 docs） |

测试路径前缀 `packages/testing/<层>/Steps/`：headless 17 条、render 13 条、smoke 1 条、browser 8 条。

## 踩坑

- `steps.browser.mobile` 只在文档站验证：example 应用在 390px 下隐藏内容区，示例整体不可见。

## 验证记录

见 [anchor-affix.md 的统一验证记录](anchor-affix.md#验证记录)。
