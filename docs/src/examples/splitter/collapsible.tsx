import { For, createSignal } from 'solid-js'
import Splitter, { Panel } from 'upthrust-ui/source/Splitter'

const frame = 'h-[200px] rounded-lg border border-outline-variant overflow-hidden'
const box = 'h-full flex items-center justify-center whitespace-nowrap text-on-surface-variant'

export default function Collapsible() {
  const [log, setLog] = createSignal<string[]>([])
  return <div class="flex flex-col gap-md" data-splitter-collapsible>
    {/* collapsible：分隔条上出现折叠按钮（默认悬停显示，触屏常显）；折叠后再点另一侧按钮恢复原尺寸。 */}
    <Splitter
      class={frame}
      collapsible={{ motion: true }}
      onCollapse={(collapsed, sizes) => setLog(lines => [`collapsed=[${collapsed}] sizes=[${sizes.map(Math.round)}]`, ...lines].slice(0, 3))}
    >
      <Panel collapsible min="20%">
        <div class={box}>First（两侧可折叠）</div>
      </Panel>
      <Panel collapsible={{ start: true, showCollapsibleIcon: true }}>
        <div class={box}>Second（按钮常显）</div>
      </Panel>
      <Panel>
        <div class={box}>Third</div>
      </Panel>
    </Splitter>
    <ul class="m-0 pl-lg font-mono text-sm text-on-surface-variant" data-log>
      <For each={log()}>{line => <li>{line}</li>}</For>
    </ul>
  </div>
}
