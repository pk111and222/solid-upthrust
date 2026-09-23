import { expect, test, type Page, type TestInfo } from '@playwright/test'

const path = 'components/data-entry/mentions/'
async function basic(page: Page, info: TestInfo) {
  await page.goto(info.project.name === 'docs' ? path : 'Mentions')
  return page.getByRole('combobox', { name: '提及同事' })
}

// 真实键盘跳过禁用候选，提交后文本与浮层状态同步。
test('[mentions.browser.keyboard] selects an enabled option', async ({ page }, info) => {
  const box = await basic(page, info)
  await box.fill('Hi @')
  await expect(box).toHaveAttribute('aria-expanded', 'true')
  await box.press('ArrowDown')
  await box.press('Enter')
  await expect(box).toHaveValue(info.project.name === 'docs' ? 'Hi @bob ' : 'Hi @zombiej ')
  await expect.poll(() => box.evaluate((el: HTMLTextAreaElement) => el.selectionStart)).toBe((await box.inputValue()).length)
  await expect(box).toHaveAttribute('aria-expanded', 'false')
  await expect(box).toBeFocused()
})

// Escape 不清空文本，后续输入可重新触发；浮层与文本框等宽且靠近其下沿。
test('[mentions.browser.dismiss] closes and reopens with stable placement', async ({ page }, info) => {
  const box = await basic(page, info)
  await box.fill('@a')
  const list = page.getByRole('listbox')
  await expect(list).toBeVisible()
  await expect.poll(async () => {
    const inputRect = (await box.boundingBox())!, listRect = (await list.boundingBox())!
    return Math.abs(inputRect.width - listRect.width)
  }).toBeLessThan(2)
  await box.press('Escape')
  await expect(box).toHaveValue('@a')
  await expect(box).toHaveAttribute('aria-expanded', 'false')
  await box.pressSequentially('l')
  await expect(box).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('option', { name: 'Alice' })).toBeVisible()
})

// 鼠标选择替换光标所在词并保留后文，外部点击可关闭浮层。
test('[mentions.browser.pointer] inserts in the middle and dismisses outside', async ({ page }, info) => {
  const box = await basic(page, info)
  await box.fill('Hi @a later')
  await box.evaluate((el: HTMLTextAreaElement) => { el.setSelectionRange(5, 5); el.dispatchEvent(new Event('select', { bubbles: true })) })
  await expect(box).toHaveAttribute('aria-expanded', 'true')
  await page.getByRole('option').first().click()
  await expect(box).toHaveValue(info.project.name === 'docs' ? 'Hi @alice later' : 'Hi @afc163 later')
  await expect.poll(() => box.evaluate((el: HTMLTextAreaElement) => el.selectionStart))
    .toBe(info.project.name === 'docs' ? 'Hi @alice '.length : 'Hi @afc163 '.length)
  await expect(box).toBeFocused()
  await box.fill('@a')
  await page.mouse.click(1, 1)
  await expect(box).toHaveAttribute('aria-expanded', 'false')
})

// 自定义唤起符提交后，光标应越过完整候选与尾随分隔符。
test('[mentions.browser.prefix-caret] leaves the caret after the inserted mention', async ({ page }, info) => {
  await page.goto(info.project.name === 'docs' ? path : 'Mentions')
  const box = page.getByRole('combobox', { name: '话题提及' })
  await box.fill('Hi #')
  await page.getByRole('option').first().click()
  await expect.poll(() => box.evaluate((el: HTMLTextAreaElement) => el.selectionStart)).toBe((await box.inputValue()).length)
})

// 异步候选返回后应在当前查询原位刷新，选中后插入完整提及。
test('[mentions.browser.remote] refreshes server options in place', async ({ page }) => {
  await page.goto(path)
  const box = page.getByRole('combobox', { name: '异步提及' })
  await box.fill('@ana')
  await expect(page.getByRole('option', { name: 'ana-team' })).toBeVisible()
  await page.getByRole('option', { name: 'ana-team' }).click()
  await expect(box).toHaveValue('@ana-team ')
})

// Form.Item 的字段提交与重置和文本框内容一致，禁用实例不可输入。
test('[mentions.browser.form] submits and resets the field', async ({ page }) => {
  await page.goto(path)
  const area = page.locator('[data-demo="mentions/form"]')
  const box = area.getByRole('combobox').first()
  await box.fill('请 @alice')
  await area.getByRole('button', { name: '提交消息' }).click()
  await expect(area.locator('output')).toContainText('"message":"请 @alice"')
  await area.getByRole('button', { name: '重置消息' }).click()
  await expect(box).toHaveValue('你好')
  await expect(area.getByRole('combobox', { name: '禁用提及' })).toBeDisabled()
})

// 开发模式确认文本框边框与候选浮层实际绘制。
test('[mentions.browser.dev] paints the textarea and dropdown', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658/${path}`)
  const box = page.getByRole('combobox', { name: '提及同事' })
  await expect(box).toHaveCSS('border-top-width', '1px')
  await box.fill('@a')
  await expect(page.getByRole('listbox')).toBeVisible()
})

// 静态 HTTP 正文含 API 和同文件示例源码。
test('[mentions.browser.ssr] prerenders API and source', async ({ request }) => {
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  expect(html).toContain('MentionsProps API')
  expect(html).toContain('MentionOption API')
  expect(html).toContain('mentions/remote')
  expect(html).toContain('filterOption')
})
