import { createSignal, flush } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Spin from '../../../components/lib/Spin'
import { mount } from '../../utils/mount'

let view: ReturnType<typeof mount> | undefined
afterEach(() => { view?.dispose(); view = undefined; vi.useRealTimers(); Spin.setDefaultIndicator(undefined) })
const part = (name: string, root: ParentNode = document) => root.querySelector<HTMLElement>(`[data-spin-part="${name}"]`)
const classes = (el: Element | null | undefined) => (el?.getAttribute('class') ?? '').split(/\s+/)

describe('Spin DOM contracts', () => {
  beforeEach(() => { document.body.innerHTML = '' })

  // 独立模式：root 即 section（inline-flex 纵向、gap 12px、主色），aria-busy / aria-live；四点方阵 20px，点位与延迟按 antd。
  it('[spin.default] standalone section with 4-dot indicator', () => {
    view = mount(() => <Spin />)
    const root = part('root')!
    expect(classes(root)).toEqual(expect.arrayContaining(['inline-flex', 'flex-col', 'gap-sm', 'text-primary']))
    expect([root.getAttribute('aria-busy'), root.getAttribute('aria-live')]).toEqual(['true', 'polite'])
    const holder = part('indicator')!
    expect(classes(holder)).toEqual(expect.arrayContaining(['text-[20px]', 'w-[1em]', 'h-[1em]']))
    const dots = holder.querySelectorAll('i')
    expect(dots).toHaveLength(4)
    expect(classes(dots[1])).toEqual(expect.arrayContaining(['top-0', 'end-0', '[animation-delay:0.4s]']))
    expect(part('section')).toBeNull()
    expect(part('container')).toBeNull()
  })

  // 尺寸：small 14px / middle 20px / large 32px；自定义 indicator 同样按尺寸设字号。
  it('[spin.size] size maps to the holder font-size', () => {
    const [size, setSize] = createSignal<'small' | 'middle' | 'large'>('small')
    view = mount(() => <><Spin size={size()} /><Spin size={size()} indicator={<b data-custom>x</b>} /></>)
    const holders = document.querySelectorAll('[data-spin-part="indicator"]')
    expect(classes(holders[0])).toContain('text-[14px]')
    expect(classes(holders[1])).toContain('text-[14px]')
    expect(holders[1].querySelector('[data-custom]')).not.toBeNull()
    setSize('large'); flush()
    expect(classes(holders[0])).toContain('text-[32px]')
  })

  // 嵌套：section 绝对居中压在容器上；加载中容器 0.5 透明、蒙层 0.4 并拦截指针；停止后移除指示器、容器恢复。
  it('[spin.nested] overlay section and dimmed container', () => {
    const [spinning, setSpinning] = createSignal(true)
    view = mount(() => <Spin spinning={spinning()} description="Loading"><p data-child>content</p></Spin>)
    const section = part('section')!
    expect(classes(section)).toEqual(expect.arrayContaining(['absolute', 'top-1/2', 'start-1/2', 'z-1']))
    expect(part('description', section)!.textContent).toBe('Loading')
    const container = part('container')!
    expect(container.querySelector('[data-child]')).not.toBeNull()
    expect(classes(container)).toEqual(expect.arrayContaining(['opacity-50', 'pointer-events-none', 'after:opacity-40', 'after:z-10']))
    setSpinning(false); flush()
    expect(part('section')).toBeNull()
    expect(classes(part('container'))).toContain('after:opacity-0')
    expect(part('root')!.getAttribute('aria-busy')).toBe('false')
  })

  // delay：开始加载在 delay 内不出现；超过后出现；停止立即隐藏；delay 内结束则全程不出现。
  it('[spin.delay] debounced show, immediate hide', () => {
    vi.useFakeTimers()
    const [spinning, setSpinning] = createSignal(true)
    view = mount(() => <Spin spinning={spinning()} delay={500} />)
    expect(part('indicator')).toBeNull()
    vi.advanceTimersByTime(499); flush()
    expect(part('indicator')).toBeNull()
    vi.advanceTimersByTime(1); flush()
    expect(part('indicator')).not.toBeNull()
    setSpinning(false); flush()
    expect(part('indicator')).toBeNull()
    setSpinning(true); flush()
    vi.advanceTimersByTime(200); flush()
    setSpinning(false); flush()
    vi.advanceTimersByTime(1000); flush()
    expect(part('indicator')).toBeNull()
  })

  // fullscreen：fixed 铺满、45% 黑色遮罩、z 1000，停止时淡出且不拦截指针；指示器与描述为白色。
  it('[spin.fullscreen] backdrop loader toggles opacity', () => {
    const [spinning, setSpinning] = createSignal(true)
    view = mount(() => <Spin fullscreen spinning={spinning()} description="Loading" />)
    const root = part('root')!
    expect(classes(root)).toEqual(expect.arrayContaining(['fixed', 'inset-0', 'bg-black/45', 'z-1000', 'opacity-100']))
    expect(classes(part('section'))).toContain('text-white')
    expect(classes(part('description'))).toContain('text-white')
    setSpinning(false); flush()
    expect(classes(root)).toEqual(expect.arrayContaining(['opacity-0', 'pointer-events-none']))
  })

  // percent：>0 时点阵缩小隐藏并显示 progressbar 圆环（dasharray 按比例）；回到 0 圆环保留但隐藏；auto 每 200ms 递增。
  it('[spin.percent] progress ring and auto estimation', () => {
    vi.useFakeTimers()
    const [percent, setPercent] = createSignal<number | 'auto'>(0)
    view = mount(() => <Spin percent={percent()} />)
    expect(part('progress')).toBeNull()
    setPercent(50); flush()
    expect(classes(part('indicator'))).toEqual(expect.arrayContaining(['[transform:scale(0.3)]', 'opacity-0']))
    const bar = document.querySelector('[role="progressbar"]')!
    expect(bar.getAttribute('aria-valuenow')).toBe('50')
    const circumference = 40 * 2 * Math.PI
    const dash = (bar.querySelectorAll('circle')[1] as SVGElement).style.strokeDasharray.split(/[\s,]+/).map(Number)
    expect(dash[0]).toBeCloseTo(circumference / 2)
    expect(dash[1]).toBeCloseTo(circumference / 2)
    setPercent(0); flush()
    expect(classes(part('progress'))).toContain('opacity-0')
    setPercent('auto'); flush()
    vi.advanceTimersByTime(400); flush()
    expect(Number(bar.getAttribute('aria-valuenow'))).toBeCloseTo(5 + 95 * 0.05)
  })

  // 语义化：classNames / styles（对象或函数，函数拿到合并后的 props）落到 root / section / indicator / description / container；
  // 废弃的 tip 与 wrapperClass 仍兼容；rest 属性透传到根。
  it('[spin.semantic] classNames / styles per part and deprecated aliases', () => {
    view = mount(() => <>
      <Spin data-x="1" id="s1" classNames={{ root: 'r', section: 's', indicator: 'i', description: 'd' }} description="D"
        styles={info => ({ indicator: { color: info.props.size === 'small' ? 'red' : 'blue' } })} size="small" />
      <Spin tip="T" wrapperClass="w" classNames={{ container: 'c', section: 'ns' }} styles={{ container: { color: 'green' } }}><span /></Spin>
    </>)
    const [a, b] = document.querySelectorAll<HTMLElement>('[data-spin-part="root"]')
    expect([a.dataset.x, a.id]).toEqual(['1', 's1'])
    expect(classes(a)).toEqual(expect.arrayContaining(['r', 's']))
    expect(part('indicator', a)!.classList.contains('i')).toBe(true)
    expect(part('indicator', a)!.style.color).toBe('red')
    expect(part('description', a)!.classList.contains('d')).toBe(true)
    expect(classes(b)).toContain('w')
    expect(part('section', b)!.classList.contains('ns')).toBe(true)
    expect(part('description', b)!.textContent).toBe('T')
    expect(part('container', b)!.classList.contains('c')).toBe(true)
    expect(part('container', b)!.style.color).toBe('green')
  })

  // Spin.setDefaultIndicator：全局默认指示器（工厂形式可同时渲染多个），显式 indicator 优先。
  it('[spin.default-indicator] static default indicator', () => {
    Spin.setDefaultIndicator(() => <em data-global>g</em>)
    view = mount(() => <><Spin /><Spin /><Spin indicator={<b data-own>o</b>} /></>)
    expect(document.querySelectorAll('[data-global]')).toHaveLength(2)
    expect(document.querySelectorAll('[data-own]')).toHaveLength(1)
  })
})
