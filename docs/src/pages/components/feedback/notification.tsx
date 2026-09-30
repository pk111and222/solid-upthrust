import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import hooks from '../../../examples/notification/hooks.tsx?raw'
import basic from '../../../examples/notification/basic.tsx?raw'
import duration from '../../../examples/notification/duration.tsx?raw'
import withIcon from '../../../examples/notification/with-icon.tsx?raw'
import customActions from '../../../examples/notification/custom-actions.tsx?raw'
import customIcon from '../../../examples/notification/custom-icon.tsx?raw'
import placement from '../../../examples/notification/placement.tsx?raw'
import update from '../../../examples/notification/update.tsx?raw'
import stack from '../../../examples/notification/stack.tsx?raw'
import showProgress from '../../../examples/notification/show-progress.tsx?raw'
import styleClass from '../../../examples/notification/style-class.tsx?raw'
import notificationApi from './notification-api.json'
import notificationMethodsApi from './notification-methods-api.json'

export const meta: PageMeta = { title: 'Notification 通知提醒框', description: '全局展示通知提醒信息。', group: '组件', order: 190 }
export default function Page() {
  return <>
    <Section id="usage" title="使用方式"><p>在系统四个角或上下居中显示通知提醒信息。适用于较为复杂的通知内容、带有交互的通知，或系统主动推送的通知。</p><CodeBlock code={"import { notification } from 'upthrust-ui'"} /></Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="notification/hooks" title="Hooks 调用（推荐）" description="通过 notification.useNotification 创建带上下文的 holder。" source={hooks} />
      <Demo id="notification/basic" title="静态方法" description="最简单的用法，4.5 秒后自动关闭；未挂载 Provider 时自动在 body 上创建容器。" source={basic} />
      <Demo id="notification/duration" title="自动关闭的延时" description="duration 单位为秒，0 表示不自动关闭。" source={duration} />
      <Demo id="notification/with-icon" title="带有图标的通知提醒框" description="通知提醒框左侧有图标。" source={withIcon} />
      <Demo id="notification/custom-actions" title="自定义按钮" description="通过 actions 自定义操作区。" source={customActions} />
      <Demo id="notification/custom-icon" title="自定义图标" description="图标可以被自定义。" source={customIcon} />
      <Demo id="notification/placement" title="位置" description="六个弹出位置。" source={placement} />
      <Demo id="notification/update" title="更新消息内容" description="可以通过唯一的 key 来更新内容。" source={update} />
      <Demo id="notification/stack" title="堆叠" description="堆叠配置，默认开启；超过 3 条折叠，悬停展开。" source={stack} />
      <Demo id="notification/show-progress" title="显示进度条" description="显示自动关闭通知框的进度条，并可控制悬停暂停。" source={showProgress} />
      <Demo id="notification/style-class" title="自定义语义结构样式" description="通过 classNames 和 styles 传入对象 / 函数自定义语义化结构。" source={styleClass} />
    </DemoGrid></Section>
    <Section id="notification-api" title="API"><p>config 对象属性：</p><ApiTable rows={notificationApi} /></Section>
    <Section id="notification-methods" title="方法与全局配置"><ApiTable rows={notificationMethodsApi} /></Section>
    <Section id="limits" title="约定与边界"><p>参考 <a href="https://ant.design/components/notification-cn/">Ant Design Notification 6.3</a> 的公开示例与源码：notice 宽 384px、最大 calc(100vw − 48px)、内边距 20px × 24px、8px 圆角；标题 16px / 1.5，图标 24px 并让出 36px；关闭按钮 22px 方块位于右上 20 / 24；列表 z-index 2050，距角落 24px；stack 默认阈值 3，折叠时旧卡每层露出 8px 并横向收窄，悬停展开并以 16px 间距排列，悬停任意一条暂停整个角落；进度条显示剩余时间。</p><p>与 antd 的差异：整页共用一个单例队列（多个 Provider 时最后挂载的负责渲染，useNotification 的配置也是全局的）；open 返回 NotificationResult 句柄（本库扩展）；不支持 RTL、prefixCls / rootClassName 与 _InternalPanelDoNotUseOrYouWillBeFired 调试面板。</p></Section>
  </>
}
