import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Dropdown from 'upthrust-ui/source/Dropdown'

export default function Demo() {
  const [lastAction, setLastAction] = createSignal('未操作')

  return <div class="space-y-4">
    <Dropdown
      trigger="click"
      class="rounded-lg border border-dashed border-primary p-4"
      style={{ 'background-color': '#f8fafc', 'letter-spacing': '1px' }}
      overlayClass="rounded-lg border-2 border-solid border-blue-500 shadow-lg"
      overlayStyle={{ 'background-color': '#eef2ff', width: '240px' }}
      menu={{
        items: [
          { key: 'style', label: '自定义外观', icon: 'i-mdi-palette' },
          { key: 'detail', label: <span class="font-semibold">JSX 标签</span> },
        ],
        onClick: key => setLastAction(key),
      }}
    >
      <Button>自定义菜单</Button>
    </Dropdown>
    <output class="block text-sm text-on-surface-variant">最近操作：{lastAction()}</output>
  </div>
}
