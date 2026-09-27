import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import api from './masonry-api.json'
import basic from '../../../examples/masonry/basic.tsx?raw'
import responsive from '../../../examples/masonry/responsive.tsx?raw'
import image from '../../../examples/masonry/image.tsx?raw'
import dynamic from '../../../examples/masonry/dynamic.tsx?raw'
import fresh from '../../../examples/masonry/fresh.tsx?raw'
import itemRender from '../../../examples/masonry/item-render.tsx?raw'
import layoutChange from '../../../examples/masonry/layout-change.tsx?raw'
import sequential from '../../../examples/masonry/sequential.tsx?raw'
import children from '../../../examples/masonry/children.tsx?raw'

export const meta: PageMeta = { title: 'Masonry 瀑布流', description: '把高度不一的内容依次放入最短的列，列数与间距支持响应式。', group: '组件', order: 126 }

const usage = `import Masonry from 'upthrust-ui/source/Masonry'
// 或从包入口导入：import { Masonry, type MasonryItem } from 'upthrust-ui'

<Masonry
  columns={{ xs: 1, sm: 2, md: 4 }}
  gutter={16}
  items={list.map(card => ({ key: card.id, data: card }))}
  itemRender={({ data }) => <Card {...data} />}
/>`

export default function Page() {
  return <>
    <Section id="usage" title="使用方式">
      <p>展示图片、卡片等高度不一的内容，希望节省纵向空间、避免网格留白时使用。每一项被放入当前最短的列；列宽相等，由列数与水平间距决定。</p>
      <p>首次测量前（包括服务端渲染）以等宽网格展示，浏览器测量完成后切换为绝对定位。容器尺寸变化、图片加载、数据或列数变化都会在下一帧重新测量，同一帧内的多次触发合并为一次。</p>
      <CodeBlock code={usage} />
    </Section>
    <Section id="examples" title="代码演示">
      <DemoGrid>
        <Demo id="masonry/basic" title="基本用法" description="items + itemRender：4 列、16px 间距。" source={basic} />
        <Demo id="masonry/responsive" title="响应式" description="columns 与 gutter 都可以按断点取值；调整窗口宽度查看列数与间距变化。" source={responsive} />
        <Demo id="masonry/image" title="图片" description="图片加载完成后自动重新排布（load / error 在捕获阶段监听），无需预先知道图片高度。" source={image} />
        <Demo id="masonry/dynamic" title="动态增删" description="新增项测量完成前保持透明，定位后淡入；已有项平滑移动到新位置。" source={dynamic} />
        <Demo id="masonry/fresh" title="内容尺寸变化" description="fresh 监听每一项自身的尺寸变化：点击卡片展开，其余卡片随之让位。" source={fresh} />
        <Demo id="masonry/item-render" title="所在列与固定列" description="itemRender 的 column 随布局变化；item.column 把某一项固定到指定列。" source={itemRender} />
        <Demo id="masonry/layout-change" title="布局回调" description="onLayoutChange 在全部项定位后、列分配变化时上报每一项所在的列。" source={layoutChange} />
        <Demo id="masonry/sequential" title="顺序分列" description="本库扩展 sequential：按阅读顺序均衡分列，与默认的最短列放置对比。" source={sequential} />
        <Demo id="masonry/children" title="子节点写法" description="不传 items 时，每个子节点就是一项；gutter 支持 small / middle / large。" source={children} />
      </DemoGrid>
    </Section>
    <Section id="api" title="API">
      <h3>Masonry</h3>
      <ApiTable rows={api.masonry} />
      <p>类型导出：<code>MasonryProps</code>、<code>MasonryItem</code>、<code>MasonryItemRenderInfo</code>、<code>MasonryLayoutItem</code>、<code>MasonryKey</code>、<code>MasonryColumns</code>、<code>MasonryGutter</code>、<code>MasonryGutterValue</code>。<code>createMasonry</code>、<code>computeMasonryLayout</code>、<code>sequentialColumns</code>、<code>resolveMasonryGutter</code> 与 <code>DEFAULT_MASONRY_COLUMNS</code> 由 <code>upthrust-competence</code> 导出，可用于自建瀑布流。</p>
    </Section>
    <Section id="contracts" title="注意事项">
      <p><strong>断点：</strong>与 Grid 共用 xs…xxl 媒体查询（BREAKPOINTS）。命中多个断点时取最宽的已定义值；一个都未命中时取 xs，再退回 1（与 antd 一致）。没有 matchMedia 的环境（SSR）按全部命中处理。</p>
      <p><strong>key：</strong>key 决定 DOM 复用与动画，必须稳定且唯一；不要用数组下标作为可增删列表的 key，否则删除项后内容会“串位”。</p>
      <p><strong>定位方式：</strong>测量后各项为 position: absolute，宽度与 left 通过 CSS 变量按列计算，根节点高度设为最高列。因此不要给根节点设置 display、固定高度或 overflow: hidden 之外的布局属性覆盖；项内容应随宽度自适应。</p>
      <p><strong>与 antd 的差异：</strong>额外提供 sequential 顺序分列与 children 写法；新增项在测量前透明，避免从原点飞入。</p>
      <p><strong>暂不支持：</strong>删除项的离场动画（删除后立即移除）；RTL 方向；虚拟滚动。</p>
    </Section>
  </>
}
