import Slider from 'upthrust-ui/source/Slider'
export default function Directions() {
 return <div class="px-4 flex flex-col gap-6">
  <div><p>水平反向</p><Slider aria-label="水平反向" defaultValue={30} reverse/></div>
  <div class="flex gap-20 h-[240px] pt-3 pb-8">
   <div><p>垂直</p><Slider aria-label="垂直" vertical defaultValue={30} marks={[{value:0},{value:100}]} style={{height:'160px'}}/></div>
   <div><p>垂直反向</p><Slider aria-label="垂直反向" vertical reverse defaultValue={30} style={{height:'160px'}}/></div>
  </div>
  <p>vertical 从下向上增大；reverse 翻转位置与方向键增减，Home / End 始终对应数值下限 / 上限。</p>
 </div>
}
