import { test, expect, type Page, type TestInfo } from '@playwright/test'
import { paintedColor } from '../../utils/color-browser'
const path = 'components/data-display/tag/'
async function demo(page: Page, info: TestInfo, name: string) {
  if (!page.url().includes(info.project.name === 'docs' ? path : '/Tag')) await page.goto(info.project.name === 'docs' ? path : 'Tag')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="tag/${name}"]` : `[data-tag-demo="${name}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  return area
}
const box = async (locator: ReturnType<Page['locator']>) => (await locator.boundingBox())!

// 基础几何：22px 高、12px 字号、4px 圆角、7px 内边距、filled 无描边；链接子元素继承标签文字色。
test('[tag.browser.paint] geometry and nested link color', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const first = area.getByText('标签一', { exact: true })
  await expect(first).toHaveCSS('height', '22px'); await expect(first).toHaveCSS('font-size', '12px')
  await expect(first).toHaveCSS('border-top-left-radius', '4px'); await expect(first).toHaveCSS('padding-left', '7px')
  expect(await paintedColor(first, 'border-top-color')).toBe('rgba(0, 0, 0, 0)')
  expect(await first.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)')
  expect(await paintedColor(area.getByRole('link', { name: '链接' }), 'color')).toBe(await paintedColor(first, 'color'))
  const href = area.getByRole('link', { name: 'href 标签' })
  await expect(href).toHaveAttribute('rel', 'noopener noreferrer')
})

// 关闭：键盘 Tab 聚焦关闭按钮并 Enter 关闭；preventDefault 的标签保留；10px 图标真实绘制。
test('[tag.browser.close] keyboard close and prevented close', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const keep = area.getByText('阻止关闭', { exact: true })
  await keep.getByRole('button', { name: '关闭标签' }).click()
  await expect(keep).toBeVisible()
  const closeTwo = area.getByText('标签二', { exact: true }).getByRole('button')
  expect(await closeTwo.locator('span').evaluate(el => getComputedStyle(el).maskImage)).not.toBe('none')
  await expect(closeTwo).toHaveCSS('font-size', '10px')
  await closeTwo.focus(); await page.keyboard.press('Enter')
  await expect(area.getByText('标签二', { exact: true })).toHaveCount(0)
  await area.getByRole('button', { name: '删除标签三' }).press('Space')
  await expect(area.getByText('标签三', { exact: true })).toHaveCount(0)
})

// 预设色板与自定义色在三种变体下真实生成颜色（验证 UnoCSS 静态扫描到字面量类）。
test('[tag.browser.colors] preset and custom colors paint', async ({ page }, info) => {
  const area = await demo(page, info, 'colorful')
  const tag = (variant: string, group: string, text: string) => area.locator(`[data-variant="${variant}"] [data-group="${group}"]`).getByText(text, { exact: true })
  expect(await paintedColor(tag('filled', 'preset', 'magenta'), 'background-color')).toBe('rgb(255, 240, 246)')
  expect(await paintedColor(tag('filled', 'preset', 'magenta'), 'color')).toBe('rgb(196, 29, 127)')
  expect(await paintedColor(tag('outlined', 'preset', 'magenta'), 'border-top-color')).toBe('rgb(255, 173, 210)')
  expect(await paintedColor(tag('solid', 'preset', 'geekblue'), 'background-color')).toBe('rgb(47, 84, 235)')
  expect(await paintedColor(tag('solid', 'preset', 'geekblue'), 'color')).toBe('rgb(255, 255, 255)')
  expect(await paintedColor(tag('filled', 'custom', '#f50'), 'background-color')).toBe('rgb(255, 238, 229)')
  expect(await paintedColor(tag('outlined', 'custom', '#f50'), 'border-top-color')).toBe('rgb(255, 85, 0)')
  expect(await paintedColor(tag('solid', 'custom', '#f50'), 'color')).toBe('rgb(255, 255, 255)')
  await area.screenshot({ path: info.outputPath('colorful.png') })
  await (await demo(page, info, 'status')).screenshot({ path: info.outputPath('status.png') })
  await (await demo(page, info, 'basic')).screenshot({ path: info.outputPath('basic.png') })
  await (await demo(page, info, 'checkable')).screenshot({ path: info.outputPath('checkable.png') })
})

// 状态色：success 文字色、processing 图标旋转、error 实心底色与白字、default 实心为深底。
test('[tag.browser.status] status colors and spinning icon', async ({ page }, info) => {
  const area = await demo(page, info, 'status')
  // 有图标时文字在内容节点里，取其父级即标签根节点
  const tag = (variant: string, text: string) => area.locator(`[data-variant="${variant}"]`).getByText(text, { exact: true }).locator('xpath=..')
  expect(await paintedColor(tag('filled', 'success'), 'color')).toBe('rgb(82, 196, 26)')
  expect(await tag('filled', 'processing').locator('.animate-spin').evaluate(el => getComputedStyle(el).animationName)).not.toBe('none')
  const error = tag('solid', 'error')
  expect(await paintedColor(error, 'background-color')).toMatch(/^rgb\(/)
  expect(await paintedColor(error, 'color')).toMatch(/^rgb\(25[0-5], 25[0-5], 25[0-5]\)$/)
  expect(await tag('solid', 'default').evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)')
  const icon = await box(tag('outlined', 'warning').locator('> span').first()), text = await box(tag('outlined', 'warning').locator('> span').last())
  expect(Math.round(text.x - (icon.x + icon.width))).toBe(7)
})

// 可选标签：点击、Space 切换并更新结果；选中底色为主题色；单选再次点击取消；键盘聚焦有可见轮廓。
test('[tag.browser.checkable] click, Space and focus ring', async ({ page }, info) => {
  const area = await demo(page, info, 'checkable')
  const multiple = area.locator('[aria-label="多选组"]')
  const books = multiple.getByRole('checkbox', { name: '图书' })
  await books.click()
  await expect(books).toHaveAttribute('aria-checked', 'true')
  await expect(area.locator('[data-result]')).toContainText('电影、音乐、图书')
  // 移开指针并等待过渡结束，选中底色为不透明主题色
  await page.mouse.move(0, 0)
  await expect.poll(() => paintedColor(books, 'background-color')).toMatch(/^rgb\(/)
  await books.press('Space'); await expect(books).toHaveAttribute('aria-checked', 'false')
  await books.press('Enter'); await expect(books).toHaveAttribute('aria-checked', 'false')
  const single = area.locator('[aria-label="单选组"]').getByRole('checkbox', { name: '图书' })
  await single.click(); await expect(area.locator('[data-result]')).toContainText('单选：无')
  await single.focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab')
  await expect(single).toBeFocused()
  expect(await single.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid')
})

// 动态增删：添加、双击编辑、关闭；首个标签不可关闭。
test('[tag.browser.control] add, edit and remove tags', async ({ page }, info) => {
  const area = await demo(page, info, 'control')
  const tagOf = (text: string) => area.locator(`span:has(> span:text-is("${text}"))`)
  await expect(tagOf('不可删除')).toHaveCount(1)
  await expect(tagOf('不可删除').getByRole('button')).toHaveCount(0)
  await area.getByRole('button', { name: '新标签' }).click()
  const input = area.getByRole('textbox', { name: '新标签名称' })
  await expect(input).toBeFocused(); await input.fill('新加的'); await input.press('Enter')
  await expect(area.getByText('新加的', { exact: true })).toBeVisible()
  await area.getByText('标签三', { exact: true }).dblclick()
  const edit = area.getByRole('textbox', { name: '编辑标签' })
  await expect(edit).toBeFocused(); await edit.fill('改名了'); await edit.press('Enter')
  await expect(area.getByText('改名了', { exact: true })).toBeVisible()
  await tagOf('标签二').getByRole('button').click()
  await expect(area.getByText('标签二', { exact: true })).toHaveCount(0)
})

// 禁用：无 href、禁用光标与文字色；关闭按钮不可用；可选标签不切换。
test('[tag.browser.disabled] disabled tags are inert', async ({ page }, info) => {
  const area = await demo(page, info, 'disabled')
  const href = area.getByText('href 标签', { exact: true })
  expect(await href.getAttribute('href')).toBeNull(); await expect(href).toHaveAttribute('aria-disabled', 'true')
  await expect(href).toHaveCSS('cursor', 'not-allowed')
  const custom = area.getByText('自定义 #f50', { exact: true })
  expect(await paintedColor(custom, 'color')).toMatch(/^rgba\(\d+, \d+, \d+, 0\.2[45]\)$/)
  await expect(area.getByText('可关闭', { exact: true }).getByRole('button')).toBeDisabled()
  const books = area.getByRole('checkbox', { name: '图书' })
  await books.click({ force: true }); await expect(books).toHaveAttribute('aria-checked', 'true')
  await expect(area.getByRole('status')).toHaveText('禁用标签不会关闭，也不会切换')
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1)
})

// 开发模式：基本示例与图标实际绘制。
test('[tag.browser.dev] dev rendering', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658/${path}`)
  const area = page.locator('[data-demo="tag/icon"]')
  await expect(area.getByText('Twitter', { exact: true }).first().locator('xpath=..')).toHaveCSS('height', '22px')
  expect(await area.locator('.i-mdi-twitter').first().evaluate(el => getComputedStyle(el).maskImage)).not.toBe('none')
})

// 三个公开组件的 API 与示例容器在原始 HTML 中。
test('[tag.browser.ssr] API sections are server-rendered', async ({ request }) => {
  const response = await request.get(path); expect(response.status()).toBe(200)
  const html = await response.text()
  for (const text of ['Tag API', 'CheckableTag API', 'CheckableTagGroup API', 'closeIcon', 'data-demo="tag/semantic"']) expect(html).toContain(text)
})
