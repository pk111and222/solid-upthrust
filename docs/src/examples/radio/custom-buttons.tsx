import { createSignal } from 'solid-js'
import { RadioGroup, RadioButton } from 'upthrust-ui/source/Radio'
export default function CustomButtons() {
 const [value,setValue] = createSignal<string | number>('left')
 const [events,setEvents] = createSignal(0)
 return <div class="flex flex-col items-start gap-3">
  <RadioGroup value={value()} onChange={setValue} optionType="button" class="custom-radio-group" style={{ 'max-width': '100%' }}>
   <RadioButton value="left" position="first">左对齐</RadioButton>
   <RadioButton value="center" position="middle" onChange={() => setEvents(events() + 1)}>居中</RadioButton>
   <RadioButton value="right" position="last" class="font-medium" style={{ 'min-width': '80px' }}>右对齐</RadioButton>
  </RadioGroup>
  <output>对齐：{value()}；居中事件：{events()}</output>
  <RadioButton value="solo" position="single">独立按钮选项</RadioButton>
 </div>
}
