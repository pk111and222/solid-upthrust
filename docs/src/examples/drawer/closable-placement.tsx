import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Drawer from 'upthrust-ui/source/Drawer'

export default function ClosablePlacement() {
  const [open, setOpen] = createSignal(false)
  return <>
    <Button type="primary" onClick={() => setOpen(true)}>Open</Button>
    <Drawer title="Drawer Closable Placement" closable={{ placement: 'end' }} onClose={() => setOpen(false)} open={open()}>
      <p>closable.placement='end' 把关闭按钮放到头部右侧。</p>
    </Drawer>
  </>
}
