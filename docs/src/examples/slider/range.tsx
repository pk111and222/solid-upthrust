import { createSignal } from 'solid-js'
import Slider from 'upthrust-ui/source/Slider'
export default function Range() {
 const [range,setRange]=createSignal<[number,number]>([20,60])
 return <div class="px-3 flex flex-col gap-3">
  <p>预算范围（受控）</p><Slider aria-label="预算" rangeValue={range()} onRangeChange={setRange}/>
  <output>范围：{range().join('–')}</output>
  <p>默认范围（非受控）</p><Slider aria-label="默认范围" defaultRangeValue={[30,70]}/>
  <p>两个滑块不会互相穿越。可用 Tab 依次聚焦起点、终点；重叠后仍可用键盘展开范围。</p>
 </div>
}
