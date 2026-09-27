import { createSignal } from 'solid-js'
import Splitter, { Panel } from 'upthrust-ui/source/Splitter'

const frame = 'h-[200px] rounded-lg border border-outline-variant overflow-hidden'
const box = 'h-full flex flex-col gap-xs items-center justify-center whitespace-nowrap text-on-surface-variant'

export default function DestroyOnHidden() {
  // 组件体内计数属于有意的“挂载时写入”，因此开启 ownedWrite。
  const [mounts, setMounts] = createSignal(0, { ownedWrite: true })
  /** 每次挂载计数加一：折叠时卸载，展开时重新挂载。 */
  const Tracked = () => {
    setMounts(count => count + 1)
    return <span class="text-sm" data-mounts>已挂载 {mounts()} 次</span>
  }
  return <Splitter class={frame} destroyOnHidden data-splitter-destroy>
    {/* destroyOnHidden：面板折叠（尺寸为 0）时卸载内容；面板自身的 destroyOnHidden 优先。 */}
    <Panel collapsible={{ end: true, showCollapsibleIcon: true }}>
      <div class={box}>First<Tracked /></div>
    </Panel>
    <Panel>
      <div class={box}>Second</div>
    </Panel>
  </Splitter>
}
