import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it } from 'vitest'
import Timeline, { type TimelineItemProps } from '../../../components/lib/Timeline'
import { mount } from '../../utils/mount'

let view: ReturnType<typeof mount>
afterEach(() => view?.dispose())
const root = (host: Element = view.host) => host.firstElementChild as HTMLElement
const items = (el: Element = root()) => [...el.querySelectorAll<HTMLElement>(':scope > li')]
const part = (el: Element, name: string) => el.querySelector<HTMLElement>(`[data-timeline-part="${name}"]`)
const classes = (el: Element | null) => (el?.getAttribute('class') ?? '').split(/\s+/)
const four: TimelineItemProps[] = [{ content: 'a' }, { content: 'b' }, { content: 'c' }, { content: 'd' }]

describe('Timeline DOM contracts', () => {
  // 默认：ol > li，结构 wrapper > icon + section > header（rail）+ content；最后一项无导轨；outlined 蓝色圆点。
  it('[timeline.default] default structure and outlined dots', () => {
    view = mount(() => <Timeline items={four} />)
    expect(root().tagName).toBe('OL')
    expect([root().dataset.timelineOrientation, root().dataset.timelineMode, root().dataset.timelineAlternate]).toEqual(['vertical', 'start', 'false'])
    const list = items()
    expect(list.map(li => li.textContent)).toEqual(['a', 'b', 'c', 'd'])
    const [first] = list
    const wrapper = first.firstElementChild as HTMLElement
    expect(wrapper.dataset.timelinePart).toBe('wrapper')
    expect([...wrapper.children].map(el => (el as HTMLElement).dataset.timelinePart)).toEqual(['icon', 'section'])
    expect([...part(first, 'section')!.children].map(el => (el as HTMLElement).dataset.timelinePart)).toEqual(['header', 'content'])
    expect(list.map(li => !!part(li, 'rail'))).toEqual([true, true, true, false])
    expect(list.every(li => li.dataset.timelineStatus === 'finish' && li.dataset.timelinePlacement === 'start')).toBe(true)
    expect(classes(part(first, 'icon'))).toEqual(expect.arrayContaining(['w-[10px]', 'h-[10px]', 'border-2', 'border-primary', 'bg-transparent', 'mt-[7px]']))
    expect(classes(first)).toEqual(expect.arrayContaining(['min-h-[48px]', 'pb-[12px]']))
    expect(part(first, 'title')).toBeNull()
    expect(classes(part(first, 'content'))).toContain('mt-[1px]')
    expect(root().style.getPropertyValue('--ut-tl-span')).toBe('calc(12 / 24 * 100%)')
  })

  // variant=filled：预设色填充；自定义颜色写内联属性；自定义图标去边框。
  it('[timeline.colors] preset, custom colors and variants', () => {
    view = mount(() => <>
      <Timeline variant="filled" items={[{ content: 'a', color: 'red' }, { content: 'b', color: '#00ccff' }]} />
      <Timeline items={[{ content: 'a', color: 'green' }, { content: 'b', color: '#00ccff' }, { content: 'c', color: 'gray', icon: <i>i</i> }]} />
    </>)
    const [filled, outlined] = [...view.host.children]
    const [fa, fb] = items(filled)
    expect(classes(part(fa, 'icon'))).toEqual(expect.arrayContaining(['bg-error', 'border-transparent']))
    expect(fa.dataset.timelineColor).toBe('red')
    expect(fb.dataset.timelineColor).toBe('custom')
    expect(part(fb, 'icon')!.style.backgroundColor).toBe('#00ccff')
    const [oa, ob, oc] = items(outlined)
    expect(classes(part(oa, 'icon'))).toEqual(expect.arrayContaining(['border-[#52c41a]', 'bg-transparent']))
    expect(part(ob, 'icon')!.style.borderColor).toBe('#00ccff')
    expect(part(ob, 'icon')!.style.backgroundColor).toBe('')
    expect(classes(part(oc, 'icon'))).toEqual(expect.arrayContaining(['border-0', 'text-on-surface/25', 'text-[12px]']))
    expect(part(oc, 'icon')!.innerHTML).toBe('<i>i</i>')
  })

  // 旧字段：label / children / dot / position 回落；mode left / right 映射到 start / end。
  it('[timeline.legacy] legacy item fields and modes', () => {
    view = mount(() => <>
      <Timeline mode="right" items={[{ label: 'L', children: 'C', dot: <b>D</b> }]} />
      <Timeline mode="left" items={[{ children: 'C', position: 'end' }]} />
    </>)
    const [right, left] = [...view.host.children] as HTMLElement[]
    expect(right.dataset.timelineMode).toBe('end')
    const [item] = items(right)
    expect([part(item, 'title')!.textContent, part(item, 'content')!.textContent, part(item, 'icon')!.innerHTML]).toEqual(['L', 'C', '<b>D</b>'])
    expect(item.dataset.timelinePlacement).toBe('end')
    expect(left.dataset.timelineMode).toBe('start')
    expect(items(left)[0].dataset.timelinePlacement).toBe('end')
  })

  // loading：状态 process + 加载图标；pending 追加节点（在 reverse 之前），pendingDot 替换图标。
  it('[timeline.pending] loading item, pending node and pendingDot', () => {
    view = mount(() => <>
      <Timeline items={[{ content: 'a' }, { content: 'b', loading: true }]} />
      <Timeline pending="Recording..." items={[{ content: 'a' }]} />
      <Timeline pending="Recording..." pendingDot="🔴" items={[{ content: 'a' }]} />
    </>)
    const [loading, pending, dotted] = [...view.host.children]
    const [, b] = items(loading)
    expect(b.dataset.timelineStatus).toBe('process')
    expect(part(b, 'icon')!.querySelector('[aria-label="loading"]')).not.toBeNull()
    expect(classes(part(b, 'icon'))).toContain('border-0')
    expect(part(items(loading)[0], 'rail')!.dataset.timelineRail).toBe('process')
    const pendingItems = items(pending)
    expect(pendingItems.map(li => li.textContent)).toEqual(['a', 'Recording...'])
    expect(pendingItems[1].dataset.timelinePending).toBe('true')
    expect(part(pendingItems[1], 'icon')!.querySelector('[aria-label="loading"]')).not.toBeNull()
    const dottedItems = items(dotted)
    expect(part(dottedItems[1], 'icon')!.textContent).toBe('🔴')
    expect(part(dottedItems[1], 'icon')!.querySelector('[aria-label="loading"]')).toBeNull()
  })

  // reverse：顺序倒转且响应式切换；导轨状态改为跟随自身。
  it('[timeline.reverse] reverse toggles order and rail status', () => {
    const [reverse, setReverse] = createSignal(false)
    view = mount(() => <Timeline reverse={reverse()} items={[{ content: 'a' }, { content: 'b' }, { content: 'c', loading: true }]} />)
    expect(items().map(li => li.textContent)).toEqual(['a', 'b', 'c'])
    expect(part(items()[1], 'rail')!.dataset.timelineRail).toBe('process')
    setReverse(true); flush()
    expect(items().map(li => li.textContent)).toEqual(['c', 'b', 'a'])
    expect(part(items()[0], 'rail')!.dataset.timelineRail).toBe('process')
    expect(part(items()[1], 'rail')!.dataset.timelineRail).toBe('finish')
    expect(items().map(li => !!part(li, 'rail'))).toEqual([true, true, false])
  })

  // 交替：奇偶 placement，圆点 / 导轨定位到 --ut-tl-span；end 项反向。纵向含 title 也进入交替布局。
  it('[timeline.alternate] alternate placement and titled layout', () => {
    view = mount(() => <>
      <Timeline mode="alternate" titleSpan={6} items={four} />
      <Timeline titleSpan="100px" items={[{ title: 't', content: 'a' }, { content: 'b' }]} />
      <Timeline mode="end" titleSpan={18} items={[{ title: 't', content: 'a' }]} />
    </>)
    const [alt, titled, end] = [...view.host.children] as HTMLElement[]
    expect(alt.dataset.timelineAlternate).toBe('true')
    // 交替模式忽略 titleSpan。
    expect(alt.style.getPropertyValue('--ut-tl-span')).toBe('calc(12 / 24 * 100%)')
    expect(items(alt).map(li => li.dataset.timelinePlacement)).toEqual(['start', 'end', 'start', 'end'])
    expect(classes(part(items(alt)[0], 'icon'))).toContain('start-[var(--ut-tl-span)]')
    expect(classes(part(items(alt)[1], 'icon'))).toContain('start-[calc(100%-var(--ut-tl-span))]')
    expect(classes(part(items(alt)[1], 'header'))).toContain('order-1')
    expect(classes(items(alt)[0])).toContain('pb-[20px]')
    expect(titled.dataset.timelineAlternate).toBe('true')
    expect(titled.style.getPropertyValue('--ut-tl-span')).toBe('100px')
    const [t0, t1] = items(titled)
    expect(part(t0, 'title')!.textContent).toBe('t')
    expect(classes(part(t0, 'header'))).toContain('min-h-[24px]')
    expect(classes(part(t1, 'header'))).toContain('min-h-0')
    expect(classes(part(t0, 'content'))).toContain('mt-0')
    expect(end.style.getPropertyValue('--ut-tl-span')).toBe('calc(18 / 24 * 100%)')
    expect(items(end)[0].dataset.timelinePlacement).toBe('end')
  })

  // 横向：li 等分；start / end / alternate 三种布局类；横向不因 title 进入交替。
  it('[timeline.horizontal] horizontal layouts', () => {
    view = mount(() => <>
      <Timeline orientation="horizontal" items={four} />
      <Timeline orientation="horizontal" mode="end" items={four} />
      <Timeline orientation="horizontal" mode="alternate" items={four} />
      <Timeline orientation="horizontal" items={[{ title: 't', content: 'a' }, { content: 'b' }]} />
    </>)
    const [start, end, alt, titled] = [...view.host.children] as HTMLElement[]
    expect(classes(start)).toContain('flex-row')
    expect(classes(items(start)[0])).toContain('flex-[1_1_0%]')
    expect(classes(part(items(start)[0], 'wrapper'))).toEqual(expect.arrayContaining(['flex-col', 'items-center']))
    expect(classes(part(items(end)[0], 'wrapper'))).toContain('flex-col-reverse')
    expect(alt.dataset.timelineAlternate).toBe('true')
    expect(classes(part(items(alt)[0], 'wrapper'))).toContain('h-[78px]')
    expect(classes(part(items(alt)[0], 'content'))).toContain('top-[56px]')
    expect(classes(part(items(alt)[1], 'content'))).toContain('bottom-[56px]')
    expect(titled.dataset.timelineAlternate).toBe('false')
  })

  // 语义化：根级 classNames / styles（对象与函数）与节点级 classNames / styles / class / style 合并。
  it('[timeline.semantic] semantic class names and styles', () => {
    view = mount(() => <Timeline
      class="extra"
      style={{ padding: '8px' }}
      classNames={{ root: 'r', item: 'i', itemIcon: 'ic', itemRail: 'rl', itemContent: 'ct', itemTitle: 'tt', itemHeader: 'hd', itemSection: 'sc', itemWrapper: 'wr' }}
      styles={info => ({ root: { margin: info.props.orientation === 'vertical' ? '4px' : '0' }, itemIcon: { 'border-color': '#A294F9' } })}
      items={[
        { title: 'T', content: 'a', class: 'own', style: { height: '100px' }, styles: { rail: { 'border-style': 'dashed' }, content: { opacity: 0.45 } }, classNames: { icon: 'own-icon' } },
        { content: 'b' },
      ]}
    />)
    expect(classes(root())).toEqual(expect.arrayContaining(['extra', 'r']))
    expect([root().style.padding, root().style.margin]).toEqual(['8px', '4px'])
    const [a] = items()
    expect(classes(a)).toEqual(expect.arrayContaining(['i', 'own']))
    expect(a.style.height).toBe('100px')
    expect(classes(part(a, 'icon'))).toEqual(expect.arrayContaining(['ic', 'own-icon']))
    expect(part(a, 'icon')!.style.borderColor).toMatch(/^(#A294F9|rgb\(162, 148, 249\))$/i)
    for (const [name, cls] of [['rail', 'rl'], ['content', 'ct'], ['title', 'tt'], ['header', 'hd'], ['section', 'sc'], ['wrapper', 'wr']]) expect(classes(part(a, name))).toContain(cls)
    expect(part(a, 'rail')!.style.borderStyle).toBe('dashed')
    expect(part(a, 'content')!.style.opacity).toBe('0.45')
  })

  // 空值：items 为空渲染空 ol；空字符串 / false 内容与标题不渲染节点；数字 0 正常渲染。
  it('[timeline.empty] empty items and falsy nodes', () => {
    view = mount(() => <>
      <Timeline />
      <Timeline items={[{ title: '', content: false as never }, { title: 0, content: 0 }]} />
    </>)
    const [empty, falsy] = [...view.host.children]
    expect(items(empty)).toEqual([])
    const [a, b] = items(falsy)
    expect([part(a, 'title'), part(a, 'content')]).toEqual([null, null])
    expect([part(b, 'title')!.textContent, part(b, 'content')!.textContent]).toEqual(['0', '0'])
  })

  // 透传：原生属性落在 ol；Timeline.Item 为兼容桩，不渲染。
  it('[timeline.attrs] passes native attributes and Item stub renders nothing', () => {
    view = mount(() => <>
      <Timeline id="tl" aria-label="进度" data-x="1" items={[{ content: 'a' }]} />
      <Timeline.Item content="x" />
    </>)
    expect([root().id, root().getAttribute('aria-label'), root().dataset.x]).toEqual(['tl', '进度', '1'])
    expect(view.host.children).toHaveLength(1)
  })
})
