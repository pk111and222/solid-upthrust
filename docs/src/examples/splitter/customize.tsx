import Splitter, { Panel } from 'upthrust-ui/source/Splitter'

const frame = 'h-[200px] rounded-lg border border-outline-variant overflow-hidden'
const box = 'h-full flex items-center justify-center text-on-surface-variant'

export default function Customize() {
  return <Splitter
    class={frame}
    draggerIcon={<span class="i-mdi-drag-vertical text-base" />}
    classNames={{ panel: 'bg-surface-variant/40', dragger: { default: 'bg-on-surface/4', active: 'bg-primary/15' } }}
    styles={{ dragger: { active: { 'box-shadow': '0 0 0 1px rgb(var(--upthrust-colors-primary))' } } }}
    data-splitter-customize
  >
    {/* draggerIcon 替换默认抓手；classNames / styles 的 dragger 可分别定制常态与拖拽中（active）。
        主题色变量是裸 RGB 通道值，内联样式里须写成 rgb(var(--upthrust-colors-primary))。 */}
    <Panel>
      <div class={box}>First</div>
    </Panel>
    <Panel>
      <div class={box}>Second</div>
    </Panel>
  </Splitter>
}
