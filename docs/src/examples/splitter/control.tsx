import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Switch from 'upthrust-ui/source/Switch'
import Splitter, { Panel, type SplitterSize } from 'upthrust-ui/source/Splitter'

const frame = 'h-[200px] rounded-lg border border-outline-variant overflow-hidden'
const box = 'h-full flex items-center justify-center text-on-surface-variant'

export default function Control() {
  const [sizes, setSizes] = createSignal<SplitterSize[]>(['50%', '50%'])
  const [enabled, setEnabled] = createSignal(true)
  return <div class="flex flex-col gap-md" data-splitter-control>
    {/* 受控：拖拽只通过 onResize 通知，写回 size 后才生效。 */}
    <Splitter class={frame} onResize={setSizes}>
      <Panel size={sizes()[0]} resizable={enabled()}>
        <div class={box}>First</div>
      </Panel>
      <Panel size={sizes()[1]}>
        <div class={box}>Second</div>
      </Panel>
    </Splitter>
    <div class="flex flex-wrap items-center gap-sm">
      <Switch checked={enabled()} onChange={setEnabled} checkedChildren="可拖拽" unCheckedChildren="已禁用" />
      <Button onClick={() => setSizes(['50%', '50%'])}>重置</Button>
      <span class="text-on-surface-variant font-mono" data-sizes>
        {sizes().map(size => (typeof size === 'number' ? `${Math.round(size)}px` : size)).join(' / ')}
      </span>
    </div>
  </div>
}
