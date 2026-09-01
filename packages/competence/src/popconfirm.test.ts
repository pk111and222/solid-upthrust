import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createPopconfirm } from './popconfirm'

describe('createPopconfirm', () => {
  it('defaults to click trigger with top placement and opens via setOpen', () => {
    createRoot((dispose) => {
      const pc = createPopconfirm({})
      expect(pc.open()).toBe(false)
      pc.setOpen(true)
      flush()
      expect(pc.open()).toBe(true)
      expect(pc.actualPlacement()).toBe('top')
      dispose()
    })
  })

  it('confirm fires onConfirm and closes', () => {
    createRoot((dispose) => {
      const onConfirm = vi.fn()
      const pc = createPopconfirm({ onConfirm })
      pc.setOpen(true)
      flush()
      pc.confirm()
      flush()
      expect(onConfirm).toHaveBeenCalledTimes(1)
      expect(pc.open()).toBe(false)
      dispose()
    })
  })

  it('cancel fires onCancel and closes', () => {
    createRoot((dispose) => {
      const onCancel = vi.fn()
      const pc = createPopconfirm({ onCancel })
      pc.setOpen(true)
      flush()
      pc.cancel()
      flush()
      expect(onCancel).toHaveBeenCalledTimes(1)
      expect(pc.open()).toBe(false)
      dispose()
    })
  })

  it('async onConfirm holds the panel open with loading until settle', async () => {
    createRoot(async (dispose) => {
      let resolveFn!: () => void
      const onConfirm = () => new Promise<void>((r) => { resolveFn = r })
      const pc = createPopconfirm({ onConfirm })
      pc.setOpen(true)
      flush()

      pc.confirm()
      flush()
      expect(pc.loading()).toBe(true)
      expect(pc.open()).toBe(true)

      resolveFn()
      await Promise.resolve()
      await Promise.resolve()
      flush()
      expect(pc.loading()).toBe(false)
      expect(pc.open()).toBe(false)
      dispose()
    })
  })

  it('respects controlled open', () => {
    createRoot((dispose) => {
      const pc = createPopconfirm({ open: true })
      pc.confirm()
      flush()
      // Controlled value wins — confirm cannot close it.
      expect(pc.open()).toBe(true)
      dispose()
    })
  })

  it('exposes refs including confirm/cancel/loading', () => {
    createRoot((dispose) => {
      const onConfirm = vi.fn()
      const pc = createPopconfirm({ onConfirm })
      pc.refs.setOpen(true)
      flush()
      expect(pc.refs.open()).toBe(true)
      pc.refs.confirm()
      flush()
      expect(onConfirm).toHaveBeenCalledTimes(1)
      expect(pc.refs.loading()).toBe(false)
      dispose()
    })
  })
})
