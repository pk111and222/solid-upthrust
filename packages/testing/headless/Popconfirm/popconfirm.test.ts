import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createPopconfirm } from '../../../competence/src/popconfirm'

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

  // 异步 onConfirm reject 时保持打开并退出 loading（antd ActionButton：只有 resolve 才关闭）。
  it('[popconfirm.async-reject] rejected onConfirm keeps the panel open', async () => {
    let rejectFn!: () => void
    let pc!: ReturnType<typeof createPopconfirm>
    const dispose = createRoot((d) => { pc = createPopconfirm({ onConfirm: () => new Promise<void>((_, r) => { rejectFn = r }) }); return d })
    pc.setOpen(true); flush()
    pc.confirm(); flush()
    expect(pc.loading()).toBe(true)
    rejectFn()
    await Promise.resolve(); await Promise.resolve(); flush()
    expect(pc.loading()).toBe(false)
    expect(pc.open()).toBe(true)
    dispose()
  })

  // 进行中再次点击确认被忽略（同 tick 连点也不会重复提交）。
  it('[popconfirm.no-double-submit] clicks while in flight are ignored', async () => {
    let resolveFn!: () => void
    const onConfirm = vi.fn(() => new Promise<void>((r) => { resolveFn = r }))
    let pc!: ReturnType<typeof createPopconfirm>
    const dispose = createRoot((d) => { pc = createPopconfirm({ onConfirm }); return d })
    pc.setOpen(true); flush()
    pc.confirm(); pc.confirm(); flush(); pc.confirm()
    expect(onConfirm).toHaveBeenCalledTimes(1)
    resolveFn()
    await Promise.resolve(); await Promise.resolve(); flush()
    expect(pc.open()).toBe(false)
    pc.setOpen(true); flush(); pc.confirm()
    expect(onConfirm).toHaveBeenCalledTimes(2)
    dispose()
  })

  // 取消：先关闭再回调（onCancel 返回的 promise 不参与闸门）；onOpenChange 收到 false。
  it('[popconfirm.cancel-order] cancel closes before onCancel fires', () => {
    const order: string[] = []
    let pc!: ReturnType<typeof createPopconfirm>
    const dispose = createRoot((d) => {
      pc = createPopconfirm({ onOpenChange: (v) => order.push(`open:${v}`), onCancel: () => { order.push('cancel'); return new Promise(() => {}) } })
      return d
    })
    pc.setOpen(true); flush(); order.length = 0
    pc.cancel(); flush()
    expect(order).toEqual(['open:false', 'cancel'])
    expect(pc.open()).toBe(false)
    expect(pc.loading()).toBe(false)
    dispose()
  })
})
