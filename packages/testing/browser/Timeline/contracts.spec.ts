import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'
import { paintedColor } from '../../utils/color-browser'
const path = 'components/data-display/timeline/'
async function demo(page: Page, info: TestInfo, name: string) {
  if (!page.url().includes(info.project.name === 'docs' ? path : '/Timeline')) await page.goto(info.project.name === 'docs' ? path : 'Timeline')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="timeline/${name}"]` : `[data-timeline-demo="${name}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  return area
}
type Box = { x: number; y: number; width: number; height: number }
const box = (locator: Locator): Promise<Box> => locator.evaluate(el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height } })
const cx = (b: Box) => b.x + b.width / 2
const cy = (b: Box) => b.y + b.height / 2
const part = (scope: Locator, name: string) => scope.locator(`[data-timeline-part="${name}"]`)

// 基本：圆点 10×10 蓝色描边；导轨 2px 竖线穿过圆点中心、从圆点下方连到下一个圆点；节点最小高 48px；内容与圆点垂直对齐。
test('[timeline.browser.basic] dot, rail and item geometry', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const items = area.locator('li')
  await expect(items).toHaveCount(4)
  const [i0, i1] = [items.nth(0), items.nth(1)]
  const dot = part(i0, 'icon')
  const d0 = await box(dot), d1 = await box(part(i1, 'icon')), rail = await box(part(i0, 'rail'))
  expect([d0.width, d0.height]).toEqual([10, 10])
  await expect(dot).toHaveCSS('border-top-width', '2px')
  expect(await paintedColor(dot, 'border-top-color')).toBe(await paintedColor(dot, 'color'))
  expect(await paintedColor(dot, 'border-top-color')).not.toBe('rgba(0, 0, 0, 0)')
  expect(await dot.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)')
  expect(rail.width).toBe(2)
  expect(Math.abs(cx(rail) - cx(d0))).toBeLessThanOrEqual(0.5)
  // 导轨起点在圆点下沿之下、终点越过下一个圆点上沿。
  expect(rail.y).toBeGreaterThanOrEqual(d0.y + d0.height - 0.5)
  expect(rail.y + rail.height).toBeGreaterThanOrEqual(d1.y - 0.5)
  expect((await box(i0)).height).toBeGreaterThanOrEqual(48)
  await expect(i0).toHaveCSS('padding-bottom', '12px')
  const content = await box(part(i0, 'content'))
  expect(Math.abs(cy(d0) - (content.y + 11))).toBeLessThanOrEqual(1.5)
  expect(content.x - (d0.x + d0.width)).toBeCloseTo(16, 0)
  await expect(part(items.nth(3), 'rail')).toHaveCount(0)
})

// 填充变体：圆点实心主色；红 / 绿 / 灰预设色与自定义色在交替示例中生效。
test('[timeline.browser.colors] filled variant and preset colors', async ({ page }, info) => {
  const filled = await demo(page, info, 'variant')
  const dot = part(filled.locator('li').first(), 'icon')
  const bg = await paintedColor(dot, 'background-color')
  expect(bg).not.toBe('rgba(0, 0, 0, 0)')
  expect(bg).toBe(await paintedColor(dot, 'color'))
  const alt = await demo(page, info, 'alternate')
  expect(await paintedColor(part(alt.locator('li').nth(1), 'icon'), 'border-top-color')).toBe('rgb(82, 196, 26)')
  expect(await paintedColor(part(alt.locator('li').nth(3), 'icon'), 'border-top-color')).toMatch(/^rgb\(/)
})

// 交替：圆点居中于容器；奇数项内容在右、偶数项内容在左；自定义图标 16px 居中于同一竖线。
test('[timeline.browser.alternate] alternate places content on both sides', async ({ page }, info) => {
  const area = await demo(page, info, 'alternate')
  const list = await box(area.locator('ol'))
  const items = area.locator('li')
  const centers: number[] = []
  for (let i = 0; i < 6; i++) centers.push(cx(await box(part(items.nth(i), 'icon'))))
  for (const c of centers) expect(Math.abs(c - (list.x + list.width / 2))).toBeLessThanOrEqual(1)
  const c0 = await box(part(items.nth(0), 'content')), c1 = await box(part(items.nth(1), 'content'))
  expect(c0.x).toBeGreaterThan(centers[0])
  expect(c1.x + c1.width).toBeLessThan(centers[1])
  await expect(part(items.nth(1), 'content')).toHaveCSS('text-align', 'end')
  const icon = part(items.nth(2), 'icon').locator('span')
  await expect(icon).toHaveCSS('font-size', '16px')
  // 10px 圆点盒里的 16px 图标不被 flex 压缩，且居中于导轨。
  const ib = await box(icon)
  expect([Math.round(ib.width), Math.round(ib.height)]).toEqual([16, 16])
  expect(Math.abs(cx(ib) - centers[2])).toBeLessThanOrEqual(1)
})

// 等待中：loading 节点显示旋转图标；切换 reverse 后顺序倒转、加载节点到最前。
test('[timeline.browser.pending] loading icon and reverse toggle', async ({ page }, info) => {
  const area = await demo(page, info, 'pending')
  const items = area.locator('li')
  await expect(items.last()).toHaveText('Recording...')
  const spinner = items.last().locator('[aria-label="loading"]')
  await expect(spinner).toBeVisible()
  expect(await spinner.evaluate(el => getComputedStyle(el).animationName)).not.toBe('none')
  await area.getByRole('button', { name: 'Toggle Reverse' }).click()
  await expect(items.first()).toHaveText('Recording...')
  await expect(items.last()).toHaveText('Create a services site 2015-09-01')
  const legacy = await demo(page, info, 'pending-legacy')
  await expect(legacy.locator('ol').first().locator('li')).toHaveCount(2)
  await expect(legacy.locator('ol').nth(1).locator('li').last().locator('[data-timeline-part="icon"]')).toHaveText('🔴')
})

// 另一侧：圆点在右、内容右对齐；标题模式切换 start / end / alternate，标题与内容分列圆点两侧。
test('[timeline.browser.end-title] end mode and title layouts', async ({ page }, info) => {
  const end = await demo(page, info, 'end')
  const item = end.locator('li').first()
  const dot = await box(part(item, 'icon')), content = await box(part(item, 'content'))
  expect(dot.x).toBeGreaterThan(content.x + content.width)
  await expect(part(item, 'content')).toHaveCSS('text-align', 'end')
  const area = await demo(page, info, 'title')
  const first = area.locator('li').first()
  const check = async () => {
    const d = cx(await box(part(first, 'icon'))), t = await box(part(first, 'title')), c = await box(part(first, 'content'))
    return { titleLeft: t.x + t.width <= d, contentRight: c.x >= d }
  }
  expect(await check()).toEqual({ titleLeft: true, contentRight: true })
  await area.getByRole('radio', { name: 'End' }).click()
  await expect(area.locator('ol')).toHaveAttribute('data-timeline-mode', 'end')
  expect(await check()).toEqual({ titleLeft: false, contentRight: false })
  await area.getByRole('radio', { name: 'Alternate' }).click()
  await expect(area.locator('ol')).toHaveAttribute('data-timeline-mode', 'alternate')
  const second = area.locator('li').nth(1)
  const d2 = cx(await box(part(second, 'icon'))), c2 = await box(part(second, 'content'))
  expect(c2.x + c2.width).toBeLessThanOrEqual(d2)
})

// 标题占比：100px → 圆点中心距左 100px；25% → 容器 1/4；18 份 + end → 距右 25%。
test('[timeline.browser.title-span] titleSpan positions the dot', async ({ page }, info) => {
  const area = await demo(page, info, 'title-span')
  const lists = area.locator('ol')
  const at = async (i: number) => { const l = await box(lists.nth(i)); const d = await box(part(lists.nth(i).locator('li').first(), 'icon')); return { l, c: cx(d) } }
  const a = await at(0); expect(Math.abs(a.c - a.l.x - 100)).toBeLessThanOrEqual(1)
  const b = await at(1); expect(Math.abs(b.c - b.l.x - b.l.width * 0.25)).toBeLessThanOrEqual(1)
  const c = await at(2); expect(Math.abs(c.l.x + c.l.width - c.c - c.l.width * 0.75)).toBeLessThanOrEqual(1)
})

// 水平：四项等宽；start 内容在圆点下、end 在上；alternate 上下交错；导轨水平连接相邻圆点。
test('[timeline.browser.horizontal] horizontal layouts', async ({ page }, info) => {
  const area = await demo(page, info, 'horizontal')
  const [start, end, alt] = [0, 1, 2].map(i => area.locator('ol').nth(i))
  const widths = await start.locator('li').evaluateAll(els => els.map(el => Math.round(el.getBoundingClientRect().width)))
  expect(new Set(widths).size).toBe(1)
  const sDot = await box(part(start.locator('li').first(), 'icon')), sContent = await box(part(start.locator('li').first(), 'content'))
  expect(sContent.y).toBeGreaterThan(sDot.y + sDot.height)
  expect(Math.abs(cx(sContent) - cx(sDot))).toBeLessThanOrEqual(1)
  const rail = await box(part(start.locator('li').first(), 'rail')), next = await box(part(start.locator('li').nth(1), 'icon'))
  expect(rail.height).toBe(2)
  expect(Math.abs(cy(rail) - cy(sDot))).toBeLessThanOrEqual(1)
  expect(rail.x).toBeGreaterThanOrEqual(sDot.x + sDot.width - 0.5)
  expect(rail.x + rail.width).toBeLessThanOrEqual(next.x + 0.5)
  const eDot = await box(part(end.locator('li').first(), 'icon')), eContent = await box(part(end.locator('li').first(), 'content'))
  expect(eContent.y + eContent.height).toBeLessThan(eDot.y)
  const a0 = alt.locator('li').nth(0), a1 = alt.locator('li').nth(1)
  const ad0 = await box(part(a0, 'icon')), ac0 = await box(part(a0, 'content')), ac1 = await box(part(a1, 'content'))
  expect(ac0.y).toBeGreaterThan(ad0.y)
  expect(ac1.y + ac1.height).toBeLessThan(ad0.y)
})

// 语义化与自定义：节点高 100px、导轨虚线、内容半透明；函数 styles 仅作用于纵向；自定义图标 20px 且有背景。
test('[timeline.browser.semantic] semantic styles and custom icon', async ({ page }, info) => {
  const area = await demo(page, info, 'semantic')
  const second = area.locator('li').nth(1)
  expect((await box(second)).height).toBe(100)
  await expect(part(second, 'rail')).toHaveCSS('border-left-style', 'dashed')
  await expect(part(area.locator('li').nth(2), 'content')).toHaveCSS('opacity', '0.45')
  const style = await demo(page, info, 'style-class')
  const [h, v] = [style.locator('ol').nth(0), style.locator('ol').nth(1)]
  await expect(h).toHaveCSS('padding-top', '8px'); await expect(h).toHaveCSS('border-top-width', '0px')
  await expect(v).toHaveCSS('border-top-width', '1px'); await expect(v).toHaveCSS('padding-top', '10px')
  expect(await paintedColor(part(v.locator('li').first(), 'icon'), 'border-top-color')).toBe('rgb(162, 148, 249)')
  expect(await paintedColor(part(h.locator('li').first(), 'icon'), 'border-top-color')).toBe('rgb(24, 144, 255)')
  const custom = await demo(page, info, 'custom')
  const dot = part(custom.locator('li').nth(2), 'icon')
  const icon = dot.locator('[class*="i-mdi-"]')
  await expect(icon).toHaveCSS('font-size', '20px')
  expect(Math.round((await box(icon)).width)).toBe(20)
  // mask 图标靠 background-color: currentColor 上色：必须等于红色文字色，不能被 bg-* 覆盖成底色（否则隐形）。
  const color = await paintedColor(icon, 'color')
  expect(await paintedColor(icon, 'background-color')).toBe(color)
  expect(color).toBe(await paintedColor(dot, 'color'))
  expect(color).not.toBe(await paintedColor(icon.locator('..'), 'background-color'))
  // 遮挡导轨的底色在外层包裹上。
  expect(await paintedColor(icon.locator('..'), 'background-color')).not.toBe('rgba(0, 0, 0, 0)')
})

// 全部时间轴示例：mask 图标元素不得同时带 bg-* 类，且实际绘制色 = 文字色（防止图标隐形）。
test('[timeline.browser.icon-visible] mask icons paint with currentColor', async ({ page }, info) => {
  await demo(page, info, 'basic')
  const root = info.project.name === 'docs' ? page.locator('[data-demo^="timeline/"]') : page.locator('[data-timeline-demo]')
  const icons = root.locator('[data-timeline-part="icon"] [class*="i-mdi-"]')
  expect(await icons.count()).toBeGreaterThan(3)
  const bad = await icons.evaluateAll(els => els.filter(el => {
    const s = getComputedStyle(el)
    return /(^|\s)bg-/.test(el.getAttribute('class') ?? '') || s.backgroundColor !== s.color || s.backgroundColor === 'rgba(0, 0, 0, 0)'
  }).map(el => el.outerHTML))
  expect(bad).toEqual([])
})

// 开发服务器渲染：交替示例点击后仍正常。
test('[timeline.browser.dev] dev rendering', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658/${path}`)
  const area = page.locator('[data-demo="timeline/title"]')
  await area.getByRole('radio', { name: 'Alternate' }).click()
  await expect(area.locator('ol')).toHaveAttribute('data-timeline-alternate', 'true')
})

// API 表与示例容器在原始 HTML 中。
test('[timeline.browser.ssr] API sections are server-rendered', async ({ request }) => {
  const response = await request.get(path); expect(response.status()).toBe(200)
  const html = await response.text()
  for (const text of ['Timeline API', 'Items', 'titleSpan', 'pendingDot', 'data-demo="timeline/horizontal"']) expect(html).toContain(text)
})
