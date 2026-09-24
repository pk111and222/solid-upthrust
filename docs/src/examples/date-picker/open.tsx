import { createSignal } from 'solid-js'
import DatePicker from 'upthrust-ui/source/DatePicker'

export default function ControlledOpen() {
  const [open, setOpen] = createSignal(false)
  const [value, setValue] = createSignal<string | null>(null)
  return <div class="flex flex-col gap-3 max-w-sm">
    <button type="button" onClick={() => setOpen(!open())}>{open() ? '关闭日期面板' : '打开日期面板'}</button>
    <DatePicker open={open()} onOpenChange={setOpen} value={value()} onChange={setValue} placeholder="受控日期面板" />
    <output>{open() ? '面板打开' : '面板关闭'}；{value() ?? '未选择日期'}</output>
  </div>
}
