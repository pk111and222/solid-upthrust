import { Show, createSignal } from 'solid-js'
import Steps from 'upthrust-ui/source/Steps'
import Button from 'upthrust-ui/source/Button'

const items = [
  { title: '第一步', content: '填写基本信息' },
  { title: '第二步', content: '确认订单' },
  { title: '最后', content: '完成支付' },
]

export default function StepSwitch() {
  const [current, setCurrent] = createSignal(0)
  return <div class="flex flex-col gap-md">
    <Steps current={current()} items={items} />
    <div class="min-h-[80px] flex items-center justify-center rounded-lg border border-dashed border-outline-variant bg-on-surface/4 text-on-surface/65" data-step-panel>
      {items[current()].content}
    </div>
    <div class="flex gap-xs">
      <Show when={current() < items.length - 1} fallback={<Button type="primary" onClick={() => setCurrent(0)}>完成</Button>}>
        <Button type="primary" onClick={() => setCurrent(current() + 1)}>下一步</Button>
      </Show>
      <Show when={current() > 0}><Button onClick={() => setCurrent(current() - 1)}>上一步</Button></Show>
    </div>
    <output data-current={current()}>current = {String(current())}</output>
  </div>
}
