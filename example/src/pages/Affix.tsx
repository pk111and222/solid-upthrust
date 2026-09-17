import { createSignal } from 'solid-js'
import { Affix, Button, Divider, Switch } from 'upthrust-ui'
import type { AffixIns } from 'upthrust-competence'
export default function AffixPage() {
  let topTarget!: HTMLDivElement, bottomTarget!: HTMLDivElement
  let instance: AffixIns | undefined
  const [disabled, setDisabled] = createSignal(false)
  const [offset, setOffset] = createSignal(12)
  const [affixed, setAffixed] = createSignal(false)
  const [large, setLarge] = createSignal(false)
  return <div class="p-6 max-w-4xl">
    <h2 class="text-2xl font-bold mb-3">Affix 固钉</h2>
    <p class="text-on-surface-variant mb-6">滚动到指定位置后保留操作区域，原位置继续占位，避免页面跳动。</p>
    <h3 class="text-lg font-semibold mb-3">顶部固钉 · 自定义滚动容器</h3>
    <div class="flex flex-wrap items-center gap-4 mb-3">
      <label class="flex items-center gap-2"><Switch checked={disabled()} onChange={setDisabled} />禁用固钉</label>
      <label>顶部距离 <input aria-label="顶部距离" type="number" min="0" max="80" value={offset()} class="w-[70px] border border-solid border-outline-variant rounded px-2 py-1" onInput={e => setOffset(Number.isFinite(e.currentTarget.valueAsNumber) ? e.currentTarget.valueAsNumber : 0)} /> px</label>
      <Button onClick={() => setLarge(!large())}>切换内容高度</Button>
      <Button onClick={() => instance?.updatePosition()}>手动更新位置</Button>
    </div>
    <p role="status" class="text-sm text-on-surface-variant mb-3">当前状态：{affixed() ? '已固钉' : '正常文档流'}</p>
    <div ref={topTarget} aria-label="顶部固钉滚动容器" tabindex={0} class="h-[300px] overflow-auto border border-solid border-outline-variant rounded bg-surface-container-low">
      <div class="px-4 py-4"><p class="h-[100px] text-on-surface-variant">向下滚动此区域，蓝色操作栏会固定在容器顶部。</p>
        <Affix target={() => topTarget} offsetTop={offset()} disabled={disabled()} onChange={setAffixed} ref={value => { instance = value }} affixClass="shadow-md" zIndex={20}>
          <div class="bg-primary text-on-primary rounded p-3"><div class="flex items-center justify-between gap-3"><strong>项目操作栏</strong><Button onClick={() => { topTarget.scrollTo({ top: 0, behavior: 'smooth' }) }}>回到起点</Button></div>
            {large() && <p class="mt-3 text-sm">内容高度发生变化时，占位区域与固定位置会自动更新。</p>}
          </div>
        </Affix>
        <div class="h-[550px] pt-6 text-on-surface-variant">业务内容区域<p class="mt-24">继续向下滚动，操作栏会保持可见。</p></div>
      </div>
    </div>
    <Divider />
    <h3 class="text-lg font-semibold mb-3">底部固钉</h3>
    <p class="text-sm text-on-surface-variant mb-3">操作栏的原位置位于内容末尾，在到达原位置前固定于容器底部 12px 处。</p>
    <div ref={bottomTarget} aria-label="底部固钉滚动容器" tabindex={0} class="h-[280px] overflow-auto border border-solid border-outline-variant rounded bg-surface-container-low">
      <div class="p-4"><div class="h-[520px] text-on-surface-variant">较长的编辑内容<p class="mt-24">向下滚动到底部，操作栏会回到正常文档流。</p></div>
        <Affix target={() => bottomTarget} offsetBottom={12} affixClass="shadow-md">
          <div class="flex items-center justify-between gap-3 rounded border border-solid border-outline-variant bg-surface p-3"><span>修改后记得保存</span><Button variant="solid">保存修改</Button></div>
        </Affix>
      </div>
    </div>
    <Divider />
    <h3 class="text-lg font-semibold mb-3">默认目标 · 浏览器窗口</h3>
    <p class="text-sm text-on-surface-variant mb-3">不传 target 时，以浏览器窗口为目标。此示例也会监听祖先滚动；向下滚动页面即可观察效果。</p>
    <Affix offsetTop={16} class="max-w-[300px]" affixClass="shadow-lg">
      <div class="rounded border border-solid border-primary bg-surface px-4 py-3 text-primary">固定在窗口顶部 16px</div>
    </Affix>
    <div class="h-[450px] pt-6 text-sm text-on-surface-variant">为窗口固钉效果保留的滚动空间。</div>
  </div>
}
