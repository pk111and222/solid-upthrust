import { createSignal } from 'solid-js'
import Anchor from 'upthrust-ui/source/Anchor'
import Button from 'upthrust-ui/source/Button'

const links = ['#anchor-basic-part-1', '#anchor-basic-part-2', '#anchor-basic-part-3']

export default function CustomHighlight() {
  const [pinned, setPinned] = createSignal(links[2])
  return <div class="flex flex-col gap-sm">
    <div class="flex flex-wrap gap-xs">
      {links.map((href, i) => <Button size="small" type={pinned() === href ? 'primary' : 'default'} onClick={() => setPinned(href)}>高亮 Part {i + 1}</Button>)}
    </div>
    {/* getCurrentAnchor 接收滚动计算出的 href，返回值决定高亮项；这里忽略滚动、固定为按钮选择的链接。 */}
    <Anchor
      affix={false}
      showInkInFixed
      getCurrentAnchor={() => pinned()}
      items={links.map((href, i) => ({ key: `part-${i + 1}`, href, title: `Part ${i + 1}` }))}
    />
  </div>
}
