import { createSignal } from 'solid-js'
import Menu from 'upthrust-ui/source/Menu'
import { topItems } from './data'

export default function Horizontal() {
  const [current, setCurrent] = createSignal('mail')
  return <Menu mode="horizontal" selectedKeys={[current()]} onClick={info => setCurrent(info.key)} items={topItems} />
}
