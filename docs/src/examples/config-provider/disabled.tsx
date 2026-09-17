import { createSignal } from 'solid-js'
import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import Switch from 'upthrust-ui/source/Switch'
import Button from 'upthrust-ui/source/Button'
export default function Disabled() {
  const [disabled, setDisabled] = createSignal(false)
  return <div class="space-y-5">
    <label class="flex items-center gap-3 text-sm"><Switch checked={disabled()} onChange={setDisabled} />默认禁用</label>
    <ConfigProvider componentDisabled={disabled()}>
      <div class="flex gap-3"><Button>继承默认值</Button><Button disabled={false}>显式属性优先</Button></div>
    </ConfigProvider>
  </div>
}
