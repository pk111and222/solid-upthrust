import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Dropdown from 'upthrust-ui/source/Dropdown'

export default function Demo() {
  const [lastAction, setLastAction] = createSignal('未操作')

  return <div class="space-y-4">
    <Dropdown trigger="contextMenu" menu={{
      items: [
        { key: 'refresh', label: '刷新', icon: 'i-mdi-refresh' },
        { key: 'pin', label: '置顶', icon: 'i-mdi-pin' },
      ],
      onClick: key => setLastAction(key),
    }}>
      <Button>右键菜单</Button>
    </Dropdown>
    <p class="text-sm text-on-surface-variant">在按钮上点击右键。菜单锚定按钮，不跟随鼠标坐标。</p>
    <output class="block text-sm text-on-surface-variant">最近操作：{lastAction()}</output>
  </div>
}
