import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTrigger } from '../../../../competence/src/trigger'

const elements: HTMLElement[] = []
const roots: Array<() => void> = []

afterEach(() => {
  while (roots.length) roots.pop()!()
  while (elements.length) elements.pop()!.remove()
  vi.useRealTimers()
})

function withinRoot(fn: () => void) {
  createRoot(dispose => {
    roots.push(dispose)
    fn()
  })
}

function element() {
  const el = document.createElement('button')
  document.body.append(el)
  elements.push(el)
  return el
}

describe('Trigger event bridge', () => {
  // 三种触发动作和 focus 都必须把用户事件转换成一次打开请求。
  it.each([
    ['click', 'click'],
    ['hover', 'mouseenter'],
    ['contextMenu', 'contextmenu'],
    ['focus', 'focusin'],
  ] as const)('[trigger.events.%s] bridges the native event', (action, eventName) => {
    withinRoot(() => {
      const onOpenChange = vi.fn()
      const trigger = createTrigger({ action, onOpenChange })
      const el = element()
      trigger.triggerRef(el)
      const event = new Event(eventName, { bubbles: true, cancelable: true })
      el.dispatchEvent(event)
      flush()
      expect(trigger.open()).toBe(true)
      expect(onOpenChange).toHaveBeenCalledTimes(1)
      expect(onOpenChange).toHaveBeenLastCalledWith(true)
    })
  })

  // hover 离开 trigger 后进入 layer 的桥接必须在 100ms 内取消关闭。
  it('[trigger.events.hover-bridge] keeps a hover layer open across the gap', () => {
    vi.useFakeTimers()
    withinRoot(() => {
      const trigger = createTrigger({ action: 'hover' })
      const triggerEl = element()
      const layerEl = element()
      trigger.triggerRef(triggerEl)
      trigger.layerRef(layerEl)
      trigger.bindLayerHover()

      triggerEl.dispatchEvent(new Event('mouseenter'))
      flush()
      expect(trigger.open()).toBe(true)
      triggerEl.dispatchEvent(new Event('mouseleave'))
      layerEl.dispatchEvent(new Event('mouseenter'))
      vi.advanceTimersByTime(100)
      flush()
      expect(trigger.open()).toBe(true)

      layerEl.dispatchEvent(new Event('mouseleave'))
      vi.advanceTimersByTime(99)
      flush()
      expect(trigger.open()).toBe(true)
      vi.advanceTimersByTime(1)
      flush()
      expect(trigger.open()).toBe(false)
    })
  })

  // layer 内部的 Escape 交给组件内部处理，document 监听不得重复发关闭请求。
  it('[trigger.events.dismiss] closes outside but ignores Escape from inside layer', () => {
    withinRoot(() => {
      const trigger = createTrigger({ action: 'click' })
      const triggerEl = element()
      const layerEl = element()
      const child = document.createElement('span')
      layerEl.append(child)
      trigger.triggerRef(triggerEl)
      trigger.layerRef(layerEl)
      trigger.setOpen(true)
      flush()
      child.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      flush()
      expect(trigger.open()).toBe(true)
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      flush()
      expect(trigger.open()).toBe(false)

      trigger.setOpen(true)
      flush()
      const outside = element()
      outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
      flush()
      expect(trigger.open()).toBe(false)
    })
  })

  // disabled 的 contextMenu 只阻止 Trigger 自身动作，不能吞掉浏览器默认菜单。
  it('[trigger.events.disabled-contextmenu] preserves the browser context menu', () => {
    withinRoot(() => {
      const onOpenChange = vi.fn()
      const trigger = createTrigger({ action: 'contextMenu', disabled: true, onOpenChange })
      const el = element()
      trigger.triggerRef(el)
      const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
      el.dispatchEvent(event)
      flush()
      expect(event.defaultPrevented).toBe(false)
      expect(trigger.open()).toBe(false)
      expect(onOpenChange).not.toHaveBeenCalled()
    })
  })

  // action 动态切换后旧事件监听必须解绑，新动作必须立即接管同一个节点。
  it('[trigger.events.dynamic-action] rebinds the trigger when action changes', () => {
    withinRoot(() => {
      const [action, setAction] = createSignal<'click' | 'hover'>('click', { ownedWrite: true })
      const onOpenChange = vi.fn()
      const trigger = createTrigger({ get action() { return action() }, onOpenChange })
      const el = element()
      trigger.triggerRef(el)
      el.dispatchEvent(new Event('click'))
      flush()
      expect(trigger.open()).toBe(true)
      trigger.setOpen(false)
      flush()

      setAction('hover')
      flush()
      el.dispatchEvent(new Event('click'))
      flush()
      expect(trigger.open()).toBe(false)
      el.dispatchEvent(new Event('mouseenter'))
      flush()
      expect(trigger.open()).toBe(true)
    })
  })

  // triggerRef 更换节点后，旧节点不能再触发状态迁移。
  it('[trigger.events.rebind-node] removes listeners from the old trigger node', () => {
    withinRoot(() => {
      const trigger = createTrigger({ action: 'click' })
      const oldEl = element()
      const newEl = element()
      trigger.triggerRef(oldEl)
      trigger.triggerRef(newEl)
      oldEl.dispatchEvent(new Event('click'))
      flush()
      expect(trigger.open()).toBe(false)
      newEl.dispatchEvent(new Event('click'))
      flush()
      expect(trigger.open()).toBe(true)
    })
  })

  // 卸载时取消尚未执行的测量、销毁及 hover 任务，旧节点不再响应事件。
  it('[trigger.events.dispose-pending] cancels pending work on disposal', () => {
    vi.useFakeTimers()
    const onOpenChange = vi.fn()
    let dispose!: () => void
    let trigger!: ReturnType<typeof createTrigger>
    const el = element()
    createRoot(cleanup => {
      dispose = cleanup
      trigger = createTrigger({ action: 'hover', hoverDelay: 100, onOpenChange })
      trigger.triggerRef(el)
      trigger.layerRef(element())
    })
    el.dispatchEvent(new Event('mouseenter'))
    flush()
    el.dispatchEvent(new Event('mouseleave'))
    dispose()
    vi.runAllTimers()
    el.dispatchEvent(new Event('mouseenter'))
    flush()
    expect(onOpenChange.mock.calls).toEqual([[true]])
    expect(vi.getTimerCount()).toBe(0)
  })

  // 浮层替换后旧节点的 mouseleave 不得关闭当前菜单，新节点仍可触发关闭。
  it('[trigger.events.rebind-layer] detaches hover listeners from the old layer', () => {
    vi.useFakeTimers()
    withinRoot(() => {
      const trigger = createTrigger({ action: 'hover', defaultOpen: true })
      const oldLayer = element()
      const newLayer = element()
      trigger.layerRef(oldLayer)
      trigger.bindLayerHover()
      flush()
      trigger.layerRef(newLayer)
      trigger.bindLayerHover()
      oldLayer.dispatchEvent(new Event('mouseleave'))
      vi.advanceTimersByTime(100)
      flush()
      expect(trigger.open()).toBe(true)
      newLayer.dispatchEvent(new Event('mouseleave'))
      vi.advanceTimersByTime(100)
      flush()
      expect(trigger.open()).toBe(false)
    })
  })

})
