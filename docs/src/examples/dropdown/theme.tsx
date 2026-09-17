import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import Dropdown from 'upthrust-ui/source/Dropdown'

export default function Demo() {
  const [dark, setDark] = createSignal(false)
  const [lastAction, setLastAction] = createSignal('未操作')

  return <ConfigProvider
    class="relative min-h-[220px] rounded-lg border border-outline-variant bg-surface p-6 text-on-surface"
    theme={{ colors: {
      surface: dark() ? '#1e293b' : '#fff7ed',
      onSurface: dark() ? '#f8fafc' : '#7c2d12',
    } }}
  >
    <div class="flex flex-wrap items-center gap-3">
      <Dropdown trigger="click" menu={{
        items: [
          { key: 'theme', label: '主题菜单项' },
          { key: 'colors', label: '继承局部颜色' },
        ],
        onClick: key => setLastAction(key),
      }}>
        <Button>局部主题菜单</Button>
      </Dropdown>
      <Button onClick={() => setDark(!dark())}>切换主题</Button>
    </div>
    <output class="mt-4 block text-sm">surface：{dark() ? '#1e293b' : '#fff7ed'}</output>
    <output class="mt-2 block text-sm">最近操作：{lastAction()}</output>
  </ConfigProvider>
}
