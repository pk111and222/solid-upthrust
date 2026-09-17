import { createSignal } from 'solid-js'
import Icon from 'upthrust-ui/source/Icon'
import Button from 'upthrust-ui/source/Button'
export default function Spin() {
  const [spin, setSpin] = createSignal(true)
  return <div class="flex items-center gap-6">
    <Icon name="mdi:loading" spin={spin()} size={24} color="primary" />
    <Button onClick={() => setSpin(!spin())}>切换旋转</Button>
  </div>
}
