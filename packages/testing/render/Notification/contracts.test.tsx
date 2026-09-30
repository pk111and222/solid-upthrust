import { flush } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getNotificationManager } from '../../../competence/src/notification'
import { notification, NotificationProvider } from '../../../components/lib/Notification'
import { mount } from '../../utils/mount'

let view: ReturnType<typeof mount> | undefined
// 单例队列跨用例共享：每条用例前后清空队列、复位全局配置。
const reset = () => {
  const m = getNotificationManager()
  for (const item of m.allItems()) m.remove(item.key)
  notification.config({
    placement: 'topRight', top: 24, bottom: 24, duration: 4.5, showProgress: false, pauseOnHover: true, maxCount: 0,
    stack: { threshold: 3 }, closeIcon: undefined, closable: undefined, classNames: {}, styles: {},
  })
  flush()
}
beforeEach(() => { vi.useFakeTimers(); reset() })
afterEach(() => { view?.dispose(); view = undefined; reset(); vi.useRealTimers(); document.body.innerHTML = '' })

const provider = (props: Parameters<typeof NotificationProvider>[0] = {}) => { view = mount(() => <NotificationProvider {...props} />); flush() }
const parts = (name: string, scope: ParentNode = document) => [...scope.querySelectorAll<HTMLElement>(`[data-notification-part="${name}"]`)]
const part = (name: string, scope: ParentNode = document) => parts(name, scope)[0]
const classes = (el: Element | null | undefined) => (el?.getAttribute('class') ?? '').split(/\s+/)
const wrappers = () => parts('wrapper').filter(el => el.dataset.notificationClosing !== 'true')
const titles = () => wrappers().map(el => part('title', el)?.textContent)
const tick = (ms: number) => { vi.advanceTimersByTime(ms); flush() }
const byTitle = (text: string) => wrappers().find(el => part('title', el)?.textContent === text)!

describe('Notification DOM contracts', () => {
  // 默认结构：topRight list z 2050、距顶 24px、右边距 24；notice 384 宽、20 × 24 内边距、8px 圆角；
  // 标题 16px / 1.5、可关闭时右留 24；内容 role=alert；关闭按钮 22×22、aria-label Close；不传 type 无图标。
  it('[notification.default] antd list / notice / title / close structure', () => {
    provider()
    notification.open({ title: '标题', description: '描述' })
    flush()
    const list = part('list')
    expect(classes(list)).toEqual(expect.arrayContaining(['fixed', 'z-2050', 'right-0', 'mr-lg', 'pointer-events-none']))
    expect(list.style.top).toBe('24px')
    expect(list.dataset.notificationPlacement).toBe('topRight')
    expect(classes(part('wrapper'))).toEqual(expect.arrayContaining(['absolute', 'top-0', 'right-0', 'bg-surface', 'rounded-lg', 'shadow']))
    expect(classes(part('root'))).toEqual(expect.arrayContaining(['w-[384px]', 'max-w-[calc(100vw-48px)]', 'py-[20px]', 'px-lg', 'rounded-lg', 'overflow-hidden']))
    expect(part('content').getAttribute('role')).toBe('alert')
    expect(classes(part('title'))).toEqual(expect.arrayContaining(['text-[16px]', 'leading-[1.5]', 'mb-xs', 'pe-lg']))
    expect(classes(part('description'))).toEqual(expect.arrayContaining(['text-[14px]', 'mt-xs']))
    const close = part('close')
    expect(close.getAttribute('aria-label')).toBe('Close')
    expect(close.getAttribute('type')).toBe('button')
    expect(classes(close)).toEqual(expect.arrayContaining(['w-[22px]', 'h-[22px]', 'top-[20px]', 'right-[24px]', 'text-on-surface/45', 'hover:bg-on-surface/6']))
    expect(close.querySelector('[aria-label="close"]')).not.toBeNull()
    expect(part('icon')).toBeUndefined()
  })

  // 四种类型图标与颜色、有图标时标题 / 描述左让 36px；自定义 icon 替换类型图标且不加类型色；只有描述时描述为首元素（mt-0 me-sm）。
  it('[notification.types] type icons, custom icon and description-only', () => {
    provider()
    const expected = { info: ['info-circle', 'text-primary'], success: ['check-circle', 'text-[#52c41a]'], warning: ['exclamation-circle', 'text-[#faad14]'], error: ['close-circle', 'text-error'] } as const
    for (const type of Object.keys(expected) as (keyof typeof expected)[]) notification[type]({ title: type })
    notification.open({ title: '自定义', icon: <b data-custom>★</b> })
    notification.open({ description: '只有描述' })
    flush()
    for (const [type, [label, color]] of Object.entries(expected)) {
      const icon = part('icon', byTitle(type))
      expect(icon.querySelector(`[aria-label="${label}"]`)).not.toBeNull()
      expect(classes(icon)).toEqual(expect.arrayContaining([color, 'absolute', 'text-[24px]']))
      expect(classes(part('title', byTitle(type)))).toContain('ms-[36px]')
      expect(part('root', byTitle(type)).dataset.notificationType).toBe(type)
    }
    const custom = part('icon', byTitle('自定义'))
    expect(custom.querySelector('[data-custom]')).not.toBeNull()
    expect(classes(custom)).not.toContain('text-primary')
    const descOnly = wrappers().find(el => !part('title', el))!
    expect(classes(part('description', descOnly))).toEqual(expect.arrayContaining(['mt-0', 'me-sm']))
  })

  // duration 单位为秒：默认 4.5 秒关闭并触发 onClose；0 / false / null 永不关闭；关闭 300ms 后移除节点。
  it('[notification.duration] seconds and never-close', () => {
    provider()
    const onClose = vi.fn()
    notification.open({ title: '默认', onClose })
    notification.open({ title: '零', duration: 0 })
    notification.open({ title: '假', duration: false })
    notification.open({ title: '空', duration: null })
    flush()
    tick(4499)
    expect(titles()).toHaveLength(4)
    tick(1)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(titles()).toEqual(['零', '假', '空'])
    tick(300)
    expect(parts('wrapper')).toHaveLength(3)
    tick(60_000)
    expect(titles()).toHaveLength(3)
  })

  // 关闭按钮：点击关闭并阻止冒泡（不触发卡片 onClick）；Enter 键关闭；closable.onClose 先于 onClose。
  it('[notification.close] close button click / Enter and callback order', () => {
    provider()
    const order: string[] = []
    const onClick = vi.fn()
    notification.open({ title: 'a', duration: 0, onClick, onClose: () => order.push('onClose'), closable: { onClose: () => order.push('closable') } })
    notification.open({ title: 'b', duration: 0 })
    flush()
    part('close', byTitle('a')).click()
    flush()
    expect(order).toEqual(['closable', 'onClose'])
    expect(onClick).not.toHaveBeenCalled()
    part('close', byTitle('b')).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    flush()
    expect(titles()).toEqual([])
  })

  // closable=false / closeIcon=null 不渲染关闭按钮且标题不留右侧空间；自定义 closeIcon 与 closable 对象的 aria 属性；全局 config.closeIcon。
  it('[notification.closable] closable, closeIcon and aria', () => {
    provider()
    notification.open({ title: '不可关闭', closable: false })
    notification.open({ title: '空图标', closeIcon: null })
    notification.open({ title: '自定义', closeIcon: <i data-x>x</i> })
    notification.open({ title: '对象', closable: { closeIcon: <i data-y>y</i>, 'aria-label': '关掉' } })
    flush()
    expect(part('close', byTitle('不可关闭'))).toBeUndefined()
    expect(classes(part('title', byTitle('不可关闭')))).not.toContain('pe-lg')
    expect(part('close', byTitle('空图标'))).toBeUndefined()
    expect(part('close', byTitle('自定义')).querySelector('[data-x]')).not.toBeNull()
    const obj = part('close', byTitle('对象'))
    expect(obj.querySelector('[data-y]')).not.toBeNull()
    expect(obj.getAttribute('aria-label')).toBe('关掉')
    notification.config({ closeIcon: <i data-global>g</i> })
    notification.open({ title: '全局' })
    flush()
    expect(part('close', byTitle('全局')).querySelector('[data-global]')).not.toBeNull()
  })

  // 悬停暂停：hover 期间不关闭、移出后只走剩余时间；pauseOnHover=false 悬停照常关闭。
  it('[notification.pause] pauseOnHover banks elapsed time', () => {
    provider({ stack: false })
    notification.open({ title: '暂停', duration: 2 })
    notification.open({ title: '不暂停', duration: 2, pauseOnHover: false })
    flush()
    tick(1500)
    byTitle('暂停').dispatchEvent(new MouseEvent('mouseenter'))
    byTitle('不暂停').dispatchEvent(new MouseEvent('mouseenter'))
    flush()
    tick(5000)
    expect(titles()).toEqual(['暂停'])
    byTitle('暂停').dispatchEvent(new MouseEvent('mouseleave'))
    flush()
    tick(499)
    expect(titles()).toHaveLength(1)
    tick(1)
    expect(titles()).toHaveLength(0)
  })

  // stack 模式下悬停任意一条，同角落所有通知都暂停（rc forcedHovering）。
  it('[notification.stack-pause] hovering one notice pauses the whole stack', () => {
    provider()
    notification.open({ title: 'a', duration: 1 })
    notification.open({ title: 'b', duration: 1 })
    flush()
    byTitle('b').dispatchEvent(new MouseEvent('mouseenter'))
    flush()
    tick(3000)
    expect(titles()).toEqual(['a', 'b'])
    byTitle('b').dispatchEvent(new MouseEvent('mouseleave'))
    flush()
    tick(1000)
    expect(titles()).toEqual([])
  })

  // 进度条：showProgress 时渲染，显示剩余比例（从 100 递减），悬停时冻结；duration 0 不渲染。
  it('[notification.progress] remaining-share progress bar', () => {
    provider()
    notification.open({ title: 'p', duration: 2, showProgress: true })
    notification.open({ title: '零', duration: 0, showProgress: true })
    flush()
    const bar = part('progress', byTitle('p'))
    expect(classes(bar)).toEqual(expect.arrayContaining(['absolute', 'bottom-0', 'left-[8px]', 'right-[8px]', 'h-[2px]', 'bg-on-surface/4']))
    expect(bar.getAttribute('aria-valuenow')).toBe('100')
    tick(1000)
    const half = Number(bar.getAttribute('aria-valuenow'))
    expect(half).toBeGreaterThan(40)
    expect(half).toBeLessThan(60)
    expect(part('progress', byTitle('零'))).toBeUndefined()
  })

  // 同 key 原地替换：节点不变、倒计时重启；result.update 合并字段（废弃别名 message 也生效）。
  it('[notification.update] same key replaces in place and restarts the countdown', () => {
    provider()
    notification.info({ key: 'k', title: '处理中' })
    flush()
    const node = part('wrapper')
    tick(4000)
    notification.success({ key: 'k', title: '完成', duration: 2 })
    flush()
    expect(parts('wrapper')).toHaveLength(1)
    expect(part('wrapper')).toBe(node)
    expect(part('root').dataset.notificationType).toBe('success')
    tick(1999)
    expect(titles()).toEqual(['完成'])
    tick(1)
    expect(titles()).toEqual([])

    const result = notification.open({ title: '旧', description: '描述', duration: 0 })
    result.update({ message: '新' })
    flush()
    expect(titles()).toEqual(['新'])
    expect(part('description', wrappers()[0]).textContent).toBe('描述')
    result.close()
    flush()
    expect(titles()).toEqual([])
  })

  // destroy(key) 关闭单条并触发 onClose；destroy() 关闭全部且不触发 onClose；close(key) 是 destroy(key) 的别名。
  it('[notification.destroy] keyed and global destroy', () => {
    provider()
    const onClose = vi.fn()
    notification.open({ title: 'a', key: 'a', duration: 0, onClose })
    notification.open({ title: 'b', key: 'b', duration: 0, onClose })
    notification.open({ title: 'c', duration: 0, onClose })
    flush()
    notification.destroy('a')
    notification.close('b')
    flush()
    expect(onClose).toHaveBeenCalledTimes(2)
    expect(titles()).toEqual(['c'])
    notification.destroy()
    flush()
    expect(titles()).toEqual([])
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  // 六个方位：各自独立的 list、定位类与偏移；config({ top, bottom }) 改偏移；maxCount 跨方位裁掉最旧。
  it('[notification.placement] six placements, offsets and maxCount', () => {
    provider()
    notification.config({ top: 50, bottom: 60 })
    for (const placement of ['topLeft', 'top', 'topRight', 'bottomLeft', 'bottom', 'bottomRight'] as const) notification.open({ title: placement, placement })
    flush()
    const list = (p: string) => parts('list').find(el => el.dataset.notificationPlacement === p)!
    expect(parts('list')).toHaveLength(6)
    expect(classes(list('topLeft'))).toEqual(expect.arrayContaining(['left-0', 'ml-lg']))
    expect(classes(list('top'))).toEqual(expect.arrayContaining(['left-1/2', '-translate-x-1/2']))
    expect(list('top').style.top).toBe('50px')
    expect(list('bottomRight').style.bottom).toBe('60px')
    expect(classes(part('wrapper', list('bottomLeft')))).toEqual(expect.arrayContaining(['bottom-0', 'left-0']))
    notification.config({ maxCount: 2 })
    notification.open({ title: 'new', placement: 'top' })
    flush()
    expect(titles().sort()).toEqual(['bottomRight', 'new'])
  })

  // stack：超过阈值 3 条折叠（第 2、3 张露边、更旧的隐藏、旧卡内容透明），悬停展开并挂 hover 桥；stack=false 按文档流排列。
  it('[notification.stack] collapse beyond threshold, hover expands, stack=false flows', () => {
    provider()
    for (const t of ['1', '2', '3']) notification.open({ title: t, duration: 0 })
    flush()
    expect(part('list').dataset.notificationStack).toBe('expanded')
    notification.open({ title: '4', duration: 0 })
    flush()
    // 等两帧 rAF 让入场状态翻到 visible
    tick(50)
    expect(part('list').dataset.notificationStack).toBe('collapsed')
    const [oldest, , second, newest] = wrappers()
    expect(classes(newest)).not.toContain('opacity-0')
    expect(classes(second)).toEqual(expect.arrayContaining(['backdrop-blur-[10px]', 'overflow-hidden']))
    expect(classes(part('root', second))).toContain('opacity-0')
    expect(classes(oldest)).toEqual(expect.arrayContaining(['opacity-0', 'pointer-events-none']))
    expect(newest.style.transform).toBe('translate3d(0, 0, 0)')
    expect(second.style.transform).toMatch(/^translate3d\(0, 8px, 0\) scaleX/)
    newest.dispatchEvent(new MouseEvent('mouseenter'))
    flush()
    expect(part('list').dataset.notificationStack).toBe('expanded')
    expect(classes(second)).toContain('after:h-[16px]')
    expect(classes(part('root', second))).toContain('opacity-100')
    newest.dispatchEvent(new MouseEvent('mouseleave'))
    notification.config({ stack: false })
    flush()
    expect(part('list').dataset.notificationStack).toBeUndefined()
    expect(classes(newest)).toEqual(expect.arrayContaining(['relative', 'mb-md', 'ms-auto']))
    expect(newest.style.transform).toBe('')
  })

  // 语义化 classNames / styles（对象与函数）、class / style / onClick / props；全局 config 的语义化与单条合并。
  it('[notification.semantic] classNames, styles, class, style, onClick and props', () => {
    provider()
    const onClick = vi.fn()
    notification.config({ classNames: { title: 'g-title' } })
    notification.error({
      title: 'x', description: 'd', actions: <button type="button">ok</button>, class: 'own', style: { color: 'red' }, onClick,
      props: { 'data-testid': 'n' }, role: 'status',
      classNames: { root: 'c-root', icon: 'c-icon', description: 'c-desc', actions: 'c-actions' },
      styles: ({ props }) => ({ title: { 'font-weight': props.type === 'error' ? '600' : '400' } }),
    })
    flush()
    const root = part('root')
    expect(classes(root)).toEqual(expect.arrayContaining(['c-root', 'own']))
    expect(root.style.color).toBe('red')
    expect(root.dataset.testid).toBe('n')
    expect(part('content').getAttribute('role')).toBe('status')
    expect(classes(part('icon'))).toContain('c-icon')
    expect(classes(part('title'))).toContain('g-title')
    expect(part('title').style.fontWeight).toBe('600')
    expect(classes(part('description'))).toContain('c-desc')
    expect(classes(part('actions'))).toEqual(expect.arrayContaining(['c-actions', 'float-right', 'mt-sm']))
    root.click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  // 没有挂载任何 Provider 时，首次调用自动在 body 上挂载兜底 holder（antd 静态方法语义）。
  it('[notification.holder] fallback holder without a provider', () => {
    notification.info({ title: '静态调用' })
    flush()
    const holder = document.querySelector('[data-notification-holder]')
    expect(holder).not.toBeNull()
    expect(holder!.querySelector('[data-notification-part="title"]')!.textContent).toBe('静态调用')
  })

  // useNotification 返回 [api, holder]；holder 的 options 生效（bottom 方位偏移）。
  it('[notification.hooks] useNotification api and holder', () => {
    let api!: ReturnType<typeof notification.useNotification>[0]
    view = mount(() => { const [a, holder] = notification.useNotification({ placement: 'bottomLeft', bottom: 40 }); api = a; return holder })
    flush()
    api.warning({ title: 'hooks' })
    flush()
    expect(part('list').dataset.notificationPlacement).toBe('bottomLeft')
    expect(part('list').style.bottom).toBe('40px')
    expect(part('icon').querySelector('[aria-label="exclamation-circle"]')).not.toBeNull()
  })
})
