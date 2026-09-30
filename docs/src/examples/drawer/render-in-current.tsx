import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Drawer from 'upthrust-ui/source/Drawer'

export default function RenderInCurrent() {
  const [open, setOpen] = createSignal(false)
  return <div style={{ position: 'relative', height: '200px', padding: '48px', overflow: 'hidden', 'text-align': 'center',
    background: 'rgba(0, 0, 0, 0.02)', border: '1px solid #f0f0f0', 'border-radius': '8px' }}>
    Render in this
    <div style={{ 'margin-top': '16px' }}><Button type="primary" onClick={() => setOpen(true)}>Open</Button></div>
    <Drawer title="Basic Drawer" placement="right" closable={false} onClose={() => setOpen(false)} open={open()} getContainer={false}>
      <p>Some contents...</p>
    </Drawer>
  </div>
}
