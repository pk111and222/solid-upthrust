import { createSignal } from 'solid-js'
import Button, { type ButtonIns } from 'upthrust-ui/source/Button'
import Tour, { type TourStep } from 'upthrust-ui/source/Tour'

// indicatorsRender 自定义指示器。
export default function Indicator() {
  const [open, setOpen] = createSignal(false)
  let upload: ButtonIns | undefined, save: ButtonIns | undefined, more: ButtonIns | undefined
  const steps: TourStep[] = [
    { title: '上传文件', description: '把你的文件放在这里。', target: () => upload?.buttonEle() },
    { title: '保存', description: '保存你的修改。', target: () => save?.buttonEle() },
    { title: '其他操作', description: '点击查看其他操作。', target: () => more?.buttonEle() },
  ]
  return <div class="flex flex-col items-start gap-4">
    <Button type="primary" onClick={() => setOpen(true)}>开始导览</Button>
    <div class="flex gap-2">
      <Button ref={b => { upload = b }}>上传</Button>
      <Button ref={b => { save = b }} type="primary">保存</Button>
      <Button ref={b => { more = b }}>···</Button>
    </div>
    <Tour open={open()} onClose={() => setOpen(false)} steps={steps}
      indicatorsRender={(current, total) => <span>{current + 1} / {total}</span>} />
  </div>
}
