import { createSignal } from 'solid-js'
import Button, { type ButtonIns } from 'upthrust-ui/source/Button'
import Tour, { type TourStep } from 'upthrust-ui/source/Tour'

// mask 可传 { style, color } 自定义遮罩；步骤级 mask 覆盖 Tour 级。
export default function Mask() {
  const [open, setOpen] = createSignal(false)
  let upload: ButtonIns | undefined, save: ButtonIns | undefined, more: ButtonIns | undefined
  const steps: TourStep[] = [
    { title: '上传文件', description: '把你的文件放在这里。', target: () => upload?.buttonEle() },
    { title: '保存', description: '保存你的修改。', target: () => save?.buttonEle(), mask: { style: { 'box-shadow': 'inset 0 0 15px #fff' }, color: 'rgba(40, 0, 255, .4)' } },
    { title: '其他操作', description: '点击查看其他操作。', target: () => more?.buttonEle(), mask: false },
  ]
  return <div class="flex flex-col items-start gap-4">
    <Button type="primary" onClick={() => setOpen(true)}>开始导览</Button>
    <div class="flex gap-2">
      <Button ref={b => { upload = b }}>上传</Button>
      <Button ref={b => { save = b }} type="primary">保存</Button>
      <Button ref={b => { more = b }}>···</Button>
    </div>
    <Tour open={open()} onClose={() => setOpen(false)} steps={steps} mask={{ style: { 'box-shadow': 'inset 0 0 15px #333' }, color: 'rgba(80, 255, 255, .4)' }} />
  </div>
}
