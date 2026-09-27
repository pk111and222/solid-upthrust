import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Alert from '../../../components/lib/Alert'
import { mount } from '../../utils/mount'

let view: ReturnType<typeof mount>
afterEach(() => { view?.dispose(); vi.useRealTimers() })
const root = () => view.host.firstElementChild as HTMLElement
const part = (name: string) => root().querySelector<HTMLElement>(`[data-alert-part="${name}"]`)
const classes = (el: Element | null) => (el?.getAttribute('class') ?? '').split(/\s+/)
const parts = () => [...root().children].map(el => (el as HTMLElement).dataset.alertPart)

describe('Alert DOM contracts', () => {
  // 默认：info / outlined、role=alert、居中 8px 12px；默认不显示图标、不可关闭；message 兼容 title。
  it('[alert.default] info outlined with no icon and no close', () => {
    view = mount(() => <Alert message="legacy" />)
    expect([root().getAttribute('role'), root().dataset.alertType, root().dataset.alertVariant, root().dataset.show]).toEqual(['alert', 'info', 'outlined', 'true'])
    expect(classes(root())).toEqual(expect.arrayContaining(['items-center', 'py-[8px]', 'px-[12px]', 'rounded-lg', 'border-solid', 'bg-primary/10']))
    expect(parts()).toEqual(['section'])
    expect(part('title')!.textContent).toBe('legacy')
  })

  // 有描述：顶端对齐、20px 24px；图标 24px + me 12px；标题 16px；antd 图标 aria-label 按类型。
  it('[alert.description] description layout and builtin icons', () => {
    const [type, setType] = createSignal<'success' | 'info' | 'warning' | 'error'>('success')
    view = mount(() => <Alert type={type()} showIcon title="T" description="D" />)
    expect(classes(root())).toEqual(expect.arrayContaining(['items-start', 'py-[20px]', 'px-[24px]']))
    expect(classes(part('icon'))).toEqual(expect.arrayContaining(['me-[12px]', 'text-[24px]']))
    expect(classes(part('title'))).toEqual(expect.arrayContaining(['mb-[8px]', 'text-[16px]']))
    const labels = { success: 'check-circle', info: 'info-circle', warning: 'exclamation-circle', error: 'close-circle' } as const
    for (const t of ['success', 'info', 'warning', 'error'] as const) {
      setType(t); flush()
      expect(part('icon')!.querySelector('[aria-label]')!.getAttribute('aria-label')).toBe(labels[t])
    }
  })

  // banner：默认 warning + 图标、无边框无圆角；showIcon={false} 可关闭图标；filled 边框透明。
  it('[alert.banner] banner defaults and filled variant', () => {
    view = mount(() => <><Alert banner title="b" /><Alert banner showIcon={false} title="c" /><Alert variant="filled" type="error" title="f" /></>)
    const [banner, noIcon, filled] = [...view.host.children] as HTMLElement[]
    expect(banner.dataset.alertType).toBe('warning')
    expect(classes(banner)).toEqual(expect.arrayContaining(['!border-0', 'rounded-none']))
    expect(banner.querySelector('[data-alert-part="icon"]')).not.toBeNull()
    expect(noIcon.querySelector('[data-alert-part="icon"]')).toBeNull()
    expect(classes(filled)).toEqual(expect.arrayContaining(['bg-[#fff2f0]', 'border-transparent']))
  })

  // 关闭：closable 对象 aria-* 透传；点击 onClose 一次、离场后卸载并 afterClose（兜底计时器）。
  it('[alert.close] closable object, close once and afterClose after leave', () => {
    vi.useFakeTimers()
    const calls: string[] = []
    view = mount(() => <Alert title="x" closable={{ 'aria-label': 'close', onClose: () => calls.push('close'), afterClose: () => calls.push('after') }} />)
    const button = part('close')!
    expect([button.tagName, button.getAttribute('type'), button.getAttribute('aria-label')]).toEqual(['BUTTON', 'button', 'close'])
    expect(button.querySelector('[aria-label="close"]')).not.toBeNull()
    button.click(); button.click(); flush()
    expect(calls).toEqual(['close'])
    expect(root().dataset.show).toBe('false')
    expect(root().style.transition).toContain('max-height')
    vi.advanceTimersByTime(450); flush()
    expect(calls).toEqual(['close', 'after'])
    expect(view.host.children).toHaveLength(0)
  })

  // 已废弃入口：closeText / closeIcon（含 0）可关闭且作为图标；closeIcon={false} 不可关闭。
  it('[alert.legacy-close] closeText and closeIcon', () => {
    view = mount(() => <><Alert title="a" closeText="Close Now" /><Alert title="b" closeIcon={0 as never} /><Alert title="c" closable closeIcon={false as never} /></>)
    const [a, b, c] = [...view.host.children] as HTMLElement[]
    expect(a.querySelector('[data-alert-part="close"]')!.textContent).toBe('Close Now')
    expect(b.querySelector('[data-alert-part="close"]')!.textContent).toBe('0')
    expect(c.querySelector('[data-alert-part="close"]')).not.toBeNull()
  })

  // 操作与语义：action 在 section 后；classNames / styles 对象与函数（收到推导后的 type）。
  it('[alert.semantic] action slot and semantic classNames / styles', () => {
    view = mount(() => <Alert
      title="t" showIcon type="success" action={<button>A</button>} closable
      classNames={{ root: 'my-root', icon: 'my-icon' }}
      styles={({ props }) => ({ section: { 'font-weight': '500' }, icon: { color: props.type === 'success' ? 'green' : 'red' } })}
    />)
    expect(parts()).toEqual(['icon', 'section', 'actions', 'close'])
    expect(classes(root())).toContain('my-root')
    expect(classes(part('icon'))).toContain('my-icon')
    expect([part('section')!.style.fontWeight, part('icon')!.style.color]).toEqual(['500', 'green'])
    expect(classes(part('actions'))).toContain('ms-[8px]')
  })

  // ErrorBoundary：子树抛错渲染 error Alert，标题为错误信息，描述为 pre 堆栈；自定义 title 优先。
  it('[alert.error-boundary] renders error alert on throw', () => {
    const Boom = (): never => { throw new Error('Boom error') }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    view = mount(() => <><Alert.ErrorBoundary><Boom /></Alert.ErrorBoundary><Alert.ErrorBoundary title="Custom"><Boom /></Alert.ErrorBoundary></>)
    const [a, b] = [...view.host.children] as HTMLElement[]
    expect(a.dataset.alertType).toBe('error')
    expect(a.querySelector('[data-alert-part="title"]')!.textContent).toBe('Error: Boom error')
    expect(a.querySelector('[data-alert-part="description"] pre')!.textContent).toContain('Boom error')
    expect(b.querySelector('[data-alert-part="title"]')!.textContent).toBe('Custom')
    spy.mockRestore()
  })
})
