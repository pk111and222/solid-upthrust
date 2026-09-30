import { test, expect, type Page, type TestInfo } from '@playwright/test'

const path = 'components/feedback/modal/'
async function open(page: Page, info: TestInfo, id: string, name: string) {
  const docs = info.project.name === 'docs'
  if (!page.url().includes(docs ? path : '/Modal')) await page.goto(docs ? path : 'Modal')
  const area = page.locator(docs ? `[data-demo="modal/${id}"]` : `[data-modal-demo="${id}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  await area.getByRole('button', { name, exact: true }).click()
  return area
}
const box = (page: Page, selector: string) => page.locator(selector).first().evaluate(el => {
  const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }
})
const near = (actual: number, expected: number, tolerance = 1) => expect(Math.abs(actual - expected), `${actual} ≈ ${expected}`).toBeLessThanOrEqual(tolerance)

// 基础：520px 宽、距顶 100px 水平居中；容器 20px 24px、8px 圆角；× 32px 距角 12px；按钮行右对齐间距 8px；Tab 在面板内循环；Escape 关闭并恢复焦点。
test('[modal.browser.basic] geometry, focus trap and Escape', async ({ page }, info) => {
  const area = await open(page, info, 'basic', info.project.name === 'docs' ? 'Open Modal' : '打开弹窗')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await page.waitForTimeout(400)
  const viewport = page.viewportSize()!
  const panel = await box(page, '[role="dialog"]')
  near(panel.width, 520); near(panel.y, 100); near(panel.x, (viewport.width - 520) / 2, 8)
  const container = page.locator('[data-modal-part="container"]')
  expect(await container.evaluate(el => { const s = getComputedStyle(el); return [s.paddingTop, s.paddingLeft, s.borderTopLeftRadius] })).toEqual(['20px', '24px', '8px'])
  const close = await box(page, '[role="dialog"] [aria-label="Close"]')
  near(close.width, 32); near(close.y - panel.y, 12); near(panel.right - close.right, 12)
  const buttons = dialog.getByRole('button')
  const [cancel, ok] = [await buttons.nth(1).boundingBox(), await buttons.nth(2).boundingBox()]
  near(ok!.x - (cancel!.x + cancel!.width), 8)
  near(panel.right - (ok!.x + ok!.width), 24)
  await expect(dialog).toBeFocused()
  for (let i = 0; i < 4; i++) await page.keyboard.press('Tab')
  expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true)
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await area.screenshot({ path: info.outputPath('area.png') })
  await page.screenshot({ path: info.outputPath('basic.png') })
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(area.getByRole('button').first()).toBeFocused()
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
})

// 异步：确定按钮 loading 期间保持打开，约 2s 后关闭。
test('[modal.browser.async] async onOk keeps the modal open while pending', async ({ page }, info) => {
  await open(page, info, 'async', info.project.name === 'docs' ? 'Open Modal with async logic' : '异步提交')
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button').last().click()
  await expect(dialog.locator('[aria-busy="true"]')).toHaveCount(1)
  await page.waitForTimeout(800)
  await expect(dialog).toBeVisible()
  await expect(dialog).toBeHidden({ timeout: 4000 })
})

// 静态方法：confirm 416px、图标 + 标题 + 内容；info 只有一个按钮；destroyAll 由确定关闭。
test('[modal.browser.static] confirm geometry and info single action', async ({ page }, info) => {
  const docs = info.project.name === 'docs'
  const area = await open(page, info, 'static', docs ? 'Confirm' : 'Modal.confirm')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await page.waitForTimeout(400)
  near((await box(page, '[role="dialog"]')).width, 416)
  await expect(dialog.locator('[data-modal-part="confirm-body"] [role="img"]').first()).toBeVisible()
  await expect(dialog.getByRole('button')).toHaveCount(2)
  await page.screenshot({ path: info.outputPath('confirm.png') })
  await dialog.getByRole('button', { name: '取消' }).click()
  await expect(dialog).toBeHidden()
  await area.getByRole('button', { name: docs ? 'Info' : 'info', exact: true }).click()
  await expect(page.getByRole('dialog').getByRole('button')).toHaveCount(1)
  await page.getByRole('dialog').getByRole('button', { name: '知道了' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

// 窄屏：面板宽度收缩为 100vw - 16px，左右各 8px。
test('[modal.browser.mobile] narrow viewport keeps 8px gutters', async ({ page }, info) => {
  test.skip(info.project.name === 'example', 'example 应用在窄屏隐藏内容区')
  await page.setViewportSize({ width: 390, height: 800 })
  await open(page, info, 'basic', 'Open Modal')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.waitForTimeout(400)
  const panel = await box(page, '[role="dialog"]')
  near(panel.width, 390 - 16); near(panel.x, 8)
})
