import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import api from './grid-api.json'
import basic from '../../../examples/grid/basic.tsx?raw'
import gutter from '../../../examples/grid/gutter.tsx?raw'
import offset from '../../../examples/grid/offset.tsx?raw'
import sort from '../../../examples/grid/sort.tsx?raw'
import flex from '../../../examples/grid/flex.tsx?raw'
import align from '../../../examples/grid/align.tsx?raw'
import order from '../../../examples/grid/order.tsx?raw'
import flexStretch from '../../../examples/grid/flex-stretch.tsx?raw'
import responsive from '../../../examples/grid/responsive.tsx?raw'
import responsiveMore from '../../../examples/grid/responsive-more.tsx?raw'
import useBreakpoint from '../../../examples/grid/use-breakpoint.tsx?raw'
import playground from '../../../examples/grid/playground.tsx?raw'

export const meta: PageMeta = { title: 'Grid 栅格', description: '24 栅格系统，支持间距、偏移、排序、flex 与 7 档响应式断点。', group: '组件', order: 121 }

const usage = `import { Col, Row, useBreakpoint } from 'upthrust-ui/source/Grid'
// 或从包入口导入：import { Row, Col, Grid, useBreakpoint, type RowProps, type ColProps } from 'upthrust-ui'

<Row gutter={[16, { xs: 8, md: 16 }]} justify="space-between">
  <Col xs={24} md={12} lg={{ span: 8, offset: 2 }}>...</Col>
  <Col flex="auto">...</Col>
</Row>`

export default function Page() {
  return <>
    <Section id="usage" title="使用方式">
      <p>Grid 把一行划分为 24 等份：Row 是 flex 行容器，Col 按 span 占据其中若干份。布局以行（Row）为单位，内容放在列（Col）里，Row 的直接子元素只应是 Col。适合表单栅格、卡片列表、仪表盘等需要按比例分栏并随屏幕宽度调整的场景。</p>
      <CodeBlock code={usage} />
      <p><strong>断点：</strong>xs &lt; 576px，sm ≥ 576px，md ≥ 768px，lg ≥ 992px，xl ≥ 1200px，xxl ≥ 1600px，xxxl ≥ 1920px。Col 的断点属性编译为 min-width 媒体查询里的 CSS 变量，纯 CSS 生效（SSR 首屏即正确，无闪烁）；Row 的响应式 gutter/justify/align 以及 useBreakpoint 通过 matchMedia 计算。</p>
      <p><strong>与 Flex / Space 的区别：</strong>Grid 适合按比例分栏；Flex 适合一维对齐与排列；Space 适合行内元素的等距排列。</p>
    </Section>
    <Section id="examples" title="代码演示">
      <DemoGrid>
        <Demo id="grid/basic" title="基础栅格" description="span 决定占位格数，一行 24 格；四行分别是 1、2、3、4 等分。" source={basic} />
        <Demo id="grid/gutter" title="区块间隔" description="gutter 支持数字、响应式对象与 [水平, 垂直] 数组；间距写在列的内边距上，色块需放在列内部。" source={gutter} />
        <Demo id="grid/offset" title="左右偏移" description="offset 让列向右偏移若干格（margin-inline-start）。" source={offset} />
        <Demo id="grid/sort" title="栅格排序" description="push 向右、pull 向左移动，改变视觉顺序而不改变 DOM 顺序。" source={sort} />
        <Demo id="grid/flex" title="排版" description="justify 控制子元素在行内的水平分布，六种取值可切换对比。" source={flex} />
        <Demo id="grid/align" title="对齐" description="align 控制垂直方向对齐；不传时为 stretch，同一行的列等高。" source={align} />
        <Demo id="grid/order" title="排序" description="order 调整列顺序，也可以放在断点对象里按屏幕宽度变化。" source={order} />
        <Demo id="grid/flex-stretch" title="Flex 填充" description="Col 的 flex 支持比例、固定宽度、auto 与完整简写；wrap=false 的行里 flex 列不会被长内容撑破。" source={flexStretch} />
        <Demo id="grid/responsive" title="响应式布局" description="xs～xxxl 七档断点，缩放窗口查看各列宽度变化。" source={responsive} />
        <Demo id="grid/responsive-more" title="其他属性的响应式" description="断点值可以是 { span, offset, push, pull, order, flex } 对象；span 0 在该断点隐藏，更宽断点可恢复；Row 的 justify 也可响应式。" source={responsiveMore} />
        <Demo id="grid/use-breakpoint" title="useBreakpoint" description="获取当前命中的断点，用于在 JS 中按屏幕尺寸切换渲染。" source={useBreakpoint} />
        <Demo id="grid/playground" title="栅格配置器" description="拖动滑块调整水平/垂直间距与列数，下方同步显示对应代码。" source={playground} />
      </DemoGrid>
    </Section>
    <Section id="api" title="API">
      <h3>Row</h3>
      <ApiTable rows={api.row} />
      <h3>Col</h3>
      <ApiTable rows={api.col} />
      <h3>ColSize（断点对象）</h3>
      <ApiTable rows={api.colSize} />
      <h3>useBreakpoint</h3>
      <ApiTable rows={api.useBreakpoint} />
      <p>类型导出：<code>RowProps</code>、<code>ColProps</code>、<code>RowJustify</code>、<code>RowAlign</code>、<code>Gutter</code>、<code>GutterValue</code>、<code>ColSize</code>、<code>ColSpanType</code>、<code>ResponsiveValue</code>、<code>ScreenMap</code>。另导出 <code>Grid</code> 命名空间（<code>Grid.Row</code> / <code>Grid.Col</code> / <code>Grid.useBreakpoint</code>）。</p>
    </Section>
    <Section id="contracts" title="注意事项">
      <p><strong>Col 不再默认 24 格：</strong>旧实现中未传 span 的 Col 会占满整行；现与 antd 一致，未传 span 时宽度由内容或 flex 决定。需要整行时请显式写 span=24。</p>
      <p><strong>断点层叠：</strong>断点属性按 min-width 从窄到宽层叠，宽断点覆盖窄断点，未设置的断点继承更窄一档的值。xs 没有媒体查询，与基础属性合并并覆盖同名字段——因此 xs 的值在宽屏下仍然生效，除非更宽断点另行设置（与 antd 一致）。</p>
      <p><strong>Row 的响应式对象：</strong>gutter/justify/align 的对象形式取“已命中且定义了值的最宽断点”，未定义的断点沿用更窄一档；但 xs 只在 &lt; 576px 时命中，宽屏不会回落到 xs 的值（与 antd 一致，这一点与 Col 的 xs 不同）。例如 justify={'{{'} xs: 'center', md: 'end' {'}}'} 在 576～767px 之间为默认的 start。</p>
      <p><strong>0 值：</strong>基础属性里的 offset/push/pull/order 为 0 时不输出任何样式；断点对象里的 0 显式生效，用于覆盖更窄断点（offset 0 → 0，push/pull 0 → auto）。span 0 在任何层都表示隐藏。</p>
      <p><strong>间距实现：</strong>水平 gutter 写成 Row 的负外边距 + Col 的内边距，列的 class/背景色会覆盖到间距区域，所以示例把色块放在列内部。Row 外层若有 overflow 限制，负外边距可能产生横向滚动条，可给外层加 overflow-x-hidden 或 px。</p>
      <p><strong>嵌套：</strong>每个 Col 只在自己写了对应 CSS 变量时才挂消费它的类，嵌套的 Row/Col 不会继承外层列的变量。</p>
      <p><strong>类名合并：</strong>Row/Col 的 class 通过 mergeClass（认识主题 token 的 tailwind-merge）合并，可以用 class 覆盖默认类，例如在 Row 上写 flex-nowrap 或 justify-center。</p>
      <p><strong>SSR：</strong>服务端没有 matchMedia，useBreakpoint 返回空对象 {'{}'}；Row 的响应式 gutter/justify/align 在服务端取定义了值的最宽断点，水合后按真实宽度更新。Col 的断点完全由 CSS 负责，服务端输出即正确。</p>
      <p><strong>暂不支持：</strong>RTL 方向（push/pull/offset 使用 inline 逻辑属性，但未单独测试 RTL）、ConfigProvider 的栅格全局配置。</p>
    </Section>
  </>
}
