import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Switch from 'upthrust-ui/source/Switch'
import Popconfirm from 'upthrust-ui/source/Popconfirm'

export default function Demo() {
  const [open, setOpen] = createSignal(false)
  const [direct, setDirect] = createSignal(true)
  const [last, setLast] = createSignal('（未操作）')
  const confirm = () => { setOpen(false); setLast('执行下一步') }
  const cancel = () => { setOpen(false); setLast('点击了取消') }
  // 打开前判断条件：满足条件直接执行，否则才弹出确认。
  const onOpenChange = (next: boolean) => {
    if (!next) { setOpen(false); return }
    if (direct()) confirm()
    else setOpen(true)
  }
  return <div class="flex flex-col items-start gap-3">
    <Popconfirm title="删除任务" description="确定要删除这个任务吗？" open={open()} onOpenChange={onOpenChange}
      onConfirm={confirm} onCancel={cancel} okText="是" cancelText="否">
      <Button danger>删除任务</Button>
    </Popconfirm>
    <label class="flex items-center gap-2">是否直接执行：<Switch checked={direct()} onChange={checked => setDirect(checked)} /></label>
    <span class="text-on-surface-variant">最近操作：{last()}</span>
  </div>
}
