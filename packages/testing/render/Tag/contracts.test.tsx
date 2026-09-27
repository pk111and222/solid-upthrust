import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Tag from '../../../components/lib/Tag'
import type { TagColor, TagVariant } from '../../../components/lib/Tag'
import { mount } from '../../utils/mount'

let view: ReturnType<typeof mount>
afterEach(() => view?.dispose())
const click = (el: Element) => { el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); flush() }
const root = () => view.host.firstElementChild as HTMLElement
const classes = (el: Element) => el.className.split(/\s+/)

describe('Tag DOM contracts', () => {
  // D12：data-*/aria-*/id/title/事件等原生属性透传到根节点，ref 拿到真实元素。
  it('[tag.attrs] forwards native attributes, events and ref', () => {
    let element: HTMLElement | undefined
    const enter = vi.fn()
    view = mount(() => <Tag ref={el => { element = el }} id="t1" title="提示" data-screen="md" aria-label="断点" role="note" onMouseEnter={enter}>md</Tag>)
    const el = root()
    expect(el.tagName).toBe('SPAN')
    expect(element).toBe(el)
    expect([el.id, el.title, el.dataset.screen, el.getAttribute('aria-label'), el.getAttribute('role')]).toEqual(['t1', '提示', 'md', '断点', 'note'])
    el.dispatchEvent(new MouseEvent('mouseenter')); flush()
    expect(enter).toHaveBeenCalledTimes(1)
  })

  // 默认 filled 无描边；outlined 描边；solid 实心；bordered 旧写法不改变默认；-inverse 等价 solid。
  it('[tag.variant.dom] variant classes for the default color', () => {
    view = mount(() => <>
      <Tag>a</Tag><Tag variant="outlined">b</Tag><Tag variant="solid">c</Tag><Tag bordered>d</Tag><Tag color="red-inverse">e</Tag>
    </>)
    const [filled, outlined, solid, bordered, inverse] = [...view.host.children] as HTMLElement[]
    expect(classes(filled)).toEqual(expect.arrayContaining(['bg-on-surface/4', 'text-on-surface', 'border-transparent']))
    expect(classes(outlined)).toContain('border-outline')
    expect(classes(solid)).toEqual(expect.arrayContaining(['bg-on-surface', 'text-surface']))
    expect(classes(bordered)).toContain('border-transparent')
    expect(classes(inverse)).toEqual(expect.arrayContaining(['bg-[#f5222d]', 'text-[#fff]']))
    for (const el of [filled, outlined, solid]) expect(el.getAttribute('style')).toBeNull()
  })

  // 预设色板与状态色三种变体各自使用色板字面量类，不产生内联样式。
  it('[tag.color.preset.dom] presets and statuses per variant', () => {
    const cases: [TagColor, TagVariant, string[]][] = [
      ['magenta', 'filled', ['bg-[#fff0f6]', 'text-[#c41d7f]', 'border-transparent']],
      ['magenta', 'outlined', ['bg-[#fff0f6]', 'border-[#ffadd2]']],
      ['magenta', 'solid', ['bg-[#eb2f96]', 'text-[#fff]']],
      ['success', 'filled', ['bg-[#f6ffed]', 'text-[#52c41a]']],
      ['processing', 'outlined', ['bg-primary/10', 'text-primary', 'border-primary/45']],
      ['error', 'solid', ['bg-error', 'text-on-error']],
      ['warning', 'outlined', ['border-[#ffe58f]']],
      ['default', 'solid', ['bg-on-surface']],
    ]
    view = mount(() => <>{cases.map(([color, variant]) => <Tag color={color} variant={variant}>x</Tag>)}</>)
    cases.forEach(([, , expected], index) => {
      const el = view.host.children[index] as HTMLElement
      expect(classes(el)).toEqual(expect.arrayContaining(expected))
      expect(el.getAttribute('style')).toBeNull()
    })
  })

  // 自定义色：filled/outlined 浅底 + 原色；solid 仅底色；禁用时不应用；style 覆盖 styles.root。
  it('[tag.color.custom.dom] custom colors inline and disabled drops them', () => {
    view = mount(() => <>
      <Tag color="#f50">a</Tag>
      <Tag color="#f50" variant="outlined">b</Tag>
      <Tag color="#f50" variant="solid">c</Tag>
      <Tag color="#f50" disabled>d</Tag>
      <Tag color="#f50" styles={{ root: { color: 'red', 'font-weight': '600' } }} style={{ color: 'blue' }}>e</Tag>
    </>)
    const [filled, outlined, solid, disabled, merged] = [...view.host.children] as HTMLElement[]
    expect([filled.style.backgroundColor, filled.style.color, filled.style.borderColor]).toEqual(['#ffeee5', '#f50', ''])
    expect(outlined.style.borderColor).toBe('#f50')
    expect([solid.style.backgroundColor, solid.style.color]).toEqual(['#f50', ''])
    expect(classes(solid)).toContain('text-[#fff]')
    expect(disabled.getAttribute('style')).toBeNull()
    expect(classes(disabled)).toEqual(expect.arrayContaining(['text-on-surface/25', 'cursor-not-allowed']))
    expect([merged.style.color, merged.style.fontWeight]).toEqual(['blue', '600'])
  })

  // 有图标时图标与文字分别包裹并接收语义化类名/样式；无图标时文字直接渲染；仅图标时不渲染空内容节点。
  it('[tag.icon.semantic] icon/content wrappers and semantic slots', () => {
    view = mount(() => <>
      <Tag icon={<i class="ic" />} classNames={{ root: 'r', icon: 'ico', content: 'txt' }} styles={{ icon: { color: 'red' }, content: { color: 'blue' } }} class="own">文本</Tag>
      <Tag>纯文本</Tag>
      <Tag icon={<i class="only" />} />
    </>)
    const [withIcon, plain, iconOnly] = [...view.host.children] as HTMLElement[]
    expect(classes(withIcon)).toEqual(expect.arrayContaining(['r', 'own']))
    const [iconSlot, contentSlot] = [...withIcon.children] as HTMLElement[]
    expect(iconSlot.className).toContain('ico'); expect(iconSlot.style.color).toBe('red'); expect(iconSlot.querySelector('.ic')).not.toBeNull()
    expect(contentSlot.className).toContain('txt'); expect(contentSlot.className).toContain('ms-[7px]'); expect(contentSlot.textContent).toBe('文本')
    expect(plain.children).toHaveLength(0); expect(plain.textContent).toBe('纯文本')
    expect(iconOnly.children).toHaveLength(1)
  })

  // 关闭按钮的出现条件：closable / closeIcon / 对象配置 / false 与 null。
  it('[tag.closable.dom] close button visibility and accessible name', () => {
    view = mount(() => <>
      <Tag>none</Tag>
      <Tag closable>default</Tag>
      <Tag closable closeLabel="移除">label</Tag>
      <Tag closable={{ closeIcon: <b class="obj" />, 'aria-label': '删除' }} closeLabel="忽略">object</Tag>
      <Tag closeIcon={<b class="own" />}>icon</Tag>
      <Tag closeIcon>true</Tag>
      <Tag closeIcon={false}>false</Tag>
      <Tag closable closeIcon={null}>nullIcon</Tag>
    </>)
    const buttons = [...view.host.children].map(el => el.querySelector('button'))
    expect(buttons.map(button => button?.getAttribute('aria-label') ?? null)).toEqual([null, '关闭标签', '移除', '删除', '关闭标签', '关闭标签', null, '关闭标签'])
    expect(buttons[1]!.getAttribute('type')).toBe('button')
    expect(buttons[1]!.querySelector('.i-mdi-close')).not.toBeNull()
    expect(buttons[3]!.querySelector('.obj')).not.toBeNull()
    expect(buttons[4]!.querySelector('.own')).not.toBeNull()
    expect(buttons[5]!.querySelector('.i-mdi-close')).not.toBeNull()
    expect(buttons[7]!.querySelector('.i-mdi-close')).not.toBeNull()
  })

  // 关闭：先回调再移除；不冒泡到父级；preventDefault 保留；禁用时按钮 disabled 且不回调。
  it('[tag.close.flow] close callback, removal, cancellation and propagation', () => {
    const parent = vi.fn(), onClose = vi.fn(), keep = vi.fn((event: MouseEvent) => event.preventDefault()), blocked = vi.fn()
    view = mount(() => <div onClick={parent}>
      <Tag closable onClose={onClose}>a</Tag>
      <Tag closable onClose={keep}>b</Tag>
      <Tag closable disabled onClose={blocked}>c</Tag>
    </div>)
    const wrapper = root()
    const buttonOf = (text: string) => [...wrapper.children].find(el => el.textContent === text)!.querySelector('button')!
    click(buttonOf('a'))
    expect(onClose).toHaveBeenCalledTimes(1); expect(onClose.mock.calls[0][0]).toBeInstanceOf(MouseEvent)
    expect(wrapper.textContent).toBe('bc')
    click(buttonOf('b'))
    expect(keep).toHaveBeenCalledTimes(1); expect(wrapper.textContent).toBe('bc')
    const disabled = buttonOf('c')
    expect(disabled.disabled).toBe(true)
    expect(classes(disabled)).toContain('text-on-surface/25')
    disabled.dispatchEvent(new MouseEvent('click', { bubbles: true })); flush()
    expect(blocked).not.toHaveBeenCalled()
    expect(parent).not.toHaveBeenCalled()
  })

  // href 渲染为链接：新窗口默认安全 rel、显式 rel 优先；禁用移除 href 并标注 aria-disabled；关闭时阻止跳转。
  it('[tag.href] anchor rendering, rel, disabled and close navigation', () => {
    let closeEvent: MouseEvent | undefined
    view = mount(() => <>
      <Tag href="/a" target="_blank">a</Tag>
      <Tag href="/b" target="_blank" rel="nofollow">b</Tag>
      <Tag href="/c" disabled>c</Tag>
      <Tag href="/d" closable onClose={event => { closeEvent = event }}>d</Tag>
      <Tag target="_blank">e</Tag>
    </>)
    const [a, b, c, d, e] = [...view.host.children] as HTMLAnchorElement[]
    expect([a.tagName, a.getAttribute('href'), a.target, a.rel]).toEqual(['A', '/a', '_blank', 'noopener noreferrer'])
    expect(b.rel).toBe('nofollow')
    expect([c.tagName, c.hasAttribute('href'), c.getAttribute('aria-disabled')]).toEqual(['A', false, 'true'])
    click(d.querySelector('button')!)
    expect(closeEvent?.defaultPrevented).toBe(true)
    expect([e.tagName, e.hasAttribute('target')]).toEqual(['SPAN', false])
  })

  // onClick 支持函数与绑定元组；禁用时不触发。
  it('[tag.onClick] click handler forms and disabled guard', () => {
    const fn = vi.fn(), bound = vi.fn(), off = vi.fn()
    view = mount(() => <><Tag onClick={fn}>a</Tag><Tag onClick={[bound, 'data']}>b</Tag><Tag disabled onClick={off}>c</Tag></>)
    const [a, b, c] = [...view.host.children]
    click(a); click(b); click(c)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(bound).toHaveBeenCalledWith('data', expect.any(MouseEvent))
    expect(off).not.toHaveBeenCalled()
  })

  // JSX 属性只实例化一次：children、icon、closeIcon 与 closable.closeIcon 不因多次读取重复创建组件。
  it('[tag.single-instance] JSX props are created once', () => {
    let created = 0
    const Probe = () => { created++; return <i /> }
    view = mount(() => <><Tag icon={<Probe />} closeIcon={<Probe />}><Probe /></Tag><Tag closable={{ closeIcon: <Probe /> }}>x</Tag></>)
    expect(created).toBe(4)
    expect(view.host.querySelectorAll('i')).toHaveLength(4)
  })

  // 动态切换颜色、变体与禁用只更新类名/属性，不重建根节点；href 切换时改为链接。
  it('[tag.dynamic] reactive updates keep the element', () => {
    const [color, setColor] = createSignal<TagColor>('blue', { ownedWrite: true })
    const [variant, setVariant] = createSignal<TagVariant>('filled', { ownedWrite: true })
    const [disabled, setDisabled] = createSignal(false, { ownedWrite: true })
    const [href, setHref] = createSignal<string | undefined>(undefined, { ownedWrite: true })
    view = mount(() => <Tag color={color()} variant={variant()} disabled={disabled()} href={href()}>x</Tag>)
    const first = root()
    expect(classes(first)).toContain('bg-[#e6f4ff]')
    setColor('#123456'); flush()
    expect(first.style.color).toBe('#123456')
    setVariant('solid'); flush()
    expect([first.style.backgroundColor, first.style.color]).toEqual(['#123456', ''])
    setDisabled(true); flush()
    expect(first.getAttribute('style')).toBeNull()
    expect(root()).toBe(first)
    setHref('/next'); flush()
    expect(root().tagName).toBe('A'); expect(root().hasAttribute('href')).toBe(false)
  })

  // 数字 0 子元素必须显示（有无图标两种路径）。
  it('[tag.zero] numeric zero children render', () => {
    view = mount(() => <><Tag>{0}</Tag><Tag icon={<i />}>{0}</Tag></>)
    expect([...view.host.children].map(el => el.textContent)).toEqual(['0', '0'])
  })

  // 关闭按钮语义化类名/样式，以及 solid 变体下沿用文字色。
  it('[tag.close.semantic] close slot styling', () => {
    view = mount(() => <><Tag closable classNames={{ close: 'cls' }} styles={{ close: { color: 'red' } }}>a</Tag><Tag closable variant="solid" color="blue">b</Tag></>)
    const [a, b] = [...view.host.querySelectorAll('button')] as HTMLButtonElement[]
    expect(a.className).toContain('cls'); expect(a.style.color).toBe('red'); expect(classes(a)).toContain('text-on-surface/45')
    expect(classes(b)).toEqual(expect.arrayContaining(['text-current', 'opacity-75']))
  })
})
