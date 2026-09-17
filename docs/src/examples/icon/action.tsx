import { createSignal } from 'solid-js'
import Icon from 'upthrust-ui/source/Icon'
import Button from 'upthrust-ui/source/Button'
export default function Action() {
  const [count, setCount] = createSignal(0)
  return <div class="flex items-center gap-5">
    <Button onClick={() => setCount(count() + 1)}>
      <Icon name="star" size="2rem" class="align-middle" style={{color:'#d97706'}} />
    <span class="sr-only">收藏</span>
    </Button>
    <output class="text-sm text-slate-500">收藏次数：{count()}</output>
  </div>
}
