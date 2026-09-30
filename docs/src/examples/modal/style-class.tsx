import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Modal from 'upthrust-ui/source/Modal'

export default function StyleClass() {
  const [open, setOpen] = createSignal(false)
  return <>
    <Button onClick={() => setOpen(true)}>Open Styled Modal</Button>
    <Modal
      title="Custom semantic styles"
      open={open()}
      onOk={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      classNames={{ header: 'border-0 border-b border-dashed border-primary pb-xs', footer: 'border-0 border-t border-dashed border-primary pt-sm' }}
      styles={info => ({
        mask: { 'background-color': 'rgba(22, 119, 255, 0.2)' },
        container: { 'border-radius': '16px' },
        body: { 'min-height': info.props.open ? '80px' : undefined, padding: '8px 0' },
      })}
    >
      <p>classNames / styles 支持 root、mask、wrapper、container、header、title、body、footer、close。</p>
    </Modal>
  </>
}
