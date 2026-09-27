import Splitter, { Panel } from 'upthrust-ui/source/Splitter'

const frame = 'h-[300px] rounded-lg border border-outline-variant overflow-hidden'
const box = 'h-full flex items-center justify-center text-on-surface-variant'

export default function Nested() {
  return <Splitter class={frame} data-splitter-nested>
    {/* 面板内再放 Splitter 组合复杂布局；只含一个嵌套 Splitter 的面板不出现滚动条。 */}
    <Panel defaultSize="30%" collapsible>
      <div class={box}>Left</div>
    </Panel>
    <Panel>
      <Splitter orientation="vertical">
        <Panel defaultSize="60%">
          <div class={box}>Top</div>
        </Panel>
        <Panel collapsible>
          <div class={box}>Bottom</div>
        </Panel>
      </Splitter>
    </Panel>
  </Splitter>
}
