import { createSignal } from 'solid-js'
import ColorPicker from 'upthrust-ui/source/ColorPicker'

export default function Events() {
  const [live, setLive] = createSignal('')
  const [complete, setComplete] = createSignal('')
  return <div class="flex flex-col gap-3 max-w-md">
    <ColorPicker defaultValue="#1677ff" showText
      onChange={(color, css) => setLive(`${color?.toHexString() ?? 'clear'} / ${css}`)}
      onChangeComplete={color => setComplete(color?.toHexString() ?? 'clear')} />
    <output>实时 onChange：{live() || '尚未调整'}</output>
    <output>完成 onChangeComplete：{complete() || '尚未完成'}</output>
  </div>
}
