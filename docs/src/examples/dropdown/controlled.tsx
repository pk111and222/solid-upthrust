import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Dropdown from 'upthrust-ui/source/Dropdown'

export default function Demo() {
  const [open, setOpen] = createSignal(false)
  const [disabled, setDisabled] = createSignal(false)
  const [callbackCount, setCallbackCount] = createSignal(0)
  const [lastAction, setLastAction] = createSignal('未操作')

  return <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <Button onClick={() => setOpen(true)}>外部打开</Button>
      <Button onClick={() => setOpen(false)}>外部关闭</Button>
      <Button onClick={() => setDisabled(!disabled())}>切换受控禁用</Button>
      <Dropdown
        trigger="click"
        open={open()}
        disabled={disabled()}
        onOpenChange={next => {
          setCallbackCount(count => count + 1)
          setOpen(next)
        }}
        menu={{
          items: [{ key: 'save', label: '保存', icon: 'i-mdi-content-save' }],
          onClick: key => setLastAction(key),
        }}
      >
        <Button>受控菜单</Button>
      </Dropdown>
    </div>
    <div class="flex flex-wrap gap-4 text-sm text-on-surface-variant">
      <output>open：{String(open())}</output>
      <output>回调次数：{callbackCount()}</output>
      <output>disabled：{String(disabled())}</output>
    </div>
    <output class="block text-sm text-on-surface-variant">最近操作：{lastAction()}</output>
    <p class="text-sm text-on-surface-variant">disabled 限制用户开关请求；外部按钮仍可直接更新受控 open。</p>
  </div>
}
