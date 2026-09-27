import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'
import { paintedColor } from '../../utils/color-browser'
const path = 'components/feedback/alert/'
async function demo(page: Page, info: TestInfo, name: string) {
  if (!page.url().includes(info.project.name === 'docs' ? path : '/Alert')) await page.goto(info.project.name === 'docs' ? path : 'Alert')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="alert/${name}"]` : `[data-alert-demo="${name}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  return area
}
type Box = { x: number; y: number; width: number; height: number }
const box = (locator: Locator): Promise<Box> => locator.evaluate(el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height } })
const part = (scope: Locator, name: string) => scope.locator(`[data-alert-part="${name}"]`)

// 基本：40px 高（8px 12px + 22px 行高）、8px 圆角、1px 实线边框；antd success 实测色。
test('[alert.browser.basic] antd size, radius and success colors', async ({ page }, info) => {
  const root = (await demo(page, info, 'basic')).getByRole('alert')
  await expect(root).toHaveCSS('padding', '8px 12px')
  await expect(root).toHaveCSS('border-radius', '8px')
  await expect(root).toHaveCSS('border-top-width', '1px')
  await expect(root).toHaveCSS('font-size', '14px')
  expect(Math.round((await box(root)).height)).toBe(40)
  expect(await paintedColor(root, 'background-color')).toBe('rgb(246, 255, 237)')
  expect(await paintedColor(root, 'border-top-color')).toBe('rgb(183, 235, 143)')
})

// 四种样式：warning / error 背景与边框为 antd 实测色；info 为主色浅底。
test('[alert.browser.style] four type colors', async ({ page }, info) => {
  const alerts = (await demo(page, info, 'style')).getByRole('alert')
  await expect(alerts).toHaveCount(4)
  expect(await paintedColor(alerts.nth(2), 'background-color')).toBe('rgb(255, 251, 230)')
  expect(await paintedColor(alerts.nth(2), 'border-top-color')).toBe('rgb(255, 229, 143)')
  expect(await paintedColor(alerts.nth(3), 'background-color')).toBe('rgb(255, 242, 240)')
  expect(await paintedColor(alerts.nth(3), 'border-top-color')).toBe('rgb(255, 204, 199)')
  expect(await paintedColor(alerts.nth(1), 'background-color')).not.toBe('rgba(0, 0, 0, 0)')
})

// 图标：无描述 14px 图标 + 8px 间距、垂直居中；有描述 24px 图标 + 12px、20px 24px 内边距、标题 16px + mb 8px。
test('[alert.browser.icon] icon sizes and description layout', async ({ page }, info) => {
  const alerts = (await demo(page, info, 'icon')).getByRole('alert')
  const small = alerts.nth(0), large = alerts.nth(4)
  const [iconBox, sectionBox, rootBox] = [await box(part(small, 'icon').locator('svg')), await box(part(small, 'section')), await box(small)]
  expect([Math.round(iconBox.width), Math.round(iconBox.height)]).toEqual([14, 14])
  expect(Math.round(sectionBox.x - (iconBox.x + iconBox.width))).toBe(8)
  expect(Math.abs(iconBox.y + iconBox.height / 2 - (rootBox.y + rootBox.height / 2))).toBeLessThanOrEqual(1)
  expect(await paintedColor(part(small, 'icon'), 'color')).toBe('rgb(82, 196, 26)')
  await expect(large).toHaveCSS('padding', '20px 24px')
  const bigIcon = await box(part(large, 'icon').locator('svg'))
  expect([Math.round(bigIcon.width), Math.round(bigIcon.height)]).toEqual([24, 24])
  expect(Math.round((await box(part(large, 'section'))).x - (bigIcon.x + bigIcon.width))).toBe(12)
  await expect(part(large, 'title')).toHaveCSS('font-size', '16px')
  await expect(part(large, 'title')).toHaveCSS('margin-bottom', '8px')
  expect(Math.round(bigIcon.y - (await box(large)).y)).toBe(21)
  expect(await paintedColor(part(alerts.nth(3), 'icon'), 'color')).toBe('rgb(255, 77, 79)')
})

// 顶部公告：无边框无圆角、默认 warning 图标。
test('[alert.browser.banner] banner has no border or radius', async ({ page }, info) => {
  const root = (await demo(page, info, 'banner')).getByRole('alert').first()
  await expect(root).toHaveCSS('border-top-width', '0px')
  await expect(root).toHaveCSS('border-radius', '0px')
  expect(await paintedColor(part(root, 'icon'), 'color')).toBe('rgb(250, 173, 20)')
})

// 关闭：12px 图标、45% 次要色；点击后 max-height 收起并卸载；关闭按钮带 aria-label。
test('[alert.browser.close] close button and leave animation', async ({ page }, info) => {
  const area = await demo(page, info, 'closable')
  const alerts = area.getByRole('alert')
  await expect(alerts).toHaveCount(4)
  const close = alerts.first().getByRole('button', { name: 'close' })
  const svg = await box(close.locator('svg'))
  expect([Math.round(svg.width), Math.round(svg.height)]).toEqual([12, 12])
  expect(await paintedColor(close.locator('[aria-label="close"]'), 'color')).toMatch(/0\.45\)$/)
  await close.click()
  await expect(alerts).toHaveCount(3, { timeout: 2000 })
})

// 平滑卸载：afterClose 在离场后触发，Switch 变为可用。
test('[alert.browser.smooth] afterClose fires after leave', async ({ page }, info) => {
  const area = await demo(page, info, 'smooth-closed')
  const toggle = area.getByRole('switch')
  await expect(toggle).toBeDisabled()
  await area.getByRole('alert').getByRole('button').click()
  await expect(area.getByRole('alert')).toHaveCount(0, { timeout: 2000 })
  await expect(toggle).toBeEnabled()
})

// ErrorBoundary：点击抛错后显示 error Alert，标题为错误信息。
test('[alert.browser.error-boundary] renders error alert', async ({ page }, info) => {
  const area = await demo(page, info, 'error-boundary')
  await area.getByRole('button', { name: 'Click to throw an error' }).click()
  const root = area.getByRole('alert')
  await expect(part(root, 'title')).toHaveText('Error: An Uncaught Error')
  await expect(part(root, 'description').locator('pre')).toHaveCSS('margin', '0px')
})

// 操作：action 在关闭按钮前、间距 8px；filled 边框透明。
test('[alert.browser.action] action slot and filled variant', async ({ page }, info) => {
  const first = (await demo(page, info, 'action')).getByRole('alert').first()
  const [actions, close] = [await box(part(first, 'actions')), await box(part(first, 'close'))]
  expect(Math.round(close.x - (actions.x + actions.width))).toBe(8)
  const filled = (await demo(page, info, 'filled')).getByRole('alert')
  expect(await paintedColor(filled, 'border-top-color')).toBe('rgba(0, 0, 0, 0)')
})

// 开发服务器渲染：基本示例可见。
test('[alert.browser.dev] dev rendering', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658/${path}`)
  await expect(page.locator('[data-demo="alert/basic"]').getByRole('alert')).toHaveText('Success Text')
})

// API 表与示例容器在原始 HTML 中。
test('[alert.browser.ssr] API sections are server-rendered', async ({ request }) => {
  const response = await request.get(path); expect(response.status()).toBe(200)
  const html = await response.text()
  for (const text of ['Alert API', 'AlertClosable', 'Alert.ErrorBoundary', 'data-demo="alert/style-class"']) expect(html).toContain(text)
})
