import { createSignal } from 'solid-js'
import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import Button from 'upthrust-ui/source/Button'
import Switch from 'upthrust-ui/source/Switch'
export default function Theme() {
  const [purple, setPurple] = createSignal(true)
  return <div class="space-y-5">
    <label class="flex items-center gap-3 text-sm"><Switch checked={purple()} onChange={setPurple} />紫色品牌</label>
    <ConfigProvider theme={{colors:{primary:purple() ? '#722ed1' : '#1677ff',onPrimary:'#ffffff'}}}>
      <Button type="primary">品牌按钮</Button>
    </ConfigProvider>
  </div>
}
