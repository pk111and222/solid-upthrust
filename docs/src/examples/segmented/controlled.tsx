import { createSignal } from 'solid-js'
import Segmented from 'upthrust-ui/source/Segmented'
import Button from 'upthrust-ui/source/Button'
export default function Controlled() {
 const [value,setValue]=createSignal<string|number>('day'),[request,setRequest]=createSignal('尚无请求')
 return <div class="px-3 flex flex-col gap-3"><Segmented aria-label="时间范围" options={['day','week','month']} value={value()} onChange={next=>{setRequest(String(next));setValue(next)}}/><output>当前：{String(value())}；请求：{request()}</output><Button onClick={()=>setValue('month')}>父层设置为 month</Button><p>onChange 只提出新值，是否接受由受控父层决定。</p></div>
}
