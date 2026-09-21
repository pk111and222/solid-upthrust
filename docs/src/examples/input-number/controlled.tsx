import { createSignal } from 'solid-js'
import InputNumber from 'upthrust-ui/source/InputNumber'
import Button from 'upthrust-ui/source/Button'
export default function Controlled() {
 const [value,setValue]=createSignal<number|null>(2)
 const [attempt,setAttempt]=createSignal<number|null>(null)
 return <div class="flex flex-col gap-4">
  <div class="flex items-center gap-3"><label for="number-controlled-1">受控数量</label><InputNumber id="number-controlled-1" value={value()} onChange={setValue}/></div>
  <Button onClick={()=>setValue(8)}>设置数量为 8</Button>
  <output>数量：{value()??'空'}</output>
  <div class="flex items-center gap-3"><label for="number-controlled-2">固定数量</label><InputNumber id="number-controlled-2" value={2} onChange={setAttempt}/></div>
  <output>最近请求：{attempt()??'尚无'}</output>
  <p>固定数量只记录请求：步进后仍显示 2；手动输入时保留编辑文本，失焦恢复 2。</p>
 </div>
}
