import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import api from './space-api.json'
import base from '../../../examples/space/base.tsx?raw'
import vertical from '../../../examples/space/vertical.tsx?raw'
import size from '../../../examples/space/size.tsx?raw'
import align from '../../../examples/space/align.tsx?raw'
import wrap from '../../../examples/space/wrap.tsx?raw'
import separator from '../../../examples/space/separator.tsx?raw'
import compact from '../../../examples/space/compact.tsx?raw'
import compactButtons from '../../../examples/space/compact-buttons.tsx?raw'
import compactVertical from '../../../examples/space/compact-vertical.tsx?raw'
import addon from '../../../examples/space/addon.tsx?raw'
import semantic from '../../../examples/space/semantic.tsx?raw'
import block from '../../../examples/space/block.tsx?raw'

export const meta: PageMeta = { title: 'Space 间距', description: '设置组件之间的间距，以及紧凑组合 Space.Compact。', group: '组件', order: 122 }

const usage = `import Space from 'upthrust-ui/source/Space'
// 或从包入口导入：import { Space, Compact, SpaceAddon, type SpaceProps } from 'upthrust-ui'

<Space size="middle" separator={<Divider orientation="vertical" />}>
  <a>编辑</a>
  <a>删除</a>
</Space>

<Space.Compact>
  <Input placeholder="搜索" />
  <Button type="primary">搜索</Button>
</Space.Compact>`

export default function Page() {
  return <>
    <Section id="usage" title="使用方式">
      <p>Space 为每个子元素包一层容器并统一设置间距，避免组件紧贴在一起；Space.Compact 让按钮、输入框、选择器等表单控件首尾相接，合并相邻边框与圆角。适合操作按钮组、行内链接、筛选条件等场景。</p>
      <CodeBlock code={usage} />
      <p><strong>与 Flex 的区别：</strong>Space 为每个子元素额外包一层 div，适合行内元素之间的等距排列，并提供分隔符与紧凑模式；Flex 不产生包裹层，适合块级元素的布局。</p>
    </Section>
    <Section id="examples" title="代码演示">
      <DemoGrid>
        <Demo id="space/base" title="基本用法" description="相邻组件水平排列，默认间距 8px；false/null/空串不产生子项，数字 0 正常渲染。" source={base} />
        <Demo id="space/vertical" title="垂直间距" description="orientation='vertical' 纵向排列，子项默认在交叉轴拉伸。" source={vertical} />
        <Demo id="space/size" title="间距大小" description="small/middle/large 三档预设，也可以切换到自定义拖动数值。" source={size} />
        <Demo id="space/align" title="对齐" description="start/center/end/baseline 四种交叉轴对齐。" source={align} />
        <Demo id="space/wrap" title="自动换行" description="wrap 自动换行，size=[8, 16] 分别设置水平与换行后的垂直间距。" source={wrap} />
        <Demo id="space/separator" title="分隔符" description="separator 在相邻子项之间插入分隔内容；旧名称 split 仍可使用。" source={separator} />
        <Demo id="space/compact" title="紧凑布局组合" description="Space.Compact 让输入框、选择器与按钮首尾相接；block 撑满父容器。" source={compact} />
        <Demo id="space/compact-buttons" title="按钮组合" description="用 Compact 拼接按钮组；只有一个子元素时保留全部圆角。" source={compactButtons} />
        <Demo id="space/compact-vertical" title="垂直方向紧凑布局" description="orientation='vertical' 的 Compact 去掉上下相邻的圆角并合并边框。" source={compactVertical} />
        <Demo id="space/addon" title="组合文本单元" description="Space.Addon 渲染 URL 前缀、单位等文本单元，与输入框、按钮拼接。" source={addon} />
        <Demo id="space/semantic" title="语义化定制" description="classNames / styles 分别定制 root、item、separator 三个节点。" source={semantic} />
        <Demo id="space/block" title="撑满宽度" description="block 让容器变为 display:flex + width:100%，纵向排列时子项随容器宽度。" source={block} />
      </DemoGrid>
    </Section>
    <Section id="api" title="API">
      <h3>Space</h3>
      <ApiTable rows={api.space} />
      <h3>Space.Compact</h3>
      <ApiTable rows={api.compact} />
      <h3>Space.Addon</h3>
      <ApiTable rows={api.addon} />
      <p>类型导出：<code>SpaceProps</code>、<code>SpaceSize</code>、<code>SpacePresetSize</code>、<code>SpaceAlign</code>、<code>SpaceOrientation</code>、<code>SpaceSemanticName</code>、<code>SpaceCompactProps</code>（旧名 <code>CompactProps</code>）、<code>SpaceAddonProps</code>。<code>Space.Compact</code> 与 <code>Space.Addon</code> 也以 <code>Compact</code>、<code>SpaceAddon</code> 从包入口具名导出。</p>
    </Section>
    <Section id="contracts" title="注意事项">
      <p><strong>子项过滤：</strong>与 antd 一致，null、undefined、布尔值与空字符串不产生子项（也不产生多余的分隔符）；数字 0 会渲染。没有可渲染子项时整个 Space 不输出 DOM。</p>
      <p><strong>空子项隐藏：</strong>子项包裹层带 <code>empty:hidden</code>，子组件内部渲染为空时包裹层不占间距。</p>
      <p><strong>预设间距与 class：</strong>预设档位由 gap-xs/gap-md/gap-lg 主题类实现，自定义值写内联 gap（优先级高于类名）。容器 class 通过 mergeClass 合并，gap-4 这类数值类可以正确覆盖预设档位。</p>
      <p><strong>Compact 的实现：</strong>通过子选择器处理直接子元素：水平时首项去右侧圆角、末项去左侧圆角（纵向时为下侧/上侧）、中间项全部去圆角（!important 覆盖子元素自身圆角），相邻项 -1px 重叠合并边框，悬停/聚焦的子元素 z-index:1 提升，确保高亮边框完整显示。子元素必须是自身带边框的元素（Input、Select、Button、Space.Addon 等）；包在额外的 div 里时圆角与边框不会被处理。</p>
      <p><strong>暂不支持：</strong>antd 中 Space.Compact 的 size 会通过 context 传给子控件，这里不支持，请在各子控件上分别设置 size；ConfigProvider 的 space 全局配置也暂不支持。</p>
    </Section>
  </>
}
