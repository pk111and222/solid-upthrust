import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Dropdown from 'upthrust-ui/source/Dropdown'

export default function Demo() {
  const [lastAction, setLastAction] = createSignal('未操作')

  return <div class="space-y-4">
    <Dropdown menu={{
      items: [
        { key: 'edit', label: '编辑', icon: 'i-mdi-pencil' },
        { key: 'copy', label: '复制', icon: 'i-mdi-content-copy' },
        { key: 'divider', label: '', type: 'divider' },
        { key: 'delete', label: '删除', icon: 'i-mdi-delete', danger: true },
      ],
      onClick: key => setLastAction(key),
    }}>
      <Button>悬停菜单</Button>
    </Dropdown>
    <output class="block text-sm text-on-surface-variant">最近操作：{lastAction()}</output>
  </div>
}
