import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { createImageGroup } from './imageGroup'

describe('createImageGroup', () => {
  it('registry grows/shrinks reactively and feeds the carousel count', () => {
    createRoot((dispose) => {
      const g = createImageGroup({})
      expect(g.sources()).toEqual([])
      const off1 = g.register('a.png')
      const off2 = g.register('b.png')
      const off3 = g.register('c.png')
      flush()
      expect(g.sources()).toEqual(['a.png', 'b.png', 'c.png'])
      expect(g.carousel.current()).toBe(0)
      // Single member: arrows are no-ops count-wise but bounds stay sound.
      expect(g.carousel.canNext()).toBe(true) // infinite wraps
      off2()
      flush()
      expect(g.sources()).toEqual(['a.png', 'c.png'])
      off1(); off3()
      flush()
      expect(g.sources()).toEqual([])
      dispose()
    })
  })

  it('currentSrc tracks the carousel index across switches', () => {
    createRoot((dispose) => {
      const g = createImageGroup({})
      g.register('a.png'); g.register('b.png'); g.register('c.png')
      flush()
      expect(g.currentSrc()).toBe('a.png')
      g.carousel.next()
      flush()
      expect(g.currentSrc()).toBe('b.png')
      g.carousel.goTo(2)
      flush()
      expect(g.currentSrc()).toBe('c.png')
      g.carousel.next() // wraps forward to 0
      flush()
      expect(g.currentSrc()).toBe('a.png')
      dispose()
    })
  })

  it('openAt jumps without animation and opens the preview', () => {
    createRoot((dispose) => {
      const g = createImageGroup({})
      g.register('a.png'); g.register('b.png')
      flush()
      g.openAt(1)
      flush()
      expect(g.previewOpen()).toBe(true)
      expect(g.carousel.current()).toBe(1)
      expect(g.carousel.animate()).toBe(false)
      dispose()
    })
  })

  it('openAt on the same index still opens (goTo no-op, open proceeds)', () => {
    createRoot((dispose) => {
      const g = createImageGroup({})
      g.register('a.png')
      flush()
      g.openAt(0)
      flush()
      expect(g.previewOpen()).toBe(true)
      expect(g.carousel.current()).toBe(0)
      dispose()
    })
  })

  it('group preview open: uncontrolled toggle + controlled override + callback', () => {
    createRoot((dispose) => {
      let seen: boolean | undefined
      const g = createImageGroup({ onPreviewVisibleChange: (o) => { seen = o } })
      g.setPreviewOpen(true)
      flush()
      expect(g.previewOpen()).toBe(true)
      expect(seen).toBe(true)
      g.setPreviewOpen(false)
      flush()
      expect(g.previewOpen()).toBe(false)

      const [ctrl, setCtrl] = createSignal(true, { ownedWrite: true })
      const gc = createImageGroup({ get previewVisible() { return ctrl() } })
      expect(gc.previewOpen()).toBe(true)
      gc.setPreviewOpen(false) // controlled: internal signal untouched, callback fires
      flush()
      expect(gc.previewOpen()).toBe(true) // still the controlled value
      expect(seen).toBe(false)
      setCtrl(false)
      flush()
      expect(gc.previewOpen()).toBe(false)
      dispose()
    })
  })

  it('controlled current wins over the internal carousel index', () => {
    createRoot((dispose) => {
      const [cur, setCur] = createSignal(0, { ownedWrite: true })
      const g = createImageGroup({ get current() { return cur() } })
      g.register('a.png'); g.register('b.png'); g.register('c.png')
      flush()
      expect(g.carousel.current()).toBe(0)
      g.carousel.next()
      flush()
      expect(g.carousel.current()).toBe(0) // controlled value pins it
      setCur(2)
      flush()
      expect(g.carousel.current()).toBe(2)
      expect(g.currentSrc()).toBe('c.png')
      dispose()
    })
  })

  it('onChange bridges with antd signature (current, prev)', () => {
    createRoot((dispose) => {
      const calls: [number, number][] = []
      const g = createImageGroup({ onChange: (cur, prev) => calls.push([cur, prev]) })
      g.register('a.png'); g.register('b.png'); g.register('c.png')
      flush()
      g.carousel.next()
      flush()
      expect(calls).toEqual([[1, 0]])
      g.carousel.goTo(0)
      flush()
      expect(calls).toEqual([[1, 0], [0, 1]])
      dispose()
    })
  })

  it('clamped at the ends when infinite=false', () => {
    createRoot((dispose) => {
      const g = createImageGroup({ infinite: false })
      g.register('a.png'); g.register('b.png')
      flush()
      g.carousel.prev()
      flush()
      expect(g.carousel.current()).toBe(0)
      expect(g.carousel.canPrev()).toBe(false)
      g.carousel.next(); g.carousel.next()
      flush()
      expect(g.carousel.current()).toBe(1)
      expect(g.carousel.canNext()).toBe(false)
      dispose()
    })
  })

  it('a src change re-register keeps indices stable (member order by mount)', () => {
    createRoot((dispose) => {
      const g = createImageGroup({})
      const off1 = g.register('a.png')
      g.register('b.png')
      flush()
      g.carousel.goTo(1)
      flush()
      expect(g.currentSrc()).toBe('b.png')
      off1() // removing the FIRST member shifts b to index 0
      flush()
      expect(g.sources()).toEqual(['b.png'])
      dispose()
    })
  })
})
