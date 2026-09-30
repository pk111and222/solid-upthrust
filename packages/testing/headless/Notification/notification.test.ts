import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import {
  createNotificationManager, getNotificationManager, notification, notificationStackLayout,
  NOTIFICATION_DEFAULTS, NOTIFICATION_PLACEMENTS,
} from '../../../competence/src/notification'

const withManager = (fn: (m: ReturnType<typeof createNotificationManager>) => void) =>
  createRoot((dispose) => { fn(createNotificationManager()); dispose() })

describe('createNotificationManager', () => {
  // 初始状态：六个方位的队列与全量队列都为空。
  it('[notification.headless.empty] starts with empty queues for every placement', () => {
    withManager((m) => {
      for (const p of NOTIFICATION_PLACEMENTS) expect(m.items(p)).toEqual([])
      expect(m.allItems()).toEqual([])
    })
  })

  // open 按 placement 分流，默认 topRight。
  it('[notification.headless.placement] open routes into the configured placement (default topRight)', () => {
    withManager((m) => {
      m.open({ title: 'a' })
      m.open({ title: 'b', placement: 'bottomLeft' })
      flush()
      expect(m.items('topRight').map(i => i.title)).toEqual(['a'])
      expect(m.items('top')).toEqual([])
      expect(m.items('bottomLeft').map(i => i.title)).toEqual(['b'])
    })
  })

  // 按打开顺序排列，返回唯一 key。
  it('[notification.headless.order] keeps open order and returns unique keys', () => {
    withManager((m) => {
      const k1 = m.open({ title: 'a' })
      const k2 = m.open({ title: 'b' })
      flush()
      expect(m.items('topRight').map(i => i.title)).toEqual(['a', 'b'])
      expect(k1).not.toBe(k2)
      expect(m.items('topRight')[0].key).toBe(k1)
    })
  })

  // antd 默认值：4.5 秒、无类型（无图标）、悬停暂停开、进度条关、默认不限数量、stack 阈值 3、上下偏移 24。
  it('[notification.headless.defaults] antd defaults', () => {
    withManager((m) => {
      m.open({ title: 'x' })
      flush()
      const item = m.items('topRight')[0]
      expect(item.type).toBeUndefined()
      expect(item.duration).toBe(4.5)
      expect(item.pauseOnHover).toBe(true)
      expect(item.showProgress).toBe(false)
      expect(m.defaults()).toEqual(NOTIFICATION_DEFAULTS)
      expect(NOTIFICATION_DEFAULTS).toMatchObject({ maxCount: 0, top: 24, bottom: 24, stack: true, threshold: 3 })
    })
  })

  // 废弃别名：message → title、btn → actions；新字段优先。
  it('[notification.headless.aliases] deprecated message / btn map onto title / actions', () => {
    withManager((m) => {
      m.open({ message: 'old', btn: 'b' })
      m.open({ title: 'new', message: 'old', actions: 'a', btn: 'b' })
      flush()
      expect(m.items('topRight').map(i => [i.title, i.actions])).toEqual([['old', 'b'], ['new', 'a']])
    })
  })

  // duration 0 / null / false / 负数 都归一为 0（永不自动关闭）。
  it('[notification.headless.never] duration 0 / null / false mean never', () => {
    withManager((m) => {
      for (const duration of [0, null, false, -1] as const) m.open({ title: 'x', duration })
      flush()
      expect(m.items('topRight').map(i => i.duration)).toEqual([0, 0, 0, 0])
    })
  })

  // 同 key 再次 open 原地整体替换（位置不变、revision 递增、未给的字段回到默认）。
  it('[notification.headless.same-key] same key replaces in place', () => {
    withManager((m) => {
      m.open({ key: 'k', title: 'v1', type: 'info', showProgress: true })
      m.open({ title: 'other' })
      m.open({ key: 'k', title: 'v2', type: 'success' })
      flush()
      const items = m.items('topRight')
      expect(items.map(i => i.title)).toEqual(['v2', 'other'])
      expect(items[0]).toMatchObject({ type: 'success', revision: 1, showProgress: false })
    })
  })

  // 同 key 换 placement 会把通知移到新角落。
  it('[notification.headless.move] same key with a new placement moves the notice', () => {
    withManager((m) => {
      m.open({ key: 'k', title: 'v1', placement: 'topLeft' })
      m.open({ key: 'k', title: 'v2', placement: 'bottomRight' })
      flush()
      expect(m.items('topLeft')).toEqual([])
      expect(m.items('bottomRight').map(i => i.title)).toEqual(['v2'])
    })
  })

  // update 只合并给出的字段（支持废弃别名），同批次内 open 后立即 update 也能命中；不存在时返回 false。
  it('[notification.headless.update] update merges given fields', () => {
    withManager((m) => {
      const k = m.open({ title: 'v1', description: 'd', showProgress: true })
      expect(m.update(k, { message: 'v2', type: 'warning', duration: 2 })).toBe(true)
      flush()
      expect(m.items('topRight')[0]).toMatchObject({ title: 'v2', description: 'd', type: 'warning', duration: 2, showProgress: true, revision: 1 })
      expect(m.update('missing', { title: 'nope' })).toBe(false)
    })
  })

  // close(key) 标记 closing 并立即触发一次 onClose；重复 close 不重复触发；remove 只移除不再触发。
  it('[notification.headless.close] close(key) fires onClose once, remove drops the item', () => {
    withManager((m) => {
      const onClose = vi.fn()
      const k = m.open({ title: 'x', onClose })
      flush()
      m.close(k)
      m.close(k)
      flush()
      expect(m.items('topRight')[0].closing).toBe(true)
      expect(onClose).toHaveBeenCalledTimes(1)
      m.remove(k)
      flush()
      expect(m.items('topRight')).toEqual([])
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  // close() 关闭所有方位且不触发 onClose（rc destroy 语义）。
  it('[notification.headless.close-all] close() marks every notice closing without onClose', () => {
    withManager((m) => {
      const onClose = vi.fn()
      m.open({ title: 'a', placement: 'topLeft', onClose })
      m.open({ title: 'b', placement: 'bottomRight', onClose })
      flush()
      m.close()
      flush()
      expect(m.allItems().every(i => i.closing)).toBe(true)
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  // maxCount 作用于整个队列（rc slice(-max)），跨方位裁掉最旧的；同批次内连续打开也正确裁剪。
  it('[notification.headless.max-count] maxCount trims the oldest across placements', () => {
    withManager((m) => {
      m.configure({ maxCount: 3 })
      for (const c of ['a', 'b', 'c', 'd']) m.open({ title: c })
      m.open({ title: 'e', placement: 'bottomLeft' })
      flush()
      expect(m.allItems().map(i => i.title)).toEqual(['c', 'd', 'e'])
      expect(m.items('bottomLeft').map(i => i.title)).toEqual(['e'])
    })
  })

  // configure 只影响之后的 open；忽略 undefined 字段；duration false 归一为 0。
  it('[notification.headless.configure] configure changes defaults for future opens only', () => {
    withManager((m) => {
      m.open({ title: 'old' })
      flush()
      m.configure({ placement: 'topLeft', duration: 1, showProgress: true, pauseOnHover: false, top: undefined })
      flush()
      expect(m.items('topRight')[0].placement).toBe('topRight')
      expect(m.defaults().top).toBe(24)
      m.open({ title: 'new' })
      flush()
      expect(m.items('topLeft')[0]).toMatchObject({ duration: 1, showProgress: true, pauseOnHover: false })
      m.configure({ duration: false })
      flush()
      expect(m.defaults().duration).toBe(0)
    })
  })
})

describe('notificationStackLayout', () => {
  const boxes = [{ height: 100, width: 384 }, { height: 80, width: 384 }, { height: 120, width: 384 }, { height: 90, width: 384 }]

  // 展开：更旧的通知按更新者的高度 + 16px 间距依次推离锚边；top 方位向下，bottom 方位向上且 X 保持 -50%。
  it('[notification.headless.stack-expanded] expanded offsets accumulate heights plus gap', () => {
    const top = notificationStackLayout('topRight', boxes, true)
    expect(top.map(s => s.transform)).toEqual([
      'translate3d(0, 0, 0)',
      'translate3d(0, 116px, 0) scaleX(1)',
      'translate3d(0, 212px, 0) scaleX(1)',
      'translate3d(0, 348px, 0) scaleX(1)',
    ])
    expect(top.map(s => s.height)).toEqual([undefined, 80, 120, 90])
    const bottom = notificationStackLayout('bottom', boxes.slice(0, 2), true)
    expect(bottom.map(s => s.transform)).toEqual(['translate3d(-50%, 0, 0)', 'translate3d(-50%, -116px, 0) scaleX(1)'])
  })

  // 折叠：旧通知每层露出 8px、高度取最新一条、横向每侧收 8px（第 3 层起不再收）。
  it('[notification.headless.stack-collapsed] collapsed cards peek by offset and shrink', () => {
    const collapsed = notificationStackLayout('topLeft', boxes, false)
    expect(collapsed.map(s => s.transform)).toEqual([
      'translate3d(0, 0, 0)',
      `translate3d(0, 8px, 0) scaleX(${(384 - 16) / 384})`,
      `translate3d(0, 16px, 0) scaleX(${(384 - 32) / 384})`,
      `translate3d(0, 24px, 0) scaleX(${(384 - 48) / 384})`,
    ])
    expect(collapsed.slice(1).map(s => s.height)).toEqual([100, 100, 100])
    expect(notificationStackLayout('bottomRight', boxes.slice(0, 2), false)[1].transform).toBe(`translate3d(0, -8px, 0) scaleX(${(384 - 16) / 384})`)
  })
})

describe('notification singleton', () => {
  // getNotificationManager 返回同一实例，notification 绑定路由进单例。
  it('[notification.headless.singleton] notification routes into the singleton', () => {
    const m = getNotificationManager()
    expect(getNotificationManager()).toBe(m)
    const before = m.allItems().length
    notification.open({ title: 'singleton-test', placement: 'top' })
    flush()
    expect(m.allItems().length).toBe(before + 1)
    const item = m.allItems().find(i => i.title === 'singleton-test')!
    m.remove(item.key)
    flush()
  })
})
