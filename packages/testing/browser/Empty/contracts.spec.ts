import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'
import { paintedColor } from '../../utils/color-browser'
const path = 'components/data-display/empty/'
async function demo(page: Page, info: TestInfo, name: string) {
  if (!page.url().includes(info.project.name === 'docs' ? path : '/Empty')) await page.goto(info.project.name === 'docs' ? path : 'Empty')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="empty/${name}"]` : `[data-empty-demo="${name}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  return area
}
const box = (locator: Locator) => locator.evaluate(el => { const r = el.getBoundingClientRect(); return { x: r.x, width: r.width, height: r.height } })
/** Empty 根节点：图片区的父节点。 */
const empty = (area: Locator, nth = 0) => area.locator('svg[data-empty-image], img').nth(nth).locator('xpath=../..')

// 默认插画：图片区 100px、svg 撑满高度且水平居中；描述为 0.45 描述色、14px；插画颜色随主题变量绘制为实色。
test('[empty.browser.default] default illustration layout and colors', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const root = empty(area)
  const image = root.locator('> div').first(), svg = image.locator('svg')
  await expect(image).toHaveCSS('height', '100px'); await expect(image).toHaveCSS('margin-bottom', '8px')
  await expect(svg).toHaveCSS('height', '100px')
  const [i, s] = [await box(image), await box(svg)]
  expect(Math.abs(s.x + s.width / 2 - (i.x + i.width / 2))).toBeLessThanOrEqual(1)
  await expect(root).toHaveCSS('text-align', 'center'); await expect(root).toHaveCSS('font-size', '14px')
  await expect(root).toHaveCSS('margin-left', '8px'); await expect(root).toHaveCSS('margin-top', '0px')
  const description = root.locator('> div').nth(1)
  await expect(description).toHaveText('暂无数据')
  expect(await paintedColor(description, 'color')).toMatch(/^rgba\(\d+, \d+, \d+, 0\.45\)$/)
  // 所有插画图形都有实色填充（color-mix 生效，不是 none，也不是 SVG 默认黑色）。
  const fills = await svg.locator('path, ellipse').evaluateAll(els => els.map(el => getComputedStyle(el).fill))
  expect(fills.length).toBeGreaterThan(3)
  for (const fill of fills) { expect(fill).not.toBe('none'); expect(fill).not.toBe('rgb(0, 0, 0)') }
})

// 简洁插画：根节点纵向 32px、图片 40px、svg 高 40px；图形有实色填充。
test('[empty.browser.simple] simple illustration uses the normal layout', async ({ page }, info) => {
  const area = await demo(page, info, 'simple')
  const root = empty(area)
  await expect(root).toHaveCSS('margin-top', '32px'); await expect(root).toHaveCSS('margin-bottom', '32px')
  const image = root.locator('> div').first()
  await expect(image).toHaveCSS('height', '40px'); await expect(image.locator('svg')).toHaveCSS('height', '40px')
  await expect(image.locator('svg')).toHaveAttribute('data-empty-image', 'simple')
  expect(await image.locator('svg ellipse').evaluate(el => getComputedStyle(el).fill)).not.toBe('rgb(0, 0, 0)')
})

// 自定义：图片地址渲染 img 并被 styles.image 设为 60px；描述节点可交互；底部按钮区上边距 16px。
test('[empty.browser.customize] custom image, description and footer', async ({ page }, info) => {
  const area = await demo(page, info, 'customize')
  const img = area.locator('img')
  await expect(img).toHaveAttribute('alt', 'empty'); await expect(img).toHaveAttribute('draggable', 'false')
  await expect(img.locator('..')).toHaveCSS('height', '60px'); await expect(img).toHaveCSS('height', '60px')
  // 图片水平居中（preflight 下 img 为 block，不受 text-align 影响）。
  const [holder, picture] = [await box(img.locator('..')), await box(img)]
  expect(Math.abs(picture.x + picture.width / 2 - (holder.x + holder.width / 2))).toBeLessThanOrEqual(1)
  await expect(area.getByRole('link', { name: '描述' })).toBeVisible()
  const footer = area.getByRole('button', { name: '立即创建' }).locator('..')
  await expect(footer).toHaveCSS('margin-top', '16px')
})

// 无描述只渲染图片区；语义化示例的 root / image / description 样式生效。
test('[empty.browser.semantic] description=false and semantic styles', async ({ page }, info) => {
  const description = await demo(page, info, 'description')
  await expect(empty(description).locator('> div')).toHaveCount(1)
  const semantic = await demo(page, info, 'semantic')
  const [first, second] = [empty(semantic, 0), empty(semantic, 1)]
  expect(await paintedColor(first, 'background-color')).toBe('rgb(245, 245, 245)')
  await expect(first).toHaveCSS('border-top-style', 'dashed'); await expect(first).toHaveCSS('padding-top', '16px')
  await expect(first.locator('> div').first()).toHaveCSS('filter', 'grayscale(1)')
  expect(await paintedColor(semantic.getByText('对象形式的样式'), 'color')).toBe('rgb(24, 144, 255)')
  await expect(semantic.getByText('对象形式的样式')).toHaveCSS('font-weight', '700')
  expect(await paintedColor(second, 'background-color')).toBe('rgb(230, 247, 255)')
  await expect(second.locator('> div').first()).toHaveCSS('filter', 'hue-rotate(180deg)')
})

// 窄屏无横向溢出。
test('[empty.browser.mobile] no horizontal overflow on phones', async ({ page }, info) => {
  await demo(page, info, 'basic')
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1)
})

// 开发模式：插画渲染且颜色类生效。
test('[empty.browser.dev] dev rendering', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658/${path}`)
  const svg = page.locator('[data-demo="empty/basic"] svg[data-empty-image="default"]')
  await expect(svg).toHaveCSS('height', '100px')
  expect(await svg.locator('path').first().evaluate(el => getComputedStyle(el).fill)).not.toBe('rgb(0, 0, 0)')
})

// API 与示例容器在原始 HTML 中。
test('[empty.browser.ssr] API sections are server-rendered', async ({ request }) => {
  const response = await request.get(path); expect(response.status()).toBe(200)
  const html = await response.text()
  for (const text of ['imageStyle', 'PRESENTED_IMAGE_SIMPLE', 'data-demo="empty/customize"', '约定与边界']) expect(html).toContain(text)
})
