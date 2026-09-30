import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Modal from 'upthrust-ui/source/Modal'

export default function Footer() {
  const [open, setOpen] = createSignal(false)
  const [loading, setLoading] = createSignal(false)
  const submit = () => { setLoading(true); setTimeout(() => { setLoading(false); setOpen(false) }, 1500) }
  return <>
    <Button type="primary" onClick={() => setOpen(true)}>Open Modal with customized footer</Button>
    <Modal
      open={open()}
      title="Title"
      onCancel={() => setOpen(false)}
      footer={<>
        <Button onClick={() => setOpen(false)}>Return</Button>
        <Button type="primary" loading={loading()} onClick={submit}>Submit</Button>
        <Button type="primary" loading={loading()} onClick={submit}>Search on Google</Button>
      </>}
    >
      <p>Some contents...</p>
      <p>Some contents...</p>
    </Modal>
  </>
}
