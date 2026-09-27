import Splitter, { Panel } from 'upthrust-ui/source/Splitter'

const frame = 'h-[200px] rounded-lg border border-outline-variant overflow-hidden'
const box = 'h-full flex items-center justify-center text-on-surface-variant'

export default function Lazy() {
  return <div class="flex flex-col gap-md" data-splitter-lazy>
    {/* lazy：拖拽中只移动预览线（同样受 min / max 约束），松开后一次性调整；适合面板内容渲染成本高的场景。 */}
    <Splitter lazy class={frame}>
      <Panel defaultSize="40%" min="20%" max="70%">
        <div class={box}>First</div>
      </Panel>
      <Panel>
        <div class={box}>Second</div>
      </Panel>
    </Splitter>
    <Splitter lazy orientation="vertical" class={frame}>
      <Panel defaultSize="40%" min="30%" max="70%">
        <div class={box}>Top</div>
      </Panel>
      <Panel>
        <div class={box}>Bottom</div>
      </Panel>
    </Splitter>
  </div>
}
