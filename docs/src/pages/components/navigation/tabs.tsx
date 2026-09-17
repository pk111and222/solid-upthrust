import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import api from './tabs-api.json'
import itemApi from './tabs-item-api.json'
import basicSource from '../../../examples/tabs/basic.tsx?raw'
import controlledSource from '../../../examples/tabs/controlled.tsx?raw'
import disabledSource from '../../../examples/tabs/disabled.tsx?raw'
import iconSource from '../../../examples/tabs/icon.tsx?raw'
import cardSource from '../../../examples/tabs/card.tsx?raw'
import positionSource from '../../../examples/tabs/position.tsx?raw'
import sizeSource from '../../../examples/tabs/size.tsx?raw'
import centeredSource from '../../../examples/tabs/centered.tsx?raw'
import destroyInactiveSource from '../../../examples/tabs/destroy-inactive.tsx?raw'
import editableSource from '../../../examples/tabs/editable.tsx?raw'
import refSource from '../../../examples/tabs/ref.tsx?raw'

export const meta: PageMeta = {
  title: 'Tabs 标签页',
  description: '选项卡切换组件；线条式带滑动指示条（ink bar），卡片式造型。',
  group: '组件',
  order: 150,
}

export default function Page() {
  return <>
    <Section id="usage" title="使用方式">
      <p>Tabs 通过 items 声明标签及对应面板内容；每项至少有 key、label，UI 层的 children 是该标签对应的面板内容。</p>
      <CodeBlock code={"import { Tabs } from 'upthrust-ui'"} />
      <p>默认 line 类型带滑动指示条（ink bar），随激活标签变化重新测量位置；card / editable-card 类型没有指示条，靠标签自身边框构成视觉结构，激活项会擦除朝向内容区一侧的边框以与面板视觉融合。</p>
    </Section>

    <Section id="examples" title="代码演示">
      <DemoGrid>
        <Demo id="tabs/basic" title="基本使用" description="非受控模式，默认选中第一个非禁用项。" source={basicSource} />
        <Demo id="tabs/controlled" title="受控模式" description="activeKey 由外部信号控制，onChange 只报告切换请求。" source={controlledSource} />
        <Demo id="tabs/disabled" title="禁用标签" description="禁用标签不可点击，键盘方向导航与 nextTab/prevTab 都会跳过。" source={disabledSource} />
        <Demo id="tabs/icon" title="带图标" description="icon 是可被 UnoCSS 静态扫描的图标类名。" source={iconSource} />
        <Demo id="tabs/card" title="卡片类型" description="card 类型无滑动指示条，标签自身边框构成结构。" source={cardSource} />
        <Demo id="tabs/size" title="尺寸" description="small / large 两档对照；middle 为默认值。" source={sizeSource} />
        <Demo id="tabs/centered" title="居中" description="标签栏在主轴上居中，不影响标签数量或宽度。" source={centeredSource} />
        <Demo id="tabs/destroy-inactive" title="懒渲染（destroyInactiveTabPane）" description="未激活面板整个不挂载，切走即销毁（状态丢失是预期行为）。" source={destroyInactiveSource} />
        <Demo id="tabs/editable" title="可编辑页签与拖拽排序" description="type='editable-card' 开启新增/关闭；draggable 开启拖拽或 Alt+方向键排序。" source={editableSource} />
        <Demo id="tabs/ref" title="ref 命令式控制" description="ref 暴露 activeKey()/setActiveKey()/nextTab()/prevTab()。" source={refSource} />
      </DemoGrid>
      <Demo id="tabs/position" title="四个位置" description="top（默认）/ bottom / left / right；卡片 + 左侧位置演示纵向排列。" source={positionSource} />
    </Section>

    <Section id="api" title="TabsProps API">
      <ApiTable rows={api} />
    </Section>
    <Section id="item-api" title="TabsItem API">
      <p>每个标签是数据对象，不是子组件；label 是纯文本（不支持 JSX），面板内容通过 children 传入。</p>
      <ApiTable rows={itemApi} />
    </Section>

    <Section id="keyboard" title="键盘与无障碍">
      <p>标签栏本身遵循 WAI-ARIA APG 的 tabs 模式：容器 <code>role="tablist"</code> 不占用独立的 Tab 停靠点（<code>tabindex=-1</code>），只有当前激活的标签是 Tab 键唯一停靠点（<code>tabindex=0</code>），其余标签 <code>tabindex=-1</code>。</p>
      <ul class="list-disc space-y-2 pl-5">
        <li>方向键（ArrowRight/ArrowDown 前进，ArrowLeft/ArrowUp 后退）在可用标签间循环切换 activeKey，并把 DOM 焦点跟随移动到新激活的标签，跳过禁用项；焦点已经在标签栏内时才会跟随，避免受控 activeKey 从页面其他地方更新时意外抢焦点。</li>
        <li>editable 模式下，聚焦某个标签后按 Delete 请求关闭该标签（等同点击关闭按钮）。</li>
        <li>draggable 模式下，Alt+ArrowLeft / Alt+ArrowRight 在不使用鼠标的情况下与相邻标签互换顺序。</li>
      </ul>
      <p>面板 <code>role="tabpanel"</code>；默认模式下非激活面板仍挂载但 <code>display: none</code> 隐藏，不会被无障碍工具读到。</p>
    </Section>

    <Section id="contracts" title="状态与支持边界">
      <p>不传 activeKey 时为非受控模式，defaultActiveKey 仅决定初次挂载的选中项（默认取第一个非禁用项）；传入 activeKey 后为受控模式，onChange 只报告切换请求，父层需更新 activeKey 才会改变实际选中项。</p>
      <p>items 归调用者所有：add/remove/reorder 都只通过 onEdit/onReorder 请求变更，组件不会直接修改传入的数组，也不在内部维持一份脱离 props 的影子列表——onReorder 触发后若父层未同步更新 items，下一次渲染会用父层的原始顺序覆盖临时排序结果。</p>
      <p>draggable 基于原生 HTML5 drag/drop API；触摸设备没有对应的拖拽手势支持，依赖 draggable 的排序在触摸设备上请提供 Alt+方向键之外的替代交互（例如上下移动按钮），本库不内置触摸拖拽回退。</p>
      <p>当前没有可关闭确认（关闭即立即请求，不等待用户确认对话框）、没有溢出滚动/更多菜单（标签数量超出容器宽度时不会自动出现滚动箭头或折叠菜单，需要调用者自行控制 items 数量或换行样式）。不承诺与其他组件库完全一致；请以本页公开类型与行为约定为准。</p>
    </Section>
  </>
}
