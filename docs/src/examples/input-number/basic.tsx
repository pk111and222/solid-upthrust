import InputNumber from 'upthrust-ui/source/InputNumber'
export default function Basic() {
 return <div class="flex flex-col gap-4">
  <div class="flex items-center gap-3"><label for="number-basic-1">数量</label><InputNumber id="number-basic-1" defaultValue={3} min={0} max={10}/></div>
  <div class="flex items-center gap-3"><label for="number-basic-2">可清空</label><InputNumber id="number-basic-2" placeholder="请输入数字"/></div>
  <p>方向键上 / 下增减，Shift 加速。输入越界数字后，失焦时调整到 0–10。</p>
 </div>
}
