import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Popconfirm from 'upthrust-ui/source/Popconfirm'

export default function Demo() {
  const [open, setOpen] = createSignal(false)
  const [loading, setLoading] = createSignal(false)
  const handleOk = () => {
    setLoading(true)
    setTimeout(() => { setOpen(false); setLoading(false) }, 2000)
  }
  return (
    <Popconfirm
      title="标题"
      description="受控 open + okButtonProps.loading 的异步确认"
      open={open()}
      onConfirm={handleOk}
      okButtonProps={{ loading: loading() }}
      onCancel={() => setOpen(false)}
    >
      <Button type="primary" onClick={() => setOpen(true)}>异步关闭（受控）</Button>
    </Popconfirm>
  )
}
