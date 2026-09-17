import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Dropdown from 'upthrust-ui/source/Dropdown'

export default function Demo() {
  const [disabled, setDisabled] = createSignal(true)
  const [lastAction, setLastAction] = createSignal('未操作')

  return <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <Dropdown disabled={disabled()} trigger="click" menu={{
        items: [{ key: 'enabled', label: '恢复后可选' }],
        onClick: key => setLastAction(key),
      }}>
        <Button>禁用触发器</Button>
      </Dropdown>
      <Button onClick={() => setDisabled(!disabled())}>切换禁用</Button>
      <Dropdown trigger="click" menu={{
        items: [
          { key: 'normal', label: '普通项' },
          { key: 'disabled', label: '禁用项', disabled: true },
          { key: 'danger', label: '危险项', danger: true },
          { key: 'disabled-danger', label: '禁用危险项', disabled: true, danger: true },
        ],
        onClick: key => setLastAction(key),
      }}>
        <Button>禁用选项</Button>
      </Dropdown>
    </div>
    <output class="block text-sm text-on-surface-variant">触发器禁用：{String(disabled())}</output>
    <output class="block text-sm text-on-surface-variant">最近操作：{lastAction()}</output>
    <p class="text-sm text-on-surface-variant">此处保留内层 Button 可聚焦，仅切换 Dropdown.disabled，便于观察菜单自身的开关限制。</p>
  </div>
}
