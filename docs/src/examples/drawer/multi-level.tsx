import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Drawer from 'upthrust-ui/source/Drawer'

export default function MultiLevel() {
  const [open, setOpen] = createSignal(false)
  const [child, setChild] = createSignal(false)
  return <>
    <Button type="primary" onClick={() => setOpen(true)}>Open drawer</Button>
    <Drawer title="Multi-level drawer" size={520} closable={false} onClose={() => setOpen(false)} open={open()}>
      <Button type="primary" onClick={() => setChild(true)}>Two-level drawer</Button>
      <Drawer title="Two-level Drawer" size={320} closable={false} onClose={() => setChild(false)} open={child()}>
        This is two-level drawer
      </Drawer>
    </Drawer>
  </>
}
