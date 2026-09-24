import { expect, test, type Page, type TestInfo } from '@playwright/test'

const path = 'components/data-entry/date-picker/'

async function demo(page: Page, info: TestInfo, id: string) {
  await page.goto(info.project.name === 'docs' ? path : 'DatePicker')
  return page.locator(info.project.name === 'docs' ? `[data-demo="date-picker/${id}"]` : 'body')
}

test('[date-picker.browser.basic] selects a date and updates the controlled value', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const input = area.getByRole('textbox').first()
  await expect(input).toHaveValue(info.project.name === 'docs' ? '2026-09-15' : '')
  await input.click()
  await expect(page.getByRole('listbox')).toBeVisible()
  await expect(page.getByRole('option')).toHaveCount(42)
  await page.getByRole('option', { name: '16', exact: true }).click()
  await expect(input).toHaveValue('2026-09-16')
  if (info.project.name === 'docs') await expect(area.locator('output')).toHaveText('当前日期：2026-09-16')
  else await expect(area.getByText('当前值：2026-09-16')).toBeVisible()
  await area.getByRole('button', { name: '清空' }).first().click()
  if (info.project.name === 'docs') await expect(area.locator('output')).toHaveText('当前日期：未选择')
})

test('[date-picker.browser.range] displays both endpoints and edits the start', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs')
  const area = await demo(page, info, 'range')
  const start = area.locator('input[placeholder="开始日期"]')
  const end = area.locator('input[placeholder="结束日期"]')
  await expect(start).toHaveValue('2026-09-10')
  await expect(end).toHaveValue('2026-09-20')
  await start.click()
  await expect(page.getByRole('option')).toHaveCount(84)
  await page.getByRole('option', { name: '11', exact: true }).first().click()
  await expect(start).toHaveValue('2026-09-11')
  await expect(area.locator('output')).toHaveText('日期区间：2026-09-11 – 2026-09-20')
})

test('[date-picker.browser.flip] flips above a bottom-edge input without position transition', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs')
  await page.setViewportSize({ width: 900, height: 390 })
  const area = await demo(page, info, 'basic')
  const input = area.getByRole('textbox').first()
  await input.evaluate(element => element.scrollIntoView({ block: 'end' }))
  await input.click()
  const layer = page.getByRole('listbox')
  await expect(layer).toBeVisible()
  await expect.poll(async () => (await layer.boundingBox())!.y).toBeLessThan((await input.boundingBox())!.y)
  expect(await layer.evaluate(element => getComputedStyle(element).transitionProperty)).toBe('opacity')
})

test('[date-picker.browser.range-flip] range panel does not animate its flipped position', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs')
  await page.setViewportSize({ width: 900, height: 470 })
  const area = await demo(page, info, 'range')
  const input = area.locator('input[placeholder="开始日期"]')
  await input.evaluate(element => element.scrollIntoView({ block: 'end' }))
  await input.click()
  const layer = page.getByRole('listbox')
  await expect(layer).toBeVisible()
  expect((await layer.boundingBox())!.y).toBeLessThan((await input.boundingBox())!.y)
  expect(await layer.evaluate(element => getComputedStyle(element).transitionProperty)).toBe('opacity')
})

test('[date-picker.browser.quarter] picks a quarter start in the calendar panel', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs')
  const area = await demo(page, info, 'modes')
  await area.getByRole('textbox').nth(2).click()
  await expect(page.getByRole('option')).toHaveCount(4)
  await page.getByRole('option', { name: '第4季度' }).click()
  await expect(area.locator('output')).toHaveText('所选周期起始日：2026-10-01')
})

test('[date-picker.browser.time] edits date-time without losing the date', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs')
  const area = await demo(page, info, 'time-presets')
  await area.getByRole('textbox').first().click()
  const time = page.getByRole('textbox', { name: '选择时间' })
  await expect(time).toHaveValue('09:30:00')
  await time.fill('13:45:00')
  await expect(area.locator('output')).toHaveText('日期时间：2026-09-15 13:45:00')
})

test('[date-picker.browser.preset] applies a date-time preset and retains the time', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs')
  const area = await demo(page, info, 'time-presets')
  await area.getByRole('textbox').first().click()
  await page.getByRole('button', { name: '项目起始日' }).click()
  await expect(area.locator('output')).toHaveText('日期时间：2026-09-01 09:00:00')
})

test('[date-picker.browser.constraints] disables dates beyond the bound', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs')
  const area = await demo(page, info, 'constraints')
  await area.getByRole('textbox').first().click()
  await expect(page.getByRole('option', { name: '20', exact: true })).toHaveAttribute('aria-disabled', 'true')
  await expect(area.getByRole('textbox').nth(1)).toBeDisabled()
})

test('[date-picker.browser.keyboard] Escape closes the calendar and preserves the selected date', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const input = area.getByRole('textbox').first()
  await input.click()
  await expect(page.getByRole('listbox')).toBeVisible()
  await input.press('Escape')
  await expect(page.getByRole('listbox')).toBeHidden()
  if (info.project.name === 'docs') await expect(input).toHaveValue('2026-09-15')
  else await expect(input).toHaveValue('')
})

test('[date-picker.browser.form] submits field values and restores them on reset', async ({ page }, info) => {
  const area = await demo(page, info, 'form')
  const form = area.locator('form').last()
  const date = form.locator('input').first()
  await expect(date).toHaveValue('2026-09-15')
  await date.click()
  await page.getByRole('option', { name: '16', exact: true }).click()
  await expect(date).toHaveValue('2026-09-16')
  await form.getByRole('button', { name: '提交日期' }).click()
  await expect(area.locator('output').last()).toContainText('"date":"2026-09-16"')
  await form.getByRole('button', { name: '重置日期' }).click()
  await expect(date).toHaveValue('2026-09-15')
})

test('[date-picker.browser.ssr] renders static API and source without JavaScript', async ({ request }, info) => {
  test.skip(info.project.name !== 'docs')
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  expect(html).toContain('DatePickerProps API')
  expect(html).toContain('DatePicker.RangePicker API')
  expect(html).toContain('date-picker/modes')
  expect(html).toContain('disabledDate')
})
