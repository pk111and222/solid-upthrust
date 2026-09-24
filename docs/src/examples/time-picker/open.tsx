import { createSignal } from 'solid-js'
import TimePicker from 'upthrust-ui/source/TimePicker'

export default function ControlledOpen() {
  const [open, setOpen] = createSignal(false)
  const [value, setValue] = createSignal<string | null>(null)
  return <div class="flex flex-col gap-3 max-w-sm">
    <button type="button" onClick={() => setOpen(!open())}>{open() ? '关闭时间面板' : '打开时间面板'}</button>
    <TimePicker open={open()} onOpenChange={setOpen} value={value()} onChange={setValue} placeholder="受控时间面板" />
    <output>面板：{open() ? '打开' : '关闭'}；时间：{value() ?? '未选择'}</output>
  </div>
}
