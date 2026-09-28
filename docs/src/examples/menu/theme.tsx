import { createSignal } from 'solid-js'
import Menu from 'upthrust-ui/source/Menu'
import Switch from 'upthrust-ui/source/Switch'
import { sideItems } from './data'

export default function Theme() {
  const [dark, setDark] = createSignal(true)
  const [current, setCurrent] = createSignal('1')
  return <div class="flex flex-col gap-md">
    <Switch checked={dark()} onChange={setDark} checkedChildren="深色" unCheckedChildren="浅色" />
    <Menu theme={dark() ? 'dark' : 'light'} style={{ width: '256px' }} mode="inline" defaultOpenKeys={['sub1']}
      selectedKeys={[current()]} onClick={info => setCurrent(info.key)} items={sideItems} />
  </div>
}
