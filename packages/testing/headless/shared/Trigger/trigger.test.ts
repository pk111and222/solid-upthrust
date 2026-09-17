import { createRoot, flush } from 'solid-js'
// NOTE: Solid 2 signals commit writes in batches — a setter called inside a
// timer callback only lands after a flush(). The lazyMount tests below read
// `mounted()` right after `advanceTimersByTime`, so flush explicitly.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTrigger, measurePlacement, computeArrow, type TriggerConfig, type TriggerPlacement } from '../../../../competence/src/trigger'

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

const bootRoots: Array<() => void> = []
afterEach(() => { while (bootRoots.length) bootRoots.pop()!() })

const boot = (
  config: TriggerConfig,
  triggerRect = { left: 100, top: 300, right: 200, bottom: 340, width: 100, height: 40 },
  layerRect = { left: 0, top: 0, right: 160, bottom: 120, width: 160, height: 120 },
) => {
  let api!: ReturnType<typeof createTrigger>
  createRoot((dispose) => {
    bootRoots.push(dispose)
    api = createTrigger(config)
    api.triggerRef(makeEl(triggerRect) as unknown as HTMLElement)
    api.layerRef(makeEl(layerRect) as unknown as HTMLElement)
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

describe('lazyMount', () => {
  it('mounts only after first open, survives close, and reuses DOM on reopen', () => {
    createRoot((dispose) => {
      const t = createTrigger({ lazyMount: true })
      expect(t.mounted()).toBe(false)

      t.setOpen(true)
      flush()
      expect(t.mounted()).toBe(true)

      // Close → still mounted (leave animation + grace period).
      t.setOpen(false)
      flush()
      expect(t.mounted()).toBe(true)

      // Reopen cancels the pending destroy — mounted never dips.
      t.setOpen(true)
      flush()
      expect(t.mounted()).toBe(true)
      dispose()
    })
  })

  it('defaults to lazy (no config) and respects lazyMount: false', () => {
    createRoot((dispose) => {
      expect(createTrigger({}).mounted()).toBe(false) // default true
      expect(createTrigger({ lazyMount: false }).mounted()).toBe(true)
      dispose()
    })
  })

  it('mounts immediately for defaultOpen: true', () => {
    createRoot((dispose) => {
      expect(createTrigger({ defaultOpen: true }).mounted()).toBe(true)
      dispose()
    })
  })

  it('destroys the DOM after the leave animation + destroyDelay', () => {
    vi.useFakeTimers()
    createRoot((dispose) => {
      const t = createTrigger({ lazyMount: true, destroyDelay: 1000 })
      t.setOpen(true)
      flush()
      t.setOpen(false)
      flush()
      expect(t.mounted()).toBe(true)

      // destroyDelay + 300ms animation headroom → not yet destroyed just
      // before. Note: the setOpen(true) retry macrotask (setTimeout 0) also
      // lives on the fake clock, so advance past it first.
      vi.advanceTimersByTime(1290)
      flush()
      expect(t.mounted()).toBe(true)

      vi.advanceTimersByTime(10)
      flush()
      expect(t.mounted()).toBe(false)

      // Reopening after destroy remounts fresh.
      t.setOpen(true)
      flush()
      expect(t.mounted()).toBe(true)
      dispose()
    })
    vi.useRealTimers()
  })
})

describe('viewport flip (rc-align visible-area strategy)', () => {
  // Layer 160×120. jsdom viewport 1024×768.
  const layerRect = { left: 0, top: 0, right: 160, bottom: 120, width: 160, height: 120 }

  it('flips when the opposite side shows strictly more of the layer', () => {
    // Trigger near the bottom edge: below it only 768-750=18px visible,
    // above it the full 120px fits → flip to top.
    const t = boot({}, { left: 100, top: 750, right: 200, bottom: 790, width: 100, height: 40 }, layerRect)
    t.setOpen(true)
    flush()
    expect(t.actualPlacement()).toBe('topLeft')
  })

  it('keeps the preferred side when both fit (tie goes to preferred)', () => {
    // Mid-screen trigger: both sides fully visible → no flip.
    const t = boot({}, { left: 100, top: 300, right: 200, bottom: 340, width: 100, height: 40 }, layerRect)
    t.setOpen(true)
    flush()
    expect(t.actualPlacement()).toBe('bottomLeft')
  })

  it('picks the better side even when neither fully fits', () => {
    // Layer 500 tall (viewport 768). Trigger top=200: below shows
    // min(240+500,768)-240=528px, above shows 200px → bottom wins (preferred
    // anyway). Now trigger top=700: below shows 68px, above shows 700px →
    // flip to top even though top also clips (768-500=268 < 700).
    const tallLayer = { left: 0, top: 0, right: 160, bottom: 500, width: 160, height: 500 }
    const t = boot({ placement: 'bottomLeft' }, { left: 100, top: 700, right: 200, bottom: 740, width: 100, height: 40 }, tallLayer)
    t.setOpen(true)
    flush()
    expect(t.actualPlacement()).toBe('topLeft')
  })

  it('does not flip back and forth when the layer is zero-height', () => {
    const zeroLayer = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }
    const t = boot({ placement: 'bottomLeft' }, { left: 100, top: 750, right: 200, bottom: 790, width: 100, height: 40 }, zeroLayer)
    t.setOpen(true)
    flush()
    // Zero-height layer: both sides show 0px — tie keeps preferred.
    expect(t.actualPlacement()).toBe('bottomLeft')
  })
})

describe('arrow', () => {
  const triggerRect = { left: 100, top: 300, right: 200, bottom: 340, width: 100, height: 40 }
  const layerRect = { left: 0, top: 0, right: 160, bottom: 120, width: 160, height: 120 }

  it('reports arrow data when arrow: true, centered on the trigger', () => {
    const t = boot({ placement: 'bottomLeft', arrow: true }, triggerRect, layerRect)
    t.setOpen(true)
    flush()
    const a = t.arrow()
    // Layer left = 100 (aligns with trigger left), trigger center X = 150
    // → arrow x = 150 - 100 = 50. Layer is BELOW → arrow on top edge.
    expect(a).toBeDefined()
    expect(a!.x).toBe(50)
    expect(a!.y).toBe(0)
    expect(a!.side).toBe('top')
  })

  it('flips the arrow side when the layer flips above the trigger', () => {
    // Trigger near the bottom edge → layer flips to top → arrow on bottom edge.
    const t = boot({ placement: 'bottomLeft', arrow: true }, { left: 100, top: 750, right: 200, bottom: 790, width: 100, height: 40 }, layerRect)
    t.setOpen(true)
    flush()
    expect(t.actualPlacement()).toBe('topLeft')
    const a = t.arrow()
    expect(a!.side).toBe('bottom')
    expect(a!.y).toBe(120) // layer-local bottom edge
  })

  it('clamps the arrow so it never reaches the rounded corners', () => {
    // A wide trigger whose center is far from the layer's left edge — e.g. a
    // centered placement where the layer is much narrower than the trigger.
    // Layer 160 wide, trigger 800 wide centered on it → raw x = 400 → must
    // clamp to 160 - 12 = 148.
    const wideTrigger = { left: 100, top: 300, right: 900, bottom: 340, width: 800, height: 40 }
    // centered bottom: anchor = trigger center = 500; layer effective left
    // = 500 - 80 = 420. Trigger center = 500 → raw x = 80… that still fits.
    // Use computeArrow directly for the pure clamp branch instead.
    const pos = { top: 352, left: 500, placement: 'bottom' as const }
    const a = computeArrow(
      { getBoundingClientRect: () => wideTrigger },
      { getBoundingClientRect: () => layerRect },
      pos,
    )
    // bottom → anchor = trigger center 500 → layerLeft = 500 - 80 = 420.
    // Trigger center = 500 → raw x = 500 - 420 = 80 — inside.
    // Shift the anchor hard left so the layer slides out from under the
    // trigger center: anchor 100 → layerLeft = 20, center 500 → raw 480.
    const pos2 = { top: 352, left: 100, placement: 'bottom' as const }
    const a2 = computeArrow(
      { getBoundingClientRect: () => wideTrigger },
      { getBoundingClientRect: () => layerRect },
      pos2,
    )
    expect(a2.x).toBe(148) // clamped from raw 480
    // And mirrored: anchor far right → raw x negative → clamps to 12.
    const pos3 = { top: 352, left: 900, placement: 'bottom' as const }
    const a3 = computeArrow(
      { getBoundingClientRect: () => wideTrigger },
      { getBoundingClientRect: () => layerRect },
      pos3,
    )
    expect(a3.x).toBe(12)
    // sanity: the in-bounds case passes through unclamped
    expect(a.x).toBe(80)
  })

  it('widens the gap by arrowPadding when arrow: true', () => {
    const t = boot({ placement: 'bottomLeft', arrow: true }, triggerRect, layerRect)
    t.setOpen(true)
    flush()
    // gap = offset(4) + arrowPadding(8) = 12 → top = 340 + 12 = 352
    expect(t.layerStyle().top).toBe('352px')
  })

  it('computeArrow is pure and exported', () => {
    const pos = { top: 352, left: 100, placement: 'bottomLeft' as const }
    // Layer at anchor 100 (left-aligned), trigger spans 100..200 → center 150
    // → x = 150 - 100 = 50. bottom placement → arrow on the top edge.
    const a = computeArrow(
      { getBoundingClientRect: () => triggerRect },
      { getBoundingClientRect: () => layerRect },
      pos,
    )
    expect(a).toEqual({ x: 50, y: 0, side: 'top' })
  })
})

describe('horizontal placements (left/right)', () => {
  // Trigger 100..200 × 300..340, layer 160×120, viewport 1024×768.
  const triggerRect = { left: 400, top: 300, right: 500, bottom: 340, width: 100, height: 40 }

  it('places the layer to the right of the trigger, top-aligned (rightTop)', () => {
    // gap 4 → layer left = 504, top = 300 (tops aligned)
    const t = boot({ placement: 'rightTop' }, triggerRect)
    t.setOpen(true)
    flush()
    expect(t.layerStyle().left).toBe('504px')
    expect(t.layerStyle().top).toBe('300px')
    expect(t.layerStyle().transform ?? '').not.toContain('translateY(-100%)')
  })

  it('centers the layer vertically for plain right', () => {
    const t = boot({ placement: 'right' }, triggerRect)
    t.setOpen(true)
    flush()
    // anchor at trigger vertical center = 320
    expect(t.layerStyle().top).toBe('320px')
    expect(t.layerStyle().transform).toContain('translateY(-50%)')
  })

  it('aligns the layer bottom with the trigger bottom (rightBottom)', () => {
    const t = boot({ placement: 'rightBottom' }, triggerRect)
    t.setOpen(true)
    flush()
    expect(t.layerStyle().top).toBe('340px')
    expect(t.layerStyle().transform).toContain('translateY(-100%)')
  })

  it('hangs the layer off the trigger\'s left side (leftTop)', () => {
    const t = boot({ placement: 'leftTop' }, triggerRect)
    t.setOpen(true)
    flush()
    // anchor IS the layer's right edge: trigger.left - 4 = 396; the layer's
    // translateX(-100%) grows it leftward from there.
    expect(t.layerStyle().left).toBe('396px')
    expect(t.layerStyle().transform).toContain('translateX(-100%)')
  })

  it('flips right → left when the layer would overflow the viewport right', () => {
    // Trigger near the right edge: layer 160 wide to its right overflows.
    const t = boot({ placement: 'rightTop' }, { left: 950, top: 300, right: 1020, bottom: 340, width: 70, height: 40 })
    t.setOpen(true)
    flush()
    expect(t.actualPlacement()).toBe('leftTop')
  })

  it('arrow sits on the layer edge facing the trigger (right placement)', () => {
    const t = boot({ placement: 'right', arrow: true }, triggerRect)
    t.setOpen(true)
    flush()
    const a = t.arrow()
    // Layer right of trigger → arrow on layer's LEFT edge pointing left.
    expect(a!.side).toBe('left')
    expect(a!.x).toBe(0)
    // Tracks trigger's vertical center: layer top = 320-60 = 260, center 320 → y = 60
    expect(a!.y).toBe(60)
  })

  it('clamps the layer vertically when it would overflow the top (right placement)', () => {
    // Trigger near the top: centered layer 120 tall would stick out above.
    const t = boot({ placement: 'right' }, { left: 400, top: 20, right: 500, bottom: 60, width: 100, height: 40 })
    t.setOpen(true)
    flush()
    // Clamped so layer top = 0 → anchor (translateY(-50%)) = 0 + 60 = 60
    expect(t.layerStyle().top).toBe('60px')
  })
})

describe('seed placement (first-frame transform stability)', () => {
  // The layer renders one frame at (0,0) before the first measurement with
  // the SEEDED placement's translate. If the seed is a hard-coded
  // 'bottomLeft', a rightBottom layer would jump from "no translate" to
  // "translateY(-100%)" — and because the entrance transition covers
  // transform, that jump becomes a visible glide from off-screen.
  const cases: [TriggerPlacement, string][] = [
    ['rightBottom', 'translateY(-100%)'],
    ['rightTop', ''],
    ['leftBottom', 'translateY(-100%) translateX(-100%)'],
    ['left', 'translateX(-100%) translateY(-50%)'],
    ['top', 'translateY(-100%) translateX(-50%)'],
    ['bottom', 'translateX(-50%)'],
  ]
  for (const [placement, expectedTransform] of cases) {
    it(`seeds _pos with the configured placement (${placement}) so the pre-measure frame carries the final translate`, () => {
      createRoot((dispose) => {
        const t = createTrigger({ placement })
        const style = t.layerStyle()
        // Pre-measure (not ready): the transform must already match the
        // target placement's pairing.
        expect(style.transform ?? '').toBe(expectedTransform)
        expect(style.visibility).toBe('hidden')
        expect(style.transition).toBe('none')
        dispose()
      })
    })
  }
})
