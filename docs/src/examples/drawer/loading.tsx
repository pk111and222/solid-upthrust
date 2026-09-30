import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Drawer from 'upthrust-ui/source/Drawer'

export default function Loading() {
  const [open, setOpen] = createSignal(false)
  const [loading, setLoading] = createSignal(true)
  const show = () => { setOpen(true); setLoading(true); setTimeout(() => setLoading(false), 2000) }
  return <>
    <Button type="primary" onClick={show}>Open Drawer</Button>
    <Drawer closable destroyOnHidden title={<p>Loading Drawer</p>} placement="right" open={open()} loading={loading()} onClose={() => setOpen(false)}>
      <Button type="primary" style={{ 'margin-bottom': '16px' }} onClick={show}>Reload</Button>
      <p>Some contents...</p>
    </Drawer>
  </>
}
