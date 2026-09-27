import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import demo0 from '../../../examples/avatar/basic.tsx?raw'
import demo1 from '../../../examples/avatar/types.tsx?raw'
import demo2 from '../../../examples/avatar/characters.tsx?raw'
import demo3 from '../../../examples/avatar/recovery.tsx?raw'
import demo4 from '../../../examples/avatar/badge.tsx?raw'
import demo5 from '../../../examples/avatar/group.tsx?raw'
import demo6 from '../../../examples/avatar/overflow.tsx?raw'
import demo7 from '../../../examples/avatar/responsive.tsx?raw'
import avatarApi from './avatar-avatar-api.json'
import groupApi from './avatar-group-api.json'

export const meta: PageMeta = { title: 'Avatar 头像', description: '用图片、图标或字符表达身份，并组合成头像组。', group: '组件', order: 160 }
export default function Page() {
  return <>
    <Section id="usage" title="使用方式"><p>用于用户身份、协作者列表与消息入口；AvatarGroup 是独立具名导出，不提供 Avatar.Group 静态属性。</p><CodeBlock code={"import { Avatar, AvatarGroup } from 'upthrust-ui'"} /></Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="avatar/basic" title="基本使用" description="三种命名尺寸保留本库的 64 / 40 / 28px，也可以传入数值；支持圆形和方形。" source={demo0} />
      <Demo id="avatar/types" title="图片、图标与字符" description="优先级为图片 → 图标 → 字符；图片使用本地可复现的 SVG 数据，避免外部网络影响演示。" source={demo1} />
      <Demo id="avatar/characters" title="字符与自定义颜色" description="本库使用末尾 maxCount 个字符作为缩写，不提供 Ant Design 的自动缩字和 gap。" source={demo2} />
      <Demo id="avatar/recovery" title="加载失败与恢复" description="失败后回退到图标/字符；更换 src 或 srcSet 会重试。onError 返回 false 可保留图片。" source={demo3} />
      <Demo id="avatar/badge" title="带徽标的头像" description="与 Badge 组合展示未读数量或状态点。" source={demo4} />
      <Demo id="avatar/group" title="AvatarGroup 头像组" description="组级尺寸和形状作为默认值，成员可单独覆盖；头像重叠展示。" source={demo5} />
      <Demo id="avatar/overflow" title="头像组数量与溢出" description="maxCount 表示可见头像数，+N 另占一位。分别演示 hover、click 和 focus 触发，0 会收起全部头像。" source={demo6} />
      <Demo id="avatar/responsive" title="响应式尺寸" description="缩放视口观察独立头像与组内成员；断点采用 576 / 768 / 992 / 1200 / 1600px，缺失档位沿用较小档。" source={demo7} />
    </DemoGrid></Section>
    <Section id="avatar-api" title="Avatar API"><ApiTable rows={avatarApi} /></Section>
    <Section id="group-api" title="AvatarGroup API"><p>成员显式 size/shape 优先于组默认值；maxCount=0 时仅显示溢出按钮。按钮可用 Tab 聚焦，click 模式支持 Enter/Space，浮层复用 Popover。</p><ApiTable rows={groupApi} /></Section>
    <Section id="limits" title="约定与边界"><p>参考 <a href="https://ant.design/components/avatar-cn/">Ant Design Avatar 6.6.5</a> 的基本、类型、字符、徽标、组合与响应式示例。本库沿用 middle 命名和 64/40/28px 尺寸；字符按 maxCount 取末尾缩写，没有自动缩字和 gap。src 仅支持字符串，未提供 draggable、crossOrigin、新版 max 对象配置或 Avatar.Group 静态导出。</p><p>本轮修正：AvatarGroup.maxCount 现在计可见头像数，溢出按钮另计；旧实现会预留一个名额给 +N。响应式断点与 Grid 对齐，稀疏对象只使用已配置档位；空对象或无匹配时使用 40px。图片失败回退优先级为图标、字符；更换资源后可恢复。没有图片时可通过 alt 为外层提供原生标题。</p></Section>
  </>
}
