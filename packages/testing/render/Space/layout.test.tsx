import { createSignal, flush, For } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Space, { Compact, type SpaceProps } from '../../../components/lib/Space'
import Input from '../../../components/lib/Input'
import Select from '../../../components/lib/Select'
import { mount } from '../../utils/mount'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {} })

const render = (factory: Parameters<typeof mount>[0]) => {
  const mounted = mount(factory)
  cleanup = mounted.dispose
  return mounted.host
}
const classes = (el: Element) => el.className.split(/\s+/).filter(Boolean)
const view = (props: SpaceProps = {}) =>
  render(() => <Space {...props}><span>A</span><span>B</span></Space>).firstElementChild as HTMLElement
const items = (root: Element) => [...root.children].filter(child => child.classList.contains('space-item'))
const separators = (root: Element) => [...root.children].filter(child => child.classList.contains('space-separator'))

describe('Space 布局', () => {
  // 默认水平 inline-flex、small 间距（8px）、交叉轴居中；每个子节点包一层可在空时隐藏的 item。
  it('[space.defaults] renders an inline horizontal row with small gap', () => {
    const el = view()
    expect(classes(el)).toEqual(expect.arrayContaining(['inline-flex', 'flex-row', 'items-center', 'gap-xs']))
    expect(classes(el)).not.toContain('flex-wrap')
    expect(items(el).map(item => item.textContent)).toEqual(['A', 'B'])
    expect(items(el).every(item => classes(item).includes('empty:hidden'))).toBe(true)
    expect(separators(el)).toHaveLength(0)
  })

  // 方向：orientation 优先于 vertical，vertical 优先于旧 direction；纵向默认不设交叉轴对齐（stretch）。
  it.each<[SpaceProps, 'flex-row' | 'flex-col']>([
    [{ direction: 'vertical' }, 'flex-col'],
    [{ vertical: true }, 'flex-col'],
    [{ orientation: 'vertical' }, 'flex-col'],
    [{ orientation: 'horizontal', vertical: true }, 'flex-row'],
    [{ vertical: false, direction: 'vertical' }, 'flex-row'],
    [{ orientation: 'bogus' as never, vertical: true }, 'flex-col'],
  ])('[space.orientation] %o → %s', (props, expected) => {
    const el = view(props)
    expect(classes(el)).toContain(expected)
    if (expected === 'flex-col') expect(classes(el).some(name => name.startsWith('items-'))).toBe(false)
  })

  // align 显式值覆盖水平默认的居中，纵向时同样生效。
  it.each<[SpaceProps, string]>([
    [{ align: 'start' }, 'items-start'], [{ align: 'end' }, 'items-end'], [{ align: 'baseline' }, 'items-baseline'],
    [{ align: 'center', vertical: true }, 'items-center'], [{ align: 'end', direction: 'vertical' }, 'items-end'],
  ])('[space.align] %o → %s', (props, expected) => {
    const el = view(props)
    expect(classes(el)).toContain(expected)
    expect(classes(el).filter(name => name.startsWith('items-'))).toHaveLength(1)
  })

  // 预设尺寸走主题间距类，medium 是 middle 的别名。
  it.each<[SpaceProps['size'], string[]]>([
    ['small', ['gap-xs']], ['middle', ['gap-md']], ['medium', ['gap-md']], ['large', ['gap-lg']],
    [['small', 'large'], ['gap-x-xs', 'gap-y-lg']], [['medium', 'middle'], ['gap-x-md', 'gap-y-md']],
  ])('[space.size.preset] size=%o → %o', (size, expected) => {
    const el = view({ size })
    expect(classes(el)).toEqual(expect.arrayContaining(expected))
    expect(el.getAttribute('style') ?? '').toBe('')
  })

  // 数字按 px、其他字符串原样写入内联间距；0 同样生效；数组形式分别写 column-gap/row-gap。
  it('[space.size.custom] writes numeric and string sizes inline', () => {
    expect(view({ size: 20 }).style.gap).toBe('20px')
    expect(view({ size: 0 }).style.gap).toBe('0px')
    expect(view({ size: '2rem' }).style.gap).toBe('2rem')
    const mixed = view({ size: [10, 'middle'] })
    expect(mixed.style.columnGap).toBe('10px')
    expect(classes(mixed)).toContain('gap-y-md')
    expect(classes(mixed).some(name => /^gap-(xs|md|lg)$/.test(name))).toBe(false)
    const both = view({ size: ['1em', 4] })
    expect(both.style.columnGap).toBe('1em')
    expect(both.style.rowGap).toBe('4px')
  })

  // 原型链上的键名（constructor 等）不能被当作预设档位。
  it('[space.size.proto] does not treat prototype keys as presets', () => {
    const el = view({ size: 'constructor' as never })
    expect(classes(el).some(name => name.startsWith('gap-'))).toBe(false)
  })

  // wrap 允许换行；block 撑满父容器宽度。
  it('[space.wrap-block] supports wrap and block', () => {
    expect(classes(view({ wrap: true }))).toContain('flex-wrap')
    const block = view({ block: true })
    expect(classes(block)).toEqual(expect.arrayContaining(['flex', 'w-full']))
    expect(classes(block)).not.toContain('inline-flex')
  })
})

describe('Space 分隔符与子节点', () => {
  // split 在每两个相邻子节点之间各渲染一个独立分隔节点（JSX 分隔符每处都是新节点，不会被移动）。
  it('[space.split] renders a separator between every pair of items', () => {
    const host = render(() => <Space split={<i>|</i>}><span>A</span><span>B</span><span>C</span></Space>)
    const root = host.firstElementChild as HTMLElement
    expect([...root.children].map(child => child.textContent)).toEqual(['A', '|', 'B', '|', 'C'])
    expect(separators(root)).toHaveLength(2)
    expect(separators(root)[0].firstElementChild).not.toBe(separators(root)[1].firstElementChild)
  })

  // separator 是 antd 6 的新名称，与 split 等价；两者同时传入时 separator 优先。
  it('[space.separator] accepts the antd 6 separator alias', () => {
    const host = render(() => <Space separator="/" split="|"><span>A</span><span>B</span></Space>)
    expect(host.textContent).toBe('A/B')
  })

  // null/undefined/布尔/空串子节点被忽略，不产生空 item 和多余分隔符；数字 0 保留。
  it('[space.children.filter] skips empty children', () => {
    const host = render(() => <Space split="|">{null}<span>A</span>{false}{undefined}{true}{''}{0}<span>B</span>{null}</Space>)
    const root = host.firstElementChild as HTMLElement
    expect(items(root).map(item => item.textContent)).toEqual(['A', '0', 'B'])
    expect(separators(root)).toHaveLength(2)
  })

  // 没有任何有效子节点时不渲染容器（antd 返回 null）。
  it('[space.children.empty] renders nothing without children', () => {
    const host = render(() => <Space split="|">{null}{false}</Space>)
    expect(host.childElementCount).toBe(0)
  })

  // 动态列表增删时 item 与分隔符数量同步。
  it('[space.children.reactive] follows dynamic children', () => {
    const [list, setList] = createSignal(['A'])
    const host = render(() => <Space split="|"><For each={list()}>{item => <span>{item}</span>}</For></Space>)
    expect(host.textContent).toBe('A')
    setList(['A', 'B', 'C']); flush()
    expect(host.textContent).toBe('A|B|C')
    setList(['C']); flush()
    expect(host.textContent).toBe('C')
  })

  // classNames/styles 语义化定制 root、item、separator。
  it('[space.semantic] applies classNames and styles to root, item and separator', () => {
    const host = render(() => (
      <Space split="|" class="mt-2" style={{ color: 'red' }}
        classNames={{ root: 'root-x', item: 'item-x', separator: 'sep-x' }}
        styles={{ root: { padding: '1px' }, item: { margin: '2px' }, separator: { opacity: '0.5' } }}>
        <span>A</span><span>B</span>
      </Space>
    ))
    const root = host.firstElementChild as HTMLElement
    expect(classes(root)).toEqual(expect.arrayContaining(['mt-2', 'root-x']))
    expect(root.style.color).toBe('red')
    expect(root.style.padding).toBe('1px')
    expect(items(root).every(item => item.classList.contains('item-x') && (item as HTMLElement).style.margin === '2px')).toBe(true)
    expect(separators(root)[0].classList.contains('sep-x')).toBe(true)
    expect((separators(root)[0] as HTMLElement).style.opacity).toBe('0.5')
  })

  // 原生属性、事件与 ref 透传到根元素，布局 props 不泄漏为 attribute。
  it('[space.attrs] passes native attributes, events and ref to the root', () => {
    const onClick = vi.fn()
    let ref: HTMLDivElement | undefined
    const host = render(() => <Space ref={el => { ref = el }} id="toolbar" role="toolbar" aria-label="操作" data-testid="space" onClick={onClick} size="large" wrap><span>A</span></Space>)
    const root = host.firstElementChild as HTMLElement
    expect(ref).toBe(root)
    expect(root.id).toBe('toolbar')
    expect(root.getAttribute('role')).toBe('toolbar')
    expect(root.getAttribute('aria-label')).toBe('操作')
    expect(root.dataset.testid).toBe('space')
    for (const name of ['size', 'wrap', 'split', 'align']) expect(root.hasAttribute(name)).toBe(false)
    ;(root.querySelector('span') as HTMLElement).click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('Space.Compact 与 Space.Addon', () => {
  // Compact 默认水平紧凑：去掉内侧圆角、相邻重叠 1px；悬停/聚焦的子项提升层级，避免边框被邻居盖住。
  it('[space.compact.defaults] joins children and lifts the active one', () => {
    const host = render(() => <Compact><button>A</button><button>B</button></Compact>)
    const root = host.firstElementChild as HTMLElement
    expect(classes(root)).toEqual(expect.arrayContaining([
      'inline-flex', 'flex-row', '[&>*:not(:first-child)]:-ml-px',
      '[&>*:first-child:not(:last-child)]:!rounded-r-none', '[&>*:hover]:z-1', '[&>*:focus-within]:z-1', '[&>*:focus]:z-1',
    ]))
    expect(Space.Compact).toBe(Compact)
  })

  // Compact 纵向同样遵循 orientation > vertical > direction；block 撑满宽度。
  it.each<[Parameters<typeof Compact>[0], string]>([
    [{ direction: 'vertical' }, 'flex-col'], [{ vertical: true }, 'flex-col'], [{ orientation: 'vertical' }, 'flex-col'],
    [{ orientation: 'horizontal', vertical: true }, 'flex-row'],
  ])('[space.compact.orientation] %o → %s', (props, expected) => {
    const root = render(() => <Compact {...props}><button>A</button><button>B</button></Compact>).firstElementChild as HTMLElement
    expect(classes(root)).toContain(expected)
    if (expected === 'flex-col') expect(classes(root)).toContain('[&>*:not(:first-child)]:-mt-px')
  })

  // Compact 透传原生属性与 ref，block 为块级。
  it('[space.compact.attrs] passes attributes and supports block', () => {
    let ref: HTMLDivElement | undefined
    const root = render(() => <Compact ref={el => { ref = el }} block role="group" aria-label="搜索" class="mt-1"><button>A</button></Compact>).firstElementChild as HTMLElement
    expect(ref).toBe(root)
    expect(root.getAttribute('role')).toBe('group')
    expect(root.getAttribute('aria-label')).toBe('搜索')
    expect(classes(root)).toEqual(expect.arrayContaining(['flex', 'w-full', 'mt-1']))
    expect(root.hasAttribute('block')).toBe(false)
  })

  // 无前后缀的 Input 边框画在内部 input 上：根 span 持有 rounded、input 用 rounded-[inherit] 继承，
  // Compact 对根 span 的 !rounded-r-none 才能传到真正的边框（回归：此前内部 input 自带 rounded，圆角去不掉）。
  it('[space.compact.input] plain Input frame inherits the root radius', () => {
    const host = render(() => <Compact><Input placeholder="搜索" /><button>Go</button></Compact>)
    const root = host.querySelector('input')!.parentElement as HTMLElement
    expect(root.parentElement?.getAttribute('class')).toContain('[&>*:first-child:not(:last-child)]:!rounded-r-none')
    expect(classes(root)).toContain('rounded')
    const input = classes(host.querySelector('input')!)
    expect(input).toContain('rounded-[inherit]')
    expect(input).not.toContain('rounded')
  })

  // Select 同理：边框画在内部 combobox 上，圆角须继承根节点，Compact 才能去掉内侧圆角。
  it('[space.compact.select] Select frame inherits the root radius', () => {
    const host = render(() => <Compact><Select options={[{ label: '浙江', value: 'zj' }]} /><button>Go</button></Compact>)
    const combobox = host.querySelector('[role="combobox"]') as HTMLElement
    const root = combobox.parentElement as HTMLElement
    expect(root.parentElement?.firstElementChild).toBe(root)
    expect(classes(root)).toContain('rounded')
    expect(classes(combobox)).toContain('rounded-[inherit]')
    expect(classes(combobox)).not.toContain('rounded')
  })

  // Addon 是紧凑组合里的带边框文本单元，可与按钮/输入框拼接。
  it('[space.addon] renders a bordered addon cell', () => {
    const host = render(() => <Compact><Space.Addon class="font-bold" data-testid="addon">https://</Space.Addon><button>Go</button></Compact>)
    const addon = host.querySelector('[data-testid="addon"]') as HTMLElement
    expect(addon.textContent).toBe('https://')
    expect(classes(addon)).toEqual(expect.arrayContaining(['inline-flex', 'items-center', 'border', 'border-outline', 'font-bold']))
  })
})
