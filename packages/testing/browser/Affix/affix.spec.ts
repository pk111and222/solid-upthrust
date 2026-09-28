import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'

const path = 'components/navigation/affix/'
async function demo(page: Page, info: TestInfo, name: string) {
  if (!page.url().includes(info.project.name === 'docs' ? path : '/Affix')) await page.goto(info.project.name === 'docs' ? path : 'Affix')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="affix/${name}"]` : `[data-affix-demo="${name}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  await expect(area.locator('div[data-affixed]').first()).toBeAttached()
  return area
}
type Box = { x: number; y: number; width: number; height: number; bottom: number }
const box = (locator: Locator): Promise<Box> => locator.evaluate(el => {
  const r = el.getBoundingClientRect()
  return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom }
})
const docsOnly = (info: TestInfo) => test.skip(info.project.name !== 'docs', '窗口目标示例只在文档站验证（example 的滚动发生在 [data-appid=content]）')

// 滚动容器：滚过阈值后内容 absolute 固定在容器顶部 offsetTop 处，占位保留高度；滚回后恢复文档流；onChange 状态同步。
test('[affix.browser.target] pins inside the scroll container', async ({ page }, info) => {
  const area = await demo(page, info, 'target')
  const scroller = area.locator('[data-affix-scroller]')
  // 示例里的 <output> 也带 data-affixed（onChange 状态），固钉内容限定为滚动容器内的 div。
  const content = scroller.locator('div[data-affixed]')
  const placeholder = content.locator('..')
  const height = (await box(content)).height
  await scroller.evaluate(el => { el.scrollTop = 300 })
  await expect(content).toHaveAttribute('data-affixed', 'true')
  await expect(content).toHaveCSS('position', 'absolute')
  await expect(area.locator('output')).toHaveAttribute('data-affixed', 'true')
  await expect.poll(async () => Math.round((await box(content)).y - (await box(scroller)).y)).toBeGreaterThanOrEqual(12)
  expect(Math.abs((await box(content)).y - (await box(scroller)).y - 1 - 12)).toBeLessThan(1.5)
  expect(Math.abs((await box(placeholder)).height - height)).toBeLessThan(0.5)
  await area.screenshot({ path: info.outputPath('target.png') })
  await scroller.evaluate(el => { el.scrollTop = 0 })
  await expect(content).toHaveAttribute('data-affixed', 'false')
})

// 禁用与内容高度：禁用后回到文档流；切换内容高度后占位同步更新。
test('[affix.browser.controls] disabled and size change', async ({ page }, info) => {
  const area = await demo(page, info, 'target')
  const scroller = area.locator('[data-affix-scroller]')
  const content = scroller.locator('div[data-affixed]')
  await scroller.evaluate(el => { el.scrollTop = 300 })
  await expect(content).toHaveAttribute('data-affixed', 'true')
  const before = (await box(content)).height
  await area.getByRole('button', { name: '切换内容高度' }).click()
  await expect.poll(async () => (await box(content.locator('..'))).height).toBeGreaterThan(before)
  await area.getByRole('switch').click()
  await expect(content).toHaveAttribute('data-affixed', 'false')
})

// 窗口目标（文档站）：滚动页面后固定在窗口顶部 80px（position: fixed），且保持原宽度。
test('[affix.browser.window] fixed to the window top', async ({ page }, info) => {
  docsOnly(info)
  const area = await demo(page, info, 'basic')
  const content = area.locator('div[data-affixed]')
  const width = (await box(content)).width
  await content.evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + 200 }))
  await expect(content).toHaveAttribute('data-affixed', 'true')
  await expect(content).toHaveCSS('position', 'fixed')
  await expect.poll(async () => Math.round((await box(content)).y)).toBe(80)
  expect(Math.abs((await box(content)).width - width)).toBeLessThan(0.5)
  // onChange 示例在页面更下方（offsetTop 120）：滚到它原位置之下才会触发。
  const change = page.locator('[data-demo="affix/on-change"]')
  await change.locator('div[data-affixed]').evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY }))
  const log = change.locator('output')
  await expect.poll(async () => (await log.getAttribute('data-log')) ?? '').toContain('true')
})

// 底部（文档站）：页面顶部时原位置在视口下方则固定在底部 20px；滚到原位置后回到文档流。
test('[affix.browser.bottom] fixed to the window bottom', async ({ page }, info) => {
  docsOnly(info)
  await page.setViewportSize({ width: 1280, height: 400 })
  const area = await demo(page, info, 'bottom')
  const content = area.locator('div[data-affixed]')
  await page.evaluate(() => window.scrollTo({ top: 0 }))
  await expect(content).toHaveAttribute('data-affixed', 'true')
  await expect.poll(async () => Math.round(400 - (await box(content)).bottom)).toBe(20)
  await content.locator('..').evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100 }))
  await expect(content).toHaveAttribute('data-affixed', 'false')
})

// 静态 HTML 含 API 与契约文字。
test('[affix.browser.ssr] API contracts in static html', async ({ request }, info) => {
  docsOnly(info)
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  for (const text of ['offsetBottom', 'affixClass', 'updatePosition', 'calculateAffix', 'affix/target']) expect(html).toContain(text)
})
