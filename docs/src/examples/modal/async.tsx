import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Modal from 'upthrust-ui/source/Modal'

export default function Async() {
  const [open, setOpen] = createSignal(false)
  const [text, setText] = createSignal('Content of the modal')
  // onOk 返回 Promise：确定按钮 loading，resolve 后关闭；reject 保持打开。
  const onOk = () => {
    setText('The modal will be closed after two seconds')
    return new Promise<void>(resolve => setTimeout(() => { setOpen(false); resolve() }, 2000))
  }
  return <>
    <Button type="primary" onClick={() => { setText('Content of the modal'); setOpen(true) }}>Open Modal with async logic</Button>
    <Modal title="Title" open={open()} onOk={onOk} onCancel={() => setOpen(false)}>
      <p>{text()}</p>
    </Modal>
  </>
}
