import { createSignal } from 'solid-js'
import Steps from 'upthrust-ui/source/Steps'
import Button from 'upthrust-ui/source/Button'

const content = '这是一段步骤描述。'
const items = [
  { title: '已完成', content },
  { title: '进行中', content, subTitle: '剩余 00:00:08' },
  { title: '待处理', content },
]

export default function ProgressDemo() {
  const [percent, setPercent] = createSignal(60)
  const step = (delta: number) => setPercent(value => Math.max(0, Math.min(100, value + delta)))
  // percent 在当前步骤图标外显示进度环。
  return <div class="flex flex-col gap-lg">
    <div class="flex gap-xs items-center">
      <Button onClick={() => step(-10)}>-10</Button>
      <Button onClick={() => step(10)}>+10</Button>
      <output data-percent={percent()}>percent = {String(percent())}</output>
    </div>
    <div data-case="default"><Steps current={1} percent={percent()} items={items} /></div>
    <div data-case="small"><Steps current={1} percent={percent()} size="small" items={items} /></div>
  </div>
}
