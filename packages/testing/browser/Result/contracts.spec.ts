import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'
import { paintedColor } from '../../utils/color-browser'
const path = 'components/feedback/result/'
async function demo(page: Page, info: TestInfo, name: string) {
  if (!page.url().includes(info.project.name === 'docs' ? path : '/Result')) await page.goto(info.project.name === 'docs' ? path : 'Result')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="result/${name}"]` : `[data-result-demo="${name}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  return area
}
type Box = { x: number; y: number; width: number; height: number }
const box = (locator: Locator): Promise<Box> => locator.evaluate(el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height } })
const part = (scope: Locator, name: string) => scope.locator(`[data-result-part="${name}"]`)
const cs = (locator: Locator, prop: string) => locator.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop)

// 成功：根 48px 32px；图标 72×72 绿色且水平居中、下方 24px；标题 24/32 居中、上下 8px；副标题 14/22 次要色；extra 距副标题 24px、按钮间距 8px。
test('[result.browser.success] antd spacing, typography and colors', async ({ page }, info) => {
  const area = await demo(page, info, 'success')
  const root = area.locator('[data-result-status]')
  await expect(root).toHaveCSS('padding', '48px 32px')
  const icon = part(root, 'icon'), svg = icon.locator('svg')
  const [ib, sb, rb] = [await box(icon), await box(svg), await box(root)]
  expect([Math.round(sb.width), Math.round(sb.height)]).toEqual([72, 72])
  expect(Math.abs(sb.x + sb.width / 2 - (rb.x + rb.width / 2))).toBeLessThanOrEqual(1)
  expect(Math.round(ib.height)).toBe(72)
  expect(await paintedColor(icon, 'color')).toBe('rgb(82, 196, 26)')
  await expect(icon).toHaveCSS('margin-bottom', '24px')
  const title = part(root, 'title'), sub = part(root, 'subTitle'), extra = part(root, 'extra')
  await expect(title).toHaveCSS('font-size', '24px'); await expect(title).toHaveCSS('line-height', '32px')
  await expect(title).toHaveCSS('margin', '8px 0px'); await expect(title).toHaveCSS('text-align', 'center')
  await expect(title).toHaveCSS('font-weight', '400')
  expect(await paintedColor(sub, 'color')).toMatch(/0\.45\)$/)
  await expect(sub).toHaveCSS('line-height', '22px')
  const [tb, subb, eb] = [await box(title), await box(sub), await box(extra)]
  expect(Math.round(subb.y - (tb.y + tb.height))).toBe(8)
  expect(Math.round(eb.y - (subb.y + subb.height))).toBe(24)
  const buttons = extra.getByRole('button')
  const [b0, b1] = [await box(buttons.nth(0)), await box(buttons.nth(1))]
  expect(Math.round(b1.x - (b0.x + b0.width))).toBe(8)
  await expect(buttons.nth(1)).toHaveCSS('margin-inline-end', '0px')
  expect(Math.abs((b0.x + b1.x + b1.width) / 2 - (rb.x + rb.width / 2))).toBeLessThanOrEqual(1)
})

// 状态色：info 主色、warning 橙色、error 红色；图标可见（绘制色非透明）。
test('[result.browser.status] info, warning and error colors', async ({ page }, info) => {
  const primary = await paintedColor(part(await demo(page, info, 'info'), 'icon'), 'color')
  expect(primary).toMatch(/^rgb\(/)
  expect(await paintedColor(part(await demo(page, info, 'warning'), 'icon'), 'color')).toBe('rgb(250, 173, 20)')
  const error = await demo(page, info, 'error')
  expect(await paintedColor(part(error, 'icon'), 'color')).toBe('rgb(255, 77, 79)')
  const path = part(error, 'icon').locator('path').first()
  expect(await paintedColor(path, 'fill')).toBe('rgb(255, 77, 79)')
})

// 异常插画：403 / 404 / 500 图片区 250×295 居中，SVG 实际尺寸与 antd 相同，无默认图标色。
test('[result.browser.exception] exception images', async ({ page }, info) => {
  for (const [code, width] of [['403', 251], ['404', 252], ['500', 254]] as const) {
    const area = await demo(page, info, code)
    const root = area.locator('[data-result-status]')
    const icon = part(root, 'icon'), rb = await box(root), ib = await box(icon)
    expect([Math.round(ib.width), Math.round(ib.height)]).toEqual([250, 295])
    expect(Math.abs(ib.x + ib.width / 2 - (rb.x + rb.width / 2))).toBeLessThanOrEqual(1)
    const svg = await box(icon.locator('svg'))
    expect([Math.round(svg.width), Math.round(svg.height)]).toEqual([width, 294])
    await expect(part(root, 'title')).toHaveText(code)
  }
})

// Error：body 距 extra 24px、24px 40px 内边距、浅底、左对齐；内部错误图标为红色 mask 且可见。
test('[result.browser.body] error body block', async ({ page }, info) => {
  const area = await demo(page, info, 'error')
  const body = part(area, 'body')
  await expect(body).toHaveCSS('padding', '24px 40px')
  await expect(body).toHaveCSS('text-align', 'start')
  expect(await paintedColor(body, 'background-color')).toMatch(/0\.02\)$/)
  const [eb, bb] = [await box(part(area, 'extra')), await box(body)]
  expect(Math.round(bb.y - (eb.y + eb.height))).toBe(24)
  const icon = body.locator('[class*="i-mdi-"]').first()
  // 示例用主题 error 色（antd 为 cssVar.colorError）：mask 图标绘制色 = 文字色，且与正文色不同。
  const color = await paintedColor(icon, 'color')
  expect(color).not.toBe(await paintedColor(body, 'color'))
  expect(await paintedColor(icon, 'background-color')).toBe(color)
})

// 自定义图标：72px 主色笑脸；语义化：对象形式虚线边框 / 斜体标题 / extra 底色，函数形式成功色边框。
test('[result.browser.custom] custom icon and semantic styles', async ({ page }, info) => {
  const custom = await demo(page, info, 'custom-icon')
  const icon = part(custom, 'icon').locator('[class*="i-mdi-"]')
  expect(Math.round((await box(icon)).width)).toBe(72)
  expect(await paintedColor(icon, 'background-color')).toBe(await paintedColor(icon, 'color'))
  const area = await demo(page, info, 'style-class')
  const [a, b] = [area.locator('[data-result-status]').nth(0), area.locator('[data-result-status]').nth(1)]
  await expect(a).toHaveCSS('border-top-style', 'dashed'); await expect(a).toHaveCSS('padding', '16px')
  await expect(a).toHaveClass(/demo-result-root/)
  await expect(part(a, 'title')).toHaveCSS('font-style', 'italic')
  expect(await paintedColor(part(a, 'title'), 'color')).toBe('rgb(24, 144, 255)')
  expect(await paintedColor(part(a, 'extra'), 'background-color')).toBe('rgb(240, 240, 240)')
  await expect(part(a, 'icon')).toHaveCSS('opacity', '0.8')
  await expect(b).toHaveClass(/demo-result-root--success/)
  expect(await paintedColor(b, 'background-color')).toBe('rgb(246, 255, 237)')
  expect(await cs(part(b, 'title'), 'color')).toBe('rgb(82, 196, 26)')
})

// 开发服务器渲染：异常插画可见。
test('[result.browser.dev] dev rendering', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658/${path}`)
  await expect(page.locator('[data-demo="result/404"] svg title')).toHaveText('No Found')
})

// API 表与示例容器在原始 HTML 中。
test('[result.browser.ssr] API sections are server-rendered', async ({ request }) => {
  const response = await request.get(path); expect(response.status()).toBe(200)
  const html = await response.text()
  for (const text of ['Result API', 'subTitle', 'PRESENTED_IMAGE_404', 'data-demo="result/style-class"']) expect(html).toContain(text)
})
