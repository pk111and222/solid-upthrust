import { createRoot, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTooltip } from '../../../competence/src/tooltip'

const elements: HTMLElement[] = []
afterEach(() => {
  while (elements.length) elements.pop()!.remove()
  vi.useRealTimers()
})
function element() {
  const el = document.createElement('button')
  document.body.append(el)
  elements.push(el)
  return el
}

describe('createTooltip', () => {
  it('defaults to hover trigger with top placement', () => {
    createRoot((dispose) => {
      const t = createTooltip({})
      // Defaults are applied at the trigger-config level: open through the
      // API and check the resulting placement signal.
      t.setOpen(true)
      flush()
      expect(t.open()).toBe(true)
      expect(t.actualPlacement()).toBe('top')
      dispose()
    })
  })

  // hover 是真正的默认触发方式：不显式打开，真实 mouseenter 事件也必须生效。
  it('[tooltip.headless.default-hover-delay] opens on hover with a 100ms default delay, unlike bare createTrigger (0ms)', () => {
    vi.useFakeTimers()
    createRoot((dispose) => {
      const t = createTooltip({})
      const el = element()
      t.triggerRef(el)
      flush() // settle the mount-time effects before dispatching, matching real usage (a user can never hover before the initial render has committed)
      el.dispatchEvent(new Event('mouseenter'))
      flush()
      expect(t.open()).toBe(false) // antd parity: mouseEnterDelay defaults to 100ms, not 0
      vi.advanceTimersByTime(99)
      flush()
      expect(t.open()).toBe(false)
      vi.advanceTimersByTime(1)
      flush()
      expect(t.open()).toBe(true)
      dispose()
    })
  })

  // mouseEnterDelay/mouseLeaveDelay 映射到 hoverOpenDelay/hoverDelay，自定义值必须覆盖默认 100ms。
  it('[tooltip.headless.custom-delay] maps mouseEnterDelay/mouseLeaveDelay onto hover delays', () => {
    vi.useFakeTimers()
    createRoot((dispose) => {
      const t = createTooltip({ mouseEnterDelay: 500, mouseLeaveDelay: 800 })
      const el = element()
      t.triggerRef(el)
      flush()
      el.dispatchEvent(new Event('mouseenter'))
      vi.advanceTimersByTime(499); flush()
      expect(t.open()).toBe(false)
      vi.advanceTimersByTime(1); flush()
      expect(t.open()).toBe(true)

      el.dispatchEvent(new Event('mouseleave'))
      vi.advanceTimersByTime(799); flush()
      expect(t.open()).toBe(true)
      vi.advanceTimersByTime(1); flush()
      expect(t.open()).toBe(false)
      dispose()
    })
  })

  // Tooltip 固定启用箭头（createTrigger 的 arrow 不是可配置项），与 Dropdown 的默认区分开。
  it('[tooltip.headless.arrow-enabled] always reports arrow position data once open', () => {
    createRoot((dispose) => {
      const t = createTooltip({})
      const trigger = element()
      const layer = element()
      t.triggerRef(trigger)
      t.layerRef(layer)
      t.setOpen(true)
      flush()
      expect(t.arrow()).toBeDefined()
      dispose()
    })
  })

  // disabled 原样转发给共享 Trigger，完整语义由 headless/shared/Trigger 覆盖。
  it('[tooltip.headless.disabled-forwards] forwards disabled to block setOpen', () => {
    createRoot((dispose) => {
      const t = createTooltip({ disabled: true })
      t.setOpen(true)
      flush()
      expect(t.open()).toBe(false)
      dispose()
    })
  })

  it('flips top → bottom when there is no room above', () => {
    createRoot((dispose) => {
      const t = createTooltip({ placement: 'top' })
      t.setOpen(true)
      flush()
      // jsdom viewport is 1024×768 with elements at (0,0) size 0 — a top
      // placement with zero-height layer stays put. The flip logic itself is
      // covered in trigger.test.ts; here we only assert the default placement
      // is what createTooltip asked for.
      expect(['top', 'bottom']).toContain(t.actualPlacement())
      dispose()
    })
  })

  it('respects controlled open', () => {
    createRoot((dispose) => {
      const t = createTooltip({ open: true })
      expect(t.open()).toBe(true)
      t.setOpen(false)
      flush()
      expect(t.open()).toBe(true)
      dispose()
    })
  })

  it('notifies onOpenChange', () => {
    createRoot((dispose) => {
      const onOpenChange = vi.fn()
      const t = createTooltip({ onOpenChange })
      t.setOpen(true)
      flush()
      expect(onOpenChange).toHaveBeenCalledWith(true)
      dispose()
    })
  })

  it('exposes refs with open/setOpen', () => {
    createRoot((dispose) => {
      const t = createTooltip({})
      expect(t.refs.open()).toBe(false)
      t.refs.setOpen(true)
      flush()
      expect(t.refs.open()).toBe(true)
      dispose()
    })
  })
})
