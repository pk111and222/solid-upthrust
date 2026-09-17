import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import api from './popover-api.json'
import basicSource from '../../../examples/popover/basic.tsx?raw'
import triggerSource from '../../../examples/popover/trigger.tsx?raw'
import controlledSource from '../../../examples/popover/controlled.tsx?raw'
import disabledSource from '../../../examples/popover/disabled.tsx?raw'
import styleSource from '../../../examples/popover/style.tsx?raw'
import containerSource from '../../../examples/popover/container.tsx?raw'
import placementSource from '../../../examples/popover/placement.tsx?raw'

export const meta: PageMeta = {
  title: 'Popover 气泡卡片',
  description: '点击/悬停浮出的卡片容器，可承载标题与任意内容。',
  group: '组件',
  order: 230,
}

export default function Page() {
  return <>
    <Section id="usage" title="使用方式">
      <p>Popover 用于在触发元素旁展示一张可以承载任意内容（包括按钮等交互控件）的卡片；这一点和 Tooltip 不同——Tooltip 只适合纯文本提示，不应嵌套交互元素。title、content 都是可选的，children 是必填的触发区域。</p>
      <CodeBlock code={"import { Popover } from 'upthrust-ui'"} />
      <p>浮层通过共享 createTrigger 定位，并根据实际 Portal 定位祖先转换坐标；页面或容器滚动时重新测量，视口空间不足时自动翻转到另一侧。默认使用 hover 触发、top 定位。</p>
      <p>title 和 content 都为 undefined、null、空字符串或 false 时视为空内容：不会打开浮层。这与 Tooltip 对空 title 的处理一致，避免弹出一张完全空白的卡片。</p>
    </Section>

    <Section id="examples" title="代码演示">
      <DemoGrid>
        <Demo id="popover/basic" title="基本使用" description="标题+内容、仅内容、title/content 都为空三种情形。" source={basicSource} />
        <Demo id="popover/trigger" title="触发方式" description="hover / click / focus / contextMenu 四种触发方式，一次只接受一种。" source={triggerSource} />
        <Demo id="popover/controlled" title="受控与 defaultOpen" description="外部按钮直接修改 open；defaultOpen 只影响非受控实例的首次挂载状态。" source={controlledSource} />
        <Demo id="popover/disabled" title="禁用" description="动态切换 disabled；disabled 为 true 时悬停/点击都不会打开。" source={disabledSource} />
        <Demo id="popover/style" title="自定义样式" description="class/style 作用于根容器；overlayClass/overlayStyle 单独控制浮层；content 支持任意 JSX，包括交互按钮。" source={styleSource} />
        <Demo id="popover/container" title="局部主题与 getContainer" description="ConfigPortal 使浮层继续使用局部主题变量；getContainer 可以让浮层脱离局部主题挂到 body。" source={containerSource} />
      </DemoGrid>
      <Demo id="popover/placement" title="十二种位置" description="按钮名称与卡片标题对应 placement；空间不足时会调整实际位置。" source={placementSource} />
    </Section>

    <Section id="api" title="PopoverProps API">
      <ApiTable rows={api} />
    </Section>

    <Section id="placement" title="位置与样式">
      <p>PopoverPlacement 使用 TriggerPlacement 的十二种位置：topLeft、top、topRight、bottomLeft、bottom、bottomRight、leftTop、left、leftBottom、rightTop、right、rightBottom。默认 top；这是首选位置，视口空间不足时可能翻转或偏移，翻转后浮层箭头会跟随实际朝向重新计算。</p>
      <p>class/style 只影响触发区域根容器。浮层通过 Portal 渲染，使用 overlayClass/overlayStyle 定制；overlayStyle 合并在内部定位样式之后，可用于追加或覆盖 z-index 等字段，但不要覆盖 position、top、left、transform，否则需要自行负责定位。</p>
      <p>局部 ConfigProvider 的主题 CSS 变量可通过内部 ConfigPortal 延续到浮层，surface 控制背景，onSurface 控制文字。传入 getContainer 可以让浮层脱离最近主题作用域，挂载到指定容器（例如 document.body）。</p>
      <p>Popover 会读取 ConfigProvider 的 <code>components.Popover</code> 默认值，但仅限 trigger、placement 两项；显式 props 始终优先于该默认值。size、disabled 等全局默认不会注入到 Popover。</p>
    </Section>

    <Section id="keyboard" title="键盘与无障碍">
      <p>浮层带 role="dialog"（区别于 Tooltip 的 role="tooltip"），因为卡片内容可以承载按钮等交互元素，ARIA tooltip 语义不允许这样做。trigger="focus" 可配合 Tab 键让键盘用户不依赖鼠标打开卡片。</p>
      <p>Popover 不会自动把焦点移入卡片或管理卡片内部的键盘导航——内容是任意的，交由使用者自行决定内部控件的 Tab 顺序；这与 Dropdown 的固定菜单列表（需要方向键在候选项间循环）不同。Escape 关闭、点击外部关闭由共享 Trigger 统一处理。</p>
    </Section>

    <Section id="contracts" title="状态与支持边界">
      <p>不传 open 时为非受控模式，defaultOpen 仅决定初次挂载状态；传入 open 后为受控模式，onOpenChange 只报告布尔开关请求，父层需更新 open 才会改变显示。</p>
      <p>disabled 默认 false，阻止用户发起开关请求；title 与 content 都为空时等效禁用。若浮层已经处于打开状态后 disabled 才变为 true（包括内容变空的情形），浮层不会被强制关闭（继承共享 Trigger 语义），但会立即隐藏，不会残留一张空卡片；条件解除后无需用户重新触发即可恢复可见。</p>
      <p>浮层按需挂载，关闭后延迟销毁；短时间内重新打开可复用浮层 DOM，卸载 Popover 则结束该实例。延迟时间属于内部实现，不是可配置的 Popover 属性。</p>
      <p>Popover 没有 mouseEnterDelay/mouseLeaveDelay 这类延迟配置——hover 打开是即时的（0ms），关闭沿用共享 Trigger 的 100ms 默认防抖；这与 Tooltip 显式对齐 antd 的 100ms 打开延迟不同，是两者的既有差异，不代表缺陷。没有 ref 实例、静态子组件或异步确认协议；不承诺与其他组件库完全一致。</p>
    </Section>
  </>
}
