import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import success from '../../../examples/result/success.tsx?raw'
import info from '../../../examples/result/info.tsx?raw'
import warning from '../../../examples/result/warning.tsx?raw'
import status403 from '../../../examples/result/403.tsx?raw'
import status404 from '../../../examples/result/404.tsx?raw'
import status500 from '../../../examples/result/500.tsx?raw'
import error from '../../../examples/result/error.tsx?raw'
import customIcon from '../../../examples/result/custom-icon.tsx?raw'
import styleClass from '../../../examples/result/style-class.tsx?raw'
import resultApi from './result-api.json'

export const meta: PageMeta = { title: 'Result 结果', description: '用于反馈一系列操作任务的处理结果。', group: '组件', order: 182 }
export default function Page() {
  return <>
    <Section id="usage" title="使用方式"><p>当有重要操作需告知用户处理结果，且反馈内容较为复杂时使用。</p><CodeBlock code={"import { Result } from 'upthrust-ui'"} /></Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="result/success" title="Success" description="成功的结果。" source={success} />
      <Demo id="result/info" title="Info" description="展示处理结果。" source={info} />
      <Demo id="result/warning" title="Warning" description="警告类型的结果。" source={warning} />
      <Demo id="result/403" title="403" description="你没有此页面的访问权限。" source={status403} />
      <Demo id="result/404" title="404" description="此页面未找到。" source={status404} />
      <Demo id="result/500" title="500" description="服务器发生了错误。" source={status500} />
      <Demo id="result/error" title="Error" description="复杂的错误反馈。" source={error} />
      <Demo id="result/custom-icon" title="自定义 icon" description="自定义 icon。" source={customIcon} />
      <Demo id="result/style-class" title="自定义语义结构的样式和类" description="通过 classNames 和 styles 传入对象 / 函数，自定义 root、icon、title、subTitle、extra、body。" source={styleClass} />
    </DemoGrid></Section>
    <Section id="result-api" title="Result API"><ApiTable rows={resultApi} /></Section>
    <Section id="builtin-images" title="内置插画"><p>Result.PRESENTED_IMAGE_403 / PRESENTED_IMAGE_404 / PRESENTED_IMAGE_500 是异常插画组件（与 antd 同名静态属性），可单独渲染。</p></Section>
    <Section id="limits" title="约定与边界"><p>参考 <a href="https://ant.design/components/result-cn/">Ant Design Result 6.6.5</a> 的公开示例与源码：结构、间距、字号、状态色与 antd 实测一致；状态图标使用 @ant-design/icons 同源路径（CheckCircleFilled / CloseCircleFilled / ExclamationCircleFilled / WarningFilled），异常插画逐字移植。</p><p>与 antd 的差异：未接入 ConfigProvider；RTL 未处理；component-token 示例（组件 token 定制）未移植；成功 / 警告 / 错误色为 antd 实测固定色值，信息色跟随主题主色。</p></Section>
  </>
}
