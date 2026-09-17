import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { mount } from '../../utils/mount'
import Tooltip, { type TooltipIns } from '../../../components/lib/Tooltip'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {}; vi.useRealTimers() })

function overlay() { return document.querySelector<HTMLElement>('[role="tooltip"]') }

// 受控 open 由父层决定实际可见性，onOpenChange 只报告请求，不自行回写。
it('[tooltip.controlled.open] parent-driven open wins over user click requests', () => {
  const onOpenChange = vi.fn()
  const [open, setOpen] = createSignal(false, { ownedWrite: true })
  const view = mount(() => (
    <Tooltip title="受控" trigger="click" open={open()} onOpenChange={onOpenChange}>
      <button type="button">触发器</button>
    </Tooltip>
  ))
  cleanup = view.dispose
  const btn = view.host.querySelector('button')!
  btn.click(); flush()
  // 用户点击只产生请求，父层未更新 open 之前视图保持关闭。
  expect(overlay()).toBeNull()
  expect(onOpenChange).toHaveBeenCalledWith(true)

  setOpen(true); flush()
  expect(overlay()).not.toBeNull()
})

// defaultOpen 只决定首次挂载状态，之后完全由内部非受控状态接管。
it('[tooltip.controlled.default-open] mounts already open when defaultOpen is true', () => {
  const view = mount(() => (
    <Tooltip title="默认打开" defaultOpen>
      <button type="button">触发器</button>
    </Tooltip>
  ))
  cleanup = view.dispose
  expect(overlay()).not.toBeNull()
  expect(overlay()?.textContent).toBe('默认打开')
})

// ref 暴露 open/setOpen，可在非受控模式下以命令式方式打开浮层。
it('[tooltip.controlled.ref] exposes an imperative open/setOpen handle', () => {
  let ins: TooltipIns | undefined
  const view = mount(() => (
    <Tooltip title="命令式" ref={(v) => { ins = v }}>
      <button type="button">触发器</button>
    </Tooltip>
  ))
  cleanup = view.dispose
  expect(ins).toBeDefined()
  expect(ins!.open()).toBe(false)
  ins!.setOpen(true)
  flush()
  expect(ins!.open()).toBe(true)
  expect(overlay()).not.toBeNull()
})

// getContainer 决定浮层实际 Portal 落点；不传时落在文档默认位置（body）。
it('[tooltip.controlled.get-container] portals into the custom container instead of body', () => {
  const customContainer = document.createElement('div')
  customContainer.setAttribute('data-role', 'custom-container')
  document.body.append(customContainer)
  try {
    const view = mount(() => (
      <Tooltip title="自定义容器" trigger="click" getContainer={() => customContainer}>
        <button type="button">触发器</button>
      </Tooltip>
    ))
    cleanup = view.dispose
    view.host.querySelector('button')!.click(); flush()
    const layer = overlay()!
    expect(customContainer.contains(layer)).toBe(true)
    expect(document.body.contains(layer) && !customContainer.contains(layer)).toBe(false)
  } finally {
    customContainer.remove()
  }
})

// 卸载后浮层必须随组件销毁，不留下脱离生命周期的 Portal 节点。
it('[tooltip.controlled.unmount-cleanup] removes the portaled layer on unmount even while open', () => {
  const view = mount(() => (
    <Tooltip title="卸载检查" defaultOpen>
      <button type="button">触发器</button>
    </Tooltip>
  ))
  expect(overlay()).not.toBeNull()
  view.dispose()
  expect(overlay()).toBeNull()
})
