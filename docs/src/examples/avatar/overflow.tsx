import { createSignal } from 'solid-js'
import Avatar, { AvatarGroup } from 'upthrust-ui/source/Avatar'
import Button from 'upthrust-ui/source/Button'
export default function Overflow() {
  const [count, setCount] = createSignal(2)
  return <div class="flex flex-col gap-5">{(['hover', 'click', 'focus'] as const).map(trigger => <div class="flex items-center gap-4" data-trigger={trigger}><span>{trigger}</span><AvatarGroup maxCount={count()} maxPopoverTrigger={trigger} maxStyle={{ 'background-color': '#fff1f0', color: '#cf1322' }}><Avatar>A</Avatar><Avatar>B</Avatar><Avatar>C</Avatar><Avatar>D</Avatar></AvatarGroup></div>)}<Button onClick={() => setCount(count() === 2 ? 0 : 2)}>切换数量</Button></div>
}
