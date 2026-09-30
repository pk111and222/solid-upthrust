import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'

const path = 'components/feedback/notification/'
async function demo(page: Page, info: TestInfo, docsId: string, exampleId: string) {
  const docs = info.project.name === 'docs'
  if (!page.url().includes(docs ? path : '/Notification')) await page.goto(docs ? path : 'Notification')
  const area = page.locator(docs ? `[data-demo="notification/${docsId}"]` : `[data-notification-demo="${exampleId}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  return area
}
const box = (locator: Locator) => locator.evaluate(el => {
  const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }
})
const near = (actual: number, expected: number, tolerance = 1) => expect(Math.abs(actual - expected), `${actual} ≈ ${expected}`).toBeLessThanOrEqual(tolerance)
const live = (page: Page) => page.locator('[data-notification-part="wrapper"]:not([data-notification-closing="true"])')
const isDocs = (info: TestInfo) => info.project.name === 'docs'
// wind4 颜色计算值可能是 oklab，用同类名探针元素归一对比
const probeColor = (page: Page, cls: string) => page.evaluate(c => { const el = document.createElement('i'); el.className = c; document.body.append(el); const v = getComputedStyle(el).color; el.remove(); return v }, cls)
// 入场与堆叠 transform 过渡结束：透明度 1 且位置两帧不变
const settled = async (locator: Locator) => {
  await expect.poll(() => locator.evaluate(el => getComputedStyle(el).opacity)).toBe('1')
  await expect.poll(async () => { const a = await box(locator); await locator.page().waitForTimeout(80); const b = await box(locator); return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) }).toBeLessThan(0.5)
}

// 几何：topRight 距顶 / 右 24px、宽 384、内边距 20 × 24、8px 圆角、有阴影；list z-index 2050；
// 图标 24px 语义色、标题 16px 且左让 36px；关闭按钮 22×22 位于右上 20 / 24。
test('[notification.browser.geometry] antd notice layout', async ({ page }, info) => {
  const area = await demo(page, info, 'with-icon', 'types')
  await area.getByRole('button', { name: 'Success' }).click()
  const wrapper = live(page).first()
  await settled(wrapper)
  const root = wrapper.locator('[data-notification-part="root"]')
  const n = await box(root)
  near(n.y, 24)
  near(page.viewportSize()!.width - (n.x + n.width), 24)
  near(n.width, 384)
  expect(await root.evaluate(el => {
    const s = getComputedStyle(el); return [s.paddingTop, s.paddingLeft, s.borderRadius]
  })).toEqual(['20px', '24px', '8px'])
  expect(await wrapper.evaluate(el => getComputedStyle(el).boxShadow !== 'none')).toBe(true)
  expect(await page.locator('[data-notification-part="list"]').evaluate(el => getComputedStyle(el).zIndex)).toBe('2050')
  const icon = root.locator('[data-notification-part="icon"]')
  const svg = await box(icon.locator('svg'))
  near(svg.width, 24)
  near(svg.x - n.x, 24)
  expect(await icon.evaluate(el => getComputedStyle(el).color)).toBe(await probeColor(page, 'text-[#52c41a]'))
  const title = root.locator('[data-notification-part="title"]')
  expect(await title.evaluate(el => [getComputedStyle(el).fontSize, getComputedStyle(el).lineHeight])).toEqual(['16px', '24px'])
  near((await box(title)).x - n.x, 24 + 36)
  const close = await box(root.locator('[data-notification-part="close"]'))
  near(close.width, 22)
  near(close.height, 22)
  near(close.y - n.y, 20)
  near(n.x + n.width - (close.x + close.width), 24)
  await page.screenshot({ path: info.outputPath('geometry.png'), clip: { x: n.x - 24, y: 0, width: n.width + 48, height: n.height + 48 } })
})

// stack：同角落 4 条时折叠（第二张露出 8px、宽度收窄），悬停展开且间距 16px；移开后重新折叠。
test('[notification.browser.stack] collapse beyond threshold and expand on hover', async ({ page }, info) => {
  const area = await demo(page, info, 'with-icon', 'types')
  for (const name of ['Success', 'Info', 'Warning', 'Error']) await area.getByRole('button', { name }).click()
  await expect(live(page)).toHaveCount(4)
  const list = page.locator('[data-notification-part="list"][data-notification-placement="topRight"]')
  await expect(list).toHaveAttribute('data-notification-stack', 'collapsed')
  const newest = live(page).nth(3)
  const second = live(page).nth(2)
  await settled(newest)
  await settled(second)
  const a = await box(newest)
  const b = await box(second)
  near(a.y, 24)
  near(b.y + b.height - (a.y + a.height), 8)
  near(b.width, 384 - 16)
  await page.screenshot({ path: info.outputPath('stack-collapsed.png'), clip: { x: a.x - 24, y: 0, width: a.width + 48, height: a.height + 80 } })
  await newest.hover()
  await expect(list).toHaveAttribute('data-notification-stack', 'expanded')
  await settled(second)
  const a2 = await box(newest)
  const b2 = await box(second)
  near(b2.y - (a2.y + a2.height), 16)
  near(b2.width, 384)
  await page.screenshot({ path: info.outputPath('stack-expanded.png'), clip: { x: a2.x - 24, y: 0, width: a2.width + 48, height: Math.min(720, b2.y + b2.height + 200) } })
  await page.mouse.move(5, 700)
  await expect(list).toHaveAttribute('data-notification-stack', 'collapsed')
})

// 进度条：显示剩余时间（递减）、悬停冻结、移开后继续并自动关闭。
test('[notification.browser.progress] progress bar pauses on hover', async ({ page }, info) => {
  const area = await demo(page, info, 'show-progress', 'progress')
  await area.getByRole('button', { name: '悬停暂停', exact: true }).click()
  const wrapper = live(page).first()
  const bar = wrapper.locator('[data-notification-part="progress"]')
  await expect(bar).toBeVisible()
  const bb = await box(bar)
  const rb = await box(wrapper)
  near(bb.height, 2)
  near(bb.x - rb.x, 8)
  await expect.poll(async () => Number(await bar.getAttribute('aria-valuenow'))).toBeLessThan(90)
  await wrapper.hover()
  const frozen = Number(await bar.getAttribute('aria-valuenow'))
  await page.waitForTimeout(1200)
  near(Number(await bar.getAttribute('aria-valuenow')), frozen, 2)
  await expect(live(page)).toHaveCount(1)
  await page.mouse.move(5, 700)
  await expect(live(page)).toHaveCount(0, { timeout: 6000 })
})

// 同 key 更新：原地更新标题，只有一个节点。
test('[notification.browser.update] same key updates in place', async ({ page }, info) => {
  const area = await demo(page, info, 'update', 'update')
  await area.getByRole('button', { name: isDocs(info) ? '打开可更新的通知' : '打开并稍后更新' }).click()
  const title = live(page).first().locator('[data-notification-part="title"]')
  await expect(title).toHaveText(isDocs(info) ? '通知标题' : '正在处理…')
  await expect(title).toHaveText(isDocs(info) ? '新标题' : '处理完成', { timeout: 3000 })
  await expect(page.locator('[data-notification-part="wrapper"]')).toHaveCount(1)
})

// 方位：bottomLeft 距底 / 左 24px；关闭按钮点击后移除。
test('[notification.browser.placement] bottomLeft offsets and close', async ({ page }, info) => {
  const area = await demo(page, info, 'placement', 'placement')
  await area.getByRole('button', { name: 'bottomLeft' }).click()
  const wrapper = live(page).first()
  await settled(wrapper)
  const n = await box(wrapper)
  near(n.x, 24)
  near(page.viewportSize()!.height - (n.y + n.height), 24)
  await wrapper.locator('[data-notification-part="close"]').click()
  await expect(page.locator('[data-notification-part="wrapper"]')).toHaveCount(0, { timeout: 2000 })
})

// 语义化 styles：函数形式按 type 作用到 root 与 title。
test('[notification.browser.semantic] function styles', async ({ page }, info) => {
  const area = await demo(page, info, 'style-class', 'semantic')
  await area.getByRole('button', { name: isDocs(info) ? '函数样式' : '函数 styles' }).click()
  const wrapper = live(page).first()
  await settled(wrapper)
  const root = wrapper.locator('[data-notification-part="root"]')
  expect(await root.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(255, 242, 240)')
  expect(await root.locator('[data-notification-part="title"]').evaluate(el => getComputedStyle(el).color)).toBe('rgb(207, 19, 34)')
  const n = await box(root)
  await page.screenshot({ path: info.outputPath('semantic.png'), clip: { x: n.x - 24, y: 0, width: n.width + 48, height: n.height + 48 } })
})
