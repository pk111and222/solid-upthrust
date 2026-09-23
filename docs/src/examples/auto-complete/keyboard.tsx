import { createSignal } from 'solid-js'
import AutoComplete from 'upthrust-ui/source/AutoComplete'
import Button from 'upthrust-ui/source/Button'

export default function Keyboard() {
  const [open, setOpen] = createSignal(false)
  const [events, setEvents] = createSignal('尚未聚焦')
  let input: HTMLInputElement | undefined
  return <div class="flex flex-col gap-3 max-w-sm">
    <AutoComplete aria-label="键盘建议" ref={el => { input = el }} open={open()} onOpenChange={setOpen}
      onFocus={() => setEvents('已聚焦')} onBlur={() => setEvents('已失焦')}
      options={Array.from({ length: 30 }, (_, i) => ({ value: `建议 ${String(i + 1).padStart(2, '0')}` }))}
      placeholder="方向键移动，Enter 选中，Esc 关闭" />
    <Button onClick={() => input?.focus()}>聚焦建议</Button>
    <output>{events()}；{open() ? '已展开' : '已关闭'}</output>
  </div>
}
