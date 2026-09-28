import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'
import { paintedColor } from '../../utils/color-browser'

const path = 'components/navigation/breadcrumb/'
async function demo(page: Page, info: TestInfo, name: string) {
  if (!page.url().includes(info.project.name === 'docs' ? path : '/Breadcrumb')) await page.goto(info.project.name === 'docs' ? path : 'Breadcrumb')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="breadcrumb/${name}"]` : `[data-breadcrumb-demo="${name}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  await expect(area.locator('nav > ol').first()).toBeVisible()
  return area
}
type Box = { x: number; y: number; width: number; height: number; right: number; bottom: number }
/** DOMRect 字段是原型 getter，须拷成普通对象。 */
const box = (locator: Locator): Promise<Box> => locator.evaluate(el => {
  const r = el.getBoundingClientRect()
  return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }
})
const shot = (area: Locator, info: TestInfo, name: string) => area.screenshot({ path: info.outputPath(`${name}.png`) })
const alpha = (color: string) => { const m = color.match(/rgba?\(([^)]+)\)/); return m ? Number(m[1]!.split(',')[3] ?? 1) : 1 }

// 颜色：普通项 / 分隔符为次要色，最后一项更深；链接 hover 文字加深并出现浅灰背景（过渡色须轮询）。
test('[breadcrumb.browser.colors] item, last item and link hover colors', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const items = area.locator('nav > ol > li:not([aria-hidden])')
  const first = await paintedColor(items.first(), 'color')
  const last = await paintedColor(items.last(), 'color')
  const separator = await paintedColor(area.locator('li[aria-hidden="true"]').first(), 'color')
  expect(last).not.toBe(first)
  expect(separator).toBe(first)
  const link = area.locator('a').first()
  const idle = await paintedColor(link, 'color')
  expect(await link.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)')
  await link.hover()
  await expect.poll(() => paintedColor(link, 'color')).not.toBe(idle)
  await expect.poll(async () => alpha(await link.evaluate(el => getComputedStyle(el).backgroundColor))).toBeGreaterThan(0)
  await shot(area, info, 'basic-hover')
})

// 间距：分隔符左右各 8px；链接高 22px、内边距 4px 且以 -4px 外边距抵消，不改变文字位置。
test('[breadcrumb.browser.spacing] separator margin and link box', async ({ page }, info) => {
  const area = await demo(page, info, 'separator')
  const separator = area.locator('li[aria-hidden="true"]').first()
  await expect(separator).toHaveCSS('margin-left', '8px')
  await expect(separator).toHaveCSS('margin-right', '8px')
  await expect(separator).toHaveText('>')
  const link = area.locator('a').first()
  await expect(link).toHaveCSS('height', '22px')
  await expect(link).toHaveCSS('padding-left', '4px')
  await expect(link).toHaveCSS('margin-left', '-4px')
  await expect(area.locator('nav')).toHaveCSS('font-size', '14px')
  // 分隔符数量 = 项数 - 1。
  const itemCount = await area.locator('nav > ol > li:not([aria-hidden])').count()
  await expect(area.locator('li[aria-hidden="true"]')).toHaveCount(itemCount - 1)
})

// 下拉：悬浮打开菜单，菜单项 path 渲染为链接，选择后回显 key 并关闭；dropdownProps.trigger='click' 的项点击打开。
test('[breadcrumb.browser.dropdown] hover and click menus', async ({ page }, info) => {
  const area = await demo(page, info, 'overlay')
  const triggers = area.locator('[aria-haspopup="menu"]')
  const hover = triggers.first()
  await hover.hover()
  await expect(hover).toHaveAttribute('aria-expanded', 'true')
  const menu = page.getByRole('menu').last()
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('menuitem', { name: '布局' }).locator('a')).toHaveAttribute('href', /#overlay-layout$/)
  // 菜单位于触发区下方。
  expect((await box(menu)).y).toBeGreaterThanOrEqual((await box(hover)).bottom - 1)
  await shot(area, info, 'overlay-open')
  await menu.getByRole('menuitem', { name: '导航' }).click()
  await expect(area.locator('output')).toContainText('nav')
  await expect(hover).toHaveAttribute('aria-expanded', 'false')

  const click = triggers.nth(1)
  await page.mouse.move(0, 0)
  await click.hover()
  await expect(click).toHaveAttribute('aria-expanded', 'false')
  await click.click()
  await expect(click).toHaveAttribute('aria-expanded', 'true')
  await expect(area.locator('output')).toContainText('打开')
  await page.getByRole('menuitem', { name: '主按钮' }).click()
  await expect(area.locator('output')).toContainText('primary')
})

// 参数：path 累积为 #/users/1/detail，:id 替换。
test('[breadcrumb.browser.params] accumulated href', async ({ page }, info) => {
  const area = await demo(page, info, 'params')
  await expect(area.locator('a')).toHaveCount(3)
  await expect(area.locator('a').last()).toHaveAttribute('href', '#/users/1/detail')
  await expect(area.locator('a').nth(1)).toHaveText('1')
})

// 窄屏：列表 flex-wrap 换行，页面无横向滚动。
test('[breadcrumb.browser.wrap] wraps on narrow width', async ({ page }, info) => {
  await page.setViewportSize({ width: 360, height: 800 })
  const area = await demo(page, info, 'overlay')
  await expect(area.locator('nav > ol')).toHaveCSS('flex-wrap', 'wrap')
  const list = area.locator('nav > ol')
  await list.evaluate(el => { (el.parentElement as HTMLElement).style.maxWidth = '160px' })
  const items = area.locator('nav > ol > li:not([aria-hidden])')
  const [first, last] = await Promise.all([box(items.first()), box(items.last())])
  expect(last.y).toBeGreaterThan(first.y)
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0)
  await shot(area, info, 'wrap')
})

// 原始静态 HTML 含 API 与契约文字（示例仅客户端渲染，SSR 只断言文字）。
test('[breadcrumb.browser.ssr] API contracts in static HTML', async ({ request }) => {
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  for (const text of ['itemRender', 'dropdownProps', 'aria-hidden', 'breadcrumb/overlay', 'BreadcrumbMenuItem']) expect(html).toContain(text)
})
