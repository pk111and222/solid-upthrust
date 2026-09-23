import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'

const path = 'components/data-entry/tree-select/'
async function demo(page: Page, info: TestInfo, id: string): Promise<Locator> {
  await page.goto(info.project.name === 'docs' ? path : 'TreeSelect')
  return page.locator(info.project.name === 'docs' ? `[data-demo="tree-select/${id}"]` : `[data-tree-select-demo="${id}"]`)
}
const rowBody = (row: Locator) => row.locator(':scope > div').first()

// 单选点击子节点后回填标签、返回键，并关闭与树关联的浮层。
test('[tree-select.browser.single] selects a child and closes', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const box = area.getByRole('combobox')
  await box.click()
  await expect(box).toHaveAttribute('aria-expanded', 'true')
  await expect(box).toHaveAttribute('aria-controls', await page.getByRole('tree').getAttribute('id') as string)
  await rowBody(page.getByRole('treeitem', { name: '西湖' })).click()
  await expect(box).toContainText('西湖')
  await expect(box).toHaveAttribute('aria-expanded', 'false')
  await expect(info.project.name === 'docs' ? area.locator('output').first() : area).toContainText('xh')
  await box.getByRole('button', { name: '清空' }).click()
  await expect(box).toContainText(info.project.name === 'docs' ? '选择地区' : '请选择节点')
  await expect(box).toHaveAttribute('aria-expanded', 'false')
})

// 父节点全勾通过复选框联动，SHOW_PARENT 只上报父键。
test('[tree-select.browser.multiple] parent check reports one tag', async ({ page }, info) => {
  const area = await demo(page, info, 'multiple')
  const box = area.getByRole('combobox')
  await box.click()
  const parent = page.getByRole('treeitem', { name: info.project.name === 'docs' ? '研发团队' : '浙江' })
  await parent.locator(':scope > div > span').nth(1).click()
  await expect(parent).toHaveAttribute('aria-checked', 'true')
  await expect(info.project.name === 'docs' ? area.locator('output').first() : area).toContainText(info.project.name === 'docs' ? 'team' : 'zj')
  await expect(box).toHaveAttribute('aria-expanded', 'true')
})

// Checkbox mode supports both checkbox and row-body toggles without double firing.
test('[tree-select.browser.multiple-row] clicking row body checks and unchecks', async ({ page }, info) => {
  const area = await demo(page, info, 'strict')
  const box = area.getByRole('combobox').first()
  await box.click()
  const row = page.getByRole('treeitem', { name: info.project.name === 'docs' ? '读取' : '杭州' })
  await row.locator(':scope > div > span:last-child').click()
  await expect(row).toHaveAttribute('aria-checked', 'true')
  await row.locator(':scope > div > span:last-child').click()
  await expect(row).toHaveAttribute('aria-checked', 'false')
})

// The appearance demo paints connector lines/custom icons and clear remains inside the selector.
test('[tree-select.browser.appearance] custom icons, lines, and clear', async ({ page }, info) => {
  const area = await demo(page, info, 'appearance')
  const box = area.getByRole('combobox')
  await expect(box).toBeVisible()
  await box.scrollIntoViewIfNeeded()
  await box.click()
  const tree = page.getByRole('tree')
  await expect(tree.locator('.i-mdi-folder-open, .i-mdi-folder, .i-mdi-file-document-outline, .i-mdi-file-outline').first()).toBeVisible()
  await expect(tree.locator('[role="group"] .border-l').first()).toBeVisible()
  const clear = box.getByRole('button', { name: '清空' })
  await expect(clear).toBeVisible()
  await clear.click()
  await expect(box).toHaveAttribute('aria-expanded', 'true')
})

// 搜索输入保持焦点时，方向键与 Enter 提交命中子节点。
test('[tree-select.browser.search] keyboard commits a filtered node', async ({ page }, info) => {
  const area = await demo(page, info, 'search')
  const box = area.getByRole('combobox')
  await box.click()
  const input = area.getByRole('textbox', { name: '搜索树节点' })
  await input.fill('南京')
  await expect(page.getByRole('treeitem', { name: '南京' })).toBeVisible()
  await expect(page.getByRole('treeitem', { name: '杭州' })).toHaveCount(0)
  await input.press('ArrowDown')
  await input.press('Enter')
  await expect(box).toContainText('南京')
  await expect(box).toHaveAttribute('aria-expanded', 'false')
  await expect(info.project.name === 'docs' ? area.locator('output').first() : area).toContainText(info.project.name === 'docs' ? 'nanjing' : 'nj')
})

// 表单内点击浮层节点后立即提交新值，重置恢复初始标签。
test('[tree-select.browser.form] field submit and reset', async ({ page }, info) => {
  const area = await demo(page, info, 'form')
  const box = area.getByRole('combobox')
  await expect(box).toContainText(info.project.name === 'docs' ? '甲' : '西湖')
  await box.click()
  await rowBody(page.getByRole('treeitem', { name: info.project.name === 'docs' ? '乙' : '滨江' })).click()
  await expect(box).toContainText(info.project.name === 'docs' ? '乙' : '滨江')
  await area.getByRole('button', { name: '提交地点' }).click()
  await expect(area).toContainText(info.project.name === 'docs' ? '"place":"b"' : '"place":"bj"')
  await area.getByRole('button', { name: '重置地点' }).click()
  await expect(box).toContainText(info.project.name === 'docs' ? '甲' : '西湖')
})

// 受控浮层、逐行多选和键盘关闭在 docs/example 中都可操作。
test('[tree-select.browser.controlled] open and row multi-selection', async ({ page }, info) => {
  const area = await demo(page, info, 'controlled')
  const box = area.getByRole('combobox').first()
  await box.click()
  await expect(box).toHaveAttribute('aria-expanded', 'true')
  await box.press('Escape')
  await expect(box).toHaveAttribute('aria-expanded', 'false')
  if (info.project.name === 'example') {
    const multi = area.getByRole('combobox').nth(1)
    await multi.click()
    await rowBody(page.getByRole('treeitem', { name: '浙江' })).click()
    await expect(multi).toContainText('浙江')
  }
})

// 下拉层至少与选择框等宽；选择框缩小时，树内容仍可撑宽浮层。
test('[tree-select.browser.width] popup follows selector minimum and preserves content width', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const box = area.getByRole('combobox')
  await box.click()
  const tree = page.getByRole('tree')
  const popup = tree.locator('xpath=../..')
  await expect.poll(async () => Math.abs((await box.boundingBox())!.width - (await popup.boundingBox())!.width)).toBeLessThanOrEqual(1)
  await box.evaluate(element => { (element.parentElement as HTMLElement).style.width = '100px' })
  await expect.poll(async () => (await box.boundingBox())!.width).toBeCloseTo(100, 0)
  await expect.poll(async () => (await popup.boundingBox())!.width).toBeGreaterThan(100)
})

// 虚拟长列表以 End 定位尾节点，并保持目标行实际可见。
test('[tree-select.browser.virtual] End reaches the last virtual row', async ({ page }, info) => {
  const area = await demo(page, info, 'virtual')
  const box = area.getByRole('combobox')
  await box.click()
  const input = area.getByRole('textbox', { name: '搜索树节点' })
  await input.press('End')
  const last = page.getByRole('treeitem', { name: `节点 ${info.project.name === 'docs' ? 999 : 9999}` })
  await expect(last).toBeVisible()
  const list = page.getByRole('tree').locator('..')
  const listRect = (await list.boundingBox())!, rowRect = (await last.boundingBox())!
  expect(rowRect.y).toBeGreaterThanOrEqual(listRect.y)
  expect(rowRect.y + rowRect.height).toBeLessThanOrEqual(listRect.y + listRect.height + 1)
  await input.press('Enter')
  await expect(box).toContainText(`节点 ${info.project.name === 'docs' ? 999 : 9999}`)
})

// 实际 CSS 应呈现尺寸差异、边框、错误状态和禁用状态。
test('[tree-select.browser.variants] paints sizes and disabled state', async ({ page }, info) => {
  const area = await demo(page, info, 'variants')
  const boxes = area.getByRole('combobox')
  const small = boxes.nth(0), middle = boxes.nth(1), large = boxes.nth(2)
  const error = boxes.nth(info.project.name === 'docs' ? 2 : 3)
  const disabled = boxes.nth(info.project.name === 'docs' ? 3 : 4)
  const heights = [(await small.boundingBox())!.height, (await middle.boundingBox())!.height, (await large.boundingBox())!.height]
  expect(heights[0]).toBeLessThan(heights[1]); expect(heights[1]).toBeLessThan(heights[2])
  await expect(small).toHaveCSS('border-top-width', '1px')
  const boxRect = (await small.boundingBox())!, arrowRect = (await small.locator('.i-mdi-chevron-down').boundingBox())!
  expect(arrowRect.x + arrowRect.width).toBeGreaterThan(boxRect.x + boxRect.width - 30)
  await expect(error).toHaveAttribute('aria-invalid', 'true')
  await expect(disabled).toHaveAttribute('aria-disabled', 'true')
  await disabled.click({ force: true })
  await expect(disabled).toHaveAttribute('aria-expanded', 'false')
  await area.screenshot({ path: info.outputPath('variants.png') })
})

// 原始 HTTP 文档需包含公开 API 与各演示的同文件源码。
test('[tree-select.browser.ssr] API and source are prerendered', async ({ request }) => {
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  expect(html).toContain('TreeSelectProps API')
  expect(html).toContain('TreeSelectNode API')
  expect(html).toContain('tree-select/virtual')
  expect(html).toContain('treeCheckStrategy')
})

// 开发模式仍须加载树面板及 UnoCSS 输入边框。
test('[tree-select.browser.dev] development page paints the selector', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658/${path}`)
  const box = page.locator('[data-demo="tree-select/basic"]').getByRole('combobox')
  await expect(box).toHaveCSS('border-top-width', '1px')
  await box.click()
  await expect(page.getByRole('tree')).toBeVisible()
  await expect(box).toHaveAttribute('aria-expanded', 'true')
})
