import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Drawer from 'upthrust-ui/source/Drawer'
import Flex from 'upthrust-ui/source/Flex'
import Modal from 'upthrust-ui/source/Modal'
import Watermark from 'upthrust-ui/source/Watermark'

const placeholder = () => <div style={{
  height: '300px', display: 'flex', 'justify-content': 'center', 'align-items': 'center', 'background-color': 'rgba(150, 150, 150, 0.2)',
}}>A mock height</div>

export default function Portal() {
  const [showModal, setShowModal] = createSignal(false)
  const [showDrawer, setShowDrawer] = createSignal(false)
  const [showDrawer2, setShowDrawer2] = createSignal(false)
  return <>
    <Flex gap="middle">
      <Button type="primary" onClick={() => setShowModal(true)}>Show in Modal</Button>
      <Button type="primary" onClick={() => setShowDrawer(true)}>Show in Drawer</Button>
      <Button type="primary" onClick={() => setShowDrawer2(true)}>Not Show in Drawer</Button>
    </Flex>
    <Watermark content="Ant Design">
      <Modal destroyOnHidden open={showModal()} title="Modal" onCancel={() => setShowModal(false)} onOk={() => setShowModal(false)}>
        {placeholder()}
      </Modal>
      <Drawer destroyOnHidden open={showDrawer()} title="Drawer" onClose={() => { setShowDrawer(false) }}>
        {placeholder()}
      </Drawer>
    </Watermark>
    <Watermark content="Ant Design" inherit={false}>
      <Drawer destroyOnHidden open={showDrawer2()} title="Drawer" onClose={() => { setShowDrawer2(false) }}>
        {placeholder()}
      </Drawer>
    </Watermark>
  </>
}
