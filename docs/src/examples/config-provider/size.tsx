import { createSignal } from 'solid-js'
import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import Button from 'upthrust-ui/source/Button'
import Input from 'upthrust-ui/source/Input'
export default function Size() {
  const [small, setSmall] = createSignal(false)
  return <div class="space-y-5">
    <Button onClick={() => setSmall(!small())}>切换尺寸</Button>
    <ConfigProvider componentSize={small() ? 'small' : 'large'}>
      <div class="flex items-center gap-3"><Input placeholder="统一尺寸" /><Button type="primary">保存</Button></div>
    </ConfigProvider>
  </div>
}
