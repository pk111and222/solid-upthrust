import { test, expect, type Page, type TestInfo } from '@playwright/test'
const path = 'components/general/typography/'
async function demo(page: Page, info: TestInfo, name: string) {
  await page.goto(info.project.name === 'docs' ? path : 'Typography')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="typography/${name}"]` : `[data-typography-demo="${name}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  return area
}
// 真实字号、颜色和语义装饰必须有 CSS，避免字号被 merge 吞掉。
test('[typography.browser.paint] heading sizes and text decoration', async ({ page }, info) => {
  const area = await demo(page, info, 'title')
  for (const [level, size] of [[1, 38], [2, 30], [3, 24], [4, 20], [5, 16]]) await expect(area.getByRole('heading', { name: `h${level}. 产品设计`, exact: true })).toHaveCSS('font-size', `${size}px`)
  const text = page.locator(info.project.name === 'docs' ? '[data-demo="typography/text"]' : '[data-typography-demo="text"]')
  await expect(text.getByText('默认文本', { exact: true })).toHaveCSS('font-size', '14px')
  await expect(text.locator('del')).toHaveCSS('text-decoration-line', 'line-through')
  await expect(text.locator('kbd')).toHaveCSS('border-top-width', '1px')
  expect(await text.getByText('操作失败', { exact: true }).evaluate(el => getComputedStyle(el).color)).not.toBe(await text.getByText('默认文本', { exact: true }).evaluate(el => getComputedStyle(el).color))
})
// 单行和两行真实裁剪，动作按钮仍然可见可点击，编辑框不被裁剪。
test('[typography.browser.ellipsis] clips text and keeps actions accessible', async ({ page }, info) => {
  const area = await demo(page, info, 'ellipsis')
  const one = area.locator('.single'), multi = area.locator('.multi')
  await expect(one).toHaveCSS('text-overflow', 'ellipsis')
  expect(await one.evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true)
  const metrics = await multi.evaluate(el => ({ h: el.getBoundingClientRect().height, lh: parseFloat(getComputedStyle(el).lineHeight), sh: el.scrollHeight }))
  expect(metrics.h).toBeCloseTo(metrics.lh * 2, 0); expect(metrics.sh).toBeGreaterThan(metrics.h)
  for (const name of ['inline-actions', 'link-actions']) {
    const root = area.locator(`.${name}`).first()
    await expect(root).toHaveCSS('width', '180px')
    const box = await root.boundingBox(), button = await root.getByRole('button').boundingBox()
    expect(button!.x + button!.width).toBeLessThanOrEqual(box!.x + box!.width + 1)
    expect(await root.evaluate(el => el.scrollWidth)).toBeLessThanOrEqual(180)
  }
  const actions = area.locator('.actions')
  await actions.getByRole('button', { name: '编辑', exact: true }).click()
  await expect(actions.getByRole('textbox', { name: '编辑文本' })).toBeFocused()
  await actions.getByRole('textbox').fill('修改后的完整文本')
  await actions.getByRole('textbox').press('Enter')
  await expect(actions).toContainText('修改后的完整文本')
  await expect(actions.getByRole('button', { name: '编辑', exact: true })).toBeFocused()
  await area.screenshot({ path: info.outputPath('ellipsis.png') })
})
// 键盘保存、取消和失焦处理，恢复正确焦点。
test('[typography.browser.edit] keyboard commits cancels and blur saves', async ({ page }, info) => {
  const area = await demo(page, info, 'editable')
  const edit = area.getByRole('button', { name: '编辑', exact: true }).first()
  await edit.click(); const field = area.getByRole('textbox')
  await expect(field).toBeFocused(); await field.fill('新简介'); await field.press('Enter')
  await expect(area).toContainText('新简介'); await expect(edit).toBeFocused()
  await edit.click(); await field.fill('不保存'); await field.press('Escape')
  await expect(area).not.toContainText('不保存'); await expect(edit).toBeFocused()
  await edit.click(); await field.fill('失焦保存'); await area.getByRole('status').click()
  await expect(area).toContainText('失焦保存'); await expect(field).toHaveCount(0)
})
// controlled editing 由父层关闭，避免仅改内部 signal 的假受控。
test('[typography.browser.controlled] external editing commits', async ({ page }, info) => {
  const area = await demo(page, info, 'controlled')
  await area.getByRole('button', { name: '开始编辑', exact: true }).click()
  await area.getByRole('textbox').fill('父层已更新'); await area.getByRole('textbox').press('Enter')
  await expect(area.getByRole('textbox')).toHaveCount(0); await expect(area).toContainText('父层已更新')
})
// 使用真实浏览器剪贴板验证自定义内容和成功反馈。
test('[typography.browser.copy] writes clipboard and reports text', async ({ page, context }, info) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const area = await demo(page, info, 'copyable')
  await area.getByRole('button', { name: '复制', exact: true }).nth(1).click()
  await expect(area).toContainText('已复制：项目编号 UT-2026')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('项目编号 UT-2026')
})
// 禁用链接不能聚焦或跳转，复制按钮不嵌套在链接内。
test('[typography.browser.link] disabled link and separate actions', async ({ page }, info) => {
  const area = await demo(page, info, 'link'), disabled = area.getByRole('link', { name: '禁用链接' })
  await expect(disabled).not.toHaveAttribute('href'); await expect(disabled).toHaveAttribute('tabindex', '-1')
  await expect(area.locator('a button')).toHaveCount(0)
})
// 开发模式使用相同 UnoCSS 源码，检查字号和单行省略绘制。
test('[typography.browser.dev] dev CSS and mounting', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658/${path}`)
  await expect(page.locator('[data-demo="typography/title"] h1')).toHaveCSS('font-size', '38px')
  await expect(page.locator('[data-demo="typography/ellipsis"] .single')).toHaveCSS('text-overflow', 'ellipsis')
})
// 原始 HTML 包含各子组件 API 和示例源码，无 JS 也能读到。
test('[typography.browser.ssr] API and source are server-rendered', async ({ request }) => {
  const response = await request.get(path); expect(response.status()).toBe(200)
  const html = await response.text()
  for (const text of ['Typography.Text API', 'Typography.Title API', 'Typography.Paragraph API', 'Typography.Link API', 'maxLength', 'onError', 'data-demo="typography/copyable"']) expect(html).toContain(text)
})
