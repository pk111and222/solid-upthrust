import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import basic from '../../../examples/watermark/basic.tsx?raw'
import multiLine from '../../../examples/watermark/multi-line.tsx?raw'
import image from '../../../examples/watermark/image.tsx?raw'
import custom from '../../../examples/watermark/custom.tsx?raw'
import portal from '../../../examples/watermark/portal.tsx?raw'
import watermarkApi from './watermark-api.json'
import watermarkFontApi from './watermark-font-api.json'

export const meta: PageMeta = { title: 'Watermark 水印', description: '给页面的某个区域加上水印。', group: '组件', order: 184 }
export default function Page() {
  return <>
    <Section id="usage" title="使用方式"><p>页面需要添加水印标识版权时使用；适用于防止信息盗用。</p><CodeBlock code={"import { Watermark } from 'upthrust-ui'"} /></Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="watermark/basic" title="基本" description="最简单的用法。" source={basic} />
      <Demo id="watermark/multi-line" title="多行水印" description="通过 content 设置字符串数组指定多行文字水印；{ text, font } 可单独设置该行字体。" source={multiLine} />
      <Demo id="watermark/image" title="图片水印" description="通过 image 指定图片地址；为保证清晰度，建议导出 2 倍或 3 倍图并设置 width / height。" source={image} />
      <Demo id="watermark/custom" title="自定义配置" description="通过自定义参数配置预览水印效果。" source={custom} />
      <Demo id="watermark/portal" title="Modal 与 Drawer" description="在弹窗与抽屉中显示水印；inherit={false} 时不传导。" source={portal} />
    </DemoGrid></Section>
    <Section id="watermark-api" title="Watermark API"><ApiTable rows={watermarkApi} /></Section>
    <Section id="watermark-font-api" title="WatermarkFont"><ApiTable rows={watermarkFontApi} /></Section>
    <Section id="limits" title="约定与边界"><p>参考 <a href="https://ant.design/components/watermark-cn/">Ant Design Watermark 6.6.5</a> 的公开示例与源码：canvas 按 useClips 绘制（旋转 + 交错双份平铺）、水印节点追加到容器末尾、MutationObserver 防篡改（节点被删或样式被改时同帧去重重绘，并触发 onRemove）、容器 position / overflow 被改时恢复。</p><p>与 antd 的差异：未接入 ConfigProvider；Modal / Drawer 以外的弹层（如 Tooltip）不传导；自定义配置示例的图片替换为本地渐变块，表单改为独立控件。</p></Section>
  </>
}
