import { createSignal } from 'solid-js'
import Rate from 'upthrust-ui/source/Rate'
export default function Basic() {
 const [value,setValue]=createSignal(3)
 return <div class="px-3 flex flex-col gap-3"><Rate aria-label="服务评分" value={value()} onChange={setValue}/><output>评分：{value()} 星</output><p>点击星星提交评分；方向键可微调，0 可清零。</p></div>
}
