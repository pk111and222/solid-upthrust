import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Dropdown from 'upthrust-ui/source/Dropdown'

export default function Demo() {
  const [replaced, setReplaced] = createSignal(false)
  const [lastAction, setLastAction] = createSignal('未操作')

  return <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <Dropdown trigger="click" menu={{
        items: replaced()
          ? [{ key: 'c', label: 'C' }, { key: 'd', label: 'D' }]
          : [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }],
        onClick: key => setLastAction(key),
      }}>
        <Button>动态菜单</Button>
      </Dropdown>
      <Button onClick={() => setReplaced(true)}>替换选项</Button>
      <Button onClick={() => setReplaced(false)}>恢复选项</Button>
      <Dropdown trigger="click" menu={{ items: [] }}>
        <Button>空菜单</Button>
      </Dropdown>
      <Dropdown trigger="click" menu={{
        items: [
          { key: 'disabled-a', label: '禁用 A', disabled: true },
          { key: 'disabled-b', label: '禁用 B', disabled: true, danger: true },
        ],
        onClick: key => setLastAction(key),
      }}>
        <Button>全禁用菜单</Button>
      </Dropdown>
    </div>
    <output class="block text-sm text-on-surface-variant">当前选项：{replaced() ? 'C / D' : 'A / B'}</output>
    <output class="block text-sm text-on-surface-variant">最近操作：{lastAction()}</output>
    <p class="text-sm text-on-surface-variant">替换选项后重新打开菜单，选择新选项；空列表与全禁用列表不产生选中回调。</p>
  </div>
}
