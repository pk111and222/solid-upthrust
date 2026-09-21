import { createSignal } from 'solid-js'
import Rate from 'upthrust-ui/source/Rate'
import Button from 'upthrust-ui/source/Button'

export default function Focus() {
  const [autoFocus, setAutoFocus] = createSignal(false)
  const [event, setEvent] = createSignal('尚未聚焦')
  let element: HTMLUListElement | undefined
  return <div class="px-3 flex flex-col gap-3">
    <Rate aria-label="焦点评分" defaultValue={2} autoFocus={autoFocus()}
      ref={el => { element = el }} onFocus={() => setEvent('已聚焦')} onBlur={() => setEvent('已失焦')} />
    <div class="flex gap-2">
      <Button onClick={() => element?.focus()}>通过 ref 聚焦</Button>
      <Button onClick={() => setAutoFocus(true)}>启用自动聚焦</Button>
    </div>
    <output>{event()}</output>
    <p>方向键调整评分，Home/0 清零，End 选满；启用 autoFocus 时会聚焦容器。</p>
  </div>
}
