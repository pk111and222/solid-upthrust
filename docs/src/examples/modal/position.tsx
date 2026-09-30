import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Flex from 'upthrust-ui/source/Flex'
import Modal from 'upthrust-ui/source/Modal'

export default function Position() {
  const [top, setTop] = createSignal(false)
  const [center, setCenter] = createSignal(false)
  return <>
    <Flex gap="middle">
      <Button type="primary" onClick={() => setTop(true)}>Display a modal dialog at 20px to Top</Button>
      <Button type="primary" onClick={() => setCenter(true)}>Vertically centered modal dialog</Button>
    </Flex>
    <Modal title="20px to Top" style={{ top: '20px' }} open={top()} onOk={() => setTop(false)} onCancel={() => setTop(false)}>
      <p>some contents...</p>
    </Modal>
    <Modal title="Vertically centered modal dialog" centered open={center()} onOk={() => setCenter(false)} onCancel={() => setCenter(false)}>
      <p>some contents...</p>
    </Modal>
  </>
}
