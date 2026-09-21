import Radio from 'upthrust-ui/source/Radio'
import Button from 'upthrust-ui/source/Button'
export default function Basic() {
 let input: HTMLInputElement | undefined
 return <div class="flex flex-col gap-3">
  <div class="flex flex-wrap items-center gap-4">
   <Radio ref={el => { input = el }} id="radio-single" name="single" value="yes">独立选项</Radio>
   <Radio defaultChecked>默认选中</Radio><Radio disabled>禁用未选</Radio><Radio disabled defaultChecked>禁用已选</Radio>
  </div>
  <Button onClick={() => input?.focus()}>聚焦独立选项</Button>
  <p class="text-sm text-on-surface-variant">单选框选中后不能再次点击取消。“聚焦独立选项”仅移动焦点，随后按空格可选中。</p>
 </div>
}
