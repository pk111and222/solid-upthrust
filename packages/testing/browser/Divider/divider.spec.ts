import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'

const path = 'components/layout/divider/'
async function demo(page: Page, info: TestInfo, id: string) {
  await page.goto(info.project.name === 'docs' ? path : 'Divider')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="divider/${id}"]` : `[data-divider-demo="${id}"]`)
  await expect(area.locator('[role="separator"]').first()).toBeAttached()
  return area
}
type Rect = { x: number; y: number; w: number; h: number; right: number; bottom: number }
/** 带标题分割线的根、两段 rail 与标题的几何与样式。 */
const titled = (divider: Locator) => divider.evaluate(el => {
  const rect = (node: Element): Rect => { const r = node.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom } }
  const [start, content, end] = [...el.children]
  const style = (node: Element) => { const s = getComputedStyle(node); return { color: s.borderTopColor, width: s.borderTopWidth, style: s.borderTopStyle } }
  return {
    root: { ...rect(el), borderColor: getComputedStyle(el).borderTopColor },
    start: { ...rect(start), ...style(start) }, end: { ...rect(end), ...style(end) },
    content: { ...rect(content), color: getComputedStyle(content).color },
  }
})
const near = (actual: number, expected: number, tolerance = 0.6) => expect(Math.abs(actual - expected), `${actual} ≈ ${expected}`).toBeLessThan(tolerance)
/** 读取元素的若干计算样式。 */
const css = (target: Locator, ...names: string[]) => target.evaluate((el, keys) => {
  const style = getComputedStyle(el)
  return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]))
}, names)

// 无标题水平线：只画 1px 顶边、宽度撑满、上下 24px；三种线型分别为 solid / dashed / dotted。
test('[divider.browser.horizontal] 1px top border with 24px margins', async ({ page }, info) => {
  const area = await demo(page, info, 'horizontal')
  const dividers = area.locator('[role="separator"]')
  await expect(dividers).toHaveCount(3)
  const width = await area.locator('[data-divider-horizontal]').evaluate(el => el.getBoundingClientRect().width)
  for (const [index, style] of ['solid', 'dashed', 'dotted'].entries()) {
    const divider = dividers.nth(index)
    expect(await css(divider, 'border-top-width', 'border-top-style', 'border-bottom-width', 'border-left-width', 'margin-top', 'margin-bottom'))
      .toEqual({ 'border-top-width': '1px', 'border-top-style': style, 'border-bottom-width': '0px', 'border-left-width': '0px', 'margin-top': '24px', 'margin-bottom': '24px' })
    // DOMRect 的字段是原型上的 getter，跨进程序列化会丢失，必须先拷成普通对象。
    const { paragraph, line } = await divider.evaluate(el => {
      const r = el.getBoundingClientRect()
      return { paragraph: el.previousElementSibling!.getBoundingClientRect().bottom, line: { y: r.y, height: r.height, width: r.width } }
    })
    near(line.y - paragraph, 24)
    near(line.height, 1)
    near(line.width, width)
  }
  // 线色不是纯黑也不透明：来自 outline-variant 40%。
  const color = (await css(dividers.first(), 'border-top-color'))['border-top-color']
  expect(color).not.toMatch(/^rgba?\(0, 0, 0(, 1)?\)$/)
  expect(color).not.toBe('rgba(0, 0, 0, 0)')
  await area.screenshot({ path: info.outputPath('horizontal.png') })
})

// 带标题：center 两侧 rail 等长；start/end 时靠近一侧为 5% 短线；rail 继承根节点线色；带标题时上下 16px。
test('[divider.browser.titled] rails split around the title', async ({ page }, info) => {
  const area = await demo(page, info, 'with-text')
  let d = await titled(area.locator('[data-placement="center"]'))
  near(d.start.w, d.end.w, 1)
  near(d.content.x + d.content.w / 2, d.root.x + d.root.w / 2, 1)
  expect(d.start.color).toBe(d.root.borderColor)
  expect(d.start.width).toBe('1px')
  // rail 在标题的垂直中线上。
  near(d.start.y, d.content.y + d.content.h / 2, 1)
  await expect(area.locator('[data-placement="center"]')).toHaveCSS('margin-top', '16px')
  await expect(area.locator('[data-placement="center"]')).toHaveCSS('border-top-width', '0px')
  d = await titled(area.locator('[data-placement="start"]'))
  near(d.start.w, d.root.w * 0.05, 1)
  near(d.end.right, d.root.right)
  d = await titled(area.locator('[data-placement="end"]'))
  near(d.end.w, d.root.w * 0.05, 1)
  near(d.start.x, d.root.x)
  const dashed = await titled(area.locator('[role="separator"]').last())
  expect([dashed.start.style, dashed.end.style]).toEqual(['dashed', 'dashed'])
  await area.screenshot({ path: info.outputPath('with-text.png') })
})

// orientationMargin：0 时标题贴边；48 时标题距左 48px；20% 时标题距右为根宽度的 20%，该侧 rail 收为 0。
test('[divider.browser.orientationMargin] title offset from the edge', async ({ page }, info) => {
  const area = await demo(page, info, 'orientation-margin')
  let d = await titled(area.locator('[data-margin="0"]'))
  near(d.start.w, 0); near(d.content.x, d.root.x)
  d = await titled(area.locator('[data-margin="48"]'))
  near(d.start.w, 0); near(d.content.x - d.root.x, 48)
  d = await titled(area.locator('[data-margin="20%"]'))
  near(d.end.w, 0); near(d.root.right - d.content.right, d.root.w * 0.2, 1)
  await area.screenshot({ path: info.outputPath('orientation-margin.png') })
})

// size：small / middle / large 分别对应上下 8 / 16 / 24px。
test('[divider.browser.size] spacing presets', async ({ page }, info) => {
  const area = await demo(page, info, 'size')
  for (const [size, px] of [['small', '8px'], ['middle', '16px'], ['large', '24px']] as const) {
    expect(await css(area.locator(`[data-size="${size}"]`), 'margin-top', 'margin-bottom'), size).toEqual({ 'margin-top': px, 'margin-bottom': px })
  }
})

// plain：标题回到正文字号与常规字重；默认标题字号更大、字重 500。
test('[divider.browser.plain] plain title uses body text', async ({ page }, info) => {
  const area = await demo(page, info, 'plain')
  const plain = await css(area.locator('[role="separator"] > span:nth-child(2)').first(), 'font-size', 'font-weight')
  expect(plain['font-weight']).toBe('400')
  await page.goto(info.project.name === 'docs' ? path : 'Divider')
  const heading = await css(page.locator('[data-placement="center"] > span:nth-child(2)'), 'font-size', 'font-weight')
  expect(heading['font-weight']).toBe('500')
  expect(parseFloat(heading['font-size'])).toBeGreaterThan(parseFloat(plain['font-size']))
})

// 垂直分割线：行内 0.9em 高、1px 左边框、左右 8px、无上下外边距，三种线型。
test('[divider.browser.vertical] inline vertical rule', async ({ page }, info) => {
  const area = await demo(page, info, 'vertical')
  const dividers = area.locator('[role="separator"]')
  await expect(dividers).toHaveCount(3)
  for (const [index, style] of ['solid', 'dashed', 'dotted'].entries()) {
    const divider = dividers.nth(index)
    await expect(divider).toHaveAttribute('aria-orientation', 'vertical')
    expect(await css(divider, 'display', 'border-left-width', 'border-left-style', 'border-top-width', 'margin-left', 'margin-right', 'margin-top')).toEqual({
      display: 'inline-block', 'border-left-width': '1px', 'border-left-style': style, 'border-top-width': '0px',
      'margin-left': '8px', 'margin-right': '8px', 'margin-top': '0px',
    })
    const size = await css(divider, 'height', 'font-size')
    near(parseFloat(size.height), parseFloat(size['font-size']) * 0.9, 0.1)
  }
  // 与前后文字在同一行。
  const { text, line } = await dividers.first().evaluate(el => {
    const plain = (r: DOMRect) => ({ y: r.y, bottom: r.bottom })
    return { text: plain(el.parentElement!.getBoundingClientRect()), line: plain(el.getBoundingClientRect()) }
  })
  expect(line.y).toBeGreaterThanOrEqual(text.y)
  expect(line.bottom).toBeLessThanOrEqual(text.bottom)
  await area.screenshot({ path: info.outputPath('vertical.png') })
})

// 语义化：根节点 border-primary 让带标题的 rail 同步变色；classNames.rail 的颜色覆盖继承、styles.rail 改线宽；class="my-0" 去掉间距。
test('[divider.browser.semantic] root color inheritance and rail overrides', async ({ page }, info) => {
  const area = await demo(page, info, 'semantic')
  const rootColor = await titled(area.locator('[data-semantic="root-color"]'))
  expect(rootColor.start.color).toBe(rootColor.root.borderColor)
  expect(rootColor.end.color).toBe(rootColor.root.borderColor)
  // 与同组里未改色的默认分割线（no-margin）相比，主色确实生效。
  const fallback = (await css(area.locator('[data-semantic="no-margin"]'), 'border-top-color'))['border-top-color']
  expect(rootColor.root.borderColor).not.toBe(fallback)
  // 无标题线：同样的 border-primary 画在根节点自身，且 style 可改线宽。
  const width = await css(area.locator('[data-semantic="root-width"]'), 'border-top-color', 'border-top-width')
  expect(width).toEqual({ 'border-top-color': rootColor.root.borderColor, 'border-top-width': '2px' })
  // 主色与标题 text-primary 的颜色一致（同一 token）。
  const rail = await titled(area.locator('[data-semantic="rail"]'))
  expect(rail.content.color).toBe(rootColor.root.borderColor)
  expect(rail.start.width).toBe('2px')
  expect(rail.end.width).toBe('2px')
  // classNames.rail 的 60% 透明度主色覆盖了继承色。
  expect(rail.start.color).not.toBe(rail.root.borderColor)
  expect(rail.start.color).not.toBe(rootColor.root.borderColor)
  expect(rail.start.color).toMatch(/rgba?\(|color\(|oklch|oklab/)
  const letterSpacing = await css(area.locator('[data-semantic="rail"] > span:nth-child(2)'), 'letter-spacing', 'font-size')
  near(parseFloat(letterSpacing['letter-spacing']), parseFloat(letterSpacing['font-size']) * 0.1, 0.1)
  expect(await css(area.locator('[data-semantic="no-margin"]'), 'margin-top', 'margin-bottom')).toEqual({ 'margin-top': '0px', 'margin-bottom': '0px' })
  await area.screenshot({ path: info.outputPath('semantic.png') })
})

// 开发模式（未经构建）：rail 的 border-[inherit] 与 5% 短线同样生效。
test('[divider.browser.dev] development styles resolve', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE ?? '/'}${path}`)
  const d = await titled(page.locator('[data-demo="divider/semantic"] [data-semantic="root-color"]'))
  expect(d.start.color).toBe(d.root.borderColor)
  const start = await titled(page.locator('[data-demo="divider/with-text"] [data-placement="start"]'))
  near(start.start.w, start.root.w * 0.05, 1)
})

// 原始静态 HTML 含 API、注意事项与示例源码（文档站示例本身在客户端渲染，静态 HTML 只断言文字与源码）。
test('[divider.browser.ssr] API contracts and source', async ({ request }) => {
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  for (const text of ['orientationMargin', 'titlePlacement', '旧 API 兼容', '继承根节点的 border-color', 'divider/semantic', 'data-semantic', 'root-color', 'orientation']) expect(html).toContain(text)
})
