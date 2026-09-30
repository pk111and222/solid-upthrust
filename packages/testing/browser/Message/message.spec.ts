import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'

const path = 'components/feedback/message/'
async function demo(page: Page, info: TestInfo, docsId: string, exampleId: string) {
  const docs = info.project.name === 'docs'
  if (!page.url().includes(docs ? path : '/Message')) await page.goto(docs ? path : 'Message')
  const area = page.locator(docs ? `[data-demo="message/${docsId}"]` : `[data-message-demo="${exampleId}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  return area
}
const box = (locator: Locator) => locator.evaluate(el => {
  const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }
})
const near = (actual: number, expected: number, tolerance = 1) => expect(Math.abs(actual - expected), `${actual} ≈ ${expected}`).toBeLessThanOrEqual(tolerance)
const live = (page: Page) => page.locator('[data-message-part="root"]:not([data-message-closing])')
// wind4 颜色计算值可能是 oklab，用同类名探针元素归一对比
const probeColor = (page: Page, cls: string) => page.evaluate(c => { const el = document.createElement('i'); el.className = c; document.body.append(el); const v = getComputedStyle(el).color; el.remove(); return v }, cls)

// 几何：notice 距顶 8px、水平居中、9px × 12px 内边距、8px 圆角、有阴影、宽度随内容；图标 16px 语义色、与文字间距 8px；
// 列表 z-index 2010；两条 notice 之间 16px。
test('[message.browser.geometry] antd notice layout and stack gap', async ({ page }, info) => {
  const area = await demo(page, info, 'other', 'types')
  await area.getByRole('button', { name: 'Success' }).click()
  await area.getByRole('button', { name: 'Error' }).click()
  await expect(live(page)).toHaveCount(2)
  const first = live(page).first()
  await expect.poll(() => first.evaluate(el => [getComputedStyle(el).opacity, getComputedStyle(el).transform])).toEqual(['1', 'none'])
  const n = await box(first)
  near(n.y, 8)
  near(n.x + n.width / 2, page.viewportSize()!.width / 2, 1)
  near(n.height, 40)
  expect(await first.evaluate(el => {
    const s = getComputedStyle(el); return [s.paddingTop, s.paddingLeft, s.borderRadius, s.boxShadow !== 'none', s.fontSize]
  })).toEqual(['9px', '12px', '8px', true, '14px'])
  expect(await page.locator('[data-message-part="list"]').evaluate(el => getComputedStyle(el).zIndex)).toBe('2010')
  const icon = first.locator('[data-message-part="icon"]')
  const svg = await box(icon.locator('svg'))
  near(svg.width, 16)
  expect(await icon.evaluate(el => getComputedStyle(el).color)).toBe(await probeColor(page, 'text-[#52c41a]'))
  const title = await box(first.locator('[data-message-part="title"]'))
  near(title.x - (svg.x + svg.width), 8)
  near(svg.y + svg.height / 2, title.y + title.height / 2, 1)
  const second = live(page).nth(1)
  await expect.poll(() => second.evaluate(el => getComputedStyle(el).opacity)).toBe('1')
  near((await box(second)).y - (n.y + n.height), 16)
  expect(await second.locator('[data-message-part="icon"]').evaluate(el => getComputedStyle(el).color)).toBe(await probeColor(page, 'text-error'))
  await page.screenshot({ path: info.outputPath('geometry.png'), clip: { x: n.x - 24, y: 0, width: n.width + 48, height: 120 } })
})

// 默认 3 秒自动关闭，关闭后行收起、节点移除；下方 notice 平滑补位到顶部。
test('[message.browser.duration] auto close after 3s and the stack collapses', async ({ page }, info) => {
  const area = await demo(page, info, 'other', 'types')
  await area.getByRole('button', { name: 'Success' }).click()
  await page.waitForTimeout(1000)
  await area.getByRole('button', { name: 'Warning' }).click()
  await expect(live(page)).toHaveCount(2)
  const start = Date.now()
  await expect(live(page)).toHaveCount(1, { timeout: 5000 })
  expect(Date.now() - start).toBeGreaterThan(1500)
  await expect(page.locator('[data-message-part="root"]')).toHaveCount(1, { timeout: 2000 })
  await expect.poll(async () => (await box(live(page).first())).y).toBeLessThan(9)
})

// loading：LoadingOutlined 旋转、主色；返回值调用后关闭（2.5 秒）。
test('[message.browser.loading] spinning icon and callable close', async ({ page }, info) => {
  const area = await demo(page, info, 'loading', 'loading')
  await area.getByRole('button', { name: '显示加载中' }).click()
  const notice = live(page).first()
  await expect(notice).toBeVisible()
  const icon = notice.locator('[data-message-part="icon"]')
  expect(await icon.evaluate(el => getComputedStyle(el).color)).toBe(await probeColor(page, 'text-primary'))
  expect(await icon.locator('[aria-label="loading"]').evaluate(el => getComputedStyle(el).animationName)).not.toBe('none')
  await expect(live(page)).toHaveCount(0, { timeout: 4000 })
})

// 同 key 更新：loading 原地变为 success，只有一个节点，不重新入场；2 秒后关闭。
test('[message.browser.update] same key updates in place', async ({ page }, info) => {
  const area = await demo(page, info, 'update', 'loading')
  await area.getByRole('button', { name: info.project.name === 'docs' ? '打开可更新的消息' : '同 key 更新' }).click()
  await expect(live(page).first()).toHaveAttribute('data-message-type', 'loading')
  await expect(live(page).first()).toHaveAttribute('data-message-type', 'success', { timeout: 3000 })
  await expect(page.locator('[data-message-part="root"]')).toHaveCount(1)
  expect(await live(page).first().evaluate(el => getComputedStyle(el).opacity)).toBe('1')
  await expect(live(page)).toHaveCount(0, { timeout: 4000 })
})

// 悬停暂停（example）：duration 2 的消息悬停期间不关闭；pauseOnHover=false 悬停照常关闭。
test('[message.browser.pause] hover pauses the countdown', async ({ page }, info) => {
  test.skip(info.project.name === 'docs', 'docs 示例未单列 pauseOnHover，在 example 覆盖')
  const area = await demo(page, info, '', 'duration')
  await area.getByRole('button', { name: '悬停暂停', exact: true }).click()
  const notice = live(page).first()
  await expect(notice).toBeVisible()
  await notice.hover()
  await page.waitForTimeout(3000)
  await expect(live(page)).toHaveCount(1)
  await page.mouse.move(5, 400)
  await expect(live(page)).toHaveCount(0, { timeout: 3000 })
  await area.getByRole('button', { name: '悬停不暂停' }).click()
  await live(page).first().hover()
  await expect(live(page)).toHaveCount(0, { timeout: 3500 })
})

// 语义化 styles：对象 / 函数形式分别作用到 root、icon、title。
test('[message.browser.semantic] object and function styles', async ({ page }, info) => {
  const area = await demo(page, info, 'style-class', 'style')
  await area.getByRole('button', { name: info.project.name === 'docs' ? '函数样式' : '函数 styles' }).click()
  const notice = live(page).first()
  await expect(notice).toBeVisible()
  // toBeVisible 不看 opacity：等入场动画结束再量和截图
  await expect.poll(() => notice.evaluate(el => [getComputedStyle(el).opacity, getComputedStyle(el).transform])).toEqual(['1', 'none'])
  expect(await notice.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(255, 242, 240)')
  expect(await notice.locator('[data-message-part="title"]').evaluate(el => getComputedStyle(el).color)).toBe('rgb(207, 19, 34)')
  const n = await box(notice)
  await page.screenshot({ path: info.outputPath('semantic.png'), clip: { x: n.x - 24, y: 0, width: n.width + 48, height: 80 } })
})
