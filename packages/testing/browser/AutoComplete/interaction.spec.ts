import { expect, test, type Page, type TestInfo } from '@playwright/test'
const path = 'components/data-entry/auto-complete/'
async function demo(page: Page, info: TestInfo, id: string) {
  await page.goto(info.project.name === 'docs' ? path : 'AutoComplete')
  return page.locator(info.project.name === 'docs' ? `[data-demo="auto-complete/${id}"]` : `[data-ac-demo="${id}"]`)
}

// 鼠标选中后焦点保持在输入框，不因失焦先关闭而漏掉选值。
test('[autocomplete.browser.pointer] selection retains focus and typing reopens', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const box = area.getByRole('combobox')
  await box.click()
  await expect(box).toHaveAttribute('aria-expanded', 'true')
  // 默认候选层宽度应与输入框一致，而不是使用固定的最小宽度。
  await expect.poll(async () => {
    const input = (await box.boundingBox())!, list = (await page.getByRole('listbox').boundingBox())!
    return Math.abs(list.width - input.width)
  }).toBeLessThan(1)
  await page.getByRole('option', { name: '上海', exact: true }).hover()
  await expect(page.getByRole('option', { name: '上海', exact: true })).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('option', { name: '上海', exact: true }).click()
  await expect(box).toHaveValue('上海'); await expect(box).toBeFocused()
  await expect(box).toHaveAttribute('aria-expanded', 'false')
  await expect(area.locator('output')).toContainText('shanghai')
  await box.fill('bei')
  await expect(box).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('option')).toHaveCount(1)
  await box.press('Enter'); await expect(box).toHaveValue('北京')
  await box.press('Tab'); await expect(box).not.toBeFocused()
})

// 键盘跳过禁用项，Escape 不改变文本，重新打开后可提交。
test('[autocomplete.browser.keyboard] skips disabled and closes with Escape', async ({ page }, info) => {
  const box = (await demo(page, info, 'basic')).getByRole('combobox')
  await box.click(); await box.press('ArrowDown'); await box.press('Enter')
  await expect(box).toHaveValue('上海')
  await box.fill(''); await box.press('Escape')
  await expect(box).toHaveAttribute('aria-expanded', 'false')
  await box.press('ArrowDown'); await box.press('Enter')
  await expect(box).toHaveValue('北京')
})

// 异步结果返回后无需再次输入即可选择，新查询不残留旧候选。
test('[autocomplete.browser.remote] async results refresh in place', async ({ page }, info) => {
  const box = (await demo(page, info, 'remote')).getByRole('combobox')
  await box.fill('first'); await box.fill('second')
  await expect(page.getByRole('option', { name: 'second@example.com', exact: true })).toBeVisible()
  await expect(page.getByRole('option', { name: 'first@example.com', exact: true })).toHaveCount(0)
  await page.getByRole('option', { name: 'second@example.com', exact: true }).click()
  await expect(box).toHaveValue('second@example.com')
})

// 高亮候选超出视口后应滚入下拉层内，页面不跳动。
test('[autocomplete.browser.scroll] active option remains visible', async ({ page }, info) => {
  const area = await demo(page, info, 'keyboard')
  const box = area.getByRole('combobox')
  await area.getByRole('button', { name: '聚焦建议' }).click()
  await expect(box).toBeFocused()
  await expect(box).toHaveAttribute('aria-expanded', 'true')
  for (let i = 0; i < 18; i++) {
    await box.press('ArrowDown')
    await expect(page.getByRole('option', { selected: true })).toHaveText(`建议 ${String(i + 2).padStart(2, '0')}`)
  }
  const id = await box.getAttribute('aria-activedescendant')
  const row = page.locator(`[id="${id}"]`)
  await expect(row).toHaveText('建议 19')
  const listRect = (await page.getByRole('listbox').boundingBox())!
  const rowRect = (await row.boundingBox())!
  expect(rowRect.y).toBeGreaterThanOrEqual(listRect.y)
  expect(rowRect.y + rowRect.height).toBeLessThanOrEqual(listRect.y + listRect.height + 1)
  await box.press('Enter'); await expect(box).toHaveValue('建议 19')
  await expect(box).toHaveAttribute('aria-expanded', 'false')
})

// 原生表单文字提交与重置必须同输入框显示一致。
test('[autocomplete.browser.form] form submit and reset', async ({ page }, info) => {
  const area = await demo(page, info, 'context')
  const box = area.getByRole('combobox')
  await expect(box).toHaveValue('北京'); await box.focus(); await box.pressSequentially('x')
  await expect(box).toBeFocused(); await expect(box).toHaveAttribute('aria-expanded', 'true')
  await box.fill('上海')
  await expect(box).toBeFocused()
  await area.getByRole('button', { name: '提交目的地' }).click()
  await expect(area.locator('output')).toContainText('{"city":"上海"}')
  await area.getByRole('button', { name: '重置目的地' }).click()
  await expect(box).toHaveValue('北京')
})

// 生产 CSS 应绘制不同高度、校验边框以及禁用状态。
test('[autocomplete.browser.variants] production sizes and paint', async ({ page }, info) => {
  const area = await demo(page, info, 'variants')
  const heights = []
  for (const name of ['小尺寸', '中尺寸', '大尺寸']) {
    const box = area.getByRole('combobox', { name })
    heights.push((await box.boundingBox())!.height)
    await expect(box).toHaveCSS('border-top-width', '1px')
  }
  expect(heights[0]).toBeLessThan(heights[1]); expect(heights[1]).toBeLessThan(heights[2])
  await expect(area.getByRole('combobox', { name: '禁用状态' })).toBeDisabled()
  expect(await area.getByRole('combobox', { name: '错误状态' }).evaluate(el => getComputedStyle(el).borderColor))
    .not.toBe(await area.getByRole('combobox', { name: '中尺寸' }).evaluate(el => getComputedStyle(el).borderColor))
})

// 开发模式同样应显示有边框的输入与定位在附近的候选层。
test('[autocomplete.browser.dev] development paint and placement', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658/${path}`)
  const box = page.locator('[data-demo="auto-complete/basic"]').getByRole('combobox')
  await expect(box).toHaveCSS('border-top-width', '1px')
  await box.click()
  await expect(page.getByRole('listbox')).toBeVisible()
  await expect.poll(async () => {
    const input = (await box.boundingBox())!, list = (await page.getByRole('listbox').boundingBox())!
    return Math.min(Math.abs(list.y - input.y - input.height - 4), Math.abs(input.y - list.y - list.height - 4))
  }).toBeLessThan(2)
})

// 初始 HTTP 文档含 API 和同文件源码，证明正文不依赖 CSR。
test('[autocomplete.browser.ssr] API and demo source are prerendered', async ({ request }) => {
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  expect(html).toContain('AutoCompleteProps API'); expect(html).toContain('AutoCompleteOption API')
  expect(html).toContain('auto-complete/remote'); expect(html).toContain('filterOption')
})
