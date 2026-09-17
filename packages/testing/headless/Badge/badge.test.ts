import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { resolveBadgeDisplay, badgeOffsetStyle, createBadge } from '../../../competence/src/badge'

describe('resolveBadgeDisplay (pure)', () => {
  it('formats overflow counts as N+', () => {
    const d = resolveBadgeDisplay({ count: 100 })
    expect(d.displayCount).toBe('99+')
    expect(resolveBadgeDisplay({ count: 200, overflowCount: 10 }).displayCount).toBe('10+')
  })

  it('caps exactly at the boundary without the +', () => {
    expect(resolveBadgeDisplay({ count: 99 }).displayCount).toBe(99)
    expect(resolveBadgeDisplay({ count: 10, overflowCount: 10 }).displayCount).toBe(10)
  })

  it('hides zero counts by default, shows with showZero', () => {
    expect(resolveBadgeDisplay({ count: 0 }).hidden).toBe(true)
    expect(resolveBadgeDisplay({ count: 0 }).ignoreCount).toBe(true)
    expect(resolveBadgeDisplay({ count: 0, showZero: true }).hidden).toBe(false)
    expect(resolveBadgeDisplay({ count: 0, showZero: true }).displayCount).toBe(0)
  })

  it('treats text "0" as zero too (antd quirk)', () => {
    expect(resolveBadgeDisplay({ count: 5, text: '0' }).isZero).toBe(true)
    // count 5 is non-zero, so the badge itself still renders
    expect(resolveBadgeDisplay({ count: 5, text: '0' }).hidden).toBe(false)
  })

  it('dot mode: zero still hides, non-zero shows a dot without a number', () => {
    const d = resolveBadgeDisplay({ dot: true, count: 5 })
    expect(d.showAsDot).toBe(true)
    expect(d.displayCount).toBe(undefined)
    expect(d.hidden).toBe(false)
    expect(resolveBadgeDisplay({ dot: true, count: 0 }).hidden).toBe(true)
  })

  it('status takes over when the count is ignored', () => {
    const d = resolveBadgeDisplay({ status: 'success' })
    expect(d.hasStatus).toBe(true)
    // status + count visible: hasStatus false (count wins)
    expect(resolveBadgeDisplay({ status: 'success', count: 5 }).hasStatus).toBe(false)
  })

  it('marks multi-character pills', () => {
    expect(resolveBadgeDisplay({ count: 99 }).multipleWords).toBe(true)
    expect(resolveBadgeDisplay({ count: 5 }).multipleWords).toBe(false)
    expect(resolveBadgeDisplay({ count: '99+' }).multipleWords).toBe(true)
    // a dot never reads as multiple words
    expect(resolveBadgeDisplay({ dot: true, count: 5 }).multipleWords).toBe(false)
  })

  it('text visibility: 0 needs showZero, booleans and empty hide', () => {
    expect(resolveBadgeDisplay({ status: 'error', text: 0 }).textVisible).toBe(false)
    expect(resolveBadgeDisplay({ status: 'error', text: 0, showZero: true }).textVisible).toBe(true)
    expect(resolveBadgeDisplay({ status: 'error', text: '' }).textVisible).toBe(false)
    expect(resolveBadgeDisplay({ status: 'error', text: 'Running' }).textVisible).toBe(true)
  })

  it('passes a custom node count through untouched', () => {
    const node = { node: true }
    const d = resolveBadgeDisplay({ count: node as any })
    expect(d.displayCount).toBe(node)
    expect(d.hidden).toBe(false)
  })

  it('undefined count with no status/dot is fully hidden', () => {
    expect(resolveBadgeDisplay({}).hidden).toBe(true)
    expect(resolveBadgeDisplay({ status: 'warning' }).hidden).toBe(true)
    // hidden but hasStatus: the status-dot mode renders from status fields
    expect(resolveBadgeDisplay({ status: 'warning' }).hasStatus).toBe(true)
  })
})

describe('badgeOffsetStyle (pure)', () => {
  it('negates x (right offset) and passes y as margin-top', () => {
    expect(badgeOffsetStyle([10, 20])).toEqual({ 'margin-right': '-10px', 'margin-top': '20' })
  })

  it('parses string x with parseInt semantics', () => {
    expect(badgeOffsetStyle(['10px', '-5px'])).toEqual({ 'margin-right': '-10px', 'margin-top': '-5px' })
  })

  it('returns undefined without an offset', () => {
    expect(badgeOffsetStyle(undefined)).toBe(undefined)
  })

  it('skips unparseable x but keeps y', () => {
    expect(badgeOffsetStyle(['abc', 4])).toEqual({ 'margin-top': '4' })
  })
})

describe('createBadge', () => {
  it('derives reactively from signals (getter injection)', () => {
    const [count, setCount] = createSignal(5, { ownedWrite: true })
    createRoot((dispose) => {
      const badge = createBadge({ get count() { return count() } })
      flush()
      expect(badge.display().displayCount).toBe(5)
      expect(badge.display().hidden).toBe(false)

      setCount(0)
      flush()
      expect(badge.display().hidden).toBe(true)

      setCount(120)
      flush()
      expect(badge.display().displayCount).toBe('99+')
      dispose()
    })
  })
})
