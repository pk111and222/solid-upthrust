import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'

const path = 'components/data-entry/rate/'

async function demo(page: Page, info: TestInfo, id: string) {
  await page.goto(info.project.name === 'docs' ? path : 'Rate')
  return page.locator(info.project.name === 'docs' ? `[data-demo="rate/${id}"]` : `[data-rate-demo="${id}"]`)
}

function group(area: Locator, name: string) {
  return area.getByRole('slider', { name, exact: true })
}

// 基础评分的真实点击和方向键都更新受控父层，slider 精确表达当前评分。
test('[rate.browser.basic] click and keyboard', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const rating = group(area, '服务评分')
  await expect(rating.locator('li').nth(0)).toBeVisible()
  await rating.locator('li').nth(4).click()
  await expect(area.locator('output')).toHaveText('评分：5 星')
  await rating.focus()
  await rating.press('ArrowLeft')
  await expect(area.locator('output')).toHaveText('评分：4 星')
  await rating.locator('li').nth(3).hover()
  await rating.press('0')
  await expect(rating).toHaveAttribute('aria-valuenow', '0')
  await expect(rating.locator('li').nth(3).locator(':scope > span').nth(1)).toHaveCSS('clip-path', 'inset(0px 100% 0px 0px)')
})

// 半星由字符左右几何决定，移动只预览，点击左半侧才提交半星。
test('[rate.browser.half] preview and half commit', async ({ page }, info) => {
  const area = await demo(page, info, 'half')
  const rating = group(area, '半星评分')
  const third = rating.locator('li').nth(2)
  const box = (await third.boundingBox())!
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2)
  await expect(area.locator('output')).toHaveText('提交：2.5；预览：2.5')
  await page.mouse.click(box.x + box.width * 0.2, box.y + box.height / 2)
  await expect(area.locator('output')).toHaveText('提交：2.5；预览：2.5')
  await page.mouse.move(box.x - 8, box.y - 8)
  await expect(area.locator('output')).toHaveText('提交：2.5；预览：2.5')
})

// allowClear 重复点击清零，禁用评分不可聚焦，自定义 count 真实生成十个字符。
test('[rate.browser.states] clear disabled and count', async ({ page }, info) => {
  const area = await demo(page, info, 'states')
  const clearable = group(area, '可清空评分')
  await clearable.locator('li').nth(3).click()
  await expect(clearable).toHaveAttribute('aria-valuenow', '0')
  const disabled = group(area, '禁用评分')
  await expect(disabled).toHaveAttribute('aria-disabled', 'true')
  await expect(disabled).toHaveAttribute('tabindex', '-1')
  await expect(group(area, '十级评分').locator('li')).toHaveCount(10)
})

// Form 真实提交接收到数字评分，ConfigProvider 的禁用可被 Form disabled=false 的字段覆盖。
test('[rate.browser.form] context and submit', async ({ page }, info) => {
  const area = await demo(page, info, 'context')
  await expect(group(area, '全局禁用')).toHaveAttribute('aria-disabled', 'true')
  const field = group(area, '表单评分')
  await expect(field).toHaveAttribute('aria-disabled', 'false')
  const third = field.locator('li').nth(2)
  await third.click({ position: { x: 5, y: 10 } })
  await expect(field).toHaveAttribute('aria-valuenow', '2.5')
  await area.getByRole('button', { name: '提交评分' }).click()
  await expect(area.locator('output')).toHaveText('{"rating":2.5}')
  await area.getByRole('button', { name: '重置评分' }).click()
  await expect(field).toHaveAttribute('aria-valuenow', '2')
})

// 生产开发 CSS 有真实星形绘制，挂载期间不出现 Rate 专属运行时错误。
test('[rate.browser.dev] paint and owner', async ({ page }, info) => {
  const messages: string[] = []
  page.on('console', message => messages.push(message.text()))
  page.on('pageerror', error => messages.push(error.message))
  await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE ?? '/'}${path}`)
  const rating = page.locator('[data-demo="rate/basic"]').getByRole('slider', { name: '服务评分' })
  expect((await rating.boundingBox())!.width).toBeGreaterThan(0)
  await expect(rating.locator('.i-mdi-star').first()).not.toHaveCSS('mask-image', 'none')
  expect(messages.filter(message => message.includes('NO_OWNER_CLEANUP') || message.includes('STRICT_READ_UNTRACKED') && message.includes('Rate'))).toEqual([])
})

// 原始 SSR HTML 同时包含 API 表和同文件示例源码，不依赖客户端执行。
test('[rate.browser.ssr] static API and source', async ({ request }) => {
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  expect(html).toContain('RateProps API')
  expect(html).toContain('rate/half')
  expect(html).toContain('allowHalf')
})
