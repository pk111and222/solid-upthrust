import Skeleton from 'upthrust-ui/source/Skeleton'
import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'

export default function Demo() {
  const [active, setActive] = createSignal(true)
  return <div class="space-y-5">
    <Button onClick={() => setActive(!active())}>切换动画</Button>
    <Skeleton active={active()} round avatar={{ shape: 'square' }} />
  </div>
}
