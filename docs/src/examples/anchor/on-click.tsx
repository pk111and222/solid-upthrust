import { createSignal } from 'solid-js'
import Anchor from 'upthrust-ui/source/Anchor'

export default function OnClick() {
  const [last, setLast] = createSignal('—')
  return <div class="flex flex-col gap-sm">
    <Anchor
      affix={false}
      onClick={(e, link) => {
        // 阻止默认行为后不会写入地址栏的 hash，但仍会平滑滚动到目标。
        e.preventDefault()
        setLast(`${String(link.title)} → ${link.href}`)
      }}
      items={[
        { key: 'part-1', href: '#anchor-basic-part-1', title: 'Part 1' },
        { key: 'part-2', href: '#anchor-basic-part-2', title: 'Part 2' },
        { key: 'part-3', href: '#anchor-basic-part-3', title: 'Part 3' },
      ]}
    />
    <output data-log>onClick：{last()}</output>
  </div>
}
