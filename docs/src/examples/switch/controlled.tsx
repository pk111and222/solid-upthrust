import { createSignal } from 'solid-js'
import Switch from 'upthrust-ui/source/Switch'
export default function Controlled() {
 const [checked,setChecked]=createSignal(false)
 const [clicks,setClicks]=createSignal(0)
 return <div class="flex flex-col gap-3">
  <div class="flex items-center gap-3"><label for="switch-controlled">启用提醒</label><Switch id="switch-controlled" checked={checked()} onChange={setChecked} onClick={()=>setClicks(clicks()+1)}/></div>
  <output>状态：{checked()?'开启':'关闭'}；点击：{clicks()}</output>
  <p class="text-sm text-on-surface-variant">鼠标、Enter 和空格均可切换；每次操作先 onClick，再 onChange。</p>
 </div>
}
