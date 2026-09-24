import { createSignal } from 'solid-js'
import ColorPicker from 'upthrust-ui/source/ColorPicker'
import type { ColorFormat } from 'upthrust-ui/source/ColorPicker'

export default function Formats() {
  const [format, setFormat] = createSignal<ColorFormat>('hex')
  return <div class="flex flex-col gap-3 max-w-md">
    <ColorPicker aria-label="格式与透明度" defaultValue="rgba(22, 119, 255, 0.5)" format={format()} onFormatChange={setFormat} showText />
    <output>当前格式：{format().toUpperCase()}</output>
    <ColorPicker aria-label="不透明颜色" defaultValue="#13c2c280" disabledAlpha disabledFormat defaultFormat="rgb" showText />
  </div>
}
