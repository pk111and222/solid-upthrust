import { createSignal } from 'solid-js'
import Segmented from 'upthrust-ui/source/Segmented'
export default function Keyboard() {
 const [value,setValue]=createSignal<string|number>('a')
 return <div class="px-3 flex flex-col gap-3"><Segmented aria-label="键盘示例" options={[{label:'A',value:'a'},{label:'B（禁用）',value:'b',disabled:true},{label:'C',value:'c'}]} value={value()} onChange={setValue}/><output>已提交：{String(value())}</output><p>Tab 聚焦组后使用 ←/→ 或 Home/End 遍历，Enter/Space 提交，Esc 取消候选。</p></div>
}
