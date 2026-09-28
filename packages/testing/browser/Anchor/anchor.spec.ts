import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'

const path = 'components/navigation/anchor/'
async function demo(page: Page, info: TestInfo, name: string) {
  if (!page.url().includes(info.project.name === 'docs' ? path : '/Anchor')) await page.goto(info.project.name === 'docs' ? path : 'Anchor')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="anchor/${name}"]` : `[data-anchor-demo="${name}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  await expect(area.locator('a[data-anchor-key]').first()).toBeVisible()
  return area
}
type Box = { x: number; y: number; width: number; height: number; right: number; bottom: number }
/** DOMRect 字段在原型上，跨进程须先拷成普通对象。 */
const box = (locator: Locator): Promise<Box> => locator.evaluate(el => {
  const r = el.getBoundingClientRect()
  return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }
})
const link = (area: Locator, key: string) => area.locator(`a[data-anchor-key="${key}"]`)
const ink = (area: Locator) => area.locator('[data-anchor-ink]')
const docsOnly = (info: TestInfo) => test.skip(info.project.name !== 'docs', '以窗口为滚动容器的示例只在文档站验证（example 的滚动容器是 [data-appid=content]）')

// 自定义滚动容器：点击链接平滑滚动容器、立即高亮且过程中不闪烁；ink 2px 贴左轨道并与激活标题同高；随后手动滚动恢复 scroll-spy。
test('[anchor.browser.container] click scroll, settle and scroll-spy', async ({ page }, info) => {
  const area = await demo(page, info, 'container')
  const scroller = area.locator('[data-anchor-scroller]')
  const seen = new Set<string>()
  await link(area, 'part-3').click()
  // 平滑滚动期间轮询：高亮始终是 part-3。
  for (let i = 0; i < 8; i++) {
    seen.add((await area.locator('a[aria-current="location"]').getAttribute('data-anchor-key')) ?? '')
    await page.waitForTimeout(40)
  }
  expect([...seen]).toEqual(['part-3'])
  await expect.poll(async () => {
    const [s, target] = await Promise.all([box(scroller), box(scroller.locator('#anchor-container-part-3'))])
    return Math.round(target.y - s.y)
  }).toBeLessThanOrEqual(20)
  const [inkBox, titleBox] = await Promise.all([box(ink(area)), box(link(area, 'part-3'))])
  expect(inkBox.width).toBeCloseTo(2, 0)
  await expect.poll(async () => Math.abs((await box(ink(area))).y - titleBox.y)).toBeLessThan(1)
  expect(Math.abs(inkBox.height - titleBox.height)).toBeLessThan(1)
  // 容器滚回 part-1 顶部（容器有 1px 边框 + 16px 内边距，与 antd 一致：section 顶边越过 targetOffset + bounds 才算激活）：scroll-spy 恢复，高亮回到 part-1。
  await page.waitForTimeout(200)
  await scroller.evaluate(el => { el.scrollTop = 20 })
  await expect(link(area, 'part-1')).toHaveAttribute('aria-current', 'location')
  await area.screenshot({ path: info.outputPath('container.png') })
})

// 视觉：左侧 2px 轨道贯穿列表；链接左内边距 16px；激活标题为 primary 色，其余为正文色。
test('[anchor.browser.visual] rail, padding and active color', async ({ page }, info) => {
  const area = await demo(page, info, 'container')
  const list = area.locator('[data-anchor-direction="vertical"]')
  const rail = await list.evaluate(el => { const s = getComputedStyle(el, '::before'); return { width: s.width, position: s.position, bg: s.backgroundColor } })
  expect(rail.width).toBe('2px'); expect(rail.position).toBe('absolute'); expect(rail.bg).not.toBe('rgba(0, 0, 0, 0)')
  await expect(link(area, 'part-1').locator('..')).toHaveCSS('padding-left', '16px')
  await link(area, 'part-2').click()
  await expect.poll(() => link(area, 'part-2').evaluate(el => getComputedStyle(el).color))
    .not.toBe(await link(area, 'part-1').evaluate(el => getComputedStyle(el).color))
  // 链接自身不再有左边框（旧实现的双重指示条）。
  await expect(link(area, 'part-2')).toHaveCSS('border-left-width', '0px')
})

// 静态位置：affix={false} 且未开 showInkInFixed 时 vertical 不显示 ink；嵌套链接在父链接内再缩进 16px。
test('[anchor.browser.static] no ink when not affixed, nested indent', async ({ page }, info) => {
  const area = await demo(page, info, 'static')
  await expect(ink(area)).toBeHidden()
  const [parent, child] = await Promise.all([box(link(area, 'nested')), box(link(area, 'nested-a'))])
  expect(Math.round(child.x - parent.x)).toBe(16)
})

// onClick：回调收到 title / href；示例里 preventDefault 后地址栏 hash 不变。
test('[anchor.browser.onClick] callback and preventDefault keeps the url', async ({ page }, info) => {
  const area = await demo(page, info, 'on-click')
  const before = page.url()
  await link(area, 'part-2').click()
  await expect(area.locator('output')).toContainText('Part 2 → #anchor-basic-part-2')
  expect(page.url()).toBe(before)
})

// replace：点击写入 hash 但不新增历史记录（history.length 不变）。
test('[anchor.browser.replace] replaceState keeps history length', async ({ page }, info) => {
  const area = await demo(page, info, 'replace')
  const length = await page.evaluate(() => history.length)
  await link(area, 'part-3').click()
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#anchor-basic-part-3')
  expect(await page.evaluate(() => history.length)).toBe(length)
})

// 自定义高亮：getCurrentAnchor 固定高亮按钮选择的链接，与滚动位置无关。
test('[anchor.browser.customHighlight] pinned by getCurrentAnchor', async ({ page }, info) => {
  const area = await demo(page, info, 'custom-highlight')
  await expect(link(area, 'part-3')).toHaveAttribute('aria-current', 'location')
  await area.getByRole('button', { name: '高亮 Part 1' }).click()
  await expect(link(area, 'part-1')).toHaveAttribute('aria-current', 'location')
  await expect(ink(area)).toBeVisible()
})

// 窗口容器（文档站）：默认 affix 固定在顶部 80px；页面滚动 scroll-spy 高亮跟随，且 onChange 收到 href。
test('[anchor.browser.window] affix and window scroll-spy', async ({ page }, info) => {
  docsOnly(info)
  const area = await demo(page, info, 'basic')
  const section = page.locator('#anchor-basic-part-2')
  await section.evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60 }))
  await expect(link(area, 'part-2')).toHaveAttribute('aria-current', 'location')
  await expect.poll(async () => Math.round((await box(link(area, 'part-1'))).y)).toBeGreaterThanOrEqual(80)
  // onChange 示例未设 offsetTop（targetOffset 0）：把 part-2 顶边滚到窗口顶部才切换。
  await section.evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY }))
  const changes = page.locator('[data-demo="anchor/on-change"] output')
  await expect.poll(async () => (await changes.getAttribute('data-log')) ?? '').toContain('#anchor-basic-part-2')
  await area.screenshot({ path: info.outputPath('window.png') })
})

// 横向（文档站）：ink 贴底 2px，left / width 跟随激活标题；点击后高亮切换。
test('[anchor.browser.horizontal] bottom ink follows the active title', async ({ page }, info) => {
  docsOnly(info)
  const area = await demo(page, info, 'horizontal')
  await link(area, 'part-2').click()
  await expect(link(area, 'part-2')).toHaveAttribute('aria-current', 'location')
  await expect.poll(async () => {
    const [i, t] = await Promise.all([box(ink(area)), box(link(area, 'part-2'))])
    return Math.abs(i.x - t.x) + Math.abs(i.width - t.width)
  }).toBeLessThan(1)
  expect((await box(ink(area))).height).toBeCloseTo(2, 0)
})

// 静态 HTML 含 API 与契约文字（示例只在客户端渲染）。
test('[anchor.browser.ssr] API contracts in static html', async ({ request }, info) => {
  docsOnly(info)
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  for (const text of ['getCurrentAnchor', 'showInkInFixed', 'replaceState', 'getScrollContainer', 'ANCHOR_SCROLL_SETTLE', 'anchor/container']) expect(html).toContain(text)
})
