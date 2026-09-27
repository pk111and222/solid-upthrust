import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Divider, { type DividerProps } from '../../../components/lib/Divider'
import { mount } from '../../utils/mount'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {} })

const render = (factory: Parameters<typeof mount>[0]) => {
  const mounted = mount(factory)
  cleanup = mounted.dispose
  return mounted.host
}
const classes = (el: Element) => el.className.split(/\s+/).filter(Boolean)
const plain = (props: DividerProps = {}) => render(() => <Divider {...props} />).firstElementChild as HTMLElement
const titled = (props: DividerProps = {}, text = '标题') => {
  const root = render(() => <Divider {...props}>{text}</Divider>).firstElementChild as HTMLElement
  const [start, content, end] = [...root.children] as HTMLElement[]
  return { root, start, content, end }
}

describe('Divider 方向', () => {
  // 默认水平分割线：role=separator、撑满宽度、上下 24px 外边距、顶部 1px 实线；水平是 separator 的隐含方向，不写 aria-orientation。
  it('[divider.defaults] renders a horizontal separator', () => {
    const el = plain()
    expect(el.getAttribute('role')).toBe('separator')
    expect(el.hasAttribute('aria-orientation')).toBe(false)
    expect(classes(el)).toEqual(expect.arrayContaining(['flex', 'w-full', 'min-w-full', 'my-lg', 'border-t', 'border-solid']))
    expect(el.childElementCount).toBe(0)
  })

  // 垂直分割线：orientation="vertical" / vertical / 旧 type 三种写法等价，并声明 aria-orientation。
  it.each<DividerProps>([{ orientation: 'vertical' }, { vertical: true }, { type: 'vertical' }])('[divider.vertical] %o renders a vertical rule', props => {
    const el = plain(props)
    expect(el.getAttribute('aria-orientation')).toBe('vertical')
    expect(classes(el)).toEqual(expect.arrayContaining(['inline-block', 'align-middle', 'h-[0.9em]', 'mx-xs', 'border-l', 'relative', 'top-[-0.06em]']))
    expect(classes(el)).not.toContain('border-t')
  })

  // orientation 取合法方向值时优先于 vertical 与 type。
  it('[divider.orientation-priority] orientation wins over vertical and type', () => {
    expect(plain({ orientation: 'horizontal', vertical: true }).hasAttribute('aria-orientation')).toBe(false)
    expect(plain({ orientation: 'horizontal', type: 'vertical' }).hasAttribute('aria-orientation')).toBe(false)
    expect(plain({ vertical: true, type: 'horizontal' }).getAttribute('aria-orientation')).toBe('vertical')
  })

  // 垂直分割线忽略 children（与 antd 相同）。
  it('[divider.vertical-children] ignores children when vertical', () => {
    const root = render(() => <Divider vertical>文字</Divider>).firstElementChild as HTMLElement
    expect(root.textContent).toBe('')
    expect(root.childElementCount).toBe(0)
  })
})

describe('Divider 标题', () => {
  // 带标题：两段 rail 夹住内容；外边距缩为 16px、自身不再画顶边；标题 16px 中粗、内边距 1em，
  // 且字号 token（text-body-lg）与文字颜色（text-on-surface）同时保留——默认 twMerge 会把二者当成同组互相吞掉。
  it('[divider.title] renders rails around the title', () => {
    const { root, start, content, end } = titled()
    expect(root.childElementCount).toBe(3)
    expect(classes(root)).toEqual(expect.arrayContaining(['flex', 'items-center', 'my-md', 'whitespace-nowrap']))
    expect(classes(root)).not.toContain('border-t')
    expect(classes(root)).not.toContain('my-lg')
    expect(content.textContent).toBe('标题')
    expect(classes(content)).toEqual(expect.arrayContaining(['inline-block', 'px-[1em]', 'font-medium', 'text-body-lg', 'text-on-surface']))
    for (const rail of [start, end]) expect(classes(rail)).toEqual(expect.arrayContaining(['border-t', 'border-solid', 'flex-1']))
  })

  // plain 标题使用正文字号与常规字重。
  it('[divider.plain] uses body text for plain titles', () => {
    const { content } = titled({ plain: true })
    expect(classes(content)).toEqual(expect.arrayContaining(['font-normal', 'text-body', 'text-on-surface']))
    expect(classes(content)).not.toContain('font-medium')
    expect(classes(content)).not.toContain('text-body-lg')
  })

  // titlePlacement 与旧 orientation left/right 等价：靠近起点的一侧 rail 为 5%，另一侧占满剩余。
  it.each<[DividerProps, 'start' | 'end' | 'center']>([
    [{ titlePlacement: 'start' }, 'start'], [{ titlePlacement: 'left' }, 'start'], [{ orientation: 'left' }, 'start'],
    [{ titlePlacement: 'end' }, 'end'], [{ titlePlacement: 'right' }, 'end'], [{ orientation: 'right' }, 'end'],
    [{ titlePlacement: 'center' }, 'center'], [{ orientation: 'center' }, 'center'], [{ titlePlacement: 'start', orientation: 'right' }, 'start'],
  ])('[divider.placement] %o → %s', (props, placement) => {
    const { start, end } = titled(props)
    const short = ['flex-none', 'w-[5%]']
    if (placement === 'start') { expect(classes(start)).toEqual(expect.arrayContaining(short)); expect(classes(end)).toContain('flex-1') }
    if (placement === 'end') { expect(classes(end)).toEqual(expect.arrayContaining(short)); expect(classes(start)).toContain('flex-1') }
    if (placement === 'center') for (const rail of [start, end]) { expect(classes(rail)).toContain('flex-1'); expect(classes(rail)).not.toContain('w-[5%]') }
  })

  // orientationMargin：起止位置时隐藏靠边一侧 rail，标题以该距离留白（数字与纯数字字符串按 px）。
  it.each<[DividerProps, 'start' | 'end', string]>([
    [{ orientation: 'left', orientationMargin: 0 }, 'start', '0px'],
    [{ titlePlacement: 'start', orientationMargin: 24 }, 'start', '24px'],
    [{ orientation: 'left', orientationMargin: '60' }, 'start', '60px'],
    [{ orientation: 'left', orientationMargin: '2em' }, 'start', '2em'],
    [{ titlePlacement: 'end', orientationMargin: '10%' }, 'end', '10%'],
  ])('[divider.orientation-margin] %o', (props, side, margin) => {
    const { start, content, end } = titled(props)
    const hidden = side === 'start' ? start : end
    const other = side === 'start' ? end : start
    expect(classes(hidden)).toEqual(expect.arrayContaining(['flex-none', 'w-0']))
    expect(classes(other)).toContain('flex-1')
    const prop = side === 'start' ? 'margin-inline-start' : 'margin-inline-end'
    const pad = side === 'start' ? 'padding-inline-start' : 'padding-inline-end'
    expect(content.style.getPropertyValue(prop)).toBe(margin)
    expect(content.style.getPropertyValue(pad)).toBe('0px')
  })

  // 居中标题时 orientationMargin 不生效。
  it('[divider.orientation-margin.center] ignores margin for centered titles', () => {
    const { start, content, end } = titled({ orientationMargin: 40 })
    expect(content.getAttribute('style') ?? '').toBe('')
    for (const rail of [start, end]) expect(classes(rail)).toContain('flex-1')
  })

  // false/null/空串 children 不进入标题布局（antd 用 !!children 判断）。
  it.each([false, null, undefined, ''])('[divider.children.falsy] children=%o renders a plain rule', value => {
    const root = render(() => <Divider>{value as never}</Divider>).firstElementChild as HTMLElement
    expect(root.childElementCount).toBe(0)
    expect(classes(root)).toContain('border-t')
    expect(classes(root)).toContain('my-lg')
  })

  // 标题出现/消失时宿主元素保持同一节点（不因分支切换重建），外部持有的 ref 不失效。
  it('[divider.children.reactive] keeps the host node while the title toggles', () => {
    const [text, setText] = createSignal<string | undefined>(undefined)
    const host = render(() => <Divider>{text()}</Divider>)
    const root = host.firstElementChild
    setText('出现'); flush()
    expect(host.firstElementChild).toBe(root)
    expect(root!.childElementCount).toBe(3)
    setText(undefined); flush()
    expect(host.firstElementChild).toBe(root)
    expect(root!.childElementCount).toBe(0)
  })
})

describe('Divider 线型与尺寸', () => {
  // variant 选择实线/虚线/点线；旧 dashed 等价于 variant="dashed"，显式 variant 优先。
  it.each<[DividerProps, string]>([
    [{}, 'border-solid'], [{ variant: 'dashed' }, 'border-dashed'], [{ variant: 'dotted' }, 'border-dotted'],
    [{ dashed: true }, 'border-dashed'], [{ dashed: true, variant: 'dotted' }, 'border-dotted'], [{ vertical: true, variant: 'dashed' }, 'border-dashed'],
  ])('[divider.variant] %o → %s', (props, expected) => {
    const el = plain(props)
    expect(classes(el)).toContain(expected)
    expect(classes(el).filter(name => /^border-(solid|dashed|dotted)$/.test(name))).toHaveLength(1)
  })

  // 带标题时 variant 作用在两段 rail 上。
  it('[divider.variant.title] applies the variant to both rails', () => {
    const { start, end } = titled({ variant: 'dotted' })
    for (const rail of [start, end]) expect(classes(rail)).toContain('border-dotted')
  })

  // size 只作用于水平分割线：small 8px、middle/medium 16px、large 与默认一致。
  it.each<[DividerProps, string]>([
    [{ size: 'small' }, 'my-xs'], [{ size: 'middle' }, 'my-md'], [{ size: 'medium' }, 'my-md'], [{ size: 'large' }, 'my-lg'],
  ])('[divider.size] %o → %s', (props, expected) => {
    expect(classes(plain(props))).toContain(expected)
    expect(classes(titled(props).root)).toContain(expected === 'my-lg' ? 'my-md' : expected)
  })

  // 垂直分割线不受 size 影响，仍为左右 8px。
  it('[divider.size.vertical] vertical dividers ignore size', () => {
    const el = plain({ vertical: true, size: 'small' })
    expect(classes(el)).toContain('mx-xs')
    expect(classes(el).some(name => name.startsWith('my-'))).toBe(false)
  })
})

describe('Divider 宿主', () => {
  // class 经 twMerge 合并：用户 my-0 覆盖默认外边距；style 与原生属性、ref 透传。
  it('[divider.attrs] merges classes and passes attributes, events and ref', () => {
    const onClick = vi.fn()
    let ref: HTMLDivElement | undefined
    const el = render(() => <Divider ref={r => { ref = r }} class="my-0" style={{ color: 'red' }} id="d" data-testid="divider" aria-label="分组" onClick={onClick} plain dashed />).firstElementChild as HTMLElement
    expect(ref).toBe(el)
    expect(classes(el)).toContain('my-0')
    expect(classes(el)).not.toContain('my-lg')
    expect(el.style.color).toBe('red')
    expect(el.id).toBe('d')
    expect(el.dataset.testid).toBe('divider')
    expect(el.getAttribute('aria-label')).toBe('分组')
    for (const name of ['plain', 'dashed', 'type', 'orientation', 'variant']) expect(el.hasAttribute(name)).toBe(false)
    el.click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  // antd 对齐：rail 的线色继承 root，所以在带标题的 Divider 上用 class 改线色时，root 的颜色类替换默认色、两段 rail 跟随。
  it('[divider.rail.inheritColor] rails inherit the root border color', () => {
    const { root, start, end } = titled({ class: 'border-primary' })
    expect(classes(root)).toContain('border-primary')
    expect(classes(root)).not.toContain('border-outline-variant/40')
    for (const rail of [start, end]) {
      expect(classes(rail)).toContain('border-[inherit]')
      expect(classes(rail).some(name => name.startsWith('border-outline'))).toBe(false)
    }
    // classNames.rail 的颜色类替换继承类，而不是与之并存（并存时由生成顺序决定胜负）。
    const custom = titled({ classNames: { rail: 'border-primary/60' } })
    for (const rail of [custom.start, custom.end]) {
      expect(classes(rail)).toContain('border-primary/60')
      expect(classes(rail)).not.toContain('border-[inherit]')
    }
  })

  // classNames/styles 语义化定制 root、rail、content。
  it('[divider.semantic] applies classNames and styles to root, rail and content', () => {
    const { root, start, content, end } = (() => {
      const r = render(() => (
        <Divider classNames={{ root: 'root-x', rail: 'rail-x', content: 'content-x' }}
          styles={{ root: { padding: '1px' }, rail: { opacity: '0.5' }, content: { color: 'blue' } }}>T</Divider>
      )).firstElementChild as HTMLElement
      const [s, c, e] = [...r.children] as HTMLElement[]
      return { root: r, start: s, content: c, end: e }
    })()
    expect(classes(root)).toContain('root-x')
    expect(root.style.padding).toBe('1px')
    for (const rail of [start, end]) { expect(classes(rail)).toContain('rail-x'); expect(rail.style.opacity).toBe('0.5') }
    expect(classes(content)).toContain('content-x')
    expect(content.style.color).toBe('blue')
  })
})
