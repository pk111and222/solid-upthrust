import { createSignal } from 'solid-js'
import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import Button from 'upthrust-ui/source/Button'
import Modal from 'upthrust-ui/source/Modal'
export default function PortalTheme() {
  const [open, setOpen] = createSignal(false)
  return <ConfigProvider theme={{colors:{primary:'#08979c',onPrimary:'#ffffff'}}}>
    <Button type="primary" onClick={() => setOpen(true)}>打开局部 Modal</Button>
    <Modal open={open()} title="局部主题对话框" onCancel={() => {setOpen(false)}} onOk={() => {setOpen(false)}}>
      <p class="text-primary">弹层继续使用所在区域的主题。</p>
    </Modal>
  </ConfigProvider>
}
