import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createMessageManager, getMessageManager, message } from '../../../competence/src/message'

describe('createMessageManager', () => {
  it('starts with an empty queue', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      expect(m.items()).toEqual([])
      dispose()
    })
  })

  it('open appends in stacking order and returns the key', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      const k1 = m.open({ content: 'a' })
      const k2 = m.open({ content: 'b' })
      flush()
      expect(m.items().map(i => i.content)).toEqual(['a', 'b'])
      expect(k1).not.toBe(k2)
      expect(m.items()[0].key).toBe(k1)
      dispose()
    })
  })

  it('applies the default type info', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      m.open({ content: 'x' })
      flush()
      expect(m.items()[0].type).toBe('info')
      dispose()
    })
  })

  it('reuses the slot when opening with the same key (no new entry)', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      m.open({ key: 'k', content: 'v1' })
      m.open({ key: 'k', content: 'v2', type: 'success' })
      flush()
      expect(m.items()).toHaveLength(1)
      expect(m.items()[0].content).toBe('v2')
      expect(m.items()[0].type).toBe('success')
      // revision bumped so the renderer can re-run the enter animation
      expect(m.items()[0].revision).toBe(1)
      dispose()
    })
  })

  it('update patches content/type and bumps the revision', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      const k = m.open({ content: 'v1' })
      const ok = m.update(k, { content: 'v2', type: 'loading' })
      flush()
      expect(ok).toBe(true)
      expect(m.items()[0].content).toBe('v2')
      expect(m.items()[0].type).toBe('loading')
      expect(m.items()[0].revision).toBe(1)
      dispose()
    })
  })

  it('update returns false for an unknown key', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      expect(m.update('nope', { content: 'x' })).toBe(false)
      dispose()
    })
  })

  it('close marks one item closing, remove drops it', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      const k1 = m.open({ content: 'a' })
      m.open({ content: 'b' })
      m.close(k1)
      flush()
      expect(m.items()[0].closing).toBe(true)
      expect(m.items()[1].closing).toBe(false)
      m.remove(k1)
      flush()
      expect(m.items().map(i => i.content)).toEqual(['b'])
      dispose()
    })
  })

  it('close without a key marks everything closing', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      m.open({ content: 'a' })
      m.open({ content: 'b' })
      m.close()
      flush()
      expect(m.items().every(i => i.closing)).toBe(true)
      dispose()
    })
  })

  it('reopening after close resets closing (update-in-place path)', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      const k = m.open({ key: 'k', content: 'v1' })
      m.close(k)
      flush()
      expect(m.items()[0].closing).toBe(true)
      m.open({ key: 'k', content: 'v2' })
      flush()
      expect(m.items()).toHaveLength(1)
      expect(m.items()[0].closing).toBe(false)
      expect(m.items()[0].content).toBe('v2')
      dispose()
    })
  })

  it('trims the oldest entries beyond maxCount', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      m.configure({ maxCount: 3 })
      flush()  // commit the config before the batch of opens
      for (const c of ['a', 'b', 'c', 'd', 'e']) m.open({ content: c })
      flush()
      expect(m.items().map(i => i.content)).toEqual(['c', 'd', 'e'])
      dispose()
    })
  })

  it('configure changes defaults exposed to the renderer', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      m.configure({ placement: 'bottom', duration: 0, maxCount: 2 })
      flush()
      expect(m.defaults()).toEqual({ placement: 'bottom', duration: 0, maxCount: 2 })
      expect(m.placement()).toBe('bottom')
      dispose()
    })
  })

  it('configure accepts the center placement', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      m.configure({ placement: 'center' })
      flush()
      expect(m.placement()).toBe('center')
      dispose()
    })
  })
})

describe('message singleton', () => {
  it('getMessageManager returns the same instance and message routes into it', () => {
    const m = getMessageManager()
    expect(getMessageManager()).toBe(m)
    const before = m.items().length
    message.open({ content: 'singleton-test' })
    flush()
    expect(m.items().length).toBe(before + 1)
    // clean up so other tests are unaffected
    const item = m.items().find(i => i.content === 'singleton-test')!
    m.remove(item.key)
  })
})

describe('duration storage', () => {
  it('open stores an explicit duration on the item', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      const k = m.open({ content: 'x', duration: 0 })
      flush()
      expect(m.items()[0].duration).toBe(0)
      void k
      dispose()
    })
  })

  it('update can change the duration', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      const k = m.open({ content: 'x', duration: 1000 })
      flush()
      m.update(k, { duration: 0 })
      flush()
      expect(m.items()[0].duration).toBe(0)
      dispose()
    })
  })
})
