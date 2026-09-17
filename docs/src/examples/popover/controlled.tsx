import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import Popover from 'upthrust-ui/source/Popover'

export default function Demo() {
  const [open, setOpen] = createSignal(false)

  return <Space size="middle">
    <Button variant={open() ? 'solid' : 'outlined'} onClick={() => setOpen(!open())}>
      {open() ? '关闭卡片' : '打开卡片'}
    </Button>
    <Popover title="受控卡片" content="由外部信号控制开关" open={open()} onOpenChange={setOpen} trigger="click">
      <Button variant="outlined">受控触发器</Button>
    </Popover>
    <Popover title="仅首次挂载即打开" content="defaultOpen" defaultOpen>
      <Button variant="outlined">defaultOpen</Button>
    </Popover>
  </Space>
}
