# Affix 固钉

```tsx
import { Affix, Button } from 'upthrust-ui'
<Affix offsetTop={16} onChange={affixed => console.log(affixed)}>
  <Button>固定操作</Button>
</Affix>
```

- `offsetTop`：距目标可视区域顶部的像素距离；未设置任何偏移时默认 0。
- `offsetBottom`：距目标可视区域底部的像素距离。上下都传时 offsetTop 优先。
- `target`：返回滚动容器 HTMLElement 或 Window，默认 window。自定义元素必须包含固钉组件；返回 null/undefined 时暂停固钉。响应式 target 改变会重新绑定监听。
- `disabled`：恢复正常文档流；`onChange` 仅在固钉状态切换时触发，不会每次滚动重复触发。
- `zIndex`：默认 10；`class/style` 用于占位外层，`affixClass` 仅在固定时作用于内容层。
- `ref`：取得 headless 实例，可调用 `updatePosition()` 手动重测；`affixed()` 和 `position()` 提供响应式状态。

窗口目标使用 fixed；元素目标在原占位块内使用 absolute 和目标相对偏移，因此会跟随容器移动并保留原生 overflow 裁剪。自动监听目标、祖先滚动、窗口缩放和 ResizeObserver 尺寸变化，通过 requestAnimationFrame 合并测量，卸载时移除监听。

固定时保留内容高度，内容不迁移到 Portal，不重建子组件。内容宽度和高度变化会重新测量。祖先的 transform/zoom 可能改变坐标系，建议避免在经过变换的祖先下使用；未引起滚动或尺寸变化的外部布局位移，可通过 updatePosition 手动刷新。

示例：`example/src/pages/Affix.tsx`。纯位置计算与生命周期逻辑位于 `packages/competence/src/affix.ts`。
