import { createSignal } from 'solid-js'
import Button, { type ButtonIns } from 'upthrust-ui/source/Button'
import Tour, { type TourStep } from 'upthrust-ui/source/Tour'
import { coverSrc } from './_cover'

// mask={false} 且 type="primary"：非模态引导，页面仍可操作。
export default function NonModal() {
  const [open, setOpen] = createSignal(false)
  let upload: ButtonIns | undefined, save: ButtonIns | undefined
  const steps: TourStep[] = [
    { title: '上传文件', description: '把你的文件放在这里。', cover: <img alt="tour.png" src={coverSrc} />, target: () => upload?.buttonEle() },
    { title: '保存', description: '保存你的修改。', target: () => save?.buttonEle() },
  ]
  return <div class="flex flex-col items-start gap-4">
    <Button type="primary" onClick={() => setOpen(true)}>开始导览</Button>
    <div class="flex gap-2">
      <Button ref={b => { upload = b }}>上传</Button>
      <Button ref={b => { save = b }} type="primary">保存</Button>
    </div>
    <Tour open={open()} onClose={() => setOpen(false)} mask={false} type="primary" steps={steps} />
  </div>
}
