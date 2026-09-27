import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import api from './splitter-api.json'
import basic from '../../../examples/splitter/basic.tsx?raw'
import control from '../../../examples/splitter/control.tsx?raw'
import vertical from '../../../examples/splitter/vertical.tsx?raw'
import collapsible from '../../../examples/splitter/collapsible.tsx?raw'
import collapsibleIcon from '../../../examples/splitter/collapsible-icon.tsx?raw'
import multiple from '../../../examples/splitter/multiple.tsx?raw'
import nested from '../../../examples/splitter/nested.tsx?raw'
import lazy from '../../../examples/splitter/lazy.tsx?raw'
import customize from '../../../examples/splitter/customize.tsx?raw'
import doubleClick from '../../../examples/splitter/double-click.tsx?raw'
import destroyOnHidden from '../../../examples/splitter/destroy-on-hidden.tsx?raw'

export const meta: PageMeta = { title: 'Splitter 分隔面板', description: '自由切分指定区域，拖拽、键盘或一键折叠调整相邻面板尺寸。', group: '组件', order: 125 }

const usage = `import Splitter, { Panel } from 'upthrust-ui/source/Splitter'
// 或从包入口导入：import { Splitter, Panel, type SplitterProps } from 'upthrust-ui'

<Splitter class="h-[200px]" onResizeEnd={sizes => console.log(sizes)}>
  <Panel defaultSize="40%" min="20%" max="70%">First</Panel>
  <Panel collapsible>Second</Panel>
</Splitter>`

export default function Page() {
  return <>
    <Section id="usage" title="使用方式">
      <p>可以水平或垂直地分隔区域；需要自由拖拽调整各区域大小、或按需折叠某个区域时使用。Splitter 默认占满父容器（w-full h-full），请给它或父容器一个确定的高度。</p>
      <p>Panel 也可以通过 <code>Splitter.Panel</code> 访问。面板按渲染顺序注册，条件渲染或列表渲染的面板会在出现 / 消失时自动加入或移出。</p>
      <CodeBlock code={usage} />
    </Section>
    <Section id="examples" title="代码演示">
      <DemoGrid>
        <Demo id="splitter/basic" title="基本用法" description="初始化面板大小与限制范围：第一个面板 40%，只能在 20% ~ 70% 之间拖动。" source={basic} />
        <Demo id="splitter/control" title="受控模式" description="size 受控时拖拽只经 onResize 通知，写回后生效；resizable={false} 禁止拖拽。" source={control} />
        <Demo id="splitter/vertical" title="垂直方向" description="orientation=&quot;vertical&quot;（或 vertical）上下排列。" source={vertical} />
        <Demo id="splitter/collapsible" title="可折叠" description="collapsible 在分隔条上显示折叠按钮；collapsible.motion 开启过渡动画；折叠后可再次点击或拖拽恢复。" source={collapsible} />
        <Demo id="splitter/collapsible-icon" title="自定义折叠图标" description="collapsible.icon 替换 start / end 两个方向的折叠按钮图标。" source={collapsibleIcon} />
        <Demo id="splitter/multiple" title="多面板" description="任意数量的面板；拖拽一条分隔条只影响它两侧的面板，总和始终保持不变。" source={multiple} />
        <Demo id="splitter/nested" title="复杂组合" description="Splitter 可以嵌套在 Panel 中，组合出复杂布局。" source={nested} />
        <Demo id="splitter/lazy" title="延迟渲染" description="lazy 模式下拖拽时只显示预览线，松开鼠标后才更新面板尺寸，适合面板内容渲染较重的场景。" source={lazy} />
        <Demo id="splitter/customize" title="自定义样式" description="draggerIcon 替换抓手；classNames / styles 的 dragger.active 只在拖拽中生效。" source={customize} />
        <Demo id="splitter/double-click" title="双击重置" description="onDraggerDoubleClick 拿到分隔条序号，把两侧面板恢复到初始尺寸。" source={doubleClick} />
        <Demo id="splitter/destroy-on-hidden" title="隐藏时销毁" description="destroyOnHidden：面板折叠时卸载内容，展开后重新挂载（计数递增）。" source={destroyOnHidden} />
      </DemoGrid>
    </Section>
    <Section id="api" title="API">
      <h3>Splitter</h3>
      <ApiTable rows={api.splitter} />
      <h3>Panel</h3>
      <ApiTable rows={api.panel} />
      <p>类型导出：<code>SplitterProps</code>、<code>SplitterPanelProps</code>、<code>SplitterSize</code>、<code>SplitterOrientation</code>、<code>SplitterCollapseType</code>、<code>SplitterCollapsibleIconMode</code>、<code>SplitterPanelCollapsible</code>、<code>SplitterCollapsibleConfig</code>、<code>SplitterClassNames</code>、<code>SplitterStyles</code>。Headless 状态机 <code>createSplitter</code> 及 <code>resolveSplitterSize</code>、<code>autoSplitterSizes</code>、<code>normalizeCollapsible</code>、<code>resolveSplitterOrientation</code> 由 <code>upthrust-competence</code> 导出。</p>
    </Section>
    <Section id="contracts" title="注意事项">
      <p><strong>尺寸语义：</strong>数字与纯数字字符串按 px，百分比按容器尺寸。容器尺寸指内容区，已扣除主轴方向的边框与内边距，所以给 Splitter 加边框不会让面板之和溢出。所有面板之和始终等于容器尺寸：未设置尺寸的面板平分剩余空间；全部面板都设置了尺寸但之和不等于容器、或已设置的尺寸之和已超出容器时，按比例缩放（后一种情况未设置的面板为 0），再按 min / max 修正。min / max 在拖拽与键盘调整中生效，折叠不受 min 限制。</p>
      <p><strong>容器尺寸变化：</strong>与 antd 一致，未拖拽过的 px 默认尺寸在容器变化时保持不变，由其余面板吸收差值；拖拽过之后按比例记录，容器变化时等比缩放。容器尺寸为 0（如被 display: none 隐藏）时保留上一次布局。</p>
      <p><strong>可访问性：</strong>可拖拽的分隔条是 role="separator" 的可聚焦元素，aria-valuenow / min / max 为前一个面板占容器的百分比（与 WAI-ARIA 窗口分隔条模式一致），aria-orientation 与分隔条方向一致。聚焦后方向键按 keyboardStep 调整，Home / End 推到两端（受 min / max 限制）。折叠按钮带“切换起始侧面板 / 切换末尾侧面板”的 aria-label。</p>
      <p><strong>拖拽细节：</strong>拖拽中覆盖整个视口的透明遮罩并锁定为调整光标，避免 iframe 或选中文字吞掉指针事件；仅响应主按钮；两次按下间隔小于 300ms 视为双击，不开始拖拽；拖拽中卸载组件会自动移除全局监听。</p>
      <p><strong>与 antd 的差异：</strong>aria 值使用百分比而不是 px；额外提供 keyboardStep 与 Home / End 键盘操作；折叠按钮的 aria-label 为中文。</p>
      <p><strong>暂不支持：</strong>RTL 方向（antd 在 RTL 下会翻转水平拖拽与折叠方向）；ConfigProvider 的 splitter 全局配置。</p>
    </Section>
  </>
}
