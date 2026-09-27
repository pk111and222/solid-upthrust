import { describe, expect, it } from 'vitest'
import {
  normalizeTimelineItems, normalizeTimelineMode, timelineHeadSpan, timelineLayoutAlternate, timelineRailStatus,
} from '../../../competence/src/timeline'

describe('timeline items', () => {
  // 模式归一：left / right 为废弃别名，非法值回落 start。
  it('[timeline.items.mode] normalizes legacy and invalid modes', () => {
    expect(['left', 'right', 'alternate', 'end', 'start', 'bogus', undefined].map(normalizeTimelineMode))
      .toEqual(['start', 'end', 'alternate', 'end', 'start', 'start', 'start'])
  })

  // 旧字段回落（label / children / dot / position），新字段优先；预设色与自定义色分流。
  it('[timeline.items.legacy] legacy fields and colors', () => {
    const [a, b, c] = normalizeTimelineItems([
      { label: 'L', children: 'C', dot: 'D', position: 'end', color: 'red' },
      { title: 'T', label: 'L', content: 'X', children: 'C', icon: 'I', dot: 'D', placement: 'start', position: 'end', color: '#00ccff' },
      { content: 'plain' },
    ], 'start')
    expect(a).toMatchObject({ title: 'L', content: 'C', icon: 'D', placement: 'end', presetColor: 'red', dotColor: undefined, status: 'finish' })
    expect(b).toMatchObject({ title: 'T', content: 'X', icon: 'I', placement: 'start', presetColor: undefined, dotColor: '#00ccff' })
    expect(c).toMatchObject({ presetColor: undefined, dotColor: undefined, placement: 'start', loading: false })
  })

  // 交替模式按奇偶分配 placement；end 模式全部 end；显式 placement 优先。
  it('[timeline.items.placement] alternate parity and explicit placement', () => {
    const alt = normalizeTimelineItems([{}, {}, { placement: 'start' }, {}], 'alternate')
    expect(alt.map(i => i.placement)).toEqual(['start', 'end', 'start', 'end'])
    expect(normalizeTimelineItems([{}, {}], 'end').map(i => i.placement)).toEqual(['end', 'end'])
  })

  // loading：状态为 process，无图标时由 UI 渲染加载图标；有图标时图标优先。
  it('[timeline.items.loading] loading status and icon precedence', () => {
    const [plain, withIcon] = normalizeTimelineItems([{ loading: true }, { loading: true, icon: 'I' }], 'start')
    expect(plain).toMatchObject({ status: 'process', loading: true, icon: undefined })
    expect(withIcon).toMatchObject({ status: 'process', loading: false, icon: 'I' })
  })

  // pending：追加在末尾（reverse 之前），默认加载图标，pendingDot 替换图标。
  it('[timeline.items.pending] pending node appended with optional dot', () => {
    const list = normalizeTimelineItems([{ content: 'a' }], 'start', { content: 'Recording...' })
    expect(list).toHaveLength(2)
    expect(list[1]).toMatchObject({ content: 'Recording...', status: 'process', loading: true, pending: true, source: undefined })
    const dotted = normalizeTimelineItems([{ content: 'a' }], 'start', { content: 'Recording...', icon: '🔴' })
    expect(dotted[1]).toMatchObject({ icon: '🔴', loading: false })
    expect(normalizeTimelineItems(undefined, 'start')).toEqual([])
  })

  // 导轨状态：默认看下一个节点，reverse 时看自身。
  it('[timeline.items.rail] rail status follows next or self', () => {
    const items = [{ status: 'finish' as const }, { status: 'process' as const }]
    expect(timelineRailStatus(items, 0, false)).toBe('process')
    expect(timelineRailStatus(items, 0, true)).toBe('finish')
    expect(timelineRailStatus(items, 1, false)).toBeUndefined()
  })

  // 交替布局判定与标题占比。
  it('[timeline.items.layout] alternate layout and head span', () => {
    expect(timelineLayoutAlternate('alternate', 'horizontal', [])).toBe(true)
    expect(timelineLayoutAlternate('start', 'vertical', [{ title: 'x' }])).toBe(true)
    expect(timelineLayoutAlternate('start', 'horizontal', [{ title: 'x' }])).toBe(false)
    expect(timelineLayoutAlternate('end', 'vertical', [{}, { title: '' }])).toBe(false)
    expect(timelineHeadSpan(undefined, 'start')).toBe('calc(12 / 24 * 100%)')
    expect(timelineHeadSpan(18, 'end')).toBe('calc(18 / 24 * 100%)')
    expect(timelineHeadSpan('100px', 'start')).toBe('100px')
    expect(timelineHeadSpan('100px', 'alternate')).toBe('calc(12 / 24 * 100%)')
  })
})
