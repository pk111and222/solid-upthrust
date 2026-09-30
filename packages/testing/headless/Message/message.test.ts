import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createMessageManager, getMessageManager, message } from '../../../competence/src/message'

describe('createMessageManager', () => {
  // 初始队列为空。
  it('starts with an empty queue', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      expect(m.items()).toEqual([])
      dispose()
    })
  })

  // open 按堆叠顺序追加并返回 key。
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

  // antd：open 不带 type 时不补默认类型（渲染层据此不画类型图标）。
  it('leaves type undefined when not given', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      m.open({ content: 'x' })
      flush()
      expect(m.items()[0].type).toBeUndefined()
      dispose()
    })
  })

  // 同 key 重开原地更新，不新增条目。
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

  // update 修改内容 / 类型并递增 revision。
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

  // 未知 key 的 update 返回 false。
  it('update returns false for an unknown key', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      expect(m.update('nope', { content: 'x' })).toBe(false)
      dispose()
    })
  })

  // close 只标记目标条目 closing，remove 才真正移除。
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

  // 不带 key 的 close 标记全部条目 closing。
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

  // 关闭中同 key 重开会复位 closing。
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

  // 超过 maxCount 时裁掉最旧的条目。
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

  // configure 修改渲染层读取的默认值。
  it('configure changes defaults exposed to the renderer', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      m.configure({ placement: 'bottom', duration: 0, maxCount: 2 })
      flush()
      expect(m.defaults()).toEqual({ placement: 'bottom', duration: 0, maxCount: 2, top: 8, pauseOnHover: true })
      expect(m.placement()).toBe('bottom')
      dispose()
    })
  })

  // configure 支持 center 位置。
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
  // 单例：getMessageManager 恒返回同一实例，message 路由到它。
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
  // open 在条目上保存显式 duration。
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

  // update 可修改 duration。
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

describe('antd 6 对齐', () => {
  // 默认值与 antd 一致：3 秒、顶部 8px、悬停暂停、不限条数。
  it('defaults match antd (seconds, top 8, pauseOnHover, unlimited)', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      expect(m.defaults()).toEqual({ placement: 'top', duration: 3, maxCount: 0, top: 8, pauseOnHover: true })
      dispose()
    })
  })

  // 按 key 关闭触发 onClose 且只触发一次；重复 close 不再触发。
  it('keyed close fires onClose once', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      const onClose = vi.fn()
      const k = m.open({ content: 'a', onClose })
      flush()
      m.close(k)
      m.close(k)
      flush()
      expect(onClose).toHaveBeenCalledTimes(1)
      dispose()
    })
  })

  // 无 key 的全部关闭（destroy()）不触发 onClose（rc-notification destroy 语义）。
  it('close-all does not fire onClose', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      const onClose = vi.fn()
      m.open({ content: 'a', onClose })
      flush()
      m.close()
      flush()
      expect(m.items().every(i => i.closing)).toBe(true)
      expect(onClose).not.toHaveBeenCalled()
      dispose()
    })
  })

  // 同 key 重开是整条替换：旧的 icon / onClose 不残留，revision 递增。
  it('same-key reopen replaces the whole config', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      const first = vi.fn()
      m.open({ key: 'k', content: 'a', icon: 'I', onClose: first, type: 'loading' })
      m.open({ key: 'k', content: 'b', type: 'success' })
      flush()
      const [item] = m.items()
      expect(item).toMatchObject({ content: 'b', type: 'success', revision: 1 })
      expect(item.icon).toBeUndefined()
      m.close('k')
      expect(first).not.toHaveBeenCalled()
      dispose()
    })
  })

  // update 只合并传入的字段，其余保留。
  it('update merges only the given fields', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      const k = m.open({ content: 'a', type: 'info', icon: 'I', pauseOnHover: false, duration: 5 })
      m.update(k, { content: 'b' })
      flush()
      expect(m.items()[0]).toMatchObject({ content: 'b', type: 'info', icon: 'I', pauseOnHover: false, duration: 5 })
      dispose()
    })
  })

  // 同一批次内 configure({ maxCount }) 后紧接 open 即按新上限裁剪（同步镜像）。
  it('maxCount applies within the same batch', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      m.configure({ maxCount: 2 })
      for (const c of ['a', 'b', 'c']) m.open({ content: c })
      flush()
      expect(m.items().map(i => i.content)).toEqual(['b', 'c'])
      dispose()
    })
  })

  // configure 忽略 undefined 字段，不会把已有默认值冲掉。
  it('configure ignores undefined fields', () => {
    createRoot((dispose) => {
      const m = createMessageManager()
      m.configure({ top: 100 })
      m.configure({ top: undefined, duration: 1 })
      flush()
      expect(m.defaults()).toMatchObject({ top: 100, duration: 1 })
      dispose()
    })
  })
})
