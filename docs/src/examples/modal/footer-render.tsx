import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Modal from 'upthrust-ui/source/Modal'
import Space from 'upthrust-ui/source/Space'

export default function FooterRender() {
  const [open, setOpen] = createSignal(false)
  return <>
    <Button type="primary" onClick={() => setOpen(true)}>Open Modal</Button>
    <Modal
      open={open()}
      title="Title"
      onOk={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      // 函数形式：拿到默认按钮行与 OkBtn / CancelBtn 自由组合。
      footer={(_, { OkBtn, CancelBtn }) => <>
        <Button>Custom Button</Button>
        <CancelBtn />
        <OkBtn />
      </>}
    >
      <Space direction="vertical"><p>Some contents...</p></Space>
    </Modal>
  </>
}
