import { createSignal } from 'solid-js'
import { RadioGroup } from 'upthrust-ui/source/Radio'
import Button from 'upthrust-ui/source/Button'
export default function Controlled() {
 const [value,setValue] = createSignal<string | number>('standard')
 const [pending,setPending] = createSignal<string | number | undefined>(undefined)
 const confirm = () => { const next = pending(); if (next !== undefined) { setValue(next); setPending(undefined) } }
 return <div class="flex flex-col gap-3">
  <RadioGroup value={value()} onChange={setPending} options={[{label:'标准方案',value:'standard'},{label:'高级方案',value:'advanced'}]}/>
  <div class="flex gap-3"><Button disabled={pending() === undefined} onClick={confirm}>确认选择</Button><Button disabled={pending() === undefined} onClick={() => setPending(undefined)}>取消请求</Button></div>
  <output aria-live="polite">{pending() === undefined ? `当前：${value()}` : `待确认：${pending()}`}</output>
  <p class="text-sm text-on-surface-variant">选择新方案后显示请求，确认才改变选中项，取消则保留原值。</p>
 </div>
}
