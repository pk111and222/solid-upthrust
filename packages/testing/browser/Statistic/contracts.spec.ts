import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'
import { paintedColor } from '../../utils/color-browser'
const path = 'components/data-display/statistic/'
async function demo(page: Page, info: TestInfo, name: string) {
  if (!page.url().includes(info.project.name === 'docs' ? path : '/Statistic')) await page.goto(info.project.name === 'docs' ? path : 'Statistic')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="statistic/${name}"]` : `[data-statistic-demo="${name}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  return area
}
const part = (area: Locator, name: string) => area.locator(`[data-statistic-part="${name}"]`)
const rect = (locator: Locator) => locator.evaluate(el => { const r = el.getBoundingClientRect(); return { x: r.x, right: r.right, top: r.top, bottom: r.bottom } })

// 基本：标题 14px 描述色 + 下内边距 4px；数值 24px 标题色；千分位与截断精度；loading 显示骨架屏并有 16px 上边距。
test('[statistic.browser.basic] typography, formatting and skeleton', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  await expect(part(area, 'value')).toHaveText(['112,893', '112,893.00'])
  const title = part(area, 'title').first()
  await expect(title).toHaveCSS('font-size', '14px')
  expect(await paintedColor(title, 'color')).toMatch(/^rgba\(\d+, \d+, \d+, 0\.45\)$/)
  await expect(part(area, 'header').first()).toHaveCSS('padding-bottom', '4px')
  const content = part(area, 'content').first()
  await expect(content).toHaveCSS('font-size', '24px'); await expect(content).toHaveCSS('line-height', /^37\.7/)
  await expect(part(area, 'value').first()).toHaveCSS('display', 'inline-block'); await expect(part(area, 'value').first()).toHaveCSS('direction', 'ltr')
  const skeletonTitle = part(area, 'title').nth(2).locator('xpath=../following-sibling::*[1]')
  await expect(skeletonTitle).toHaveAttribute('aria-hidden', 'true'); await expect(skeletonTitle).toHaveCSS('padding-top', '16px')
  await expect(part(area, 'content')).toHaveCount(2)
})

// 单位：前缀图标与后缀文本与数值间距 4px，同一行排列。
test('[statistic.browser.unit] prefix and suffix spacing', async ({ page }, info) => {
  const area = await demo(page, info, 'unit')
  const prefix = part(area, 'prefix').first(), suffix = part(area, 'suffix').first()
  await expect(prefix).toHaveCSS('margin-inline-end', '4px'); await expect(suffix).toHaveCSS('margin-inline-start', '4px')
  // 图标类 span 本身没有 display，行内时宽度为 0：必须真实占位（1em 宽）。
  const icon = prefix.locator('span')
  expect(await icon.evaluate(el => getComputedStyle(el).maskImage)).not.toBe('none')
  expect((await icon.boundingBox())!.width).toBeGreaterThanOrEqual(20)
  const [p, v] = [await rect(prefix), await rect(part(area, 'value').first())]
  expect(v.x - p.right).toBeGreaterThanOrEqual(3.5)
  await expect(part(area, 'content').nth(1)).toHaveText('93/ 100')
  const [value, s] = [await rect(part(area, 'value').nth(1)), await rect(suffix)]
  expect(Math.abs(value.bottom - s.bottom)).toBeLessThanOrEqual(2)
})

// 动画：数字从 0 滚动到目标并使用等宽数字；卡片示例的 styles.content 颜色生效。
test('[statistic.browser.animated] count-up and card colors', async ({ page }, info) => {
  const area = await demo(page, info, 'animated')
  await expect(part(area, 'value')).toHaveText(['112,893', '112,893'], { timeout: 5000 })
  await expect(part(area, 'content').first()).toHaveCSS('font-variant-numeric', 'tabular-nums')
  const card = await demo(page, info, 'card')
  await expect(part(card, 'value')).toHaveText(['11.28', '9.30'])
  expect(await paintedColor(part(card, 'content').first(), 'color')).toBe('rgb(63, 134, 0)')
  for (const arrow of await part(card, 'prefix').locator('span').all()) expect((await arrow.boundingBox())!.width).toBeGreaterThanOrEqual(20)
  expect(await paintedColor(part(card, 'content').nth(1), 'color')).toBe('rgb(207, 19, 34)')
})

// 计时器：倒计时逐秒减少、小时吸收天数；毫秒格式持续变化；正计时递增；天级别格式。
test('[statistic.browser.timer] countdown and countup tick', async ({ page }, info) => {
  const area = await demo(page, info, 'timer')
  const values = part(area, 'value')
  await expect(values).toHaveCount(6)
  await expect(values.nth(0)).toHaveText(/^48:00:[0-3]\d$/)
  await expect(values.nth(1)).toHaveText(/^48:00:\d\d:\d{3}$/)
  const ms1 = await values.nth(1).textContent()
  await page.waitForTimeout(120)
  expect(await values.nth(1).textContent()).not.toBe(ms1)
  await expect(values.nth(4)).toHaveText(/^2 天 0 时 0 分 \d+ 秒$/)
  await expect(values.nth(5)).toHaveText(/^1 天 23 时 59 分 \d+ 秒$/)
  const up = await values.nth(3).textContent()
  await expect(values.nth(3)).not.toHaveText(up!, { timeout: 2500 })
  await expect(values.nth(0)).not.toHaveAttribute('title', /./)
})

// 语义化：root 虚线边框与内边距；value 背景与圆角；负数按值计算的颜色。
test('[statistic.browser.semantic] semantic styles', async ({ page }, info) => {
  const area = await demo(page, info, 'semantic')
  const root = part(area, 'header').first().locator('..')
  await expect(root).toHaveCSS('border-top-style', 'dashed'); await expect(root).toHaveCSS('padding-top', '16px')
  const value = part(area, 'value').first()
  expect(await paintedColor(value, 'background-color')).toBe('rgb(230, 244, 255)')
  await expect(value).toHaveCSS('border-top-left-radius', '4px'); await expect(value).toHaveCSS('padding-left', '6px')
  expect(await paintedColor(part(area, 'title').first(), 'color')).toBe('rgb(24, 144, 255)')
  expect((await part(area, 'prefix').first().locator('span').boundingBox())!.width).toBeGreaterThanOrEqual(20)
  await expect(part(area, 'value').nth(1)).toHaveText('-18.7')
  expect(await paintedColor(part(area, 'title').nth(1), 'color')).toBe('rgb(255, 77, 79)')
  expect(await paintedColor(part(area, 'content').nth(1), 'color')).toBe('rgb(255, 120, 117)')
})

// 窄屏无横向溢出。
test('[statistic.browser.mobile] no horizontal overflow on phones', async ({ page }, info) => {
  await demo(page, info, 'timer')
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1)
})

// 开发模式：计时器在 dev 构建中刷新。
test('[statistic.browser.dev] dev rendering', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658/${path}`)
  const value = page.locator('[data-demo="statistic/timer"] [data-statistic-part="value"]').nth(1)
  await expect(value).toHaveText(/^\d\d:\d\d:\d\d:\d{3}$/)
  const first = await value.textContent()
  await expect(value).not.toHaveText(first!)
})

// 三张 API 表与示例容器在原始 HTML 中。
test('[statistic.browser.ssr] API sections are server-rendered', async ({ request }) => {
  const response = await request.get(path); expect(response.status()).toBe(200)
  const html = await response.text()
  for (const text of ['Statistic API', 'Statistic.Timer API', 'Statistic.Countdown API', 'valueRender', 'data-demo="statistic/timer"']) expect(html).toContain(text)
})
