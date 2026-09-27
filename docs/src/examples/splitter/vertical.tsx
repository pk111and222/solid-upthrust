import Splitter, { Panel } from 'upthrust-ui/source/Splitter'

const frame = 'h-[300px] rounded-lg border border-outline-variant overflow-hidden'
const box = 'h-full flex items-center justify-center text-on-surface-variant'

export default function Vertical() {
  return <Splitter orientation="vertical" class={frame} data-splitter-vertical>
    {/* 纵向时方向键为上 / 下；也可以写成 vertical。 */}
    <Panel>
      <div class={box}>Top</div>
    </Panel>
    <Panel>
      <div class={box}>Bottom</div>
    </Panel>
  </Splitter>
}
