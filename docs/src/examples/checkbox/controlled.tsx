import { createSignal } from 'solid-js'
import Checkbox from 'upthrust-ui/source/Checkbox'
import Button from 'upthrust-ui/source/Button'
export default function Controlled() {
 const [checked, setChecked] = createSignal(false)
 let input: HTMLInputElement | undefined
 return <div class="flex flex-col gap-3">
  <div class="flex flex-wrap items-center gap-4">
   <Checkbox checked={checked()} onChange={setChecked} id="checkbox-agree" name="agree" value="yes" ref={el => { input = el }}>受控同意</Checkbox>
   <Button onClick={() => input?.focus()}>聚焦复选框</Button>
   <output>当前状态：{checked() ? '已勾选' : '未勾选'}</output>
  </div>
  <p class="text-sm text-on-surface-variant">点击复选框可切换状态。“聚焦复选框”仅移动键盘焦点；聚焦后按空格键切换勾选。</p>
 </div>
}
