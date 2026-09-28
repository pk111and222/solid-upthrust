import { createSignal } from 'solid-js'
import Anchor from 'upthrust-ui/source/Anchor'

export default function OnChange() {
  const [log, setLog] = createSignal<string[]>([])
  return <div class="flex flex-col gap-sm">
    <Anchor
      affix={false}
      showInkInFixed
      onChange={href => setLog(list => [href || '（无）', ...list].slice(0, 5))}
      items={[
        { key: 'part-1', href: '#anchor-basic-part-1', title: 'Part 1' },
        { key: 'part-2', href: '#anchor-basic-part-2', title: 'Part 2' },
        { key: 'part-3', href: '#anchor-basic-part-3', title: 'Part 3' },
      ]}
    />
    <output data-log={log().join(',')}>onChange（最新在前）：{log().join(' ← ') || '—'}</output>
  </div>
}
