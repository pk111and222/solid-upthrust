import Demo0 from '../../../docs/src/examples/avatar/basic'
import Demo1 from '../../../docs/src/examples/avatar/types'
import Demo2 from '../../../docs/src/examples/avatar/characters'
import Demo3 from '../../../docs/src/examples/avatar/recovery'
import Demo4 from '../../../docs/src/examples/avatar/badge'
import Demo5 from '../../../docs/src/examples/avatar/group'
import Demo6 from '../../../docs/src/examples/avatar/overflow'
import Demo7 from '../../../docs/src/examples/avatar/responsive'
export default function Page() {
  return <div class="p-6 max-w-5xl"><h2 class="text-2xl font-semibold mb-6">Avatar</h2>
    <section data-avatar-demo="basic" class="mb-8"><h3 class="text-lg font-semibold mb-3">基本使用</h3><p class="mb-4 text-sm text-on-surface-variant">三种命名尺寸保留本库的 64 / 40 / 28px，也可以传入数值；支持圆形和方形。</p><Demo0 /></section>
    <section data-avatar-demo="types" class="mb-8"><h3 class="text-lg font-semibold mb-3">图片、图标与字符</h3><p class="mb-4 text-sm text-on-surface-variant">优先级为图片 → 图标 → 字符；图片使用本地可复现的 SVG 数据，避免外部网络影响演示。</p><Demo1 /></section>
    <section data-avatar-demo="characters" class="mb-8"><h3 class="text-lg font-semibold mb-3">字符与自定义颜色</h3><p class="mb-4 text-sm text-on-surface-variant">本库使用末尾 maxCount 个字符作为缩写，不提供 Ant Design 的自动缩字和 gap。</p><Demo2 /></section>
    <section data-avatar-demo="recovery" class="mb-8"><h3 class="text-lg font-semibold mb-3">加载失败与恢复</h3><p class="mb-4 text-sm text-on-surface-variant">失败后回退到图标/字符；更换 src 或 srcSet 会重试。onError 返回 false 可保留图片。</p><Demo3 /></section>
    <section data-avatar-demo="badge" class="mb-8"><h3 class="text-lg font-semibold mb-3">带徽标的头像</h3><p class="mb-4 text-sm text-on-surface-variant">与 Badge 组合展示未读数量或状态点。</p><Demo4 /></section>
    <section data-avatar-demo="group" class="mb-8"><h3 class="text-lg font-semibold mb-3">AvatarGroup 头像组</h3><p class="mb-4 text-sm text-on-surface-variant">组级尺寸和形状作为默认值，成员可单独覆盖；头像重叠展示。</p><Demo5 /></section>
    <section data-avatar-demo="overflow" class="mb-8"><h3 class="text-lg font-semibold mb-3">头像组数量与溢出</h3><p class="mb-4 text-sm text-on-surface-variant">maxCount 表示可见头像数，+N 另占一位。分别演示 hover、click 和 focus 触发，0 会收起全部头像。</p><Demo6 /></section>
    <section data-avatar-demo="responsive" class="mb-8"><h3 class="text-lg font-semibold mb-3">响应式尺寸</h3><p class="mb-4 text-sm text-on-surface-variant">缩放视口观察独立头像与组内成员；断点采用 576 / 768 / 992 / 1200 / 1600px，缺失档位沿用较小档。</p><Demo7 /></section>
  </div>
}
