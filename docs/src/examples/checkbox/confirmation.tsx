import { createSignal } from 'solid-js'
import Checkbox from 'upthrust-ui/source/Checkbox'
import Button from 'upthrust-ui/source/Button'
export default function Confirmation() {
 const [checked, setChecked] = createSignal(false)
 const [pending, setPending] = createSignal<boolean | undefined>(undefined)
 const confirm = () => {
  const next = pending()
  if (next === undefined) return
  setChecked(next)
  setPending(undefined)
 }
 return <div class="flex flex-col gap-3">
  <div class="flex flex-wrap items-center gap-4">
   <Checkbox checked={checked()} onChange={setPending}>需确认的选项</Checkbox>
   <Button disabled={pending() === undefined} onClick={confirm}>确认变更</Button>
   <Button disabled={pending() === undefined} onClick={() => setPending(undefined)}>取消变更</Button>
  </div>
  <output aria-live="polite">{pending() === undefined ? `当前状态：${checked() ? '已勾选' : '未勾选'}` : `已收到${pending() ? '勾选' : '取消勾选'}请求，请确认或取消变更。`}</output>
  <p class="text-sm text-on-surface-variant">点击选项先提出变更请求，确认后父层才更新 checked。取消变更会保留原状态。</p>
 </div>
}
