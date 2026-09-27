import { createSignal } from 'solid-js'
import ColorPicker from 'upthrust-ui/source/ColorPicker'
import Flex from 'upthrust-ui/source/Flex'
import Input from 'upthrust-ui/source/Input'
import InputNumber from 'upthrust-ui/source/InputNumber'
import Slider from 'upthrust-ui/source/Slider'
import { Paragraph } from 'upthrust-ui/source/Typography'
import Watermark from 'upthrust-ui/source/Watermark'

/** antd 示例用 Form 收集配置；这里用独立信号，控件与参数一一对应。 */
export default function Custom() {
  const [content, setContent] = createSignal('Ant Design')
  const [color, setColor] = createSignal('rgba(0, 0, 0, 0.15)')
  const [fontSize, setFontSize] = createSignal(16)
  const [zIndex, setZIndex] = createSignal(11)
  const [rotate, setRotate] = createSignal(-22)
  const [gap, setGap] = createSignal<[number, number]>([100, 100])
  const [offset, setOffset] = createSignal<[number | undefined, number | undefined]>([undefined, undefined])
  const mergedOffset = (): [number, number] | undefined => {
    const [x, y] = offset()
    return x === undefined && y === undefined ? undefined : [x ?? gap()[0] / 2, y ?? gap()[1] / 2]
  }
  const field = (label: string, control: () => unknown) => <div style={{ 'margin-bottom': '16px' }}>
    <div style={{ 'margin-bottom': '8px' }}>{label}</div>{control() as never}
  </div>

  // 文档为双栏网格，antd 的左右布局在半栏宽度下会把文字挤成窄列；这里改为上方预览、下方两列表单。
  return <Flex vertical gap="middle">
    <Watermark content={content()} zIndex={zIndex()} rotate={rotate()} gap={gap()} offset={mergedOffset()} font={{ color: color(), fontSize: fontSize() }}>
      <div>
        <Paragraph>
          The light-speed iteration of the digital world makes products more complex. However, human consciousness and attention
          resources are limited. Facing this design contradiction, the pursuit of natural interaction will be the consistent direction of Ant Design.
        </Paragraph>
        <Paragraph>
          Natural user cognition: According to cognitive psychology, about 80% of external information is obtained through visual channels.
          The most important visual elements in the interface design, including layout, colors, illustrations, icons, etc., should fully
          absorb the laws of nature, thereby reducing the user's cognitive cost and bringing authentic and smooth feelings.
        </Paragraph>
        <Paragraph>
          Natural user behavior: In the interaction with the system, the designer should fully understand the relationship between users,
          system roles, and task objectives, and also contextually organize system functions and services.
        </Paragraph>
      </div>
      <div style={{ position: 'relative', 'z-index': 10, height: '120px', 'border-radius': '8px', background: 'linear-gradient(135deg, #e6f4ff, #f9f0ff)' }} />
    </Watermark>
    <div style={{ display: 'grid', 'grid-template-columns': 'repeat(auto-fill, minmax(200px, 1fr))', 'column-gap': '16px', 'border-top': '1px solid #eee', 'padding-top': '16px' }}>
      {field('Content', () => <Input value={content()} placeholder="Please enter" onChange={setContent} />)}
      {field('Color', () => <ColorPicker value={color()} onChange={(c) => c && setColor(c.toRgbString())} />)}
      {field('FontSize', () => <Slider min={1} max={100} value={fontSize()} onChange={setFontSize} />)}
      {field('zIndex', () => <Slider min={0} max={100} value={zIndex()} onChange={setZIndex} />)}
      {field('Rotate', () => <Slider min={-180} max={180} value={rotate()} onChange={setRotate} />)}
      {field('Gap', () => <Flex gap="small">
        <InputNumber placeholder="gapX" value={gap()[0]} onChange={v => setGap([v ?? 100, gap()[1]])} />
        <InputNumber placeholder="gapY" value={gap()[1]} onChange={v => setGap([gap()[0], v ?? 100])} />
      </Flex>)}
      {field('Offset', () => <Flex gap="small">
        <InputNumber placeholder="offsetLeft" value={offset()[0] ?? null} onChange={v => setOffset([v ?? undefined, offset()[1]])} />
        <InputNumber placeholder="offsetTop" value={offset()[1] ?? null} onChange={v => setOffset([offset()[0], v ?? undefined])} />
      </Flex>)}
    </div>
  </Flex>
}
