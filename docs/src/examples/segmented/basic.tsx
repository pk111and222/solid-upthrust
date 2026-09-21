import { createSignal } from 'solid-js'
import Segmented from 'upthrust-ui/source/Segmented'
export default function Basic() {
 const [value,setValue]=createSignal<string|number>('list')
 return <div class="px-3 flex flex-col gap-3"><Segmented aria-label="视图模式" options={[{label:'列表',value:'list'},{label:'卡片',value:'card'},{label:'地图',value:'map',disabled:true}]} value={value()} onChange={setValue}/><output>当前：{String(value())}</output><p>点击切换；禁用选项不可选中，重复点击当前项不会重复通知。</p></div>
}
