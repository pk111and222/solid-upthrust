import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import basic from '../../../examples/popconfirm/basic.tsx?raw'
import locale from '../../../examples/popconfirm/locale.tsx?raw'
import placement from '../../../examples/popconfirm/placement.tsx?raw'
import dynamicTrigger from '../../../examples/popconfirm/dynamic-trigger.tsx?raw'
import asyncDemo from '../../../examples/popconfirm/async.tsx?raw'
import promise from '../../../examples/popconfirm/promise.tsx?raw'
import icon from '../../../examples/popconfirm/icon.tsx?raw'
import styleClass from '../../../examples/popconfirm/style-class.tsx?raw'
import popconfirmApi from './popconfirm-api.json'

export const meta: PageMeta = { title: 'Popconfirm 气泡确认框', description: '点击元素，弹出气泡式的确认框。', group: '组件', order: 188 }
export default function Page() {
  return <>
    <Section id="usage" title="使用方式"><p>目标元素的操作需要用户进一步的确认时，在目标元素附近弹出浮层提示，询问用户。和 Modal.confirm 弹出的全屏居中模态对话框相比，交互形式更轻量。</p><CodeBlock code={"import { Popconfirm } from 'upthrust-ui'"} /></Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="popconfirm/basic" title="基本" description="最简单的用法，支持确认标题和描述。" source={basic} />
      <Demo id="popconfirm/locale" title="自定义按钮" description="使用 okText / cancelText 自定义按钮文字，okType 设置确认按钮类型，showCancel=false 隐藏取消按钮。" source={locale} />
      <Demo id="popconfirm/placement" title="位置" description="位置有十二个方向。" source={placement} />
      <Demo id="popconfirm/dynamic-trigger" title="条件触发" description="可以判断是否需要弹出。" source={dynamicTrigger} />
      <Demo id="popconfirm/async" title="异步关闭" description="点击确定后异步关闭气泡确认框，例如提交表单。" source={asyncDemo} />
      <Demo id="popconfirm/promise" title="基于 Promise 的异步关闭" description="onConfirm 返回 Promise：resolve 后关闭，reject 时保持打开。" source={promise} />
      <Demo id="popconfirm/icon" title="自定义 Icon 图标" description="设置 icon 属性自定义提示图标，false 隐藏。" source={icon} />
      <Demo id="popconfirm/style-class" title="自定义语义结构的样式和类" description="通过 classNames 和 styles 传入对象 / 函数可以自定义 Popconfirm 的语义化结构样式。" source={styleClass} />
    </DemoGrid></Section>
    <Section id="popconfirm-api" title="API"><ApiTable rows={popconfirmApi} /></Section>
    <Section id="limits" title="约定与边界"><p>参考 <a href="https://ant.design/components/popconfirm-cn/">Ant Design Popconfirm 6.6.5</a> 的公开示例与源码：容器 12px 内边距、8px 圆角；警告色 ExclamationCircleFilled 图标 14px、右距 8px；只有标题时标题常规字重，有描述时 600 加粗，描述上距 4px；按钮右对齐、small、间距 8px；z-index 1060；确认按钮遵循 ActionButton 的 Promise 语义。</p><p>与 antd 的差异：浮层由本库 Trigger 定位（click / hover / focus / contextMenu，自动翻转与平移），箭头恒指向触发元素中心；ConfigProvider 只下发 okType / placement / trigger / arrow / 延迟等默认值；按钮文案不跟随 locale；RTL 未处理；不提供 _InternalPanelDoNotUseOrYouWillBeFired 调试面板。</p></Section>
  </>
}
