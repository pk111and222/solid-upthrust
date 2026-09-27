import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it } from 'vitest'
import Progress from '../../../components/lib/Progress'
import { mount } from '../../utils/mount'

let view: ReturnType<typeof mount>
afterEach(() => view?.dispose())
const roots = () => [...view.host.children] as HTMLElement[]
const root = () => roots()[0]
const part = (el: Element, name: string) => el.querySelector<HTMLElement>(`[data-progress-part="${name}"]`)
const all = (el: Element, name: string) => [...el.querySelectorAll<HTMLElement>(`[data-progress-part="${name}"]`)]
const classes = (el: Element | null) => (el?.getAttribute('class') ?? '').split(/\s+/)

describe('Progress line', () => {
  // 默认线形：progressbar aria，body > rail > track + indicator，宽度 = percent，高 8px，数值 "30%"。
  it('[progress.line.default] default line structure', () => {
    view = mount(() => <Progress percent={30} />)
    const el = root()
    expect([el.getAttribute('role'), el.getAttribute('aria-valuenow'), el.getAttribute('aria-valuemin'), el.getAttribute('aria-valuemax')]).toEqual(['progressbar', '30', '0', '100'])
    expect([el.dataset.progressType, el.dataset.progressStatus]).toEqual(['line', 'normal'])
    expect(classes(el)).toEqual(expect.arrayContaining(['relative', 'w-full', 'text-[14px]']))
    const body = part(el, 'body')!
    expect([...body.children].map(c => (c as HTMLElement).dataset.progressPart)).toEqual(['rail', 'indicator'])
    const track = part(el, 'track')!
    expect([track.style.width, track.style.height]).toEqual(['30%', '8px'])
    expect(part(el, 'rail')!.style.height).toBe('8px')
    expect(classes(track)).toContain('bg-primary')
    expect(part(el, 'indicator')!.textContent).toBe('30%')
    expect(part(el, 'indicator')!.getAttribute('title')).toBe('30%')
  })

  // 状态：active 动画、exception / success 图标与颜色；≥100 自动 success；showInfo=false 不渲染数值。
  it('[progress.line.status] statuses, icons and showInfo', () => {
    view = mount(() => <>
      <Progress percent={50} status="active" />
      <Progress percent={70} status="exception" />
      <Progress percent={100} />
      <Progress percent={50} showInfo={false} />
      <Progress percent={100} size="small" />
    </>)
    const [active, exception, success, hidden, small] = roots()
    expect(classes(part(active, 'track'))).toContain('after:animate-progress-active')
    expect(classes(part(exception, 'track'))).toContain('bg-error')
    expect(part(exception, 'indicator')!.querySelector('[data-progress-icon="exception"]')!.className).toContain('i-mdi-close-circle')
    expect(classes(part(exception, 'indicator'))).toContain('text-error')
    expect(success.dataset.progressStatus).toBe('success')
    expect(classes(part(success, 'track'))).toContain('bg-[#52c41a]')
    expect(part(success, 'indicator')!.querySelector('[data-progress-icon="success"]')!.className).toContain('i-mdi-check-circle')
    expect(part(hidden, 'indicator')).toBeNull()
    expect(classes(small)).toContain('text-[12px]')
    expect(part(small, 'track')!.style.height).toBe('6px')
    expect(classes(part(small, 'indicator')!.firstElementChild)).toContain('text-[12px]')
  })

  // percent 钳制与响应式：-10 → 0%，120 → 100%，小数保留；aria 截断取整。
  it('[progress.line.clamp] clamps and reacts to percent', () => {
    const [percent, setPercent] = createSignal(-10)
    view = mount(() => <Progress percent={percent()} />)
    expect([part(root(), 'track')!.style.width, part(root(), 'indicator')!.textContent]).toEqual(['0%', '0%'])
    setPercent(99.9); flush()
    expect([part(root(), 'track')!.style.width, part(root(), 'indicator')!.textContent, root().getAttribute('aria-valuenow')]).toEqual(['99.9%', '99.9%', '99'])
    setPercent(120); flush()
    expect([part(root(), 'track')!.style.width, root().dataset.progressStatus]).toEqual(['100%', 'success'])
  })

  // 成功段、渐变、railColor / trailColor、端点、自定义尺寸（对象尺寸与 antd 一致忽略 strokeWidth）。
  it('[progress.line.colors] success segment, gradients and sizing', () => {
    view = mount(() => <>
      <Progress percent={60} success={{ percent: 30, strokeColor: 'red' }} />
      <Progress percent={50} strokeColor={{ from: '#108ee9', to: '#87d068' }} railColor="#eee" />
      <Progress percent={50} strokeColor={{ '100%': '#87d068', '0%': '#108ee9' }} trailColor="#ddd" strokeLinecap="butt" />
      <Progress percent={50} size={[300, 20]} />
      <Progress percent={50} size={{ width: 200 }} strokeWidth={10} />
    </>)
    const [seg, grad, stops, sized, obj] = roots()
    expect(seg.getAttribute('aria-valuenow')).toBe('30')
    const [, success] = all(seg, 'track')
    expect([success.dataset.progressTrack, success.style.width, success.style.backgroundColor]).toEqual(['success', '30%', 'red'])
    expect(part(seg, 'indicator')!.textContent).toBe('60%')
    expect(part(grad, 'track')!.style.background).toContain('linear-gradient(to right')
    expect(part(grad, 'rail')!.style.backgroundColor).toBe('#eee')
    expect(part(stops, 'track')!.style.background).toMatch(/linear-gradient\(to right, (#108ee9|rgb\(16, 142, 233\)) 0%/)
    expect(part(stops, 'rail')!.style.backgroundColor).toBe('#ddd')
    expect([part(stops, 'rail')!.style.borderRadius, part(stops, 'track')!.style.borderRadius]).toEqual(['0px', '0px'])
    expect([part(sized, 'body')!.style.width, part(sized, 'track')!.style.height]).toEqual(['300px', '20px'])
    expect([part(obj, 'body')!.style.width, part(obj, 'track')!.style.height]).toEqual(['200px', '8px'])
  })

  // 数值位置：inner 放进 track 并按对齐切换，亮色进度条用深色文字；outer start 前置；center outer 底部布局。
  it('[progress.line.position] percentPosition inner / outer', () => {
    view = mount(() => <>
      <Progress percent={50} percentPosition={{ align: 'start', type: 'inner' }} size={[300, 20]} strokeColor="#B7EB8F" />
      <Progress percent={60} percentPosition={{ align: 'end', type: 'inner' }} strokeColor="#001342" />
      <Progress percent={100} percentPosition={{ align: 'center', type: 'inner' }} />
      <Progress percent={60} percentPosition={{ align: 'start', type: 'outer' }} />
      <Progress percent={60} percentPosition={{ align: 'center', type: 'outer' }} />
    </>)
    const [start, end, center, outerStart, outerCenter] = roots()
    expect(part(start, 'indicator')!.parentElement!.dataset.progressPart).toBe('track')
    expect(classes(part(start, 'indicator'))).toEqual(expect.arrayContaining(['[justify-content:start]', 'text-black/45']))
    expect(classes(part(end, 'indicator'))).toEqual(expect.arrayContaining(['[justify-content:end]', 'text-white']))
    // inner 时 100% 也显示数值而非图标。
    expect(part(center, 'indicator')!.textContent).toBe('100%')
    expect(classes(part(center, 'indicator'))).toContain('justify-center')
    expect(classes(part(outerStart, 'indicator'))).toContain('order-[-1]')
    expect(classes(part(outerCenter, 'body'))).toEqual(expect.arrayContaining(['flex-col', 'gap-[4px]']))
  })

  // format：接收钳制后的 percent 与成功段；返回数字 0 也渲染；返回节点无 title。
  it('[progress.line.format] format receives percent and success', () => {
    view = mount(() => <>
      <Progress percent={120} success={{ percent: 40 }} format={(p, s) => `${p}/${s}`} />
      <Progress percent={30} format={() => 0 as never} />
      <Progress percent={30} format={() => <b>x</b>} />
      <Progress percent={100} format={() => 'Done'} />
    </>)
    const [a, zero, node, done] = roots()
    expect(part(a, 'indicator')!.textContent).toBe('100/40')
    expect(part(zero, 'indicator')!.textContent).toBe('0')
    expect(part(node, 'indicator')!.innerHTML).toBe('<b>x</b>')
    expect(part(node, 'indicator')!.hasAttribute('title')).toBe(false)
    expect(part(done, 'indicator')!.textContent).toBe('Done')
  })
})

describe('Progress steps', () => {
  // 步骤：点亮格数四舍五入；默认宽 14 高 8；small 宽 2；数组逐格着色；未点亮用 railColor。
  it('[progress.steps] step items, sizes and colors', () => {
    view = mount(() => <>
      <Progress percent={50} steps={3} />
      <Progress percent={30} steps={5} size="small" />
      <Progress percent={60} steps={5} strokeColor={['#52c41a', '#52c41a', '#ff4d4f']} railColor="#eee" />
      <Progress percent={50} steps={3} size={[20, 30]} />
      <Progress percent={50} steps={3} rounding={Math.floor} />
    </>)
    const [three, small, colored, sized, floor] = roots()
    const items = all(three, 'track')
    expect(items.map(i => i.dataset.progressStepActive)).toEqual(['true', 'true', 'false'])
    expect([items[0].style.width, items[0].style.height]).toEqual(['14px', '8px'])
    expect(classes(items[0])).toContain('bg-primary')
    expect(classes(items[2])).toContain('bg-on-surface/6')
    expect(part(three, 'indicator')!.textContent).toBe('50%')
    expect(all(small, 'track')[0].style.width).toBe('2px')
    const c = all(colored, 'track')
    expect(c.map(i => i.style.backgroundColor)).toEqual(['#52c41a', '#52c41a', '#ff4d4f', '#eee', '#eee'])
    expect([all(sized, 'track')[0].style.width, all(sized, 'track')[0].style.height]).toEqual(['20px', '30px'])
    expect(all(floor, 'track').map(i => i.dataset.progressStepActive)).toEqual(['true', 'false', 'false'])
  })
})

describe('Progress circle', () => {
  const circles = (el: Element) => [...el.querySelectorAll<SVGCircleElement>('circle')]

  // 圆形：120px、字号 24px，rail + 两条路径（成功段在后渲染但透明），dasharray 与 antd 一致；数值绝对居中。
  it('[progress.circle.default] circle geometry and info', () => {
    view = mount(() => <Progress type="circle" percent={75} />)
    const el = root()
    const body = part(el, 'body')!
    expect([body.style.width, body.style.height, body.style.fontSize]).toEqual(['120px', '120px', '24px'])
    const [rail, percent, success] = circles(el)
    expect(rail.dataset.progressPart).toBe('rail')
    expect(rail.getAttribute('r')).toBe('47')
    expect(rail.getAttribute('stroke-width')).toBe('6')
    expect(rail.style.strokeDasharray).toMatch(/^295\.309\d*px 295\.309/)
    expect([percent.dataset.progressPath, success.dataset.progressPath]).toEqual(['percent', 'success'])
    expect(Number(percent.style.strokeDashoffset.replace('px', ''))).toBeCloseTo(76.8274, 3)
    expect(success.getAttribute('opacity')).toBe('0')
    expect(classes(percent)).toContain('stroke-primary')
    expect(percent.getAttribute('stroke-linecap')).toBe('round')
    expect(part(el, 'indicator')!.textContent).toBe('75%')
    expect(classes(part(el, 'indicator'))).toEqual(expect.arrayContaining(['absolute', 'top-1/2', '-translate-y-1/2']))
  })

  // 圆形状态图标用 check / close（非圆形图标）；exception 路径着 error 色；dashboard 缺口 75°。
  it('[progress.circle.status] status icons and dashboard gap', () => {
    view = mount(() => <>
      <Progress type="circle" percent={70} status="exception" />
      <Progress type="circle" percent={100} />
      <Progress type="dashboard" percent={30} />
      <Progress type="dashboard" percent={30} gapDegree={50} gapPlacement="start" />
      <Progress type="dashboard" percent={30} gapPosition="top" />
    </>)
    const [exception, success, dashboard, placed, legacy] = roots()
    expect(part(exception, 'indicator')!.querySelector('[data-progress-icon]')!.className).toContain('i-mdi-close ')
    expect(classes(circles(exception)[1])).toContain('stroke-error')
    expect(part(success, 'indicator')!.querySelector('[data-progress-icon]')!.className).toContain('i-mdi-check ')
    expect(classes(circles(success)[1])).toContain('stroke-[#52c41a]')
    expect(circles(dashboard)[0].style.strokeDasharray).toMatch(/^233\.78\d*px/)
    expect(circles(dashboard)[0].style.transform).toContain('rotate(127.5deg)')
    expect(circles(placed)[0].style.strokeDasharray).toMatch(/^254\.29\d*px/)
    expect(circles(placed)[0].style.transform).toContain('rotate(205deg)')
    expect(circles(legacy)[0].style.transform).toContain('rotate(307.5deg)')
  })

  // 自定义尺寸与线宽、字符串颜色走内联 stroke、butt 端点、railColor。
  it('[progress.circle.custom] size, stroke color, linecap and rail color', () => {
    view = mount(() => <>
      <Progress type="circle" percent={30} size={80} strokeColor="red" railColor="#eee" strokeLinecap="butt" />
      <Progress type="circle" percent={30} size="small" strokeWidth={10} />
    </>)
    const [custom, small] = roots()
    expect(part(custom, 'body')!.style.width).toBe('80px')
    const [rail, percent] = circles(custom)
    expect(rail.getAttribute('stroke')).toBe('#eee')
    expect(percent.style.stroke).toBe('red')
    expect(classes(percent)).not.toContain('stroke-primary')
    expect(percent.getAttribute('stroke-linecap')).toBe('butt')
    expect(part(small, 'body')!.style.width).toBe('60px')
    expect(circles(small)[0].getAttribute('stroke-width')).toBe('10')
    expect(circles(small)[0].getAttribute('r')).toBe('45')
  })

  // 渐变圆：mask + foreignObject（conic），强制 butt，mask 路径白色描边且不带状态类。
  it('[progress.circle.gradient] gradient circle uses a conic mask', () => {
    view = mount(() => <Progress type="circle" percent={90} strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />)
    const el = root()
    expect(part(el, 'body')!.dataset.progressGradient).toBe('true')
    const mask = el.querySelector('mask')!
    const fo = el.querySelector('foreignObject')!
    expect(fo.getAttribute('mask')).toBe(`url(#${mask.id})`)
    const path = mask.querySelector('circle')!
    expect(path.getAttribute('stroke')).toBe('#FFF')
    expect(path.getAttribute('stroke-linecap')).toBe('butt')
    expect(classes(path)).not.toContain('stroke-primary')
    expect((fo.firstElementChild!.firstElementChild as HTMLElement).style.background).toContain('conic-gradient')
    // 同页两个渐变圆 mask id 不冲突。
    view.dispose()
    view = mount(() => <><Progress type="circle" percent={1} strokeColor={{ '0%': 'red' }} /><Progress type="circle" percent={1} strokeColor={{ '0%': 'red' }} /></>)
    const ids = [...view.host.querySelectorAll('mask')].map(m => m.id)
    expect(new Set(ids).size).toBe(2)
  })

  // 步骤圆：无导轨，按格渲染路径；未点亮格用 railColor；{ count, gap } 响应式。
  it('[progress.circle.steps] circle steps', () => {
    const [count, setCount] = createSignal(5)
    view = mount(() => <>
      <Progress type="dashboard" steps={8} percent={50} railColor="rgba(0, 0, 0, 0.06)" strokeWidth={20} />
      <Progress type="circle" percent={100} steps={{ count: count(), gap: 7 }} strokeWidth={20} />
    </>)
    const [dashboard, circle] = roots()
    expect(part(dashboard, 'rail')).toBeNull()
    const paths = circles(dashboard)
    expect(paths).toHaveLength(8)
    expect(paths.map(p => p.dataset.progressPath)).toEqual(['0', '1', '2', '3', '4', '5', '6', '7'])
    expect(paths.slice(4).every(p => p.style.stroke === 'rgba(0, 0, 0, 0.06)')).toBe(true)
    expect(classes(paths[0])).toContain('stroke-primary')
    expect(circles(circle)).toHaveLength(5)
    expect(classes(circles(circle)[0])).toContain('stroke-[#52c41a]')
    setCount(3); flush()
    expect(circles(roots()[1])).toHaveLength(3)
  })

  // 直径 ≤ 20：行内圆，数值不在圆内（改由 Tooltip 展示）；线宽默认补到 3px 视觉宽度。
  it('[progress.circle.micro] micro circle hides inline info', () => {
    view = mount(() => <Progress type="circle" percent={60} size={14} strokeWidth={20} format={n => `In progress, ${n}%`} />)
    const el = root()
    expect(classes(el)).toContain('leading-none')
    expect(part(el, 'body')!.style.width).toBe('14px')
    expect(part(el, 'indicator')).toBeNull()
    expect(circles(el)[0].getAttribute('stroke-width')).toBe('20')
  })
})

describe('Progress semantic', () => {
  // classNames / styles 对象与函数形式；class / style 与原生属性透传。
  it('[progress.semantic] semantic classNames, styles and attributes', () => {
    view = mount(() => <>
      <Progress
        id="p" data-x="1" class="extra" style={{ margin: '4px' }} percent={40}
        classNames={{ root: 'r', body: 'b', rail: 'rl', track: 't', indicator: 'i' }}
        styles={info => ({ track: { 'border-radius': '8px', opacity: info.props.percent! / 100 }, rail: { 'background-color': 'rgba(0, 0, 0, 0.1)' } })}
      />
      <Progress type="circle" percent={40} classNames={{ rail: 'crl', track: 'ct' }} styles={{ body: { padding: '2px' } }} />
    </>)
    const [line, circle] = roots()
    expect([line.id, line.dataset.x, line.style.margin]).toEqual(['p', '1', '4px'])
    expect(classes(line)).toEqual(expect.arrayContaining(['extra', 'r']))
    for (const [name, cls] of [['body', 'b'], ['rail', 'rl'], ['track', 't'], ['indicator', 'i']]) expect(classes(part(line, name))).toContain(cls)
    expect([part(line, 'track')!.style.borderRadius, part(line, 'track')!.style.opacity]).toEqual(['8px', '0.4'])
    expect(part(line, 'rail')!.style.backgroundColor).toBe('rgba(0, 0, 0, 0.1)')
    expect(classes(part(circle, 'rail'))).toContain('crl')
    expect(classes(all(circle, 'track')[0])).toContain('ct')
    expect(part(circle, 'body')!.style.padding).toBe('2px')
  })
})
