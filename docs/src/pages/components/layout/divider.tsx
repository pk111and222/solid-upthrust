import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import api from './divider-api.json'
import horizontal from '../../../examples/divider/horizontal.tsx?raw'
import withText from '../../../examples/divider/with-text.tsx?raw'
import orientationMargin from '../../../examples/divider/orientation-margin.tsx?raw'
import size from '../../../examples/divider/size.tsx?raw'
import plain from '../../../examples/divider/plain.tsx?raw'
import vertical from '../../../examples/divider/vertical.tsx?raw'
import semantic from '../../../examples/divider/semantic.tsx?raw'

export const meta: PageMeta = { title: 'Divider 分割线', description: '区隔内容的分割线，支持标题、线型、间距与垂直方向。', group: '组件', order: 123 }

const usage = `import Divider from 'upthrust-ui/source/Divider'
// 或从包入口导入：import { Divider, type DividerProps } from 'upthrust-ui'

<Divider />
<Divider titlePlacement="start" variant="dashed">基本信息</Divider>
<a>编辑</a><Divider orientation="vertical" /><a>删除</a>`

export default function Page() {
  return <>
    <Section id="usage" title="使用方式">
      <p>Divider 用于对不同章节的文本段落进行分割，或对行内文字/链接进行分割（例如表格的操作列）。它是纯展示组件，不带交互状态。</p>
      <CodeBlock code={usage} />
    </Section>
    <Section id="examples" title="代码演示">
      <DemoGrid>
        <Demo id="divider/horizontal" title="水平分割线" description="默认为水平实线，variant 切换为虚线或点线。" source={horizontal} />
        <Demo id="divider/with-text" title="带文字的分割线" description="titlePlacement 指定标题位置：start、center（默认）、end。" source={withText} />
        <Demo id="divider/orientation-margin" title="标题边距" description="orientationMargin 设置标题与靠近一侧的距离，支持数字（px）与百分比。" source={orientationMargin} />
        <Demo id="divider/size" title="设置间距大小" description="size 控制水平分割线的上下间距：small 8px、middle 16px、large 24px。" source={size} />
        <Demo id="divider/plain" title="正文样式标题" description="plain 让标题使用正文字号与常规字重。" source={plain} />
        <Demo id="divider/vertical" title="垂直分割线" description="orientation='vertical' 渲染行内的垂直分割线，高度 0.9em。" source={vertical} />
        <Demo id="divider/semantic" title="自定义样式" description="class/style 定制根节点，classNames/styles 定制 rail 与 content；class='my-0' 可以去掉默认间距。" source={semantic} />
      </DemoGrid>
    </Section>
    <Section id="api" title="DividerProps API">
      <ApiTable rows={api} />
      <p>类型导出：<code>DividerProps</code>、<code>DividerOrientation</code>、<code>DividerTitlePlacement</code>、<code>DividerVariant</code>、<code>DividerSize</code>、<code>DividerSemanticName</code>。</p>
    </Section>
    <Section id="contracts" title="注意事项">
      <p><strong>旧 API 兼容：</strong>type='vertical'、dashed、orientation='left'/'right'/'center' 均继续可用，并分别映射到 orientation、variant、titlePlacement。新旧写法同时出现时以新写法为准。</p>
      <p><strong>线的绘制：</strong>无标题时根节点自身画 1px 顶边；带标题时根节点不画线，标题两侧的 rail 各画一段——标题靠边时靠近的一侧为 5% 短线，设置 orientationMargin 后该侧线段收为 0，改由标题外边距留白。</p>
      <p><strong>颜色：</strong>线色为 outline-variant token 的 40% 透明度，随明暗主题切换。与 antd 一致，标题两侧的 rail 继承根节点的 border-color，所以 class='border-primary' 或 style={'{{'} 'border-color': … {'}}'} 对带标题与不带标题的分割线同样生效；只改 rail 时用 classNames.rail。线宽不继承：带标题时请用 styles.rail 调整粗细。</p>
      <p><strong>类名合并：</strong>class 通过 mergeClass 合并，认识主题间距 token，所以 my-0、my-xs 等可以正确覆盖默认的 my-lg；旧实现中标题的 text-body 会被误判为文字颜色而丢失，现已修复。</p>
      <p><strong>垂直分割线：</strong>行内 inline-block，高度 0.9em、左右 8px；不渲染标题，size 不影响它。</p>
      <p><strong>暂不支持：</strong>ConfigProvider 的 divider 全局配置。</p>
    </Section>
  </>
}
