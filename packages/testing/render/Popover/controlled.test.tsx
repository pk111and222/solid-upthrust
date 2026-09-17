import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { mount } from '../../utils/mount'
import Popover from '../../../components/lib/Popover'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {}; vi.useRealTimers() })

function overlay() { return document.querySelector<HTMLElement>('[role="dialog"]') }

// 受控 open 由父层决定实际可见性，onOpenChange 只报告请求，不自行回写。
it('[popover.controlled.open] parent-driven open wins over user click requests', () => {
  const onOpenChange = vi.fn()
  const [open, setOpen] = createSignal(false, { ownedWrite: true })
  const view = mount(() => (
    <Popover content="受控" trigger="click" open={open()} onOpenChange={onOpenChange}>
      <button type="button">触发器</button>
    </Popover>
  ))
  cleanup = view.dispose
  const btn = view.host.querySelector('button')!
  btn.click(); flush()
  expect(overlay()).toBeNull()
  expect(onOpenChange).toHaveBeenCalledWith(true)

  setOpen(true); flush()
  expect(overlay()).not.toBeNull()
})

// defaultOpen 只决定首次挂载状态。
it('[popover.controlled.default-open] mounts already open when defaultOpen is true', () => {
  const view = mount(() => (
    <Popover content="默认打开" defaultOpen>
      <button type="button">触发器</button>
    </Popover>
  ))
  cleanup = view.dispose
  expect(overlay()).not.toBeNull()
  expect(overlay()?.textContent).toBe('默认打开')
})

// getContainer 决定浮层实际 Portal 落点；不传时落在文档默认位置（body）。
it('[popover.controlled.get-container] portals into the custom container instead of body', () => {
  const customContainer = document.createElement('div')
  customContainer.setAttribute('data-role', 'custom-container')
  document.body.append(customContainer)
  try {
    const view = mount(() => (
      <Popover content="自定义容器" trigger="click" getContainer={() => customContainer}>
        <button type="button">触发器</button>
      </Popover>
    ))
    cleanup = view.dispose
    view.host.querySelector('button')!.click(); flush()
    const layer = overlay()!
    expect(customContainer.contains(layer)).toBe(true)
  } finally {
    customContainer.remove()
  }
})

// 卸载后浮层必须随组件销毁，不留下脱离生命周期的 Portal 节点。
it('[popover.controlled.unmount-cleanup] removes the portaled layer on unmount even while open', () => {
  const view = mount(() => (
    <Popover content="卸载检查" defaultOpen>
      <button type="button">触发器</button>
    </Popover>
  ))
  expect(overlay()).not.toBeNull()
  view.dispose()
  expect(overlay()).toBeNull()
})

// 内容在打开期间响应式地变为空：disabled 冻结开关状态（继承共享 Trigger 语义），
// 但渲染层额外看 hasAnyContent，浮层必须隐藏且不留空卡片；恢复后无需重新触发即可再见。
it('[popover.controlled.content-becomes-empty] hides the layer when reactive content empties while open, restores when refilled', () => {
  const [content, setContent] = createSignal<string | undefined>('提示')
  const view = mount(() => (
    <Popover content={content()} trigger="click">
      <button type="button">触发器</button>
    </Popover>
  ))
  cleanup = view.dispose
  view.host.querySelector('button')!.click(); flush()
  expect(overlay()?.className).not.toContain('opacity-0')

  setContent(undefined); flush()
  const emptied = overlay()
  expect(emptied).not.toBeNull()
  expect(emptied?.className).toContain('opacity-0')
  expect(emptied?.textContent).toBe('')

  setContent('提示恢复'); flush()
  const restored = overlay()
  expect(restored?.className).not.toContain('opacity-0')
  expect(restored?.textContent).toBe('提示恢复')
})
