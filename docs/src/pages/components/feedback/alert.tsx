import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import basic from '../../../examples/alert/basic.tsx?raw'
import style from '../../../examples/alert/style.tsx?raw'
import closable from '../../../examples/alert/closable.tsx?raw'
import description from '../../../examples/alert/description.tsx?raw'
import icon from '../../../examples/alert/icon.tsx?raw'
import banner from '../../../examples/alert/banner.tsx?raw'
import smoothClosed from '../../../examples/alert/smooth-closed.tsx?raw'
import errorBoundary from '../../../examples/alert/error-boundary.tsx?raw'
import customIcon from '../../../examples/alert/custom-icon.tsx?raw'
import action from '../../../examples/alert/action.tsx?raw'
import filled from '../../../examples/alert/filled.tsx?raw'
import customTitleAlignment from '../../../examples/alert/custom-title-alignment.tsx?raw'
import styleClass from '../../../examples/alert/style-class.tsx?raw'
import alertApi from './alert-api.json'
import alertClosableApi from './alert-closable-api.json'
import alertErrorBoundaryApi from './alert-error-boundary-api.json'

export const meta: PageMeta = { title: 'Alert 警告提示', description: '警告提示，展现需要关注的信息。', group: '组件', order: 183 }
export default function Page() {
  return <>
    <Section id="usage" title="使用方式"><p>当某个页面需要向用户显示警告的信息时；非浮层的静态展现形式，始终展现，不会自动消失，用户可以点击关闭。</p><CodeBlock code={"import { Alert } from 'upthrust-ui'"} /></Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="alert/basic" title="基本" description="最简单的用法，适用于简短的警告提示。" source={basic} />
      <Demo id="alert/style" title="四种样式" description="共有四种样式 success、info、warning、error。" source={style} />
      <Demo id="alert/closable" title="可关闭的警告提示" description="显示关闭按钮，点击可关闭警告提示；closable 对象的 aria-* 透传到关闭按钮。" source={closable} />
      <Demo id="alert/description" title="含有辅助性文字介绍" description="含有辅助性文字介绍的警告提示。" source={description} />
      <Demo id="alert/icon" title="图标" description="可口的图标让信息类型更加醒目。" source={icon} />
      <Demo id="alert/banner" title="顶部公告" description="页面顶部通告形式，默认有图标且 type 为 'warning'。" source={banner} />
      <Demo id="alert/smooth-closed" title="平滑地卸载" description="平滑、自然的卸载提示；closable.afterClose 在离场动画结束后触发。" source={smoothClosed} />
      <Demo id="alert/error-boundary" title="ErrorBoundary" description="友好的 ErrorBoundary 展示。" source={errorBoundary} />
      <Demo id="alert/custom-icon" title="自定义图标" description="可以自定义图标，让信息类型更加醒目。" source={customIcon} />
      <Demo id="alert/action" title="操作" description="可以在右上角自定义操作项。" source={action} />
      <Demo id="alert/filled" title="填充样式" description="variant='filled' 时边框透明。" source={filled} />
      <Demo id="alert/custom-title-alignment" title="自定义标题对齐" description="通过 styles 让图标、操作与关闭按钮对齐到多行标题的第一行。" source={customTitleAlignment} />
      <Demo id="alert/style-class" title="自定义语义结构的样式和类" description="通过 classNames 和 styles 传入对象 / 函数，自定义 root、icon、section、title、description、actions、close。" source={styleClass} />
    </DemoGrid></Section>
    <Section id="alert-api" title="Alert API"><ApiTable rows={alertApi} /></Section>
    <Section id="alert-closable-api" title="AlertClosable"><ApiTable rows={alertClosableApi} /></Section>
    <Section id="alert-error-boundary-api" title="Alert.ErrorBoundary"><ApiTable rows={alertErrorBoundaryApi} /></Section>
    <Section id="limits" title="约定与边界"><p>参考 <a href="https://ant.design/components/alert-cn/">Ant Design Alert 6.6.5</a> 的公开示例与源码：结构、间距、字号、图标（@ant-design/icons 同源路径）、状态色与离场动画（max-height / opacity / padding / margin-bottom，0.3s motionEaseInOutCirc）与 antd 一致。</p><p>与 antd 的差异：未接入 ConfigProvider；RTL 未处理；loop-banner（依赖 react-text-loop-next 走马灯）与 component-token 示例未移植；ErrorBoundary 的默认描述为 error.stack（Solid 无 componentStack）；成功 / 警告 / 错误色为 antd 实测固定色值，信息色跟随主题主色。</p></Section>
  </>
}
