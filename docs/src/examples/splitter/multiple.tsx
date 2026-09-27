import { createSignal } from 'solid-js'
import Splitter, { Panel } from 'upthrust-ui/source/Splitter'

const frame = 'h-[200px] rounded-lg border border-outline-variant overflow-hidden'
const box = 'h-full flex items-center justify-center text-on-surface-variant'

export default function Multiple() {
  const [sizes, setSizes] = createSignal<number[]>([])
  const format = () => sizes().map(size => `${Math.round(size)}px`).join(' + ')
  const total = () => Math.round(sizes().reduce((sum, size) => sum + size, 0))
  return <div class="flex flex-col gap-md" data-splitter-multiple>
    {/* 多面板：拖拽只在相邻两面板间转移尺寸，总和不变；一侧撞到 min / max 后停止。 */}
    <Splitter class={frame} onResizeStart={setSizes} onResize={setSizes} onResizeEnd={setSizes}>
      <Panel min={60}><div class={box}>1</div></Panel>
      <Panel min={60}><div class={box}>2</div></Panel>
      <Panel min={60}><div class={box}>3</div></Panel>
      <Panel min={60}><div class={box}>4</div></Panel>
    </Splitter>
    <span class="font-mono text-sm text-on-surface-variant" data-sizes>
      {sizes().length ? `${format()} = ${total()}px` : '拖动分隔条查看尺寸'}
    </span>
  </div>
}
