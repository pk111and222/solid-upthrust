import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'

const path = 'components/data-entry/transfer/'
async function demo(page: Page, info: TestInfo, id: string): Promise<Locator> {
  await page.goto(info.project.name === 'docs' ? path : 'Transfer')
  return page.locator(info.project.name === 'docs' ? `[data-demo="transfer/${id}"]` : `[data-transfer-demo="${id}"]`)
}

// 真实鼠标交互应完成勾选、移入、移回，并将目标键显示在受控输出中。
test('[transfer.browser.move] moves a selected row in both directions', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const item = info.project.name === 'docs' ? '林一' : '成员 1'
  const right = area.getByRole('region', { name: '项目成员' })
  await area.getByRole('checkbox', { name: item, exact: true }).check()
  await area.getByRole('button', { name: '移入右侧' }).click()
  await expect(right).toContainText(item)
  await expect(area.locator('output, p').last()).toContainText('0')
  await area.getByRole('checkbox', { name: item, exact: true }).check()
  await area.getByRole('button', { name: '移回左侧' }).click()
  await expect(right).not.toContainText(item)
})

// 左侧搜索只过滤当前列表，列表头全选保持隐藏选择并排除禁用行。
test('[transfer.browser.search] filters and bulk-selects enabled matches', async ({ page }, info) => {
  const area = await demo(page, info, info.project.name === 'docs' ? 'search' : 'basic')
  const left = area.getByRole('region', { name: info.project.name === 'docs' ? '待选项' : '可分配成员' })
  const search = area.getByRole('searchbox', { name: info.project.name === 'docs' ? '搜索待选项' : '搜索可分配成员' })
  await search.fill(info.project.name === 'docs' ? '设计团队' : '成员 1')
  await expect(left).toContainText(info.project.name === 'docs' ? '甲' : '成员 1')
  await expect(left).not.toContainText(info.project.name === 'docs' ? '乙' : '成员 2')
  await left.getByRole('checkbox', { name: info.project.name === 'docs' ? '全选待选项' : '全选可分配成员' }).check()
  await expect(left.getByRole('checkbox', { name: info.project.name === 'docs' ? '甲' : '成员 1', exact: true })).toBeChecked()
  if (info.project.name === 'docs') {
    await expect(left.getByRole('checkbox', { name: '丙' })).toBeDisabled()
    await expect(left.getByRole('checkbox', { name: '丙' })).not.toBeChecked()
  }
})

// 单向模式只显示向右按钮，右侧逐项移除后目标键与面板同步。
test('[transfer.browser.one-way] removes a target row without reverse bulk action', async ({ page }, info) => {
  const area = await demo(page, info, 'one-way')
  await expect(area.getByRole('button', { name: '移回左侧' })).toHaveCount(0)
  const item = info.project.name === 'docs' ? '日志权限' : '成员 1'
  await area.getByRole('button', { name: `移除 ${item}` }).click()
  await expect(area.getByRole('button', { name: `移除 ${item}` })).toHaveCount(0)
  await expect(area.getByRole('region', { name: '待选项' })).toContainText(item)
})

// 数据源变化后新行可见，原目标键保持在右侧；列表尺寸由 listStyle 控制。
test('[transfer.browser.dynamic] updates data and preserves numeric target key', async ({ page }, info) => {
  const area = await demo(page, info, 'dynamic')
  const right = area.getByRole('region', { name: '已选项' })
  await expect(right).toContainText(info.project.name === 'docs' ? '甲' : '成员 1')
  await area.getByRole('button', { name: info.project.name === 'docs' ? '加入数据' : '切换候选数据' }).click()
  await expect(area.getByRole('region', { name: '待选项' })).toContainText(info.project.name === 'docs' ? '新成员' : '成员 6')
  await expect(right).toContainText(info.project.name === 'docs' ? '甲' : '成员 1')
  const rect = await right.boundingBox()
  expect(rect?.height).toBeGreaterThan(140)
})

// 窄屏保持两个面板的可用宽度，通过横向滚动访问右侧；原生复选框可用空格操作。
test('[transfer.browser.mobile-keyboard] scrolls panels and toggles by Space', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const area = await demo(page, info, 'basic')
  const group = area.getByRole('group', { name: '穿梭框' })
  const item = area.getByRole('checkbox', { name: info.project.name === 'docs' ? '林一' : '成员 1', exact: true })
  await item.focus()
  await page.keyboard.press('Space')
  await expect(item).toBeChecked()
  const sizes = await group.evaluate(el => ({ viewport: el.clientWidth, content: el.scrollWidth }))
  expect(sizes.viewport).toBeLessThan(390)
  expect(sizes.content).toBeGreaterThan(sizes.viewport)
  await group.evaluate(el => { el.scrollLeft = el.scrollWidth })
  await expect(area.getByRole('region', { name: '项目成员' })).toBeInViewport()
})

// Form.Item 的字段值应在移入和重置后同步，提交包含实际目标键。
test('[transfer.browser.form] submits and resets transferred keys', async ({ page }, info) => {
  const area = await demo(page, info, 'form')
  const item = info.project.name === 'docs' ? '乙' : '成员 1'
  const initial = info.project.name === 'docs' ? '甲' : ''
  const right = area.getByRole('region', { name: '已选项' })
  if (initial) await expect(right).toContainText(initial)
  await area.getByRole('checkbox', { name: item, exact: true }).check()
  await area.getByRole('button', { name: '移入右侧' }).click()
  await expect(right).toContainText(item)
  await area.getByRole('button', { name: info.project.name === 'docs' ? '提交成员' : '提交' }).click()
  await expect(area).toContainText(info.project.name === 'docs' ? '"members":["a","b"]' : '"members":[0]')
  if (info.project.name === 'docs') {
    await area.getByRole('button', { name: '重置成员' }).click()
    await expect(right).not.toContainText('乙')
    await expect(right).toContainText('甲')
  }
})

// 空态与禁用状态在真实 CSS 中应保持边框、面板高度和不可交互语义。
test('[transfer.browser.variants] paints empty and disabled panels', async ({ page }, info) => {
  const area = await demo(page, info, 'variants')
  const group = area.getByRole('group', { name: '穿梭框' }).first()
  await expect(group).toContainText(info.project.name === 'docs' ? '暂无可分配成员' : '暂无可分配资源')
  await expect(group.getByRole('checkbox')).toHaveCount(0)
  const panel = group.getByRole('region').first()
  expect(await panel.evaluate(el => getComputedStyle(el).borderTopStyle)).toBe('solid')
  expect((await panel.boundingBox())!.height).toBeGreaterThan(120)
  if (info.project.name === 'docs') {
    const disabled = area.getByRole('group', { name: '穿梭框' }).nth(1)
    await expect(disabled).toHaveAttribute('aria-disabled', 'true')
    await expect(disabled.getByRole('checkbox', { name: '甲' })).toBeDisabled()
  }
})

// 文档深链接的静态 HTML 应包含 API 正文和独立示例挂载点。
test('[transfer.browser.ssr] static docs route includes prose and demo ids', async ({ page }) => {
  const response = await page.request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  expect(html).toContain('TransferProps API')
  expect(html).toContain('data-demo="transfer/basic"')
  expect(html).toContain('data-demo="transfer/form"')
})

// 开发模式应挂载实际控件并生成可见面板样式。
test('[transfer.browser.dev] development page paints panels', async ({ page }) => {
  const transferWarnings: string[] = []
  page.on('console', message => {
    if (message.text().includes('STRICT_READ_UNTRACKED') && message.text().includes('<Transfer>')) transferWarnings.push(message.text())
  })
  await page.goto('http://127.0.0.1:5658/components/data-entry/transfer/')
  const area = page.locator('[data-demo="transfer/basic"]')
  await expect(area.getByRole('group', { name: '穿梭框' })).toBeVisible()
  await expect(page.locator('[data-demo="transfer/variants"]').getByRole('group', { name: '穿梭框' }).last()).toBeVisible()
  const left = area.getByRole('region', { name: '候选成员' })
  expect((await left.boundingBox())!.width).toBeGreaterThan(180)
  expect(await left.evaluate(el => getComputedStyle(el).borderTopWidth)).not.toBe('0px')
  const rightRect = (await area.getByRole('region', { name: '项目成员' }).boundingBox())!
  const areaRect = (await area.boundingBox())!
  expect(rightRect.x + rightRect.width).toBeLessThanOrEqual(areaRect.x + areaRect.width)
  expect(transferWarnings).toEqual([])
})
