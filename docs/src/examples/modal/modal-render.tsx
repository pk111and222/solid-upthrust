import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Modal from 'upthrust-ui/source/Modal'

export default function ModalRender() {
  const [open, setOpen] = createSignal(false)
  const [offset, setOffset] = createSignal({ x: 0, y: 0 })
  // modalRender 包裹容器节点：这里用 pointer 事件在标题栏上拖动整个对话框。
  const drag = (event: PointerEvent) => {
    const start = { x: event.clientX - offset().x, y: event.clientY - offset().y }
    const move = (e: PointerEvent) => setOffset({ x: e.clientX - start.x, y: e.clientY - start.y })
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }
  return <>
    <Button onClick={() => { setOffset({ x: 0, y: 0 }); setOpen(true) }}>Open Draggable Modal</Button>
    <Modal
      title={<div style={{ cursor: 'move' }} onPointerDown={drag}>Draggable Modal</div>}
      open={open()}
      onOk={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      modalRender={node => <div style={{ transform: `translate(${offset().x}px, ${offset().y}px)` }}>{node}</div>}
    >
      <p>Just don&apos;t learn physics at school and your life will be full of magic and miracles.</p>
    </Modal>
  </>
}
