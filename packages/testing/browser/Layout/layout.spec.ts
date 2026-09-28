import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'

const path = 'components/layout/layout/'
async function demo(page: Page, info: TestInfo, id: string) {
  await page.goto(info.project.name === 'docs' ? path : 'Layout')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="layout/${id}"]` : `[data-layout-demo="${id}"]`)
  await expect(area.locator('.upthrust-layout').first()).toBeAttached()
  return area
}
type Rect = { x: number; y: number; w: number; h: number; right: number; bottom: number }
/** DOMRect 的字段是原型上的 getter，跨进程序列化会丢失，必须先拷成普通对象。 */
const rect = (target: Locator) => target.evaluate((el): Rect => {
  const r = el.getBoundingClientRect()
  return { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom }
})
const width = async (target: Locator) => (await rect(target)).w
const near = (actual: number, expected: number, tolerance = 0.6) => expect(Math.abs(actual - expected), `${actual} ≈ ${expected}`).toBeLessThan(tolerance)
/** Sider 宽度带 0.2s 过渡，轮询到目标值。 */
const expectWidth = (target: Locator, expected: number) => expect.poll(() => width(target)).toBeCloseTo(expected, 0)
const direction = (target: Locator) => target.evaluate(el => getComputedStyle(el).flexDirection)
const trigger = (sider: Locator) => sider.locator('[aria-label="切换侧边栏"]')
const noPageOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

// 基本结构：无 Sider 时纵向；含 Sider 的那一层自动横向（只影响最近一层）；Header 64px；百分比 width 按父 Layout 计算。
test('[layout.browser.structure] auto direction, region sizes and percentage width', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const top = area.locator('[data-case="top"]')
  expect(await direction(top)).toBe('column')
  near((await rect(top.locator('header'))).h, 64)
  expect(await top.evaluate(el => [...el.children].map(child => child.tagName))).toEqual(['HEADER', 'MAIN', 'FOOTER'])

  for (const name of ['sider-left', 'sider-right']) {
    const root = area.locator(`[data-case="${name}"]`)
    const inner = root.locator(':scope > .upthrust-layout')
    // 外层只有 Header/Layout/Footer，保持纵向；内层含 Sider 变为横向。
    expect(await direction(root)).toBe('column')
    expect(await direction(inner)).toBe('row')
    const [siderBox, innerBox, contentBox] = await Promise.all([rect(inner.locator('aside')), rect(inner), rect(inner.locator('main'))])
    near(siderBox.w, innerBox.w * 0.25, 1)
    near(siderBox.w + contentBox.w, innerBox.w, 1)
    // Sider 与 Content 等高（align-items: stretch）。
    near(siderBox.h, contentBox.h)
  }
  // 右侧 Sider 贴右边缘；左侧 Sider 贴左边缘。
  const left = area.locator('[data-case="sider-left"] > .upthrust-layout')
  near((await rect(left.locator('aside'))).x, (await rect(left)).x)
  const right = area.locator('[data-case="sider-right"] > .upthrust-layout')
  near((await rect(right.locator('aside'))).right, (await rect(right)).right)

  const full = area.locator('[data-case="sider-full"]')
  expect(await direction(full)).toBe('row')
  // 整列 Sider 与右侧整个内层 Layout 等高。
  near((await rect(full.locator(':scope > aside'))).h, (await rect(full.locator(':scope > .upthrust-layout'))).h)
  await area.screenshot({ path: info.outputPath('basic.png') })
})

// 顶部-侧边：外层纵向，内容区中的内层 Layout 横向；浅色 Sider 180px 且背景为不透明浅色。
test('[layout.browser.topSide] nested light sider inside content', async ({ page }, info) => {
  const area = await demo(page, info, 'top-side')
  const root = area.locator('[data-layout-top-side]')
  expect(await direction(root)).toBe('column')
  const inner = area.locator('[data-case="inner"]')
  expect(await direction(inner)).toBe('row')
  await expect(inner.locator('aside')).toHaveCSS('width', '180px')
  const bg = await inner.locator('aside').evaluate(el => getComputedStyle(el).backgroundColor)
  expect(bg).not.toBe('rgba(0, 0, 0, 0)')
  // 浅色主题的 Sider 与 Header 同为 surface 底色。
  expect(bg).toBe(await root.locator(':scope > header').evaluate(el => getComputedStyle(el).backgroundColor))
  await area.screenshot({ path: info.outputPath('top-side.png') })
})

// 可收起：点击触发器 200→80，菜单文字隐藏、箭头翻转、aria-expanded 同步，内容区随之变宽；键盘 Enter / 空格同样切换。
test('[layout.browser.collapse] click and keyboard toggle', async ({ page }, info) => {
  const area = await demo(page, info, 'side')
  const sider = area.locator('aside')
  const content = area.locator('main')
  const button = trigger(sider)
  await expect(sider).toHaveCSS('width', '200px')
  await expect(button).toHaveAttribute('aria-expanded', 'true')
  near((await rect(button)).h, 48)
  // 触发器贴在 Sider 底部，与 Sider 同宽。
  const [siderBox, buttonBox] = await Promise.all([rect(sider), rect(button)])
  near(buttonBox.bottom, siderBox.bottom)
  near(buttonBox.w, siderBox.w)
  await expect(button.locator('.i-mdi-chevron-left')).toBeAttached()
  const before = await width(content)

  await button.click()
  await expectWidth(sider, 80)
  await expect(button).toHaveAttribute('aria-expanded', 'false')
  await expect(button.locator('.i-mdi-chevron-right')).toBeAttached()
  // SiderContext 联动：Menu 跟随收起，宽 80px，文字区宽度收为 0。
  await expectWidth(sider.getByRole('menu').first(), 80)
  await expect.poll(() => width(sider.getByRole('menuitem', { name: '仪表盘' }).locator('span').last())).toBeLessThan(1)
  near(await width(content), before + 120, 1)
  await area.screenshot({ path: info.outputPath('side-collapsed.png') })

  await button.focus()
  await page.keyboard.press('Enter')
  await expectWidth(sider, 200)
  await expect(button).toHaveAttribute('aria-expanded', 'true')
  // 空格切换且不滚动页面（默认行为已阻止）。
  const scrollY = await page.evaluate(() => window.scrollY)
  await page.keyboard.press(' ')
  await expectWidth(sider, 80)
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollY)
})

// 自定义触发器：trigger={null} 时 Sider 内无触发器，顶栏按钮驱动受控 collapsed；传 JSX 时替换内容但保留切换行为。
test('[layout.browser.customTrigger] null trigger and custom content', async ({ page }, info) => {
  const area = await demo(page, info, 'custom-trigger')
  const first = area.locator('[data-case="header-button"]')
  const sider = first.locator('aside')
  await expect(trigger(sider)).toHaveCount(0)
  await first.locator('[data-toggle]').click()
  await expectWidth(sider, 80)
  await expect(first.locator('main')).toContainText('已收起')
  await first.locator('[data-toggle]').click()
  await expectWidth(sider, 200)

  const second = area.locator('[data-case="custom-content"]')
  const custom = trigger(second.locator('aside'))
  await expect(custom).toHaveText('收起 / 展开')
  await expect(custom.locator('[class*="i-mdi-chevron"]')).toHaveCount(0)
  await custom.click()
  await expectWidth(second.locator('aside'), 80)
  await area.screenshot({ path: info.outputPath('custom-trigger.png') })
})

// 固定侧边栏：定高布局中菜单超出时 Sider 内容区自身滚动，触发器始终贴底可见，滚到底时最后一项不被遮挡；右侧内容区独立滚动。
test('[layout.browser.fixedSider] sticky trigger never covers the menu', async ({ page }, info) => {
  const area = await demo(page, info, 'fixed-sider')
  const root = area.locator('[data-layout-fixed-sider]')
  near((await rect(root)).h, 360)
  const sider = root.locator('aside')
  const body = sider.locator(':scope > div').first()
  const button = trigger(sider)
  expect(await body.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true)
  near((await rect(sider)).h, 360)
  near((await rect(button)).bottom, (await rect(sider)).bottom)
  await body.evaluate(el => { el.scrollTop = el.scrollHeight })
  const last = body.locator('li').last()
  const [lastBox, bodyBox] = await Promise.all([rect(last), rect(body)])
  expect(lastBox.bottom).toBeLessThanOrEqual((await rect(button)).y + 0.5)
  // 最后一项完整落在 Sider 内容区的可视范围内。
  expect(lastBox.bottom).toBeLessThanOrEqual(bodyBox.bottom + 0.5)
  expect(lastBox.y).toBeGreaterThanOrEqual(bodyBox.y - 0.5)

  const scroll = root.locator('[data-scroll]')
  expect(await scroll.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true)
  // Footer 在定高布局中仍然可见（内容区 min-h-0 允许收缩）。
  expect((await rect(root.locator('footer'))).bottom).toBeLessThanOrEqual((await rect(root)).bottom + 0.5)
  await area.screenshot({ path: info.outputPath('fixed-sider.png') })
})

// 固定头部：滚动容器滚动后 sticky Header 仍贴在容器顶部。
test('[layout.browser.fixedHeader] sticky header', async ({ page }, info) => {
  const area = await demo(page, info, 'fixed-header')
  const scroller = area.locator('[data-layout-fixed-header]')
  await scroller.evaluate(el => { el.scrollTop = 400 })
  const [box, header] = await Promise.all([rect(scroller), rect(scroller.locator('header'))])
  // 容器有 1px 边框。
  near(header.y, box.y + 1, 1)
  await area.screenshot({ path: info.outputPath('fixed-header.png') })
})

// 主题：dark 与 light 底色不同，触发器底色与 Sider 一致（不透明），切换后同步。
test('[layout.browser.theme] dark and light schemes', async ({ page }, info) => {
  const area = await demo(page, info, 'theme')
  const sider = area.locator('aside')
  const colors = () => Promise.all([sider, trigger(sider)].map(node => node.evaluate(el => getComputedStyle(el).backgroundColor)))
  const [dark, darkTrigger] = await colors()
  expect(darkTrigger).toBe(dark)
  expect(dark).not.toBe('rgba(0, 0, 0, 0)')
  await area.getByRole('radio', { name: '浅色 light' }).click({ force: true })
  // 两者都有颜色过渡，轮询到过渡结束、触发器与 Sider 同色。
  await expect.poll(async () => { const [root, tab] = await colors(); return root !== dark && root === tab }).toBe(true)
  const [light] = await colors()
  expect(light).not.toBe('rgba(0, 0, 0, 0)')
  await expect(sider).toHaveCSS('border-right-width', '1px')
  await area.screenshot({ path: info.outputPath('theme.png') })
})

// 右侧边栏：reverseArrow 翻转箭头；零宽模式下外挂触发器在 Sider 左侧 40px、距顶 64px，收起后仍可点开，内容设为 inert。
test('[layout.browser.reverseArrow] right sider and left zero trigger', async ({ page }, info) => {
  const area = await demo(page, info, 'reverse-arrow')
  const right = area.locator('[data-case="right"]')
  const sider = right.locator(':scope > aside')
  near((await rect(sider)).right, (await rect(right)).right - 0, 1.5)
  await expect(trigger(sider).locator('.i-mdi-chevron-right')).toBeAttached()
  await trigger(sider).click()
  await expectWidth(sider, 80)
  await expect(trigger(sider).locator('.i-mdi-chevron-left')).toBeAttached()
  // 收起后 Sider 仍贴右边缘。
  near((await rect(sider)).right, (await rect(right)).right, 1.5)

  const zero = area.locator('[data-case="right-zero"] aside')
  const tab = trigger(zero)
  let [box, tabBox] = await Promise.all([rect(zero), rect(tab)])
  near(tabBox.right, box.x)
  near(tabBox.y - box.y, 64)
  near(tabBox.w, 40)
  await tab.click()
  await expectWidth(zero, 0)
  await expect(zero.locator(':scope > div').first()).toHaveAttribute('inert', '')
  ;[box, tabBox] = await Promise.all([rect(zero), rect(tab)])
  near(tabBox.right, box.x)
  await expect(tab).toBeInViewport()
  await area.screenshot({ path: info.outputPath('reverse-arrow.png') })
  await tab.click()
  await expectWidth(zero, 200)
  await expect(zero.locator(':scope > div').first()).not.toHaveAttribute('inert', '')
})

// 内容溢出：超宽表格只在内容区内部滚动，Sider 保持 160px，布局不撑破容器，页面无横向滚动。
test('[layout.browser.overflow] wide content scrolls inside Content', async ({ page }, info) => {
  const area = await demo(page, info, 'overflow')
  const root = area.locator('[data-layout-overflow]')
  await expect(root.locator('aside')).toHaveCSS('width', '160px')
  const scroll = root.locator('[data-scroll]')
  expect(await scroll.evaluate(el => el.scrollWidth > el.clientWidth + 100)).toBe(true)
  const [rootBox, areaBox, main] = await Promise.all([rect(root), rect(area), rect(root.locator('main'))])
  expect(rootBox.right).toBeLessThanOrEqual(areaBox.right + 0.5)
  near(main.right, rootBox.right - 1, 1)
  expect(await noPageOverflow(page)).toBeLessThanOrEqual(0)
  await area.screenshot({ path: info.outputPath('overflow.png') })
})

// 宽屏：未低于 lg 断点，Sider 200px、非 collapsible 不渲染零宽触发器，只回调一次 onBreakpoint(false)。
test('[layout.browser.responsiveWide] desktop keeps the sider open', async ({ page }, info) => {
  await page.setViewportSize({ width: 1300, height: 900 })
  const area = await demo(page, info, 'responsive')
  const sider = area.locator('aside')
  await expect(sider).toHaveCSS('width', '200px')
  await expect(trigger(sider)).toHaveCount(0)
  await expect(area.locator('[data-log] li')).toHaveText(['onBreakpoint(false)'])
})

// 窄屏：低于 lg 挂载即收起到 0，回调 onBreakpoint(true) + onCollapse(true, 'responsive')；零宽触发器挂在右外沿，
// 点击展开为 'clickTrigger'；视口放宽后 broken 复位且（已展开）不重复回调 onCollapse；再收窄重新响应式收起。
test('[layout.browser.responsive] breakpoint collapse and zero-width trigger', async ({ page }, info) => {
  await page.setViewportSize({ width: 820, height: 900 })
  const area = await demo(page, info, 'responsive')
  const sider = area.locator('aside')
  const log = area.locator('[data-log] li')
  await expectWidth(sider, 0)
  await expect(log).toHaveText(["onCollapse(true, 'responsive')", 'onBreakpoint(true)'])
  const tab = trigger(sider)
  await expect(tab).toHaveAttribute('aria-expanded', 'false')
  let [box, tabBox] = await Promise.all([rect(sider), rect(tab)])
  near(tabBox.x, box.right)
  near(tabBox.y - box.y, 64)
  near(tabBox.h, 40)
  await area.screenshot({ path: info.outputPath('responsive-collapsed.png') })

  await tab.click()
  await expectWidth(sider, 200)
  await expect(log.first()).toHaveText("onCollapse(false, 'clickTrigger')")
  ;[box, tabBox] = await Promise.all([rect(sider), rect(tab)])
  near(tabBox.x, box.right)

  await page.setViewportSize({ width: 1300, height: 900 })
  await expect(log.first()).toHaveText('onBreakpoint(false)')
  await expect(log).toHaveCount(4)
  // 不再低于断点，非 collapsible 的零宽触发器随之消失。
  await expect(tab).toHaveCount(0)

  await page.setViewportSize({ width: 820, height: 900 })
  await expect(log.nth(0)).toHaveText("onCollapse(true, 'responsive')")
  await expect(log.nth(1)).toHaveText('onBreakpoint(true)')
  await expectWidth(sider, 0)
})

// 手机宽度：页面不横向溢出；溢出示例仍在内容区内部滚动；响应式示例收起为 0。
test('[layout.browser.mobile] no horizontal overflow on phones', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const area = await demo(page, info, 'overflow')
  expect(await noPageOverflow(page)).toBeLessThanOrEqual(0)
  await expect(area.locator('aside')).toHaveCSS('width', '160px')
  expect(await area.locator('[data-scroll]').evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true)
  await expectWidth(page.locator('[data-demo="layout/responsive"] aside'), 0)
  await area.screenshot({ path: info.outputPath('mobile.png') })
})

// 开发模式（未经构建）：子选择器 w-0、Sider 内联宽度与 48px 触发器样式都生效。
test('[layout.browser.dev] development styles resolve', async ({ page }) => {
  await page.setViewportSize({ width: 1300, height: 900 })
  await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE ?? '/'}${path}`)
  const side = page.locator('[data-demo="layout/side"] aside')
  await expect(side).toHaveCSS('width', '200px')
  await expect(trigger(side)).toHaveCSS('height', '48px')
  await expect(trigger(side)).toHaveCSS('position', 'sticky')
  await expect(page.locator('[data-demo="layout/overflow"] main')).toHaveCSS('flex-basis', 'auto')
  expect(await page.locator('[data-demo="layout/overflow"] [data-scroll]').evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true)
  await expect(page.locator('[data-demo="layout/basic"] [data-case="top"] header')).toHaveCSS('height', '64px')
})

// 原始静态 HTML 含 API、注意事项与示例源码（文档站示例本身在客户端渲染，静态 HTML 只断言文字与源码）。
test('[layout.browser.ssr] API contracts and source', async ({ request }) => {
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  for (const text of ['collapsedWidth', 'zeroWidthTriggerStyle', 'clickTrigger', 'responsive', '1919.98', 'hasSider 自动判断', 'inert', 'layout/overflow', 'data-layout-overflow', 'reverseArrow']) expect(html).toContain(text)
})
