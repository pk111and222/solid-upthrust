import { createSignal } from 'solid-js'
import Splitter, { Panel, type SplitterSize } from 'upthrust-ui/source/Splitter'

const frame = 'h-[200px] rounded-lg border border-outline-variant overflow-hidden'
const box = 'h-full flex items-center justify-center text-on-surface-variant'
const initial: SplitterSize[] = ['30%', '40%', '30%']

export default function DoubleClick() {
  const [sizes, setSizes] = createSignal<SplitterSize[]>(initial)
  /** 双击第 index 条分隔条：把它两侧的面板恢复为初始尺寸。 */
  const reset = (index: number) => {
    setSizes(current => current.map((size, i) => (i === index || i === index + 1 ? initial[i] : size)))
  }
  return <Splitter class={frame} onResize={setSizes} onDraggerDoubleClick={reset} data-splitter-double-click>
    <Panel size={sizes()[0]}><div class={box}>双击分隔条</div></Panel>
    <Panel size={sizes()[1]}><div class={box}>恢复两侧</div></Panel>
    <Panel size={sizes()[2]}><div class={box}>初始尺寸</div></Panel>
  </Splitter>
}
