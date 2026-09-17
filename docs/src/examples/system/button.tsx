import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'

export default function ButtonExample() {
  const [count, setCount] = createSignal(0)
  return (
    <div class="flex flex-wrap items-center gap-4">
      <Button type="primary" onClick={() => setCount(value => value + 1)}>点击计数</Button>
      <output aria-live="polite">已点击 {count()} 次</output>
    </div>
  )
}
