import { createSignal } from 'solid-js'
import Button, { type ButtonIns } from 'upthrust-ui/source/Button'
import Tour, { type TourStep } from 'upthrust-ui/source/Tour'

// 改变引导相对于目标的位置，共有 12 种位置可供选择；无 target 时居中。
export default function Placement() {
  const [open, setOpen] = createSignal(false)
  let target: ButtonIns | undefined
  const steps: TourStep[] = [
    { title: 'Center', description: '没有 target 时展示在屏幕中央。', target: null },
    { title: 'Right', description: '在目标右侧。', placement: 'right', target: () => target?.buttonEle() },
    { title: 'Top', description: '在目标上方。', placement: 'top', target: () => target?.buttonEle() },
    { title: 'BottomLeft', description: '在目标下方左对齐。', placement: 'bottomLeft', target: () => target?.buttonEle() },
  ]
  return <div>
    <Button type="primary" ref={b => { target = b }} onClick={() => setOpen(true)}>开始导览</Button>
    <Tour open={open()} onClose={() => setOpen(false)} steps={steps} />
  </div>
}
