import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Drawer from 'upthrust-ui/source/Drawer'

export default function Basic() {
  const [open, setOpen] = createSignal(false)
  return <>
    <Button type="primary" onClick={() => setOpen(true)}>Open</Button>
    <Drawer title="Basic Drawer" onClose={() => setOpen(false)} open={open()}>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </Drawer>
  </>
}
