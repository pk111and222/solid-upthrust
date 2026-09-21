import { createSignal } from 'solid-js'
import Rate from 'upthrust-ui/source/Rate'
export default function Half() {
 const [value,setValue]=createSignal(2.5),[hover,setHover]=createSignal(2.5)
 return <div class="px-3 flex flex-col gap-3"><Rate aria-label="半星评分" value={value()} allowHalf onChange={setValue} onHoverChange={setHover}/><output>提交：{value()}；预览：{hover()}</output><p>指针位于字符左半侧时预览半星，离开后恢复提交值。</p></div>
}
