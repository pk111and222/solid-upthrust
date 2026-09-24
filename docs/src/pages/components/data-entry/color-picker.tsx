import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, DemoGrid, Section } from '../../../components/Content'
import basic from '../../../examples/color-picker/basic.tsx?raw'
import formats from '../../../examples/color-picker/formats.tsx?raw'
import inline from '../../../examples/color-picker/inline.tsx?raw'
import states from '../../../examples/color-picker/states.tsx?raw'
import form from '../../../examples/color-picker/form.tsx?raw'
import events from '../../../examples/color-picker/events.tsx?raw'
import open from '../../../examples/color-picker/open.tsx?raw'
import presetGroups from '../../../examples/color-picker/preset-groups.tsx?raw'
import customText from '../../../examples/color-picker/custom-text.tsx?raw'
import api from './color-picker-api.json'
import presetApi from './color-picker-preset-api.json'

export const meta: PageMeta = { title: 'ColorPicker 颜色选择器', description: '选择、预览和输入颜色，支持透明度与快捷色。', group: '组件', order: 287 }

export default function ColorPickerPage() {
  return <>
    <Section id="usage" title="使用方式">
      <p>ColorPicker 支持 HEX、RGB(A)、HSL(A)、HSB(A) 和 transparent，也可传入 Color 或 RGB/HSB 通道对象。value 受控时请在 onChange 中写回颜色；defaultValue 仅作为初始值。onChange 在滑块与取色过程中实时触发，onChangeComplete 在交互完成后触发一次。</p>
      <p>面板使用 Popover，inline 可直接显示面板。预设色点击后立即提交；颜色文本需按 Enter 或失焦提交，非法输入提示错误但不覆盖已有颜色。透明色和清空是不同状态。</p>
    </Section>
    <Section id="examples" title="示例"><DemoGrid>
      <Demo id="color-picker/basic" title="受控取色与清空" source={basic} />
      <Demo id="color-picker/formats" title="格式与透明度" source={formats} />
      <Demo id="color-picker/inline" title="内嵌取色与预设" source={inline} />
      <Demo id="color-picker/states" title="尺寸、状态与禁用" source={states} />
      <Demo id="color-picker/form" title="Form.Item 提交与重置" source={form} />
      <Demo id="color-picker/events" title="实时变化与完成事件" source={events} />
      <Demo id="color-picker/open" title="受控颜色面板" source={open} />
      <Demo id="color-picker/preset-groups" title="分组预设色" source={presetGroups} />
      <Demo id="color-picker/custom-text" title="自定义颜色文本" source={customText} />
    </DemoGrid></Section>
    <Section id="api" title="ColorPickerProps API"><ApiTable rows={api} /></Section>
    <Section id="preset-api" title="ColorPickerPreset API"><ApiTable rows={presetApi} /></Section>
    <Section id="limits" title="边界与可访问性">
      <p>disabledAlpha 隐藏透明度并输出不透明色；disabledFormat 锁定格式。name 对应隐藏原生表单字段，Form.Item 字段值为 HEX 或 null；公开 onChange 仍接收 Color 对象与可用于 CSS 的 RGB(A) 字符串。支持键盘操作滑块，Escape 关闭浮层或撤销颜色输入草稿。</p>
      <p>不解析 CSS 变量、命名色、宽色域函数或渐变。二维取色区需使用指针；键盘用户可通过色相、饱和度、亮度与透明度滑块调整。真实浏览器专项为 Chromium，跨浏览器、消费者安装和发布另行验收。</p>
    </Section>
  </>
}
