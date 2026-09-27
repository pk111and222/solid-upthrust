import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import basic from '../../../examples/badge/basic.tsx?raw'
import noWrapper from '../../../examples/badge/no-wrapper.tsx?raw'
import overflow from '../../../examples/badge/overflow.tsx?raw'
import dot from '../../../examples/badge/dot.tsx?raw'
import change from '../../../examples/badge/change.tsx?raw'
import link from '../../../examples/badge/link.tsx?raw'
import offset from '../../../examples/badge/offset.tsx?raw'
import size from '../../../examples/badge/size.tsx?raw'
import status from '../../../examples/badge/status.tsx?raw'
import colorful from '../../../examples/badge/colorful.tsx?raw'
import ribbon from '../../../examples/badge/ribbon.tsx?raw'
import title from '../../../examples/badge/title.tsx?raw'
import semantic from '../../../examples/badge/semantic.tsx?raw'
import badgeApi from './badge-badge-api.json'
import ribbonApi from './badge-ribbon-api.json'

export const meta: PageMeta = { title: 'Badge 徽标数', description: '图标右上角的圆形徽标数字、状态点与缎带。', group: '组件', order: 162 }
export default function Page() {
  return <>
    <Section id="usage" title="使用方式"><p>一般出现在通知图标或头像的右上角，用于显示需要处理的消息条数。BadgeRibbon 是独立具名导出，不提供 Badge.Ribbon 静态属性。</p><CodeBlock code={"import { Badge, BadgeRibbon } from 'upthrust-ui'"} /></Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="badge/basic" title="基本" description="简单的徽章展示，count 为 0 时默认隐藏，showZero 可显示；count 也可以是自定义节点。" source={basic} />
      <Demo id="badge/no-wrapper" title="独立使用" description="不包裹任何元素即独立使用，可自定义样式展现不同颜色；隐藏时不占位。" source={noWrapper} />
      <Demo id="badge/overflow" title="封顶数字" description="超过 overflowCount 显示为 ${overflowCount}+，默认 99。" source={overflow} />
      <Demo id="badge/dot" title="讨嫌的小红点" description="没有具体数字，只有一个小红点。" source={dot} />
      <Demo id="badge/change" title="动态" description="展示动态变化的效果：数字归零与红点关闭时缩放淡出。" source={change} />
      <Demo id="badge/link" title="可点击" description="用 a 标签包裹即可。" source={link} />
      <Demo id="badge/offset" title="自定义位置偏移" description="offset 为 [left, top]，左侧为默认位置对照。" source={offset} />
      <Demo id="badge/size" title="大小" description="middle（antd 名称 medium）高 20px，small 高 14px。" source={size} />
      <Demo id="badge/status" title="状态点" description="用于表示状态的小圆点，processing 带脉冲动画。" source={status} />
      <Demo id="badge/colorful" title="多彩徽标" description="13 个预设色板与任意 CSS 颜色。" source={colorful} />
      <Demo id="badge/ribbon" title="缎带" description="BadgeRibbon 支持预设色、自定义色与 start / end 方位，折角颜色随缎带变化。" source={ribbon} />
      <Demo id="badge/title" title="自定义标题" description="title 默认取 count，可自定义或用 false 移除。" source={title} />
      <Demo id="badge/semantic" title="自定义语义结构的样式和类" description="classNames / styles 定制 root、indicator；缎带另有 content。" source={semantic} />
    </DemoGrid></Section>
    <Section id="badge-api" title="Badge API"><ApiTable rows={badgeApi} /></Section>
    <Section id="ribbon-api" title="BadgeRibbon API"><ApiTable rows={ribbonApi} /></Section>
    <Section id="limits" title="约定与边界"><p>参考 <a href="https://ant.design/components/badge-cn/">Ant Design Badge 6.6.5</a> 的全部公开示例。显示逻辑逐项对照其源码：text 为 0 / '0' 时同样视为零值（未开 showZero 会隐藏徽标）；只有 color 且 count 为 0 时不绘制任何内容；数字徽标忽略 status 颜色，点与状态点使用 status。</p><p>与 antd 的差异：数字变化没有逐位滚动动画，仅在显示/隐藏时缩放淡出（独立使用时隐藏即移除）；独立使用的小红点不带 antd 的半个自身尺寸位移；classNames / styles 不支持函数形式；未接入 ConfigProvider；RTL 未处理。gray 为本库保留的扩展色。</p></Section>
  </>
}
