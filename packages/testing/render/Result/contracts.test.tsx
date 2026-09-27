import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it } from 'vitest'
import Result from '../../../components/lib/Result'
import { mount } from '../../utils/mount'

let view: ReturnType<typeof mount>
afterEach(() => view?.dispose())
const root = () => view.host.firstElementChild as HTMLElement
const part = (name: string) => root().querySelector<HTMLElement>(`[data-result-part="${name}"]`)
const classes = (el: Element | null) => (el?.getAttribute('class') ?? '').split(/\s+/)

describe('Result DOM contracts', () => {
  // 默认 info：根 48px 32px；图标区 mb 24px 居中、72px；antd ExclamationCircleFilled 路径；无标题等空区域。
  it('[result.default] info status icon and root spacing', () => {
    view = mount(() => <Result />)
    expect(classes(root())).toEqual(expect.arrayContaining(['py-[48px]', 'px-[32px]']))
    expect(root().dataset.resultStatus).toBe('info')
    const icon = part('icon')!
    expect(classes(icon)).toEqual(expect.arrayContaining(['mb-[24px]', 'text-center', 'text-primary', '[&>*]:text-[72px]']))
    const span = icon.firstElementChild as HTMLElement
    expect([span.getAttribute('role'), span.getAttribute('aria-label'), span.dataset.resultIcon]).toEqual(['img', 'exclamation-circle', 'info'])
    expect(span.querySelector('svg')!.getAttribute('viewBox')).toBe('64 64 896 896')
    expect([...root().children].map(el => (el as HTMLElement).dataset.resultPart)).toEqual(['icon'])
  })

  // 四种图标状态各自的颜色与图标；未知状态回落 info 图标。
  it('[result.status] status colors and icons', () => {
    const [status, setStatus] = createSignal<'success' | 'error' | 'warning' | 'info'>('success')
    view = mount(() => <Result status={status()} />)
    const expected = { success: ['text-[#52c41a]', 'check-circle'], error: ['text-[#ff4d4f]', 'close-circle'], warning: ['text-[#faad14]', 'warning'], info: ['text-primary', 'exclamation-circle'] } as const
    for (const s of ['success', 'error', 'warning', 'info'] as const) {
      setStatus(s); flush()
      expect(classes(part('icon'))).toContain(expected[s][0])
      expect(part('icon')!.firstElementChild!.getAttribute('aria-label')).toBe(expected[s][1])
    }
  })

  // 异常状态：字符串与数字都渲染 antd 插画；图标区带 250×295 居中与 image 标记；无默认标题。
  it('[result.exception] 403 / 404 / 500 images for string and number status', () => {
    const [status, setStatus] = createSignal<403 | '404' | 500>(403)
    view = mount(() => <Result status={status()} icon={null} />)
    const check = (title: string, width: string) => {
      const icon = part('icon')!
      expect(icon.dataset.resultImage).toBe('true')
      expect(classes(icon)).toEqual(expect.arrayContaining(['w-[250px]', 'h-[295px]', 'm-auto']))
      expect(classes(icon)).not.toContain('text-primary')
      const svg = icon.querySelector('svg')!
      expect([svg.querySelector('title')?.textContent, svg.getAttribute('width'), svg.getAttribute('height')]).toEqual([title, width, '294'])
      expect(part('title')).toBeNull()
    }
    check('Unauthorized', '251')
    setStatus('404'); flush(); check('No Found', '252')
    setStatus(500); flush(); check('Server Error', '254')
    expect(root().dataset.resultStatus).toBe('500')
  })

  // 自定义 icon 替换内置图标；null / false 隐藏图标区；'' 视为未传（回落内置）。
  it('[result.icon] custom icon, hidden icon and empty fallback', () => {
    const [icon, setIcon] = createSignal<unknown>(<i data-x>*</i>)
    view = mount(() => <Result status="success" icon={icon() as never} />)
    expect(part('icon')!.querySelector('[data-x]')).not.toBeNull()
    setIcon(null); flush(); expect(part('icon')).toBeNull()
    setIcon(false); flush(); expect(part('icon')).toBeNull()
    setIcon(''); flush(); expect(part('icon')!.firstElementChild!.getAttribute('aria-label')).toBe('check-circle')
  })

  // 区域顺序：icon → title → subTitle → extra → body；类契约与数字 0 渲染。
  it('[result.parts] title, subtitle, extra and body', () => {
    view = mount(() => <Result title={0 as never} subTitle="sub" extra={[<button>a</button>, <button>b</button>]}><p>body</p></Result>)
    expect([...root().children].map(el => (el as HTMLElement).dataset.resultPart)).toEqual(['icon', 'title', 'subTitle', 'extra', 'body'])
    expect(part('title')!.textContent).toBe('0')
    expect(classes(part('title'))).toEqual(expect.arrayContaining(['my-[8px]', 'text-[24px]', 'leading-[32px]', 'text-center']))
    expect(classes(part('subTitle'))).toEqual(expect.arrayContaining(['text-on-surface/45', 'text-[14px]', 'leading-[22px]']))
    expect(classes(part('extra'))).toEqual(expect.arrayContaining(['mt-[24px]', '[&>*]:me-[8px]', '[&>*:last-child]:me-0']))
    expect(part('extra')!.querySelectorAll('button')).toHaveLength(2)
    expect(classes(part('body'))).toEqual(expect.arrayContaining(['mt-[24px]', 'py-[24px]', 'px-[40px]', 'bg-on-surface/2']))
  })

  // 空值：undefined / null / false / '' 不渲染对应区域；空数组 extra 也不渲染。
  it('[result.empty] non-renderable values skip their sections', () => {
    view = mount(() => <Result title="" subTitle={false as never} extra={[]}>{null}</Result>)
    expect([...root().children].map(el => (el as HTMLElement).dataset.resultPart)).toEqual(['icon'])
  })

  // 语义化：对象与函数形式；class / style 合并；原生属性透传。
  it('[result.semantic] classNames / styles objects and functions with attrs', () => {
    view = mount(() => <>
      <Result
        id="r1" aria-label="result" data-x="1" class="custom" style={{ margin: '4px' }} title="t" subTitle="s" extra={<b>e</b>}
        classNames={{ root: 'cr', icon: 'ci', title: 'ct', subTitle: 'cs', extra: 'ce', body: 'cb' }}
        styles={{ root: { padding: '16px' }, title: { color: 'red' }, body: { padding: '12px' } }}
      >body</Result>
      <Result status="error" title="t" classNames={info => ({ root: `s-${info.props.status}` })} styles={info => ({ title: { color: info.props.status === 'error' ? 'red' : 'green' } })} />
    </>)
    const [a, b] = [...view.host.children] as HTMLElement[]
    expect([a.id, a.getAttribute('aria-label'), a.dataset.x]).toEqual(['r1', 'result', '1'])
    expect(classes(a)).toEqual(expect.arrayContaining(['custom', 'cr']))
    expect(a.style.margin).toBe('4px')
    expect(a.style.padding).toBe('16px')
    for (const [name, cls] of [['icon', 'ci'], ['title', 'ct'], ['subTitle', 'cs'], ['extra', 'ce'], ['body', 'cb']]) expect(classes(a.querySelector(`[data-result-part="${name}"]`))).toContain(cls)
    expect((a.querySelector('[data-result-part="title"]') as HTMLElement).style.color).toBe('red')
    expect((a.querySelector('[data-result-part="body"]') as HTMLElement).style.padding).toBe('12px')
    expect(classes(b)).toContain('s-error')
    expect((b.querySelector('[data-result-part="title"]') as HTMLElement).style.color).toBe('red')
  })
})
