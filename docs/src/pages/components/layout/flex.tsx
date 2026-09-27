import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import api from './flex-api.json'
import basic from '../../../examples/flex/basic.tsx?raw'
import align from '../../../examples/flex/align.tsx?raw'
import gap from '../../../examples/flex/gap.tsx?raw'
import wrap from '../../../examples/flex/wrap.tsx?raw'
import combination from '../../../examples/flex/combination.tsx?raw'
import flexItem from '../../../examples/flex/flex-item.tsx?raw'
import element from '../../../examples/flex/element.tsx?raw'
import inlineEmpty from '../../../examples/flex/inline-empty.tsx?raw'

export const meta: PageMeta = { title: 'Flex 弹性布局', description: '弹性布局容器，用于对齐、排列与设置子元素间距。', group: '组件', order: 120 }

const usage = `import Flex from 'upthrust-ui/source/Flex'
// 或从包入口导入：import { Flex, type FlexProps } from 'upthrust-ui'

<Flex gap="middle" justify="space-between" align="center" wrap>
  <Button>取消</Button>
  <Button type="primary">提交</Button>
</Flex>`

export default function Page() {
  return <>
    <Section id="usage" title="使用方式">
      <p>Flex 是纯布局组件，只负责把 flex-direction、flex-wrap、justify-content、align-items、gap 与 flex 映射成样式，不带交互状态，也没有 headless 对应模块。适合需要设置元素之间对齐方式的场景，例如工具栏、表单操作区、卡片内部排布和页面级区块布局。</p>
      <CodeBlock code={usage} />
      <p><strong>与 Space 的区别：</strong>Space 会为每个子元素额外包一层容器，适合行内元素之间的等距排列（并支持分隔符 split、Space.Compact 紧凑模式）；Flex 不产生任何包裹层，子元素直接成为弹性项目，适合块级元素的布局，也能与子元素自身的 flex 属性配合。</p>
      <p>所有属性都是响应式的：传入 signal 时只更新变化的类名或内联样式，宿主元素不会重建。</p>
    </Section>
    <Section id="examples" title="代码演示">
      <DemoGrid>
        <Demo id="flex/basic" title="基本布局" description="默认横向排列；orientation 切换为纵向后，子元素沿主轴堆叠并在交叉轴拉伸。" source={basic} />
        <Demo id="flex/align" title="对齐方式" description="justify 控制主轴对齐，align 控制交叉轴对齐，baseline 按文字基线对齐不同高度的按钮。" source={align} minHeight={300} />
        <Demo id="flex/gap" title="设置间隙" description="small/middle/large 走主题间距 token；自定义数字按 px 写入内联样式。" source={gap} />
        <Demo id="flex/wrap" title="自动换行" description="wrap 支持布尔值与 flex-wrap 关键字，切换 nowrap 与 wrap-reverse 观察差异。" source={wrap} />
        <Demo id="flex/combination" title="组合使用" description="嵌套 Flex 完成卡片布局：外层两端对齐并可换行，内层纵向排列并用 flex 占满剩余宽度。" source={combination} />
        <Demo id="flex/flex-item" title="flex 属性" description="Flex 本身也可以作为弹性项目：flex={1} 占满剩余空间，字符串原样作为 flex 简写。" source={flexItem} />
        <Demo id="flex/element" title="语义元素与原生属性" description="component 渲染 ul/nav 或自定义组件；role、aria-*、data-*、事件与 ref 透传到宿主元素。" source={element} />
        <Demo id="flex/inline-empty" title="行内与空容器" description="inline 使用 inline-flex 融入文字行；没有子节点的 Flex 自动隐藏。" source={inlineEmpty} />
      </DemoGrid>
    </Section>
    <Section id="api" title="FlexProps API">
      <p>除下表中的布局属性外，其余原生 HTML 属性与事件都会透传到宿主元素。</p>
      <ApiTable rows={api} />
      <p>类型导出：<code>FlexProps</code>、<code>FlexOrientation</code>、<code>FlexWrap</code>、<code>FlexJustify</code>、<code>FlexAlign</code>、<code>FlexGap</code>，均可从组件目录或 <code>upthrust-ui</code> 包入口导入。</p>
    </Section>
    <Section id="contracts" title="注意事项">
      <p><strong>默认值：</strong>未传 wrap、justify、align、gap 时不输出对应类，完全沿用 CSS 初始值（nowrap、normal、normal、0）。因此纵向排列时子元素默认在交叉轴拉伸，与 antd 的 vertical 默认 stretch 效果一致。</p>
      <p><strong>空容器隐藏：</strong>与 antd 一致，容器带 <code>empty:hidden</code>，没有子节点时 display:none，不会留下边框或内边距占位。注意空白文本节点也算子节点。需要空容器保持占位时，可放入一个空元素或用 class 覆盖。</p>
      <p><strong>gap 与 class：</strong>预设 gap 通过主题类（gap-xs/gap-md/gap-lg）实现，twMerge 无法可靠识别这些主题类与 gap-4、gap-[3px] 等类的冲突，请用 gap 属性而不是 class 调整间距。自定义 gap 写在内联 style 中，优先级高于任何类名。</p>
      <p><strong>未设置 margin/padding 重置：</strong>antd 的 Flex 会重置 margin 与 padding；本组件不输出这两个重置，避免与调用方的 m-*、p-* 类产生顺序依赖。把 Flex 渲染成 ul 等自带默认边距的元素时，请自行添加 m-0 p-0 list-none。</p>
      <p><strong>取值校验：</strong>justify、align、wrap 只接受表中的关键字；TypeScript 会拦截其他值，运行时传入未知值时不会输出对应类（等同未设置）。orientation 传入未知值时回退到 vertical。</p>
      <p><strong>暂不支持：</strong>ConfigProvider 目前没有 flex 全局配置（antd 的 ConfigProvider flex.vertical/className/style），需要统一样式时请在调用处封装。</p>
    </Section>
  </>
}
