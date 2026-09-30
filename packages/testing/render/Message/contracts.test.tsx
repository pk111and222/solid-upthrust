import { flush } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getMessageManager } from '../../../competence/src/message'
import { message, MessageProvider } from '../../../components/lib/Message'
import { mount } from '../../utils/mount'

let view: ReturnType<typeof mount> | undefined
// 单例队列跨用例共享：每条用例前后清空队列、复位全局配置。
const reset = () => {
  const m = getMessageManager()
  for (const item of m.items()) m.remove(item.key)
  message.config({ top: 8, duration: 3, maxCount: 0, pauseOnHover: true, placement: 'top', classNames: {}, styles: {} })
  flush()
}
beforeEach(() => { vi.useFakeTimers(); reset() })
afterEach(() => { view?.dispose(); view = undefined; reset(); vi.useRealTimers(); document.body.innerHTML = '' })

const provider = (props: Parameters<typeof MessageProvider>[0] = {}) => { view = mount(() => <MessageProvider {...props} />); flush() }
const parts = (name: string) => [...document.querySelectorAll<HTMLElement>(`[data-message-part="${name}"]`)]
const part = (name: string) => parts(name)[0]
const classes = (el: Element | null | undefined) => (el?.getAttribute('class') ?? '').split(/\s+/)
const notices = () => parts('root').filter(el => el.dataset.messageClosing !== 'true')
const tick = (ms: number) => { vi.advanceTimersByTime(ms); flush() }

describe('Message DOM contracts', () => {
  // 默认结构：list z 2010、距顶 8px；notice 9px × 12px 内边距、8px 圆角、阴影、max-content；wrapper 居中 gap 8px；success 图标 16px 绿色 CheckCircleFilled。
  it('[message.default] antd list / notice / icon structure', () => {
    provider()
    message.success('保存成功')
    flush()
    const list = part('list')
    expect(classes(list)).toEqual(expect.arrayContaining(['fixed', 'z-2010', 'pointer-events-none']))
    expect(list.style.top).toBe('8px')
    expect(list.getAttribute('aria-live')).toBe('polite')
    expect(classes(part('root'))).toEqual(expect.arrayContaining(['px-sm', 'py-[9px]', 'rounded-lg', 'shadow', 'w-max', 'max-w-[calc(100vw-48px)]', 'pointer-events-auto']))
    expect(classes(part('wrapper'))).toEqual(expect.arrayContaining(['flex', 'items-center', 'gap-xs']))
    expect(classes(part('icon'))).toEqual(expect.arrayContaining(['text-[16px]', 'leading-none', 'text-[#52c41a]']))
    expect(part('icon').querySelector('[aria-label="check-circle"]')).not.toBeNull()
    expect(part('title').textContent).toBe('保存成功')
  })

  // 五种类型图标与颜色；open 不带 type 时不渲染图标；自定义 icon 替换类型图标。
  it('[message.types] type icons, untyped and custom icon', () => {
    provider()
    const expected = { info: ['info-circle', 'text-primary'], warning: ['exclamation-circle', 'text-[#faad14]'], error: ['close-circle', 'text-error'], loading: ['loading', 'text-primary'] } as const
    for (const type of Object.keys(expected) as (keyof typeof expected)[]) message[type](type)
    message.open({ content: '无类型' })
    message.open({ content: '自定义', icon: <b data-custom>★</b> })
    flush()
    const byTitle = (text: string) => parts('root').find(el => el.textContent?.includes(text))!
    for (const [type, [label, color]] of Object.entries(expected)) {
      const icon = byTitle(type).querySelector('[data-message-part="icon"]')!
      expect(icon.querySelector(`[aria-label="${label}"]`)).not.toBeNull()
      expect(classes(icon)).toContain(color)
    }
    expect(byTitle('loading').querySelector('.animate-spin')).not.toBeNull()
    expect(byTitle('无类型').querySelector('[data-message-part="icon"]')).toBeNull()
    expect(byTitle('自定义').querySelector('[data-message-part="icon"] [data-custom]')).not.toBeNull()
  })

  // duration 单位为秒：默认 3 秒关闭；位置参数 duration / onClose；0 与 null 永不关闭；关闭后 300ms 移除节点。
  it('[message.duration] seconds, positional args and never-close', () => {
    provider()
    const onClose = vi.fn()
    message.info('默认')
    message.info('一秒', 1, onClose)
    message.info('函数', () => onClose('fn'))
    message.info({ content: '零', duration: 0 })
    message.info({ content: '空', duration: null })
    flush()
    tick(999)
    expect(notices()).toHaveLength(5)
    tick(1)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(notices().map(el => el.textContent)).not.toContain('一秒')
    tick(300)
    expect(parts('root').map(el => el.textContent)).not.toContain('一秒')
    tick(2000)
    expect(onClose).toHaveBeenLastCalledWith('fn')
    expect(notices().map(el => el.textContent)).toEqual(['零', '空'])
    tick(60_000)
    expect(notices()).toHaveLength(2)
  })

  // 返回值是 thenable：调用即关闭，then 在关闭后以 true 兑现，onClose 先于 then。
  it('[message.thenable] callable close and then after close', async () => {
    provider()
    const order: string[] = []
    const result = message.loading('加载中', 0, () => order.push('onClose'))
    const done = result.then(value => { order.push(`then:${value}`) })
    flush()
    expect(notices()).toHaveLength(1)
    result()
    flush()
    await done
    expect(order).toEqual(['onClose', 'then:true'])
    expect(notices()).toHaveLength(0)
    expect(typeof result.key).toBe('string')
  })

  // 悬停暂停计时：hover 期间不关闭，移出后只走剩余时间；pauseOnHover=false 悬停照常关闭。
  it('[message.pause] pauseOnHover banks elapsed time', () => {
    provider()
    message.info({ content: '暂停', duration: 2 })
    message.info({ content: '不暂停', duration: 2, pauseOnHover: false })
    flush()
    const [paused, running] = parts('root')
    tick(1500)
    paused.dispatchEvent(new MouseEvent('mouseenter'))
    running.dispatchEvent(new MouseEvent('mouseenter'))
    flush()
    tick(5000)
    expect(notices().map(el => el.textContent)).toEqual(['暂停'])
    paused.dispatchEvent(new MouseEvent('mouseleave'))
    flush()
    tick(499)
    expect(notices()).toHaveLength(1)
    tick(1)
    expect(notices()).toHaveLength(0)
  })

  // 同 key 原地更新：不新增节点、倒计时重启；result.update 合并字段。
  it('[message.update] same key updates in place and restarts the countdown', () => {
    provider()
    message.open({ key: 'k', type: 'loading', content: '加载中...' })
    flush()
    const node = part('root')
    tick(2500)
    message.open({ key: 'k', type: 'success', content: '已完成', duration: 2 })
    flush()
    expect(parts('root')).toHaveLength(1)
    expect(part('root')).toBe(node)
    expect(node.dataset.messageType).toBe('success')
    tick(1999)
    expect(notices()).toHaveLength(1)
    tick(1)
    expect(notices()).toHaveLength(0)

    const result = message.info('旧内容', 0)
    result.update({ content: '新内容' })
    flush()
    expect(notices().map(el => el.textContent)).toEqual(['新内容'])
    expect(notices()[0].dataset.messageType).toBe('info')
  })

  // destroy(key) 关闭单条并触发 onClose；destroy() 关闭全部且不触发 onClose。
  it('[message.destroy] keyed and global destroy', () => {
    provider()
    const onClose = vi.fn()
    message.info({ content: 'a', key: 'a', duration: 0, onClose })
    message.info({ content: 'b', duration: 0, onClose })
    flush()
    message.destroy('a')
    flush()
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(notices().map(el => el.textContent)).toEqual(['b'])
    message.destroy()
    flush()
    expect(notices()).toHaveLength(0)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // message.config：top 偏移、默认 duration、maxCount 挤掉最旧的；placement=bottom 改用 bottom 偏移。
  it('[message.config] top, duration, maxCount and bottom placement', () => {
    provider()
    message.config({ top: 100, duration: 1, maxCount: 2 })
    for (const c of ['1', '2', '3']) message.info(c)
    flush()
    expect(part('list').style.top).toBe('100px')
    expect(notices().map(el => el.textContent)).toEqual(['2', '3'])
    tick(1000)
    expect(notices()).toHaveLength(0)
    message.config({ placement: 'bottom' })
    flush()
    expect(part('list').style.bottom).toBe('100px')
    expect(classes(part('list-content'))).toContain('flex-col-reverse')
  })

  // 语义化 classNames / styles（对象与函数）、class / style / onClick；全局 config 的语义化与单条合并。
  it('[message.semantic] classNames, styles, class, style and onClick', () => {
    provider()
    const onClick = vi.fn()
    message.config({ classNames: { list: 'g-list', title: 'g-title' } })
    message.open({
      type: 'error', content: 'x', class: 'own', style: { color: 'red' }, onClick,
      classNames: { root: 'c-root', icon: 'c-icon' },
      styles: ({ props }) => ({ title: { 'font-weight': props.type === 'error' ? '600' : '400' } }),
    })
    flush()
    expect(classes(part('list'))).toContain('g-list')
    expect(classes(part('root'))).toEqual(expect.arrayContaining(['c-root', 'own']))
    expect(part('root').style.color).toBe('red')
    expect(classes(part('icon'))).toContain('c-icon')
    expect(classes(part('title'))).toContain('g-title')
    expect(part('title').style.fontWeight).toBe('600')
    part('root').click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  // 没有挂载任何 Provider 时，首次调用自动在 body 上挂载兜底 holder（antd 静态方法语义）。
  it('[message.holder] fallback holder without a provider', () => {
    message.info('静态调用')
    flush()
    expect(document.querySelector('[data-message-holder]')).not.toBeNull()
    expect(part('title').textContent).toBe('静态调用')
  })

  // useMessage 返回 [api, holder]；holder 渲染后 api 打开的消息出现在其中。
  it('[message.hooks] useMessage api and holder', () => {
    let api!: ReturnType<typeof message.useMessage>[0]
    view = mount(() => { const [a, holder] = message.useMessage({ top: 24 }); api = a; return holder })
    flush()
    api.warning('hooks')
    flush()
    expect(part('list').style.top).toBe('24px')
    expect(part('icon').querySelector('[aria-label="exclamation-circle"]')).not.toBeNull()
  })
})
