import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Grid, { Col, Row, type ColProps, type RowProps } from '../../../components/lib/Grid'
import { createFakeMatchMedia } from '../../utils/matchMedia'
import { mount } from '../../utils/mount'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {}; vi.unstubAllGlobals() })

const render = (factory: Parameters<typeof mount>[0]) => {
  const mounted = mount(factory)
  cleanup = mounted.dispose
  return mounted.host
}
const classes = (el: Element) => el.className.split(/\s+/).filter(Boolean)
const pct = (n: number) => `${(n / 24) * 100}%`
// flex/margin 等简写会被 CSSOM 规范化，用参照元素得到同一规范化结果再比较。
const normalized = (prop: string, value: string) => {
  const probe = document.createElement('div')
  probe.style.setProperty(prop, value)
  return probe.style.getPropertyValue(prop)
}

/**
 * 读取 Col 的分层布局契约：某字段只有在“内联变量已写入 + 消费该变量的静态类已挂上”时才算生效。
 * base 层没有媒体前缀（含 xs），其余层用补零宽度的 min-[0576px]: 前缀，保证生成的 @media 按宽度升序。
 */
const LAYERS = { base: '', sm: 'min-[0576px]:', md: 'min-[0768px]:', lg: 'min-[0992px]:', xl: 'min-[1200px]:', xxl: 'min-[1600px]:', xxxl: 'min-[1920px]:' } as const
const FIELDS = { flex: 'flex', 'max-width': 'max-width', offset: 'margin-inline-start', push: 'inset-inline-start', pull: 'inset-inline-end', order: 'order' } as const
type Layer = keyof typeof LAYERS
const colLayers = (el: HTMLElement) => {
  const out: Partial<Record<Layer, Record<string, string>>> = {}
  const own = classes(el)
  for (const [layer, prefix] of Object.entries(LAYERS) as [Layer, string][]) {
    const found: Record<string, string> = {}
    const varPrefix = layer === 'base' ? '--ut-col' : `--ut-col-${layer}`
    for (const [field, prop] of Object.entries(FIELDS)) {
      const value = el.style.getPropertyValue(`${varPrefix}-${field}`)
      if (value && own.includes(`${prefix}[${prop}:var(${varPrefix}-${field})]`)) found[field] = value
    }
    if (own.includes(`${prefix}hidden`)) found.display = 'none'
    if (own.includes(`${prefix}block`)) found.display = 'block'
    if (Object.keys(found).length) out[layer] = found
  }
  return out
}
const colOf = (props: ColProps) => {
  const host = render(() => <Row><Col data-col {...props}>C</Col></Row>)
  return host.querySelector('[data-col]') as HTMLElement
}
const rowOf = (props: RowProps) => render(() => <Row data-row {...props}><Col data-col span={12}>A</Col></Row>).querySelector('[data-row]') as HTMLElement

describe('Col 栅格分层', () => {
  // span 默认 undefined（与 antd 一致）：不写任何布局变量，也不挂宽度类，宽度由内容与 flex 决定。
  it('[grid.col.span-default] leaves layout unset when span is omitted', () => {
    const el = colOf({})
    expect(colLayers(el)).toEqual({})
    expect(classes(el)).toEqual(expect.arrayContaining(['relative', 'max-w-full', 'min-h-px']))
    expect(el.style.getPropertyValue('flex')).toBe('')
  })

  // span 按 24 栅格换算 flex-basis 与 max-width；span=0 隐藏列。
  it.each([[6, pct(6)], [24, pct(24)], [1, pct(1)], [13, pct(13)]])('[grid.col.span] span=%s maps to %s', (span, width) => {
    expect(colLayers(colOf({ span }))).toEqual({ base: { flex: `0 0 ${width}`, 'max-width': width } })
  })

  // span=0 只输出隐藏，不输出 0% 的宽度。
  it('[grid.col.span-zero] hides the column for span 0', () => {
    expect(colLayers(colOf({ span: 0 }))).toEqual({ base: { display: 'none' } })
  })

  // 数字字符串与数字等价（antd ColSpanType = number | string）；非数字字符串被忽略。
  it('[grid.col.span-string] accepts numeric strings and ignores garbage', () => {
    expect(colLayers(colOf({ span: '8' }))).toEqual({ base: { flex: `0 0 ${pct(8)}`, 'max-width': pct(8) } })
    expect(colLayers(colOf({ span: 'wide' as never }))).toEqual({})
  })

  // offset/push/pull/order 分别映射逻辑属性 margin-inline-start、inset-inline-start/end 与 order。
  it('[grid.col.offset-push-pull-order] maps positional props to logical properties', () => {
    expect(colLayers(colOf({ span: 12, offset: 8, push: 2, pull: 3, order: 4 }))).toEqual({
      base: { flex: `0 0 ${pct(12)}`, 'max-width': pct(12), offset: pct(8), push: pct(2), pull: pct(3), order: '4' },
    })
  })

  // 基础层的 0 值与 antd 一致被跳过（不输出类），避免无意义的覆盖。
  it('[grid.col.base-zero] skips zero offset/push/pull/order on the base layer', () => {
    expect(colLayers(colOf({ offset: 0, push: 0, pull: 0, order: 0 }))).toEqual({})
  })

  // xs 没有媒体查询，与基础 props 合并为一层且覆盖同名基础值；断点层的 0 值显式生效（push/pull 0 → auto）。
  it('[grid.col.responsive] merges xs into the base layer and emits breakpoint layers', () => {
    const el = colOf({ span: 12, offset: 2, xs: 24, md: { span: 12, offset: 0, push: 0, pull: 0, order: 0 }, xl: 6, xxxl: { span: 4, order: 2 } })
    expect(colLayers(el)).toEqual({
      base: { flex: `0 0 ${pct(24)}`, 'max-width': pct(24), offset: pct(2) },
      md: { flex: `0 0 ${pct(12)}`, 'max-width': pct(12), offset: '0', push: 'auto', pull: 'auto', order: '0' },
      xl: { flex: `0 0 ${pct(6)}`, 'max-width': pct(6) },
      xxxl: { flex: `0 0 ${pct(4)}`, 'max-width': pct(4), order: '2' },
    })
  })

  // 断点 span=0 在该断点隐藏；低层隐藏后高层 span>0 需要显式恢复 display:block。
  it('[grid.col.responsive-display] hides per breakpoint and restores when a wider layer shows it', () => {
    expect(colLayers(colOf({ span: 6, md: 0 }))).toEqual({ base: { flex: `0 0 ${pct(6)}`, 'max-width': pct(6) }, md: { display: 'none' } })
    expect(colLayers(colOf({ xs: 0, sm: 12, lg: 0, xl: 8 }))).toEqual({
      base: { display: 'none' },
      sm: { display: 'block', flex: `0 0 ${pct(12)}`, 'max-width': pct(12) },
      lg: { display: 'none' },
      xl: { display: 'block', flex: `0 0 ${pct(8)}`, 'max-width': pct(8) },
    })
  })

  // 断点对象里的 flex 覆盖同层 span 的 flex，max-width 仍由 span 给出；flex 值按 antd parseFlex 规范化。
  it('[grid.col.responsive-flex] breakpoint flex overrides the span flex of that layer', () => {
    expect(colLayers(colOf({ md: { span: 12, flex: 'auto' }, lg: { flex: 2 }, xl: { flex: '200px' } }))).toEqual({
      md: { flex: '1 1 auto', 'max-width': pct(12) },
      lg: { flex: '2 2 auto' },
      xl: { flex: '0 0 200px' },
    })
  })

  // 基础 flex prop 写内联 style（与 antd 相同），数字 → n n auto，长度 → 0 0 长度，auto → 1 1 auto，其他原样。
  it.each<[ColProps['flex'], string]>([
    [2, '2 2 auto'], ['100px', '0 0 100px'], ['2.5rem', '0 0 2.5rem'], ['30%', '0 0 30%'], ['auto', '1 1 auto'], ['none', 'none'], ['1 1 200px', '1 1 200px'],
  ])('[grid.col.flex] flex=%s is written inline as %s', (flex, expected) => {
    const el = colOf({ flex })
    expect(el.style.getPropertyValue('flex')).toBe(normalized('flex', expected))
    expect(el.style.getPropertyValue('min-width')).toBe('')
  })

  // Row 关闭换行时，带 flex 的列补 min-width:0，防止内容撑破不换行的行。
  it('[grid.col.flex-nowrap] adds min-width 0 for flex columns inside a nowrap row', () => {
    const host = render(() => <Row wrap={false}><Col data-a flex="auto">A</Col><Col data-b span={6}>B</Col></Row>)
    expect((host.querySelector('[data-a]') as HTMLElement).style.getPropertyValue('min-width')).toBe(normalized('min-width', '0'))
    expect((host.querySelector('[data-b]') as HTMLElement).style.getPropertyValue('min-width')).toBe('')
  })

  // 用户 style 与布局变量合并，同名内联属性以用户为准。
  it('[grid.col.style-merge] merges user style after computed layout style', () => {
    const el = colOf({ span: 6, flex: 2, style: { flex: '1', color: 'red' } })
    expect(el.style.getPropertyValue('flex')).toBe(normalized('flex', '1'))
    expect(el.style.color).toBe('red')
    expect(el.style.getPropertyValue('--ut-col-flex')).toBe(`0 0 ${pct(6)}`)
  })

  // span 等 props 变化时布局随信号响应式更新，旧层的类与变量被清掉。
  it('[grid.col.reactive] updates layers when props change', () => {
    const [span, setSpan] = createSignal<number | undefined>(6)
    const [md, setMd] = createSignal<ColProps['md']>(12)
    const host = render(() => <Row><Col data-col span={span()} md={md()}>C</Col></Row>)
    const el = host.querySelector('[data-col]') as HTMLElement
    expect(Object.keys(colLayers(el))).toEqual(['base', 'md'])
    setSpan(undefined); setMd(undefined); flush()
    expect(colLayers(el)).toEqual({})
    expect(el.style.getPropertyValue('--ut-col-md-flex')).toBe('')
  })
})

describe('Row 间距与对齐', () => {
  // 默认：flex 行、允许换行、min-w-0；未设置 justify/align 时不输出对齐类（antd 实际行为：交叉轴 stretch）。
  it('[grid.row.defaults] renders a wrapping flex row without alignment classes', () => {
    const el = rowOf({})
    expect(classes(el)).toEqual(expect.arrayContaining(['flex', 'flex-wrap', 'min-w-0']))
    expect(classes(el).some(name => /^(justify-|items-)/.test(name))).toBe(false)
    expect(el.getAttribute('style') ?? '').toBe('')
  })

  // wrap=false 改为不换行。
  it('[grid.row.wrap] switches to nowrap', () => {
    const el = rowOf({ wrap: false })
    expect(classes(el)).toContain('flex-nowrap')
    expect(classes(el)).not.toContain('flex-wrap')
  })

  // justify 与 align 映射到对应的 justify-content / align-items 工具类。
  it.each<[RowProps, string]>([
    [{ justify: 'start' }, 'justify-start'], [{ justify: 'end' }, 'justify-end'], [{ justify: 'center' }, 'justify-center'],
    [{ justify: 'space-between' }, 'justify-between'], [{ justify: 'space-around' }, 'justify-around'], [{ justify: 'space-evenly' }, 'justify-evenly'],
    [{ align: 'top' }, 'items-start'], [{ align: 'middle' }, 'items-center'], [{ align: 'bottom' }, 'items-end'], [{ align: 'stretch' }, 'items-stretch'],
  ])('[grid.row.align] %o → %s', (props, expected) => {
    expect(classes(rowOf(props))).toContain(expected)
  })

  // 数字水平间距：行负外边距 -g/2，列内边距 g/2；垂直间距写 row-gap。
  it('[grid.row.gutter] applies horizontal and vertical gutters', () => {
    const host = render(() => <Row data-row gutter={[16, 24]}><Col data-col span={12}>A</Col></Row>)
    const row = host.querySelector('[data-row]') as HTMLElement
    const colEl = host.querySelector('[data-col]') as HTMLElement
    expect(row.style.marginLeft).toBe('-8px')
    expect(row.style.marginRight).toBe('-8px')
    expect(row.style.rowGap).toBe('24px')
    expect(colEl.style.paddingLeft).toBe('8px')
    expect(colEl.style.paddingRight).toBe('8px')
  })

  // 字符串间距（antd 6）：用 calc 取半，垂直方向原样写入 row-gap。
  it('[grid.row.gutter-string] supports CSS length strings', () => {
    const host = render(() => <Row data-row gutter={['2rem', '1em']}><Col data-col span={12}>A</Col></Row>)
    const row = host.querySelector('[data-row]') as HTMLElement
    const colEl = host.querySelector('[data-col]') as HTMLElement
    expect(row.style.getPropertyValue('margin-left')).toBe(normalized('margin-left', 'calc(2rem / -2)'))
    expect(colEl.style.getPropertyValue('padding-right')).toBe(normalized('padding-right', 'calc(2rem / 2)'))
    expect(row.style.rowGap).toBe('1em')
  })

  // 0 与负数间距不输出任何内联样式，列也不加内边距。
  it('[grid.row.gutter-zero] ignores zero and negative gutters', () => {
    const host = render(() => <Row data-row gutter={[0, -4]}><Col data-col span={12}>A</Col></Row>)
    expect((host.querySelector('[data-row]') as HTMLElement).getAttribute('style') ?? '').toBe('')
    expect((host.querySelector('[data-col]') as HTMLElement).style.paddingLeft).toBe('')
  })

  // 响应式间距：取当前命中的最大断点上已定义的值，媒体查询变化后同步更新。
  it('[grid.row.gutter-responsive] resolves responsive gutters from matchMedia and follows changes', () => {
    const mm = createFakeMatchMedia({ '(min-width: 576px)': true, '(min-width: 768px)': true })
    vi.stubGlobal('matchMedia', mm.matchMedia)
    const host = render(() => <Row data-row gutter={[{ xs: 8, md: 16, xl: 32 }, { sm: 12 }]}><Col data-col span={12}>A</Col></Row>)
    const row = host.querySelector('[data-row]') as HTMLElement
    expect(row.style.marginLeft).toBe('-8px')
    expect(row.style.rowGap).toBe('12px')
    mm.setMatch('(min-width: 992px)', true)
    mm.setMatch('(min-width: 1200px)', true)
    flush()
    expect(row.style.marginLeft).toBe('-16px')
    expect((host.querySelector('[data-col]') as HTMLElement).style.paddingLeft).toBe('16px')
  })

  // 响应式 justify/align 同样按当前断点取值。
  it('[grid.row.align-responsive] resolves responsive justify and align', () => {
    const mm = createFakeMatchMedia({ '(max-width: 575.98px)': true })
    vi.stubGlobal('matchMedia', mm.matchMedia)
    const host = render(() => <Row data-row justify={{ xs: 'center', lg: 'space-between' }} align={{ xs: 'top', lg: 'middle' }}><Col span={6}>A</Col></Row>)
    const row = host.querySelector('[data-row]') as HTMLElement
    expect(classes(row)).toEqual(expect.arrayContaining(['justify-center', 'items-start']))
    mm.setMatch('(max-width: 575.98px)', false)
    for (const w of [576, 768, 992]) mm.setMatch(`(min-width: ${w}px)`, true)
    flush()
    expect(classes(row)).toEqual(expect.arrayContaining(['justify-between', 'items-center']))
    expect(classes(row)).not.toContain('justify-center')
  })

  // 没有 matchMedia 的环境（SSR）按“所有断点命中”解析，取最宽断点的值而不是丢弃。
  it('[grid.row.no-matchmedia] falls back to the widest defined value without matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined)
    const el = rowOf({ gutter: { xs: 8, lg: 24 }, justify: { sm: 'end' } })
    expect(el.style.marginLeft).toBe('-12px')
    expect(classes(el)).toContain('justify-end')
  })

  // 列读取最近的 Row 的间距；嵌套行互不干扰，Row 外的 Col 没有内边距。
  it('[grid.row.nested] columns read the nearest row gutter', () => {
    const host = render(() => (
      <>
        <Row gutter={20}><Col data-outer span={12}><Row gutter={8}><Col data-inner span={12}>I</Col></Row></Col></Row>
        <Col data-orphan span={6}>O</Col>
      </>
    ))
    expect((host.querySelector('[data-outer]') as HTMLElement).style.paddingLeft).toBe('10px')
    expect((host.querySelector('[data-inner]') as HTMLElement).style.paddingLeft).toBe('4px')
    expect((host.querySelector('[data-orphan]') as HTMLElement).style.paddingLeft).toBe('')
  })

  // gutter 信号变化时行和所有列同步更新。
  it('[grid.row.reactive] updates gutter reactively', () => {
    const [gutter, setGutter] = createSignal<RowProps['gutter']>(16)
    const host = render(() => <Row data-row gutter={gutter()}><Col data-col span={12}>A</Col></Row>)
    setGutter([32, 8]); flush()
    expect((host.querySelector('[data-row]') as HTMLElement).style.marginLeft).toBe('-16px')
    expect((host.querySelector('[data-row]') as HTMLElement).style.rowGap).toBe('8px')
    expect((host.querySelector('[data-col]') as HTMLElement).style.paddingRight).toBe('16px')
  })

  // Grid 命名空间与具名导出指向同一组件。
  it('[grid.namespace] Grid.Row / Grid.Col are the named exports', () => {
    expect(Grid.Row).toBe(Row)
    expect(Grid.Col).toBe(Col)
  })
})
