import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import basic from '../../../examples/empty/basic.tsx?raw'
import simple from '../../../examples/empty/simple.tsx?raw'
import customize from '../../../examples/empty/customize.tsx?raw'
import description from '../../../examples/empty/description.tsx?raw'
import semantic from '../../../examples/empty/semantic.tsx?raw'
import emptyApi from './empty-api.json'

export const meta: PageMeta = { title: 'Empty 空状态', description: '空状态时的展示占位图。', group: '组件', order: 166 }
export default function Page() {
  return <>
    <Section id="usage" title="使用方式"><p>当目前没有数据时，用于显式的用户提示；初始化场景时的引导创建流程。</p><CodeBlock code={"import { Empty } from 'upthrust-ui'"} /></Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="empty/basic" title="基本" description="简单的展示。" source={basic} />
      <Demo id="empty/simple" title="选择图片" description="可以通过设置 image 为 Empty.PRESENTED_IMAGE_SIMPLE 选择另一种风格的图片。" source={simple} />
      <Demo id="empty/customize" title="自定义" description="自定义图片链接、图片大小、描述、附属内容。" source={customize} />
      <Demo id="empty/description" title="无描述" description="无描述展示。" source={description} />
      <Demo id="empty/semantic" title="自定义语义结构的样式和类" description="通过 classNames 和 styles 自定义 root、image、description、footer 的样式。" source={semantic} />
    </DemoGrid></Section>
    <Section id="empty-api" title="API"><ApiTable rows={emptyApi} /></Section>
    <Section id="builtin-images" title="内置图片"><p>Empty.PRESENTED_IMAGE_SIMPLE 与 Empty.PRESENTED_IMAGE_DEFAULT，也可以用具名导出 PRESENTED_IMAGE_SIMPLE / PRESENTED_IMAGE_DEFAULT。它们是组件而不是节点（Solid 的 DOM 节点不能在多处复用），推荐直接传组件；写成 {'<PRESENTED_IMAGE_SIMPLE />'} 也能识别并切换为简洁样式。</p></Section>
    <Section id="limits" title="约定与边界"><p>参考 <a href="https://ant.design/components/empty-cn/">Ant Design Empty 6.6.5</a> 的公开示例与源码：插画路径一致；简洁插画时根节点纵向外边距 32px、图片高 40px、文字为描述色；默认图片高 100px、下边距 8px；只有 undefined / null / false / '' 视为空（0 仍渲染）。</p><p>与 antd 的差异：插画颜色用主题 token 混色代替 antd 预混实色，随明暗主题变化；image=false 不渲染图片区域是本库扩展；classNames / styles 不支持函数形式；未接入 ConfigProvider 的 renderEmpty（config-provider 示例未移植）与语言包，默认描述固定为「暂无数据」；RTL 未处理。</p></Section>
  </>
}
