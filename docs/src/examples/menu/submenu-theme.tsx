import { createSignal } from 'solid-js'
import Menu from 'upthrust-ui/source/Menu'
import Switch from 'upthrust-ui/source/Switch'

export default function SubmenuTheme() {
  const [light, setLight] = createSignal(true)
  return <div class="flex flex-col gap-md">
    <Switch checked={light()} onChange={setLight} checkedChildren="浅色子菜单" unCheckedChildren="深色子菜单" />
    {/* 子菜单弹层的 theme 独立于 Menu。 */}
    <Menu theme="dark" mode="vertical" style={{ width: '256px' }} defaultSelectedKeys={['1']} items={[
      { key: 'sub1', icon: 'i-mdi-email-outline', label: '导航一', theme: light() ? 'light' : 'dark', children: [
        { key: '1', label: '选项 1' },
        { key: '2', label: '选项 2' },
        { key: '3', label: '选项 3' },
      ] },
      { key: '5', label: '选项 5' },
      { key: '6', label: '选项 6' },
    ]} />
  </div>
}
