import { expect, test, type Page, type TestInfo } from '@playwright/test'

const path = 'components/data-entry/color-picker/'

async function demo(page: Page, info: TestInfo, id: string) {
  await page.goto(info.project.name === 'docs' ? path : 'ColorPicker')
  return page.locator(info.project.name === 'docs' ? `[data-demo="color-picker/${id}"]` : 'body')
}

test('[color-picker.browser.basic] opens the panel, commits text and clears', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  await area.getByRole('button', { name: '主题颜色' }).click()
  const panel = page.getByRole('dialog').locator('[aria-label="颜色面板"]')
  await expect(panel).toBeVisible()
  const input = panel.getByRole('textbox', { name: '颜色值' })
  await input.fill('#722ed1')
  await input.press('Enter')
  if (info.project.name === 'docs') await expect(area.locator('output')).toHaveText('当前颜色：#722ed1')
  else await expect(area.getByRole('status').first()).toContainText('#722ed1')
  await panel.getByRole('button', { name: '清除' }).click()
  if (info.project.name === 'docs') await expect(area.locator('output')).toHaveText('当前颜色：未选择')
  else await expect(area.getByRole('status').first()).toContainText('已清除')
})

test('[color-picker.browser.inline] selects a preset and updates the inline panel', async ({ page }, info) => {
  const area = await demo(page, info, 'inline')
  const label = info.project.name === 'docs' ? '预设颜色 #722ed1' : '预设颜色 #1677ff'
  await area.getByRole('button', { name: label, exact: true }).first().click()
  if (info.project.name === 'docs') await expect(area.locator('output')).toHaveText('面板颜色：#722ed1')
  else await expect(area.getByRole('button', { name: label, exact: true }).first()).toHaveAttribute('aria-pressed', 'true')
})

test('[color-picker.browser.format] changes display format and keeps alpha controls', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs')
  const area = await demo(page, info, 'formats')
  await area.getByRole('button', { name: '格式与透明度' }).click()
  const panel = page.getByRole('dialog').locator('[aria-label="颜色面板"]')
  await expect(panel.getByRole('slider', { name: '透明度' })).toBeVisible()
  await panel.getByRole('combobox', { name: '颜色格式' }).selectOption('rgb')
  await expect(area.locator('output')).toHaveText('当前格式：RGB')
  await expect(panel.getByRole('textbox', { name: '颜色值' })).toHaveValue(/rgba\(/)
})

test('[color-picker.browser.form] submits and resets the serialized color', async ({ page }, info) => {
  const area = await demo(page, info, 'form')
  const form = area.locator('form').last()
  await form.getByRole('button', { name: '表单主题色' }).click()
  await page.getByRole('button', { name: '预设颜色 #722ed1' }).last().click()
  if (info.project.name === 'docs') {
    await expect(page.getByRole('dialog').locator('[aria-label="颜色面板"]')).toBeVisible()
    await page.getByRole('button', { name: '预设颜色 #1677ff' }).last().click()
    await expect(page.getByRole('dialog').locator('[aria-label="颜色面板"]')).toBeVisible()
    await page.getByRole('button', { name: '预设颜色 #722ed1' }).last().click()
  }
  if (info.project.name === 'docs') {
    await form.getByRole('button', { name: '提交颜色' }).click()
    await expect(area.locator('output')).toContainText('"theme":"#722ed1"')
    await form.getByRole('button', { name: '重置颜色' }).click()
    await expect(form.getByRole('button', { name: '表单主题色' })).toContainText('#1677ff')
  } else {
    await form.getByRole('button', { name: '提交' }).click()
    await expect(area.getByRole('status').last()).toContainText('"color":"#722ed1"')
  }
})

test('[color-picker.browser.flip] flips above a bottom-edge trigger without position transition', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs')
  await page.setViewportSize({ width: 900, height: 390 })
  const area = await demo(page, info, 'basic')
  const button = area.getByRole('button', { name: '主题颜色' })
  await button.evaluate(element => element.scrollIntoView({ block: 'end' }))
  await button.click()
  const layer = page.getByRole('dialog')
  await expect(layer).toBeVisible()
  await expect.poll(async () => (await layer.boundingBox())!.y).toBeLessThan((await button.boundingBox())!.y)
  expect(await layer.evaluate(element => getComputedStyle(element).transitionProperty)).toBe('opacity')
})

test('[color-picker.browser.pointer-keyboard] drags the plane and adjusts hue with the keyboard', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs')
  const area = await demo(page, info, 'inline')
  const plane = area.getByRole('group', { name: '拖动选择饱和度与亮度，也可使用下方滑块' })
  const box = await plane.boundingBox()
  expect(box?.width).toBeGreaterThan(100)
  expect(box?.height).toBeGreaterThan(100)
  await plane.click({ position: { x: box!.width - 10, y: 10 } })
  await expect(area.locator('output')).not.toHaveText('面板颜色：#eb2f96')
  const hue = area.getByRole('slider', { name: '色相' })
  const before = await hue.inputValue()
  await hue.focus()
  await hue.press('ArrowRight')
  await expect(hue).not.toHaveValue(before)
})

test('[color-picker.browser.invalid] rejects invalid color text without changing the selection', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs')
  const area = await demo(page, info, 'basic')
  await area.getByRole('button', { name: '主题颜色' }).click()
  const panel = page.getByRole('dialog').locator('[aria-label="颜色面板"]')
  const input = panel.getByRole('textbox', { name: '颜色值' })
  await input.fill('not-a-color')
  await input.press('Enter')
  await expect(panel.getByRole('alert')).toContainText('请输入有效')
  await expect(area.locator('output')).toHaveText('当前颜色：#1677ff')
  await input.press('Escape')
  await expect(panel.getByRole('alert')).toHaveCount(0)
  await expect(input).toHaveValue('#1677ff')
})

test('[color-picker.browser.ssr] includes API and example source in static HTML', async ({ request }, info) => {
  test.skip(info.project.name !== 'docs')
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  expect(html).toContain('ColorPickerProps API')
  expect(html).toContain('ColorPickerPreset API')
  expect(html).toContain('color-picker/inline')
  expect(html).toContain('onChangeComplete')
})
