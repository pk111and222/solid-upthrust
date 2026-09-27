import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'
import { paintedColor } from '../../utils/color-browser'
const path = 'components/data-display/badge/'
async function demo(page: Page, info: TestInfo, name: string) {
  if (!page.url().includes(info.project.name === 'docs' ? path : '/Badge')) await page.goto(info.project.name === 'docs' ? path : 'Badge')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="badge/${name}"]` : `[data-badge-demo="${name}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  return area
}
const rect = async (locator: Locator) => (await locator.evaluate(el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, top: r.top } }))
const pills = (area: Locator) => area.locator('[data-show]')

// 数字锚定在被包裹元素右上角：徽标中心落在角点；20px 高、白字、1px 表面描边；自定义节点无底色。
test('[badge.browser.anchor] pill sits on the top-right corner', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const host = area.locator('span:has(> [data-show])').first()
  const avatar = await rect(host.locator('> span').first()), pill = await rect(pills(area).first())
  expect(Math.abs(pill.x + pill.width / 2 - avatar.right)).toBeLessThanOrEqual(1)
  expect(Math.abs(pill.top + pill.height / 2 - avatar.top)).toBeLessThanOrEqual(1)
  const count = pills(area).first()
  await expect(count).toHaveCSS('height', '20px'); await expect(count).toHaveCSS('min-width', '20px')
  expect(await paintedColor(count, 'color')).toBe('rgb(255, 255, 255)'); await expect(count).toHaveCSS('font-size', '12px')
  expect(await count.evaluate(el => getComputedStyle(el).boxShadow)).toContain('0px 0px 0px 1px')
  await expect(pills(area).nth(1)).toHaveText('0')
  const custom = pills(area).nth(2)
  expect(await paintedColor(custom, 'background-color')).toBe('rgba(0, 0, 0, 0)')
  expect(await custom.locator('span').evaluate(el => getComputedStyle(el).maskImage)).not.toBe('none')
})

// 封顶文本与多字符加宽；small 14px；title 默认取 count，可自定义或移除。
test('[badge.browser.overflow] overflow text, size and title', async ({ page }, info) => {
  const area = await demo(page, info, 'overflow')
  await expect(pills(area)).toHaveText(['99', '99+', '10+', '999+'])
  await expect(pills(area).nth(1)).toHaveCSS('padding-left', '8px')
  expect((await rect(pills(area).nth(3))).width).toBeGreaterThan(30)
  await expect(pills(area).nth(1)).toHaveAttribute('title', '100')
  const size = await demo(page, info, 'size')
  await expect(pills(size).nth(0)).toHaveCSS('height', '20px')
  await expect(pills(size).nth(1)).toHaveCSS('height', '14px'); await expect(pills(size).nth(1)).toHaveCSS('width', '14px')
  await expect(pills(size).nth(1)).toHaveCSS('font-size', '12px')
  const title = await demo(page, info, 'title')
  await expect(pills(title)).toHaveText(['5', '-5', '5'])
  await expect(pills(title).nth(0)).toHaveAttribute('title', '自定义悬停文字')
  expect(await pills(title).nth(2).getAttribute('title')).toBeNull()
})

// 偏移：[10, 10] 相对默认位置向右、向下各移动 10px。
test('[badge.browser.offset] offset moves the pill', async ({ page }, info) => {
  const area = await demo(page, info, 'offset')
  const hosts = area.locator('span:has(> [data-show])')
  const base = await rect(pills(hosts.nth(0))), moved = await rect(pills(hosts.nth(1)))
  const baseAvatar = await rect(hosts.nth(0).locator('> span').first()), movedAvatar = await rect(hosts.nth(1).locator('> span').first())
  expect(Math.round((moved.x - movedAvatar.x) - (base.x - baseAvatar.x))).toBe(10)
  expect(Math.round((moved.y - movedAvatar.y) - (base.y - baseAvatar.y))).toBe(10)
})

// 动态：增减与归零后缩放淡出（节点保留、aria-hidden）；重新出现；红点开关同样淡出。
test('[badge.browser.change] zoom in/out on dynamic changes', async ({ page }, info) => {
  const area = await demo(page, info, 'change')
  const pill = pills(area).first()
  await area.getByRole('button', { name: '增加' }).click(); await expect(pill).toHaveText('6')
  for (let i = 0; i < 6; i++) await area.getByRole('button', { name: '减少' }).click()
  await expect(pill).toHaveAttribute('aria-hidden', 'true')
  await expect.poll(() => pill.evaluate(el => Number(getComputedStyle(el).opacity))).toBe(0)
  await expect(pill).toHaveText('1')
  await area.getByRole('button', { name: '增加' }).click()
  await expect.poll(() => pill.evaluate(el => Number(getComputedStyle(el).opacity))).toBe(1)
  await expect(pill).toHaveText('1')
  const dot = pills(area).nth(1)
  await expect(dot).toHaveCSS('width', '6px')
  await area.getByRole('switch').click()
  await expect.poll(() => dot.evaluate(el => Number(getComputedStyle(el).opacity))).toBe(0)
})

// 独立使用：行内与开关垂直居中；关闭后仅 showZero 的 0 保留且颜色正确，其余移除不占位。
test('[badge.browser.no-wrapper] standalone badges flow inline', async ({ page }, info) => {
  const area = await demo(page, info, 'no-wrapper')
  await expect(pills(area)).toHaveText(['11', '25', '', '99+'])
  const toggle = await rect(area.getByRole('switch')), first = await rect(pills(area).first())
  expect(Math.abs((first.top + first.height / 2) - (toggle.top + toggle.height / 2))).toBeLessThanOrEqual(2)
  expect(await paintedColor(pills(area).nth(0), 'background-color')).toBe('rgb(250, 173, 20)')
  expect(await paintedColor(pills(area).nth(3), 'background-color')).toBe('rgb(82, 196, 26)')
  await area.getByRole('switch').click()
  await expect(pills(area)).toHaveText(['0'])
})

// 状态点：6px 圆点、processing 脉冲动画、文字 14px 且间距 8px；预设与自定义颜色真实绘制。
test('[badge.browser.status] status dots and colors', async ({ page }, info) => {
  const area = await demo(page, info, 'status')
  const processing = area.getByText('进行中', { exact: true }).locator('xpath=..')
  const dot = processing.locator('> span').first()
  await expect(dot).toHaveCSS('width', '6px')
  expect(await dot.evaluate(el => getComputedStyle(el, '::after').animationName)).toBe('ut-badge-processing')
  const text = area.getByText('进行中', { exact: true })
  await expect(text).toHaveCSS('font-size', '14px'); await expect(text).toHaveCSS('margin-left', '8px')
  const colorful = await demo(page, info, 'colorful')
  const pink = colorful.getByText('pink', { exact: true }).locator('xpath=..').locator('> span').first()
  expect(await paintedColor(pink, 'background-color')).toBe('rgb(235, 47, 150)')
  const hwb = colorful.getByText('hwb(205 6% 9%)', { exact: true }).locator('xpath=..').locator('> span').first()
  expect(await paintedColor(hwb, 'background-color')).toMatch(/^rgb\(/)
})

// 缎带：外伸 8px、22px 高、白字；折角颜色与缎带底色一致（预设与自定义色）；start 方位向左外伸。
test('[badge.browser.ribbon] ribbon geometry and fold color', async ({ page }, info) => {
  const area = await demo(page, info, 'ribbon')
  const wrappers = area.locator('> div > div')
  for (const [index, side] of [[0, 'end'], [2, 'end'], [3, 'start'], [4, 'end']] as const) {
    const wrapper = wrappers.nth(index), ribbon = wrapper.locator('> div').last(), card = wrapper.locator('> div').first()
    const r = await rect(ribbon), c = await rect(card)
    if (side === 'end') expect(Math.round(r.right - c.right)).toBe(8)
    else expect(Math.round(c.x - r.x)).toBe(8)
    await expect(ribbon).toHaveCSS('height', '22px')
    expect(await paintedColor(ribbon.locator('span'), 'color')).toBe('rgb(255, 255, 255)')
    expect(await paintedColor(ribbon, 'border-top-color', '::after')).toBe(await paintedColor(ribbon, 'background-color'))
  }
  await area.screenshot({ path: info.outputPath('ribbon.png') })
  for (const name of ['basic', 'no-wrapper', 'status', 'overflow']) await (await demo(page, info, name)).screenshot({ path: info.outputPath(`${name}.png`) })
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1)
})

// 开发模式：数字锚定与红点绘制。
test('[badge.browser.dev] dev rendering', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658/${path}`)
  const area = page.locator('[data-demo="badge/dot"]')
  await expect(area.locator('[data-show]').first()).toHaveCSS('width', '6px')
  expect(await area.locator('.i-mdi-bell-outline').evaluate(el => getComputedStyle(el).maskImage)).not.toBe('none')
})

// Badge 与 BadgeRibbon API、示例容器在原始 HTML 中。
test('[badge.browser.ssr] API sections are server-rendered', async ({ request }) => {
  const response = await request.get(path); expect(response.status()).toBe(200)
  const html = await response.text()
  for (const text of ['Badge API', 'BadgeRibbon API', 'overflowCount', 'data-demo="badge/ribbon"']) expect(html).toContain(text)
})
