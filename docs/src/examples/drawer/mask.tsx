import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Drawer, { type DrawerMaskConfig } from 'upthrust-ui/source/Drawer'
import Space from 'upthrust-ui/source/Space'

export default function Mask() {
  const [mask, setMask] = createSignal<DrawerMaskConfig | undefined>()
  return <>
    <Space>
      <Button onClick={() => setMask({ blur: true })}>blur</Button>
      <Button onClick={() => setMask({ blur: false })}>Dimmed mask</Button>
      <Button onClick={() => setMask({ enabled: false })}>No mask</Button>
    </Space>
    <Drawer title="Mask" open={!!mask()} mask={mask()} onClose={() => setMask(undefined)}>
      <p>mask=false 时不锁定页面滚动、不设置 aria-modal，页面仍可交互。</p>
    </Drawer>
  </>
}
