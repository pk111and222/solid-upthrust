import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Drawer from 'upthrust-ui/source/Drawer'

export default function StyleClass() {
  const [open, setOpen] = createSignal(false)
  return <>
    <Button onClick={() => setOpen(true)}>Open Styled Drawer</Button>
    <Drawer
      title="Custom semantic styles"
      open={open()}
      onClose={() => setOpen(false)}
      footer="Footer"
      classNames={{ header: 'border-dashed border-primary', footer: 'border-dashed border-primary' }}
      styles={{
        mask: { 'background-color': 'rgba(22, 119, 255, 0.2)' },
        section: { 'background-color': '#f5f9ff' },
        body: { 'font-size': '16px' },
      }}
    >
      <p>classNames / styles 支持 root、mask、wrapper、section、header、title、extra、body、footer、dragger、close。</p>
    </Drawer>
  </>
}
