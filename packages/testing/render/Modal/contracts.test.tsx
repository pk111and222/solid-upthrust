import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Modal from '../../../components/lib/Modal'
import { mount } from '../../utils/mount'

let view: ReturnType<typeof mount> | undefined
afterEach(() => { view?.dispose(); view = undefined; document.body.innerHTML = ''; document.body.removeAttribute('style') })
const wait = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms))
const settle = async (ms = 0) => { await wait(ms); flush(); await Promise.resolve(); flush() }
const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]')
const part = (name: string) => document.querySelector<HTMLElement>(`[data-modal-part="${name}"]`)
const classes = (el: Element | null) => (el?.getAttribute('class') ?? '').split(/\s+/)
const button = (text: string) => [...document.querySelectorAll('button')].find(el => el.textContent === text)!

describe('Modal DOM contracts', () => {
  // 默认结构：root(z 1000) > mask + wrapper > panel(role=dialog, 520px) > container；标题 600、容器 20px 24px；默认 取消/确定。
  it('[modal.default] structure, antd spacing and default footer', async () => {
    view = mount(() => <Modal open title="T">body</Modal>)
    await settle()
    expect(part('root')!.style.zIndex).toBe('1000')
    expect(part('mask')).not.toBeNull()
    expect(dialog()!.getAttribute('aria-modal')).toBe('true')
    expect(dialog()!.style.width).toBe('520px')
    expect(classes(dialog())).toEqual(expect.arrayContaining(['top-[100px]', 'opacity-100', 'scale-100']))
    expect(classes(part('container'))).toEqual(expect.arrayContaining(['py-[20px]', 'px-lg', 'rounded-lg']))
    const title = document.getElementById(dialog()!.getAttribute('aria-labelledby')!)!
    expect([title.textContent, classes(title).includes('font-semibold')]).toEqual(['T', true])
    expect([...dialog()!.querySelectorAll('button')].map(el => el.textContent)).toEqual(['', '取消', '确定'])
    expect(classes(dialog()!.querySelector('[aria-label="Close"]'))).toEqual(expect.arrayContaining(['w-[32px]', 'h-[32px]', 'top-[12px]', 'right-[12px]']))
  })

  // 关闭意图：遮罩 / 取消 / × 走 onCancel，确定走 onOk；受控模式只通知不关闭。
  it('[modal.intents] mask, cancel, close and ok route to handlers', async () => {
    const onOk = vi.fn()
    const onCancel = vi.fn()
    view = mount(() => <Modal open title="T" onOk={onOk} onCancel={onCancel}>x</Modal>)
    await settle()
    part('wrapper')!.click()
    button('取消').click()
    dialog()!.querySelector<HTMLButtonElement>('[aria-label="Close"]')!.click()
    button('确定').click()
    flush()
    expect(onCancel).toHaveBeenCalledTimes(3)
    expect(onOk).toHaveBeenCalledTimes(1)
    expect(dialog()).not.toBeNull()
  })

  // mask 对象：closable=false 时点遮罩不关闭；blur 加 backdrop-blur；enabled=false 不渲染遮罩。maskClosable 仍兼容。
  it('[modal.mask] mask config object and deprecated maskClosable', async () => {
    const onCancel = vi.fn()
    const [mask, setMask] = createSignal<boolean | { enabled?: boolean; blur?: boolean; closable?: boolean }>({ blur: true, closable: false })
    view = mount(() => <Modal open mask={mask()} onCancel={onCancel}>x</Modal>)
    await settle()
    expect(classes(part('mask'))).toContain('backdrop-blur-[4px]')
    part('wrapper')!.click()
    expect(onCancel).not.toHaveBeenCalled()
    setMask({ enabled: false }); flush()
    expect(part('mask')).toBeNull()
    view.dispose()
    view = mount(() => <Modal open maskClosable={false} onCancel={onCancel}>x</Modal>)
    await settle()
    part('wrapper')!.click()
    expect(onCancel).not.toHaveBeenCalled()
  })

  // 异步 onOk：挂起期间确定按钮 loading 且保持打开；reject 保持打开可重试；resolve 后关闭。
  it('[modal.async] promise onOk holds loading, reject keeps open', async () => {
    let settleOk!: { resolve: () => void; reject: () => void }
    const onOk = vi.fn(() => new Promise<void>((resolve, reject) => { settleOk = { resolve, reject } }))
    const afterClose = vi.fn()
    view = mount(() => <Modal defaultOpen onOk={onOk} afterClose={afterClose}>x</Modal>)
    await settle()
    button('确定').click(); flush()
    expect(button('确定').getAttribute('aria-busy')).toBe('true')
    settleOk.reject(); await settle()
    expect(classes(dialog())).toContain('opacity-100')
    button('确定').click(); flush()
    settleOk.resolve(); await settle()
    expect(classes(dialog())).toContain('opacity-0')
    await settle(350)
    expect(afterClose).toHaveBeenCalledOnce()
    expect(part('root')!.className).toContain('hidden') // keep-alive
  })

  // footer：null 隐藏；函数形式拿到默认节点与 OkBtn / CancelBtn；loading 显示骨架并隐藏 footer。
  it('[modal.footer] footer render function, null footer and loading', async () => {
    const [loading, setLoading] = createSignal(false)
    view = mount(() => <Modal open loading={loading()} footer={(origin, { OkBtn }) => <><span data-extra>extra</span>{origin}<OkBtn /></>}>content</Modal>)
    await settle()
    expect(document.querySelector('[data-extra]')).not.toBeNull()
    expect([...part('container')!.querySelectorAll('button')].map(el => el.textContent)).toEqual(['', '取消', '确定', '确定'])
    setLoading(true); flush()
    expect(dialog()!.textContent).not.toContain('content')
    expect(dialog()!.querySelector('[data-modal-part="container"] [aria-hidden="true"] .flex-1')!.children).toHaveLength(4)
    expect(document.querySelector('[data-extra]')).toBeNull()
    view.dispose()
    view = mount(() => <Modal open footer={null}>x</Modal>)
    await settle()
    expect([...dialog()!.querySelectorAll('button')].map(el => el.textContent)).toEqual([''])
  })

  // closable：false / closeIcon=null 隐藏 ×；对象可自定义图标、禁用，onClose 先于 onCancel。
  it('[modal.closable] closable object, closeIcon null and disabled', async () => {
    const order: string[] = []
    view = mount(() => <Modal open closable={{ closeIcon: <b data-icon>x</b>, onClose: () => order.push('close') }} onCancel={() => { order.push('cancel') }}>x</Modal>)
    await settle()
    document.querySelector<HTMLElement>('[data-icon]')!.click()
    expect(order).toEqual(['close', 'cancel'])
    view.dispose()
    view = mount(() => <Modal open closeIcon={null}>x</Modal>)
    await settle()
    expect(dialog()!.querySelector('[aria-label="Close"]')).toBeNull()
    view.dispose()
    view = mount(() => <Modal open closable={{ disabled: true }}>x</Modal>)
    await settle()
    expect(dialog()!.querySelector<HTMLButtonElement>('[aria-label="Close"]')!.disabled).toBe(true)
  })

  // 语义化 classNames / styles 落到对应节点；class/style 在面板上，rootClass / wrapClass 分别在 root / wrapper。
  it('[modal.semantic] classNames and styles per part', async () => {
    view = mount(() => <Modal open title="T" footer="F" class="panel-x" rootClass="root-x" wrapClass="wrap-x" width="60%"
      classNames={{ root: 'r', mask: 'm', wrapper: 'w', container: 'c', header: 'h', title: 't', body: 'b', footer: 'f', close: 'x' }}
      styles={info => ({ body: { color: info.props.title ? 'red' : 'blue' } })}>body</Modal>)
    await settle()
    expect(classes(part('root'))).toEqual(expect.arrayContaining(['root-x', 'r']))
    expect(classes(part('wrapper'))).toEqual(expect.arrayContaining(['wrap-x', 'w']))
    expect(classes(dialog())).toContain('panel-x')
    expect(dialog()!.style.width).toBe('60%')
    for (const name of ['m', 'c', 'h', 't', 'b', 'f', 'x']) expect(document.querySelector(`.${name}`), name).not.toBeNull()
    expect(document.querySelector<HTMLElement>('.b')!.style.color).toBe('red')
  })

  // 生命周期：首开前不建 DOM；forceRender 预渲染；destroyOnHidden 离场后销毁；modalRender 包裹容器。
  it('[modal.lifecycle] lazy mount, forceRender, destroyOnHidden and modalRender', async () => {
    const [open, setOpen] = createSignal(false)
    view = mount(() => <>
      <Modal open={open()} destroyOnHidden modalRender={node => <div data-wrap>{node}</div>}>a</Modal>
      <Modal open={false} forceRender>b</Modal>
    </>)
    await settle()
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1)
    setOpen(true); await settle()
    expect(document.querySelector('[data-wrap] [data-modal-part="container"]')).not.toBeNull()
    setOpen(false); await settle(350)
    expect(document.querySelector('[data-wrap]')).toBeNull()
  })

  // getContainer=false 原地渲染；滚动锁：打开时 body overflow hidden，关闭后恢复原值；scrollLock=false 不锁。
  it('[modal.container] in-place render and scroll lock restore', async () => {
    document.body.style.overflow = 'scroll'
    const [open, setOpen] = createSignal(true)
    view = mount(() => <div data-host><Modal open={open()} getContainer={false}>x</Modal></div>)
    await settle()
    expect(document.querySelector('[data-host] [role="dialog"]')).not.toBeNull()
    expect(document.body.style.overflow).toBe('scroll') // in place → no lock
    view.dispose()
    view = mount(() => <Modal open={open()}>x</Modal>)
    await settle()
    expect(document.body.style.overflow).toBe('hidden')
    setOpen(false); await settle(350)
    expect(document.body.style.overflow).toBe('scroll')
  })

  // 响应式 width：xs 为基准，命中的更宽断点逐级覆盖（移动优先，与 antd 媒体查询一致）。
  it('[modal.width] breakpoint width map cascades mobile-first', async () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) => ({ matches: /min-width: (576|768)px/.test(query), media: query, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
    try {
      view = mount(() => <><Modal open width={{ xs: 300, sm: 400, xxl: 900 }}>a</Modal><Modal open width={{ xs: 300, xl: 800 }}>b</Modal></>)
      await settle()
      expect([...document.querySelectorAll<HTMLElement>('[role="dialog"]')].map(el => el.style.width)).toEqual(['400px', '300px'])
    } finally { window.matchMedia = original }
  })
})
