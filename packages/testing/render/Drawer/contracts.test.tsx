import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Drawer from '../../../components/lib/Drawer'
import Modal from '../../../components/lib/Modal'
import { mount } from '../../utils/mount'

let view: ReturnType<typeof mount> | undefined
afterEach(() => { view?.dispose(); view = undefined; document.body.innerHTML = ''; document.body.removeAttribute('style') })
const wait = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms))
const settle = async (ms = 0) => { await wait(ms); flush(); await Promise.resolve(); flush() }
const parts = (name: string) => [...document.querySelectorAll<HTMLElement>(`[data-drawer-part="${name}"]`)]
const part = (name: string) => parts(name)[0]
const classes = (el: Element | null | undefined) => (el?.getAttribute('class') ?? '').split(/\s+/)

describe('Drawer DOM contracts', () => {
  // 默认：右侧、378px、无圆角；头部 16px 24px、× 在标题前（start）、24px；主体 24px；无默认 footer。
  it('[drawer.default] right placement, antd header and no default footer', async () => {
    view = mount(() => <Drawer open title="T">body</Drawer>)
    await settle()
    expect(part('root').dataset.placement).toBe('right')
    expect(part('wrapper').style.width).toBe('378px')
    expect(classes(part('wrapper')).some(cls => cls.startsWith('rounded'))).toBe(false)
    expect(classes(part('header'))).toEqual(expect.arrayContaining(['py-md', 'px-lg', 'border-b']))
    const header = part('header')
    const close = header.querySelector('[aria-label="Close"]')!
    expect(close.compareDocumentPosition(document.getElementById(part('section').getAttribute('aria-labelledby')!)!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(classes(close)).toEqual(expect.arrayContaining(['w-[24px]', 'h-[24px]', 'mr-xs']))
    expect(classes(part('body'))).toContain('p-lg')
    expect(part('footer')).toBeUndefined()
    expect(document.querySelectorAll('button')).toHaveLength(1)
  })

  // onClose：遮罩 / × / Escape 都带事件调用；返回 false 或 reject 保持打开，promise 挂起期间保持打开。
  it('[drawer.close] onClose receives the event; false / reject keep it open', async () => {
    const events: string[] = []
    const onClose = vi.fn((e: MouseEvent | KeyboardEvent) => { events.push(e.type); return false })
    view = mount(() => <Drawer defaultOpen onClose={onClose}>x</Drawer>)
    await settle()
    part('mask').click()
    document.querySelector<HTMLElement>('[aria-label="Close"]')!.click()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    flush()
    expect(events).toEqual(['click', 'click', 'keydown'])
    expect(classes(part('wrapper'))).toContain('opacity-100')
    view.dispose()
    view = mount(() => <Drawer defaultOpen onClose={() => Promise.reject(new Error('no'))}>x</Drawer>)
    await settle()
    part('mask').click(); await settle(20)
    expect(classes(part('wrapper'))).toContain('opacity-100')
  })

  // size：预设 / 数字 / 数字字符串 / CSS 长度；top/bottom 映射为高度；size 优先于废弃的 width。
  it('[drawer.size] size presets, numbers and vertical height', async () => {
    const [size, setSize] = createSignal<'default' | 'large' | number | string | undefined>('large')
    const [placement, setPlacement] = createSignal<'right' | 'top'>('right')
    view = mount(() => <Drawer open size={size()} width={999} placement={placement()}>x</Drawer>)
    await settle()
    expect(part('wrapper').style.width).toBe('736px')
    setSize(256); flush(); expect(part('wrapper').style.width).toBe('256px')
    setSize('300'); flush(); expect(part('wrapper').style.width).toBe('300px')
    setSize('40vw'); flush(); expect(part('wrapper').style.width).toBe('40vw')
    setSize(undefined); flush(); expect(part('wrapper').style.width).toBe('999px')
    setPlacement('top'); setSize(200); flush()
    expect([part('wrapper').style.height, part('wrapper').style.width]).toEqual(['200px', ''])
    expect(classes(part('wrapper'))).toContain('top-0')
  })

  // 头部：extra 在右；closable.placement=end 时 × 在 extra 之后；只有 × 时为 close-only 头部；无标题无 × 无 extra 不渲染头部。
  it('[drawer.header] extra, closable placement end and header skipping', async () => {
    view = mount(() => <Drawer open title="T" extra={<b data-extra>E</b>} closable={{ placement: 'end' }}>x</Drawer>)
    await settle()
    const kids = [...part('header').children]
    expect(kids.at(-1)!.getAttribute('aria-label')).toBe('Close')
    expect(kids.at(-2)!.querySelector('[data-extra]')).not.toBeNull()
    expect(classes(kids.at(-1))).toContain('ml-xs')
    view.dispose()
    view = mount(() => <Drawer open>x</Drawer>)
    await settle()
    expect(classes(part('header'))).toContain('border-b-0')
    view.dispose()
    view = mount(() => <Drawer open closable={false}>x</Drawer>)
    await settle()
    expect(part('header')).toBeUndefined()
  })

  // push：上层 Drawer（更高 zIndex 或同层后挂载）打开时下层按 placement 向中心推 180px（对象 distance 可配）；上层是 Modal 不推。
  it('[drawer.push] nested drawers push the lower one', async () => {
    const [child, setChild] = createSignal(false)
    const [modal, setModal] = createSignal(false)
    view = mount(() => <>
      <Drawer open title="A">a</Drawer>
      <Drawer open placement="left" zIndex={900} push={{ distance: 100 }} title="L">l</Drawer>
      <Drawer open={child()} title="B">b</Drawer>
      <Modal open={modal()}>m</Modal>
    </>)
    await settle()
    const [a, l] = parts('wrapper')
    expect(a.style.transform).toBe('')
    expect(l.style.transform).toBe('translateX(100px)') // below A
    setChild(true); await settle()
    expect(a.style.transform).toBe('translateX(-180px)')
    setChild(false); setModal(true); await settle()
    expect(a.style.transform).toBe('')
  })

  // Escape 只关闭最上层（zIndex 最高 / 同层后挂载），逐层剥离。
  it('[drawer.stack] Escape closes only the top-most layer', async () => {
    const closed: string[] = []
    view = mount(() => <>
      <Drawer open onClose={() => { closed.push('low') }}>a</Drawer>
      <Drawer open zIndex={1010} onClose={() => { closed.push('high') }}>b</Drawer>
    </>)
    await settle()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(closed).toEqual(['high'])
  })

  // 语义化 classNames / styles、class 在 section；loading 显示 5 行骨架；footer 8px 16px。
  it('[drawer.semantic] semantic parts, loading skeleton and footer', async () => {
    view = mount(() => <Drawer open loading title="T" extra="E" footer="F" resizable class="sec-x" rootClass="root-x"
      classNames={{ root: 'r', mask: 'm', wrapper: 'w', section: 's', header: 'h', title: 't', extra: 'e', body: 'b', footer: 'f', dragger: 'd', close: 'x' }}
      styles={{ body: { color: 'red' } }}>content</Drawer>)
    await settle()
    for (const name of ['r', 'm', 'w', 's', 'h', 't', 'e', 'b', 'f', 'd', 'x']) expect(document.querySelector(`.${name}`), name).not.toBeNull()
    expect(classes(part('section'))).toContain('sec-x')
    expect(classes(part('root'))).toContain('root-x')
    expect(part('body').style.color).toBe('red')
    expect(part('body').textContent).not.toContain('content')
    expect(part('body').querySelector('[aria-hidden="true"] .flex-1')!.children).toHaveLength(5)
    expect(classes(part('footer'))).toEqual(expect.arrayContaining(['py-xs', 'px-md', 'border-t']))
  })

  // getContainer=false 原地 absolute 渲染；mask=false 时不锁滚动且 aria-modal 缺省。
  it('[drawer.inline] render in current container, mask false', async () => {
    view = mount(() => <div data-host style={{ position: 'relative' }}><Drawer open getContainer={false} mask={false}>x</Drawer></div>)
    await settle()
    expect(document.querySelector('[data-host] [data-drawer-part="root"]')).not.toBeNull()
    expect(classes(part('root'))).toEqual(expect.arrayContaining(['absolute', 'overflow-hidden']))
    expect(part('mask')).toBeUndefined()
    expect(part('section').hasAttribute('aria-modal')).toBe(false)
    expect(document.body.style.overflow).toBe('')
  })

  // resizable：拖拽内沿改变尺寸，受 maxSize 约束并回调 onResizeStart / onResize / onResizeEnd；拖拽中关闭过渡。
  it('[drawer.resize] dragger resizes within maxSize', async () => {
    const calls: string[] = []
    const sizes: number[] = []
    view = mount(() => <Drawer open size={300} maxSize={500} resizable={{
      onResizeStart: () => calls.push('start'), onResize: size => sizes.push(size), onResizeEnd: () => calls.push('end'),
    }}>x</Drawer>)
    await settle()
    const wrapper = part('wrapper')
    wrapper.getBoundingClientRect = () => ({ width: 300, height: 600, top: 0, left: 700, right: 1000, bottom: 600, x: 700, y: 0, toJSON() {} })
    part('dragger').dispatchEvent(new PointerEvent('pointerdown', { clientX: 700, bubbles: true }))
    flush()
    expect(classes(part('wrapper'))).toContain('transition-none')
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 650 }))
    flush()
    expect(wrapper.style.width).toBe('350px')
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 0 }))
    window.dispatchEvent(new PointerEvent('pointerup', {}))
    flush()
    expect(wrapper.style.width).toBe('500px')
    expect(sizes).toEqual([350, 500])
    expect(calls).toEqual(['start', 'end'])
  })
})
