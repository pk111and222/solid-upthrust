import Anchor from 'upthrust-ui/source/Anchor'
import { Sections } from './sections'

export default function Basic() {
  return <div class="flex gap-lg">
    <div class="flex-1 min-w-0" data-anchor-content>
      <Sections prefix="anchor-basic-part" />
    </div>
    {/* 默认 affix：页面滚动时固定在窗口顶部 80px（文档顶栏 64px 之下）；targetOffset 默认同 offsetTop。 */}
    <div class="w-[160px] shrink-0">
      <Anchor
        offsetTop={80}
        items={[
          { key: 'part-1', href: '#anchor-basic-part-1', title: 'Part 1' },
          { key: 'part-2', href: '#anchor-basic-part-2', title: 'Part 2' },
          { key: 'part-3', href: '#anchor-basic-part-3', title: 'Part 3' },
        ]}
      />
    </div>
  </div>
}
