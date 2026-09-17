import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import api from './tooltip-api.json'
import basicSource from '../../../examples/tooltip/basic.tsx?raw'
import triggerSource from '../../../examples/tooltip/trigger.tsx?raw'
import controlledSource from '../../../examples/tooltip/controlled.tsx?raw'
import disabledDelaySource from '../../../examples/tooltip/disabled-delay.tsx?raw'
import styleSource from '../../../examples/tooltip/style.tsx?raw'
import containerSource from '../../../examples/tooltip/container.tsx?raw'
import refSource from '../../../examples/tooltip/ref.tsx?raw'
import placementSource from '../../../examples/tooltip/placement.tsx?raw'

export const meta: PageMeta = {
  title: 'Tooltip 文字提示',
  description: '简单的文字提示气泡，默认悬停触发、显示在上方。',
  group: '组件',
  order: 220,
}

export default function Page() {
  return <>
    <Section id="usage" title="使用方式">
      <p>Tooltip 用于给单个元素补充简短说明；不适合承载表单、按钮等交互控件（那属于 Popover/Popconfirm 的场景）。children 是必填的触发区域，title 是提示内容。</p>
      <CodeBlock code={"import { Tooltip } from 'upthrust-ui'"} />
      <p>浮层通过共享 createTrigger 定位，并根据实际 Portal 定位祖先转换坐标；页面或容器滚动时重新测量，视口空间不足时自动翻转到另一侧。默认使用 hover 触发、top 定位、100ms 打开/关闭延迟（对齐常见做法的 mouseEnterDelay/mouseLeaveDelay 默认值）。</p>
      <p>title 为 undefined、null、空字符串或 false 都视为空标题：不会打开浮层，即使强行调用 ref.setOpen(true) 也不会展示——这四种取值都等效于 disabled。数字 0 是有效标题。</p>
    </Section>

    <Section id="examples" title="代码演示">
      <DemoGrid>
        <Demo id="tooltip/basic" title="基本使用" description="默认悬停、显示在上方；title=false 等同空标题，不会弹出。" source={basicSource} />
        <Demo id="tooltip/trigger" title="触发方式" description="hover / click / focus / contextMenu 四种触发方式，一次只接受一种。" source={triggerSource} />
        <Demo id="tooltip/controlled" title="受控与 defaultOpen" description="外部按钮直接修改 open；defaultOpen 只影响非受控实例的首次挂载状态。" source={controlledSource} />
        <Demo id="tooltip/disabled-delay" title="禁用与延迟" description="动态切换 disabled；自定义 mouseEnterDelay/mouseLeaveDelay。" source={disabledDelaySource} />
        <Demo id="tooltip/style" title="自定义样式" description="class/style 作用于根容器；overlayClass/overlayStyle 单独控制浮层；title 也支持 JSX。" source={styleSource} />
        <Demo id="tooltip/container" title="局部主题与 getContainer" description="ConfigPortal 使浮层继续使用局部主题变量；getContainer 可以让浮层脱离局部主题挂到 body。" source={containerSource} />
        <Demo id="tooltip/ref" title="ref 命令式控制" description="ref 暴露 open()/setOpen(v)，可在非受控模式下手动控制显隐。" source={refSource} />
      </DemoGrid>
      <Demo id="tooltip/placement" title="十二种位置" description="按钮名称与提示文字对应 placement；空间不足时会调整实际位置。" source={placementSource} />
    </Section>

    <Section id="api" title="TooltipProps API">
      <ApiTable rows={api} />
    </Section>

    <Section id="placement" title="位置与样式">
      <p>TooltipPlacement 使用 TriggerPlacement 的十二种位置：topLeft、top、topRight、bottomLeft、bottom、bottomRight、leftTop、left、leftBottom、rightTop、right、rightBottom。默认 top；这是首选位置，视口空间不足时可能翻转或偏移，翻转后浮层箭头会跟随实际朝向重新计算。</p>
      <p>class/style 只影响触发区域根容器。浮层通过 Portal 渲染，使用 overlayClass/overlayStyle 定制；overlayStyle 合并在内部定位样式之后，可用于追加或覆盖 z-index 等字段，但不要覆盖 position、top、left、transform，否则需要自行负责定位。</p>
      <p>局部 ConfigProvider 的主题 CSS 变量可通过内部 ConfigPortal 延续到浮层，surface 控制背景，onSurface 控制文字。传入 getContainer 可以让浮层脱离最近主题作用域，挂载到指定容器（例如 document.body）。</p>
      <p>Tooltip 会读取 ConfigProvider 的 <code>components.Tooltip</code> 默认值，但仅限 trigger、placement 两项；显式 props 始终优先于该默认值，默认值优先于组件自身硬编码的 hover/top。size、disabled 等全局默认不会注入到 Tooltip。</p>
    </Section>

    <Section id="keyboard" title="键盘与无障碍">
      <p>浮层带 role="tooltip"。trigger="focus" 可配合 Tab 键让键盘用户不依赖鼠标查看提示；其余触发方式下键盘用户可通过聚焦触发元素后使用浏览器自身的焦点提示，Tooltip 本身不会主动抢占焦点或拦截 Tab 顺序。</p>
      <p>当前不会自动在触发元素上写入 aria-describedby 关联浮层文本；需要更强的无障碍关联时，请自行在 children 上补充该属性并指向浮层的可访问文本来源。</p>
    </Section>

    <Section id="contracts" title="状态与支持边界">
      <p>不传 open 时为非受控模式，defaultOpen 仅决定初次挂载状态；传入 open 后为受控模式，onOpenChange 只报告布尔开关请求，父层需更新 open 才会改变显示。</p>
      <p>disabled 默认 false，阻止用户发起开关请求；标题为空时等效禁用。若浮层已经处于打开状态后 disabled 才变为 true（包括标题变空的情形），浮层不会被强制关闭（继承自共享 Trigger 语义），但会立即隐藏，不会残留一个只有 padding 的空气泡；条件解除后无需用户重新触发即可恢复可见。</p>
      <p>浮层按需挂载，关闭后延迟销毁；短时间内重新打开可复用浮层 DOM，卸载 Tooltip 则结束该实例。延迟时间属于内部实现，不是可配置的 Tooltip 属性。</p>
      <p>Tooltip 不提供多行富文本编辑、表单控件承载或异步确认协议——这些场景请使用 Popover/Popconfirm。不承诺与其他组件库完全一致；请以本页公开类型与行为约定为准。</p>
    </Section>
  </>
}
