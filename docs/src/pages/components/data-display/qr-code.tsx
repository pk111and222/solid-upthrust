import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import base from '../../../examples/qr-code/base.tsx?raw'
import icon from '../../../examples/qr-code/icon.tsx?raw'
import status from '../../../examples/qr-code/status.tsx?raw'
import customStatusRender from '../../../examples/qr-code/custom-status-render.tsx?raw'
import type_ from '../../../examples/qr-code/type.tsx?raw'
import customSize from '../../../examples/qr-code/custom-size.tsx?raw'
import customColor from '../../../examples/qr-code/custom-color.tsx?raw'
import download from '../../../examples/qr-code/download.tsx?raw'
import errorlevel from '../../../examples/qr-code/errorlevel.tsx?raw'
import popover from '../../../examples/qr-code/popover.tsx?raw'
import styleClass from '../../../examples/qr-code/style-class.tsx?raw'
import qrCodeApi from './qr-code-api.json'
import statusRenderApi from './qr-code-status-render-api.json'

export const meta: PageMeta = { title: 'QRCode 二维码', description: '能够将文本转换生成二维码的组件，支持自定义配色和 Logo 配置。', group: '组件', order: 169 }
export default function Page() {
  return <>
    <Section id="usage" title="使用方式"><p>当需要将文本转换成为二维码时使用。</p><CodeBlock code={"import { QRCode } from 'upthrust-ui'"} /></Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="qr-code/base" title="基本使用" description="基本用法。" source={base} />
      <Demo id="qr-code/icon" title="带 Icon 的例子" description="带 Icon 的二维码。" source={icon} />
      <Demo id="qr-code/status" title="不同的状态" description="可以通过 status 的值控制二维码的状态，提供了 active、expired、loading、scanned 四个值。" source={status} />
      <Demo id="qr-code/custom-status-render" title="自定义状态渲染器" description="可以通过 statusRender 的值控制二维码不同状态的渲染逻辑。" source={customStatusRender} />
      <Demo id="qr-code/type" title="自定义渲染类型" description="通过设置 type 自定义渲染结果，提供 canvas 和 svg 两个选项。" source={type_} />
      <Demo id="qr-code/custom-size" title="自定义尺寸" description="自定义尺寸。" source={customSize} />
      <Demo id="qr-code/custom-color" title="自定义颜色" description="通过设置 color 自定义二维码颜色，通过设置 bgColor 自定义背景颜色。" source={customColor} />
      <Demo id="qr-code/download" title="下载二维码" description="下载二维码的简单实现。" source={download} />
      <Demo id="qr-code/errorlevel" title="纠错比例" description="通过设置 errorLevel 调整不同的容错等级。" source={errorlevel} />
      <Demo id="qr-code/popover" title="高级用法" description="带气泡卡片的例子。" source={popover} />
      <Demo id="qr-code/style-class" title="自定义语义结构的样式和类" description="通过 classNames 和 styles 传入对象 / 函数，自定义 root 与 cover。" source={styleClass} />
    </DemoGrid></Section>
    <Section id="qr-code-api" title="QRCode API"><ApiTable rows={qrCodeApi} /></Section>
    <Section id="status-render-info" title="StatusRenderInfo"><ApiTable rows={statusRenderApi} /></Section>
    <Section id="limits" title="约定与边界"><p>参考 <a href="https://ant.design/components/qr-code-cn/">Ant Design QRCode 6.6.5</a> 的公开示例与源码：编码器与绘制几何移植自 @rc-component/qrcode（Nayuki qrcodegen，MIT），同一输入生成的模块矩阵与 SVG 路径与 antd 逐字一致；中文等非 ASCII 文本按 UTF-8 字节编码。</p><p>canvas 按 devicePixelRatio 绘制；带图标时图标加载完成后才挖空并绘制图标，跨域图标需服务端允许 CORS（crossorigin=anonymous），否则不绘制。与 antd 的差异：未接入 ConfigProvider，文案默认中文、可用 locale 覆盖；RTL 未处理；示例中的图标内联为 data URI 以便离线运行。</p></Section>
  </>
}
