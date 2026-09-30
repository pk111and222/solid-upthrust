import { createSignal, flush } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FloatButton, { BackTop, Group } from '../../../components/lib/FloatButton'
import { mount } from '../../utils/mount'

let view: ReturnType<typeof mount> | undefined
beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { view?.dispose(); view = undefined; vi.useRealTimers(); document.body.innerHTML = '' })

const render = (fn: Parameters<typeof mount>[0]) => { view = mount(fn); flush() }
const parts = (name: string, scope: ParentNode = document) => [...scope.querySelectorAll<HTMLElement>(`[data-float-button-part="${name}"]`)]
const part = (name: string, scope: ParentNode = document) => parts(name, scope)[0]
const classes = (el: Element | null | undefined) => (el?.getAttribute('class') ?? '').split(/\s+/)
// 先 flush 让本批 effect 挂上 rAF / 定时器，再推进时间（假定时器下 rAF 每帧 16ms）。
const tick = (ms: number) => { flush(); vi.advanceTimersByTime(ms); flush() }

describe('FloatButton DOM contracts', () => {
  // 默认：button type=button、40 宽 / 最小 40 高纵向排布、circle、fixed 右 24 下 48、z 1000、boxShadowSecondary；
  // 无 icon 无 content 时显示 FileTextOutlined，icon-only 图标 18px。
  it('[float-button.default] antd individual button structure', () => {
    render(() => <FloatButton />)
    const root = part('root')
    expect(root.tagName).toBe('BUTTON')
    expect(root.getAttribute('type')).toBe('button')
    expect(classes(root)).toEqual(expect.arrayContaining([
      'inline-flex', 'flex-col', 'w-[40px]', 'min-h-[40px]', 'h-auto', 'py-xxs', 'gap-[2px]', 'rounded-full',
      'fixed', 'z-[1000]', 'right-[24px]', 'bottom-[48px]', 'shadow-secondary', 'bg-surface', 'border-outline', 'cursor-pointer',
    ]))
    expect(root.dataset.floatButtonShape).toBe('circle')
    expect(root.dataset.floatButtonType).toBe('default')
    const icon = part('icon')
    expect(icon.querySelector('[aria-label="file-text"]')).not.toBeNull()
    expect(classes(icon)).toContain('text-[18px]')
    expect(part('content')).toBeUndefined()
  })

  // type primary / square 形状 / content：content 12px、图标不再放大；只有 content 时不渲染默认图标；废弃 description 等价于 content。
  it('[float-button.variants] type, shape, content and legacy description', () => {
    render(() => <>
      <FloatButton type="primary" shape="square" icon={<i data-i />} content="帮助" />
      <FloatButton shape="square" content="仅文字" />
      <FloatButton shape="square" description="旧描述" />
    </>)
    const [a, b, c] = parts('root')
    expect(classes(a)).toEqual(expect.arrayContaining(['bg-primary', 'text-on-primary', 'border-transparent', 'rounded-lg']))
    expect(a.dataset.floatButtonType).toBe('primary')
    expect(classes(part('icon', a))).not.toContain('text-[18px]')
    expect(part('icon', a).querySelector('[data-i]')).not.toBeNull()
    expect(classes(part('content', a))).toContain('text-[12px]')
    expect(part('content', a).textContent).toBe('帮助')
    expect(part('icon', b)).toBeUndefined()
    expect(part('content', c).textContent).toBe('旧描述')
  })

  // href 渲染为 <a>（带 target）；disabled 时去掉 href、aria-disabled、点击不触发；htmlType 透传到 button。
  it('[float-button.link] href renders an anchor, disabled and htmlType', () => {
    const onClick = vi.fn()
    render(() => <>
      <FloatButton href="https://example.com" target="_blank" onClick={onClick} />
      <FloatButton href="https://example.com" disabled onClick={onClick} />
      <FloatButton htmlType="submit" disabled onClick={onClick} aria-label="提交" />
    </>)
    const [link, disabledLink, submit] = parts('root')
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('https://example.com')
    expect(link.getAttribute('target')).toBe('_blank')
    link.addEventListener('click', e => e.preventDefault())
    link.click()
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(disabledLink.hasAttribute('href')).toBe(false)
    expect(disabledLink.getAttribute('aria-disabled')).toBe('true')
    disabledLink.click()
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(submit.getAttribute('type')).toBe('submit')
    expect(submit.getAttribute('aria-label')).toBe('提交')
    expect((submit as HTMLButtonElement).disabled).toBe(true)
    expect(classes(submit)).toEqual(expect.arrayContaining(['text-on-surface/25', 'cursor-not-allowed']))
  })

  // badge：数字徽标 translate(50%, -50%)，circle 额外内缩 4.686px；dot 不平移，square 的 dot 内缩 1.757px；status / text 被剔除。
  it('[float-button.badge] badge offsets per shape and dot', () => {
    render(() => <>
      <FloatButton badge={{ count: 5 }} />
      <FloatButton shape="square" badge={{ count: 12, color: 'blue' }} />
      <FloatButton shape="square" badge={{ dot: true }} />
      <FloatButton badge={{ dot: true, status: 'success', text: 'x' } as never} />
    </>)
    const [a, b, c, d] = parts('root').map(root => part('badge', root))
    expect(classes(a)).toEqual(expect.arrayContaining(['absolute', 'top-0', 'right-0', 'translate-x-1/2', '-translate-y-1/2', 'mt-[4.686px]', 'mr-[4.686px]']))
    expect(a.textContent).toBe('5')
    expect(classes(b)).toEqual(expect.arrayContaining(['translate-x-1/2', '-translate-y-1/2']))
    expect(classes(b)).not.toContain('mt-[4.686px]')
    expect(classes(c)).toEqual(expect.arrayContaining(['mt-[1.757px]', 'mr-[1.757px]']))
    expect(classes(c)).not.toContain('translate-x-1/2')
    expect(classes(d)).toEqual(expect.arrayContaining(['mt-[4.686px]']))
    expect(d.textContent).toBe('')
  })

  // tooltip：节点即 title、对象即 Tooltip 属性；trigger 绑定在按钮本身（不额外包裹），hover 后弹出 role=tooltip。
  it('[float-button.tooltip] tooltip node and config bind to the button itself', () => {
    render(() => <>
      <FloatButton tooltip={<span data-tip>文档</span>} />
      <FloatButton tooltip={{ title: '对象', open: true, placement: 'left' }} />
    </>)
    const [first] = parts('root')
    expect(first.parentElement).toBe(view!.host)
    first.dispatchEvent(new MouseEvent('mouseenter'))
    tick(150)
    const tips = parts('tooltip')
    expect(tips.some(t => t.querySelector('[data-tip]'))).toBe(true)
    expect(tips.some(t => t.textContent === '对象')).toBe(true)
    expect(tips.every(t => t.getAttribute('role') === 'tooltip')).toBe(true)
  })

  // 语义化 classNames / styles（对象与函数，info.props 含合并后的 type / shape）、class / style 与原生属性透传。
  it('[float-button.semantic] classNames, styles, class, style and props', () => {
    render(() => <FloatButton
      type="primary" shape="square" content="c" icon={<i />} class="own" style={{ color: 'red' }} id="fb" data-x="1"
      classNames={{ root: 'c-root', icon: 'c-icon', content: 'c-content' }}
      styles={({ props }) => ({ content: { 'font-weight': props.type === 'primary' ? '600' : '400' }, icon: { color: props.shape === 'square' ? 'blue' : 'green' } })}
    />)
    const root = part('root')
    expect(classes(root)).toEqual(expect.arrayContaining(['c-root', 'own']))
    expect(root.style.color).toBe('red')
    expect(root.id).toBe('fb')
    expect(root.dataset.x).toBe('1')
    expect(classes(part('icon'))).toContain('c-icon')
    expect(part('icon').style.color).toBe('blue')
    expect(classes(part('content'))).toContain('c-content')
    expect(part('content').style.fontWeight).toBe('600')
  })
})

describe('FloatButton.BackTop DOM contracts', () => {
  // 默认 visibilityHeight 400：未滚动时不挂载；滚到阈值后挂载并淡入；回滚后淡出（opacity-0、不可点）200ms 后卸载。图标 VerticalAlignTopOutlined。
  it('[float-button.back-top] threshold-gated fade in / out', () => {
    const pane = document.createElement('div')
    document.body.append(pane)
    render(() => <BackTop target={() => pane} />)
    expect(part('root')).toBeUndefined()
    pane.scrollTop = 400
    pane.dispatchEvent(new Event('scroll'))
    // 滚动检测走 rAF（advance 期间才写信号），再一轮 tick 让入场双帧落地。
    tick(60); tick(60)
    const root = part('root')
    expect(root).toBeDefined()
    expect(root.getAttribute('data-float-button-backtop')).toBe('visible')
    expect(classes(root)).toEqual(expect.arrayContaining(['transition-opacity', 'duration-mid', 'opacity-100']))
    expect(part('icon').querySelector('[aria-label="vertical-align-top"]')).not.toBeNull()
    pane.scrollTop = 0
    pane.dispatchEvent(new Event('scroll'))
    // 滚动检测走 rAF（advance 期间才写信号），再一轮 tick 让入场双帧落地。
    tick(60); tick(60)
    expect(classes(part('root'))).toEqual(expect.arrayContaining(['opacity-0', 'pointer-events-none']))
    tick(200)
    expect(part('root')).toBeUndefined()
  })

  // visibilityHeight 0 一开始就显示；点击按 duration 滚回顶部并触发 onClick；自定义 icon 替换默认图标。
  it('[float-button.back-top-click] visibilityHeight 0, click scrolls back and reports onClick', () => {
    const pane = document.createElement('div')
    document.body.append(pane)
    pane.scrollTop = 800
    const onClick = vi.fn()
    render(() => <BackTop target={() => pane} visibilityHeight={0} duration={200} onClick={onClick} icon={<i data-up />} />)
    expect(part('icon').querySelector('[data-up]')).not.toBeNull()
    part('root').click()
    expect(onClick).toHaveBeenCalledTimes(1)
    tick(400)
    expect(pane.scrollTop).toBe(0)
  })
})

describe('FloatButton.Group DOM contracts', () => {
  // 平铺 circle：根 fixed 右 24 下 48；list 纵向 gap 16；子按钮去掉 fixed、各自带阴影；子按钮 shape 被 Group 覆盖。
  it('[float-button.group-circle] circle group is an individual flex column', () => {
    render(() => <Group><FloatButton shape="square" /><FloatButton /></Group>)
    const group = part('group')
    expect(classes(group)).toEqual(expect.arrayContaining(['fixed', 'z-[1000]', 'right-[24px]', 'bottom-[48px]']))
    expect(classes(part('list'))).toEqual(expect.arrayContaining(['flex', 'flex-col', 'gap-md']))
    const items = parts('root')
    expect(items).toHaveLength(2)
    for (const item of items) {
      expect(classes(item)).not.toContain('fixed')
      expect(classes(item)).toEqual(expect.arrayContaining(['shadow-secondary', 'rounded-full']))
      expect(item.dataset.floatButtonShape).toBe('circle')
    }
    expect(part('root', group)).toBeDefined()
  })

  // 平铺 square：Space.Compact —— list 带阴影与 8px 圆角，子按钮无阴影、相邻边框 -1px 重叠、只圆首尾外角。
  it('[float-button.group-square] square group is a compact list', () => {
    render(() => <Group shape="square"><FloatButton /><FloatButton /><FloatButton /></Group>)
    expect(classes(part('list'))).toEqual(expect.arrayContaining(['shadow-secondary', 'rounded-lg']))
    expect(classes(part('list'))).not.toContain('gap-md')
    for (const item of parts('root')) {
      expect(classes(item)).toEqual(expect.arrayContaining(['rounded-none', 'mt-[-1px]', 'first:mt-0', 'first:rounded-t-lg', 'last:rounded-b-lg']))
      expect(classes(item)).not.toContain('shadow-secondary')
    }
  })

  // click 菜单：list 初始不挂载；点击触发按钮展开（list 绝对定位 bottom 56px、入场动效）、图标换成 CloseOutlined；组外点击收起、300ms 后卸载。
  it('[float-button.group-click] click menu toggles, swaps icon and closes on outside click', () => {
    const onOpenChange = vi.fn()
    render(() => <Group trigger="click" onOpenChange={onOpenChange} icon={<i data-open-icon />}><FloatButton /><FloatButton /></Group>)
    expect(part('list')).toBeUndefined()
    const trigger = document.querySelector<HTMLElement>('[data-float-button-trigger]')!
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.querySelector('[data-open-icon]')).not.toBeNull()
    expect(classes(trigger)).not.toContain('fixed')
    expect(part('group').dataset.floatButtonPlacement).toBe('top')
    trigger.click()
    tick(50)
    const list = part('list')
    expect(classes(list)).toEqual(expect.arrayContaining(['absolute', 'bottom-[56px]', 'transition-all', 'duration-slow', 'opacity-100']))
    expect(list.dataset.floatButtonOpen).toBe('true')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.querySelector('[aria-label="close"]')).not.toBeNull()
    // 组内点击不关闭
    parts('root', list)[0].click()
    flush()
    expect(part('list').dataset.floatButtonOpen).toBe('true')
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    flush()
    expect(classes(part('list'))).toEqual(expect.arrayContaining(['opacity-0', 'translate-y-[40px]', 'pointer-events-none']))
    tick(300)
    expect(part('list')).toBeUndefined()
    expect(onOpenChange.mock.calls).toEqual([[true], [false]])
  })

  // hover 菜单：根节点移入展开、移出收起；四个 placement 的定位类与离场位移方向；废弃 direction 映射到 placement。
  it('[float-button.group-hover] hover menu and placements', () => {
    const [placement, setPlacement] = createSignal<'top' | 'bottom' | 'left' | 'right'>('bottom')
    render(() => <Group trigger="hover" placement={placement()} closeIcon={<i data-close />}><FloatButton /></Group>)
    const group = part('group')
    group.dispatchEvent(new MouseEvent('mouseenter'))
    tick(50)
    expect(classes(part('list'))).toEqual(expect.arrayContaining(['absolute', 'top-[56px]', 'flex-col']))
    expect(document.querySelector('[data-float-button-trigger] [data-close]')).not.toBeNull()
    for (const [p, cls, axis] of [['left', 'right-[56px]', 'flex-row'], ['right', 'left-[56px]', 'flex-row'], ['top', 'bottom-[56px]', 'flex-col']] as const) {
      setPlacement(p)
      flush()
      expect(classes(part('list'))).toEqual(expect.arrayContaining([cls, axis]))
    }
    setPlacement('left')
    flush()
    group.dispatchEvent(new MouseEvent('mouseleave'))
    flush()
    expect(classes(part('list'))).toEqual(expect.arrayContaining(['opacity-0', 'translate-x-[40px]']))
    view!.dispose(); view = undefined
    render(() => <Group trigger="click" direction="down" defaultOpen><FloatButton /></Group>)
    expect(part('group').dataset.floatButtonPlacement).toBe('bottom')
    expect(classes(part('list'))).toContain('top-[56px]')
  })

  // 受控 open：点击只上报意图不改变状态；外部改 open 后同步。
  it('[float-button.group-controlled] controlled open', () => {
    const [open, setOpen] = createSignal(true)
    const onOpenChange = vi.fn()
    render(() => <Group trigger="click" open={open()} onOpenChange={onOpenChange}><FloatButton /></Group>)
    tick(50)
    const trigger = document.querySelector<HTMLElement>('[data-float-button-trigger]')!
    trigger.click()
    flush()
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(part('list').dataset.floatButtonOpen).toBe('true')
    setOpen(false)
    flush()
    expect(part('list').dataset.floatButtonOpen).toBe('false')
  })

  // Group 语义化：root / list / item* / trigger* 分别落到根、列表、子按钮与触发按钮；函数形式拿到合并后的 placement。
  it('[float-button.group-semantic] group semantic slots map to items and trigger', () => {
    render(() => <Group
      trigger="click" defaultOpen class="own" style={{ color: 'red' }}
      classNames={{ root: 'g-root', list: 'g-list', item: 'g-item', itemIcon: 'g-item-icon', trigger: 'g-trigger', triggerIcon: 'g-trigger-icon' }}
      styles={({ props }) => ({ list: { 'padding-top': props.placement === 'top' ? '4px' : '0px' }, triggerContent: { color: 'blue' } })}
    ><FloatButton /></Group>)
    tick(50)
    const group = part('group')
    expect(classes(group)).toEqual(expect.arrayContaining(['g-root', 'own']))
    expect(group.style.color).toBe('red')
    expect(classes(part('list'))).toContain('g-list')
    expect(part('list').style.paddingTop).toBe('4px')
    const item = part('root', part('list'))
    expect(classes(item)).toContain('g-item')
    expect(classes(part('icon', item))).toContain('g-item-icon')
    const trigger = document.querySelector<HTMLElement>('[data-float-button-trigger]')!
    expect(classes(trigger)).toContain('g-trigger')
    expect(classes(trigger)).not.toContain('g-item')
    expect(classes(part('icon', trigger))).toContain('g-trigger-icon')
  })
})
