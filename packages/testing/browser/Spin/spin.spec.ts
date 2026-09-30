import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'

const path = 'components/feedback/spin/'
async function demo(page: Page, info: TestInfo, id: string) {
  const docs = info.project.name === 'docs'
  if (!page.url().includes(docs ? path : '/Spin')) await page.goto(docs ? path : 'Spin')
  const area = page.locator(docs ? `[data-demo="spin/${id}"]` : `[data-spin-demo="${id}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  return area
}
const box = (locator: Locator) => locator.evaluate(el => {
  const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }
})
// wind4 颜色计算值可能是 oklab，用同类名探针元素归一对比
const probeColor = (page: Page, cls: string) => page.evaluate(c => { const el = document.createElement('i'); el.className = c; document.body.append(el); const v = getComputedStyle(el).color; el.remove(); return v }, cls)
const near = (actual: number, expected: number, tolerance = 1) => expect(Math.abs(actual - expected), `${actual} ≈ ${expected}`).toBeLessThanOrEqual(tolerance)

// 尺寸：指示器 14 / 20 / 32px 方块，点径 (size - 2) / 2 × scale(0.75)；主色；方阵在旋转（transform 随时间变化）。
test('[spin.browser.size] indicator geometry and rotation', async ({ page }, info) => {
  const area = await demo(page, info, 'size')
  const holders = area.locator('[data-spin-part="indicator"]')
  const sizes = info.project.name === 'docs' ? [14, 20, 32] : [20, 14, 32]
  for (const [i, size] of sizes.entries()) {
    const holder = await box(holders.nth(i))
    near(holder.width, size); near(holder.height, size)
    // 点位于 rotate(45deg) 方阵内，外接矩形被 √2 放大，量布局宽度
    near(await holders.nth(i).locator('i').first().evaluate(el => (el as HTMLElement).offsetWidth), (size - 2) / 2, 0.6)
  }
  const color = await holders.first().evaluate(el => getComputedStyle(el).color)
  expect(color).toBe(await probeColor(page, 'text-primary'))
  const spinner = holders.first().locator('> span')
  const a = await spinner.evaluate(el => getComputedStyle(el).transform)
  await page.waitForTimeout(150)
  expect(await spinner.evaluate(el => getComputedStyle(el).transform)).not.toBe(a)
  await area.screenshot({ path: info.outputPath('size.png') })
})

// 嵌套：打开加载后指示器在容器正中，容器 0.5 透明并被蒙层拦截点击；关闭后恢复。
test('[spin.browser.nested] overlay centred and container dimmed', async ({ page }, info) => {
  const area = await demo(page, info, 'nested')
  const toggle = info.project.name === 'docs' ? area.getByRole('switch') : page.locator('[data-spin-demo="size"]').locator('..').getByRole('button', { name: '开始加载' })
  await toggle.click()
  const root = area.locator('[data-spin-part="root"]').first()
  const section = root.locator('[data-spin-part="section"]')
  await expect(section).toBeVisible()
  const container = root.locator('[data-spin-part="container"]')
  const [s, c] = [await box(section), await box(container)]
  near(s.x + s.width / 2, c.x + c.width / 2); near(s.y + s.height / 2, c.y + c.height / 2)
  await expect.poll(() => container.evaluate(el => getComputedStyle(el).opacity)).toBe('0.5')
  expect(await container.evaluate(el => getComputedStyle(el, '::after').opacity)).toBe('0.4')
  await area.screenshot({ path: info.outputPath('nested.png') })
  await (info.project.name === 'docs' ? toggle : page.getByRole('button', { name: '停止加载' })).click()
  await expect(section).toHaveCount(0)
  await expect.poll(() => container.evaluate(el => getComputedStyle(el).opacity)).toBe('1')
})

// 进度：percent>0 时点阵收起，progressbar 圆环与点阵同尺寸并按比例描边。
test('[spin.browser.percent] progress ring replaces the dots', async ({ page }, info) => {
  test.skip(info.project.name === 'docs', 'docs 示例为动画进度，example 固定值便于断言')
  const area = await demo(page, info, 'percent')
  const bars = area.getByRole('progressbar')
  await expect(bars).toHaveCount(4)
  await expect(bars.nth(1)).toHaveAttribute('aria-valuenow', '60')
  near((await box(bars.nth(1))).width, 20)
  await expect.poll(() => area.locator('[data-spin-part="indicator"]').nth(1).evaluate(el => getComputedStyle(el).opacity)).toBe('0')
  await expect.poll(async () => Number(await bars.nth(3).getAttribute('aria-valuenow'))).toBeGreaterThan(0)
  await area.screenshot({ path: info.outputPath('percent.png') })
})

// 全屏：遮罩铺满视口、45% 黑色、z 1000，指示器与描述白色居中；结束后淡出且不拦截点击。
test('[spin.browser.fullscreen] backdrop loader', async ({ page }, info) => {
  const area = await demo(page, info, 'fullscreen')
  await area.getByRole('button').first().click()
  const root = page.locator('[data-spin-part="root"].fixed')
  await expect(root.locator('[data-spin-part="section"]')).toBeVisible()
  const viewport = page.viewportSize()!
  const r = await box(root)
  expect([r.x, r.y, r.width, r.height]).toEqual([0, 0, viewport.width, viewport.height])
  expect(await root.evaluate(el => [getComputedStyle(el).zIndex, getComputedStyle(el).backgroundColor])).toEqual(['1000', expect.stringMatching(/0\.45\)$/)])
  const section = await box(root.locator('[data-spin-part="section"]'))
  near(section.x + section.width / 2, viewport.width / 2); near(section.y + section.height / 2, viewport.height / 2)
  expect(await root.locator('[data-spin-part="section"]').evaluate(el => getComputedStyle(el).color)).toBe(await probeColor(page, 'text-white'))
  await page.screenshot({ path: info.outputPath('fullscreen.png') })
  await expect(root.locator('[data-spin-part="section"]')).toHaveCount(0, { timeout: 5000 })
  await expect.poll(() => root.evaluate(el => [getComputedStyle(el).opacity, getComputedStyle(el).pointerEvents])).toEqual(['0', 'none'])
})
