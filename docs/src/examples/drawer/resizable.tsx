import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Drawer from 'upthrust-ui/source/Drawer'

export default function Resizable() {
  const [open, setOpen] = createSignal(false)
  const [size, setSize] = createSignal(256)
  return <>
    <Button type="primary" onClick={() => setOpen(true)}>Open Drawer</Button>
    <Drawer
      title="Resizable Drawer"
      open={open()}
      onClose={() => setOpen(false)}
      size={size()}
      maxSize={600}
      resizable={{ onResize: setSize }}
    >
      <p>拖动抽屉内沿调整宽度（最大 600px）。</p>
      <p>Current size: {size()}px</p>
    </Drawer>
  </>
}
