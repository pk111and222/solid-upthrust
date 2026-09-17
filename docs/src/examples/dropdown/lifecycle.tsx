import { Show, createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Dropdown from 'upthrust-ui/source/Dropdown'

export default function Demo() {
  const [mounted, setMounted] = createSignal(false)
  const [lastRequest, setLastRequest] = createSignal('未触发')
  const [lastAction, setLastAction] = createSignal('未操作')

  return <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <Button onClick={() => {
        setLastRequest('未触发')
        setMounted(true)
      }}>挂载默认打开</Button>
      <Button onClick={() => setMounted(false)}>卸载菜单</Button>
      <Show when={mounted()}>
        <Dropdown
          defaultOpen
          trigger="click"
          onOpenChange={next => setLastRequest(String(next))}
          menu={{
            items: [{ key: 'lifecycle', label: '默认打开菜单项' }],
            onClick: key => setLastAction(key),
          }}
        >
          <Button>默认打开菜单</Button>
        </Dropdown>
      </Show>
    </div>
    <output class="block text-sm text-on-surface-variant">挂载状态：{mounted() ? '已挂载' : '未挂载'}</output>
    <output class="block text-sm text-on-surface-variant">最近开关请求：{lastRequest()}</output>
    <output class="block text-sm text-on-surface-variant">最近操作：{lastAction()}</output>
    <p class="text-sm text-on-surface-variant">挂载后默认展开。点击“默认打开菜单”关闭后立即重开，可观察短暂关闭时的浮层复用；“卸载菜单”移除整个实例。</p>
  </div>
}
