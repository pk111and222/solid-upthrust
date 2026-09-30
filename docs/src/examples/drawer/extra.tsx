import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Drawer from 'upthrust-ui/source/Drawer'
import Space from 'upthrust-ui/source/Space'

export default function Extra() {
  const [open, setOpen] = createSignal(false)
  return <>
    <Button type="primary" onClick={() => setOpen(true)}>Open</Button>
    <Drawer
      title="Drawer with extra actions"
      size={500}
      onClose={() => setOpen(false)}
      open={open()}
      extra={<Space>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button type="primary" onClick={() => setOpen(false)}>OK</Button>
      </Space>}
    >
      <p>Some contents...</p>
    </Drawer>
  </>
}
