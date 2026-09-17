import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createNotificationManager, getNotificationManager, notification, NOTIFICATION_PLACEMENTS } from '../../../competence/src/notification'

describe('createNotificationManager', () => {
  it('starts with empty queues for every placement', () => {
    createRoot((dispose) => {
      const m = createNotificationManager()
      for (const p of NOTIFICATION_PLACEMENTS) expect(m.items(p)).toEqual([])
      expect(m.allItems()).toEqual([])
      dispose()
    })
  })

  it('open routes into the configured placement (default topRight)', () => {
    createRoot((dispose) => {
      const m = createNotificationManager()
      m.open({ message: 'a' })
      flush()
      expect(m.items('topRight').map(i => i.message)).toEqual(['a'])
      expect(m.items('top')).toEqual([])
      m.open({ message: 'b', placement: 'bottomLeft' })
      flush()
      expect(m.items('bottomLeft').map(i => i.message)).toEqual(['b'])
      dispose()
    })
  })

  it('stacks in insertion order and returns unique keys', () => {
    createRoot((dispose) => {
      const m = createNotificationManager()
      const k1 = m.open({ message: 'a' })
      const k2 = m.open({ message: 'b' })
      flush()
      expect(m.items('topRight').map(i => i.message)).toEqual(['a', 'b'])
      expect(k1).not.toBe(k2)
      expect(m.items('topRight')[0].key).toBe(k1)
      dispose()
    })
  })

  it('applies antd defaults: 4.5s duration, info type, pauseOnHover on', () => {
    createRoot((dispose) => {
      const m = createNotificationManager()
      m.open({ message: 'x' })
      flush()
      const item = m.items('topRight')[0]
      expect(item.type).toBe('info')
      expect(item.duration).toBe(4.5)
      expect(item.pauseOnHover).toBe(true)
      expect(item.showProgress).toBe(false)
      dispose()
    })
  })

  it('duration null/0 mean never auto-close and are stored per item', () => {
    createRoot((dispose) => {
      const m = createNotificationManager()
      m.open({ message: 'x', duration: 0 })
      m.open({ message: 'y', duration: null })
      flush()
      expect(m.items('topRight').map(i => i.duration)).toEqual([0, null])
      dispose()
    })
  })

  it('reuses the slot when opening with the same key (no new entry, revision bump)', () => {
    createRoot((dispose) => {
      const m = createNotificationManager()
      m.open({ key: 'k', message: 'v1' })
      m.open({ key: 'k', message: 'v2', type: 'success' })
      flush()
      expect(m.items('topRight')).toHaveLength(1)
      expect(m.items('topRight')[0].message).toBe('v2')
      expect(m.items('topRight')[0].type).toBe('success')
      expect(m.items('topRight')[0].revision).toBe(1)
      dispose()
    })
  })

  it('in-place update moves the notice to the NEW placement (antd parity)', () => {
    createRoot((dispose) => {
      const m = createNotificationManager()
      m.open({ key: 'k', message: 'v1', placement: 'topLeft' })
      m.open({ key: 'k', message: 'v2', placement: 'bottomRight' })
      flush()
      expect(m.items('topLeft')).toEqual([])
      expect(m.items('bottomRight').map(i => i.message)).toEqual(['v2'])
      dispose()
    })
  })

  it('update patches an existing notice by key', () => {
    createRoot((dispose) => {
      const m = createNotificationManager()
      const k = m.open({ message: 'v1' })
      expect(m.update(k, { message: 'v2', type: 'warning', duration: 2 })).toBe(true)
      flush()
      const item = m.items('topRight')[0]
      expect(item.message).toBe('v2')
      expect(item.type).toBe('warning')
      expect(item.duration).toBe(2)
      expect(m.update('missing', { message: 'nope' })).toBe(false)
      dispose()
    })
  })

  it('close marks closing without removing; remove drops the item and fires onClose', () => {
    createRoot((dispose) => {
      const m = createNotificationManager()
      const onClose = vi.fn()
      const k = m.open({ message: 'x', onClose })
      flush()
      m.close(k)
      flush()
      expect(m.items('topRight')[0].closing).toBe(true)
      expect(onClose).not.toHaveBeenCalled()
      m.remove(k)
      flush()
      expect(m.items('topRight')).toEqual([])
      expect(onClose).toHaveBeenCalledTimes(1)
      dispose()
    })
  })

  it('close() without a key marks every placement closing', () => {
    createRoot((dispose) => {
      const m = createNotificationManager()
      m.open({ message: 'a', placement: 'topLeft' })
      m.open({ message: 'b', placement: 'bottomRight' })
      flush()
      m.close()
      flush()
      expect(m.allItems().every(i => i.closing)).toBe(true)
      dispose()
    })
  })

  it('trims the oldest entries per placement beyond maxCount', () => {
    createRoot((dispose) => {
      const m = createNotificationManager()
      m.configure({ maxCount: 3 })
      flush()
      for (const c of ['a', 'b', 'c', 'd', 'e']) m.open({ message: c })
      flush()
      expect(m.items('topRight').map(i => i.message)).toEqual(['c', 'd', 'e'])
      // per-placement budget: another corner has its own budget
      m.open({ message: 'f', placement: 'bottomLeft' })
      flush()
      expect(m.items('bottomLeft').map(i => i.message)).toEqual(['f'])
      dispose()
    })
  })

  it('configure changes defaults for FUTURE opens only', () => {
    createRoot((dispose) => {
      const m = createNotificationManager()
      const k = m.open({ message: 'old' })
      flush()
      m.configure({ placement: 'topLeft', duration: 1, showProgress: true, pauseOnHover: false })
      flush()
      expect(m.items('topRight')[0].placement).toBe('topRight')
      m.open({ message: 'new' })
      flush()
      const item = m.items('topLeft')[0]
      expect(item.duration).toBe(1)
      expect(item.showProgress).toBe(true)
      expect(item.pauseOnHover).toBe(false)
      void k
      dispose()
    })
  })
})

describe('notification singleton', () => {
  it('getNotificationManager returns the same instance and notification routes into it', () => {
    const m = getNotificationManager()
    expect(getNotificationManager()).toBe(m)
    const before = m.allItems().length
    notification.open({ message: 'singleton-test', placement: 'top' })
    flush()
    expect(m.allItems().length).toBe(before + 1)
    const item = m.allItems().find(i => i.message === 'singleton-test')!
    m.remove(item.key)
    flush()
  })
})
