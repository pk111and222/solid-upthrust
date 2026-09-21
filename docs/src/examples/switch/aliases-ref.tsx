import { createSignal, Show } from 'solid-js'
import Switch from 'upthrust-ui/source/Switch'
import Button from 'upthrust-ui/source/Button'
export default function AliasesRef() {
 const [value,setValue]=createSignal(false)
 const [mounted,setMounted]=createSignal(false)
 let button:HTMLButtonElement|undefined
 return <div class="flex flex-col items-start gap-3">
  <div class="flex gap-3 items-center"><label for="switch-alias">value 别名</label><Switch id="switch-alias" name="notification" value={value()} onChange={setValue} ref={el=>{button=el}} class="custom-switch" style={{'min-width':'60px'}} checkedChildren="有" unCheckedChildren="无"/></div>
  <div class="flex gap-3 items-center"><label for="switch-default-alias">默认别名</label><Switch id="switch-default-alias" defaultValue/></div>
  <Button onClick={()=>button?.focus()}>聚焦别名开关</Button>
  <Button onClick={()=>setMounted(!mounted())}>挂载或卸载 autofocus 开关</Button>
  <Show when={mounted()}><label for="switch-autofocus">自动聚焦示例</label><Switch id="switch-autofocus" autofocus/></Show>
  <p class="text-sm text-on-surface-variant">聚焦按钮只移动焦点，再按空格切换开关。checked/defaultChecked 分别优先于 value/defaultValue。</p>
 </div>
}
