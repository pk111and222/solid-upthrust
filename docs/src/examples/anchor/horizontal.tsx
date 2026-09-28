import Anchor from 'upthrust-ui/source/Anchor'
import { Sections } from './sections'

export default function Horizontal() {
  return <div>
    {/* 横向锚点：ink 贴底并跟随激活标题的 left / width；需要吸顶时用默认 affix 或外层 sticky（注意祖先不能 overflow-hidden）。 */}
    <div class="py-xs">
      <Anchor
        direction="horizontal"
        affix={false}
        targetOffset={120}
        items={[
          { key: 'part-1', href: '#anchor-horizontal-part-1', title: 'Part 1' },
          { key: 'part-2', href: '#anchor-horizontal-part-2', title: 'Part 2' },
          { key: 'part-3', href: '#anchor-horizontal-part-3', title: 'Part 3' },
        ]}
      />
    </div>
    <div class="mt-md"><Sections prefix="anchor-horizontal-part" height={320} /></div>
  </div>
}
