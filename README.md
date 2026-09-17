# Solid Upthrust (upthrust-ui)

A SolidJS enterprise component library styled with UnoCSS, following solidjs-upthrust visual specifications.

## Features

- Built for **SolidJS** — reactive, fine-grained, no virtual DOM overhead
- Styled with **UnoCSS** — atomic CSS, zero-runtime, tree-shakeable styles
- **Headless logic layer** (`competence`) separated from UI layer
- **Themeable** via UnoCSS preset with Material Design color system
- TypeScript-first with full type exports
- pnpm monorepo for modular development

## Packages

| Package | npm name | Description |
|---------|----------|-------------|
| `packages/components` | `upthrust-ui` | Visual UI components |
| `packages/competence` | `upthrust-competence` | Headless component logic |
| `packages/preset` | `upthrust-unocss-preset` | UnoCSS theme preset |
| `example` | — | Development playground |
| `packages/testing` | private | Four-layer automated regression workspace |
| `docs` | private | Solid 2 SSR documentation + client-only examples |

## Quick Start

```bash
# Install
pnpm add upthrust-ui upthrust-unocss-preset solid-js

# UnoCSS config (uno.config.ts)
import { defineConfig } from 'unocss'
import { presetUpthrust } from 'upthrust-unocss-preset'

export default defineConfig({
  // Keep vendor-specific pseudo-elements separate from ordinary utilities.
  mergeSelectors: false,
  presets: [
    presetUpthrust({
      defaultTheme: 'light',
    }),
  ],
})
```

```tsx
// Usage
import { Button, Alert, Flex } from 'upthrust-ui'

function App() {
  return (
    <Flex gap="middle" vertical>
      <Alert type="info">Welcome to Upthrust UI</Alert>
      <Button type="primary">Get Started</Button>
    </Flex>
  )
}
```

## Development

```bash
# Prerequisites
node >= 22.12
pnpm 11.16.0 (current verified workspace toolchain)

# Install dependencies
pnpm install

# Start development (run in separate terminals)
pnpm run dev::preset       # Watch preset changes
pnpm run dev::competence   # Watch competence changes
pnpm run dev::component    # Watch component changes
pnpm run dev::example      # Dev server at http://localhost:5656
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   example/                        │
│         (Dev playground & component demos)        │
└─────────────────────┬───────────────────────────┘
                      │ imports
┌─────────────────────▼───────────────────────────┐
│              packages/components                  │
│     (UI layer: JSX + UnoCSS class variants)      │
└──────────┬──────────────────────┬───────────────┘
           │ imports logic        │ imports theme
┌──────────▼──────────┐  ┌───────▼───────────────┐
│ packages/competence  │  │   packages/preset      │
│ (Headless behavior)  │  │ (UnoCSS theme tokens)  │
└─────────────────────┘  └───────────────────────┘
```

## Components

### General
- Button, Icon, Typography (Text / Title / Paragraph / Link)

### Layout
- Divider, Flex, Grid (Row / Col), Layout (Header / Footer / Content / Sider), Masonry, Space (Compact), Splitter (Panel)

### Navigation
- Anchor, Breadcrumb, Dropdown, Menu, Pagination, Steps, Tabs

### Data Entry
- Transfer — two-list selection with search, select-all, disabled items, one-way mode, and Form integration

### Data Display
- Tag — status/custom colors, icons, cancellable close, and CheckableTag
- Tree — controlled expansion/selection/checks, parent-child linkage, independent checks, search, guide lines, and keyboard navigation

These demos are available at `/Tag`, `/Transfer`, and `/Tree` in the example app.

### Tour 漫游式引导

`Tour` 的逻辑位于 `packages/competence/src/tour/`，物料位于 `packages/components/lib/Tour/`，示例入口为 `/Tour`。

- 支持 `open/defaultOpen`、`current/defaultCurrent`，以及 `onOpenChange`、`onChange`、`onClose`、`onFinish`。受控模式通过回调提出变更，由调用方更新属性；重新开始时可将 `current` 重置为 `0`。
- `steps` 配置目标元素或目标获取函数、JSX 标题/描述/封面、四向定位、间距、圆角、滚动选项、遮罩和目标交互。目标缺失或不可见时居中展示；监听 DOM 增删、滚动及尺寸变化以重新定位，空间不足时翻转并约束在视口内。
- `beforeChange(next, current)` 支持异步校验，返回 `false` 阻止切换；完成时 `next` 等于步骤总数。等待期间禁止重复导航，关闭或卸载后丢弃未完成结果；异常通过 `onError` 上报。
- 支持普通/主题色浮层、自定义宽度和层级、步骤指示与页脚、关闭/跳过/完成文案；默认遮罩且阻止目标交互，`mask={false}` 与 `disabledInteraction={false}` 可用于交互引导。
- 遮罩模式提供焦点限制，关闭后恢复焦点；Escape 与 Modal/Drawer 共享层级调度。`keyboard={false}` 可禁用 Escape，`maskClosable` 可开启点击遮罩关闭。

## Contributing

See [AGENTS.md](./AGENTS.md) for the full development specification, coding conventions, and how to add new components.

## License

MIT

## 扩展交互能力

以下示例均已加入 `example/src/pages` 对应组件页面，保持 SolidJS + headless competence + UnoCSS 分层，不引入第三方 UI 或拖拽库。

| 组件 | 新增入口 |
| --- | --- |
| Modal | `confirm/info/success/warning/error`，返回 `update/destroy`，以及 `destroyAll()` |
| Typography | Text / Paragraph / Title 的 `copyable`、`editable` |
| Select / TreeSelect / Cascader | 默认虚拟滚动，`virtual`、`listHeight`、`listItemHeight` |
| DatePicker | `presets`、`picker="week/quarter"`（同时支持 month/year）、`showTime`；RangePicker 支持 presets/showTime |
| Skeleton | `Skeleton.Button/Avatar/Input/Node` 及对应命名导出 |
| Tabs | `type="editable-card"` 或 `editable`、`onEdit`、`hideAdd`、`draggable`、`onReorder` |
| Tree | `draggable`、`allowDrop`、拖拽回调、`moveTreeNode` 不可变更新辅助函数 |
| Upload | `showUploadList` 按文件定制动作/图标/附加内容，`itemRender`、`iconRender`、`onDownload`；上传前 Blob/File 处理 |

### 弹窗、编辑和长列表

```tsx
const dialog = Modal.confirm({
  title: '确认保存？',
  content: '提交成功后自动关闭；失败后保持打开，可重试。',
  onOk: async () => { await save() },
})
dialog.update({ content: '更新后的说明' })
// dialog.destroy() / Modal.destroyAll()

<Paragraph copyable editable={{ text: text(), onChange: setText, maxLength: 200 }}>
  {text()}
</Paragraph>
<Select options={largeOptions} listHeight={256} listItemHeight={32} />
```

Modal 回调返回 `false` 或 Promise 拒绝会阻止关闭，等待期间阻止重复提交。静态入口在独立渲染根创建，不自动继承调用位置的 ConfigProvider；可通过 `getContainer` 指定具有主题样式的容器。`onOk(close)` / `onCancel(close)` 接收关闭函数时，同步返回 undefined 表示自行控制关闭。

Typography 支持 Enter 保存、Escape 取消、Shift+Enter 换行；`editable.text` / `editable.editing` 可受控。`copyable.text` 可指定字符串或异步获取函数，`onError` 接收复制失败。

虚拟列表使用固定行高，默认视口 256px、行高 32px；使用自定义内容时请保持行高一致，或传 `virtual={false}`。Cascader 的各级列和搜索结果均使用虚拟列表；TreeSelect 仅渲染展开后可见的节点。

### 日期和时间的值约定

组件继续使用字符串而非引入新的日期对象类型：

- 普通日期：`YYYY-MM-DD`。
- 周：按照 `weekStart` 返回该周起始日期；季度：返回季度首日，例如 `2026-07-01`。
- 开启 showTime：`YYYY-MM-DD HH:mm:ss`，`showTime={{ defaultValue: '09:00:00', format: 'HH:mm' }}` 可配置初始时间和时间输入精度。修改时间通过 onChange 输出，“确定”关闭面板。
- RangePicker：上述字符串的二元组；时间编辑不允许开始时间晚于结束时间。
- `presets={[{ label, value }]}` 支持值或点击时执行的函数；快捷项同样经过 min/max/disabledDate 校验。

### 拖拽及上传列表

Tabs 的 `onEdit(target, 'add' | 'remove')` 只发出请求，调用方维护 items；排序通过 `onReorder(nextItems, info)` 回传，支持原生拖拽和 Alt+左右方向键。`closable={false}` 的页签不能关闭，禁用页签不能拖动。

Tree 的 `dropPosition` 采用相对目标行的位置：`-1` 为前、`0` 为子节点、`1` 为后。组件不隐式改写 treeData，典型用法为：

```tsx
<Tree treeData={nodes()} draggable onDrop={info =>
  setNodes(previous => moveTreeNode(previous, info.dragNode.value, info.node.value, info.dropPosition))
} />
```

Upload 的 `showUploadList` 优先于旧 `showList`，对象内支持 `showPreviewIcon/showRemoveIcon/showDownloadIcon`（布尔值或按文件判断函数）、对应的 `previewIcon/removeIcon/downloadIcon` 和 `extra`。`itemRender(originNode, file, fileList, actions)` 的 actions 包含 preview/remove/download/retry，删除仍遵循 disabled / beforeRemove。

`beforeUpload` 可返回 Blob/File 或其 Promise，替换实际上传和预览的文件；示例页提供居中方形裁剪后进入 picture-card 图片墙的示例。自定义裁剪选择框可通过这一入口接入，当前不包含通用图片裁剪编辑器。

### ConfigProvider：运行时局部配置

保留 UnoCSS 作为主题规则的来源。`presetUpthrust({ theme, switchedTheme })` 用于构建时配色、尺寸和样式定制；`ConfigProvider` 用于运行时默认属性与局部颜色覆盖。它不会生成新的 UnoCSS 工具类，也不会修改 document 根节点。

```tsx
<ConfigProvider
  componentSize="small"
  components={{ Button: { type: 'primary' }, Input: { allowClear: true } }}
  theme={{ colors: { primary: '#722ed1', onPrimary: '#ffffff' } }}
>
  <Button>继承配置</Button>
  <ConfigProvider componentDisabled={false} theme={{ colors: { primary: '#08979c' } }}>
    <Button>局部覆盖</Button>
  </ConfigProvider>
</ConfigProvider>
```

- 默认属性优先级为：组件显式属性 > Form/Item 配置 > `components` 中的组件默认值 > 通用 `componentSize/componentDisabled` > 组件内置默认值。组件配置字段由 `ComponentDefaults` 类型限定；不同组件的尺寸枚举不做强行转换。
- 嵌套配置按组件、属性合并；`inherit={false}` 重置默认属性继承。CSS 仍按 DOM 继承，因此重置配色需要提供新的 `theme` 或外部样式。
- `theme.colors` 支持 hex/rgb/hsl 颜色，使用现有 `--upthrust-colors-*` RGB 通道变量。可设置 `theme.prefix` 与自定义预设一致；camelCase 和 kebab-case token 名均可用。完整明暗配色及色阶仍由外部预设提供。
- Provider 渲染一个 div，支持 `class/style`，可直接使用外部 UnoCSS 主题类或注入变量；并列区域不会互相覆盖。需要保持布局时可使用 `class="contents"`。
- 组件弹层默认挂载于最近 Provider 的 DOM 作用域，继承外部样式和局部配色。显式指定外部挂载容器时遵循该容器的 CSS；局部祖先上的 transform、contain、裁剪等也会影响弹层布局。
- 静态 Modal 等独立渲染根不自动获得调用位置的配置。Message/Notification 需要将对应 Provider 放在主题作用域内，静态 API 的路由规则保持原行为。

示例 `/ConfigProvider` 展示嵌套与并列配色、动态尺寸与禁用、显式覆盖、Form 优先级、默认属性隔离，以及 Popover/Modal 的局部主题。

## 文档与 AI 协作

规范入口为 [AGENTS.md](./AGENTS.md)。后续功能按 [AI 工作流](./docs/contributing/ai-workflow.md)、
[四层测试规范](./docs/contributing/testing.md) 和 [完成清单](./docs/contributing/feature-checklist.md) 同步交付。

根目录 `docs` 是独立文档工作区：文件目录生成路由，正文与源码由 Solid SSR 预渲染，
组件示例仅在浏览器挂载。详见 [文档站说明](./docs/README.md)。

```bash
pnpm run dev:docs
pnpm run check:docs
pnpm run preview:docs
pnpm run test:docs
# 首次安装：pnpm --dir packages/testing exec playwright install chromium
pnpm run test:docs:browser
```

支持静态输出到 GitHub Pages；已提供手动部署工作流。Vercel 可使用同一套静态产物。
具体组件文档随回归逐个补充，目录或示例存在不代表组件能力已经完整验证。
