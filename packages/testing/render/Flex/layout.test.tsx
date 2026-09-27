import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it } from 'vitest'
import Flex, { type FlexProps } from '../../../components/lib/Flex'
import { mount } from '../../utils/mount'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {} })

const view = (props: FlexProps = {}) => {
  const mounted = mount(() => <Flex {...props}><span>A</span><span>B</span></Flex>)
  cleanup = mounted.dispose
  return mounted.host.firstElementChild as HTMLElement
}
const classes = (el: Element) => el.className.split(/\s+/).filter(Boolean)
// flex 简写会被 CSSOM 规范化（auto → 1 1 auto），用参照元素得到同一规范化结果再比较。
const normalizedFlex = (value: string) => {
  const probe = document.createElement('div')
  probe.style.flex = value
  return probe.style.flex
}

describe('Flex 布局属性', () => {
  // 默认渲染 div 水平弹性容器；未设置的 wrap/justify/align 不输出类，保持 CSS 初始值。
  it('[flex.defaults] renders a horizontal div without optional layout classes', () => {
    const el = view()
    expect(el.tagName).toBe('DIV')
    expect(classes(el)).toEqual(expect.arrayContaining(['flex', 'flex-row', 'empty:hidden']))
    expect(classes(el).some(name => /^(flex-(no)?wrap|justify-|items-|gap-)|^\[(justify-content|align-items)/.test(name))).toBe(false)
    expect(el.getAttribute('style') ?? '').toBe('')
    expect(el.textContent).toBe('AB')
  })

  // vertical 切换主轴为纵向；orientation 为合法值时优先于 vertical，非法值回退到 vertical。
  it.each<[FlexProps, string]>([
    [{ vertical: true }, 'flex-col'],
    [{ vertical: false }, 'flex-row'],
    [{ orientation: 'vertical' }, 'flex-col'],
    [{ orientation: 'horizontal', vertical: true }, 'flex-row'],
    [{ orientation: 'vertical', vertical: false }, 'flex-col'],
    [{ orientation: 'diagonal' as never, vertical: true }, 'flex-col'],
  ])('[flex.direction] %o → %s', (props, expected) => {
    const el = view(props)
    expect(classes(el)).toContain(expected)
    expect(classes(el)).not.toContain(expected === 'flex-col' ? 'flex-row' : 'flex-col')
  })

  // wrap 同时接受布尔值与 flex-wrap 关键字：true=wrap，false=nowrap。
  it.each<[FlexProps['wrap'], string]>([
    [true, 'flex-wrap'], ['wrap', 'flex-wrap'], [false, 'flex-nowrap'],
    ['nowrap', 'flex-nowrap'], ['wrap-reverse', 'flex-wrap-reverse'],
  ])('[flex.wrap] wrap=%s → %s', (wrap, expected) => {
    const el = view({ wrap })
    expect(classes(el).filter(name => name.startsWith('flex-') && name.includes('wrap'))).toEqual([expected])
  })

  // justify 覆盖 12 个主轴关键字，每个值只输出一个对应类（CSS 语义另由 L1 样式用例验证）。
  it.each<NonNullable<FlexProps['justify']>>([
    'flex-start', 'flex-end', 'start', 'end', 'center', 'space-between',
    'space-around', 'space-evenly', 'stretch', 'normal', 'left', 'right',
  ])('[flex.justify] justify=%s outputs one class', justify => {
    const el = view({ justify })
    expect(classes(el).filter(name => name.startsWith('justify-') || name.startsWith('[justify-content:'))).toHaveLength(1)
  })

  // align 覆盖 10 个交叉轴关键字，每个值只输出一个对应类。
  it.each<NonNullable<FlexProps['align']>>([
    'flex-start', 'flex-end', 'start', 'end', 'self-start', 'self-end',
    'center', 'baseline', 'stretch', 'normal',
  ])('[flex.align] align=%s outputs one class', align => {
    const el = view({ align })
    expect(classes(el).filter(name => name.startsWith('items-') || name.startsWith('[align-items:'))).toHaveLength(1)
  })

  // inline 使用 inline-flex，且不与 display:flex 类并存。
  it('[flex.inline] switches display to inline-flex', () => {
    const el = view({ inline: true })
    expect(classes(el)).toContain('inline-flex')
    expect(classes(el)).not.toContain('flex')
  })
})

describe('Flex 间距与 flex', () => {
  // 预设档位走主题类：small=8px(xs)、middle/medium=16px(md)、large=24px(lg)，不写内联 gap。
  it.each<[FlexProps['gap'], string]>([
    ['small', 'gap-xs'], ['middle', 'gap-md'], ['medium', 'gap-md'], ['large', 'gap-lg'],
  ])('[flex.gap.preset] gap=%s → %s', (gap, expected) => {
    const el = view({ gap })
    expect(classes(el)).toContain(expected)
    expect(el.style.gap).toBe('')
  })

  // 数字按 px 写入内联样式（0 也是有效值），其他字符串原样写入。
  it.each<[FlexProps['gap'], string]>([[20, '20px'], [0, '0px'], ['2rem', '2rem'], ['8px 24px', '8px 24px']])(
    '[flex.gap.custom] gap=%s → style gap %s', (gap, expected) => {
      const el = view({ gap })
      expect(el.style.gap).toBe(expected)
      expect(classes(el).some(name => name.startsWith('gap-'))).toBe(false)
    })

  // flex 按 CSS 简写原样透传：数字 1 等价 flex:1（1 1 0%，而非 1 1 auto），0 也生效。
  it.each<[FlexProps['flex'], string]>([[1, '1'], [0, '0'], [2.5, '2.5'], ['auto', 'auto'], ['none', 'none'], ['1 1 200px', '1 1 200px']])(
    '[flex.flex] flex=%s', (flex, expected) => {
      const el = view({ flex })
      expect(el.style.flex).not.toBe('')
      expect(el.style.flex).toBe(normalizedFlex(expected))
    })

  // 内联样式与 style 合并；gap/flex 属性覆盖 style 中的同名项，其余 style 保留。
  it('[flex.style.merge] props win over style for gap and flex', () => {
    const el = view({ gap: 12, flex: 'none', style: { gap: '99px', flex: '9', color: 'red', 'min-height': '10px' } })
    expect(el.style.gap).toBe('12px')
    expect(el.style.flex).toBe(normalizedFlex('none'))
    expect(el.style.color).toBe('red')
    expect(el.style.minHeight).toBe('10px')
  })

  // 调用方 class 追加并通过 twMerge 覆盖冲突的内置类。
  it('[flex.class.merge] caller classes override conflicting built-ins', () => {
    const el = view({ class: 'flex-col custom-flex items-end', align: 'center' })
    expect(classes(el)).toEqual(expect.arrayContaining(['flex-col', 'custom-flex', 'items-end']))
    expect(classes(el)).not.toContain('flex-row')
    expect(classes(el)).not.toContain('items-center')
  })
})

describe('Flex 响应式更新', () => {
  // 所有布局属性随 signal 更新，旧类与旧内联值被移除。
  it('[flex.reactive] updates classes and inline style in place', () => {
    const [state, setState] = createSignal<FlexProps>({ gap: 'small', justify: 'center', wrap: true }, { ownedWrite: true })
    const mounted = mount(() => <Flex vertical={state().vertical} gap={state().gap} justify={state().justify} wrap={state().wrap} align={state().align} flex={state().flex}><i /></Flex>)
    cleanup = mounted.dispose
    const el = mounted.host.firstElementChild as HTMLElement
    expect(classes(el)).toEqual(expect.arrayContaining(['gap-xs', 'justify-center', 'flex-wrap', 'flex-row']))
    setState({ gap: 30, justify: 'end', wrap: false, vertical: true, align: 'baseline', flex: 2 }); flush()
    expect(el).toBe(mounted.host.firstElementChild)
    expect(classes(el)).toEqual(expect.arrayContaining(['[justify-content:end]', 'flex-nowrap', 'flex-col', 'items-baseline']))
    expect(classes(el)).not.toContain('gap-xs')
    expect(classes(el)).not.toContain('justify-center')
    expect(el.style.gap).toBe('30px')
    expect(el.style.flex).toBe(normalizedFlex('2'))
    setState({ gap: 'large' }); flush()
    expect(el.style.gap).toBe('')
    expect(el.style.flex).toBe('')
    expect(classes(el)).toContain('gap-lg')
    expect(classes(el).some(name => name.startsWith('items-') || name.startsWith('justify-'))).toBe(false)
  })
})
