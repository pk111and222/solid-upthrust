import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { SCREEN_KEYS, SCREEN_QUERIES } from '../../../competence/src/breakpoint'
import { createBreakpoint, resolveResponsive } from '../../../competence/src/responsive'
import { createFakeMatchMedia } from '../../utils/matchMedia'

/** 按视口宽度生成各断点的初始命中状态。 */
const screensAt = (width: number) => ({
  [SCREEN_QUERIES.xs]: width < 576,
  [SCREEN_QUERIES.sm]: width >= 576,
  [SCREEN_QUERIES.md]: width >= 768,
  [SCREEN_QUERIES.lg]: width >= 992,
  [SCREEN_QUERIES.xl]: width >= 1200,
  [SCREEN_QUERIES.xxl]: width >= 1600,
  [SCREEN_QUERIES.xxxl]: width >= 1920,
})

/** 包一层 matchMedia，统计 change 监听的注册/移除次数。 */
const countingMatchMedia = (width: number) => {
  const fake = createFakeMatchMedia(screensAt(width))
  const counts = { add: 0, remove: 0 }
  const matchMedia = (query: string) => {
    const mql = fake.matchMedia(query)
    if (!(mql as { __counted?: boolean }).__counted) {
      const add = mql.addEventListener.bind(mql)
      const remove = mql.removeEventListener.bind(mql)
      mql.addEventListener = ((...args: Parameters<typeof add>) => { counts.add++; add(...args) }) as typeof add
      mql.removeEventListener = ((...args: Parameters<typeof remove>) => { counts.remove++; remove(...args) }) as typeof remove
      ;(mql as { __counted?: boolean }).__counted = true
    }
    return mql
  }
  return { ...fake, matchMedia, counts }
}

describe('SCREEN 常量', () => {
  // 断点键从窄到宽排列；xs 用 575.98 的 max-width，与 sm 的 576 无缝衔接。
  it('[grid.breakpoint.queries] screen keys and queries follow the grid scale', () => {
    expect(SCREEN_KEYS).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'])
    expect(SCREEN_QUERIES).toEqual({
      xs: '(max-width: 575.98px)',
      sm: '(min-width: 576px)',
      md: '(min-width: 768px)',
      lg: '(min-width: 992px)',
      xl: '(min-width: 1200px)',
      xxl: '(min-width: 1600px)',
      xxxl: '(min-width: 1920px)',
    })
  })
})

describe('createBreakpoint', () => {
  // 初始值同步读取（首帧不闪），宽 1000 时命中 sm/md/lg。
  it('[grid.breakpoint.initial] reads the current screens synchronously', () => {
    const media = createFakeMatchMedia(screensAt(1000))
    createRoot((dispose) => {
      expect(createBreakpoint({ matchMedia: media.matchMedia }).screens()).toEqual({
        xs: false, sm: true, md: true, lg: true, xl: false, xxl: false, xxxl: false,
      })
      dispose()
    })
  })

  // 媒体查询变化后信号更新；只有变化的断点被改写。change 事件在 owner 之外派发，与浏览器一致。
  it('[grid.breakpoint.change] updates when a media query flips', () => {
    const media = createFakeMatchMedia(screensAt(1000))
    let bp!: ReturnType<typeof createBreakpoint>
    const dispose = createRoot((dispose) => { bp = createBreakpoint({ matchMedia: media.matchMedia }); return dispose })
    media.setMatch(SCREEN_QUERIES.xl, true)
    flush()
    expect(bp.screens()).toMatchObject({ lg: true, xl: true, xxl: false })
    media.setMatch(SCREEN_QUERIES.lg, false)
    media.setMatch(SCREEN_QUERIES.xl, false)
    flush()
    expect(bp.screens()).toMatchObject({ md: true, lg: false, xl: false })
    dispose()
  })

  // 没有 matchMedia（SSR）时返回 null，而不是抛错或全 false。
  it('[grid.breakpoint.ssr] returns null screens without matchMedia', () => {
    const original = globalThis.matchMedia
    // @ts-expect-error 模拟非浏览器环境
    delete globalThis.matchMedia
    try {
      createRoot((dispose) => {
        expect(createBreakpoint().screens()).toBeNull()
        dispose()
      })
    } finally {
      globalThis.matchMedia = original
    }
  })

  // 同一个 matchMedia 下的多个订阅者共享 7 个监听；最后一个卸载时全部移除。
  it('[grid.breakpoint.shared] subscribers share one set of listeners, removed with the last', () => {
    const media = countingMatchMedia(800)
    const disposers: (() => void)[] = []
    for (let i = 0; i < 3; i++) createRoot((dispose) => { createBreakpoint({ matchMedia: media.matchMedia }); disposers.push(dispose) })
    expect(media.counts).toEqual({ add: 7, remove: 0 })
    disposers[0]()
    disposers[1]()
    expect(media.counts.remove).toBe(0)
    disposers[2]()
    expect(media.counts).toEqual({ add: 7, remove: 7 })
    // 全部卸载后再订阅会重新注册，并读到最新状态。
    media.setMatch(SCREEN_QUERIES.lg, true)
    createRoot((dispose) => {
      expect(createBreakpoint({ matchMedia: media.matchMedia }).screens()?.lg).toBe(true)
      expect(media.counts.add).toBe(14)
      dispose()
    })
  })

  // 卸载后的订阅者不再收到更新；其余订阅者照常更新。
  it('[grid.breakpoint.dispose] disposed owners stop receiving updates', () => {
    const media = createFakeMatchMedia(screensAt(800))
    let a!: ReturnType<typeof createBreakpoint>
    let b!: ReturnType<typeof createBreakpoint>
    const disposeA = createRoot((dispose) => { a = createBreakpoint({ matchMedia: media.matchMedia }); return dispose })
    const disposeB = createRoot((dispose) => { b = createBreakpoint({ matchMedia: media.matchMedia }); return dispose })
    disposeA()
    media.setMatch(SCREEN_QUERIES.lg, true)
    flush()
    expect(a.screens()?.lg).toBe(false)
    expect(b.screens()?.lg).toBe(true)
    disposeB()
  })

  // change 事件与当前值相同时不通知，避免无意义的重算。
  it('[grid.breakpoint.dedupe] identical change events are ignored', () => {
    const media = createFakeMatchMedia(screensAt(800))
    let bp!: ReturnType<typeof createBreakpoint>
    const dispose = createRoot((dispose) => { bp = createBreakpoint({ matchMedia: media.matchMedia }); return dispose })
    const before = bp.screens()
    media.setMatch(SCREEN_QUERIES.md, true)
    flush()
    expect(bp.screens()).toBe(before)
    dispose()
  })

  // 默认读取 globalThis.matchMedia。
  it('[grid.breakpoint.global] falls back to globalThis.matchMedia', () => {
    const media = createFakeMatchMedia(screensAt(1700))
    const spy = vi.spyOn(globalThis, 'matchMedia').mockImplementation(media.matchMedia)
    try {
      createRoot((dispose) => {
        expect(createBreakpoint().screens()).toMatchObject({ xl: true, xxl: true, xxxl: false })
        dispose()
      })
    } finally {
      spy.mockRestore()
    }
  })
})

describe('resolveResponsive', () => {
  const at1000 = { xs: false, sm: true, md: true, lg: true, xl: false, xxl: false, xxxl: false }

  // 非对象值原样返回；数组不当作断点表。
  it('[grid.responsive.plain] plain values pass through', () => {
    expect(resolveResponsive(16, at1000)).toBe(16)
    expect(resolveResponsive('center', at1000)).toBe('center')
    expect(resolveResponsive(undefined, at1000)).toBeUndefined()
    const tuple = [1, 2]
    expect(resolveResponsive(tuple, at1000)).toBe(tuple)
  })

  // 取命中断点里最宽且定义了值的一项：1000px 下 lg 未定义时回落到 md。
  it('[grid.responsive.widest] picks the widest matching screen with a value', () => {
    expect(resolveResponsive({ xs: 8, md: 16, xl: 32 }, at1000)).toBe(16)
    expect(resolveResponsive({ xs: 8, sm: 12, lg: 24 }, at1000)).toBe(24)
    expect(resolveResponsive({ xl: 32 }, at1000)).toBeUndefined()
  })

  // xs 只在窄屏命中；宽屏不会回落到 xs 的值。
  it('[grid.responsive.xs] xs only applies below sm', () => {
    const at400 = { xs: true, sm: false, md: false, lg: false, xl: false, xxl: false, xxxl: false }
    expect(resolveResponsive({ xs: 8, md: 16 }, at400)).toBe(8)
    expect(resolveResponsive({ xs: 8 }, at1000)).toBeUndefined()
  })

  // 值为 0 也算定义（不会被当成缺省跳过）。
  it('[grid.responsive.zero] zero counts as a defined value', () => {
    expect(resolveResponsive({ sm: 16, lg: 0 }, at1000)).toBe(0)
  })

  // screens 为 null（SSR）时视为全部命中，取定义了值的最宽断点。
  it('[grid.responsive.ssr] null screens resolve to the widest defined value', () => {
    expect(resolveResponsive({ xs: 8, md: 16, xxl: 40 }, null)).toBe(40)
  })
})
