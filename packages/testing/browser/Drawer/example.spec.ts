import { test, expect, type Page, type TestInfo } from '@playwright/test'

const path = 'components/feedback/drawer/'
async function open(page: Page, info: TestInfo, id: string, name: string) {
  const docs = info.project.name === 'docs'
  if (!page.url().includes(docs ? path : '/Drawer')) await page.goto(docs ? path : 'Drawer')
  const area = page.locator(docs ? `[data-demo="drawer/${id}"]` : `[data-drawer-demo="${id}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  await area.getByRole('button', { name, exact: true }).click()
  return area
}
const box = (page: Page, selector: string) => page.locator(selector).first().evaluate(el => {
  const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }
})
const near = (actual: number, expected: number, tolerance = 1) => expect(Math.abs(actual - expected), `${actual} ≈ ${expected}`).toBeLessThanOrEqual(tolerance)

// 基础：右侧贴边 378px 全高、无圆角；头部 56px（16px 24px + 24px 行高）、× 24px 在标题前；遮罩 / × / Escape 关闭且焦点回到触发按钮。
test('[drawer.browser.basic] geometry, close intents and focus restore', async ({ page }, info) => {
  const area = await open(page, info, 'basic', info.project.name === 'docs' ? 'Open' : '打开抽屉')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await page.waitForTimeout(400)
  const viewport = page.viewportSize()!
  const panel = await box(page, '[data-drawer-part="wrapper"]')
  near(panel.width, 378); near(panel.right, viewport.width); near(panel.height, viewport.height); near(panel.y, 0)
  expect(await dialog.evaluate(el => getComputedStyle(el).borderRadius)).toBe('0px')
  const header = await box(page, '[data-drawer-part="header"]')
  near(header.height, 57) // 56 + 1px hairline
  const close = await box(page, '[data-drawer-part="header"] [aria-label="Close"]')
  near(close.width, 24); near(close.x - panel.x, 24)
  await expect(dialog).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(area.getByRole('button').first()).toBeFocused()
  if (info.project.name === 'example') await expect(page.getByText('最近操作：onClose 关闭')).toBeVisible()
  await area.getByRole('button').first().click()
  await dialog.getByRole('button', { name: 'Close' }).click()
  await expect(dialog).toBeHidden()
  await area.getByRole('button').first().click()
  await page.mouse.click(10, 10)
  await expect(dialog).toBeHidden()
  await area.screenshot({ path: info.outputPath('basic.png') })
})

// 多层：第二层打开时第一层向左推 180px；Escape 先关第二层、第一层回位，再关第一层。
test('[drawer.browser.push] nested drawer push and layered Escape', async ({ page }, info) => {
  await open(page, info, 'multi-level', info.project.name === 'docs' ? 'Open drawer' : '打开多级抽屉')
  const first = page.getByRole('dialog').first()
  await expect(first).toBeVisible()
  await first.getByRole('button', { name: info.project.name === 'docs' ? 'Two-level drawer' : '打开第二层' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(2)
  await page.waitForTimeout(400)
  const wrappers = page.locator('[data-drawer-part="wrapper"]')
  const viewport = page.viewportSize()!
  const pushed = await wrappers.first().evaluate(el => el.getBoundingClientRect().right)
  near(pushed, viewport.width - 180)
  await page.screenshot({ path: info.outputPath('push.png') })
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(1)
  await page.waitForTimeout(400)
  near(await wrappers.first().evaluate(el => el.getBoundingClientRect().right), viewport.width)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

// 四个方向：top / bottom 为 378px 高、全宽贴边。
test('[drawer.browser.placement] top and bottom hug their edges', async ({ page }, info) => {
  test.skip(info.project.name === 'docs', 'example 页四方向按钮')
  for (const [name, edge] of [['顶部', 'top'], ['底部', 'bottom']] as const) {
    await open(page, info, 'placement', name)
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await page.waitForTimeout(400)
    const panel = await box(page, '[data-drawer-part="wrapper"]')
    const viewport = page.viewportSize()!
    near(panel.height, 378); near(panel.width, viewport.width)
    if (edge === 'top') near(panel.y, 0); else near(panel.bottom, viewport.height)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  }
})

// 可调整大小：拖动内沿，宽度跟随并受 maxSize 600 约束。
test('[drawer.browser.resize] dragger resizes the panel', async ({ page }, info) => {
  test.skip(info.project.name === 'example', '仅文档站示例')
  await open(page, info, 'resizable', 'Open Drawer')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.waitForTimeout(400)
  const handle = await box(page, '[data-drawer-part="dragger"]')
  near(handle.width, 4)
  await page.mouse.move(handle.x + 2, handle.y + 200)
  await page.mouse.down()
  await page.mouse.move(handle.x - 100, handle.y + 200, { steps: 5 })
  near((await box(page, '[data-drawer-part="wrapper"]')).width, 358) // 256 + 102（抓点在把手内 2px）
  await page.mouse.move(0, handle.y + 200, { steps: 5 })
  await page.mouse.up()
  near((await box(page, '[data-drawer-part="wrapper"]')).width, 600)
  await expect(page.getByRole('dialog').getByText('Current size: 600px')).toBeVisible()
})
