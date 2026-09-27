import Splitter, { Panel } from 'upthrust-ui/source/Splitter'

const frame = 'h-[200px] rounded-lg border border-outline-variant overflow-hidden'
const box = 'h-full flex items-center justify-center text-on-surface-variant'
const icon = 'size-4 flex items-center justify-center rounded-full bg-primary text-on-primary text-xs leading-none'

export default function CollapsibleIcon() {
  return <Splitter
    class={frame}
    collapsible={{ icon: { start: <span class={icon}>‹</span>, end: <span class={icon}>›</span> } }}
    data-splitter-collapsible-icon
  >
    {/* collapsible.icon 替换折叠按钮图标，按钮默认背景随之去掉。
        分隔条的起始侧按钮来自前一面板的 end、末尾侧按钮来自后一面板的 start，因此两个面板都要开启。 */}
    <Panel collapsible={{ end: true, showCollapsibleIcon: true }}>
      <div class={box}>First</div>
    </Panel>
    <Panel collapsible={{ start: true, showCollapsibleIcon: true }}>
      <div class={box}>Second</div>
    </Panel>
  </Splitter>
}
