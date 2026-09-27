import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import basic from '../../../examples/timeline/basic.tsx?raw'
import variant from '../../../examples/timeline/variant.tsx?raw'
import pending from '../../../examples/timeline/pending.tsx?raw'
import pendingLegacy from '../../../examples/timeline/pending-legacy.tsx?raw'
import alternate from '../../../examples/timeline/alternate.tsx?raw'
import horizontal from '../../../examples/timeline/horizontal.tsx?raw'
import custom from '../../../examples/timeline/custom.tsx?raw'
import end from '../../../examples/timeline/end.tsx?raw'
import title from '../../../examples/timeline/title.tsx?raw'
import titleSpan from '../../../examples/timeline/title-span.tsx?raw'
import semantic from '../../../examples/timeline/semantic.tsx?raw'
import styleClass from '../../../examples/timeline/style-class.tsx?raw'
import timelineApi from './timeline-api.json'
import itemApi from './timeline-item-api.json'

export const meta: PageMeta = { title: 'Timeline 时间轴', description: '垂直或水平展示的时间流信息。', group: '组件', order: 168 }
export default function Page() {
  return <>
    <Section id="usage" title="使用方式"><p>当有一系列信息需按时间排列时（正序和倒序），或需要有一条时间轴进行视觉上的串联时使用。节点通过 items 配置。</p><CodeBlock code={"import { Timeline } from 'upthrust-ui'"} /></Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="timeline/basic" title="基本用法" description="基本的时间轴。" source={basic} />
      <Demo id="timeline/variant" title="变体样式" description="通过 variant 设置时间轴的样式。" source={variant} />
      <Demo id="timeline/pending" title="等待中及排序" description="节点支持 loading 属性表示加载，reverse 属性用于控制节点排序。" source={pending} />
      <Demo id="timeline/pending-legacy" title="等待中（废弃写法）" description="pending 在末尾追加加载节点，pendingDot 替换其图标。已废弃，请改用 loading。" source={pendingLegacy} />
      <Demo id="timeline/alternate" title="交替展现" description="内容在时间轴两侧轮流出现。" source={alternate} />
      <Demo id="timeline/horizontal" title="水平布局" description="水平方向的时间线。" source={horizontal} />
      <Demo id="timeline/custom" title="自定义时间轴点" description="可以设置为图标或其他自定义元素。" source={custom} />
      <Demo id="timeline/end" title="另一侧时间轴点" description="时间轴点可以在另一侧。" source={end} />
      <Demo id="timeline/title" title="标签" description="使用 title 标签单独展示时间。" source={title} />
      <Demo id="timeline/title-span" title="标题占比" description="使用 titleSpan 设置标题占比空间。" source={titleSpan} />
      <Demo id="timeline/semantic" title="语义化结构" description="通过语义化结构，可以实现更丰富的定制样式。" source={semantic} />
      <Demo id="timeline/style-class" title="自定义语义结构的样式和类" description="通过 classNames 和 styles 传入对象 / 函数可以自定义 Timeline 的语义化结构样式。" source={styleClass} />
    </DemoGrid></Section>
    <Section id="timeline-api" title="Timeline API"><ApiTable rows={timelineApi} /></Section>
    <Section id="item-api" title="Items"><ApiTable rows={itemApi} /></Section>
    <Section id="limits" title="约定与边界"><p>参考 <a href="https://ant.design/components/timeline-cn/">Ant Design Timeline 6</a> 的全部公开示例，布局尺寸逐项对照实测 DOM：圆点 10×10、导轨 2px、纵向节点最小高 48px；纵向含 title 或交替模式时圆点与导轨定位到 titleSpan；横向交替模式的标题与内容上下错开。</p><p>与 antd 的差异：Timeline.Item 子元素写法不渲染（Solid 无法读取子元素 props，请使用 items）；进行中节点之后的导轨实测为实线，保持实线；未接入 ConfigProvider；RTL 未处理。</p></Section>
  </>
}
