import { createSignal } from 'solid-js'
import ColorPicker from 'upthrust-ui/source/ColorPicker'

export default function ControlledOpen() {
  const [open, setOpen] = createSignal(false)
  const [value, setValue] = createSignal<string | null>('#722ed1')
  return <div class="flex flex-col gap-3 max-w-sm">
    <button type="button" onClick={() => setOpen(!open())}>{open() ? '关闭颜色面板' : '打开颜色面板'}</button>
    <ColorPicker open={open()} onOpenChange={setOpen} value={value()} showText
      onChange={color => setValue(color?.toHexString() ?? null)} />
    <output>{open() ? '面板打开' : '面板关闭'}；颜色：{value() ?? '未选择'}</output>
  </div>
}
