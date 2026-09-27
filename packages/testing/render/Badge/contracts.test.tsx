import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it } from 'vitest'
import Badge, { BadgeRibbon, type BadgeProps } from '../../../components/lib/Badge'
import { mount } from '../../utils/mount'

let view: ReturnType<typeof mount>
afterEach(() => view?.dispose())
const root = () => view.host.firstElementChild as HTMLElement
const indicator = (el: Element = root()) => el.querySelector<HTMLElement>('[data-show]')
const classes = (el: Element) => el.className.split(/\s+/)

describe('Badge DOM contracts', () => {
  // 包裹模式的数字：文本、封顶显示、默认 title 取原始 count，自定义 title 与 null/false 移除。
  it('[badge.count] pill text and title', () => {
    view = mount(() => <>
      <Badge count={100}><i /></Badge>
      <Badge count={5} title="五条"><i /></Badge>
      <Badge count={5} title={null}><i /></Badge>
      <Badge count={5} title={false}><i /></Badge>
    </>)
    const pills = [...view.host.children].map(el => indicator(el)!)
    expect(pills[0].textContent).toBe('99+'); expect(pills[0].title).toBe('100')
    expect(pills[0].getAttribute('data-show')).toBe('true')
    expect(pills[1].title).toBe('五条')
    expect(pills[2].hasAttribute('title')).toBe(false); expect(pills[3].hasAttribute('title')).toBe(false)
    expect(classes(pills[0])).toEqual(expect.arrayContaining(['absolute', 'top-0', 'right-0', 'translate-x-1/2', '-translate-y-1/2', 'bg-error', 'text-[#fff]', 'ring-1', 'ring-surface']))
  })

  // 包裹模式隐藏时保留节点播放缩放离场：data-show=false、aria-hidden、无 title，内容停留在最后一次可见值；节点不重建。
  it('[badge.hidden.wrapped] leave animation keeps the node and last content', () => {
    const [count, setCount] = createSignal(5, { ownedWrite: true })
    view = mount(() => <Badge count={count()}><i /></Badge>)
    const pill = indicator()!
    setCount(0); flush()
    expect(indicator()).toBe(pill)
    expect([pill.dataset.show, pill.getAttribute('aria-hidden'), pill.hasAttribute('title'), pill.textContent]).toEqual(['false', 'true', false, '5'])
    expect(classes(pill)).toEqual(expect.arrayContaining(['opacity-0', 'scale-0', 'pointer-events-none']))
    setCount(12); flush()
    expect(indicator()).toBe(pill)
    expect([pill.dataset.show, pill.hasAttribute('aria-hidden'), pill.textContent]).toEqual(['true', false, '12'])
    expect(classes(pill)).toEqual(expect.arrayContaining(['opacity-100', 'scale-100', 'px-[8px]']))
  })

  // 独立使用：相对定位、无位移；隐藏即移除不占位；showZero 显示 0。
  it('[badge.standalone] standalone pill flows inline and unmounts when hidden', () => {
    const [count, setCount] = createSignal(3, { ownedWrite: true })
    view = mount(() => <><Badge count={count()} /><Badge count={0} showZero /></>)
    const [first, second] = [...view.host.children] as HTMLElement[]
    expect(classes(indicator(first)!)).toEqual(expect.arrayContaining(['relative']))
    expect(classes(indicator(first)!)).not.toContain('absolute')
    expect(classes(first)).toContain('align-middle')
    setCount(0); flush()
    expect(indicator(first)).toBeNull()
    expect(indicator(second)!.textContent).toBe('0')
  })

  // 点模式：6px 无文字；零值隐藏；dot 动态关闭时点节点常驻并淡出。
  it('[badge.dot] dot rendering and dynamic toggle', () => {
    const [dot, setDot] = createSignal(true, { ownedWrite: true })
    view = mount(() => <><Badge dot={dot()}><i /></Badge><Badge dot count={0}><i /></Badge><Badge dot count={5}><i /></Badge></>)
    const [toggle, zero, withCount] = [...view.host.children] as HTMLElement[]
    const point = indicator(toggle)!
    expect(classes(point)).toEqual(expect.arrayContaining(['w-[6px]', 'h-[6px]', 'rounded-full', 'bg-error']))
    expect(point.textContent).toBe('')
    expect(indicator(zero)!.dataset.show).toBe('false')
    expect(indicator(withCount)!.title).toBe('5'); expect(indicator(withCount)!.textContent).toBe('')
    setDot(false); flush()
    expect(indicator(toggle)).toBe(point)
    expect(point.dataset.show).toBe('false')
  })

  // 状态点：根节点承载 style/offset，文本继承 style.color；processing 有脉冲环；indicator 语义化类名落在状态点上。
  it('[badge.status] status badge root, text and processing ring', () => {
    view = mount(() => <>
      <Badge status="processing" text="运行中" style={{ color: 'red' }} offset={[4, 2]} classNames={{ indicator: 'dot-x' }} />
      <Badge status="success" />
      <Badge color="pink" text="粉" />
      <Badge color="#f50" text="#f50" />
    </>)
    const [processing, success, pink, custom] = [...view.host.children] as HTMLElement[]
    expect([processing.style.color, processing.style.right, processing.style.marginTop]).toEqual(['red', '-4px', '2px'])
    const dot = processing.firstElementChild as HTMLElement
    expect(classes(dot)).toEqual(expect.arrayContaining(['bg-primary', 'after:animate-badge-processing', 'dot-x']))
    expect((processing.lastElementChild as HTMLElement).style.color).toBe('red')
    expect(processing.textContent).toBe('运行中')
    expect(success.children).toHaveLength(1)
    expect(classes(success.firstElementChild!)).toContain('bg-[#52c41a]')
    expect(classes(pink.firstElementChild!)).toContain('bg-[#eb2f96]')
    const customDot = custom.firstElementChild as HTMLElement
    expect([customDot.style.backgroundColor, customDot.style.color]).toEqual(['#f50', '#f50'])
    for (const el of [processing, success]) expect(indicator(el)).toBeNull()
  })

  // 仅有 color 且 count=0（无 showZero、无文本）：与 antd 一致什么也不画。
  it('[badge.status.zero-color] color with a suppressed zero renders nothing', () => {
    view = mount(() => <Badge color="red" count={0} />)
    expect(root().children).toHaveLength(0)
  })

  // 非状态模式：style 作用于徽标节点，class/classNames.root/styles.root 作用于根节点；offset 写入 right/margin-top。
  it('[badge.style.routing] style goes to the indicator, root slots to the root', () => {
    view = mount(() => <Badge count={5} class="own" classNames={{ root: 'root-x', indicator: 'ind-x' }} styles={{ root: { padding: '1px' }, indicator: { color: 'yellow' } }} style={{ 'background-color': 'transparent' }} offset={[10, 10]}><i /></Badge>)
    const el = root(), pill = indicator()!
    expect(classes(el)).toEqual(expect.arrayContaining(['own', 'root-x']))
    expect(el.style.padding).toBe('1px'); expect(el.style.backgroundColor).toBe('')
    expect([pill.style.backgroundColor, pill.style.color, pill.style.right, pill.style.marginTop]).toEqual(['transparent', 'yellow', '-10px', '10px'])
    expect(pill.className).toContain('ind-x')
  })

  // 自定义节点：只实例化一次，不画数字底色/描边，接收 offset 与 style，无默认 title。
  it('[badge.custom.node] custom count node without the pill', () => {
    let created = 0
    const Clock = () => { created++; return <i class="clock" /> }
    view = mount(() => <Badge count={<Clock />} style={{ color: 'red' }} offset={[2, 3]}><b /></Badge>)
    expect(created).toBe(1)
    const node = indicator()!
    expect(node.querySelector('.clock')).not.toBeNull()
    expect(classes(node)).not.toContain('bg-error'); expect(classes(node)).not.toContain('ring-1')
    expect(classes(node)).toEqual(expect.arrayContaining(['absolute', 'translate-x-1/2']))
    expect([node.style.color, node.style.right, node.style.marginTop]).toEqual(['red', '-2px', '3px'])
    expect(node.hasAttribute('title')).toBe(false)
  })

  // 颜色：预设色板类、自定义色内联且保留描边、数字忽略 status、点使用 status、本库 gray。
  it('[badge.color.dom] indicator colors', () => {
    view = mount(() => <>
      <Badge count={1} color="volcano"><i /></Badge>
      <Badge count={1} color="#52c41a" style={{ 'background-color': 'black' }}><i /></Badge>
      <Badge count={1} status="success"><i /></Badge>
      <Badge dot status="warning"><i /></Badge>
      <Badge count={1} color="gray"><i /></Badge>
    </>)
    const [preset, custom, statusCount, statusDot, gray] = [...view.host.children].map(el => indicator(el)!)
    expect(classes(preset)).toContain('bg-[#fa541c]')
    expect(custom.style.backgroundColor).toBe('#52c41a'); expect(classes(custom)).toContain('ring-1')
    expect(classes(statusCount)).toContain('bg-error')
    expect(classes(statusDot)).toContain('bg-[#faad14]')
    expect(classes(gray)).toContain('bg-on-surface/25')
  })

  // 尺寸：small 14px/12px 字号；medium 是 middle 的别名；单字符无内边距，多字符 8px。
  it('[badge.size] small, medium alias and multiple words', () => {
    view = mount(() => <><Badge count={5} size="small"><i /></Badge><Badge count={5} size="medium"><i /></Badge><Badge count={25} size="small"><i /></Badge></>)
    const [small, medium, words] = [...view.host.children].map(el => indicator(el)!)
    expect(classes(small)).toEqual(expect.arrayContaining(['h-[14px]', 'min-w-[14px]', 'text-[12px]', 'leading-[14px]']))
    expect(classes(small).some(name => name.startsWith('px-'))).toBe(false)
    expect(classes(medium)).toEqual(expect.arrayContaining(['h-[20px]', 'min-w-[20px]']))
    expect(classes(words)).toContain('px-[8px]')
  })

  // 子元素只实例化一次；原生属性与 ref 落在根节点；style.borderColor 以内嵌阴影模拟描边。
  it('[badge.attrs] children once, native attributes, ref and border shadow', () => {
    let created = 0, element: HTMLElement | undefined
    const Child = () => { created++; return <i /> }
    view = mount(() => <Badge ref={el => { element = el }} id="b" data-x="1" aria-label="消息" count={4} style={{ 'border-color': '#d9d9d9' }}><Child /></Badge>)
    expect(created).toBe(1)
    const el = root()
    expect(element).toBe(el)
    expect([el.id, el.dataset.x, el.getAttribute('aria-label')]).toEqual(['b', '1', '消息'])
    expect(indicator()!.style.boxShadow).toBe('0 0 0 1px #d9d9d9 inset')
  })

  // Solid 2 rc 的唯一动态子节点会丢弃数字 0：数字 0、showZero 文本 0 都必须真实显示。
  it('[badge.zero.render] numeric zero is rendered as text', () => {
    view = mount(() => <><Badge count={0} showZero><i /></Badge><Badge status="error" text={0} showZero /></>)
    const [count, status] = [...view.host.children] as HTMLElement[]
    expect(indicator(count)!.textContent).toBe('0')
    expect(status.textContent).toBe('0')
  })

  // 包裹子元素时 text 同样渲染在子元素之后。
  it('[badge.text.wrapped] text renders after children in wrapper mode', () => {
    view = mount(() => <Badge count={3} text="提示"><b>X</b></Badge>)
    expect(root().lastElementChild!.textContent).toBe('提示')
  })

  // 模式切换：状态点 ↔ 数字；数字变化不重建节点。
  it('[badge.dynamic.mode] switches between status and count', () => {
    const [props, setProps] = createSignal<BadgeProps>({ status: 'success', text: '在线' }, { ownedWrite: true })
    view = mount(() => <Badge {...props()} />)
    expect(root().textContent).toBe('在线')
    setProps({ count: 8 }); flush()
    const pill = indicator()!
    expect(pill.textContent).toBe('8')
    setProps({ count: 9 }); flush()
    expect(indicator()).toBe(pill); expect(pill.textContent).toBe('9')
  })
})

describe('BadgeRibbon DOM contracts', () => {
  // 默认主题主色、end 方位；start 方位；预设色板；自定义色内联底色与 color（折角取 currentColor）。
  it('[ribbon.color] placement and colors', () => {
    view = mount(() => <>
      <BadgeRibbon text="默认"><div>A</div></BadgeRibbon>
      <BadgeRibbon text="左" placement="start" color="volcano"><div>B</div></BadgeRibbon>
      <BadgeRibbon text="自定义" color="#123456"><div>C</div></BadgeRibbon>
    </>)
    const ribbons = [...view.host.children].map(el => el.lastElementChild as HTMLElement)
    expect(classes(ribbons[0])).toEqual(expect.arrayContaining(['bg-primary', 'text-primary', 'right-[-8px]']))
    expect(classes(ribbons[1])).toEqual(expect.arrayContaining(['bg-[#fa541c]', 'text-[#fa541c]', 'left-[-8px]']))
    expect([ribbons[2].style.backgroundColor, ribbons[2].style.color]).toEqual(['#123456', '#123456'])
    expect(ribbons[0].firstElementChild!.className).toContain('text-[#fff]')
    expect(ribbons.map(el => el.textContent)).toEqual(['默认', '左', '自定义'])
  })

  // 与 antd 一致：class/style 作用于缎带节点；classNames/styles 分别作用于 root/indicator/content。
  it('[ribbon.semantic] class/style target the ribbon, slots target their parts', () => {
    view = mount(() => <BadgeRibbon text="T" class="own" style={{ top: '4px' }}
      classNames={{ root: 'r', indicator: 'i', content: 'c' }}
      styles={{ root: { padding: '1px' }, indicator: { opacity: '0.9' }, content: { 'font-weight': '600' } }}><div>A</div></BadgeRibbon>)
    const wrapper = root(), ribbon = wrapper.lastElementChild as HTMLElement, content = ribbon.firstElementChild as HTMLElement
    expect(classes(wrapper)).toEqual(expect.arrayContaining(['relative', 'r'])); expect(classes(wrapper)).not.toContain('own')
    expect(wrapper.style.padding).toBe('1px')
    expect(classes(ribbon)).toEqual(expect.arrayContaining(['own', 'i']))
    expect([ribbon.style.top, ribbon.style.opacity]).toEqual(['4px', '0.9'])
    expect(content.className).toContain('c'); expect(content.style.fontWeight).toBe('600')
  })
})
