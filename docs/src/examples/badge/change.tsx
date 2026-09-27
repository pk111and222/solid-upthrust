import { createSignal } from 'solid-js'
import Avatar from 'upthrust-ui/source/Avatar'
import Badge from 'upthrust-ui/source/Badge'
import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import Switch from 'upthrust-ui/source/Switch'

export default function Change() {
  const [count, setCount] = createSignal(5)
  const [show, setShow] = createSignal(true)
  return <div class="flex flex-col gap-5">
    <div class="flex items-center gap-6">
      <Badge count={count()}><Avatar shape="square" alt="动态计数" /></Badge>
      <Space.Compact>
        <Button aria-label="减少" icon={<span class="i-mdi-minus" />} onClick={() => setCount(Math.max(0, count() - 1))} />
        <Button aria-label="增加" icon={<span class="i-mdi-plus" />} onClick={() => setCount(count() + 1)} />
        <Button aria-label="随机" icon={<span class="i-mdi-help" />} onClick={() => setCount(Math.floor(Math.random() * 100))} />
      </Space.Compact>
    </div>
    <div class="flex items-center gap-6">
      <Badge dot={show()}><Avatar shape="square" alt="动态红点" /></Badge>
      <Switch aria-label="显示红点" checked={show()} onChange={setShow} />
    </div>
  </div>
}
