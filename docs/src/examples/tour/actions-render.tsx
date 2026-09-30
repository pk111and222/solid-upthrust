import { createSignal } from 'solid-js'
import Button, { type ButtonIns } from 'upthrust-ui/source/Button'
import Tour, { type TourStep } from 'upthrust-ui/source/Tour'

// actionsRender 自定义操作区：在默认按钮前追加“跳过”；nextButtonProps / prevButtonProps 改按钮文案。
export default function ActionsRender() {
  const [open, setOpen] = createSignal(false)
  const [current, setCurrent] = createSignal(0)
  let upload: ButtonIns | undefined, save: ButtonIns | undefined, more: ButtonIns | undefined
  const steps: TourStep[] = [
    { title: '上传文件', description: '把你的文件放在这里。', target: () => upload?.buttonEle(), nextButtonProps: { children: '去保存' } },
    { title: '保存', description: '保存你的修改。', target: () => save?.buttonEle(), prevButtonProps: { children: '回到上传' } },
    { title: '其他操作', description: '点击查看其他操作。', target: () => more?.buttonEle(), nextButtonProps: { children: '知道了' } },
  ]
  return <div class="flex flex-col items-start gap-4">
    <Button type="primary" onClick={() => { setCurrent(0); setOpen(true) }}>开始导览</Button>
    <div class="flex gap-2">
      <Button ref={b => { upload = b }}>上传</Button>
      <Button ref={b => { save = b }} type="primary">保存</Button>
      <Button ref={b => { more = b }}>···</Button>
    </div>
    <Tour open={open()} current={current()} onChange={setCurrent} onClose={() => setOpen(false)} steps={steps}
      actionsRender={(origin, { current, total }) => <>
        {current !== total - 1 && <Button size="small" onClick={() => setOpen(false)}>跳过</Button>}
        {origin}
      </>} />
  </div>
}
