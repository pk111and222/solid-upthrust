import { createSignal } from 'solid-js'
import Anchor from 'upthrust-ui/source/Anchor'
import InputNumber from 'upthrust-ui/source/InputNumber'

export default function TargetOffset() {
  const [offset, setOffset] = createSignal<number | null>(200)
  return <div class="flex flex-col gap-sm">
    <label class="flex items-center gap-xs">targetOffset <InputNumber aria-label="targetOffset" min={0} max={600} value={offset()} onChange={value => setOffset(value)} /> px</label>
    {/* 点击后目标区块停在距窗口顶部 targetOffset 处；高亮判定线同样下移。 */}
    <Anchor
      affix={false}
      showInkInFixed
      targetOffset={offset() ?? 0}
      items={[
        { key: 'part-1', href: '#anchor-basic-part-1', title: 'Part 1' },
        { key: 'part-2', href: '#anchor-basic-part-2', title: 'Part 2' },
        { key: 'part-3', href: '#anchor-basic-part-3', title: 'Part 3' },
      ]}
    />
  </div>
}
