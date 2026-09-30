import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Modal from 'upthrust-ui/source/Modal'

export default function Loading() {
  const [open, setOpen] = createSignal(false)
  const [loading, setLoading] = createSignal(true)
  const show = () => { setOpen(true); setLoading(true); setTimeout(() => setLoading(false), 2000) }
  return <>
    <Button type="primary" onClick={show}>Open Modal</Button>
    <Modal
      title={<p>Loading Modal</p>}
      footer={<Button type="primary" onClick={show}>Reload</Button>}
      loading={loading()}
      open={open()}
      onCancel={() => setOpen(false)}
    >
      <p>Some contents...</p>
      <p>Some contents...</p>
    </Modal>
  </>
}
