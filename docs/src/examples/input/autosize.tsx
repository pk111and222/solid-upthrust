import { createSignal, Show } from 'solid-js'
import { InputTextArea as TextArea } from 'upthrust-ui/source/Input'
import Button from 'upthrust-ui/source/Button'
export default function Demo() {
  const [mounted, setMounted] = createSignal(true)
  const [height, setHeight] = createSignal(0)
  return <div class="space-y-3"><Show when={mounted()}><TextArea placeholder="自动高度" autoSize={{ minRows: 2, maxRows: 4 }} onResize={size => setHeight(size.height)} /></Show><Button onClick={() => setMounted(!mounted())}>挂载或卸载文本域</Button><output>高度：{Math.round(height())}px</output></div>
}
