import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { resolveBadgeDisplay, resolveBadgeColorKey, badgeOffsetStyle, createBadge } from '../../../competence/src/badge'

// 对照 antd 6.6.5 components/badge/Badge.tsx 的 numberedDisplayCount/isZero/ignoreCount/hasStatus/isStatusBadge/isHidden 链。
describe('resolveBadgeDisplay (pure)', () => {
  // 超过封顶值显示 N+。
  it('formats overflow counts as N+', () => {
    const d = resolveBadgeDisplay({ count: 100 })
    expect(d.displayCount).toBe('99+')
    expect(resolveBadgeDisplay({ count: 200, overflowCount: 10 }).displayCount).toBe('10+')
  })

  // 恰好等于封顶值不加 +。
  it('caps exactly at the boundary without the +', () => {
    expect(resolveBadgeDisplay({ count: 99 }).displayCount).toBe(99)
    expect(resolveBadgeDisplay({ count: 10, overflowCount: 10 }).displayCount).toBe(10)
  })

  // antd 用 JS 比较 count > overflowCount：数字字符串同样封顶，非数字字符串原样显示。
  it('[badge.overflow.string] numeric strings cap, other strings pass through', () => {
    expect(resolveBadgeDisplay({ count: '100' }).displayCount).toBe('99+')
    expect(resolveBadgeDisplay({ count: 'new' }).displayCount).toBe('new')
    expect(resolveBadgeDisplay({ count: 1000, overflowCount: 999 }).displayCount).toBe('999+')
  })

  // 负数照常显示，多字符（含负号）加宽。
  it('[badge.negative] negative counts render and count as multiple words', () => {
    const d = resolveBadgeDisplay({ count: -5 })
    expect(d.displayCount).toBe(-5); expect(d.hidden).toBe(false); expect(d.multipleWords).toBe(true)
  })

  // 默认隐藏 0，showZero 时显示；'0' 字符串同理。
  it('hides zero counts by default, shows with showZero', () => {
    expect(resolveBadgeDisplay({ count: 0 }).hidden).toBe(true)
    expect(resolveBadgeDisplay({ count: 0 }).ignoreCount).toBe(true)
    expect(resolveBadgeDisplay({ count: '0' }).hidden).toBe(true)
    expect(resolveBadgeDisplay({ count: 0, showZero: true }).hidden).toBe(false)
    expect(resolveBadgeDisplay({ count: 0, showZero: true }).displayCount).toBe(0)
  })

  // antd 的 isZero 同时检查 text：text 为 0/'0' 时即使 count 非零也隐藏（除非 showZero）。
  // 旧实现声称“count 5 仍显示”，与 antd 源码 isHidden = (isEmpty || (isZero && !showZero)) && !showAsDot 不符。
  it('[badge.zero.text] a zero text counts as zero (antd isZero)', () => {
    expect(resolveBadgeDisplay({ count: 5, text: '0' }).isZero).toBe(true)
    expect(resolveBadgeDisplay({ count: 5, text: '0' }).hidden).toBe(true)
    expect(resolveBadgeDisplay({ count: 5, text: 0, showZero: true }).hidden).toBe(false)
  })

  // 点模式：零仍隐藏；非零只显示点、不显示数字。
  it('dot mode: zero still hides, non-zero shows a dot without a number', () => {
    const d = resolveBadgeDisplay({ dot: true, count: 5 })
    expect(d.showAsDot).toBe(true)
    expect(d.displayCount).toBe(undefined)
    expect(d.hidden).toBe(false)
    expect(resolveBadgeDisplay({ dot: true, count: 0 }).hidden).toBe(true)
    expect(resolveBadgeDisplay({ dot: true }).hidden).toBe(false)
    expect(resolveBadgeDisplay({ dot: true, count: 0, showZero: true }).showAsDot).toBe(false)
  })

  // 计数被忽略时 status/color 接管；有可见计数时计数优先。
  it('status takes over when the count is ignored', () => {
    const d = resolveBadgeDisplay({ status: 'success' })
    expect(d.hasStatus).toBe(true)
    expect(resolveBadgeDisplay({ status: 'success', count: 5 }).hasStatus).toBe(false)
    // null 与 undefined 一样不算设置（antd isNonNullable）
    expect(resolveBadgeDisplay({ color: null }).hasStatus).toBe(false)
  })

  // isStatusBadge：无子元素 + hasStatus + (text || status 非空 || 非零)。
  it('[badge.status.select] status badge selection', () => {
    expect(resolveBadgeDisplay({ status: 'success' }).isStatusBadge).toBe(true)
    expect(resolveBadgeDisplay({ status: 'success', hasChildren: true }).isStatusBadge).toBe(false)
    expect(resolveBadgeDisplay({ color: '#f50' }).isStatusBadge).toBe(true)
    // 只有 color、count 为 0 且无文本：不是状态点，同时整体隐藏（旧实现会画出一个点）
    const zeroColor = resolveBadgeDisplay({ color: 'red', count: 0 })
    expect(zeroColor.isStatusBadge).toBe(false); expect(zeroColor.hidden).toBe(true)
    // 有文本时仍是状态点
    expect(resolveBadgeDisplay({ color: 'red', count: 0, text: 'x' }).isStatusBadge).toBe(true)
    // color + showZero + count 0：计数不被忽略，渲染为带颜色的数字
    expect(resolveBadgeDisplay({ color: '#faad14', count: 0, showZero: true }).isStatusBadge).toBe(false)
  })

  // 多字符标记。
  it('marks multi-character pills', () => {
    expect(resolveBadgeDisplay({ count: 99 }).multipleWords).toBe(true)
    expect(resolveBadgeDisplay({ count: 5 }).multipleWords).toBe(false)
    expect(resolveBadgeDisplay({ count: '99+' }).multipleWords).toBe(true)
    expect(resolveBadgeDisplay({ dot: true, count: 5 }).multipleWords).toBe(false)
  })

  // 文本可见性：0 需要 showZero；空串、布尔值隐藏。
  it('text visibility: 0 needs showZero, booleans and empty hide', () => {
    expect(resolveBadgeDisplay({ status: 'error', text: 0 }).textVisible).toBe(false)
    expect(resolveBadgeDisplay({ status: 'error', text: 0, showZero: true }).textVisible).toBe(true)
    expect(resolveBadgeDisplay({ status: 'error', text: '' }).textVisible).toBe(false)
    expect(resolveBadgeDisplay({ status: 'error', text: true }).textVisible).toBe(false)
    expect(resolveBadgeDisplay({ status: 'error', text: 'Running' }).textVisible).toBe(true)
  })

  // 自定义节点计数原样透传、标记 custom、不算多字符。
  it('passes a custom node count through untouched', () => {
    const node = { node: true }
    const d = resolveBadgeDisplay({ count: node })
    expect(d.displayCount).toBe(node)
    expect(d.hidden).toBe(false); expect(d.isCustom).toBe(true); expect(d.multipleWords).toBe(false)
    expect(resolveBadgeDisplay({ count: node, dot: true }).isCustom).toBe(false)
  })

  // 无计数无状态：完全隐藏；只有 status 时隐藏但走状态点。
  it('undefined count with no status/dot is fully hidden', () => {
    expect(resolveBadgeDisplay({}).hidden).toBe(true)
    expect(resolveBadgeDisplay({ status: 'warning' }).hidden).toBe(true)
    expect(resolveBadgeDisplay({ status: 'warning' }).hasStatus).toBe(true)
  })
})

describe('resolveBadgeColorKey (pure)', () => {
  // 数字忽略 status（antd 的状态类只在状态根下生效），预设色板/自定义色生效，默认红色。
  it('[badge.color.count] count ignores status', () => {
    expect(resolveBadgeColorKey('count', 'success')).toBe('error')
    expect(resolveBadgeColorKey('count', undefined, 'pink')).toBe('pink')
    expect(resolveBadgeColorKey('count', undefined, 'gray')).toBe('gray')
    expect(resolveBadgeColorKey('count', undefined, '#52c41a')).toBe('custom')
  })
  // 点与状态点：自定义色 > status > 预设色板 > 默认。
  it('[badge.color.dot] dot and status precedence', () => {
    expect(resolveBadgeColorKey('dot', 'success')).toBe('success')
    expect(resolveBadgeColorKey('dot', 'success', 'blue')).toBe('success')
    expect(resolveBadgeColorKey('dot', 'success', '#f50')).toBe('custom')
    expect(resolveBadgeColorKey('dot', undefined, 'volcano')).toBe('volcano')
    expect(resolveBadgeColorKey('dot')).toBe('error')
    expect(resolveBadgeColorKey('status', undefined, 'geekblue')).toBe('geekblue')
  })
})

describe('badgeOffsetStyle (pure)', () => {
  // x 取反写入 right（inset-inline-end），数字 y 补 px 写入 margin-top。
  it('negates x into right and converts numeric y to px', () => {
    expect(badgeOffsetStyle([10, 20])).toEqual({ right: '-10px', 'margin-top': '20px' })
  })

  // 字符串 x 按 parseFloat 解析，字符串 y 原样透传；小数保留。
  it('parses string x with parseFloat semantics', () => {
    expect(badgeOffsetStyle(['10px', '-5px'])).toEqual({ right: '-10px', 'margin-top': '-5px' })
    expect(badgeOffsetStyle([2.5, 0])).toEqual({ right: '-2.5px', 'margin-top': '0px' })
  })

  // 缺少 offset 返回 undefined。
  it('returns undefined without an offset', () => {
    expect(badgeOffsetStyle(undefined)).toBe(undefined)
  })

  // 无法解析的 x 跳过，y 保留。
  it('skips unparseable x but keeps y', () => {
    expect(badgeOffsetStyle(['abc', 4])).toEqual({ 'margin-top': '4px' })
  })
})

describe('createBadge', () => {
  // getter 注入的信号变化会重新派生。
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
