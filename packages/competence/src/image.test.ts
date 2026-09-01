import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createImage } from './image'

describe('createImage', () => {
  it('always starts loading — placeholder is a renderer concern, not a state input', () => {
    createRoot((dispose) => {
      const plain = createImage({ src: 'a.png' })
      expect(plain.status()).toBe('loading')
      expect(plain.isLoading()).toBe(true)
      const ph = createImage({ src: 'a.png', hasPlaceholder: true })
      expect(ph.status()).toBe('loading')
      expect(ph.isLoading()).toBe(true)
      dispose()
    })
  })

  it('load event moves loading → normal', () => {
    createRoot((dispose) => {
      const img = createImage({ src: 'a.png', hasPlaceholder: true })
      img.notifyLoaded()
      flush()
      expect(img.status()).toBe('normal')
      expect(img.isLoading()).toBe(false)
      dispose()
    })
  })

  it('error with fallback: switches to loading + fallback src, locked until src changes', () => {
    createRoot((dispose) => {
      const [src, setSrc] = createSignal('bad.png', { ownedWrite: true })
      const img = createImage({ get src() { return src() }, fallback: 'fb.png' })
      expect(img.effectiveSrc()).toBe('bad.png')
      img.notifyError()
      flush()
      // Fallback takes over: back to loading (the fallback request), NOT error.
      expect(img.status()).toBe('loading')
      expect(img.effectiveSrc()).toBe('fb.png')
      // The fallback loads successfully — status settles normal and the
      // effective src STAYS on the fallback (no flicker back to the broken one).
      img.notifyLoaded()
      flush()
      expect(img.status()).toBe('normal')
      expect(img.effectiveSrc()).toBe('fb.png')
      // A src change re-arms the machine on the new primary.
      setSrc('other.png')
      flush()
      expect(img.status()).toBe('loading')
      expect(img.effectiveSrc()).toBe('other.png')
      dispose()
    })
  })

  it('error WITHOUT fallback lands in the error state', () => {
    createRoot((dispose) => {
      const img = createImage({ src: 'bad.png' })
      img.notifyError()
      flush()
      expect(img.isError()).toBe(true)
      expect(img.effectiveSrc()).toBe('bad.png')
      dispose()
    })
  })

  it('fallback failing too ends in the error state', () => {
    createRoot((dispose) => {
      const img = createImage({ src: 'bad.png', fallback: 'fb.png' })
      img.notifyError()   // switch to fallback
      flush()
      img.notifyError()   // fallback also fails
      flush()
      expect(img.isError()).toBe(true)
      expect(img.effectiveSrc()).toBe('fb.png')
      dispose()
    })
  })

  it('a src change resets to loading (and retries a failed src)', () => {
    // Reactive src OUTSIDE the root (ownedWrite semantics: plain writes from
    // test scope), read reactively inside — like a real props getter.
    const [src, setSrc] = createSignal('a.png', { ownedWrite: true })
    createRoot((dispose) => {
      const img = createImage({ get src() { return src() } })
      img.notifyError()
      flush()
      expect(img.status()).toBe('error')
      setSrc('b.png')
      flush()
      expect(img.status()).toBe('loading')
      setSrc('b.png') // same value → memo doesn't re-run, status stays
      expect(img.status()).toBe('loading')
      dispose()
    })
  })

  it('preview open state: uncontrolled toggle + controlled override', () => {
    createRoot((dispose) => {
      const img = createImage({})
      expect(img.previewOpen()).toBe(false)
      img.togglePreview()
      flush()
      expect(img.previewOpen()).toBe(true)
      img.setPreviewOpen(false)
      flush()
      expect(img.previewOpen()).toBe(false)

      const controlled = createImage({ previewVisible: true })
      controlled.togglePreview() // ignored in controlled mode
      flush()
      expect(controlled.previewOpen()).toBe(true)
      dispose()
    })
  })

  it('preview visible change callback fires', () => {
    createRoot((dispose) => {
      const cb = vi.fn()
      const img = createImage({ onPreviewVisibleChange: cb })
      img.setPreviewOpen(true)
      flush()
      expect(cb).toHaveBeenCalledWith(true)
      dispose()
    })
  })

  it('transform operations: zoom clamped, rotate accumulates, reset', () => {
    createRoot((dispose) => {
      const img = createImage({ maxScale: 2, minScale: 1, scaleStep: 0.5 })
      expect(img.transform()).toEqual({ scale: 1, rotate: 0 })
      img.zoomIn(); img.zoomIn(); img.zoomIn()
      flush()
      expect(img.transform().scale).toBe(2) // clamped at max
      img.zoomOut(); img.zoomOut(); img.zoomOut()
      flush()
      expect(img.transform().scale).toBe(1) // clamped at min
      img.rotateRight()
      img.rotateRight()
      flush()
      expect(img.transform().rotate).toBe(180)
      img.rotateLeft()
      flush()
      expect(img.transform().rotate).toBe(90)
      img.resetTransform()
      flush()
      expect(img.transform()).toEqual({ scale: 1, rotate: 0 })
      dispose()
    })
  })

  it('closing the preview resets the transform', () => {
    createRoot((dispose) => {
      const img = createImage({})
      img.setPreviewOpen(true)
      img.zoomIn()
      img.rotateRight()
      flush()
      expect(img.transform().scale).toBe(1.5)
      img.setPreviewOpen(false)
      flush()
      expect(img.transform()).toEqual({ scale: 1, rotate: 0 })
      dispose()
    })
  })
})
