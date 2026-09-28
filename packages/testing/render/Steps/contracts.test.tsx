import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Steps, { type StepItem } from '../../../components/lib/Steps'
import { mount } from '../../utils/mount'

let dispose = () => {}
afterEach(() => dispose())

const items: StepItem[] = [{ title: '一' }, { title: '二' }, { title: '三' }, { title: '四' }]
const stepEls = (host: HTMLElement) => [...host.querySelectorAll<HTMLElement>('[data-step-status]')]
const statuses = (host: HTMLElement) => stepEls(host).map(el => el.dataset.stepStatus)
const key = (el: HTMLElement, name: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }))

// 状态映射到 DOM：current 之前 finish、当前取 status、之后 wait；单项 status 覆盖；finish 显示对勾、error 显示叉号、其余显示序号。
it('[steps.render.status] status derivation reaches the DOM', () => {
  const view = mount(() => <Steps current={2} status="error" items={[{ title: '一' }, { title: '二', status: 'wait' }, { title: '三' }, { title: '四' }]} />); dispose = view.dispose
  expect(statuses(view.host)).toEqual(['finish', 'wait', 'error', 'wait'])
  const [first, second, third] = stepEls(view.host)
  expect(first.querySelector('.i-mdi-check')).not.toBeNull()
  expect(second.querySelector('[data-step-icon]')!.textContent).toBe('2')
  expect(third.querySelector('.i-mdi-close')).not.toBeNull()
  // 默认 filled：wait 浅灰底、error 10% 浅红底；标题颜色随状态。
  expect(second.querySelector('[data-step-icon]')!.className).toContain('bg-on-surface/6')
  expect(third.querySelector('[data-step-icon]')!.className).toContain('bg-error/10')
  expect(third.querySelector('[data-step-title]')!.className).toContain('text-error')
  // 当前步骤带 aria-current="step"，且只有一个。
  expect(stepEls(view.host).map(el => el.getAttribute('aria-current'))).toEqual([null, null, 'step', null])
})

// 未设置 onChange：步骤不带 role / tabindex，点击无反应。
it('[steps.render.static] no button semantics without onChange', () => {
  const view = mount(() => <Steps current={1} items={items} />); dispose = view.dispose
  for (const el of stepEls(view.host)) {
    expect(el.hasAttribute('role')).toBe(false)
    expect(el.hasAttribute('tabindex')).toBe(false)
  }
  // 旧实现中图标本身带 role=button，这里确认图标上不再有。
  expect(view.host.querySelector('[data-step-icon][role]')).toBeNull()
})

// 可点击：整个步骤项 role=button tabindex=0；点击 / Enter / 空格回调序号；点击当前项不回调；禁用项 aria-disabled 且不可点击。
it('[steps.render.click] click and keyboard activation', () => {
  const onChange = vi.fn()
  const view = mount(() => <Steps current={1} onChange={onChange} items={[{ title: '一' }, { title: '二' }, { title: '三' }, { title: '四', disabled: true }]} />); dispose = view.dispose
  const [first, second, third, fourth] = stepEls(view.host)
  expect(first.getAttribute('role')).toBe('button')
  expect(first.getAttribute('tabindex')).toBe('0')
  expect(fourth.hasAttribute('role')).toBe(false)
  expect(fourth.hasAttribute('tabindex')).toBe(false)
  expect(fourth.getAttribute('aria-disabled')).toBe('true')

  first.click()
  expect(onChange).toHaveBeenLastCalledWith(0)
  second.click()
  expect(onChange).toHaveBeenCalledTimes(1)
  // Enter / 空格触发，并阻止默认行为（空格不滚动页面）。
  expect(key(third, 'Enter')).toBe(false)
  expect(onChange).toHaveBeenLastCalledWith(2)
  expect(key(first, ' ')).toBe(false)
  expect(onChange).toHaveBeenLastCalledWith(0)
  // 其他按键不触发、不阻止默认行为。
  expect(key(first, 'a')).toBe(true)
  fourth.click()
  key(fourth, 'Enter')
  expect(onChange).toHaveBeenCalledTimes(3)
})

// 自由跳转：UI 点击不经 createSteps 的前跳守卫，current=0 时可直接跳到第 4 步；受控 current 更新后状态跟随。
it('[steps.render.freeJump] clicks can jump forward over unfinished steps', () => {
  const [current, setCurrent] = createSignal(0)
  const onChange = vi.fn(setCurrent)
  const view = mount(() => <Steps current={current()} onChange={onChange} items={items} />); dispose = view.dispose
  stepEls(view.host)[3].click()
  flush()
  expect(onChange).toHaveBeenCalledWith(3)
  expect(statuses(view.host)).toEqual(['finish', 'finish', 'finish', 'process'])
})

// initial：编号从 initial + 1 开始，current 以 initial 为基准，onChange 回调 initial + 序号。
it('[steps.render.initial] initial shifts numbers, current and onChange', () => {
  const onChange = vi.fn()
  const view = mount(() => <Steps initial={3} current={4} onChange={onChange} items={[{ title: '四' }, { title: '五' }, { title: '六' }]} />); dispose = view.dispose
  expect(statuses(view.host)).toEqual(['finish', 'process', 'wait'])
  expect(stepEls(view.host)[2].querySelector('[data-step-icon]')!.textContent).toBe('6')
  stepEls(view.host)[0].click()
  expect(onChange).toHaveBeenCalledWith(3)
})

// percent：只在 process 的当前步骤图标外渲染 Progress 圆环（默认 40px、small 32px），不显示文字；error 时不渲染。
it('[steps.render.percent] percent renders a circle Progress around the current icon', () => {
  const [status, setStatus] = createSignal<'process' | 'error'>('process')
  const [size, setSize] = createSignal<'default' | 'small'>('default')
  const view = mount(() => <Steps current={1} percent={60} status={status()} size={size()} items={items} />); dispose = view.dispose
  const rings = () => view.host.querySelectorAll('[data-step-progress]')
  expect(rings()).toHaveLength(1)
  const ring = stepEls(view.host)[1].querySelector('[data-step-progress] [role="progressbar"]')!
  expect(ring.getAttribute('data-progress-type')).toBe('circle')
  expect(ring.getAttribute('aria-valuenow')).toBe('60')
  expect((ring.querySelector('[data-progress-part="body"]') as HTMLElement).style.width).toBe('40px')
  expect(ring.querySelector('[data-progress-part="indicator"]')).toBeNull()
  setSize('small')
  flush()
  expect((view.host.querySelector('[data-step-progress] [data-progress-part="body"]') as HTMLElement).style.width).toBe('32px')
  setStatus('error')
  flush()
  expect(rings()).toHaveLength(0)
})

// 点状：type="dot" 与 progressDot 均切到点状布局，当前点更大；percent 在点状模式不显示；progressDot 函数拿到默认点与步骤信息。
it('[steps.render.dot] dot mode and custom dot render', () => {
  const view = mount(() => <Steps type="dot" current={1} percent={50} items={items} />); dispose = view.dispose
  expect(view.host.firstElementChild!.getAttribute('data-steps-layout')).toBe('dot')
  const dots = [...view.host.querySelectorAll<HTMLElement>('[data-step-dot]')]
  expect(dots).toHaveLength(4)
  expect(view.host.querySelector('[data-step-icon]')).toBeNull()
  expect(dots[1].className).toContain('w-[10px]')
  expect(dots[2].className).toContain('w-[8px]')
  expect(view.host.querySelector('[data-step-progress]')).toBeNull()
  view.dispose()

  const render = vi.fn((dot, info) => <span data-custom={`${info.index}-${info.status}-${info.title}`}>{dot}</span>)
  const custom = mount(() => <Steps progressDot={render} current={1} items={[{ title: 'A', content: '甲' }, { title: 'B' }]} />); dispose = custom.dispose
  expect([...custom.host.querySelectorAll('[data-custom]')].map(el => el.getAttribute('data-custom'))).toEqual(['0-finish-A', '1-process-B'])
  expect(custom.host.querySelectorAll('[data-custom] > [data-step-dot]')).toHaveLength(2)
  expect(render.mock.calls[0][1].content).toBe('甲')
})

// 标题位置：titlePlacement=vertical 为居中堆叠布局，最后一项无连接线；labelPlacement 为别名；竖直方向忽略标题位置。
it('[steps.render.titlePlacement] vertical titles and alias', () => {
  const view = mount(() => <Steps titlePlacement="vertical" items={items} />); dispose = view.dispose
  const root = view.host.firstElementChild!
  expect(root.getAttribute('data-steps-layout')).toBe('stack')
  expect(stepEls(view.host)[0].className).toContain('items-center')
  expect(stepEls(view.host).map(el => !!el.querySelector('[data-step-rail]'))).toEqual([true, true, true, false])
  view.dispose()
  const alias = mount(() => <Steps labelPlacement="vertical" items={items} />); dispose = alias.dispose
  expect(alias.host.firstElementChild!.getAttribute('data-steps-layout')).toBe('stack')
  alias.dispose()
  const vertical = mount(() => <Steps orientation="vertical" titlePlacement="vertical" items={items} />); dispose = vertical.dispose
  expect(vertical.host.firstElementChild!.getAttribute('data-steps-layout')).toBe('vertical')
})

// 方向别名：orientation 优先于 direction；direction 单独使用仍生效；水平默认。
it('[steps.render.orientation] orientation wins over direction', () => {
  const [orientation, setOrientation] = createSignal<'horizontal' | 'vertical' | undefined>('horizontal')
  const view = mount(() => <Steps orientation={orientation()} direction="vertical" items={items} />); dispose = view.dispose
  const root = () => view.host.firstElementChild!
  expect(root().getAttribute('data-steps-orientation')).toBe('horizontal')
  setOrientation(undefined)
  flush()
  expect(root().getAttribute('data-steps-orientation')).toBe('vertical')
  expect(root().className).toContain('flex-col')
})

// 水平默认布局：连接线挂在标题内（最后一项没有），非首项 16px 起始内边距，最后一项不参与平分宽度。
it('[steps.render.inline] inline rail, padding and last item', () => {
  const view = mount(() => <Steps current={1} items={items} />); dispose = view.dispose
  const els = stepEls(view.host)
  expect(els.map(el => !!el.querySelector('[data-step-title] [data-step-rail]'))).toEqual([true, true, true, false])
  expect(els[0].className).not.toContain('ps-[16px]')
  expect(els[1].className).toContain('ps-[16px]')
  expect(els[3].className).toContain('flex-none')
  // finish 项之后的连接线为主色。
  expect(els[0].querySelector('[data-step-rail]')!.className).toContain('border-primary')
  expect(els[1].querySelector('[data-step-rail]')!.className).toContain('border-outline-variant')
})

// 详情：content 与 description 同义，同时设置时 content 优先；subTitle 渲染在标题内；JSX 与字符串图标都可用。
it('[steps.render.content] content / description / subTitle / icon', () => {
  const view = mount(() => <Steps items={[
    { title: '一', description: '旧描述' },
    { title: '二', content: '新内容', description: '被覆盖', subTitle: '子标题' },
    { title: '三', icon: 'i-mdi-account' },
    { title: '四', icon: <b data-jsx-icon>★</b> },
  ]} />); dispose = view.dispose
  const els = stepEls(view.host)
  expect(els[0].querySelector('[data-step-content]')!.textContent).toBe('旧描述')
  expect(els[1].querySelector('[data-step-content]')!.textContent).toBe('新内容')
  expect(els[1].querySelector('[data-step-title] [data-step-subtitle]')!.textContent).toBe('子标题')
  expect(els[2].querySelector('[data-step-icon] .i-mdi-account')).not.toBeNull()
  expect(els[3].querySelector('[data-step-icon] [data-jsx-icon]')).not.toBeNull()
  // 自定义图标无底色，不显示序号。
  expect(els[2].querySelector('[data-step-icon]')!.className).toContain('bg-transparent')
  expect(els[2].querySelector('[data-step-icon]')!.textContent).toBe('')
})

// 变体：默认 filled；outlined 保留描边外观。
it('[steps.render.variant] filled by default, outlined keeps borders', () => {
  const view = mount(() => <Steps current={1} items={items} />); dispose = view.dispose
  expect(stepEls(view.host)[0].querySelector('[data-step-icon]')!.className).toContain('bg-primary/10')
  view.dispose()
  const outlined = mount(() => <Steps variant="outlined" current={1} items={items} />); dispose = outlined.dispose
  const icon = stepEls(outlined.host)[0].querySelector('[data-step-icon]')!.className
  expect(icon).toContain('border-primary')
  expect(icon).not.toContain('bg-primary/10')
})

// 语义化：classNames / styles 对象写到对应节点；函数形式拿到合并默认值后的 props 并随之更新；单项 class / style 写在步骤项上。
it('[steps.render.semantic] object and function classNames / styles', () => {
  const [size, setSize] = createSignal<'default' | 'small'>('default')
  const view = mount(() => <Steps
    size={size()}
    current={1}
    classNames={{ root: 'c-root', item: 'c-item', itemIcon: 'c-icon', itemTitle: 'c-title', itemSubtitle: 'c-sub', itemContent: 'c-content', itemRail: 'c-rail' }}
    styles={info => ({ root: { 'margin-top': info.props.size === 'small' ? '4px' : '8px' }, itemTitle: { color: 'red' } })}
    items={[{ title: '一', subTitle: 's', content: 'c', class: 'own', style: { opacity: '0.5' } }, { title: '二' }]}
  />); dispose = view.dispose
  const root = view.host.firstElementChild as HTMLElement
  expect(root.className).toContain('c-root')
  for (const name of ['c-item', 'c-icon', 'c-title', 'c-sub', 'c-content', 'c-rail']) expect(view.host.querySelector(`.${name}`), name).not.toBeNull()
  const first = stepEls(view.host)[0]
  expect(first.className).toContain('own')
  expect(first.style.opacity).toBe('0.5')
  expect((first.querySelector('[data-step-title]') as HTMLElement).style.color).toBe('red')
  expect(root.style.marginTop).toBe('8px')
  setSize('small')
  flush()
  expect(root.style.marginTop).toBe('4px')
})
