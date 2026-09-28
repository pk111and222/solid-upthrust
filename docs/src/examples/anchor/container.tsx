import Anchor from 'upthrust-ui/source/Anchor'
import { Sections } from './sections'

export default function Container() {
  let scroller: HTMLDivElement | undefined
  return <div class="flex gap-lg">
    <div ref={el => { scroller = el }} data-anchor-scroller tabindex={0} aria-label="锚点滚动容器"
      class="flex-1 min-w-0 h-[240px] overflow-auto rounded-lg border border-solid border-outline-variant p-md">
      <Sections prefix="anchor-container-part" count={4} height={200} />
    </div>
    {/* getContainer 指定内部滚动容器：scroll-spy 监听该容器，点击只滚动容器本身。 */}
    <div class="w-[160px] shrink-0">
      <Anchor
        affix={false}
        showInkInFixed
        getContainer={() => scroller}
        items={[1, 2, 3, 4].map(i => ({ key: `part-${i}`, href: `#anchor-container-part-${i}`, title: `Part ${i}` }))}
      />
    </div>
  </div>
}
