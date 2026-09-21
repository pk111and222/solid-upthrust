import { createSignal, Show } from 'solid-js'
import Slider from 'upthrust-ui/source/Slider'
import Button from 'upthrust-ui/source/Button'
export default function Native() {
 const [disabled,setDisabled]=createSignal(false),[visible,setVisible]=createSignal(true),[value,setValue]=createSignal(40)
 let wrapper:HTMLDivElement|undefined
 return <div class="px-3 flex flex-col gap-3">
  <Show when={visible()}><Slider id="slider-native" aria-label="可切换滑块" defaultValue={40} disabled={disabled()} ref={el=>{wrapper=el}} class="slider-custom" style={{width:'260px'}} onChange={setValue}/></Show>
  <output>当前：{value()}</output>
  <div class="flex flex-wrap gap-2"><Button onClick={()=>setDisabled(v=>!v)}>切换禁用</Button><Button onClick={()=>wrapper?.querySelector<HTMLElement>('[role=slider]')?.focus()}>聚焦滑块</Button><Button onClick={()=>setVisible(v=>!v)}>挂载或卸载</Button></div>
  <p>ref 返回外框，示例从外框找到滑块并聚焦；聚焦本身不改值。禁用或卸载会取消正在进行的拖拽。</p>
 </div>
}
