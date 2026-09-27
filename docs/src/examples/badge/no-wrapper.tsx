import { createSignal } from 'solid-js'
import Badge from 'upthrust-ui/source/Badge'
import Switch from 'upthrust-ui/source/Switch'

export default function NoWrapper() {
  const [show, setShow] = createSignal(true)
  return <div class="flex items-center gap-3">
    <Switch aria-label="显示徽标数" checked={show()} onChange={setShow} />
    <Badge count={show() ? 11 : 0} showZero color="#faad14" />
    <Badge count={show() ? 25 : 0} />
    <Badge count={show() ? <span class="i-mdi-clock-outline text-[16px] text-[#f5222d]" /> : 0} />
    <Badge count={show() ? 109 : 0} style={{ 'background-color': '#52c41a' }} />
  </div>
}
