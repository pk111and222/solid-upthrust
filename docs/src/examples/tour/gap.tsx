import { createSignal } from 'solid-js'
import Button, { type ButtonIns } from 'upthrust-ui/source/Button'
import Slider from 'upthrust-ui/source/Slider'
import Tour from 'upthrust-ui/source/Tour'

// gap.offset 控制高亮区外扩（数字或 [x, y]），gap.radius 控制高亮圆角。
export default function Gap() {
  const [open, setOpen] = createSignal(false)
  const [radius, setRadius] = createSignal(8)
  const [offset, setOffset] = createSignal(4)
  let target: ButtonIns | undefined
  return <div class="flex flex-col items-start gap-3">
    <Button type="primary" ref={b => { target = b }} onClick={() => setOpen(true)}>显示</Button>
    <label class="flex items-center gap-3 w-[320px]">Radius <Slider class="flex-1" value={radius()} onChange={v => setRadius(v as number)} /></label>
    <label class="flex items-center gap-3 w-[320px]">Offset <Slider class="flex-1" max={20} value={offset()} onChange={v => setOffset(v as number)} /></label>
    <Tour open={open()} onClose={() => setOpen(false)} gap={{ offset: offset(), radius: radius() }}
      steps={[{ title: '高亮区', description: '拖动滑块实时调整间距与圆角。', target: () => target?.buttonEle() }]} />
  </div>
}
