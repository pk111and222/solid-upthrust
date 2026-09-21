import { createSignal } from 'solid-js'
import InputNumber from 'upthrust-ui/source/InputNumber'
import Button from 'upthrust-ui/source/Button'
export default function Native() {
 let input:HTMLInputElement|undefined
 const [event,setEvent]=createSignal('尚未操作')
 return <div class="flex flex-col gap-4">
  <label for="number-ref">原生输入</label>
  <InputNumber id="number-ref" name="amount" defaultValue={3} class="number-native" style={{width:'160px'}} ref={el=>{input=el}} onFocus={()=>setEvent('已聚焦')} onBlur={()=>setEvent('已失焦')} onPressEnter={()=>setEvent('已按 Enter')}/>
  <Button onClick={()=>input?.focus()}>聚焦数字输入框</Button>
  <output>{event()}</output>
  <p>聚焦按钮只移动焦点；使用方向键改变数值，Enter 通知回调。ref 返回 HTMLInputElement。</p>
 </div>
}
