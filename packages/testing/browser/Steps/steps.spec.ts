import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'
import { paintedColor } from '../../utils/color-browser'

const path = 'components/navigation/steps/'
async function demo(page: Page, info: TestInfo, id: string) {
  if (!page.url().includes(info.project.name === 'docs' ? path : '/Steps')) await page.goto(info.project.name === 'docs' ? path : 'Steps')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="steps/${id}"]` : `[data-steps-demo="${id}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  await expect(area.locator('[data-step-status]').first()).toBeVisible()
  return area
}
type Box = { x: number; y: number; width: number; height: number; right: number; bottom: number; cx: number; cy: number }
/** DOMRect 的字段是原型上的 getter，跨进程序列化会丢失，必须先拷成普通对象。 */
const box = (locator: Locator): Promise<Box> => locator.evaluate(el => {
  const r = el.getBoundingClientRect()
  return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom, cx: r.x + r.width / 2, cy: r.y + r.height / 2 }
})
const near = (actual: number, expected: number, tolerance = 1) => expect(Math.abs(actual - expected), `${actual} ≈ ${expected}`).toBeLessThanOrEqual(tolerance)
const steps = (scope: Locator) => scope.locator('[data-step-status]')
const icon = (step: Locator) => step.locator('[data-step-icon]').first()
/** 把 preset 颜色 token 绘制成 rgb 字符串（与 paintedColor 同一归一方式）。 */
const tokenColor = (page: Page, token: string) => page.evaluate(name => {
  const probe = document.createElement('i'); probe.style.color = `rgb(var(--upthrust-colors-${name}))`
  document.body.append(probe)
  const value = getComputedStyle(probe).color; probe.remove()
  const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!
  context.fillStyle = value; context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return `rgb(${r}, ${g}, ${b})`
}, token)
const shot = (area: Locator, info: TestInfo, name: string) => area.screenshot({ path: info.outputPath(`${name}.png`) })

// 图标：默认 32px 圆、small 24px；process 为主色实心，finish / error 为 10% 浅色底（半透明），标题 16px / 32px 行高。
test('[steps.browser.icon] icon size, fill colours and title metrics', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const [finish, process, wait] = [0, 1, 2].map(i => steps(area).nth(i))
  for (const step of [finish, process, wait]) {
    const b = await box(icon(step))
    near(b.width, 32); near(b.height, 32)
  }
  await expect(icon(process)).toHaveCSS('border-radius', /px|%/)
  expect(await paintedColor(icon(process), 'background-color')).toBe(await tokenColor(page, 'primary'))
  // finish 为 10% 主色浅底，绘制后必然带透明度。
  expect(await paintedColor(icon(finish), 'background-color')).toMatch(/^rgba\(.+, 0\.1\)$/)
  expect(await paintedColor(icon(finish), 'color')).toBe(await tokenColor(page, 'primary'))
  const title = process.locator('[data-step-title]')
  await expect(title).toHaveCSS('font-size', '16px')
  await expect(title).toHaveCSS('line-height', '32px')
  // 标题与图标垂直居中对齐。
  near((await box(title)).cy, (await box(icon(process))).cy)

  const small = await demo(page, info, 'small')
  const b = await box(icon(steps(small).first()))
  near(b.width, 24); near(b.height, 24)
  await expect(steps(small).first().locator('[data-step-title]')).toHaveCSS('font-size', '14px')
  await shot(area, info, 'basic')
})

// 连接线：水平穿过图标中心，起点距标题右缘 16px，终点紧贴下一项起点前 16px；finish 之后为主色；最后一项无连接线且不拉伸。
test('[steps.browser.rail] rail passes through the icon centre', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const first = steps(area).nth(0)
  const second = steps(area).nth(1)
  const rail = first.locator('[data-step-rail]')
  await expect(rail).toBeAttached()
  const title = first.locator('[data-step-title]')
  const [railBox, iconBox, titleBox, nextBox] = await Promise.all([box(rail), box(icon(first)), box(title), box(second)])
  near(railBox.cy, iconBox.cy, 1.5)
  // 标题自带 16px 右内边距，rail 从其右缘开始（start-full），即文字右侧 16px。
  await expect(title).toHaveCSS('padding-right', '16px')
  near(railBox.x, titleBox.right)
  expect(titleBox.x).toBeGreaterThan(iconBox.right)
  // 可见段被内容区裁剪到本项末端，下一项再留 16px。
  const visibleEnd = await first.evaluate(el => {
    const body = el.querySelector('[data-step-title]')!.parentElement!
    return body.getBoundingClientRect().right
  })
  near(visibleEnd + 16, (await box(icon(second))).x, 1.5)
  expect(nextBox.x).toBeGreaterThan(iconBox.right)
  expect(await paintedColor(rail, 'border-top-color')).toBe(await tokenColor(page, 'primary'))
  await expect(steps(area).last().locator('[data-step-rail]')).toHaveCount(0)
  await expect(steps(area).last()).toHaveCSS('flex-grow', '0')
})

// 标题在下：图标在上居中、标题居中于图标下方 12px；连接线从本项中心 + 16 + 12 延伸到下一项中心 − 16 − 12。
test('[steps.browser.titlePlacement] vertical labels are centred under the icon', async ({ page }, info) => {
  const area = await demo(page, info, 'title-placement')
  const scope = area.locator('[data-case="default"]')
  const first = steps(scope).nth(0)
  const second = steps(scope).nth(1)
  const [iconBox, titleBox, nextIcon, railBox] = await Promise.all([
    box(icon(first)), box(first.locator('[data-step-title]')), box(icon(second)), box(first.locator('[data-step-rail]')),
  ])
  near(titleBox.cx, iconBox.cx, 1.5)
  near(titleBox.y - iconBox.bottom, 12, 1.5)
  near(railBox.cy, iconBox.cy, 1.5)
  near(railBox.x, iconBox.right + 12, 1.5)
  near(railBox.right, nextIcon.x - 12, 1.5)
  await shot(area, info, 'title-placement')
})

// 点状：点 8px、当前点 10px，点在上、标题居中于点下方；竖直点状的点在左侧。
test('[steps.browser.dot] dot sizes and placement', async ({ page }, info) => {
  const area = await demo(page, info, 'progress-dot')
  const scope = area.locator('[data-case="horizontal"]')
  const dots = scope.locator('[data-step-dot]')
  near((await box(dots.nth(0))).width, 8)
  near((await box(dots.nth(1))).width, 10)
  near((await box(dots.nth(1))).height, 10)
  const first = steps(scope).first()
  const [dotBox, titleBox] = await Promise.all([box(dots.nth(0)), box(first.locator('[data-step-title]'))])
  expect(titleBox.y).toBeGreaterThan(dotBox.bottom)
  near(titleBox.cx, dotBox.cx, 1.5)
  const vertical = area.locator('[data-case="vertical"]')
  const vFirst = steps(vertical).first()
  const [vDot, vTitle] = await Promise.all([box(vFirst.locator('[data-step-dot]')), box(vFirst.locator('[data-step-title]'))])
  expect(vDot.right).toBeLessThan(vTitle.x)
  await shot(area, info, 'progress-dot')
})

// percent：当前图标外叠加 40px（small 32px）的圆环，与图标同心；按钮调整后 aria-valuenow 跟随。
test('[steps.browser.percent] progress ring around the current icon', async ({ page }, info) => {
  const area = await demo(page, info, 'progress')
  const current = area.locator('[data-case="default"] [aria-current="step"]')
  const ring = current.locator('[data-step-progress] [data-progress-part="body"]')
  const [ringBox, iconBox] = await Promise.all([box(ring), box(icon(current))])
  near(ringBox.width, 40); near(ringBox.height, 40)
  near(ringBox.cx, iconBox.cx); near(ringBox.cy, iconBox.cy)
  near((await box(area.locator('[data-case="small"] [aria-current="step"] [data-step-progress] [data-progress-part="body"]'))).width, 32)
  await area.getByRole('button', { name: '+10' }).click()
  await expect(current.locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '70')
  await shot(area, info, 'progress')
})

// 键盘：Tab 聚焦可点击的步骤项，Enter / 空格切换；禁用项与不可点击的步骤不进入 Tab 序列。
test('[steps.browser.keyboard] tab and enter switch steps', async ({ page }, info) => {
  const area = await demo(page, info, 'clickable')
  const scope = area.locator('[data-case="horizontal"]')
  const output = area.locator('output')
  await steps(scope).nth(1).click()
  await expect(output).toHaveAttribute('data-current', '1')
  await steps(scope).nth(0).focus()
  await page.keyboard.press('Tab')
  await expect(steps(scope).nth(1)).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(steps(scope).nth(2)).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(output).toHaveAttribute('data-current', '2')
  await expect(steps(scope).nth(2)).toHaveAttribute('aria-current', 'step')
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press(' ')
  await expect(output).toHaveAttribute('data-current', '1')
  // 禁用项不可聚焦：从第 3 项 Tab 出去，焦点不落在第 4 项上。
  await steps(scope).nth(2).focus()
  await page.keyboard.press('Tab')
  await expect(steps(scope).nth(3)).not.toBeFocused()
  await steps(scope).nth(3).click()
  await expect(output).toHaveAttribute('data-current', '1')
})

// 窄屏：页面不横向溢出，Steps 不撑破示例区域。
test('[steps.browser.mobile] no horizontal overflow on phones', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs', 'example 应用在手机宽度下隐藏内容区，只在文档站验证')
  await page.setViewportSize({ width: 390, height: 844 })
  const area = await demo(page, info, 'basic')
  const [areaBox, rootBox] = await Promise.all([box(area), box(area.locator('[data-steps-orientation]').first())])
  expect(rootBox.right).toBeLessThanOrEqual(areaBox.right + 0.5)
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0)
  await shot(area, info, 'mobile')
})

// 原始静态 HTML 含 API、契约说明与示例源码（示例本身在客户端渲染，静态 HTML 只断言文字）。
test('[steps.browser.ssr] API contracts and source', async ({ request }) => {
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  for (const text of ['titlePlacement', 'progressDot', 'initial', 'aria-current', 'navigateTo', 'steps/headless-wizard', 'clickNavigable']) expect(html).toContain(text)
})
