import { createSignal } from 'solid-js'
import Menu from 'upthrust-ui/source/Menu'
import Switch from 'upthrust-ui/source/Switch'
import { collapseItems } from './data'

export default function SwitchMode() {
  const [vertical, setVertical] = createSignal(false)
  const [dark, setDark] = createSignal(false)
  return <div class="flex flex-col gap-md">
    <div class="flex gap-md">
      <Switch checked={vertical()} onChange={setVertical} checkedChildren="vertical" unCheckedChildren="inline" />
      <Switch checked={dark()} onChange={setDark} checkedChildren="深色" unCheckedChildren="浅色" />
    </div>
    {/* 切回 inline 时恢复切出前的展开项。 */}
    <Menu style={{ width: '256px' }} defaultSelectedKeys={['1']} defaultOpenKeys={['sub1']}
      mode={vertical() ? 'vertical' : 'inline'} theme={dark() ? 'dark' : 'light'} items={collapseItems} />
  </div>
}
