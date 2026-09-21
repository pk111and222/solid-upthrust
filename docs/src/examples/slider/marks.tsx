import Slider, { type SliderMark } from 'upthrust-ui/source/Slider'
const marks:SliderMark[]=[{value:0},{value:25,label:'低'},{value:60,label:'中'},{value:100,label:'高'}]
export default function Marks() {
 return <div class="px-3 flex flex-col gap-8 pb-4">
  <div><p>仅刻度</p><Slider aria-label="仅刻度" defaultValue={25} marks={marks} marksOnly/></div>
  <div><p>小数步长（0–1）</p><Slider aria-label="小数步长" defaultValue={0.2} min={0} max={1} step={0.1} precision={2} marks={[{value:0},{value:0.5},{value:1}]}/></div>
  <div><p>连续取值</p><Slider aria-label="连续取值" defaultValue={30} step={null}/></div>
  <p>marksOnly 限制到刻度，方向键跳至相邻刻度；step=null 表示连续取值，键盘仍以 1 微调。</p>
 </div>
}
