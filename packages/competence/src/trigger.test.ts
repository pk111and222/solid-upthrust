import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createTrigger, measurePlacement, type TriggerConfig } from './trigger'

// Minimal element stand-ins: createTrigger only needs getBoundingClientRect,
// contains(), add/removeEventListener for the elements it touches.
const makeEl = (rect = { left: 0, top: 0, right: 100, bottom: 40, width: 100, height: 40 }) => ({
  _rect: rect,
  getBoundingClientRect: () => ({ ...rect }),
  contains: (_n: unknown) => false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})

// jsdom's default viewport (1024×768) is what createTrigger sees via
// window.innerWidth/innerHeight — the flip/clamp tests below must use it.
const jsdomViewport = { w: 1024, h: 768 }
// Pure-measurement tests use an explicit viewport.
const viewport = { w: 1000, h: 800 }

const boot = (config: TriggerConfig, triggerRect = { left: 100, top: 300, right: 200, bottom: 340, width: 100, height: 40 }) => {
  let api!: ReturnType<typeof createTrigger>
  createRoot((dispose) => {
    api = createTrigger(config)
    api.triggerRef(makeEl(triggerRect) as unknown as HTMLElement)
    api.layerRef(makeEl({ left: 0, top: 0, right: 160, bottom: 120, width: 160, height: 120 }) as unknown as HTMLElement)
    dispose()
  })
  return api
}

describe('measurePlacement (pure)', () => {
  const rect = { left: 100, top: 300, right: 200, bottom: 340 }

  it('places below the trigger for bottom placements', () => {
    expect(measurePlacement(rect, 'bottomLeft', 4, viewport)).toEqual({ top: 344, left: 100, placement: 'bottomLeft' })
    expect(measurePlacement(rect, 'bottomRight', 4, viewport)).toEqual({ top: 344, left: 200, placement: 'bottomRight' })
  })

  it('places above the trigger for top placements', () => {
    expect(measurePlacement(rect, 'topLeft', 4, viewport)).toEqual({ top: 296, left: 100, placement: 'topLeft' })
    expect(measurePlacement(rect, 'topRight', 4, viewport)).toEqual({ top: 296, left: 200, placement: 'topRight' })
  })

  it('centers horizontally for plain bottom/top', () => {
    expect(measurePlacement(rect, 'bottom', 4, viewport).left).toBe(150)
    expect(measurePlacement(rect, 'top', 4, viewport).left).toBe(150)
  })

  it('honors a custom offset', () => {
    expect(measurePlacement(rect, 'bottomLeft', 12, viewport).top).toBe(352)
  })
})

describe('createTrigger', () => {
  it('starts closed and toggles with onOpenChange notification', () => {
    createRoot((dispose) => {
      const onOpenChange = vi.fn()
      const t = createTrigger({ onOpenChange })
      expect(t.open()).toBe(false)
      t.toggle()
      flush()
      expect(t.open()).toBe(true)
      expect(onOpenChange).toHaveBeenCalledWith(true)
      t.toggle()
      flush()
      expect(t.open()).toBe(false)
      expect(onOpenChange).toHaveBeenLastCalledWith(false)
      dispose()
    })
  })

  it('respects defaultOpen', () => {
    createRoot((dispose) => {
      expect(createTrigger({ defaultOpen: true }).open()).toBe(true)
      dispose()
    })
  })

  it('controlled open wins and setOpen does not fight it', () => {
    createRoot((dispose) => {
      const t = createTrigger({ open: true })
      t.setOpen(false)
      flush()
      expect(t.open()).toBe(true) // controlled value wins
      dispose()
    })
  })

  it('disabled blocks setOpen and toggle', () => {
    createRoot((dispose) => {
      const onOpenChange = vi.fn()
      const t = createTrigger({ disabled: true, onOpenChange })
      t.toggle()
      t.setOpen(true)
      flush()
      expect(t.open()).toBe(false)
      expect(onOpenChange).not.toHaveBeenCalled()
      dispose()
    })
  })

  it('flips bottom → top when the layer would overflow the viewport bottom', () => {
    // Trigger near the bottom edge; a 120px-tall layer below it overflows.
    const t = boot({}, { left: 100, top: 750, right: 200, bottom: 790, width: 100, height: 40 })
    t.setOpen(true)
    flush()
    expect(t.actualPlacement()).toBe('topLeft')
  })

  it('keeps bottom placement when there is room', () => {
    const t = boot({}, { left: 100, top: 300, right: 200, bottom: 340, width: 100, height: 40 })
    t.setOpen(true)
    flush()
    expect(t.actualPlacement()).toBe('bottomLeft')
  })

  it('flips top → bottom when there is no room above', () => {
    const t = boot({ placement: 'topLeft' }, { left: 100, top: 50, right: 200, bottom: 90, width: 100, height: 40 })
    t.setOpen(true)
    flush()
    expect(t.actualPlacement()).toBe('bottomLeft')
  })

  it('shifts left when the layer would overflow the right edge', () => {
    // bottomRight anchors the layer's right edge (translateX(-100%)) at the
    // trigger's right edge. Trigger right = 1000, layer 160 wide → layer
    // spans [840, 1000], fits inside 1024 → no shift needed.
    const t = boot({ placement: 'bottomRight' }, { left: 950, top: 300, right: 1000, bottom: 340, width: 50, height: 40 })
    t.setOpen(true)
    flush()
    const style = t.layerStyle()
    expect(parseFloat(style.left)).toBe(1000)
    expect(style.transform).toContain('translateX(-100%)')

    // Now push the trigger past the right edge so the layer WOULD overflow:
    // trigger right = 1020 → layer spans [860, 1020]… still fits. Push to
    // 1100 (past viewport): layer spans [940, 1100] → overflow → clamp
    // effective left to 1024-160=864 → anchor = 864+160 = 1024.
    const t2 = boot({ placement: 'bottomRight' }, { left: 1050, top: 300, right: 1100, bottom: 340, width: 50, height: 40 })
    t2.setOpen(true)
    flush()
    const style2 = t2.layerStyle()
    expect(parseFloat(style2.left)).toBe(1024)
    expect(parseFloat(style2.left) - 160).toBe(864) // effective left after translateX(-100%)
  })

  it('reports viewport-coordinate style for the default body container', () => {
    const t = boot({}, { left: 100, top: 300, right: 200, bottom: 340, width: 100, height: 40 })
    t.setOpen(true)
    flush()
    const style = t.layerStyle()
    expect(style.top).toBe('344px')
    expect(style.left).toBe('100px')
    expect(style.position).toBe('absolute')
    expect(style['z-index']).toBe('1050')
  })
})
