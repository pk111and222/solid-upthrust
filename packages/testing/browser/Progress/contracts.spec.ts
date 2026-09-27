import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'
import { paintedColor } from '../../utils/color-browser'
const path = 'components/feedback/progress/'
async function demo(page: Page, info: TestInfo, name: string) {
  if (!page.url().includes(info.project.name === 'docs' ? path : '/Progress')) await page.goto(info.project.name === 'docs' ? path : 'Progress')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="progress/${name}"]` : `[data-progress-demo="${name}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  return area
}
type Box = { x: number; y: number; width: number; height: number }
const box = (locator: Locator): Promise<Box> => locator.evaluate(el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height } })
const bars = (area: Locator) => area.locator('[role="progressbar"]')
const part = (scope: Locator, name: string) => scope.locator(`[data-progress-part="${name}"]`)

// 线形：导轨高 8px、圆角、浅色底；进度宽度 = percent；数值在导轨右侧 8px；状态色与图标；active 伪元素动画在跑。
test('[progress.browser.line] line geometry, colors and statuses', async ({ page }, info) => {
  const area = await demo(page, info, 'line')
  const [normal, active, exception, success, hidden] = [0, 1, 2, 3, 4].map(i => bars(area).nth(i))
  const rail = part(normal, 'rail'), track = part(normal, 'track')
  const r = await box(rail), t = await box(track), ind = await box(part(normal, 'indicator'))
  expect(r.height).toBe(8)
  expect(Math.abs(t.width - r.width * 0.3)).toBeLessThanOrEqual(1)
  expect(Math.round(ind.x - (r.x + r.width))).toBe(8)
  await expect(rail).toHaveCSS('border-top-left-radius', '100px')
  expect(await paintedColor(rail, 'background-color')).toMatch(/^rgba\(\d+, \d+, \d+, 0\.06\)$/)
  const primary = await paintedColor(track, 'background-color')
  expect(primary).not.toBe('rgba(0, 0, 0, 0)')
  expect(await part(active, 'track').evaluate(el => getComputedStyle(el, '::after').animationName)).toBe('ut-progress-active')
  expect(await paintedColor(part(exception, 'track'), 'background-color')).not.toBe(primary)
  expect(await paintedColor(part(exception, 'indicator').locator('[data-progress-icon]'), 'color')).toBe(await paintedColor(part(exception, 'track'), 'background-color'))
  expect(await paintedColor(part(success, 'track'), 'background-color')).toBe('rgb(82, 196, 26)')
  const icon = part(success, 'indicator').locator('[data-progress-icon]')
  expect((await box(icon)).width).toBe(14)
  await expect(part(hidden, 'indicator')).toHaveCount(0)
  expect((await box(part(hidden, 'rail'))).width).toBeGreaterThan(r.width)
})

// 小型：导轨 6px、12px 字号与 12px 图标，容器 180px 内不溢出。
test('[progress.browser.line-mini] small line sizing', async ({ page }, info) => {
  const area = await demo(page, info, 'line-mini')
  const bar = bars(area).first()
  expect((await box(part(bar, 'rail'))).height).toBe(6)
  await expect(bar).toHaveCSS('font-size', '12px')
  expect((await box(part(bars(area).nth(3), 'indicator').locator('[data-progress-icon]'))).width).toBe(12)
  const wrap = await box(area.locator('[role="progressbar"]').first().locator('..'))
  for (let i = 0; i < 4; i++) { const b = await box(bars(area).nth(i)); expect(b.x + b.width).toBeLessThanOrEqual(wrap.x + wrap.width + 0.5) }
})

// 圆形：120×120，导轨与进度路径都有实际描边；数值 24px 居中；exception 与 success 状态色描边。
test('[progress.browser.circle] circle rendering and centered info', async ({ page }, info) => {
  const area = await demo(page, info, 'circle')
  const bar = bars(area).first()
  const body = await box(part(bar, 'body'))
  expect([body.width, body.height]).toEqual([120, 120])
  const [rail, percent] = [bar.locator('circle').nth(0), bar.locator('circle').nth(1)]
  expect(await paintedColor(rail, 'stroke')).toMatch(/^rgba\(\d+, \d+, \d+, 0\.06\)$/)
  expect(await paintedColor(percent, 'stroke')).not.toMatch(/rgba\(0, 0, 0, 0\)/)
  expect(await percent.evaluate(el => getComputedStyle(el).strokeDasharray)).toMatch(/^295\.3\d*px/)
  const ind = part(bar, 'indicator')
  await expect(ind).toHaveCSS('font-size', '24px')
  const i = await box(ind)
  expect(Math.abs(i.y + i.height / 2 - (body.y + 60))).toBeLessThanOrEqual(1)
  expect(await paintedColor(bars(area).nth(2).locator('circle').nth(1), 'stroke')).toBe('rgb(82, 196, 26)')
  expect(await paintedColor(bars(area).nth(2).locator('[data-progress-icon]'), 'color')).toBe('rgb(82, 196, 26)')
})

// 响应式进度圈：14px 行内圆，无内嵌数值；悬停显示 Tooltip 文本。
test('[progress.browser.circle-micro] micro circle shows info in a tooltip', async ({ page }, info) => {
  const area = await demo(page, info, 'circle-micro')
  const bar = bars(area).first()
  const body = await box(part(bar, 'body'))
  expect([body.width, body.height]).toEqual([14, 14])
  await expect(part(bar, 'indicator')).toHaveCount(0)
  const label = await box(area.getByText('Code release'))
  expect(Math.abs(body.y + 7 - (label.y + label.height / 2))).toBeLessThanOrEqual(2)
  await part(bar, 'body').hover()
  await expect(page.getByRole('tooltip', { name: 'In progress, 60% complete' })).toBeVisible()
})

// 动态：点击增加 / 减少，线形与圆形同步变化，钳制在 0~100。
test('[progress.browser.dynamic] buttons drive both bars', async ({ page }, info) => {
  const area = await demo(page, info, 'dynamic')
  const plus = area.getByRole('button', { name: '增加' }), minus = area.getByRole('button', { name: '减少' })
  await minus.click()
  await expect(bars(area).first()).toHaveAttribute('aria-valuenow', '0')
  await plus.click(); await plus.click()
  await expect(bars(area).first()).toHaveAttribute('aria-valuenow', '20')
  await expect(bars(area).nth(1)).toHaveAttribute('aria-valuenow', '20')
  await expect(part(bars(area).nth(1), 'indicator')).toHaveText('20%')
  for (let i = 0; i < 10; i++) await plus.click()
  await expect(bars(area).first()).toHaveAttribute('data-progress-status', 'success')
})

// 仪表盘：缺口角度与位置切换改变导轨旋转；分段：成功段绿色、进度段主色。
test('[progress.browser.dashboard] gap degree, placement and segments', async ({ page }, info) => {
  const area = await demo(page, info, 'dashboard')
  const rail = bars(area).first().locator('circle').first()
  await expect(rail).toHaveCSS('transform', /matrix/)
  const dash = () => rail.evaluate(el => getComputedStyle(el).strokeDasharray)
  expect(await dash()).toMatch(/^254\.29\d*px/)
  await area.getByText('100', { exact: true }).click()
  await expect.poll(dash).toMatch(/^213\.27\d*px/)
  const rotate = () => rail.evaluate(el => el.style.transform)
  await area.getByText('top', { exact: true }).click()
  await expect.poll(rotate).toContain('rotate(320deg)')
  await area.getByText('start', { exact: true }).click()
  await expect.poll(rotate).toContain('rotate(230deg)')
  const seg = await demo(page, info, 'segment')
  const line = bars(seg).first()
  expect(await paintedColor(line.locator('[data-progress-track="success"]'), 'background-color')).toBe('rgb(82, 196, 26)')
  const circle = bars(seg).nth(1)
  expect(await paintedColor(circle.locator('[data-progress-path="success"]'), 'stroke')).toBe('rgb(82, 196, 26)')
  await expect(circle.locator('[data-progress-path="success"]')).toHaveAttribute('opacity', '1')
  await line.hover()
  await expect(page.getByRole('tooltip', { name: '3 done / 3 in progress / 4 to do' })).toBeVisible()
})

// 渐变：线形背景为 linear-gradient；圆形渐变通过 mask 绘制出非透明像素（foreignObject 可见）。
test('[progress.browser.gradient] gradient line and conic circle', async ({ page }, info) => {
  const area = await demo(page, info, 'gradient-line')
  expect(await part(bars(area).first(), 'track').evaluate(el => getComputedStyle(el).backgroundImage)).toContain('linear-gradient')
  const circle = bars(area).nth(2)
  await expect(part(circle, 'body')).toHaveAttribute('data-progress-gradient', 'true')
  const fo = circle.locator('foreignObject')
  expect((await box(fo)).width).toBeGreaterThan(100)
  expect(await fo.locator('div div').evaluate(el => getComputedStyle(el).backgroundImage)).toContain('conic-gradient')
  // 截图取像素：圆环 12 点方向（进度起点）应有颜色。
  const shot = await part(circle, 'body').screenshot()
  expect(shot.byteLength).toBeGreaterThan(500)
  const linecap = circle.locator('mask circle').first()
  await expect(linecap).toHaveAttribute('stroke-linecap', 'butt')
})

// 步骤：每格 14×8、间隔 2px；点亮格主色 / 数组色；未点亮格导轨色；步骤圆滑块改变格数。
test('[progress.browser.steps] step bars and circle steps', async ({ page }, info) => {
  const area = await demo(page, info, 'steps')
  const cells = part(bars(area).first(), 'track')
  await expect(cells).toHaveCount(3)
  const [a, b] = [await box(cells.nth(0)), await box(cells.nth(1))]
  expect([a.width, a.height, Math.round(b.x - a.x - a.width)]).toEqual([14, 8, 2])
  const colored = part(bars(area).nth(3), 'track')
  expect(await paintedColor(colored.nth(2), 'background-color')).toBe('rgb(255, 77, 79)')
  expect(await paintedColor(colored.nth(4), 'background-color')).toMatch(/^rgba\(\d+, \d+, \d+, 0\.06\)$/)
  const circle = await demo(page, info, 'circle-steps')
  const second = bars(circle).nth(1)
  await expect(second.locator('circle')).toHaveCount(5)
  const slider = circle.getByRole('slider').first()
  await slider.focus(); await page.keyboard.press('ArrowRight')
  await expect(second.locator('circle')).toHaveCount(6)
  await expect(bars(circle).first().locator('circle')).toHaveCount(8)
})

// 尺寸：线形 small / [300,20]；圆形 small 60、20 → 行内；步骤 small 宽 2、[20,30]。
test('[progress.browser.size] size variants', async ({ page }, info) => {
  const area = await demo(page, info, 'size')
  expect((await box(part(bars(area).nth(2), 'rail'))).height).toBe(20)
  expect((await box(part(bars(area).nth(2), 'body'))).width).toBe(300)
  expect((await box(part(bars(area).nth(4), 'body'))).width).toBe(60)
  expect((await box(part(bars(area).nth(5), 'body'))).width).toBe(20)
  expect((await box(part(bars(area).nth(10), 'track').first())).width).toBe(2)
  const big = await box(part(bars(area).nth(12), 'track').first())
  expect([big.width, big.height]).toEqual([20, 30])
})

// 数值位置：inner 在进度条内部（白字 / 亮色底深色字）；outer start 在左；center outer 在下方居中。
test('[progress.browser.info-position] inner and outer info placement', async ({ page }, info) => {
  const area = await demo(page, info, 'info-position')
  const inner = bars(area).nth(1)
  const t = await box(part(inner, 'track')), ind = await box(part(inner, 'indicator'))
  expect(ind.x).toBeGreaterThanOrEqual(t.x - 0.5)
  expect(ind.x + ind.width).toBeLessThanOrEqual(t.x + t.width + 0.5)
  expect(await paintedColor(part(inner, 'indicator'), 'color')).toBe('rgb(255, 255, 255)')
  expect(await paintedColor(part(bars(area).nth(2), 'indicator'), 'color')).toBe('rgba(0, 0, 0, 0.45)')
  const start = bars(area).nth(5)
  expect((await box(part(start, 'indicator'))).x).toBeLessThan((await box(part(start, 'rail'))).x)
  const center = bars(area).nth(7)
  const cr = await box(part(center, 'rail')), ci = await box(part(center, 'indicator'))
  expect(ci.y).toBeGreaterThan(cr.y + cr.height)
  expect(Math.abs(ci.x + ci.width / 2 - (cr.x + cr.width / 2))).toBeLessThanOrEqual(1)
})

// 语义化：函数 styles 让每条进度色相不同，导轨与进度圆角 8px；linecap butt 直角。
test('[progress.browser.semantic] style-class and linecap', async ({ page }, info) => {
  const area = await demo(page, info, 'style-class')
  const images = await area.locator('[data-progress-part="track"]').evaluateAll(els => els.map(el => getComputedStyle(el).backgroundImage))
  expect(new Set(images).size).toBe(6)
  await expect(part(bars(area).first(), 'rail')).toHaveCSS('border-top-left-radius', '8px')
  await expect(bars(area).first()).toHaveClass(/demo-progress-root/)
  const cap = await demo(page, info, 'linecap')
  await expect(part(bars(cap).first(), 'rail')).toHaveCSS('border-top-left-radius', '0px')
  await expect(bars(cap).nth(1).locator('circle').nth(1)).toHaveAttribute('stroke-linecap', 'butt')
})

// 开发服务器渲染：动态示例可交互。
test('[progress.browser.dev] dev rendering', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658/${path}`)
  const area = page.locator('[data-demo="progress/dynamic"]')
  await area.getByRole('button', { name: '增加' }).click()
  await expect(area.locator('[role="progressbar"]').first()).toHaveAttribute('aria-valuenow', '10')
})

// API 表与示例容器在原始 HTML 中。
test('[progress.browser.ssr] API sections are server-rendered', async ({ request }) => {
  const response = await request.get(path); expect(response.status()).toBe(200)
  const html = await response.text()
  for (const text of ['percentPosition', 'gapPlacement', 'strokeLinecap', 'data-demo="progress/circle-steps"']) expect(html).toContain(text)
})
