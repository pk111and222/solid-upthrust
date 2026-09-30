import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest'
import Popconfirm from '../../../components/lib/Popconfirm'
import { mount } from '../../utils/mount'

let view: ReturnType<typeof mount> | undefined
afterEach(() => { view?.dispose(); view = undefined; document.body.innerHTML = '' })
const settle = async () => { await Promise.resolve(); await Promise.resolve(); flush() }
const part = (name: string) => document.querySelector<HTMLElement>(`[data-popconfirm-part="${name}"]`)
const classes = (el: Element | null | undefined) => (el?.getAttribute('class') ?? '').split(/\s+/)
// 共享 Trigger 只在触发器与浮层都有真实尺寸后才产出箭头数据，happy-dom 恒为 0，需要给原型打几何桩。
const stubRect = () => { const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => new DOMRect(100, 300, 120, 40)); onTestFinished(() => spy.mockRestore()) }
const buttons = () => [...part('buttons')!.querySelectorAll('button')]
const open = (node: () => any) => { view = mount(node); view.host.querySelector<HTMLElement>('[data-trigger]')!.click(); flush() }

describe('Popconfirm DOM contracts', () => {
  // 默认：click 打开、12px 内边距、8px 圆角；警告色 ExclamationCircleFilled 图标、标题只有一行时不加粗；取消 + 主按钮「确定」均为 small；z-index 1060。
  it('[popconfirm.default] antd structure, icon and buttons', async () => {
    stubRect()
    open(() => <Popconfirm title="确定删除吗？"><button data-trigger>删除</button></Popconfirm>)
    const root = part('root')!
    expect(root.getAttribute('aria-hidden')).toBeNull()
    expect(root.style.zIndex).toBe('1060')
    expect(classes(root)).toEqual(expect.arrayContaining(['rounded-lg', 'shadow', 'w-max']))
    expect(classes(part('container'))).toContain('p-sm')
    expect(classes(part('icon'))).toEqual(expect.arrayContaining(['text-[#faad14]', 'me-xs', 'text-[14px]']))
    expect(part('icon')!.querySelector('[aria-label="exclamation-circle"]')).not.toBeNull()
    expect(classes(part('title'))).toContain('font-normal')
    expect(part('description')).toBeNull()
    expect(buttons().map(b => b.textContent)).toEqual(['取消', '确定'])
    expect(buttons().every(b => b.type === 'button')).toBe(true)
    expect(classes(part('buttons'))).toEqual(expect.arrayContaining(['justify-end', 'gap-xs']))
    await vi.waitFor(() => expect(part('arrow')).not.toBeNull())
  })

  // 标题 + 描述：标题 600 加粗、描述上距 4px；标题 / 描述支持函数（RenderFunction）；icon=false / null 隐藏图标。
  it('[popconfirm.content] description, render functions and hidden icon', () => {
    open(() => <Popconfirm title={() => '函数标题'} description={() => <i>描述</i>} icon={false}><button data-trigger>x</button></Popconfirm>)
    expect(part('title')!.textContent).toBe('函数标题')
    expect(classes(part('title'))).toContain('font-semibold')
    expect(classes(part('description'))).toContain('mt-xxs')
    expect(part('description')!.querySelector('i')).not.toBeNull()
    expect(part('icon')).toBeNull()
  })

  // 按钮：okType（primary / danger）、okText / cancelText、showCancel=false、按钮 props 透传。
  it('[popconfirm.buttons] okType, texts, showCancel and button props', () => {
    open(() => <Popconfirm title="t" okType="danger" okText="是" cancelText="否" cancelButtonProps={{ disabled: true }}><button data-trigger>x</button></Popconfirm>)
    const [cancel, ok] = buttons()
    expect([cancel.textContent, ok.textContent]).toEqual(['否', '是'])
    expect(cancel.disabled).toBe(true)
    expect(classes(ok).some(cls => cls.includes('error'))).toBe(true)
    view!.dispose(); document.body.innerHTML = ''
    open(() => <Popconfirm title="t" showCancel={false}><button data-trigger>x</button></Popconfirm>)
    expect(buttons().map(b => b.textContent)).toEqual(['确定'])
  })

  // 确认 / 取消：同步 onConfirm 关闭；取消关闭并回调；onPopupClick 收到面板内点击；disabled 不打开。
  it('[popconfirm.intents] confirm, cancel, popup click and disabled', () => {
    const onConfirm = vi.fn(); const onCancel = vi.fn(); const onPopupClick = vi.fn()
    open(() => <Popconfirm title="t" onConfirm={onConfirm} onCancel={onCancel} onPopupClick={onPopupClick}><button data-trigger>x</button></Popconfirm>)
    buttons()[1].click(); flush()
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onPopupClick).toHaveBeenCalledTimes(1)
    expect(part('root')!.getAttribute('aria-hidden')).toBe('true')
    view!.host.querySelector<HTMLElement>('[data-trigger]')!.click(); flush()
    buttons()[0].click(); flush()
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(part('root')!.getAttribute('aria-hidden')).toBe('true')
    view!.dispose(); document.body.innerHTML = ''
    open(() => <Popconfirm title="t" disabled><button data-trigger>x</button></Popconfirm>)
    expect(part('root')).toBeNull()
  })

  // 异步：返回 promise 时确认按钮 loading、面板保持；reject 后退出 loading 仍打开；resolve 后关闭。
  it('[popconfirm.async] loading OK button, reject keeps open, resolve closes', async () => {
    let settleFn!: { resolve: () => void; reject: () => void }
    const onConfirm = () => new Promise<void>((resolve, reject) => { settleFn = { resolve, reject } })
    open(() => <Popconfirm title="t" onConfirm={onConfirm}><button data-trigger>x</button></Popconfirm>)
    buttons()[1].click(); flush()
    expect(buttons()[1].querySelector('[aria-label="loading"], .animate-spin')).not.toBeNull()
    settleFn.reject(); await settle()
    expect(part('root')!.getAttribute('aria-hidden')).toBeNull()
    expect(buttons()[1].querySelector('.animate-spin')).toBeNull()
    buttons()[1].click(); flush()
    settleFn.resolve(); await settle()
    expect(part('root')!.getAttribute('aria-hidden')).toBe('true')
  })

  // 受控：open 由外部决定，onOpenChange 回报意图；arrow=false 不渲染箭头；zIndex 可覆盖。
  it('[popconfirm.controlled] controlled open, arrow false and zIndex', () => {
    const [value, setValue] = createSignal(true)
    const changes: boolean[] = []
    view = mount(() => <Popconfirm title="t" open={value()} onOpenChange={v => changes.push(v)} arrow={false} zIndex={2000}><button data-trigger>x</button></Popconfirm>)
    flush()
    expect(part('root')!.style.zIndex).toBe('2000')
    expect(part('arrow')).toBeNull()
    buttons()[0].click(); flush()
    expect(changes).toEqual([false])
    expect(part('root')!.getAttribute('aria-hidden')).toBeNull()
    setValue(false); flush()
    expect(part('root')!.getAttribute('aria-hidden')).toBe('true')
  })

  // 语义化 classNames / styles（root / container / arrow / icon / title / content，对象或函数）；废弃 overlayClass / overlayStyle 仍生效。
  it('[popconfirm.semantic] semantic parts and deprecated overlay props', async () => {
    stubRect()
    open(() => <Popconfirm title="t" description="d" overlayClass="ov" overlayStyle={{ color: 'blue' }}
      classNames={{ root: 'r', container: 'c', arrow: 'a', icon: 'i', title: 'ti', content: 'co' }}
      styles={info => ({ title: { color: info.props.okType === 'primary' ? 'red' : 'green' } })}><button data-trigger>x</button></Popconfirm>)
    await vi.waitFor(() => expect(part('arrow')).not.toBeNull())
    for (const name of ['r', 'c', 'a', 'i', 'ti', 'co', 'ov']) expect(document.querySelector(`.${name}`), name).not.toBeNull()
    expect(part('title')!.style.color).toBe('red')
    expect(part('root')!.style.color).toBe('blue')
  })
})
