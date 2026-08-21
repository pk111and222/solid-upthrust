import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createAnchor, getScrollTop, type AnchorItem } from './anchor'

/**
 * Minimal DOM stand-ins: anchors only need getElementById + getBoundingClientRect
 * on the target sections, plus a scrollable container with scrollTo/addEventListener.
 */
type SectionRect = { top: number; height: number }

const makeSection = (rect: SectionRect) => ({
  getBoundingClientRect: () => ({ top: rect.top, height: rect.height }),
})

const makeContainer = (initialTop = 0) => {
  const listeners = new Set<() => void>()
  const container = {
    scrollTop: initialTop,
    getBoundingClientRect: () => ({ top: 0 }),
    addEventListener: (_t: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_t: string, fn: () => void) => listeners.delete(fn),
    scrollTo: vi.fn(),
    fire: () => listeners.forEach((fn) => fn()),
  }
  return container
}

const installDom = (sections: Record<string, SectionRect>) => {
  const els = new Map<string, ReturnType<typeof makeSection>>()
  for (const [id, rect] of Object.entries(sections)) els.set(id, makeSection(rect))
  const spy = vi.spyOn(document, 'getElementById').mockImplementation((id) =>
    (els.get(id) as unknown as HTMLElement) ?? null
  )
  return {
    setRect: (id: string, rect: SectionRect) => els.set(id, makeSection(rect)),
    restore: () => spy.mockRestore(),
  }
}

// rAF is synchronous in tests so handleScroll resolves immediately.
const syncRaf = { requestAnimationFrame: (cb: () => void) => { cb(); return 0 }, cancelAnimationFrame: () => {} }

const items: AnchorItem[] = [
  { key: 'a', href: '#a', title: 'A' },
  { key: 'b', href: '#b', title: 'B' },
  { key: 'c', href: '#c', title: 'C' },
]

describe('createAnchor', () => {
  it('activates the last section above the activation line (scrolling down)', () => {
    createRoot((dispose) => {
      const dom = installDom({
        a: { top: 0, height: 100 },
        b: { top: 90, height: 100 },
        c: { top: 190, height: 100 },
      })
      const container = makeContainer()
      const onChange = vi.fn()
      createAnchor({
        items,
        onChange,
        getScrollContainer: () => container as unknown as HTMLElement,
        requestAnimationFrame: syncRaf.requestAnimationFrame,
        cancelAnimationFrame: syncRaf.cancelAnimationFrame,
      })
      flush()

      // Container scrolled 100px: line = 100 + 0 + 5; tops (viewport-relative) shift up.
      container.scrollTop = 100
      dom.setRect('a', { top: -100, height: 100 })
      dom.setRect('b', { top: -10, height: 100 })
      dom.setRect('c', { top: 90, height: 100 })
      container.fire()
      flush()
      expect(onChange).toHaveBeenLastCalledWith('b')

      dispose()
      dom.restore()
    })
  })

  it('re-activates the earlier section when scrolling back up (regression: was one-way)', () => {
    createRoot((dispose) => {
      const dom = installDom({
        a: { top: 0, height: 100 },
        b: { top: 90, height: 100 },
        c: { top: 190, height: 100 },
      })
      const container = makeContainer()
      const onChange = vi.fn()
      createAnchor({
        items,
        onChange,
        getScrollContainer: () => container as unknown as HTMLElement,
        requestAnimationFrame: syncRaf.requestAnimationFrame,
        cancelAnimationFrame: syncRaf.cancelAnimationFrame,
      })
      flush()

      // Scroll down to c
      container.scrollTop = 300
      dom.setRect('a', { top: -300, height: 100 })
      dom.setRect('b', { top: -210, height: 100 })
      dom.setRect('c', { top: -110, height: 100 })
      container.fire()
      flush()
      expect(onChange).toHaveBeenLastCalledWith('c')

      // Scroll back up past b
      container.scrollTop = 100
      dom.setRect('a', { top: -100, height: 100 })
      dom.setRect('b', { top: -10, height: 100 })
      dom.setRect('c', { top: 90, height: 100 })
      container.fire()
      flush()
      expect(onChange).toHaveBeenLastCalledWith('b')

      // And all the way up
      container.scrollTop = 0
      dom.setRect('a', { top: 0, height: 100 })
      dom.setRect('b', { top: 90, height: 100 })
      dom.setRect('c', { top: 190, height: 100 })
      container.fire()
      flush()
      expect(onChange).toHaveBeenLastCalledWith('a')

      dispose()
      dom.restore()
    })
  })

  it('clears the active key when scrolled above every section', () => {
    createRoot((dispose) => {
      const dom = installDom({
        a: { top: 600, height: 100 },
        b: { top: 700, height: 100 },
      })
      const container = makeContainer()
      const onChange = vi.fn()
      const anchor = createAnchor({
        items: [{ key: 'a', href: '#a', title: 'A' }, { key: 'b', href: '#b', title: 'B' }],
        onChange,
        getScrollContainer: () => container as unknown as HTMLElement,
        requestAnimationFrame: syncRaf.requestAnimationFrame,
        cancelAnimationFrame: syncRaf.cancelAnimationFrame,
      })
      flush()

      // Scrolled down then back above the first section: nothing is active.
      container.scrollTop = 0
      dom.setRect('a', { top: 600, height: 100 })
      dom.setRect('b', { top: 700, height: 100 })
      container.fire()
      flush()
      expect(anchor.activeKey()).toBe('')

      dispose()
      dom.restore()
    })
  })

  it('keeps the last section active when scrolled past the bottom', () => {
    createRoot((dispose) => {
      const dom = installDom({
        a: { top: -500, height: 100 },
        b: { top: -400, height: 100 },
      })
      const container = makeContainer(600)
      const onChange = vi.fn()
      const anchor = createAnchor({
        items: [{ key: 'a', href: '#a', title: 'A' }, { key: 'b', href: '#b', title: 'B' }],
        onChange,
        getScrollContainer: () => container as unknown as HTMLElement,
        requestAnimationFrame: syncRaf.requestAnimationFrame,
        cancelAnimationFrame: syncRaf.cancelAnimationFrame,
      })
      flush()

      container.fire()
      flush()
      expect(anchor.activeKey()).toBe('b')

      dispose()
      dom.restore()
    })
  })

  it('honors targetOffset by shifting the activation line', () => {
    createRoot((dispose) => {
      const dom = installDom({
        a: { top: 0, height: 100 },
        b: { top: 90, height: 100 },
      })
      const container = makeContainer(200)
      const onChange = vi.fn()
      const anchor = createAnchor({
        items: [{ key: 'a', href: '#a', title: 'A' }, { key: 'b', href: '#b', title: 'B' }],
        targetOffset: 100,
        onChange,
        getScrollContainer: () => container as unknown as HTMLElement,
        requestAnimationFrame: syncRaf.requestAnimationFrame,
        cancelAnimationFrame: syncRaf.cancelAnimationFrame,
      })
      flush()

      // line = 200 + 100 + 5 = 305 > 90, so b wins even though it is below a.
      container.fire()
      flush()
      expect(anchor.activeKey()).toBe('b')

      dispose()
      dom.restore()
    })
  })

  it('getCurrentAnchor overrides scroll-spy (controlled mode)', () => {
    createRoot((dispose) => {
      const dom = installDom({ a: { top: 0, height: 100 } })
      const container = makeContainer()
      const anchor = createAnchor({
        items: [{ key: 'a', href: '#a', title: 'A' }],
        getCurrentAnchor: () => 'pinned',
        getScrollContainer: () => container as unknown as HTMLElement,
        requestAnimationFrame: syncRaf.requestAnimationFrame,
        cancelAnimationFrame: syncRaf.cancelAnimationFrame,
      })
      flush()

      container.fire()
      flush()
      expect(anchor.activeKey()).toBe('pinned')

      dispose()
      dom.restore()
    })
  })

  it('scrollTo scrolls the container and activates the target', () => {
    createRoot((dispose) => {
      // b sits 400px into the content; container already scrolled 100px.
      const dom = installDom({ a: { top: -100, height: 100 }, b: { top: 300, height: 100 } })
      const container = makeContainer(100)
      const onChange = vi.fn()
      const anchor = createAnchor({
        items: [{ key: 'a', href: '#a', title: 'A' }, { key: 'b', href: '#b', title: 'B' }],
        onChange,
        getScrollContainer: () => container as unknown as HTMLElement,
        requestAnimationFrame: syncRaf.requestAnimationFrame,
        cancelAnimationFrame: syncRaf.cancelAnimationFrame,
      })
      flush()

      anchor.scrollTo('b')
      // 300 (viewport-relative) + 100 (current scroll) = 400 content offset.
      expect(container.scrollTo).toHaveBeenCalledWith({ top: 400, behavior: 'smooth' })
      expect(onChange).toHaveBeenCalledWith('b')
      // activeKey memo propagates through the async ownedWrite commit —
      // asserted below after flush (Solid 2 rc batched-write behavior).
      flush()
      expect(anchor.activeKey()).toBe('b')

      dispose()
      dom.restore()
    })
  })

  it('flattens nested children into scroll-spy targets', async () => {
    let result = ''
    createRoot((dispose) => {
      // Viewport-relative tops: parent already scrolled past (-200), child at
      // -110. Line = 200 + 5 = 205; content offsets: parent 0, child 90 —
      // both qualify, child is later in flat document order so it wins.
      const dom = installDom({
        parent: { top: -200, height: 100 },
        child: { top: -110, height: 100 },
      })
      const container = makeContainer(200)
      const anchor = createAnchor({
        items: [{
          key: 'p', href: '#parent', title: 'Parent',
          children: [{ key: 'c', href: '#child', title: 'Child' }],
        }],
        getScrollContainer: () => container as unknown as HTMLElement,
        requestAnimationFrame: syncRaf.requestAnimationFrame,
        cancelAnimationFrame: syncRaf.cancelAnimationFrame,
      })
      flush()

      container.fire()
      // The ownedWrite commit needs one more microtask to land (Solid 2 rc
      // batching).
      flush()
      result = anchor.activeKey()

      dispose()
      dom.restore()
    })
    await Promise.resolve()
    flush()
    expect(result).toBe('c')
  })
})

describe('getScrollTop', () => {
  it('reads scrollY for window-like containers and scrollTop for elements', () => {
    expect(getScrollTop({ scrollY: 123 } as unknown as Window)).toBe(123)
    expect(getScrollTop({ scrollTop: 45 } as unknown as HTMLElement)).toBe(45)
  })
})
