import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createFloatButton, createFloatButtonGroup } from '../../../competence/src/floatButton'

const step = (fn: () => void) => { fn(); flush() }

/** A window-like scroll container with controllable scrollTop. */
const mkWindow = (initial = 0) => {
  const w = {
    scrollY: initial,
    listeners: new Set<() => void>(),
    addEventListener: (_t: string, fn: () => void) => { w.listeners.add(fn) },
    removeEventListener: (_t: string, fn: () => void) => { w.listeners.delete(fn) },
    scrollTo: vi.fn(),
    fire: () => { for (const l of w.listeners) l() },
  }
  return w
}

/** Synchronous rAF DI — scroll checks settle within `step`. */
const syncRaf = {
  requestAnimationFrame: (cb: () => void) => { cb(); return 0 },
  cancelAnimationFrame: () => {},
}

describe('createFloatButton — visibility', () => {
  it('without visibilityHeight the button is always visible', () => {
    createRoot(() => {
      const ins = createFloatButton({})
      expect(ins.visible()).toBe(true)
    })
  })

  it('hidden below the threshold, appears above it, hides again', () => {
    createRoot(() => {
      const win = mkWindow(0)
      const onVisibleChange = vi.fn()
      const ins = createFloatButton({
        visibilityHeight: 400,
        getScrollContainer: () => win as unknown as Window,
        onVisibleChange,
        ...syncRaf,
      })
      expect(ins.visible()).toBe(false)
      step(() => { win.scrollY = 500; win.fire() })
      expect(ins.visible()).toBe(true)
      expect(onVisibleChange).toHaveBeenLastCalledWith(true)
      step(() => { win.scrollY = 100; win.fire() })
      expect(ins.visible()).toBe(false)
      expect(onVisibleChange).toHaveBeenLastCalledWith(false)
    })
  })

  it('controlled visible wins over scroll-spy', () => {
    createRoot(() => {
      const win = mkWindow(0)
      const ins = createFloatButton({
        visible: true,
        visibilityHeight: 400,
        getScrollContainer: () => win as unknown as Window,
        ...syncRaf,
      })
      expect(ins.visible()).toBe(true)
      step(() => { win.scrollY = 5000; win.fire() })
      expect(ins.visible()).toBe(true) // controlled pins it
    })
  })

  it('BackTop click scrolls the container to top; plain click only reports', () => {
    createRoot(() => {
      const scrollToTop = vi.fn()
      const onClick = vi.fn()
      const back = createFloatButton({
        backTop: true,
        visibilityHeight: 400,
        getScrollContainer: () => mkWindow(900) as unknown as Window,
        scrollToTop,
        onClick,
        ...syncRaf,
      })
      expect(back.isBackTop()).toBe(true)
      step(() => back.handleClick())
      expect(scrollToTop).toHaveBeenCalledWith(undefined)
      expect(onClick).toHaveBeenCalledOnce()

      const plain = createFloatButton({ onClick })
      expect(plain.isBackTop()).toBe(false)
      step(() => plain.handleClick())
      expect(onClick).toHaveBeenCalledTimes(2)
    })
  })

  it('falls back to scrollTo({top:0}) when no scrollToTop is injected', () => {
    createRoot(() => {
      const win = mkWindow(900)
      const ins = createFloatButton({
        backTop: true,
        visibilityHeight: 400,
        getScrollContainer: () => win as unknown as Window,
        ...syncRaf,
      })
      step(() => ins.handleClick())
      expect(win.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    })
  })

  it('containerRef registers an element container (BackTop in a scroll pane)', () => {
    createRoot(() => {
      const listeners = new Set<() => void>()
      const el = {
        scrollTop: 800,
        addEventListener: (_t: string, fn: () => void) => { listeners.add(fn) },
        removeEventListener: () => {},
        scrollTo: vi.fn(),
      }
      // At creation no container is known → the button stays hidden.
      const ins = createFloatButton({ visibilityHeight: 400, ...syncRaf })
      expect(ins.visible()).toBe(false)
      // The ref registers the pane and binds the listener + initial check.
      step(() => ins.containerRef(el as unknown as HTMLElement))
      expect(ins.visible()).toBe(true)
      // Scrolling the pane back below the threshold hides it again.
      step(() => {
        ;(el as { scrollTop: number }).scrollTop = 100
        for (const l of listeners) l()
      })
      expect(ins.visible()).toBe(false)
    })
  })
})

describe('createFloatButtonGroup', () => {
  it('starts collapsed (or expanded with defaultOpen)', () => {
    createRoot(() => {
      const a = createFloatButtonGroup({})
      expect(a.open()).toBe(false)
      const b = createFloatButtonGroup({ defaultOpen: true })
      expect(b.open()).toBe(true)
    })
  })

  it('toggle flips; onOpenChange reports', () => {
    createRoot(() => {
      const onOpenChange = vi.fn()
      const ins = createFloatButtonGroup({ onOpenChange })
      step(() => ins.toggle())
      expect(ins.open()).toBe(true)
      expect(onOpenChange).toHaveBeenLastCalledWith(true)
      step(() => ins.setOpen(false))
      expect(ins.open()).toBe(false)
      expect(onOpenChange).toHaveBeenLastCalledWith(false)
    })
  })

  it('controlled open pins the state; setOpen only reports', () => {
    createRoot(() => {
      const onOpenChange = vi.fn()
      const ins = createFloatButtonGroup({ open: true, onOpenChange })
      step(() => ins.toggle())
      expect(ins.open()).toBe(true) // controlled wins
      expect(onOpenChange).toHaveBeenCalledWith(false) // but the intent reported
    })
  })

  it('direction defaults to up', () => {
    createRoot(() => {
      const a = createFloatButtonGroup({})
      expect(a.direction()).toBe('up')
      const b = createFloatButtonGroup({ direction: 'left' })
      expect(b.direction()).toBe('left')
    })
  })

  it('BackTop flag passes through to the group trigger', () => {
    createRoot(() => {
      const ins = createFloatButtonGroup({ backTop: true })
      expect(ins.isBackTop()).toBe(true)
    })
  })
})
