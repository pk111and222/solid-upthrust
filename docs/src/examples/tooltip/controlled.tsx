import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import Tooltip from 'upthrust-ui/source/Tooltip'

export default function Demo() {
  const [open, setOpen] = createSignal(false)

  return <Space size="middle">
    <Button variant={open() ? 'solid' : 'outlined'} onClick={() => setOpen(!open())}>
      {open() ? '隐藏提示' : '显示提示'}
    </Button>
    <Tooltip title="受控打开的提示" open={open()} onOpenChange={setOpen}>
      <Button variant="outlined">受控触发器</Button>
    </Tooltip>
    <Tooltip title="仅首次挂载即打开（defaultOpen）" defaultOpen>
      <Button variant="outlined">defaultOpen</Button>
    </Tooltip>
  </Space>
}
