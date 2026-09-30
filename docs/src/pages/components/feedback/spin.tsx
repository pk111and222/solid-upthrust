import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import basic from '../../../examples/spin/basic.tsx?raw'
import size from '../../../examples/spin/size.tsx?raw'
import nested from '../../../examples/spin/nested.tsx?raw'
import tip from '../../../examples/spin/tip.tsx?raw'
import delay from '../../../examples/spin/delay-and-debounce.tsx?raw'
import customIndicator from '../../../examples/spin/custom-indicator.tsx?raw'
import percent from '../../../examples/spin/percent.tsx?raw'
import fullscreen from '../../../examples/spin/fullscreen.tsx?raw'
import styleClass from '../../../examples/spin/style-class.tsx?raw'
import spinApi from './spin-api.json'

export const meta: PageMeta = { title: 'Spin 加载中', description: '用于页面和区块的加载中状态。', group: '组件', order: 187 }
export default function Page() {
  return <>
    <Section id="usage" title="使用方式"><p>页面局部处于等待异步数据或正在渲染过程时，合适的加载动效会有效缓解用户的焦虑。</p><CodeBlock code={"import { Spin } from 'upthrust-ui'"} /></Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="spin/basic" title="基本用法" description="一个简单的 loading 状态。" source={basic} />
      <Demo id="spin/size" title="各种大小" description="小的用于文本加载，默认用于卡片容器级加载，大的用于页面级加载。" source={size} />
      <Demo id="spin/nested" title="卡片加载中" description="可以直接把内容内嵌到 Spin 中，将现有容器变为加载状态。" source={nested} />
      <Demo id="spin/tip" title="自定义描述文案" description="自定义描述文案。" source={tip} />
      <Demo id="spin/delay-and-debounce" title="延迟" description="延迟显示 loading 效果。当 spinning 状态在 delay 时间内结束，则不显示 loading 状态。" source={delay} />
      <Demo id="spin/custom-indicator" title="自定义指示符" description="使用自定义指示符。" source={customIndicator} />
      <Demo id="spin/percent" title="进度" description="展示进度，当设置 percent='auto' 时会预估一个永远不会停止的进度条。" source={percent} />
      <Demo id="spin/fullscreen" title="全屏" description="fullscreen 属性非常适合创建流畅的页面加载器。它添加了半透明覆盖层，并在其中心放置了一个旋转加载符号。" source={fullscreen} />
      <Demo id="spin/style-class" title="自定义语义结构的样式和类" description="通过 classNames 和 styles 传入对象 / 函数可以自定义 Spin 的语义化结构样式。" source={styleClass} />
    </DemoGrid></Section>
    <Section id="spin-api" title="API"><ApiTable rows={spinApi} /></Section>
    <Section id="limits" title="约定与边界"><p>参考 <a href="https://ant.design/components/spin-cn/">Ant Design Spin 6.6.5</a> 的公开示例与源码：四点方阵指示器（45° 起转 1.2s、点 opacity 0.3 ↔ 1 交替）、尺寸 14 / 20 / 32px、section 12px 间距、嵌套容器 0.5 透明 + 40% 白色蒙层、全屏 45% 黑色遮罩与 100×100 进度环几何与 antd 一致。</p><p>与 antd 的差异：size 使用本库的 'middle'（antd 为 'medium'）；ConfigProvider 只下发 size / description / delay / indicator 等默认值，不含 className / style；RTL 未处理；Solid 无 cloneElement，自定义 indicator 由外层 span 承载 size 字号与 indicator 语义类，percent 不会注入到自定义节点。</p></Section>
  </>
}
