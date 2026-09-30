import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Modal from 'upthrust-ui/source/Modal'

export default function ButtonProps() {
  const [open, setOpen] = createSignal(false)
  return <>
    <Button type="primary" onClick={() => setOpen(true)}>Open Modal with customized button props</Button>
    <Modal
      title="Basic Modal"
      open={open()}
      onOk={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      okButtonProps={{ disabled: true }}
      cancelButtonProps={{ disabled: true }}
    >
      <p>Some contents...</p>
    </Modal>
  </>
}
