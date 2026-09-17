import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import Dropdown from 'upthrust-ui/source/Dropdown'

export default function Demo() {
  const [lastAction, setLastAction] = createSignal('未操作')

  return <ConfigProvider
    class="relative rounded-lg border border-outline-variant bg-surface p-4 text-on-surface"
    theme={{ colors: { surface: '#f0fdfa', onSurface: '#134e4a' } }}
  >
    <div data-dropdown-scroll="" class="h-60 overflow-auto rounded border border-outline-variant" aria-label="Dropdown 滚动容器" tabindex={0}>
      <div class="min-h-[720px] p-6">
        <div class="h-16" aria-hidden="true" />
        <Dropdown trigger="click" menu={{
          items: [
            { key: 'scroll-a', label: '滚动选项 A' },
            { key: 'scroll-b', label: '滚动选项 B' },
          ],
          onClick: key => setLastAction(key),
        }}>
          <Button>滚动菜单</Button>
        </Dropdown>
        <p class="mt-80 text-sm">继续滚动，观察菜单与触发器的位置。</p>
      </div>
    </div>
    <output class="mt-4 block text-sm">最近操作：{lastAction()}</output>
  </ConfigProvider>
}
