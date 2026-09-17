import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import api from './dropdown-api.json'
import menuApi from './dropdown-menu-api.json'
import itemApi from './dropdown-item-api.json'
import basicSource from '../../../examples/dropdown/basic.tsx?raw'
import clickSource from '../../../examples/dropdown/click.tsx?raw'
import contextMenuSource from '../../../examples/dropdown/context-menu.tsx?raw'
import controlledSource from '../../../examples/dropdown/controlled.tsx?raw'
import disabledSource from '../../../examples/dropdown/disabled.tsx?raw'
import placementSource from '../../../examples/dropdown/placement.tsx?raw'
import styleSource from '../../../examples/dropdown/style.tsx?raw'
import themeSource from '../../../examples/dropdown/theme.tsx?raw'
import dynamicSource from '../../../examples/dropdown/dynamic.tsx?raw'
import lifecycleSource from '../../../examples/dropdown/lifecycle.tsx?raw'
import scrollSource from '../../../examples/dropdown/scroll.tsx?raw'

export const meta: PageMeta = {
  title: 'Dropdown 下拉菜单',
  description: '将一组操作收纳在悬停、点击或右键触发的浮层菜单中。',
  group: '组件',
  order: 140,
}

export default function Page() {
  return <>
    <Section id="usage" title="使用方式">
      <p>Dropdown 适用于编辑、复制、删除等离散操作。menu 与 children 都是必填项：menu 描述操作列表，children 提供触发区域。建议使用可聚焦的 Button 作为触发器，而不是只有鼠标可操作的文本或容器。</p>
      <CodeBlock code={"import { Button, Dropdown } from 'upthrust-ui'"} />
      <p>菜单通过共享 createTrigger 定位，并根据实际 Portal 定位祖先转换坐标；页面或容器滚动时重新测量。默认使用 hover 触发、bottomLeft 定位。点击和右键分别设置 trigger="click"、trigger="contextMenu"；一次只接受一种触发方式。右键菜单锚定触发元素，不以鼠标坐标为位置。</p>
    </Section>

    <Section id="examples" title="代码演示">
      <DemoGrid>
        <Demo id="dropdown/basic" title="默认悬停" description="图标、分隔线与危险项；选择后输出对应 key。悬停打开不夺取当前焦点。" source={basicSource} />
        <Demo id="dropdown/click" title="点击与回调顺序" description="跳过禁用项与分隔线；依次记录 item、menu 和关闭请求。" source={clickSource} />
        <Demo id="dropdown/context-menu" title="右键菜单" description="在按钮上点击右键，菜单仍锚定按钮而非鼠标位置。" source={contextMenuSource} />
        <Demo id="dropdown/controlled" title="受控开关" description="外部按钮直接修改 open；用户请求由 onOpenChange 接收并回写。disabled 不覆盖父层受控值。" source={controlledSource} />
        <Demo id="dropdown/disabled" title="触发器与菜单项禁用" description="动态切换 Dropdown.disabled，并对照普通、禁用、危险、危险且禁用四种菜单项。" source={disabledSource} />
        <Demo id="dropdown/style" title="自定义样式" description="class/style 作用于根容器；overlayClass/overlayStyle 单独控制菜单浮层。label 也支持 JSX。" source={styleSource} />
        <Demo id="dropdown/theme" title="局部主题" description="ConfigProvider 设置 surface/onSurface；ConfigPortal 使浮层继续使用局部主题变量。切换主题后可重新打开菜单观察。" source={themeSource} />
        <Demo id="dropdown/dynamic" title="动态与空列表" description="将 A/B 替换成 C/D，关闭后重新打开仍可选择；同时展示空列表与全禁用列表。" source={dynamicSource} />
        <Demo id="dropdown/lifecycle" title="默认打开与生命周期" description="点击后才挂载 defaultOpen 实例，避免页面初始出现多个浮层；关闭后立即重开可观察延迟销毁期间的复用。" source={lifecycleSource} />
        <Demo id="dropdown/scroll" title="滚动容器与 Portal" description="在可纵向滚动的容器中打开菜单，观察滚动重定位及局部主题继承。" source={scrollSource} />
      </DemoGrid>
      <Demo id="dropdown/placement" title="十二种位置" description="按钮名称与菜单文字对应 placement；菜单使用相同宽高。空间不足时会调整实际位置，几何对照应在触发器周围留足视口空间。" source={placementSource} />
    </Section>

    <Section id="api" title="DropdownProps API">
      <p>以下属性属于 Dropdown 本身。菜单配置与菜单项是数据对象，不是子组件，分别见后面的独立 API 表。</p>
      <ApiTable rows={api} />
    </Section>
    <Section id="menu-api" title="DropdownMenuProps API">
      <p>通过 menu 传入。items 必填，onClick 接收被激活菜单项的字符串 key；不要直接套用 Menu 组件的配置。</p>
      <ApiTable rows={menuApi} />
    </Section>
    <Section id="item-api" title="DropdownMenuItem API">
      <p>每项包含 key 与 label。图标使用类名；分隔线同样提供 key 和空 label，但不触发回调。</p>
      <ApiTable rows={itemApi} />
    </Section>

    <Section id="placement" title="位置与样式">
      <p>DropdownPlacement 使用 TriggerPlacement 的十二种位置：topLeft、top、topRight、bottomLeft、bottom、bottomRight、leftTop、left、leftBottom、rightTop、right、rightBottom。默认 bottomLeft；这是首选位置，视口空间不足时可能翻转或偏移。</p>
      <p>class/style 只影响触发区域根容器。菜单通过 Portal 渲染，使用 overlayClass/overlayStyle 定制；overlayStyle 合并在内部定位样式之后，避免覆盖 position、top、left 等字段而破坏定位。UnoCSS 工具类及 icon 类名需要出现在可扫描的静态源码中。</p>
      <p>局部 ConfigProvider 的主题 CSS 变量可通过内部 ConfigPortal 延续到浮层，surface 控制背景，onSurface 控制普通文字。Dropdown 不读取 ConfigProvider 的 components、componentSize、componentDisabled 默认值；children 中的 Button 仍遵循 Button 自身的配置规则。</p>
    </Section>

    <Section id="keyboard" title="键盘与焦点">
      <p>建议 children 使用可聚焦的 Button。点击或右键打开后，焦点进入第一个可用项；hover 打开不夺取当前焦点。聚焦触发器后可使用键盘主动打开菜单，不必依赖鼠标。</p>
      <ul class="list-disc space-y-2 pl-5">
        <li>触发器上按 ArrowDown 打开菜单并聚焦第一个可用项，ArrowUp 打开并聚焦最后一个可用项；hover / contextMenu 模式也可在触发器上按 Enter 或 Space 打开菜单。</li>
        <li>菜单内使用 ArrowDown / ArrowUp 在可用项之间循环，跳过 disabled 项与分隔线。</li>
        <li>Enter 或 Space 激活当前项，依次执行该项 onClick、menu.onClick(key) 和关闭请求。</li>
        <li>Tab 在菜单内向前循环，Shift+Tab 反向循环；没有可用项时不将焦点锁在空列表中。</li>
        <li>Escape 请求关闭菜单；受控模式需父层接受关闭请求。关闭时，只有打开前的焦点元素仍连接在 DOM 中，且当前焦点仍在菜单内或 body 上，才归还原焦点。已移到外部输入框等控件的焦点不会被抢回。</li>
      </ul>
      <p>标签可使用 JSX 展示图标或文字，但不要嵌套按钮、输入框等独立交互控件，以免与菜单自身的键盘规则冲突。</p>
    </Section>

    <Section id="contracts" title="状态与支持边界">
      <p>不传 open 时为非受控模式，defaultOpen 仅决定初次挂载状态；传入 open 后为受控模式，onOpenChange 只报告布尔开关请求，父层需更新 open 才会改变显示。父层直接赋值本身不会触发此回调；点击外部控制按钮也可能产生独立的外部点击关闭请求。</p>
      <p>Dropdown.disabled 默认 false，阻止用户发起开关请求，但不强制将父层 open 设为 false，也不会替 children 自动设置原生 disabled。菜单项的 disabled 则控制该项是否可选；danger 只改变视觉，不放宽禁用规则。</p>
      <p>启用项的回调顺序固定为 item.onClick() → menu.onClick(key) → 关闭请求。分隔线和禁用项不参与选择。空列表与全禁用列表没有可用操作，仍应允许用户离开或关闭菜单。</p>
      <p>浮层按需挂载，关闭后延迟销毁；短时间内重新打开可复用浮层 DOM，卸载 Dropdown 则结束该实例。延迟时间属于内部实现，不是可配置的 Dropdown 属性。</p>
      <p>当前没有 ref 实例、静态子组件、size、getContainer、arrow 或 focus 触发 API，不提供多级菜单、选中状态或异步确认协议。不承诺与 Ant Design 等其他组件库完全一致；请以本页公开类型与行为约定为准。</p>
    </Section>
    <Section id="legacy-headless" title="旧版 headless 兼容模块">
      <p>upthrust-competence 仍导出已标记 deprecated 的 createDropdown 模块，仅为旧调用保留兼容。当前 Dropdown UI 不使用它，而是使用 createTrigger；两者不是同一套定位能力。</p>
      <p>旧 createDropdown 仅支持六种位置：topLeft、top、topRight、bottomLeft、bottom、bottomRight，通过 inline 内联样式的绝对定位与百分比偏移布局。不支持当前 Trigger 的视口翻转或 Portal 定位，不能套用本页 Dropdown UI 的十二位置与浮层能力说明。</p>
    </Section>
  </>
}
