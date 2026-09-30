import { createSignal } from 'solid-js'
import Button, { type ButtonIns } from 'upthrust-ui/source/Button'
import Checkbox from 'upthrust-ui/source/Checkbox'
import Tour from 'upthrust-ui/source/Tour'

// 扩展：beforeChange 返回 Promise，校验期间主按钮 loading；返回 false 否决切换。
export default function Async() {
  const [open, setOpen] = createSignal(false)
  const [agreed, setAgreed] = createSignal(false)
  const [tip, setTip] = createSignal('')
  let target: ButtonIns | undefined
  return <div class="flex flex-col items-start gap-3">
    <Button type="primary" onClick={() => { setAgreed(false); setTip(''); setOpen(true) }}>开始导览</Button>
    <Checkbox checked={agreed()} onChange={setAgreed}>我已阅读说明</Checkbox>
    <Button ref={b => { target = b }}>下一步的目标</Button>
    <span class="text-on-surface-variant">{tip()}</span>
    <Tour open={open()} onClose={() => setOpen(false)} mask={false}
      beforeChange={async next => {
        if (next === 1 && !agreed()) { setTip('请先勾选“我已阅读说明”'); return false }
        await new Promise(resolve => setTimeout(resolve, 600)); setTip(''); return true
      }}
      steps={[{ title: '先阅读说明', description: '勾选复选框后点击下一步（页面可操作）。' }, { title: '完成校验', description: '校验通过后才进入这一步。', target: () => target?.buttonEle() }]} />
  </div>
}
