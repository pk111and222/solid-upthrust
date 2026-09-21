import { createSignal } from 'solid-js'
import Slider from 'upthrust-ui/source/Slider'
export default function Basic() {
 const [value,setValue]=createSignal(30),[changes,setChanges]=createSignal(0),[finished,setFinished]=createSignal(0)
 return <div class="px-3 flex flex-col gap-3">
  <p id="slider-volume-label">音量</p>
  <Slider aria-labelledby="slider-volume-label" defaultValue={30} onChange={v=>{setValue(v);setChanges(n=>n+1)}} onAfterChange={()=>setFinished(n=>n+1)}/>
  <output>音量：{value()}；变化：{changes()}；完成：{finished()}</output>
  <p>点击轨道或拖动滑块。方向键微调，Shift 加速；Home / End 到端点。抬键或结束拖动时报告完成。</p>
 </div>
}
