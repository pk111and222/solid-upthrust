import { describe, expect, it } from 'vitest'
import { colLayout, halfGutter, parseFlex, rowGap } from '../../../components/lib/Grid/layout'
import { COL_LAYER_CLASS } from '../../../components/lib/Grid/styles'

const C = COL_LAYER_CLASS

describe('Grid parseFlex', () => {
  // 与 antd parseFlex 一致：数字 n → `n n auto`，长度 → `0 0 长度`，auto → `1 1 auto`，其余原样。
  it.each<[number | string, string]>([
    [1, '1 1 auto'], [2, '2 2 auto'], [0, '0 0 auto'], [1.5, '1.5 1.5 auto'],
    ['100px', '0 0 100px'], ['12.5em', '0 0 12.5em'], ['2rem', '0 0 2rem'], ['30%', '0 0 30%'],
    ['auto', '1 1 auto'], ['none', 'none'], ['1 1 200px', '1 1 200px'], ['2', '2'],
  ])('[grid.layout.parseFlex] %j → %s', (input, expected) => {
    expect(parseFlex(input)).toBe(expected)
  })
})

describe('Grid colLayout', () => {
  // 什么都不传：无类无变量，宽度由内容决定（不再默认 span 24）。
  it('[grid.layout.empty] no props produce no classes or vars', () => {
    expect(colLayout({})).toEqual({ classes: [], vars: {}, hasBaseMaxWidth: false })
  })

  // span 写 base 层的 flex 与 max-width 变量，并标记 base 已写 max-width（去掉默认 max-w-full）。
  it('[grid.layout.span] span writes base flex + max-width', () => {
    const layout = colLayout({ span: 8 })
    expect(layout.classes).toEqual([C.base.flex, C.base['max-width']])
    expect(layout.vars).toEqual({ '--ut-col-flex': '0 0 33.33333333333333%', '--ut-col-max-width': '33.33333333333333%' })
    expect(layout.hasBaseMaxWidth).toBe(true)
  })

  // 数字字符串与数字等价；无法解析的值与负数被忽略。
  it('[grid.layout.numericString] numeric strings parse, garbage is ignored', () => {
    expect(colLayout({ span: '12' }).vars).toEqual(colLayout({ span: 12 }).vars)
    expect(colLayout({ span: 'abc', offset: 'x', order: '' })).toEqual({ classes: [], vars: {}, hasBaseMaxWidth: false })
    expect(colLayout({ span: -1 }).classes).toEqual([])
  })

  // span 0 隐藏列，且不写宽度变量。
  it('[grid.layout.spanZero] span 0 hides the column', () => {
    expect(colLayout({ span: 0 })).toEqual({ classes: [C.base.hidden], vars: {}, hasBaseMaxWidth: false })
  })

  // base 层的 offset/push/pull/order 为 0 时不产生类（与 antd 一致），非 0 才写百分比或原值。
  it('[grid.layout.baseZero] base-layer zeros are skipped', () => {
    expect(colLayout({ offset: 0, push: 0, pull: 0, order: 0 }).classes).toEqual([])
    const layout = colLayout({ offset: 6, push: 3, pull: 3, order: -1 })
    expect(layout.vars).toEqual({
      '--ut-col-offset': '25%', '--ut-col-push': '12.5%', '--ut-col-pull': '12.5%', '--ut-col-order': '-1',
    })
    expect(layout.classes).toEqual([C.base.offset, C.base.push, C.base.pull, C.base.order])
  })

  // 断点层的 0 显式生效，用来覆盖更窄层：offset→0、push/pull→auto、order→0。
  it('[grid.layout.bpZero] breakpoint-layer zeros reset narrower layers', () => {
    const layout = colLayout({ offset: 4, md: { offset: 0, push: 0, pull: 0, order: 0 } })
    expect(layout.vars).toMatchObject({
      '--ut-col-offset': '16.666666666666664%',
      '--ut-col-md-offset': '0', '--ut-col-md-push': 'auto', '--ut-col-md-pull': 'auto', '--ut-col-md-order': '0',
    })
    expect(layout.classes).toEqual([C.base.offset, C.md.offset, C.md.push, C.md.pull, C.md.order])
  })

  // xs 没有媒体查询，与基础 props 合并到 base 层，xs 的值覆盖同名基础 prop。
  it('[grid.layout.xs] xs merges into the base layer and wins over base props', () => {
    const layout = colLayout({ span: 12, xs: { span: 24, offset: 0 } })
    expect(layout.vars).toEqual({ '--ut-col-flex': '0 0 100%', '--ut-col-max-width': '100%', '--ut-col-offset': '0' })
    expect(layout.classes).toEqual([C.base.flex, C.base['max-width'], C.base.offset])
    expect(colLayout({ xs: 6 }).vars['--ut-col-max-width' as never]).toBe('25%')
  })

  // 每个断点层独立写变量和带媒体查询的类，数字简写等价于 { span }。
  it('[grid.layout.breakpoints] each breakpoint writes its own vars and classes', () => {
    const layout = colLayout({ sm: 12, md: { span: 8, offset: 2 }, xxxl: { order: 3 } })
    expect(layout.classes).toEqual([
      C.sm.flex, C.sm['max-width'],
      C.md.flex, C.md['max-width'], C.md.offset,
      C.xxxl.order,
    ])
    expect(layout.vars).toEqual({
      '--ut-col-sm-flex': '0 0 50%', '--ut-col-sm-max-width': '50%',
      '--ut-col-md-flex': '0 0 33.33333333333333%', '--ut-col-md-max-width': '33.33333333333333%',
      '--ut-col-md-offset': '8.333333333333332%',
      '--ut-col-xxxl-order': '3',
    })
    expect(layout.hasBaseMaxWidth).toBe(false)
  })

  // 隐藏后在更宽的断点重新出现：该层追加 block 类，把 display 恢复。
  it('[grid.layout.reveal] a positive span after a hidden layer re-displays the column', () => {
    const layout = colLayout({ xs: 0, md: 12, lg: 0, xl: 6 })
    expect(layout.classes).toEqual([
      C.base.hidden,
      C.md.block, C.md.flex, C.md['max-width'],
      C.lg.hidden,
      C.xl.block, C.xl.flex, C.xl['max-width'],
    ])
  })

  // 没有前置隐藏层时不输出多余的 block 类。
  it('[grid.layout.noRedundantBlock] no block class without a preceding hidden layer', () => {
    expect(colLayout({ sm: 6, md: 12 }).classes.some(name => name.endsWith('block'))).toBe(false)
  })

  // 断点层的 ColSize.flex：与 span 同层时覆盖 flex 变量值（类只挂一次），单独出现时自己挂类。
  it('[grid.layout.bpFlex] ColSize.flex overrides the layer flex var', () => {
    const withSpan = colLayout({ md: { span: 6, flex: 'auto' } })
    expect(withSpan.vars['--ut-col-md-flex' as never]).toBe('1 1 auto')
    expect(withSpan.classes.filter(name => name === C.md.flex)).toHaveLength(1)

    const alone = colLayout({ lg: { flex: '200px' } })
    expect(alone.classes).toEqual([C.lg.flex])
    expect(alone.vars).toEqual({ '--ut-col-lg-flex': '0 0 200px' })
  })

  // 基础 flex prop 不进入变量（由组件写内联 style），但 xs 对象里的 flex 属于 base 层变量。
  it('[grid.layout.baseFlex] base flex prop stays out of layer vars', () => {
    expect(colLayout({ flex: 2 })).toEqual({ classes: [], vars: {}, hasBaseMaxWidth: false })
    expect(colLayout({ xs: { flex: 1 } }).vars).toEqual({ '--ut-col-flex': '1 1 auto' })
  })
})

describe('Grid gutter helpers', () => {
  // 数字间距取半：Row 为负外边距，Col 为正内边距。
  it('[grid.layout.halfGutter.number] numbers halve to px with the given sign', () => {
    expect(halfGutter(16, -1)).toBe('-8px')
    expect(halfGutter(16, 1)).toBe('8px')
    expect(halfGutter(15, 1)).toBe('7.5px')
  })

  // CSS 长度字符串走 calc，纯数字字符串按数字处理，前后空白被裁掉。
  it('[grid.layout.halfGutter.string] strings use calc; numeric strings act as numbers', () => {
    expect(halfGutter('2rem', -1)).toBe('calc(2rem / -2)')
    expect(halfGutter(' 1em ', 1)).toBe('calc(1em / 2)')
    expect(halfGutter('24', 1)).toBe('12px')
  })

  // 0、负数、NaN、空串与 undefined 都视为无间距，不产生样式。
  it.each([0, -8, Number.NaN, Number.POSITIVE_INFINITY, '', '  ', '0', '-4', undefined])(
    '[grid.layout.halfGutter.none] %j yields no gutter',
    (value) => {
      expect(halfGutter(value as never, 1)).toBeUndefined()
      expect(rowGap(value as never)).toBeUndefined()
    },
  )

  // 垂直间距直接写 row-gap：数字加 px，字符串原样。
  it('[grid.layout.rowGap] vertical gutter maps to row-gap', () => {
    expect(rowGap(24)).toBe('24px')
    expect(rowGap('16')).toBe('16px')
    expect(rowGap('1.5rem')).toBe('1.5rem')
  })
})
