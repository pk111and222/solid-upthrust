import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'

const path = 'components/data-entry/cascader/'

async function demo(page: Page, info: TestInfo, id: string): Promise<Locator> {
  await page.goto(info.project.name === 'docs' ? path : 'Cascader')
  return info.project.name === 'docs' ? page.locator(`[data-demo="cascader/${id}"]`) : page.getByRole('combobox').nth(id === 'basic' ? 0 : id === 'search' ? 2 : 4)
}

// 单选按列展开并选择叶节点后关闭浮层，受控示例同步显示完整路径。
test('[cascader.browser.single] selects a leaf path and closes', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const box = info.project.name === 'docs' ? area.getByRole('combobox') : area
  await box.click()
  await expect(box).toHaveAttribute('aria-expanded', 'true')
  await page.getByRole('option', { name: '浙江' }).click()
  await page.getByRole('option', { name: '杭州' }).click()
  await page.getByRole('option', { name: '西湖' }).click()
  await expect(box).toHaveAttribute('aria-expanded', 'false')
  await expect(info.project.name === 'docs' ? area.locator('output') : page.locator('body')).toContainText(info.project.name === 'docs' ? 'xh' : '西湖区')
})

// 搜索只保留匹配的完整路径，并支持清空已选路径。
test('[cascader.browser.search] filters a path', async ({ page }, info) => {
  const area = await demo(page, info, 'search')
  const box = info.project.name === 'docs' ? area.getByRole('combobox') : area
  await box.click()
  const input = page.getByRole('listbox').locator('input').last()
  await input.fill('杭州')
  await expect(page.getByRole('option')).toHaveCount(info.project.name === 'docs' ? 1 : 4)
  await expect(page.getByRole('option').first()).toContainText('杭州')
})

// 禁用实例保持关闭且不允许通过鼠标打开。
test('[cascader.browser.disabled] disabled selector does not open', async ({ page }, info) => {
  const area = await demo(page, info, 'variants')
  const box = info.project.name === 'docs'
    ? area.getByRole('combobox').nth(3)
    : page.locator('[data-cascader-demo="disabled"] [role="combobox"]')
  await expect(box).toHaveAttribute('aria-disabled', 'true')
  await box.click({ force: true })
  await expect(box).toHaveAttribute('aria-expanded', 'false')
})

// 父子联动选中后，白色勾号必须有实际绘制尺寸，不能只显示纯蓝方块。
test('[cascader.browser.checkmark] checked box paints its check icon', async ({ page }, info) => {
  await page.goto(info.project.name === 'docs' ? path : 'Cascader')
  const box = info.project.name === 'docs'
    ? page.locator('[data-demo="cascader/checkable"]').getByRole('combobox')
    : page.getByRole('combobox').nth(3)
  await box.click()
  const parent = page.getByRole('option', { name: info.project.name === 'docs' ? '华东' : '浙江' })
  await parent.locator(':scope > span').first().click()
  const check = parent.locator('.i-mdi-check')
  await expect(check).toBeVisible()
  expect(await check.evaluate(el => el.getBoundingClientRect().width)).toBeGreaterThanOrEqual(8)
})
