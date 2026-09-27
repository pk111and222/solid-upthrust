import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_MASONRY_COLUMNS, computeMasonryLayout, createMasonry, masonrySplits, resolveMasonryColumns, resolveMasonryGutter,
  sequentialColumns, type MasonryColumns, type MasonryConfig,
} from '../../../competence/src/masonry'
import { SCREEN_QUERIES, type Screen } from '../../../competence/src/breakpoint'
import { createFakeMatchMedia } from '../../utils/matchMedia'

let dispose = () => {}
afterEach(() => {
  dispose()
  dispose = () => {}
  vi.unstubAllGlobals()
})

/** 按 Grid 的 screen 语义生成媒体查询初值：传入的 screen 为 true，其余为 false。 */
const screensOf = (...matched: Screen[]) =>
  Object.fromEntries(Object.entries(SCREEN_QUERIES).map(([screen, query]) => [query, matched.includes(screen as Screen)]))

/** 创建 masonry；setMatch 必须在 createRoot 之外调用（外部信号写入不能发生在 owner 作用域里）。 */
const setup = <T = unknown>(config: MasonryConfig) => createRoot((release) => {
  dispose = release
  const masonry = createMasonry<T>(config)
  flush()
  return masonry
})

describe('resolveMasonryColumns', () => {
  // 未设置时默认 3 列（契约变更：旧默认 4），与 antd 一致。
  it('[masonry.columns.default] defaults to 3 columns', () => {
    expect(DEFAULT_MASONRY_COLUMNS).toBe(3)
    expect(resolveMasonryColumns(undefined, null)).toBe(3)
  })

  // 数字列数取整；0、负数、NaN、Infinity 退回 1，避免除零或空列。
  it('[masonry.columns.number] floors numbers and falls back to 1 for unusable values', () => {
    expect(resolveMasonryColumns(4, null)).toBe(4)
    expect(resolveMasonryColumns(2.7, null)).toBe(2)
    for (const invalid of [0, -2, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(resolveMasonryColumns(invalid, null)).toBe(1)
    }
  })

  // 响应式：取命中的最宽 screen 上定义的值（中间未定义的 screen 向下查找）。
  it('[masonry.columns.responsive] takes the widest matching screen that defines a value', () => {
    const columns: MasonryColumns = { xs: 1, md: 3, xl: 5 }
    expect(resolveMasonryColumns(columns, { xs: true })).toBe(1)
    expect(resolveMasonryColumns(columns, { sm: true, md: true, lg: true })).toBe(3)
    expect(resolveMasonryColumns(columns, { sm: true, md: true, lg: true, xl: true, xxl: true, xxxl: true })).toBe(5)
  })

  // 契约变更：没有命中任何已定义 screen 时取 xs，再退回 1（旧实现取最小的已定义断点）。
  it('[masonry.columns.fallback] falls back to xs, then 1, below every defined screen', () => {
    expect(resolveMasonryColumns({ xs: 2, md: 4 }, { sm: true })).toBe(2)
    expect(resolveMasonryColumns({ sm: 2, lg: 5 }, { xs: true })).toBe(1)
  })

  // SSR（screens 为 null）视为全部命中，取最宽的已定义值。
  it('[masonry.columns.ssr] treats unknown screens (SSR) as all matching', () => {
    expect(resolveMasonryColumns({ xs: 1, md: 3, xxl: 6 }, null)).toBe(6)
  })
})

describe('resolveMasonryGutter', () => {
  // 默认 0；单值同时作用于水平与垂直。
  it('[masonry.gutter.single] defaults to 0 and applies a single value to both directions', () => {
    expect(resolveMasonryGutter(undefined, null)).toEqual([0, 0])
    expect(resolveMasonryGutter(16, null)).toEqual([16, 16])
  })

  // 命名尺寸：small 8 / middle 16 / large 24；未知名称、负数、NaN 视为 0。
  it('[masonry.gutter.named] maps size names and rejects invalid values', () => {
    expect(resolveMasonryGutter('small', null)).toEqual([8, 8])
    expect(resolveMasonryGutter('middle', null)).toEqual([16, 16])
    expect(resolveMasonryGutter('large', null)).toEqual([24, 24])
    expect(resolveMasonryGutter('huge' as never, null)).toEqual([0, 0])
    expect(resolveMasonryGutter(-8, null)).toEqual([0, 0])
    expect(resolveMasonryGutter(Number.NaN, null)).toEqual([0, 0])
  })

  // 数组为 [水平, 垂直]；垂直缺省（或按 screen 解析不到）时同水平。
  it('[masonry.gutter.pair] resolves [horizontal, vertical] and falls back to horizontal', () => {
    expect(resolveMasonryGutter([8, 'large'], null)).toEqual([8, 24])
    expect(resolveMasonryGutter([12, undefined as never], null)).toEqual([12, 12])
    expect(resolveMasonryGutter([12, { xl: 32 }], { xs: true })).toEqual([12, 12])
  })

  // 每个方向都可以按 screen 取值；某方向没有命中的 screen 时（sm/md 下 xs 不命中）垂直退回水平值，与 antd useGutter 一致。
  it('[masonry.gutter.responsive] resolves per-screen gutters', () => {
    const gutter = [{ xs: 8, md: 16 }, { xs: 'small', lg: 'large' }] as const
    expect(resolveMasonryGutter([...gutter], { xs: true })).toEqual([8, 8])
    expect(resolveMasonryGutter([...gutter], { sm: true, md: true })).toEqual([16, 16])
    expect(resolveMasonryGutter([...gutter], { sm: true, md: true, lg: true })).toEqual([16, 24])
    expect(resolveMasonryGutter([...gutter], null)).toEqual([16, 24])
  })
})

describe('computeMasonryLayout', () => {
  // 最短列优先：依次放入当前最短的列，并列时取靠前的列；容器高度不含末尾间距。
  it('[masonry.layout.shortest] places each item into the shortest column', () => {
    const layout = computeMasonryLayout([100, 50, 80, 30], 2, 10)
    expect(layout.positions).toEqual([
      { column: 0, top: 0 },
      { column: 1, top: 0 },
      { column: 1, top: 60 },
      { column: 0, top: 110 },
    ])
    expect(layout.height).toBe(140)
  })

  // 并列时取第一列：等高项按 0,1,2,0,1,2 分布。
  it('[masonry.layout.ties] breaks ties toward the first column', () => {
    const layout = computeMasonryLayout([10, 10, 10, 10, 10, 10], 3, 0)
    expect(layout.positions.map(p => p.column)).toEqual([0, 1, 2, 0, 1, 2])
    expect(layout.height).toBe(20)
  })

  // 固定列：超出范围夹到首 / 末列，小数取整；被固定的项同样推高所在列。
  it('[masonry.layout.pins] honours pinned columns, clamped into range', () => {
    const layout = computeMasonryLayout([40, 40, 40, 40], 3, 8, [5, -2, 1.7, undefined])
    expect(layout.positions).toEqual([
      { column: 2, top: 0 },
      { column: 0, top: 0 },
      { column: 1, top: 0 },
      { column: 0, top: 48 },
    ])
    expect(layout.height).toBe(88)
  })

  // 空列表高度为 0；列数非法时按 1 列处理。
  it('[masonry.layout.edge] handles empty input and invalid column counts', () => {
    expect(computeMasonryLayout([], 3, 16)).toEqual({ positions: [], height: 0 })
    const single = computeMasonryLayout([10, 20], 0, 5)
    expect(single.positions).toEqual([{ column: 0, top: 0 }, { column: 0, top: 15 }])
    expect(single.height).toBe(35)
  })

  // 稳定性：追加项不会改变已有项的位置（按顺序放置）。
  it('[masonry.layout.stable] appending items never moves earlier ones', () => {
    const heights = [120, 60, 90, 30, 150, 45]
    const before = computeMasonryLayout(heights, 3, 12).positions
    const after = computeMasonryLayout([...heights, 70, 20], 3, 12).positions
    expect(after.slice(0, heights.length)).toEqual(before)
  })
})

describe('sequentialColumns', () => {
  // 按阅读顺序均衡分列：靠前的列多分余数（12 项 5 列 → 3,3,2,2,2）。
  it('[masonry.sequential.balanced] distributes the remainder to the leading columns', () => {
    expect(sequentialColumns(12, 5)).toEqual([0, 0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 4])
    expect(sequentialColumns(2, 5)).toEqual([0, 1])
    expect(sequentialColumns(0, 3)).toEqual([])
    expect(sequentialColumns(3, 0)).toEqual([0, 0, 0])
  })
})

describe('createMasonry', () => {
  // 数字列数直接返回；distribute 默认轮询分配。
  it('[masonry.create.number] returns a fixed column count and distributes round-robin', () => {
    const masonry = setup<string>({ columns: 3 })
    expect(masonry.columnCount()).toBe(3)
    expect(masonry.distribute(['a', 'b', 'c', 'd'])).toEqual([['a', 'd'], ['b'], ['c']])
  })

  // sequential：按阅读顺序均衡分列，不会让末尾列为空。
  it('[masonry.create.sequential] distributes sequentially without empty trailing columns', () => {
    const masonry = setup<number>({ columns: 5, sequential: true })
    const items = Array.from({ length: 12 }, (_, i) => i)
    const columns = masonry.distribute(items)
    expect(columns.map(column => column.length)).toEqual([3, 3, 2, 2, 2])
    expect(columns.flat()).toEqual(items)
  })

  // 初值同步读取媒体查询，首帧即为正确列数（不闪默认值）；screens 同步暴露给 UI 层解析 gutter。
  it('[masonry.create.initial] resolves the initial screen synchronously', () => {
    const media = createFakeMatchMedia(screensOf('sm', 'md'))
    const masonry = setup({ columns: { xs: 1, md: 2, xl: 4 }, matchMedia: media.matchMedia })
    expect(masonry.columnCount()).toBe(2)
    expect(masonry.screens()).toMatchObject({ xs: false, sm: true, md: true, lg: false })
  })

  // 媒体查询变化时列数跟随切换（包括回落到 xs）。
  it('[masonry.create.follow] follows media query changes across screens', () => {
    const media = createFakeMatchMedia(screensOf('xs'))
    const masonry = setup({ columns: { xs: 1, md: 2, xl: 4 }, matchMedia: media.matchMedia })
    expect(masonry.columnCount()).toBe(1)

    media.setMatch(SCREEN_QUERIES.xs, false)
    for (const screen of ['sm', 'md', 'lg', 'xl'] as const) media.setMatch(SCREEN_QUERIES[screen], true)
    flush()
    expect(masonry.columnCount()).toBe(4)

    media.setMatch(SCREEN_QUERIES.xl, false)
    flush()
    expect(masonry.columnCount()).toBe(2)
  })

  // 替换为不同键集合的 columns 对象后仍按新对象解析（旧实现曾保留过期订阅）。
  it('[masonry.create.replace] re-resolves when the columns object changes its key set', () => {
    const media = createFakeMatchMedia(screensOf('sm', 'md', 'lg'))
    const [columns, setColumns] = createSignal<MasonryColumns>({ lg: 3 }, { ownedWrite: true })
    const masonry = setup({ get columns() { return columns() }, matchMedia: media.matchMedia })
    expect(masonry.columnCount()).toBe(3)

    setColumns({ xl: 6 })
    flush()
    expect(masonry.columnCount()).toBe(1)
    media.setMatch(SCREEN_QUERIES.xl, true)
    flush()
    expect(masonry.columnCount()).toBe(6)
  })

  // 释放 owner 后取消订阅：之后的媒体变化不再触发更新。
  it('[masonry.create.dispose] releases the media subscription with its owner', () => {
    const media = createFakeMatchMedia(screensOf('sm'))
    const masonry = setup({ columns: { xs: 1, sm: 2, lg: 5 }, matchMedia: media.matchMedia })
    expect(masonry.columnCount()).toBe(2)
    dispose()
    dispose = () => {}
    expect(() => media.setMatch(SCREEN_QUERIES.lg, true)).not.toThrow()
  })

  // 没有 matchMedia 的环境（SSR）：screens 为 null，取最宽的已定义值。
  it('[masonry.create.no-media] uses the widest defined value without matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined)
    const masonry = setup({ columns: { xs: 1, md: 3 } })
    expect(masonry.screens()).toBeNull()
    expect(masonry.columnCount()).toBe(3)
  })

  // masonrySplits 覆盖配置的全部键。
  it('[masonry.create.splits] lists every config key', () => {
    expect([...masonrySplits].sort()).toEqual(['columns', 'matchMedia', 'sequential'])
  })
})
