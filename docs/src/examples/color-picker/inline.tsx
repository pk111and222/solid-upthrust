import { createSignal } from 'solid-js'
import ColorPicker from 'upthrust-ui/source/ColorPicker'

export default function Inline() {
  const [color, setColor] = createSignal('#eb2f96')
  return <div class="flex flex-col gap-3 max-w-sm">
    <ColorPicker inline defaultValue={color()} allowClear onChange={value => setColor(value?.toHexString() ?? '')}
      presets={[{ label: '品牌色', colors: ['#1677ff', '#722ed1', '#eb2f96', '#52c41a'] }]} />
    <output>面板颜色：{color() || '未选择'}</output>
  </div>
}
