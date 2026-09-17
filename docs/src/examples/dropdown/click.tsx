import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Dropdown from 'upthrust-ui/source/Dropdown'

export default function Demo() {
  const [lastAction, setLastAction] = createSignal('未操作')
  const [callbacks, setCallbacks] = createSignal<string[]>([])

  return <div class="space-y-4">
    <Dropdown
      trigger="click"
      onOpenChange={next => {
        if (!next) setCallbacks(previous => [...previous, 'close:false'])
      }}
      menu={{
        items: [
          { key: 'first', label: '第一项', onClick: () => setCallbacks(['item:first']) },
          { key: 'disabled', label: '禁用项', disabled: true },
          { key: 'divider', label: '', type: 'divider' },
          { key: 'last', label: '最后项', danger: true, onClick: () => setCallbacks(['item:last']) },
        ],
        onClick: key => {
          setLastAction(key)
          setCallbacks(previous => [...previous, `menu:${key}`])
        },
      }}
    >
      <Button>点击菜单</Button>
    </Dropdown>
    <output class="block text-sm text-on-surface-variant">最近操作：{lastAction()}</output>
    <output data-dropdown-callbacks="" class="block text-sm text-on-surface-variant">
      回调顺序：{callbacks().join(' → ') || '未触发'}
    </output>
  </div>
}
