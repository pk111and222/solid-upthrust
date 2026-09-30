import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'

const path = 'components/general/float-button/'
async function demo(page: Page, info: TestInfo, docsId: string, exampleId: string) {
  const docs = info.project.name === 'docs'
  if (!page.url().includes(docs ? path : '/FloatButton')) await page.goto(docs ? path : 'FloatButton')
  const area = page.locator(docs ? `[data-demo="float-button/${docsId}"]` : `[data-float-button-demo="${exampleId}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  await area.scrollIntoViewIfNeeded()
  return area
}
const box = (locator: Locator) => locator.evaluate(el => {
  const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }
})
// fixed 按钮的 containing block：最近的 transform 祖先（演示框 translateZ(0)），取 padding box。
const frame = (locator: Locator) => locator.evaluate(el => {
  let p = el.parentElement
  while (p && getComputedStyle(p).transform === 'none') p = p.parentElement
  const r = p!.getBoundingClientRect()
  const x = r.x + p!.clientLeft, y = r.y + p!.clientTop
  return { x, y, right: x + p!.clientWidth, bottom: y + p!.clientHeight }
})
const near = (actual: number, expected: number, tolerance = 1) => expect(Math.abs(actual - expected), `${actual} ≈ ${expected}`).toBeLessThanOrEqual(tolerance)
const roots = (scope: Locator) => scope.locator('[data-float-button-part="root"]')
const shot = async (area: Locator, info: TestInfo, name: string) => area.screenshot({ path: info.outputPath(`${name}.png`) })

// 几何：40×40 圆形、fixed 在演示框右 24 / 下 48、z-index 1000、带阴影；默认图标 18px。
test('[float-button.browser.geometry] individual button layout', async ({ page }, info) => {
  const area = await demo(page, info, 'basic', 'basic')
  const root = roots(area).first()
  const b = await box(root)
  const f = await frame(root)
  near(b.width, 40)
  near(b.height, 40)
  near(f.right - (b.x + b.width), 24)
  near(f.bottom - (b.y + b.height), 48)
  expect(await root.evaluate(el => {
    // wind4 rounded-full = calc(infinity * 1px)，计算值是超大 px：只断言不小于半宽
    const s = getComputedStyle(el); return [s.position, s.zIndex, parseFloat(s.borderTopLeftRadius) >= 20, s.boxShadow !== 'none']
  })).toEqual(['fixed', '1000', true, true])
  const svg = await box(root.locator('[data-float-button-part="icon"] svg'))
  near(svg.width, 18)
  near(svg.x + svg.width / 2, b.x + b.width / 2)
  await shot(area, info, 'geometry')
})

// Group：circle 各自独立、纵向间距 16；square 为紧凑列表，相邻边框重叠 1px、列表 8px 圆角带阴影、子按钮无阴影。
test('[float-button.browser.group] circle gap and square compact', async ({ page }, info) => {
  const area = await demo(page, info, 'group', 'group')
  const [circle, square] = [area.locator('[data-float-button-part="group"]').nth(0), area.locator('[data-float-button-part="group"]').nth(1)]
  const c0 = await box(roots(circle).nth(0)), c1 = await box(roots(circle).nth(1))
  near(c1.y - (c0.y + c0.height), 16)
  expect(await roots(circle).nth(0).evaluate(el => getComputedStyle(el).boxShadow !== 'none')).toBe(true)
  const s0 = await box(roots(square).nth(0)), s1 = await box(roots(square).nth(1))
  near(s1.y - (s0.y + s0.height), -1)
  const list = square.locator('[data-float-button-part="list"]')
  expect(await list.evaluate(el => [getComputedStyle(el).borderTopLeftRadius, getComputedStyle(el).boxShadow !== 'none'])).toEqual(['8px', true])
  expect(await roots(square).nth(1).evaluate(el => [getComputedStyle(el).boxShadow, getComputedStyle(el).borderTopLeftRadius])).toEqual(['none', '0px'])
  expect(await roots(square).nth(0).evaluate(el => getComputedStyle(el).borderTopLeftRadius)).toBe('8px')
  const f = await frame(circle)
  const g = await box(circle)
  near(f.right - (g.x + g.width), 24)
  near(f.bottom - (g.y + g.height), 48)
  await shot(area, info, 'group')
})

// click 菜单：点击触发按钮展开，列表在触发按钮上方 16px、淡入到位；图标换为关闭；点击组外收起并卸载。
test('[float-button.browser.menu-click] click menu motion and outside close', async ({ page }, info) => {
  const area = await demo(page, info, 'group-menu', 'menu')
  const group = area.locator('[data-float-button-part="group"]').first()
  const trigger = group.locator('[data-float-button-trigger]')
  await expect(group.locator('[data-float-button-part="list"]')).toHaveCount(0)
  await trigger.click()
  const list = group.locator('[data-float-button-part="list"]')
  await expect(list).toHaveAttribute('data-float-button-open', 'true')
  await expect.poll(() => list.evaluate(el => getComputedStyle(el).opacity)).toBe('1')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(trigger.locator('[aria-label="close"]')).toHaveCount(1)
  await expect.poll(async () => (await box(trigger)).y - ((await box(list)).y + (await box(list)).height)).toBeCloseTo(16, 0)
  await shot(area, info, 'menu-open')
  await page.mouse.click(5, 5)
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(list).toHaveCount(0)
})

// hover 菜单：移入展开、移出收起。
test('[float-button.browser.menu-hover] hover menu opens and closes', async ({ page }, info) => {
  const area = await demo(page, info, 'group-menu', 'menu')
  const group = area.locator('[data-float-button-part="group"]').nth(1)
  await group.locator('[data-float-button-trigger]').hover()
  const list = group.locator('[data-float-button-part="list"]')
  await expect(list).toHaveAttribute('data-float-button-open', 'true')
  await expect.poll(() => list.evaluate(el => getComputedStyle(el).opacity)).toBe('1')
  await page.mouse.move(5, 5)
  await expect(list).toHaveCount(0)
})

// BackTop：容器滚过阈值后挂载并淡入到 opacity 1，位于右下角；点击平滑回到顶部后淡出卸载。
test('[float-button.browser.back-top] appears past threshold and scrolls back', async ({ page }, info) => {
  const area = await demo(page, info, 'back-top', 'back-top')
  const pane = area.locator('[data-back-top-pane]')
  await expect(roots(area)).toHaveCount(0)
  await pane.evaluate(el => { el.scrollTop = 300 })
  const root = roots(area).first()
  await expect(root).toHaveAttribute('data-float-button-backtop', 'visible')
  await expect.poll(() => root.evaluate(el => getComputedStyle(el).opacity)).toBe('1')
  const b = await box(root), f = await frame(root)
  near(f.right - (b.x + b.width), 24)
  near(f.bottom - (b.y + b.height), 48)
  expect(await root.locator('[aria-label="vertical-align-top"]').count()).toBe(1)
  await shot(area, info, 'back-top')
  await root.click()
  await expect.poll(() => pane.evaluate(el => el.scrollTop)).toBe(0)
  await expect(roots(area)).toHaveCount(0)
})

// 徽标：数字徽标中心落在圆形按钮右上角内缩 4.686px 处。
test('[float-button.browser.badge] count badge sits on the top-right corner', async ({ page }, info) => {
  const area = await demo(page, info, 'badge', 'badge')
  const root = roots(area).filter({ has: page.locator('[data-float-button-part="badge"]', { hasText: '5' }) }).first()
  await expect(root).toHaveAttribute('data-float-button-shape', 'circle')
  const b = await box(root)
  const badge = await box(root.locator('[data-float-button-part="badge"]'))
  near(badge.x + badge.width / 2, b.x + b.width - 4.686, 1.5)
  near(badge.y + badge.height / 2, b.y + 4.686, 1.5)
  await shot(area, info, 'badge')
})

// tooltip：悬停按钮弹出 role=tooltip 气泡，位于按钮上方。
test('[float-button.browser.tooltip] tooltip opens on hover', async ({ page }, info) => {
  const docs = info.project.name === 'docs'
  const area = await demo(page, info, 'tooltip', 'basic')
  const root = docs ? roots(area).last() : area.locator('a[data-float-button-part="root"]')
  await root.hover()
  const tip = page.locator('[data-float-button-part="tooltip"][role="tooltip"]:not([aria-hidden])')
  await expect(tip).toHaveText(docs ? 'Documents' : '链接 + 气泡')
  await expect.poll(() => tip.evaluate(el => getComputedStyle(el).opacity)).toBe('1')
  const t = await box(tip), b = await box(root)
  expect(t.y + t.height).toBeLessThanOrEqual(b.y)
  await page.screenshot({ path: info.outputPath('tooltip.png'), clip: { x: b.x - 120, y: t.y - 16, width: 240, height: b.y + b.height - t.y + 32 } })
})
