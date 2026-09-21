import { createSignal } from 'solid-js'
import InputNumber from 'upthrust-ui/source/InputNumber'
import Button from 'upthrust-ui/source/Button'
export default function States() {
 const [disabled,setDisabled]=createSignal(true)
 return <div class="flex flex-col gap-4">
  <div class="flex items-center gap-3"><label for="number-states-1">小号</label><InputNumber id="number-states-1" size="small" defaultValue={1}/></div>
  <div class="flex items-center gap-3"><label for="number-states-2">中号</label><InputNumber id="number-states-2" defaultValue={2}/></div>
  <div class="flex items-center gap-3"><label for="number-states-3">大号</label><InputNumber id="number-states-3" size="large" defaultValue={3}/></div>
  <div class="flex items-center gap-3"><label for="number-states-4">禁用</label><InputNumber id="number-states-4" disabled={disabled()} defaultValue={8}/></div>
  <Button onClick={()=>setDisabled(v=>!v)}>切换禁用</Button>
  <div class="flex items-center gap-3"><label for="number-states-5">只读</label><InputNumber id="number-states-5" readonly defaultValue={8}/></div>
  <div class="flex items-center gap-3"><label for="number-states-6">错误</label><InputNumber id="number-states-6" status="error" defaultValue={8}/></div>
  <div class="flex items-center gap-3"><label for="number-states-7">警告</label><InputNumber id="number-states-7" status="warning" defaultValue={8}/></div>
  <div dir="rtl"><div class="flex items-center gap-3"><label for="number-states-8">从右向左</label><InputNumber id="number-states-8" defaultValue={3} prefix={<span>¥</span>} style={{width:'140px'}}/></div></div>
 </div>
}
