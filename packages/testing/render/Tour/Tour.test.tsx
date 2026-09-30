import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Tour from '../../../components/lib/Tour/index'
import { mount } from '../../utils/mount'

let view: ReturnType<typeof mount> | undefined
const render = (fn: Parameters<typeof mount>[0]) => { view = mount(fn); flush() }
afterEach(() => { view?.dispose(); view = undefined; document.body.innerHTML = ''; document.body.removeAttribute('style'); vi.restoreAllMocks(); flush() })
const part = (name: string) => document.querySelector<HTMLElement>(`[data-tour-part="${name}"]`)
const parts = (name: string) => [...document.querySelectorAll<HTMLElement>(`[data-tour-part="${name}"]`)]
const classes = (el: Element | null | undefined) => (el?.getAttribute('class') ?? '').split(/\s+/)
const button = (text: string) => [...document.querySelectorAll('button')].find(el => el.textContent === text)!
const key = (k: string, target: EventTarget = document) => { target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })); flush() }
const settle = async () => { await Promise.resolve(); await Promise.resolve(); flush() }
const box = (left: number, top: number, width: number, height: number) => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON() {} })
const target = () => {
  const el = document.createElement('button'); document.body.append(el)
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(box(100, 120, 80, 40))
  return el
}

describe('Tour DOM contracts', () => {
  // 默认结构（antd panelRender）：root 520 宽 / z 1001 / fixed；section 8px 圆角 + boxShadowTertiary；
  // 关闭按钮 aria-label 关闭 + CloseOutlined；header > title、description；footer 内 6px 指示点（仅 steps > 1）与 actions；
  // 首步无“上一步”，主按钮为 small primary“下一步”。
  it('[tour.default] antd panel structure', () => {
    render(() => <Tour defaultOpen steps={[{ title: 'First', description: 'Details' }, { title: 'Second' }]} />)
    const root = part('root')!
    expect(root.getAttribute('role')).toBe('dialog')
    expect(root.style.width).toBe('520px'); expect(root.style.zIndex).toBe('1001')
    expect(classes(root)).toEqual(expect.arrayContaining(['fixed', 'max-w-fit', 'text-[14px]', 'text-on-surface']))
    expect(classes(part('section'))).toEqual(expect.arrayContaining(['rounded-lg', 'shadow-tertiary', 'bg-surface']))
    const close = part('close')!
    expect(close.getAttribute('aria-label')).toBe('关闭'); expect(close.querySelector('[aria-label="close"]')).not.toBeNull()
    expect(classes(close)).toEqual(expect.arrayContaining(['absolute', 'top-[16px]', 'right-[16px]', 'w-[22px]', 'h-[22px]', 'rounded-sm']))
    expect(part('header')!.contains(part('title'))).toBe(true)
    expect(document.getElementById(root.getAttribute('aria-labelledby')!)?.textContent).toBe('First')
    expect(document.getElementById(root.getAttribute('aria-describedby')!)?.textContent).toBe('Details')
    const dots = parts('indicator')
    expect(dots).toHaveLength(2); expect(dots[0].dataset.tourActive).toBe('true')
    expect(classes(dots[0])).toEqual(expect.arrayContaining(['w-[6px]', 'h-[6px]', 'rounded-full', 'bg-primary']))
    expect(classes(dots[1])).toContain('bg-on-surface/15')
    expect(part('prev')).toBeNull()
    expect(part('next')!.textContent).toBe('下一步')
    expect(classes(part('next'))).toEqual(expect.arrayContaining(['h-control-sm', 'bg-primary']))
  })

  // 导航：下一步 → 出现“上一步”（default 按钮）；末步主按钮“结束导览”，点击后 onClose(1, 'finish') 再 onFinish；单步不渲染指示点。
  it('[tour.navigate] next, prev and finish', async () => {
    const finish = vi.fn(), close = vi.fn(), change = vi.fn()
    render(() => <Tour defaultOpen steps={[{ title: 'First' }, { title: 'Second' }]} onFinish={finish} onClose={close} onChange={change} />)
    button('下一步').click(); await settle()
    expect(part('title')!.textContent).toBe('Second'); expect(change).toHaveBeenCalledWith(1, 0)
    expect(part('prev')!.textContent).toBe('上一步'); expect(parts('indicator')[1].dataset.tourActive).toBe('true')
    button('上一步').click(); await settle(); expect(part('title')!.textContent).toBe('First')
    button('下一步').click(); await settle()
    button('结束导览').click(); await settle()
    expect(part('root')).toBeNull(); expect(close).toHaveBeenCalledWith(1, 'finish'); expect(finish).toHaveBeenCalledOnce()
    view!.dispose(); view = undefined
    render(() => <Tour defaultOpen steps={[{ title: 'Only' }]} />)
    expect(part('indicators')).toBeNull(); expect(part('next')!.textContent).toBe('结束导览')
  })

  // 键盘：←/→ 切换步骤（输入框内不响应）；Escape 关闭并把焦点还给触发元素；keyboard=false 全部屏蔽；closable=false 时 Escape 不关闭。
  it('[tour.keyboard] arrows navigate, Escape closes and restores focus', async () => {
    const launcher = document.createElement('button'); document.body.append(launcher); launcher.focus()
    const close = vi.fn()
    render(() => <Tour defaultOpen steps={[{ title: 'A' }, { title: 'B' }, { title: 'C', description: <input data-field /> }]} onClose={close} />)
    expect(document.activeElement).toBe(part('root'))
    key('ArrowRight'); await settle(); expect(part('title')!.textContent).toBe('B')
    key('ArrowRight'); await settle(); expect(part('title')!.textContent).toBe('C')
    key('ArrowRight'); await settle(); expect(part('title')!.textContent).toBe('C')
    key('ArrowLeft', document.querySelector('[data-field]')!); await settle(); expect(part('title')!.textContent).toBe('C')
    key('ArrowLeft'); await settle(); expect(part('title')!.textContent).toBe('B')
    key('Escape'); expect(close).toHaveBeenCalledWith(1, 'escape'); expect(part('root')).toBeNull(); expect(document.activeElement).toBe(launcher)
    view!.dispose(); view = undefined
    const quiet = vi.fn()
    render(() => <Tour defaultOpen keyboard={false} steps={[{ title: 'A' }, { title: 'B' }]} onClose={quiet} />)
    key('ArrowRight'); await settle(); expect(part('title')!.textContent).toBe('A')
    key('Escape'); expect(quiet).not.toHaveBeenCalled()
    view!.dispose(); view = undefined
    render(() => <Tour defaultOpen closable={false} steps={[{ title: 'A' }]} onClose={quiet} />)
    expect(part('close')).toBeNull(); key('Escape'); expect(quiet).not.toHaveBeenCalled(); expect(part('root')).not.toBeNull()
  })

  // 遮罩（rc-tour Mask）：SVG mask 镂空高亮区（默认 gap 6、rx 2），填充 rgba(0,0,0,0.5)；四块透明覆盖矩形拦截点击，
  // 容器 pointer-events none（未禁用交互时可点击目标）；有目标时面板带箭头、非模态。
  it('[tour.mask] svg hole, cover rects and pointer events', () => {
    const el = target()
    render(() => <Tour defaultOpen steps={[{ title: 'Target', target: el }]} />)
    const mask = part('mask')!
    expect(mask.style.zIndex).toBe('1001'); expect(mask.style.pointerEvents).toBe('none')
    const hole = part('hole')!
    expect([hole.getAttribute('x'), hole.getAttribute('y'), hole.getAttribute('width'), hole.getAttribute('height'), hole.getAttribute('rx')]).toEqual(['94', '114', '92', '52', '2'])
    expect(mask.querySelector('rect[mask]')!.getAttribute('fill')).toBe('rgba(0,0,0,0.5)')
    expect(parts('cover-rect')).toHaveLength(4)
    expect(parts('cover-rect').every(r => r.style.pointerEvents === 'auto')).toBe(true)
    expect(part('arrow')).not.toBeNull()
    expect(part('root')!.getAttribute('aria-modal')).toBe('false')
    expect(part('root')!.dataset.tourPlacement).toBe('bottom')
  })

  // mask 配置：对象形态提供 color / style；mask=false 不渲染 SVG；disabledInteraction 让容器拦截全部点击。
  it('[tour.mask-config] custom color, disabled mask and disabled interaction', () => {
    const el = target()
    render(() => <Tour defaultOpen mask={{ color: 'rgba(80,0,255,0.3)', style: { opacity: '0.9' } }} steps={[{ target: el }]} />)
    expect(part('mask')!.querySelector('rect[mask]')!.getAttribute('fill')).toBe('rgba(80,0,255,0.3)')
    expect(part('mask')!.style.opacity).toBe('0.9')
    view!.dispose(); view = undefined
    render(() => <Tour defaultOpen steps={[{ target: el, mask: false }]} />)
    expect(part('mask')!.querySelector('svg')).toBeNull()
    view!.dispose(); view = undefined
    render(() => <Tour defaultOpen disabledInteraction steps={[{ target: el }]} />)
    expect(part('mask')!.style.pointerEvents).toBe('auto')
  })

  // primary 类型：section bg-primary + 6px 圆角、白字；指示点白 15% / 白；上一步为白边透明按钮、下一步为白底主色字；步骤级 type 优先。
  it('[tour.primary] primary theme colors', async () => {
    render(() => <Tour defaultOpen type="primary" steps={[{ title: 'A' }, { title: 'B' }, { title: 'C', type: 'default' }]} />)
    expect(classes(part('section'))).toEqual(expect.arrayContaining(['bg-primary', 'rounded']))
    expect(classes(part('root'))).toContain('text-on-primary')
    expect(classes(parts('indicator')[0])).toContain('bg-white'); expect(classes(parts('indicator')[1])).toContain('bg-white/15')
    expect(classes(part('next'))).toEqual(expect.arrayContaining(['!bg-white', '!text-primary']))
    button('下一步').click(); await settle()
    expect(classes(part('prev'))).toEqual(expect.arrayContaining(['!text-on-primary', '!border-white/15']))
    button('下一步').click(); await settle()
    expect(part('root')!.dataset.tourType).toBe('default'); expect(classes(part('section'))).toContain('bg-surface')
  })

  // 按钮定制：nextButtonProps / prevButtonProps 的 children / onClick / class；actionsRender 拿到默认节点与 { current, total }；indicatorsRender 替换指示点。
  it('[tour.actions] button props, actionsRender and indicatorsRender', async () => {
    const onNext = vi.fn()
    render(() => <Tour defaultOpen
      indicatorsRender={(current, total) => <span data-custom-indicator>{current + 1}/{total}</span>}
      actionsRender={(origin, info) => <><span data-info>{info.current}-{info.total}</span>{origin}</>}
      steps={[{ title: 'A', nextButtonProps: { children: '继续', onClick: onNext, class: 'extra' } }, { title: 'B', prevButtonProps: { children: '返回' } }]} />)
    expect(document.querySelector('[data-custom-indicator]')!.textContent).toBe('1/2')
    expect(document.querySelector('[data-info]')!.textContent).toBe('0-2')
    expect(classes(part('next'))).toContain('extra')
    button('继续').click(); await settle(); expect(onNext).toHaveBeenCalledOnce()
    expect(button('返回')).toBeDefined(); expect(document.querySelector('[data-info]')!.textContent).toBe('1-2')
  })

  // closable / closeIcon：自定义图标、对象形态透传 aria-*；步骤级 closable 覆盖 Tour 级 false。
  it('[tour.closable] custom close icon and step override', () => {
    render(() => <Tour defaultOpen closable={false} steps={[{ title: 'A', closable: { closeIcon: <i data-x />, 'aria-label': '退出' } }]} />)
    expect(part('close')!.getAttribute('aria-label')).toBe('退出'); expect(part('close')!.querySelector('[data-x]')).not.toBeNull()
  })

  // 语义化 classNames / styles：Tour 级（对象或函数）与步骤级合并到 root / section / header / title / description / footer / actions / indicators / indicator / cover / mask。
  it('[tour.semantic] classNames and styles slots', () => {
    render(() => <Tour defaultOpen
      classNames={{ root: 'r', section: 's', header: 'h', title: 't', description: 'd', footer: 'f', actions: 'a', indicators: 'is', indicator: 'i', cover: 'c', mask: 'm' }}
      styles={info => ({ section: { 'background-color': info.props.type === 'primary' ? 'red' : 'rgb(1, 2, 3)' }, title: { color: 'rgb(4, 5, 6)' } })}
      steps={[{ title: 'A', description: 'B', cover: <img alt="" />, classNames: { title: 'step-t' }, styles: { title: { 'font-size': '20px' } } }, {}]} />)
    for (const [name, cls] of [['root', 'r'], ['section', 's'], ['header', 'h'], ['title', 't'], ['description', 'd'], ['footer', 'f'], ['actions', 'a'], ['indicators', 'is'], ['indicator', 'i'], ['cover', 'c'], ['mask', 'm']])
      expect(classes(part(name))).toContain(cls)
    expect(classes(part('title'))).toContain('step-t')
    expect(part('section')!.style.backgroundColor).toBe('rgb(1, 2, 3)')
    expect(part('title')!.style.color).toBe('rgb(4, 5, 6)'); expect(part('title')!.style.fontSize).toBe('20px')
    expect(classes(part('cover'))).toEqual(expect.arrayContaining(['pt-[46px]', 'px-md']))
  })

  // 打开时锁 body 滚动，关闭后恢复。
  it('[tour.scroll-lock] locks body scroll while open', () => {
    const [open, setOpen] = createSignal(true)
    render(() => <Tour open={open()} onClose={() => setOpen(false)} steps={[{ title: 'A' }]} />)
    expect(document.body.style.overflow).toBe('hidden')
    part('close')!.click(); flush()
    expect(part('root')).toBeNull(); expect(document.body.style.overflow).toBe('')
  })

  // 重新打开回到第一步。
  it('[tour.reopen] reopening starts from the first step', async () => {
    const [open, setOpen] = createSignal(true)
    render(() => <Tour open={open()} onClose={() => setOpen(false)} steps={[{ title: 'A' }, { title: 'B' }]} />)
    button('下一步').click(); await settle(); expect(part('title')!.textContent).toBe('B')
    part('close')!.click(); flush(); setOpen(true); flush()
    expect(part('title')!.textContent).toBe('A')
  })

  // 扩展：showSkip 显示“跳过”（onClose reason skip）；maskClosable 点击遮罩关闭；beforeChange pending 时主按钮 loading。
  it('[tour.extensions] skip, mask closing and async guard', async () => {
    const close = vi.fn()
    render(() => <Tour defaultOpen showSkip maskClosable steps={[{}, {}]} onClose={close} />)
    button('跳过').click(); flush(); expect(close).toHaveBeenCalledWith(0, 'skip')
    view!.dispose(); view = undefined
    render(() => <Tour defaultOpen maskClosable steps={[{}]} onClose={close} />)
    part('mask')!.click(); flush(); expect(close).toHaveBeenCalledWith(0, 'mask')
    view!.dispose(); view = undefined
    let resolve!: (v: boolean) => void
    render(() => <Tour defaultOpen steps={[{}, {}]} beforeChange={() => new Promise<boolean>(r => { resolve = r })} />)
    part('next')!.click(); flush()
    expect(part('next')!.getAttribute('aria-busy')).toBe('true'); expect(part('root')!.getAttribute('aria-busy')).toBe('true')
    resolve(false); await settle(); expect(part('next')!.getAttribute('aria-busy')).toBeNull(); expect(parts('indicator')[0].dataset.tourActive).toBe('true')
  })

  // 非模态交互引导：mask=false 且有目标时，焦点可以停留在面板外的目标上。
  it('[tour.interactive] non-modal tours let focus leave the panel', () => {
    const el = target()
    render(() => <Tour defaultOpen mask={false} steps={[{ target: el }]} />)
    expect(part('root')!.getAttribute('aria-modal')).toBe('false')
    el.focus(); expect(document.activeElement).toBe(el)
  })
})
