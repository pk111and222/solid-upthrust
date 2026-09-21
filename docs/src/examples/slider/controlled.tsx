import { createSignal } from 'solid-js'
import Slider from 'upthrust-ui/source/Slider'
import Button from 'upthrust-ui/source/Button'
export default function Controlled() {
 const [value,setValue]=createSignal(20),[request,setRequest]=createSignal('尚无请求')
 return <div class="px-3 flex flex-col gap-3">
  <p>受控进度</p><Slider aria-label="受控进度" value={value()} onChange={setValue}/><output>进度：{value()}</output>
  <Button onClick={()=>setValue(80)}>设置为 80</Button>
  <p>固定进度</p><Slider aria-label="固定进度" value={30} onChange={v=>setRequest(String(v))}/><output>请求：{request()}</output>
  <p>固定进度记录操作请求，父层不更新时仍保持 30。</p>
 </div>
}
