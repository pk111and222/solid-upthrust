import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import QRCode, { type QRCodeStatus } from '../../../components/lib/QRCode'
import { mount } from '../../utils/mount'

const ANTD_PATH = readFileSync(resolve(import.meta.dirname, '../../headless/QRCode/antd-path.txt'), 'utf8').trim()
let view: ReturnType<typeof mount>
afterEach(() => view?.dispose())
const root = () => view.host.firstElementChild as HTMLElement
const classes = (el: Element | null) => (el?.getAttribute('class') ?? '').split(/\s+/)
const cover = () => root().querySelector<HTMLElement>('[data-qrcode-part="cover"]')

describe('QRCode DOM contracts', () => {
  // 默认 canvas：根 160×160、透明底、边框 / 12px 内边距 / 8px 圆角；canvas 160 属性、role=img；无遮罩。
  it('[qrcode.default] canvas root, size and border', () => {
    view = mount(() => <QRCode value="https://ant.design/" />)
    const el = root()
    expect([el.style.width, el.style.height, el.style.backgroundColor]).toEqual(['160px', '160px', 'transparent'])
    expect(classes(el)).toEqual(expect.arrayContaining(['flex', 'justify-center', 'items-center', 'p-[12px]', 'border', 'border-on-surface/6', 'rounded-lg', 'box-border']))
    expect(el.dataset.qrcodeType).toBe('canvas')
    const canvas = el.querySelector('canvas')!
    expect([canvas.getAttribute('width'), canvas.getAttribute('height'), canvas.getAttribute('role')]).toEqual(['160', '160', 'img'])
    expect(classes(canvas)).toEqual(expect.arrayContaining(['self-stretch', 'flex-auto', 'min-w-0']))
    expect(cover()).toBeNull()
    expect(el.querySelector('img')).toBeNull()
  })

  // svg：viewBox 0 0 25 25；背景路径填 bgColor；前景路径与 antd 实测逐字一致、填 color、crispEdges。
  it('[qrcode.svg] svg output matches antd', () => {
    view = mount(() => <QRCode type="svg" value="https://ant.design/" color="#123456" bgColor="#eee" />)
    const svg = root().querySelector('svg')!
    expect([svg.getAttribute('viewBox'), svg.getAttribute('width'), svg.getAttribute('role')]).toEqual(['0 0 25 25', '160', 'img'])
    const [bg, fg] = [...svg.querySelectorAll('path')]
    expect([bg.getAttribute('d'), bg.getAttribute('fill'), bg.getAttribute('shape-rendering')]).toEqual(['M0,0 h25v25H0z', '#eee', 'crispEdges'])
    expect([fg.getAttribute('d'), fg.getAttribute('fill')]).toEqual([ANTD_PATH, '#123456'])
    expect(root().style.backgroundColor).toBe('#eee')
  })

  // 图标：svg 下渲染 image（居中、crossorigin）并挖空；canvas 下渲染隐藏 img（alt=QR-Code）。
  it('[qrcode.icon] icon image and excavation', () => {
    const [type, setType] = createSignal<'svg' | 'canvas'>('svg')
    view = mount(() => <QRCode type={type()} value="https://ant.design/" icon="logo.png" />)
    const image = root().querySelector('image')!
    expect([image.getAttribute('href'), image.getAttribute('width'), image.getAttribute('x'), image.getAttribute('preserveAspectRatio'), image.getAttribute('crossorigin')])
      .toEqual(['logo.png', '6.25', '9.375', 'none', 'anonymous'])
    expect(root().querySelectorAll('path')[1].getAttribute('d')).not.toBe(ANTD_PATH)
    setType('canvas'); flush()
    const img = root().querySelector('img')!
    expect([img.getAttribute('alt'), img.style.display, img.getAttribute('src')]).toEqual(['QR-Code', 'none', 'logo.png'])
  })

  // 状态遮罩：loading → Spin；expired → 文案 + 仅在有 onRefresh 时的链接按钮（reload 图标）；scanned → 已扫描。
  it('[qrcode.status] default status nodes and refresh', () => {
    const onRefresh = vi.fn()
    const [status, setStatus] = createSignal<QRCodeStatus>('loading')
    // Solid 2 的 createSignal(fn) 是派生信号，函数不能直接存进信号，用布尔开关。
    const [refresh, setRefresh] = createSignal(true)
    view = mount(() => <QRCode value="x" status={status()} onRefresh={refresh() ? onRefresh : undefined} />)
    expect(classes(cover())).toEqual(expect.arrayContaining(['absolute', 'z-10', 'flex-col', 'bg-surface/96']))
    expect(cover()!.querySelector('[aria-busy], [role="status"], .animate-spin-upthrust')).not.toBeNull()
    setStatus('expired'); flush()
    expect(cover()!.querySelector('[data-qrcode-part="expired"]')!.textContent).toBe('二维码过期')
    const button = cover()!.querySelector('button')!
    expect(button.textContent).toBe('点击刷新')
    expect(button.querySelector('[aria-label="reload"]')).not.toBeNull()
    button.click()
    expect(onRefresh).toHaveBeenCalledTimes(1)
    setRefresh(false); flush()
    expect(cover()!.querySelector('button')).toBeNull()
    setStatus('scanned'); flush()
    expect(cover()!.textContent).toBe('已扫描')
    setStatus('active'); flush()
    expect(cover()).toBeNull()
  })

  // statusRender 接收 status / locale / onRefresh；locale 覆盖默认文案。
  it('[qrcode.status-render] custom status render and locale', () => {
    const seen: unknown[] = []
    const onRefresh = () => {}
    view = mount(() => <QRCode value="x" status="expired" onRefresh={onRefresh} locale={{ expired: 'Expired' }} statusRender={info => { seen.push(info); return <em>{info.locale.expired}/{info.locale.refresh}</em> }} />)
    expect(cover()!.textContent).toBe('Expired/点击刷新')
    expect(seen[0]).toEqual({ status: 'expired', locale: { expired: 'Expired', refresh: '点击刷新', scanned: '已扫描' }, onRefresh })
  })

  // 空值不渲染；bordered=false 去边框与内边距；style.width / height 同时作用于根与本体；尺寸变化更新 canvas。
  it('[qrcode.layout] empty value, borderless, size and style overrides', () => {
    const [value, setValue] = createSignal<string | string[]>('')
    view = mount(() => <QRCode value={value()} />)
    expect(view.host.children).toHaveLength(0)
    setValue([]); flush(); expect(view.host.children).toHaveLength(0)
    view.dispose()
    const [size, setSize] = createSignal(120)
    view = mount(() => <>
      <QRCode value="x" bordered={false} size={size()} />
      <QRCode value="x" style={{ width: '200px', height: 180 as never, margin: '4px' }} type="svg" />
    </>)
    const [a, b] = [...view.host.children] as HTMLElement[]
    expect(classes(a)).toEqual(expect.arrayContaining(['p-0', 'border-transparent', 'rounded-none']))
    expect(a.style.width).toBe('120px')
    setSize(200); flush()
    expect([a.style.width, a.querySelector('canvas')!.getAttribute('width')]).toEqual(['200px', '200'])
    expect([b.style.width, b.style.height, b.style.margin]).toEqual(['200px', '180px', '4px'])
    const svg = b.querySelector('svg')!
    expect([svg.style.width, svg.style.height]).toEqual(['200px', '180px'])
    // 未设置 style 尺寸时本体无内联宽高（antd 传入 undefined 覆盖 size）。
    expect(a.querySelector('canvas')!.getAttribute('style') ?? '').not.toMatch(/width|height/)
  })

  // 语义化：root / cover 对象与函数；class 合并；原生属性透传。
  it('[qrcode.semantic] classNames / styles and attrs', () => {
    view = mount(() => <>
      <QRCode value="x" id="q" aria-label="code" data-x="1" class="custom" status="scanned" classNames={{ root: 'cr', cover: 'cc' }} styles={{ root: { padding: '16px' }, cover: { color: 'red' } }} />
      <QRCode value="x" type="canvas" styles={info => (info.props.type === 'canvas' ? { root: { border: '2px solid red' } } : undefined)} />
    </>)
    const [a, b] = [...view.host.children] as HTMLElement[]
    expect([a.id, a.getAttribute('aria-label'), a.dataset.x]).toEqual(['q', 'code', '1'])
    expect(classes(a)).toEqual(expect.arrayContaining(['custom', 'cr']))
    expect(a.style.padding).toBe('16px')
    const c = a.querySelector<HTMLElement>('[data-qrcode-part="cover"]')!
    expect([classes(c).includes('cc'), c.style.color]).toEqual([true, 'red'])
    expect(b.style.border).toBe('2px solid red')
  })
})
