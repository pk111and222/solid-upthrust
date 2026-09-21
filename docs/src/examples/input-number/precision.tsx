import { createSignal } from 'solid-js'
import InputNumber from 'upthrust-ui/source/InputNumber'
export default function Precision() {
 const [event,setEvent]=createSignal('尚未步进')
 return <div class="flex flex-col gap-4">
  <div class="flex items-center gap-3"><label for="number-precision-1">小数步进</label><InputNumber id="number-precision-1" defaultValue={0.1} step={0.1} min={0} max={1} onStep={(value,info)=>setEvent(`${info.type}：${value}；偏移：${info.offset}`)}/></div>
  <div class="flex items-center gap-3"><label for="number-precision-2">两位精度</label><InputNumber id="number-precision-2" defaultValue={1.25} step={0.25} precision={2} shiftMultiplier={4}/></div>
  <div class="flex items-center gap-3"><label for="number-precision-3">微小步长</label><InputNumber id="number-precision-3" defaultValue={0} step={1e-7} style={{width:'150px'}}/></div>
  <output>{event()}</output>
  <p>两位精度输入失焦后舍入；按 Shift + 上箭头增加 1。未指定 precision 时保留已有小数。</p>
 </div>
}
