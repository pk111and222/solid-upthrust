import { createSignal, flush } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Statistic, { StatisticCountdown, StatisticTimer, type StatisticTimerType } from '../../../components/lib/Statistic'
import { mount } from '../../utils/mount'

let view: ReturnType<typeof mount>
afterEach(() => view?.dispose())
const root = (host: Element = view.host) => host.firstElementChild as HTMLElement
const part = (name: string, el: Element = view.host) => el.querySelector<HTMLElement>(`[data-statistic-part="${name}"]`)
const partsText = (el: Element = view.host) => [...el.querySelectorAll<HTMLElement>('[data-statistic-part="int"],[data-statistic-part="decimal"]')].map(e => e.textContent)
const classes = (el: Element) => el.className.split(/\s+/)

describe('Statistic DOM contracts', () => {
  // 结构：header > title、content > prefix + value + suffix；整数与小数分段；样式类对齐 antd token。
  it('[statistic.structure] semantic structure and classes', () => {
    view = mount(() => <Statistic title="账户余额" value={112893} precision={2} prefix="¥" suffix="元" />)
    const header = part('header')!, title = part('title')!, content = part('content')!
    expect(root().children[0]).toBe(header); expect(header.firstElementChild).toBe(title)
    expect(title.textContent).toBe('账户余额')
    expect([...content.children].map(el => el.getAttribute("data-statistic-part"))).toEqual(['prefix', 'value', 'suffix'])
    expect(partsText()).toEqual(['112,893', '.00'])
    expect(content.textContent).toBe('¥112,893.00元')
    expect(classes(root())).toEqual(expect.arrayContaining(['text-on-surface', 'text-[14px]', 'leading-[1.5714]']))
    expect(classes(header)).toContain('pb-[4px]')
    expect(classes(title)).toEqual(expect.arrayContaining(['text-on-surface/45', 'text-[14px]']))
    expect(classes(content)).toEqual(expect.arrayContaining(['text-on-surface', 'text-[24px]']))
    expect(classes(part('value')!)).toEqual(expect.arrayContaining(['inline-block', '[direction:ltr]']))
    expect(classes(part('prefix')!)).toContain('me-[4px]'); expect(classes(part('suffix')!)).toContain('ms-[4px]')
  })

  // 默认值 0；无 title 时不渲染 header；prefix/suffix 为 0 仍渲染，false / '' 不渲染。
  it('[statistic.defaults] default value and renderable rules', () => {
    view = mount(() => <>
      <Statistic />
      <Statistic title={0} prefix={0} suffix={false} />
      <Statistic title="" prefix="" suffix={null} />
    </>)
    const [a, b, c] = [...view.host.children] as HTMLElement[]
    expect(part('header', a)).toBeNull(); expect(partsText(a)).toEqual(['0'])
    expect(part('title', b)!.textContent).toBe('0'); expect(part('prefix', b)!.textContent).toBe('0'); expect(part('suffix', b)).toBeNull()
    expect([part('header', c), part('prefix', c), part('suffix', c)]).toEqual([null, null, null])
  })

  // 格式化：截断不四舍五入、数字字符串分组、自定义分隔符、非法值原样显示在 value 内且不分段。
  it('[statistic.format] number formatting through the component', () => {
    view = mount(() => <>
      <Statistic value={1.999} precision={2} />
      <Statistic value="1234567.8" />
      <Statistic value={1234567.89} groupSeparator="." decimalSeparator="," />
      <Statistic value={-0.5} />
      <Statistic value="abc" />
      <Statistic value={1e21} />
    </>)
    const els = [...view.host.children] as HTMLElement[]
    expect(els.slice(0, 4).map(el => partsText(el))).toEqual([['1', '.99'], ['1,234,567', '.8'], ['1.234.567', ',89'], ['-0', '.5']])
    expect(part('value', els[4])!.textContent).toBe('abc'); expect(partsText(els[4])).toEqual([])
    expect(part('value', els[5])!.textContent).toBe('1e+21')
  })

  // formatter 接管展示且返回 0 / '' 也照常渲染（不回落内置格式化）；valueRender 包装 value 节点。
  it('[statistic.formatter.valueRender] custom rendering', () => {
    const formatter = vi.fn((value: number | string) => (Number(value) > 0 ? 0 : ''))
    view = mount(() => <>
      <Statistic value={5} formatter={formatter} />
      <Statistic value={-5} formatter={formatter} />
      <Statistic value={7} valueRender={node => <em data-wrap>{node}</em>} />
    </>)
    const [a, b, c] = [...view.host.children] as HTMLElement[]
    expect(formatter).toHaveBeenCalledWith(5)
    expect(part('value', a)!.textContent).toBe('0'); expect(partsText(a)).toEqual([])
    expect(part('value', b)!.textContent).toBe(''); expect(partsText(b)).toEqual([])
    const wrap = c.querySelector<HTMLElement>('[data-wrap]')!
    expect(wrap.parentElement).toBe(part('content', c)); expect(wrap.firstElementChild).toBe(part('value', c))
  })

  // loading：内容区换成骨架屏（无段落、带动画、上边距 16px），标题保留；关闭后恢复内容。
  it('[statistic.loading] skeleton replaces the content', () => {
    const [loading, setLoading] = createSignal(true, { ownedWrite: true })
    view = mount(() => <Statistic title="活跃用户" value={112893} loading={loading()} />)
    expect(part('title')!.textContent).toBe('活跃用户')
    expect(part('content')).toBeNull()
    const skeleton = root().children[1] as HTMLElement
    expect(skeleton.getAttribute('aria-hidden')).toBe('true')
    expect(classes(skeleton)).toContain('pt-[16px]')
    expect(skeleton.textContent).toBe('')
    setLoading(false); flush()
    expect(partsText()).toEqual(['112,893'])
  })

  // 语义化：classNames / styles 作用到七个节点；valueStyle 兼容并被 styles.content 覆盖；class/style 合并；属性与事件透传。
  it('[statistic.semantic] classNames, styles, valueStyle and attrs', () => {
    const enter = vi.fn(), leave = vi.fn()
    const names = ['root', 'header', 'title', 'content', 'value', 'prefix', 'suffix'] as const
    view = mount(() => <Statistic
      title="t" value={1} prefix="p" suffix="s" id="stat" aria-label="统计" data-kind="kpi"
      onMouseEnter={enter} onMouseLeave={leave} class="own" style={{ margin: '3px' }}
      valueStyle={{ color: 'red', 'font-size': '30px' }}
      classNames={Object.fromEntries(names.map(n => [n, `c-${n}`]))}
      styles={{ root: { padding: '2px' }, content: { color: 'blue' }, value: { 'background-color': 'yellow' }, title: { color: 'green' }, header: { 'padding-bottom': '6px' }, prefix: { opacity: '0.5' }, suffix: { opacity: '0.6' } }}
    />)
    const el = root()
    expect(classes(el)).toEqual(expect.arrayContaining(['own', 'c-root']))
    for (const name of names.slice(1)) expect(classes(part(name)!)).toContain(`c-${name}`)
    expect([el.style.margin, el.style.padding, el.id, el.getAttribute('aria-label'), el.dataset.kind]).toEqual(['3px', '2px', 'stat', '统计', 'kpi'])
    expect([part('content')!.style.color, part('content')!.style.fontSize]).toEqual(['blue', '30px'])
    expect(part('value')!.style.backgroundColor).toBe('yellow')
    expect([part('title')!.style.color, part('header')!.style.paddingBottom, part('prefix')!.style.opacity, part('suffix')!.style.opacity]).toEqual(['green', '6px', '0.5', '0.6'])
    el.dispatchEvent(new MouseEvent('mouseenter')); el.dispatchEvent(new MouseEvent('mouseleave'))
    expect([enter.mock.calls.length, leave.mock.calls.length]).toEqual([1, 1])
  })

  // 响应式：value / precision 变化更新分段，prefix 节点只解析一次。
  it('[statistic.reactive] value and precision updates', () => {
    const [value, setValue] = createSignal<number | string>(1000, { ownedWrite: true })
    const [precision, setPrecision] = createSignal<number | undefined>(undefined, { ownedWrite: true })
    const created = vi.fn()
    const Icon = (): JSX.Element => { created(); return <i /> }
    view = mount(() => <Statistic value={value()} precision={precision()} prefix={<Icon />} />)
    expect(partsText()).toEqual(['1,000'])
    setValue(98765.4321); setPrecision(2); flush()
    expect(partsText()).toEqual(['98,765', '.43'])
    setValue('x'); flush()
    expect(part('value')!.textContent).toBe('x')
    expect(created).toHaveBeenCalledTimes(1)
  })
})

describe('Statistic.Timer', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(Date.UTC(2026, 0, 1))) })
  afterEach(() => { vi.useRealTimers() })
  const tick = (ms: number) => { vi.advanceTimersByTime(ms); flush() }
  const text = () => part('value')!.textContent

  // 倒计时：默认 HH:mm:ss 且小时吸收天数；每 1000/60 ms 刷新并 onChange 未钳制差值；越过目标后 onFinish 一次并停止刷新；title 属性移除。
  it('[statistic.timer.countdown] ticks, change, finish once and stop', () => {
    const onChange = vi.fn(), onFinish = vi.fn()
    const start = Date.now()
    view = mount(() => <StatisticTimer type="countdown" value={start + 2 * 86400000 + 1500} onChange={onChange} onFinish={onFinish} />)
    expect(text()).toBe('48:00:01')
    expect(part('value')!.hasAttribute('title')).toBe(false)
    expect(onChange).not.toHaveBeenCalled()
    tick(1000 / 60)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toBeCloseTo(2 * 86400000 + 1500 - 1000 / 60, -1)
    view.dispose()
    // 短目标：跨过终点时触发 onFinish 一次，显示钳制为 0，之后不再刷新。
    onChange.mockClear()
    view = mount(() => <StatisticTimer type="countdown" value={Date.now() + 100} onChange={onChange} onFinish={onFinish} />)
    tick(90); expect(onFinish).not.toHaveBeenCalled()
    tick(50)
    expect(onFinish).toHaveBeenCalledTimes(1)
    expect(text()).toBe('00:00:00')
    const calls = onChange.mock.calls.length
    expect(onChange.mock.calls.at(-1)![0]).toBeLessThan(0)
    tick(2000)
    expect([onFinish.mock.calls.length, onChange.mock.calls.length]).toEqual([1, calls])
    expect(vi.getTimerCount()).toBe(0)
  })

  // 内联表达式 value={Date.now() + x} 不随刷新漂移：props getter 只在依赖变化时重新求值。
  it('[statistic.timer.inline-target] inline target does not drift', () => {
    view = mount(() => <StatisticTimer type="countdown" value={Date.now() + 3000} format="ss" />)
    expect(text()).toBe('03')
    tick(1020); expect(text()).toBe('01')
    tick(1000); expect(text()).toBe('00')
  })

  // 已过期的目标：挂载时不立即 onFinish（与 antd 一致，首个刷新周期才触发）。
  it('[statistic.timer.expired] expired target finishes on the first tick', () => {
    const onFinish = vi.fn()
    view = mount(() => <StatisticCountdown value={Date.now() - 1000} onFinish={onFinish} />)
    expect(text()).toBe('00:00:00'); expect(onFinish).not.toHaveBeenCalled()
    tick(20); expect(onFinish).toHaveBeenCalledTimes(1)
    tick(1000); expect(onFinish).toHaveBeenCalledTimes(1)
  })

  // 正计时：从 value 起计，onChange 为 现在 - 起点，永不 onFinish；未来起点显示 0。
  it('[statistic.timer.countup] counts up and never finishes', () => {
    const onChange = vi.fn(), onFinish = vi.fn()
    view = mount(() => <StatisticTimer type="countup" value={Date.now() - 61000} format="mm:ss" onChange={onChange} onFinish={onFinish} />)
    expect(text()).toBe('01:01')
    tick(1020)
    expect(text()).toBe('01:02')
    expect(onChange.mock.calls.at(-1)![0]).toBeGreaterThanOrEqual(62000 - 20)
    expect(onFinish).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(1)
  })

  // value / type 变化重启计时器（已结束的倒计时换新目标后恢复刷新）；卸载清理 interval。
  it('[statistic.timer.restart] restarts on value/type change and cleans up', () => {
    const [value, setValue] = createSignal(Date.now() + 50, { ownedWrite: true })
    const [type, setType] = createSignal<StatisticTimerType>('countdown', { ownedWrite: true })
    const onFinish = vi.fn()
    view = mount(() => <StatisticTimer type={type()} value={value()} format="ss" onFinish={onFinish} />)
    tick(100)
    expect(onFinish).toHaveBeenCalledTimes(1); expect(vi.getTimerCount()).toBe(0)
    setValue(Date.now() + 5000); flush()
    expect(text()).toBe('05'); expect(vi.getTimerCount()).toBe(1)
    tick(1000); expect(text()).toBe('04')
    setType('countup'); flush()
    expect(vi.getTimerCount()).toBe(1)
    expect(text()).toBe('00')
    tick(10000)
    expect(text()).toBe('06'); expect(onFinish).toHaveBeenCalledTimes(1)
    view.dispose()
    expect(vi.getTimerCount()).toBe(0)
  })

  // value 接受日期字符串与 Date；自定义格式含毫秒与转义文本；无法解析的目标显示 0 且不结束。
  it('[statistic.timer.values] date values, format and invalid target', () => {
    const onFinish = vi.fn()
    const target = new Date(Date.now() + 3723004)
    view = mount(() => <>
      <StatisticTimer type="countdown" value={target.toISOString()} format="H [时] m [分] s [秒] SSS" />
      <StatisticTimer type="countdown" value={target} format="D 天 HH:mm" />
      <StatisticTimer type="countdown" value="not a date" onFinish={onFinish} />
    </>)
    const [a, b, c] = [...view.host.children] as HTMLElement[]
    expect(part('value', a)!.textContent).toBe('1 时 2 分 3 秒 004')
    expect(part('value', b)!.textContent).toBe('0 天 01:02')
    expect(part('value', c)!.textContent).toBe('00:00:00')
    tick(1000); expect(onFinish).not.toHaveBeenCalled()
  })

  // Timer 保留 Statistic 的标题、前后缀、loading 与语义化；loading 时计时器仍运行。
  it('[statistic.timer.passthrough] Statistic props pass through', () => {
    const [loading, setLoading] = createSignal(true, { ownedWrite: true })
    const onChange = vi.fn()
    view = mount(() => <Statistic.Timer type="countdown" title="剩余" prefix="⏱" suffix="后" loading={loading()} value={Date.now() + 10000} classNames={{ value: 'tab' }} onChange={onChange} />)
    expect(part('title')!.textContent).toBe('剩余'); expect(part('content')).toBeNull()
    tick(100); expect(onChange).toHaveBeenCalled()
    setLoading(false); flush()
    expect(part('content')!.textContent).toBe('⏱00:00:09后')
    expect(classes(part('value')!)).toContain('tab')
  })
})
