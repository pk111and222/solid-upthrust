import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'

const path = 'components/data-entry/segmented/'

async function demo(page: Page, info: TestInfo, id: string) {
  await page.goto(info.project.name === 'docs' ? path : 'Segmented')
  return page.locator(info.project.name === 'docs' ? `[data-demo="segmented/${id}"]` : `[data-segmented-demo="${id}"]`)
}

function group(area: Locator, name: string) {
  return area.getByRole('radiogroup', { name, exact: true })
}

// 基础分段器的真实点击提交值，禁用项保留 aria-disabled 并拒绝点击。
test('[segmented.browser.basic] click and disabled option', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const control = group(area, '视图模式')
  const next = info.project.name === 'docs' ? '卡片' : '周二'
  await control.getByRole('radio', { name: next, exact: true }).click()
  await expect(control.getByRole('radio', { name: next, exact: true })).toHaveAttribute('aria-checked', 'true')
  await expect(area).toContainText(info.project.name === 'docs' ? '当前：card' : '当前值：tue')
  const disabledArea = await demo(page, info, info.project.name === 'docs' ? 'states' : 'disabled')
  await expect(group(disabledArea, info.project.name === 'docs' ? '整组禁用' : '禁用模式')).toHaveAttribute('aria-disabled', 'true')
})

// 键盘焦点跳过禁用项，Enter 提交候选，提交后 aria-checked 只保留一个。
test('[segmented.browser.keyboard] traversal and commit', async ({ page }, info) => {
  const area = await demo(page, info, info.project.name === 'docs' ? 'keyboard' : 'basic')
  const control = group(area, info.project.name === 'docs' ? '键盘示例' : '视图模式')
  await control.focus()
  await control.press('ArrowRight')
  await control.press('Enter')
  const committed = info.project.name === 'docs' ? 'C' : '周二'
  await expect(control.getByRole('radio', { name: committed, exact: true })).toHaveAttribute('aria-checked', 'true')
  await expect(area).toContainText(info.project.name === 'docs' ? '已提交：c' : '当前值：tue')
})

async function expectAligned(control: Locator, target: Locator) {
  const thumb = control.locator('[aria-hidden="true"]')
  await expect(thumb).toHaveCSS('opacity', '1')
  await expect.poll(async () => {
    const t = (await thumb.boundingBox())!, item = (await target.boundingBox())!
    return Math.max(Math.abs(t.x - item.x), Math.abs(t.width - item.width))
  }).toBeLessThanOrEqual(1)
}

// thumb 的实际几何需跟随选中、键盘候选及容器 resize；block 三项实际等宽。
test('[segmented.browser.thumb] measured paint and block layout', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const control = group(area, '视图模式')
  await expectAligned(control, control.locator('[aria-checked="true"]'))
  await control.focus()
  await control.press('ArrowRight')
  await expectAligned(control, control.getByRole('radio').nth(1))
  await control.press('Enter')
  await expectAligned(control, control.locator('[aria-checked="true"]'))
  const block = await demo(page, info, info.project.name === 'docs' ? 'states' : 'block')
  const blockControl = group(block, info.project.name === 'docs' ? '通栏布局' : '布局方式')
  for (const width of [360, 510]) {
    await blockControl.evaluate((element, width) => { element.style.width = `${width}px` }, width)
    await expect.poll(async () => {
      const boxes = await blockControl.getByRole('radio').evaluateAll(items => items.map(item => item.getBoundingClientRect().width))
      return Math.max(...boxes) - Math.min(...boxes)
    }).toBeLessThanOrEqual(1)
    expect((await blockControl.boundingBox())!.width).toBeCloseTo(width, 0)
    await expectAligned(blockControl, blockControl.locator('[aria-checked="true"]'))
  }
})

// docs/example 的 Form.Item 均验证提交和重置。
test('[segmented.browser.form] form context and submit', async ({ page }, info) => {
  const area = await demo(page, info, 'context')
  const control = group(area, '表单模式')
  await control.getByRole('radio', { name: '模式 B', exact: true }).click()
  await area.getByRole('button', { name: '提交分段值' }).click()
  await expect(area.locator('output')).toHaveText('{"mode":"b"}')
  await area.getByRole('button', { name: '重置分段值' }).click()
  await expect(control.getByRole('radio', { name: '模式 A', exact: true })).toHaveAttribute('aria-checked', 'true')
})

// 开发服务器上的真实挂载应有正尺寸、实际 thumb 绘制和零 Segmented 专属运行时错误。
test('[segmented.browser.dev] dev paint and owner', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs', '开发服务器检查只执行一次')
  const messages: string[] = []
  page.on('console', message => messages.push(message.text()))
  page.on('pageerror', error => messages.push(error.message))
  await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE ?? '/'}${path}`)
  const control = page.locator('[data-demo="segmented/basic"]').getByRole('radiogroup', { name: '视图模式' })
  expect((await control.boundingBox())!.width).toBeGreaterThan(0)
  await expect(control.locator('[aria-hidden="true"]')).toHaveCSS('opacity', '1')
  expect(messages.filter(message => message.includes('NO_OWNER_CLEANUP') || message.includes('Segmented'))).toEqual([])
})

// 原始 SSR HTML 必须同时包含 API 表与同文件示例源码，不依赖客户端执行。
test('[segmented.browser.ssr] static API and source', async ({ request }) => {
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  expect(html).toContain('SegmentedProps API')
  expect(html).toContain('segmented/keyboard')
  expect(html).toContain('aria-labelledby')
})

// 三种尺寸、图标和状态必须在 docs 与 example 都有真实绘制与正确初始选择。
test('[segmented.browser.variants] sizes icons and status paint', async ({ page }, info) => {
  const sizes = await demo(page, info, 'sizes')
  const heights: number[] = []
  for (const name of ['小尺寸', '中尺寸', '大尺寸']) {
    const control = group(sizes, name)
    await expect(control.locator('[aria-checked="true"]')).toHaveCount(1)
    heights.push((await control.getByRole('radio').first().boundingBox())!.height)
  }
  expect(heights).toEqual([24, 32, 40])
  const icons = await demo(page, info, 'icons')
  const iconControl = group(icons, info.project.name === 'docs' ? '带图标视图' : '展示方式')
  await expect(iconControl.locator('[aria-checked="true"]')).toHaveCount(1)
  await expect(iconControl.locator('.i-mdi-format-list-bulleted')).not.toHaveCSS('mask-image', 'none')
  const status = await demo(page, info, 'status')
  const error = group(status, '错误状态'), warning = group(status, '警告状态')
  await expect(error).toHaveAttribute('aria-invalid', 'true')
  await expect(warning).not.toHaveAttribute('aria-invalid')
  const errorColor = await error.evaluate(el => getComputedStyle(el).borderTopColor)
  const warningColor = await warning.evaluate(el => getComputedStyle(el).borderTopColor)
  expect(errorColor).not.toBe(warningColor)
  expect(errorColor).not.toBe('rgba(0, 0, 0, 0)')
  expect(warningColor).not.toBe('rgba(0, 0, 0, 0)')
})
