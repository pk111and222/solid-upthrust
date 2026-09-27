import Splitter, { Panel } from 'upthrust-ui/source/Splitter'

const frame = 'h-[200px] rounded-lg border border-outline-variant overflow-hidden'
const box = 'h-full flex items-center justify-center text-on-surface-variant'

export default function Basic() {
  return <Splitter class={frame} data-splitter-basic>
    {/* defaultSize 支持 px 与百分比；min / max 限制拖拽范围。聚焦分隔条后可用方向键、Home、End 调整。 */}
    <Panel defaultSize="40%" min="20%" max="70%">
      <div class={box}>First（20% ~ 70%）</div>
    </Panel>
    <Panel>
      <div class={box}>Second</div>
    </Panel>
  </Splitter>
}
