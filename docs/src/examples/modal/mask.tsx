import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Flex from 'upthrust-ui/source/Flex'
import Modal, { type ModalMaskConfig } from 'upthrust-ui/source/Modal'

export default function Mask() {
  const [mask, setMask] = createSignal<ModalMaskConfig | undefined>()
  return <>
    <Flex gap="middle">
      <Button onClick={() => setMask({ blur: true })}>blur</Button>
      <Button onClick={() => setMask({ blur: false })}>Dimmed mask</Button>
      <Button onClick={() => setMask({ enabled: false })}>No mask</Button>
    </Flex>
    <Modal open={!!mask()} mask={mask()} title="Custom mask" onOk={() => setMask(undefined)} onCancel={() => setMask(undefined)}>
      <p>mask 对象：enabled 关闭遮罩，blur 开启背景模糊，closable 控制点击遮罩是否关闭。</p>
    </Modal>
  </>
}
