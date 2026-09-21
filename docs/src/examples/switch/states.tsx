import { createSignal } from 'solid-js'
import Switch from 'upthrust-ui/source/Switch'
import Button from 'upthrust-ui/source/Button'
export default function States() {
 const [loading,setLoading]=createSignal(true)
 const [clicks,setClicks]=createSignal(0)
 return <div class="flex flex-col items-start gap-3">
  <div class="flex gap-3 items-center"><label for="switch-disabled-on">禁用开启</label><Switch id="switch-disabled-on" disabled defaultChecked/><label for="switch-disabled-off">禁用关闭</label><Switch id="switch-disabled-off" disabled/></div>
  <div class="flex gap-3 items-center"><label for="switch-loading">加载开关</label><Switch id="switch-loading" loading={loading()} defaultChecked onClick={()=>setClicks(clicks()+1)}/><label for="switch-loading-small">小号加载</label><Switch id="switch-loading-small" size="small" loading={loading()}/></div>
  <Button onClick={()=>setLoading(!loading())}>切换加载状态</Button>
  <output>点击尝试：{clicks()}</output>
  <p class="text-sm text-on-surface-variant">loading 期间保持原状态，允许聚焦并报告 onClick 尝试，不触发 onChange；disabled 阻止按钮点击。</p>
 </div>
}
