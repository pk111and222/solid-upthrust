import { test, expect, type Page, type TestInfo } from '@playwright/test'
const path = 'components/data-display/avatar/'
async function demo(page: Page, info: TestInfo, name: string) {
  await page.goto(info.project.name === 'docs' ? path : 'Avatar')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="avatar/${name}"]` : `[data-avatar-demo="${name}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  return area
}
// 命名/自定义尺寸与两种形状在真实浏览器绘制正确。
test('[avatar.browser.paint] dimensions shapes and colors', async ({ page }, info) => {
  const area = await demo(page, info, 'basic'), avatars = area.locator('span[style*="width:"]')
  await expect(avatars).toHaveCount(8)
  for (const [index, size] of [64, 40, 28, 48, 64, 40, 28, 48].entries()) {
    const box = await avatars.nth(index).boundingBox(); expect(box?.width).toBe(size); expect(box?.height).toBe(size)
  }
  expect(await avatars.nth(0).evaluate(el => parseFloat(getComputedStyle(el).borderRadius))).toBeGreaterThan(20)
  await expect(avatars.nth(4)).toHaveCSS('border-radius', '8px')
})
// 图片正常加载、图标有 mask 绘制，错误资源能够回退再恢复。
test('[avatar.browser.image] loaded image and error recovery', async ({ page }, info) => {
  const types = await demo(page, info, 'types')
  await expect(types.getByRole('img', { name: '用户头像' })).toBeVisible()
  await expect.poll(() => types.getByRole('img', { name: '用户头像' }).evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  expect(await types.locator('.i-mdi-account').evaluate(el => getComputedStyle(el).maskImage)).not.toBe('none')
  const area = page.locator(info.project.name === 'docs' ? '[data-demo="avatar/recovery"]' : '[data-avatar-demo="recovery"]')
  await expect(area).toContainText('已回退到字符'); await area.getByRole('button', { name: '更换图片', exact: true }).click()
  await expect.poll(() => area.getByRole('img', { name: '可恢复头像' }).evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
})
// 响应式独立头像、继承组尺寸与成员覆盖在窄/宽视口间更新。
test('[avatar.browser.responsive] responds to real viewport changes', async ({ page }, info) => {
  const area = await demo(page, info, 'responsive')
  for (const [width, size] of [[400, 24], [576, 32], [800, 40], [1000, 64], [1280, 80], [1600, 100], [400, 24]]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(area.locator('.responsive-avatar')).toHaveCSS('width', `${size}px`)
    const boxes = area.locator('span[style*="width:"]')
    await expect(boxes.nth(1)).toHaveCSS('width', `${size}px`)
    await expect(boxes.nth(3)).toHaveCSS('width', width >= 768 ? '64px' : '24px')
  }
})
// 三种触发方式都能查看隐藏成员；按钮可通过键盘操作，Popover 定位在视口内。
test('[avatar.browser.overflow] hover click and focus reveal hidden members', async ({ page }, info) => {
  const area = await demo(page, info, 'overflow')
  for (const trigger of ['hover', 'click', 'focus']) {
    const row = area.locator(`[data-trigger="${trigger}"]`), button = row.getByRole('button', { name: '查看其余 2 个头像' })
    if (trigger === 'hover') await button.hover()
    else if (trigger === 'click') { await button.focus(); await button.press('Enter') }
    else await button.focus()
    const dialog = page.getByRole('dialog').filter({ hasText: 'CD' })
    await expect(dialog).toBeVisible(); await expect(dialog).toHaveText('CD')
    const box = await dialog.boundingBox(); expect(box!.x).toBeGreaterThanOrEqual(0)
    await area.getByRole('button', { name: '切换数量', exact: true }).focus()
    await page.mouse.move(0, 0)
    if (trigger === 'click') await area.getByRole('button', { name: '切换数量', exact: true }).press('Tab')
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  }
  await area.getByRole('button', { name: '切换数量', exact: true }).click()
  await expect(area.getByRole('button', { name: '查看其余 4 个头像' })).toHaveCount(3)
  await area.locator('[data-trigger="click"]').getByRole('button').click()
  await expect(page.getByRole('dialog')).toHaveText('ABCD')
  await area.screenshot({ path: info.outputPath('overflow.png') })
})
// 头像组发生真实重叠，成员覆盖尺寸不被上下文默认值吞掉。
test('[avatar.browser.group] overlaps members and honors overrides', async ({ page }, info) => {
  const area = await demo(page, info, 'group'), avatars = area.locator('span[style*="width:"]')
  const first = await avatars.nth(0).boundingBox(), second = await avatars.nth(1).boundingBox()
  expect(second!.x).toBeLessThan(first!.x + first!.width)
  await expect(avatars.nth(4)).toHaveCSS('width', '48px'); await expect(avatars.nth(6)).toHaveCSS('width', '32px')
})
// 字符缩写与徽标组合有真实输出；小屏没有页面级水平溢出。
test('[avatar.browser.characters] text updates and badge integration', async ({ page }, info) => {
  const area = await demo(page, info, 'characters')
  await expect(area).toContainText('ST'); await area.getByRole('button', { name: '切换姓名', exact: true }).click(); await expect(area).toContainText('小明')
  const badge = page.locator(info.project.name === 'docs' ? '[data-demo="avatar/badge"]' : '[data-avatar-demo="badge"]')
  await expect(badge).toContainText('3')
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1)
})
// 开发模式验证响应式与图标实际绘制。
test('[avatar.browser.dev] dev rendering', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658/${path}`)
  await page.setViewportSize({ width: 400, height: 900 })
  await expect(page.locator('[data-demo="avatar/responsive"] .responsive-avatar')).toHaveCSS('width', '24px')
  expect(await page.locator('[data-demo="avatar/types"] .i-mdi-account').evaluate(el => getComputedStyle(el).maskImage)).not.toBe('none')
})
// Avatar 与公开子组件的独立 API 和源码在原始 HTML 中。
test('[avatar.browser.ssr] group API and demos are server-rendered', async ({ request }) => {
  const response = await request.get(path); expect(response.status()).toBe(200)
  const html = await response.text()
  for (const text of ['Avatar API', 'AvatarGroup API', 'maxPopoverTrigger', 'srcSet', 'data-demo="avatar/overflow"']) expect(html).toContain(text)
})
