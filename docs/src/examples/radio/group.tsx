import { createSignal } from 'solid-js'
import { RadioGroup } from 'upthrust-ui/source/Radio'
export default function Group() {
 const [value,setValue] = createSignal<string | number>('apple')
 return <div class="flex flex-col gap-3">
  <RadioGroup value={value()} onChange={setValue} name="fruit" options={[{label:'苹果',value:'apple'},{label:'香蕉',value:'banana'},{label:'樱桃',value:'cherry',disabled:true},{label:'橙子',value:'orange'}]}/>
  <output>选择：{String(value())}</output>
  <p class="text-sm text-on-surface-variant">Tab 进入已选项，方向键切换选项并跳过禁用项。</p>
 </div>
}
