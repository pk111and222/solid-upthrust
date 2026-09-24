import { expect, test, type Page, type TestInfo } from '@playwright/test'

const path = 'components/data-entry/time-picker/'

async function demo(page: Page, info: TestInfo, id: string) {
  await page.goto(info.project.name === 'docs' ? path : 'TimePicker')
  return page.locator(info.project.name === 'docs' ? `[data-demo="time-picker/${id}"]` : 'body')
}

// 打开时间面板后选择新小时，受控示例与输出同步更新。
test('[time-picker.browser.basic] open and select hour', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const input = area.getByRole('textbox').first()
  if (info.project.name === 'docs') await expect(input).toHaveValue('09:30')
  else await expect(input).toHaveValue('')
  await input.click()
  await expect(page.getByRole('listbox')).toBeVisible()
  await expect(page.getByRole('option')).toHaveCount(84)
  await page.getByRole('option', { name: '10', exact: true }).first().click()
  if (info.project.name === 'docs') await expect(area.locator('output').first()).toHaveText('当前时间：10:30')
  else await expect(page.getByText('当前值：10:00')).toBeVisible()
  await area.getByRole('button', { name: '清空' }).first().click()
  if (info.project.name === 'docs') await expect(area.locator('output').first()).toHaveText('当前时间：未选择')
})

// 秒格式渲染三列及 24/60/60 选项，并保持初始时间。
test('[time-picker.browser.seconds] render seconds column', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const input = area.getByRole('textbox').nth(1)
  await expect(input).toHaveValue('09:30:15')
  await input.click()
  await expect(page.getByRole('option')).toHaveCount(144)
})

test('[time-picker.browser.flip] flips above a bottom-edge input without position transition', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs')
  await page.setViewportSize({ width: 900, height: 390 })
  const area = await demo(page, info, 'basic')
  const input = area.getByRole('textbox').first()
  await input.evaluate(element => element.scrollIntoView({ block: 'end' }))
  const before = await page.evaluate(() => window.scrollY)
  await input.click()
  const layer = page.getByRole('listbox')
  await expect(layer).toBeVisible()
  await expect.poll(async () => (await layer.boundingBox())!.y).toBeLessThan((await input.boundingBox())!.y)
  expect(await layer.evaluate(element => getComputedStyle(element).transitionProperty)).toBe('opacity')
  expect(await page.evaluate(() => window.scrollY)).toBe(before)
})

test('[time-picker.browser.range-flip] range panel does not animate its flipped position', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs')
  await page.setViewportSize({ width: 900, height: 390 })
  const area = await demo(page, info, 'range')
  const input = area.locator('input[placeholder="开始时间"]')
  await input.evaluate(element => element.scrollIntoView({ block: 'end' }))
  await input.click()
  const layer = page.getByRole('listbox')
  await expect(layer).toBeVisible()
  expect((await layer.boundingBox())!.y).toBeLessThan((await input.boundingBox())!.y)
  expect(await layer.evaluate(element => getComputedStyle(element).transitionProperty)).toBe('opacity')
})

// RangePicker 默认值显示，结束早于开始时会按时间顺序交换两端。
test('[time-picker.browser.range] preserve ordered endpoints', async ({ page }, info) => {
  const area = await demo(page, info, 'range')
  const start = area.locator('input[placeholder="开始时间"]')
  const end = area.locator('input[placeholder="结束时间"]')
  await expect(start).toHaveValue('09:00')
  await expect(end).toHaveValue('17:30')
  await end.click()
  await page.getByRole('option').nth(92).click()
  if (info.project.name === 'docs') await expect(area.locator('output')).toHaveText('08:30 – 09:00')
  else await expect(page.getByText('当前区间：08:30 ~ 09:00')).toBeVisible()
})

// 静态 HTML 应含 API 与源码展示，且不依赖客户端执行文档示例。
test('[time-picker.browser.ssr] static API and source', async ({ request }, info) => {
  test.skip(info.project.name !== 'docs')
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  expect(html).toContain('TimePickerProps API')
  expect(html).toContain('time-picker/range')
  expect(html).toContain('secondStep')
})
