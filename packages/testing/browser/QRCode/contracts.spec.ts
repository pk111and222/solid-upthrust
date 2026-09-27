import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'
import { paintedColor } from '../../utils/color-browser'
const path = 'components/data-display/qr-code/'
const ANTD_PATH = readFileSync(resolve(import.meta.dirname, '../../headless/QRCode/antd-path.txt'), 'utf8').trim()
async function demo(page: Page, info: TestInfo, name: string) {
  if (!page.url().includes(info.project.name === 'docs' ? path : '/QRCode')) await page.goto(info.project.name === 'docs' ? path : 'QRCode')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="qr-code/${name}"]` : `[data-qrcode-demo="${name}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  return area
}
type Box = { x: number; y: number; width: number; height: number }
const box = (locator: Locator): Promise<Box> => locator.evaluate(el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height } })
const codes = (area: Locator) => area.locator('[data-qrcode-type]')
/** canvas 像素采样：返回暗像素比例（alpha > 128 且 rgb 较暗）。 */
const darkRatio = (canvas: Locator) => canvas.evaluate((el: HTMLCanvasElement) => {
  const { data } = el.getContext('2d')!.getImageData(0, 0, el.width, el.height)
  let dark = 0
  for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 128 && data[i] + data[i + 1] + data[i + 2] < 300) dark++
  return dark / (data.length / 4)
})

// 基本：根 160×160 border-box、12px 内边距、1px 分割线色边框、8px 圆角；canvas 显示 134×134 且按 DPR 绘制出模块；输入改变后重绘。
test('[qrcode.browser.base] root box and canvas drawing', async ({ page }, info) => {
  const area = await demo(page, info, 'base')
  const root = codes(area).first()
  const rb = await box(root)
  expect([rb.width, rb.height]).toEqual([160, 160])
  await expect(root).toHaveCSS('padding', '12px'); await expect(root).toHaveCSS('border-top-left-radius', '8px')
  await expect(root).toHaveCSS('border-top-width', '1px')
  expect(await paintedColor(root, 'border-top-color')).toMatch(/0\.06\)$/)
  const canvas = root.locator('canvas')
  const cb = await box(canvas)
  expect([cb.width, cb.height]).toEqual([134, 134])
  const dpr = await page.evaluate(() => window.devicePixelRatio)
  expect(await canvas.evaluate((el: HTMLCanvasElement) => el.width)).toBe(160 * dpr)
  await expect.poll(() => darkRatio(canvas)).toBeGreaterThan(0.3)
  const before = await canvas.evaluate((el: HTMLCanvasElement) => el.toDataURL())
  await area.getByRole('textbox').fill('中文内容 UTF-8')
  await expect.poll(() => canvas.evaluate((el: HTMLCanvasElement) => el.toDataURL())).not.toBe(before)
  await area.getByRole('textbox').fill('')
  await expect(codes(area)).toHaveCount(1)
})

// svg 类型：viewBox 25 模块、前景路径与 antd 实测逐字一致；前景色为文字色；canvas / svg 同尺寸。
test('[qrcode.browser.type] svg path parity and canvas/svg sizing', async ({ page }, info) => {
  const area = await demo(page, info, 'type')
  const svg = codes(area).nth(1).locator('svg')
  await expect(svg).toHaveAttribute('viewBox', '0 0 25 25')
  await expect(svg.locator('path').nth(1)).toHaveAttribute('d', ANTD_PATH)
  expect(await paintedColor(svg.locator('path').nth(1), 'fill')).toBe('rgba(0, 0, 0, 0.88)')
  // antd 实测：canvas 拉伸为 134×134；svg 宽被 flex 压到 134、高保持属性 160（被根 overflow 裁剪，视觉仍为居中正方形）。
  const [c, s] = [await box(codes(area).nth(0).locator('canvas')), await box(svg)]
  expect([Math.round(c.width), Math.round(c.height), Math.round(s.width), Math.round(s.height)]).toEqual([134, 134, 134, 160])
})

// 图标：加载完成后 canvas 中心被挖空并绘制 Logo（中心像素非纯黑白模块），errorLevel H。
test('[qrcode.browser.icon] icon is excavated and drawn on canvas', async ({ page }, info) => {
  const area = await demo(page, info, 'icon')
  const root = codes(area).first()
  const img = root.locator('img[alt="QR-Code"]')
  await expect(img).toBeHidden()
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true)
  const canvas = root.locator('canvas')
  const center = () => canvas.evaluate((el: HTMLCanvasElement) => {
    const { data } = el.getContext('2d')!.getImageData(el.width / 2 - 2, el.height / 2 - 2, 4, 4)
    const colors = new Set<string>()
    for (let i = 0; i < data.length; i += 4) colors.add(`${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3]}`)
    return [...colors]
  })
  // antd Logo 中心为彩色（非黑色模块、非透明）。
  await expect.poll(async () => (await center()).some(c => { const [r, g, b, a] = c.split(',').map(Number); return a > 0 && !(r < 60 && g < 60 && b < 60) })).toBe(true)
})

// 状态：loading 遮罩内 Spin 居中；expired 文案 + 主色链接「点击刷新」（reload 图标）可点击；scanned 文案；遮罩 96% 白底铺满边框内。
test('[qrcode.browser.status] status covers', async ({ page }, info) => {
  const area = await demo(page, info, 'status')
  const [loading, expired, scanned] = [0, 1, 2].map(i => codes(area).nth(i))
  const cover = expired.locator('[data-qrcode-part="cover"]')
  const [rb, cb] = [await box(expired), await box(cover)]
  expect([cb.width, cb.height]).toEqual([rb.width - 2, rb.height - 2])
  expect(await paintedColor(cover, 'background-color')).toMatch(/0\.96\)$/)
  await expect(cover).toHaveCSS('z-index', '10')
  const spin = loading.locator('[data-qrcode-part="cover"] > *').first()
  const sb = await box(spin), lb = await box(loading)
  expect(Math.abs(sb.x + sb.width / 2 - (lb.x + lb.width / 2))).toBeLessThanOrEqual(1)
  expect(Math.abs(sb.y + sb.height / 2 - (lb.y + lb.height / 2))).toBeLessThanOrEqual(1)
  await expect(cover.locator('p')).toHaveText('二维码过期'); await expect(cover.locator('p')).toHaveCSS('margin', '0px')
  const button = cover.getByRole('button', { name: '点击刷新' })
  await expect(button).toBeVisible()
  expect(await paintedColor(button, 'color')).not.toBe(await paintedColor(cover.locator('p'), 'color'))
  expect(await paintedColor(button.locator('[aria-label="reload"] path'), 'fill')).toBe(await paintedColor(button, 'color'))
  const logs: string[] = []
  page.on('console', msg => logs.push(msg.text()))
  await button.click()
  await expect.poll(() => logs).toContain('refresh')
  await expect(scanned.locator('[data-qrcode-part="cover"] p')).toHaveText('已扫描')
})

// 自定义状态渲染：红色关闭图标 + 刷新链接、Loading 文案、绿色勾。
test('[qrcode.browser.status-render] custom statusRender', async ({ page }, info) => {
  const area = await demo(page, info, 'custom-status-render')
  await expect(codes(area).nth(0).getByText('Loading...')).toBeVisible()
  const expired = codes(area).nth(1)
  await expect(expired.getByRole('button', { name: '点击刷新' })).toBeVisible()
  expect(await paintedColor(expired.locator('.i-mdi-close-circle'), 'background-color')).toBe('rgb(255, 0, 0)')
  expect(await paintedColor(codes(area).nth(2).locator('.i-mdi-check-circle'), 'background-color')).toBe('rgb(0, 128, 0)')
})

// 自定义尺寸：按钮 ±10 改变根与 canvas 尺寸，下限 48 时 Smaller 禁用。
test('[qrcode.browser.size] size buttons', async ({ page }, info) => {
  const area = await demo(page, info, 'custom-size')
  const root = codes(area).first()
  await area.getByRole('button', { name: 'Larger' }).click()
  await expect.poll(async () => (await box(root)).width).toBe(170)
  expect(await root.locator('canvas').evaluate((el: HTMLCanvasElement) => el.getAttribute('width'))).toBe('170')
  const smaller = area.getByRole('button', { name: 'Smaller' })
  for (let i = 0; i < 13; i++) if (await smaller.isEnabled()) await smaller.click()
  await expect(smaller).toBeDisabled()
  expect((await box(root)).width).toBe(48)
})

// 自定义颜色：canvas 前景色像素为指定绿色；第二个根节点背景 #f5f5f5。
test('[qrcode.browser.color] custom color and bgColor', async ({ page }, info) => {
  const area = await demo(page, info, 'custom-color')
  const green = await codes(area).nth(0).locator('canvas').evaluate((el: HTMLCanvasElement) => {
    const { data } = el.getContext('2d')!.getImageData(0, 0, 4, 4)
    return [data[0], data[1], data[2]]
  })
  expect(green).toEqual([82, 196, 26])
  expect(await paintedColor(codes(area).nth(1), 'background-color')).toBe('rgb(245, 245, 245)')
})

// 纠错等级：切换 L → H 模块数增加（svg 不可见，比较 canvas 图像变化）；下载示例切到 svg 后渲染 svg 且可导出。
test('[qrcode.browser.errorlevel-download] error level switch and download', async ({ page }, info) => {
  const area = await demo(page, info, 'errorlevel')
  const canvas = codes(area).first().locator('canvas')
  const before = await canvas.evaluate((el: HTMLCanvasElement) => el.toDataURL())
  await area.getByText('H', { exact: true }).click()
  await expect.poll(() => canvas.evaluate((el: HTMLCanvasElement) => el.toDataURL())).not.toBe(before)
  const dl = await demo(page, info, 'download')
  const [download] = await Promise.all([page.waitForEvent('download'), dl.getByRole('button', { name: 'Download' }).click()])
  expect(download.suggestedFilename()).toBe('QRCode.png')
  await dl.getByText('svg', { exact: true }).click()
  await expect(codes(dl).first()).toHaveAttribute('data-qrcode-type', 'svg')
  await expect(codes(dl).first().locator('svg image')).toHaveCount(1)
  const [svgDownload] = await Promise.all([page.waitForEvent('download'), dl.getByRole('button', { name: 'Download' }).click()])
  expect(svgDownload.suggestedFilename()).toBe('QRCode.svg')
})

// 高级用法：悬停按钮出现气泡，内部二维码无边框（padding 0、边框透明）。语义化：对象 / 函数样式 2px 边框。
test('[qrcode.browser.popover-semantic] popover and semantic styles', async ({ page }, info) => {
  const area = await demo(page, info, 'popover')
  await area.getByRole('button', { name: 'Hover me' }).hover()
  const code = page.locator('[data-qrcode-type]').filter({ has: page.locator('canvas') }).last()
  await expect(code).toBeVisible()
  await expect(code).toHaveCSS('padding', '0px')
  expect(await paintedColor(code, 'border-top-color')).toBe('rgba(0, 0, 0, 0)')
  const style = await demo(page, info, 'style-class')
  const [a, b] = [codes(style).nth(0), codes(style).nth(1)]
  await expect(a).toHaveCSS('border-top-width', '2px'); await expect(a).toHaveCSS('padding', '16px')
  expect(await paintedColor(a, 'border-top-color')).toBe('rgb(24, 144, 255)')
  expect(await paintedColor(b, 'border-top-color')).toBe('rgb(255, 77, 79)')
  expect((await box(a.locator('canvas'))).width).toBe(124)
})

// 开发服务器渲染：状态示例遮罩可见。
test('[qrcode.browser.dev] dev rendering', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658/${path}`)
  await expect(page.locator('[data-demo="qr-code/status"]').getByText('二维码过期')).toBeVisible()
})

// API 表与示例容器在原始 HTML 中。
test('[qrcode.browser.ssr] API sections are server-rendered', async ({ request }) => {
  const response = await request.get(path); expect(response.status()).toBe(200)
  const html = await response.text()
  for (const text of ['QRCode API', 'StatusRenderInfo', 'boostLevel', 'data-demo="qr-code/download"']) expect(html).toContain(text)
})
