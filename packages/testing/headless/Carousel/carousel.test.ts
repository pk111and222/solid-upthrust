import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createCarousel } from '../../../competence/src/carousel'

describe('createCarousel', () => {
  it('starts at defaultCurrent and exposes the count-derived bounds', () => {
    createRoot((dispose) => {
      const c = createCarousel({ count: 4, defaultCurrent: 2 })
      expect(c.current()).toBe(2)
      expect(c.canPrev()).toBe(true)
      expect(c.canNext()).toBe(true)
      dispose()
    })
  })

  it('next/prev move one step and set the direction', () => {
    createRoot((dispose) => {
      const c = createCarousel({ count: 3 })
      c.next()
      flush()
      expect(c.current()).toBe(1)
      expect(c.direction()).toBe('forward')
      c.prev()
      flush()
      expect(c.current()).toBe(0)
      expect(c.direction()).toBe('backward')
      dispose()
    })
  })

  it('wraps around at both ends when infinite (default)', () => {
    createRoot((dispose) => {
      const c = createCarousel({ count: 3 })
      c.prev() // 0 → wraps backward to the last
      flush()
      expect(c.current()).toBe(2)
      expect(c.direction()).toBe('backward')
      c.next() // 2 → wraps forward to 0
      c.next()
      c.next()
      flush()
      expect(c.current()).toBe(2)
      expect(c.direction()).toBe('forward')
      dispose()
    })
  })

  it('clamps at the ends when infinite=false', () => {
    createRoot((dispose) => {
      const c = createCarousel({ count: 3, infinite: false })
      c.prev()
      flush()
      expect(c.current()).toBe(0)
      expect(c.canPrev()).toBe(false)
      c.next(); c.next(); c.next()
      flush()
      expect(c.current()).toBe(2)
      expect(c.canNext()).toBe(false)
      dispose()
    })
  })

  it('goTo clamps out-of-range indices', () => {
    createRoot((dispose) => {
      const c = createCarousel({ count: 4 })
      c.goTo(99)
      flush()
      expect(c.current()).toBe(3)
      c.goTo(-5)
      flush()
      expect(c.current()).toBe(0)
      dispose()
    })
  })

  it('goTo infer direction from the index delta', () => {
    createRoot((dispose) => {
      const c = createCarousel({ count: 5 })
      c.goTo(3)
      flush()
      expect(c.direction()).toBe('forward')
      c.goTo(1)
      flush()
      expect(c.direction()).toBe('backward')
      dispose()
    })
  })

  it('fires beforeChange/afterChange around a transition', () => {
    createRoot((dispose) => {
      const before = vi.fn()
      const after = vi.fn()
      const c = createCarousel({ count: 3, beforeChange: before, afterChange: after })
      c.next()
      flush()
      expect(before).toHaveBeenCalledWith(0, 1)
      expect(after).toHaveBeenCalledWith(1)
      dispose()
    })
  })

  it('controlled current wins over internal moves', () => {
    createRoot((dispose) => {
      const c = createCarousel({ count: 3, current: 1 })
      c.next() // ignored in controlled mode
      flush()
      expect(c.current()).toBe(1)
      dispose()
    })
  })

  it('autoplayActive reflects enable, pause and slide count', () => {
    createRoot((dispose) => {
      const off = createCarousel({ count: 3 })
      expect(off.autoplayActive()).toBe(false)

      const on = createCarousel({ count: 3, autoplay: true })
      expect(on.autoplayActive()).toBe(true)
      on.pause()
      flush()
      expect(on.autoplayActive()).toBe(false)
      on.resume()
      flush()
      expect(on.autoplayActive()).toBe(true)

      const single = createCarousel({ count: 1, autoplay: true })
      expect(single.autoplayActive()).toBe(false) // never autoplay one slide

      const noHover = createCarousel({ count: 2, autoplay: true, pauseOnHover: false })
      noHover.pause()
      flush()
      expect(noHover.autoplayActive()).toBe(true) // hover pause disabled
      dispose()
    })
  })

  it('animate flag: goTo(index, false) marks the transition as instant', () => {
    createRoot((dispose) => {
      const c = createCarousel({ count: 3 })
      c.goTo(2, false)
      flush()
      expect(c.current()).toBe(2)
      expect(c.animate()).toBe(false)
      c.next()
      flush()
      expect(c.animate()).toBe(true)
      dispose()
    })
  })
})
