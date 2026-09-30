import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import hooks from '../../../examples/message/hooks.tsx?raw'
import other from '../../../examples/message/other.tsx?raw'
import duration from '../../../examples/message/duration.tsx?raw'
import loading from '../../../examples/message/loading.tsx?raw'
import thenable from '../../../examples/message/thenable.tsx?raw'
import styleClass from '../../../examples/message/style-class.tsx?raw'
import update from '../../../examples/message/update.tsx?raw'
import info from '../../../examples/message/info.tsx?raw'
import messageApi from './message-api.json'
import messageMethodsApi from './message-methods-api.json'

export const meta: PageMeta = { title: 'Message 全局提示', description: '全局展示操作反馈信息。', group: '组件', order: 189 }
export default function Page() {
  return <>
    <Section id="usage" title="使用方式"><p>可提供成功、警告和错误等反馈信息。顶部居中显示并自动消失，是一种不打断用户操作的轻量级提示方式。</p><CodeBlock code={"import { message } from 'upthrust-ui'"} /></Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="message/hooks" title="Hooks 调用（推荐）" description="通过 message.useMessage 创建带上下文的 holder，消息渲染在当前主题作用域内。" source={hooks} />
      <Demo id="message/other" title="其他提示类型" description="包括成功、失败、警告。" source={other} />
      <Demo id="message/duration" title="修改延时" description="自定义时长 10 秒，默认 3 秒，单位为秒。" source={duration} />
      <Demo id="message/loading" title="加载中" description="进行全局 loading，异步自行移除。" source={loading} />
      <Demo id="message/thenable" title="Promise 接口" description="可以通过 then 接口在关闭后运行 callback。" source={thenable} />
      <Demo id="message/style-class" title="自定义语义结构样式" description="通过 classNames 和 styles 传入对象 / 函数自定义语义化结构。" source={styleClass} />
      <Demo id="message/update" title="更新消息内容" description="可以通过唯一的 key 来更新内容。" source={update} />
      <Demo id="message/info" title="静态方法" description="未挂载 MessageProvider 时，首次调用会自动在 body 上创建容器。" source={info} />
    </DemoGrid></Section>
    <Section id="message-api" title="API"><p>config 对象属性：</p><ApiTable rows={messageApi} /></Section>
    <Section id="message-methods" title="方法与全局配置"><ApiTable rows={messageMethodsApi} /></Section>
    <Section id="limits" title="约定与边界"><p>参考 <a href="https://ant.design/components/message-cn/">Ant Design Message 6.6.5</a> 的公开示例与源码：notice 内边距 9px × 12px、8px 圆角、max-content 宽度、最大 calc(100vw − 48px)；图标 16px，info / loading 主色，success / warning / error 各自语义色；notice 间距 16px；列表 z-index 2010、默认距顶 8px；进出场为 64px 位移 + 透明度 0.2s；duration 以秒计，默认 3，悬停暂停。</p><p>与 antd 的差异：整页共用一个单例队列（多个 Provider 时最后挂载的负责渲染，useMessage 的配置也是全局的）；额外提供 center / bottom 位置；不支持 stack 折叠堆叠、RTL、transitionName / prefixCls；不提供 _InternalPanelDoNotUseOrYouWillBeFired 调试面板。</p></Section>
  </>
}
