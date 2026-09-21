import { createSignal } from 'solid-js'
import Radio, { RadioGroup } from 'upthrust-ui/source/Radio'
import Button from 'upthrust-ui/source/Button'
export default function Dynamic() {
 const [disabled,setDisabled] = createSignal(false)
 const [button,setButton] = createSignal(false)
 return <div class="flex flex-col gap-3">
  <RadioGroup defaultValue={0} disabled={disabled()} optionType={button() ? 'button' : 'default'} options={[{label:'数字零',value:0},{label:'字符串零',value:'0',disabled:false}]} />
  <div class="flex gap-3"><Button onClick={() => setDisabled(!disabled())}>切换禁用</Button><Button onClick={() => setButton(!button())}>切换外观</Button></div>
  <RadioGroup defaultValue="inside" name="custom">
   <Radio value="inside">组内</Radio><Radio value="other">其他</Radio><Radio value="outside" skipGroup>独立于组</Radio>
  </RadioGroup>
  <p class="text-sm text-on-surface-variant">外观切换保留选择；数字 0 与字符串 '0' 是不同值。skipGroup 选项不改变组值。</p>
 </div>
}
