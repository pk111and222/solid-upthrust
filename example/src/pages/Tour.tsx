import { createSignal } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { Button, Divider, Tour, type ButtonIns, type TourStep } from 'upthrust-ui'

// 封面用带固有宽度的内联 SVG 图片：面板 max-width: fit-content，封面图片（488 + 左右 16）撑满 520（与 antd 示例一致）。
const coverSrc = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="488" height="120" viewBox="0 0 488 120"><rect width="488" height="120" rx="6" fill="#e6f4ff"/><circle cx="72" cy="60" r="32" fill="#1677ff" opacity=".85"/></svg>')}`

const Demo = (props: { id: string; title: string; desc: string; children: JSX.Element }) => <section data-tour-demo={props.id} class="mb-6">
  <h3 class="text-lg font-semibold mb-1">{props.title}</h3>
  <p class="text-sm text-on-surface-variant mb-3">{props.desc}</p>
  <div class="flex flex-col items-start gap-3">{props.children}</div>
</section>

export default function TourPage() {
  // 基本：三个目标 + 封面，默认 mask。
  const [basic, setBasic] = createSignal(false)
  let upload: ButtonIns | undefined, save: ButtonIns | undefined, more: ButtonIns | undefined
  const basicSteps: TourStep[] = [
    { title: '上传文件', description: '把你的文件放在这里。', cover: <img alt="封面" src={coverSrc} />, target: () => upload?.buttonEle() },
    { title: '保存', description: '保存你的修改。', target: () => save?.buttonEle() },
    { title: '其他操作', description: '点击查看其他操作。', target: () => more?.buttonEle() },
  ]
  // 非模态 primary。
  const [primary, setPrimary] = createSignal(false)
  let primaryTarget: ButtonIns | undefined
  // 位置 / 翻转：右边缘目标 placement right 会翻到 left；无目标居中。
  const [place, setPlace] = createSignal(false)
  let edge: ButtonIns | undefined
  // 遮罩与交互。
  const [mask, setMask] = createSignal(false)
  const [clicks, setClicks] = createSignal(0)
  let clickable: ButtonIns | undefined
  // 异步守卫 + 操作区定制。
  const [custom, setCustom] = createSignal(false)
  const [status, setStatus] = createSignal('尚未开始')
  let first: ButtonIns | undefined, second: ButtonIns | undefined
  return <div class="p-6 max-w-4xl">
    <h2 class="text-2xl font-bold mb-3">Tour 漫游式引导</h2>
    <p class="text-on-surface-variant mb-6">对齐 antd 6：SVG 镂空遮罩、箭头、12 方位 + 居中、指示点、small 按钮、primary 类型、←/→ 与 Escape 键盘、语义化 classNames / styles。</p>

    <Demo id="basic" title="基本" desc="默认 mask + 箭头，gap 6 / 圆角 2 的高亮区；←/→ 切换，Escape 关闭。">
      <Button type="primary" data-tour-open="basic" onClick={() => setBasic(true)}>开始导览</Button>
      <div class="flex gap-2">
        <Button ref={b => { upload = b }} data-tour-target="upload">上传</Button>
        <Button ref={b => { save = b }} type="primary" data-tour-target="save">保存</Button>
        <Button ref={b => { more = b }} data-tour-target="more">···</Button>
      </div>
      <Tour open={basic()} onClose={() => setBasic(false)} steps={basicSteps} />
    </Demo>
    <Divider />

    <Demo id="primary" title="非模态 + primary" desc="mask={false}，type primary：主色面板、白色指示点、白底主色“下一步”。">
      <Button data-tour-open="primary" ref={b => { primaryTarget = b }} onClick={() => setPrimary(true)}>开始（primary）</Button>
      <Tour open={primary()} onClose={() => setPrimary(false)} mask={false} type="primary"
        steps={[{ title: '主色引导', description: '非模态，页面可操作。', target: () => primaryTarget?.buttonEle() }, { title: '第二步', description: '上一步为白边按钮。', target: () => primaryTarget?.buttonEle(), placement: 'right' }]} />
    </Demo>
    <Divider />

    <Demo id="placement" title="位置与翻转" desc="目标贴近右边缘：placement right 空间不足翻转到 left；第二步 topLeft 左对齐；第三步无目标居中。">
      <div class="w-full flex justify-end"><Button data-tour-open="placement" ref={b => { edge = b }} onClick={() => setPlace(true)}>右边缘目标</Button></div>
      <Tour open={place()} onClose={() => setPlace(false)} width={300}
        steps={[
          { title: 'Right → Left', description: '右侧放不下时翻转。', placement: 'right', target: () => edge?.buttonEle() },
          { title: 'TopLeft', description: '上方左对齐（被视口夹住）。', placement: 'topLeft', target: () => edge?.buttonEle() },
          { title: 'Center', description: '没有 target 时居中。' },
        ]} />
    </Demo>
    <Divider />

    <Demo id="mask" title="自定义遮罩 · 高亮可交互" desc="mask 自定义颜色，gap { offset: 10, radius: 8 }；未禁用交互时可以点击高亮的目标。">
      <div class="flex gap-2 items-center">
        <Button data-tour-open="mask" onClick={() => setMask(true)}>开始</Button>
        <Button ref={b => { clickable = b }} data-tour-target="clickable" onClick={() => setClicks(c => c + 1)}>可点击目标</Button>
        <span data-tour-clicks>已点击 {clicks()} 次</span>
      </div>
      <Tour open={mask()} onClose={() => setMask(false)} mask={{ color: 'rgba(40, 0, 255, 0.4)' }} gap={{ offset: 10, radius: 8 }}
        steps={[{ title: '试着点击目标', description: '遮罩的四块覆盖矩形拦截其他区域的点击。', target: () => clickable?.buttonEle(), placement: 'top' }]} />
    </Demo>
    <Divider />

    <Demo id="custom" title="异步校验 · 操作区定制" desc="beforeChange 延迟 500ms（主按钮 loading）；actionsRender 追加“跳过”；nextButtonProps 改文案。">
      <div class="flex gap-2 items-center">
        <Button data-tour-open="custom" ref={b => { first = b }} onClick={() => { setStatus('进行中'); setCustom(true) }}>开始</Button>
        <Button ref={b => { second = b }}>第二个目标</Button>
        <span data-tour-status>{status()}</span>
      </div>
      <Tour open={custom()} onClose={(_, reason) => { setCustom(false); setStatus(`已关闭：${reason}`) }}
        beforeChange={() => new Promise<boolean>(resolve => setTimeout(() => resolve(true), 500))}
        actionsRender={(origin, info) => <>{info.current < info.total - 1 && <Button size="small" type="text" data-tour-skip onClick={() => { setCustom(false); setStatus('已跳过') }}>跳过</Button>}{origin}</>}
        steps={[
          { title: '第一步', description: '点击“继续”后校验 500ms。', target: () => first?.buttonEle(), nextButtonProps: { children: '继续' } },
          { title: '第二步', description: '完成后关闭。', target: () => second?.buttonEle(), nextButtonProps: { children: '完成' } },
        ]} />
    </Demo>
  </div>
}
