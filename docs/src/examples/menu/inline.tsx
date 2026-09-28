import { createSignal } from 'solid-js'
import Menu from 'upthrust-ui/source/Menu'
import { sideItems } from './data'

export default function Inline() {
  const [last, setLast] = createSignal('')
  return <div class="flex flex-col gap-sm">
    <Menu
      mode="inline" style={{ width: '256px' }} defaultSelectedKeys={['1']} defaultOpenKeys={['sub1']} items={sideItems}
      onClick={info => setLast(info.keyPath.join(' ← '))}
    />
    <output>点击路径：{last() || '—'}</output>
  </div>
}
