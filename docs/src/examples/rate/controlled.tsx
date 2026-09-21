import { createSignal } from 'solid-js'
import Rate from 'upthrust-ui/source/Rate'
import Button from 'upthrust-ui/source/Button'
export default function Controlled() {
 const [value,setValue]=createSignal(2),[request,setRequest]=createSignal('尚无请求')
 return <div class="px-3 flex flex-col gap-3"><Rate aria-label="受控评分" value={value()} onChange={next=>{setRequest(String(next));setValue(next)}}/><output>评分：{value()}；请求：{request()}</output><Button onClick={()=>setValue(5)}>设置为 5</Button><p>受控模式由父层决定是否接受 onChange 提议。</p></div>
}
