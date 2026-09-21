import InputNumber from 'upthrust-ui/source/InputNumber'
export default function Format() {
 return <div class="flex flex-col gap-4">
  <div class="flex items-center gap-3"><label for="number-format-1">金额</label><InputNumber id="number-format-1" defaultValue={1000} precision={2} formatter={v=>`$ ${v.toLocaleString('en-US')}`} parser={text=>text.replace(/[$,\s]/g,'')} style={{width:'170px'}}/></div>
  <div class="flex items-center gap-3"><label for="number-format-2">百分比</label><InputNumber id="number-format-2" defaultValue={30} min={0} max={100} prefix={<span>≥</span>} suffix={<span>%</span>} style={{width:'160px'}}/></div>
  <div class="flex items-center gap-3"><label for="number-format-3">隐藏按钮</label><InputNumber id="number-format-3" defaultValue={5} controls={false}/></div>
  <p>格式化仅改变显示；onChange 返回 number 或 null。隐藏按钮后仍支持方向键。</p>
 </div>
}
