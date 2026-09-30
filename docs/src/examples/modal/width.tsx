import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Flex from 'upthrust-ui/source/Flex'
import Modal from 'upthrust-ui/source/Modal'

export default function Width() {
  const [open, setOpen] = createSignal(false)
  const [responsive, setResponsive] = createSignal(false)
  return <>
    <Flex gap="middle">
      <Button type="primary" onClick={() => setOpen(true)}>Open Modal of 1000px width</Button>
      <Button type="primary" onClick={() => setResponsive(true)}>Open Modal of responsive width</Button>
    </Flex>
    <Modal title="Modal 1000px width" centered open={open()} width={1000} onOk={() => setOpen(false)} onCancel={() => setOpen(false)}>
      <p>some contents...</p>
    </Modal>
    <Modal
      title="Modal responsive width"
      centered
      open={responsive()}
      width={{ xs: '90%', sm: '80%', md: '70%', lg: '60%', xl: '50%', xxl: '40%' }}
      onOk={() => setResponsive(false)}
      onCancel={() => setResponsive(false)}
    >
      <p>width 断点对象：xs 为基准，命中的更宽断点逐级覆盖。</p>
    </Modal>
  </>
}
