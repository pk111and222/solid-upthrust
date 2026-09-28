import { Show, createSignal } from 'solid-js'
import Affix from 'upthrust-ui/source/Affix'
import Button from 'upthrust-ui/source/Button'
import InputNumber from 'upthrust-ui/source/InputNumber'
import Switch from 'upthrust-ui/source/Switch'
import type { AffixIns } from 'upthrust-competence'

export default function Target() {
  let scroller: HTMLDivElement | undefined
  let instance: AffixIns | undefined
  const [disabled, setDisabled] = createSignal(false)
  const [offset, setOffset] = createSignal<number | null>(12)
  const [affixed, setAffixed] = createSignal(false)
  const [large, setLarge] = createSignal(false)
  return <div class="flex flex-col gap-sm">
    <div class="flex flex-wrap items-center gap-md">
      <label class="flex items-center gap-xs"><Switch checked={disabled()} onChange={setDisabled} />禁用</label>
      <label class="flex items-center gap-xs">offsetTop <InputNumber aria-label="offsetTop" min={0} max={80} value={offset()} onChange={setOffset} /></label>
      <Button onClick={() => setLarge(value => !value)}>切换内容高度</Button>
      <Button onClick={() => instance?.updatePosition()}>updatePosition</Button>
    </div>
    <output data-affixed={String(affixed())}>{affixed() ? '已固定' : '文档流中'}</output>
    {/* target 指定滚动容器：固定时在占位块内 absolute 定位，随容器一起被裁剪。 */}
    <div ref={el => { scroller = el }} data-affix-scroller tabindex={0} aria-label="固钉滚动容器"
      class="h-[240px] overflow-auto rounded-lg border border-solid border-outline-variant">
      <div class="h-[720px] p-md">
        <p class="m-0 mb-[100px] text-on-surface-variant">向下滚动此区域。</p>
        <Affix target={() => scroller} offsetTop={offset() ?? 0} disabled={disabled()} zIndex={20}
          affixClass="shadow" onChange={setAffixed} ref={value => { instance = value }}>
          <div class="rounded bg-primary p-sm text-on-primary">
            容器内的固钉
            <Show when={large()}><p class="m-0 mt-xs text-sm">高度变化后占位与位置自动更新。</p></Show>
          </div>
        </Affix>
      </div>
    </div>
  </div>
}
