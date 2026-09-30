import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'

const path = 'components/feedback/popconfirm/'
async function demo(page: Page, info: TestInfo, id: string) {
  const docs = info.project.name === 'docs'
  if (!page.url().includes(docs ? path : '/Popconfirm')) await page.goto(docs ? path : 'Popconfirm')
  const area = page.locator(docs ? `[data-demo="popconfirm/${id}"]` : `[data-popconfirm-demo="${id}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  return area
}
const box = (locator: Locator) => locator.evaluate(el => {
  const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }
})
const near = (actual: number, expected: number, tolerance = 1) => expect(Math.abs(actual - expected), `${actual} ≈ ${expected}`).toBeLessThanOrEqual(tolerance)
const layer = (page: Page) => page.locator('[data-popconfirm-part="root"]:not([aria-hidden])')
// wind4 颜色计算值可能是 oklab，用同类名探针元素归一对比
const probeColor = (page: Page, cls: string) => page.evaluate(c => { const el = document.createElement('i'); el.className = c; document.body.append(el); const v = getComputedStyle(el).color; el.remove(); return v }, cls)

// 几何：容器 12px 内边距、8px 圆角；图标 14px 警告色、右距 8px 且与标题首行垂直居中；标题 600、描述上距 4px；
// 按钮 small（24px）右对齐、间距 8px；浮层在触发器上方，箭头指向触发器中心。
test('[popconfirm.browser.geometry] antd panel layout', async ({ page }, info) => {
  const area = await demo(page, info, info.project.name === 'docs' ? 'basic' : 'description')
  const trigger = area.getByRole('button').first()
  await trigger.click()
  const root = layer(page)
  await expect(root).toBeVisible()
  await expect.poll(() => root.evaluate(el => getComputedStyle(el).opacity)).toBe('1')
  const container = root.locator('[data-popconfirm-part="container"]')
  expect(await container.evaluate(el => getComputedStyle(el).padding)).toBe('12px')
  expect(await root.evaluate(el => [getComputedStyle(el).borderRadius, getComputedStyle(el).zIndex])).toEqual(['8px', '1060'])
  const icon = root.locator('[data-popconfirm-part="icon"]')
  const svg = await box(icon.locator('svg'))
  near(svg.width, 14)
  expect(await icon.evaluate(el => getComputedStyle(el).color)).toBe(await probeColor(page, 'text-[#faad14]'))
  const title = root.locator('[data-popconfirm-part="title"]')
  const t = await box(title)
  near(t.x - (svg.x + svg.width), 8)
  near(svg.y + svg.height / 2, t.y + 11, 1.5) // 首行 22px 行高的中线
  expect(await title.evaluate(el => getComputedStyle(el).fontWeight)).toBe('600')
  const d = await box(root.locator('[data-popconfirm-part="description"]'))
  near(d.y - (t.y + t.height), 4)
  const [cancel, ok] = [root.getByRole('button').nth(0), root.getByRole('button').nth(1)]
  const [c, o, panel] = [await box(cancel), await box(ok), await box(container)]
  near(c.height, 24); near(o.x - (c.x + c.width), 8); near(panel.x + panel.width - 12, o.x + o.width)
  near(c.y - (d.y + d.height), 8)
  const tr = await box(trigger)
  const r = await box(root)
  expect(r.y + r.height).toBeLessThan(tr.y)
  const arrow = await box(root.locator('[data-popconfirm-part="arrow"]'))
  near(arrow.x + arrow.width / 2, tr.x + tr.width / 2, 1.5)
  await page.screenshot({ path: info.outputPath('geometry.png'), clip: { x: r.x - 16, y: r.y - 16, width: r.width + 32, height: r.height + tr.height + 40 } })
  // 取消关闭
  await cancel.click()
  await expect(layer(page)).toHaveCount(0)
})

// 只有标题时标题常规字重；Escape 与点击外部关闭。
test('[popconfirm.browser.dismiss] title-only weight, escape and outside click', async ({ page }, info) => {
  test.skip(info.project.name === 'docs', 'docs 示例均带描述，标题常规字重在 example 覆盖')
  const area = await demo(page, info, 'basic')
  await area.getByRole('button').first().click()
  const root = layer(page)
  await expect(root).toBeVisible()
  expect(await root.locator('[data-popconfirm-part="title"]').evaluate(el => getComputedStyle(el).fontWeight)).toBe('400')
  await page.keyboard.press('Escape')
  await expect(layer(page)).toHaveCount(0)
  await area.getByRole('button').first().click()
  await expect(layer(page)).toBeVisible()
  await page.mouse.click(5, 5)
  await expect(layer(page)).toHaveCount(0)
})

// 异步：确认按钮 loading 且面板保持；reject 后仍打开并退出 loading。
test('[popconfirm.browser.async] promise loading and reject keeps open', async ({ page }, info) => {
  const docs = info.project.name === 'docs'
  const area = await demo(page, info, docs ? 'promise' : 'async')
  await area.getByRole('button', { name: docs ? 'Promise 失败' : '异步失败' }).click()
  const root = layer(page)
  const ok = root.getByRole('button').nth(1)
  await ok.click()
  await expect(ok.locator('.animate-spin')).toHaveCount(1)
  await expect(ok.locator('.animate-spin')).toHaveCount(0, { timeout: 5000 })
  await expect(root).toBeVisible()
  await expect(page.getByText(/保持打开/).first()).toBeVisible()
})

// 位置：bottomRight 浮层右边缘与触发器右对齐并位于下方；leftTop 在左侧且顶部对齐。
test('[popconfirm.browser.placement] aligned placements', async ({ page }, info) => {
  const area = await demo(page, info, 'placement')
  const pick = (name: string) => docs ? area.getByRole('button', { name, exact: true }) : area.getByRole('button', { name })
  const docs = info.project.name === 'docs'
  for (const [name, check] of [
    [docs ? 'bottomRight' : 'BR', (r: DOMRectLike, t: DOMRectLike) => { near(r.x + r.width, t.x + t.width); expect(r.y).toBeGreaterThan(t.y + t.height) }],
    [docs ? 'leftTop' : 'LT', (r: DOMRectLike, t: DOMRectLike) => { near(r.y, t.y); expect(r.x + r.width).toBeLessThan(t.x) }],
  ] as const) {
    const trigger = pick(name)
    await trigger.scrollIntoViewIfNeeded()
    await trigger.click()
    const root = layer(page)
    await expect.poll(() => root.evaluate(el => getComputedStyle(el).opacity)).toBe('1')
    check(await box(root), await box(trigger))
    await page.keyboard.press('Escape')
    await expect(layer(page)).toHaveCount(0)
  }
})
type DOMRectLike = { x: number; y: number; width: number; height: number }
