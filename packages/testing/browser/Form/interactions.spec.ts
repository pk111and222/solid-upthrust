import { expect, test, type Page, type TestInfo } from '@playwright/test'

const docsPath = 'components/data-entry/form/'

async function openForm(page: Page, info: TestInfo) {
  await page.goto(info.project.name === 'docs' ? docsPath : 'Form')
}

async function demo(page: Page, info: TestInfo, id: string) {
  await openForm(page, info)
  return info.project.name === 'docs'
    ? page.locator(`[data-demo="form/${id}"]`)
    : page.locator(`[data-form-demo="${id}"]`)
}

test('[form.browser.basic] submits and resets a required field', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const form = area.locator('form')
  const username = form.getByRole('textbox', { name: '用户名' })
  await expect(username).toBeVisible()
  await form.getByRole('button', { name: '提交', exact: true }).click()
  await expect(form).toContainText('请输入用户名')
  await username.fill('浏览器用户')
  if (info.project.name === 'example') {
    await form.getByRole('textbox', { name: '昵称' }).fill('浏览器昵称')
    await form.getByRole('textbox', { name: '邮箱' }).fill('browser@example.com')
  }
  await form.getByRole('button', { name: '提交', exact: true }).click()
  if (info.project.name === 'docs') {
    await expect(area.locator('output').first()).toContainText('浏览器用户')
  } else {
    await expect(area.locator('[data-form-result="basic"]')).toContainText('浏览器用户')
  }
  await username.fill('临时值')
  await form.getByRole('button', { name: '重置', exact: true }).click()
  await expect(username).toHaveValue('')
})

test('[form.browser.validation] reports synchronous and asynchronous validation errors', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs')
  const area = await demo(page, info, 'validation')
  const form = area.locator('form')
  await form.getByRole('button', { name: '校验并提交', exact: true }).click()
  await expect(area).toContainText('email')
  await form.getByRole('textbox', { name: '邮箱' }).fill('not-an-email')
  await form.getByRole('textbox', { name: '邀请码' }).fill('WRONG')
  await form.getByRole('button', { name: '校验并提交', exact: true }).click()
  await expect(area).toContainText('邮箱格式不正确')
  await expect(area).toContainText('邀请码无效')
})

test('[form.browser.list] adds and removes rows while retaining list values', async ({ page }, info) => {
  const area = await demo(page, info, 'list')
  const form = area.locator('form')
  const inputs = form.getByRole('textbox')
  await expect(inputs).toHaveCount(1)
  await form.getByRole('button', { name: info.project.name === 'docs' ? '新增一行' : '+ 添加一行', exact: true }).click()
  await expect(inputs).toHaveCount(2)
  await inputs.nth(1).fill('浏览器新增')
  await form.getByRole('button', { name: '提交列表', exact: true }).click()
  if (info.project.name === 'docs') {
    await expect(area.locator('output').first()).toContainText('浏览器新增')
    await form.getByRole('button', { name: '删除末行', exact: true }).click()
  } else {
    await expect(area.locator('[data-form-result="list"]')).toContainText('浏览器新增')
    await form.getByRole('button', { name: '删除', exact: true }).last().click()
  }
  await expect(inputs).toHaveCount(1)
})

test('[form.browser.custom] custom composed control updates the form store', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs')
  const area = await demo(page, info, 'custom')
  const form = area.locator('form')
  await area.getByRole('button', { name: '填入 CUSTOM', exact: true }).click()
  await expect(form.getByRole('textbox').first()).toHaveValue('CUSTOM')
  await form.getByRole('button', { name: '提交自定义值', exact: true }).click()
  await expect(area.locator('output').first()).toContainText('CUSTOM')
})

test('[form.browser.nested] keeps nested NamePath and inner form submission independent', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs')
  const area = await demo(page, info, 'nested')
  const forms = area.locator('form')
  await expect(forms).toHaveCount(1)
  await area.getByRole('button', { name: '提交内层', exact: true }).click()
  await expect(area.locator('output').first()).toContainText('内层独立 store')
  await forms.nth(0).getByRole('textbox', { name: '姓名' }).fill('嵌套用户')
  await forms.nth(0).getByRole('textbox', { name: '邮箱' }).fill('nested@example.com')
  await forms.nth(0).getByRole('button', { name: '提交外层', exact: true }).click()
  await expect(area.locator('output').first()).toContainText('嵌套用户')
  await expect(area.locator('output').first()).toContainText('nested@example.com')
})

test('[form.browser.ssr] exposes Form API and example source in static HTML', async ({ request }, info) => {
  test.skip(info.project.name !== 'docs')
  const response = await request.get(docsPath)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  expect(html).toContain('FormProps API')
  expect(html).toContain('FormItemProps API')
  expect(html).toContain('动态增减表单项')
  expect(html).toContain('validateDebounce')
  expect(html).toContain('&lt;Form')
})

test('[form.browser.layout] renders label association and error styling', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const form = area.locator('form')
  const label = form.locator('label[for]').filter({ hasText: '用户名' }).first()
  const input = form.getByRole('textbox', { name: '用户名' })
  expect(await label.getAttribute('for')).toBe(await input.getAttribute('id'))
  await form.getByRole('button', { name: '提交', exact: true }).click()
  await expect(input).toHaveAttribute('aria-invalid', 'true')
  await expect(input.locator('xpath=..')).toHaveClass(/border-error/)
})
