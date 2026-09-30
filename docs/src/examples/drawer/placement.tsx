import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Drawer, { type DrawerPlacement } from 'upthrust-ui/source/Drawer'
import { RadioGroup } from 'upthrust-ui/source/Radio'
import Space from 'upthrust-ui/source/Space'

export default function Placement() {
  const [open, setOpen] = createSignal(false)
  const [placement, setPlacement] = createSignal<DrawerPlacement>('left')
  return <>
    <Space>
      <RadioGroup value={placement()} onChange={value => setPlacement(value as DrawerPlacement)}
        options={['top', 'right', 'bottom', 'left'].map(value => ({ label: value, value }))} />
      <Button type="primary" onClick={() => setOpen(true)}>Open</Button>
    </Space>
    <Drawer title="Basic Drawer" placement={placement()} closable={false} onClose={() => setOpen(false)} open={open()}>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </Drawer>
  </>
}
